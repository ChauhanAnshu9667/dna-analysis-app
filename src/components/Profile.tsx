import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';

import { toZonedTime, format as formatTz } from 'date-fns-tz';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile_picture?: string;
  bio?: string;
  created_at: string;
  last_login?: string;
}

interface AnalysisHistoryItem {
  _id: string;
  analysis_date: string;
  trait_analyzed: string;
  gene: string;
  sequence_length: number;
  mutations_found: number;
  match_percentage: number;
  analysis_summary: {
    gc_content: number;
    mutations: any[];
    alignment: any;
  };
}

interface ProfileProps {
  setUserProfile: (profile: any) => void;
  setIsLoggedIn: (value: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ setUserProfile, setIsLoggedIn }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
    profile_picture: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfile(null);
      setAnalysisHistory([]);
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchAnalysisHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setEditForm({
        username: data.username || '',
        bio: data.bio || '',
        profile_picture: data.profile_picture || ''
      });
    } catch (err) {
      setError('Error fetching profile: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const fetchAnalysisHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/analysis-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analysis history');
      }

      const data = await response.json();
      setAnalysisHistory(data.analysis_history || []);
    } catch (err) {
      console.error('Error fetching analysis history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setProfile(null);
    setAnalysisHistory([]);
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const profileRes = await fetch(`${API_BASE_URL}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
        setUserProfile(data);
        setEditForm({
          username: data.username || '',
          bio: data.bio || '',
          profile_picture: data.profile_picture || ''
        });
      }
      setIsEditing(false);
    } catch (err) {
      setError('Error updating profile: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deleteHistoryItem = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this analysis record?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_BASE_URL}/analysis-history/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    fetchAnalysisHistory();
  };

  const deleteAllHistory = async () => {
    if (!window.confirm('Are you sure you want to delete ALL analysis history? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`${API_BASE_URL}/analysis-history`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    fetchAnalysisHistory();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You are not logged in.</p>
          <button onClick={() => window.location.href = '/login'} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-2 sm:px-8 lg:px-16">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold text-white">Profile</h1>
              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg text-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Profile Card */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-10">
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold mx-auto mb-6">
                      {profile.profile_picture ? (
                        <img 
                          src={profile.profile_picture} 
                          alt="Profile" 
                          className="w-40 h-40 rounded-full object-cover"
                        />
                      ) : (
                        profile.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{profile.username}</h2>
                  <p className="text-lg text-gray-600">{profile.email}</p>
                </div>

                {isEditing ? (
                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-4">
                      <label className="block text-base font-medium text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <label className="block text-base font-medium text-gray-700 mb-2">Bio</label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <label className="block text-base font-medium text-gray-700 mb-2">Profile Picture URL</label>
                      <input
                        type="url"
                        value={editForm.profile_picture}
                        onChange={(e) => setEditForm({...editForm, profile_picture: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveProfile}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg text-lg hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                    {error && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {profile.bio && (
                      <div className="bg-white rounded-lg p-4">
                        <h3 className="text-base font-medium text-gray-700 mb-2">Bio</h3>
                        <p className="text-gray-600 text-base">{profile.bio}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-medium text-gray-700 mb-2">Member Since</h3>
                      <p className="text-gray-600 text-base">{formatDate(profile.created_at)}</p>
                    </div>
                    {profile.last_login && (
                      <div>
                        <h3 className="text-base font-medium text-gray-700 mb-2">Last Login</h3>
                        <p className="text-gray-600 text-base">{formatDate(profile.last_login)}</p>
                      </div>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 mt-2"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analysis History */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white">Analysis History</h2>
                  <p className="text-emerald-100 text-lg">Your DNA analysis records</p>
                </div>
                {analysisHistory.length > 0 && (
                  <button
                    onClick={deleteAllHistory}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-base flex items-center gap-2"
                    title="Delete All History"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Delete All
                  </button>
                )}
              </div>
              <div className="p-10">
                {analysisHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-medium text-gray-900 mb-3">No Analysis History</h3>
                    <p className="text-gray-600 text-lg mb-6">Start analyzing DNA sequences to see your history here.</p>
                    <button
                      onClick={() => navigate('/analysis')}
                      className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700"
                    >
                      Start Analysis
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {analysisHistory.map((analysis) => (
                      <div key={analysis._id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors relative flex flex-col justify-between min-h-[180px]">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-800">
                              {analysis.trait_analyzed} ({analysis.gene})
                            </h3>
                            <div className="text-sm text-gray-500">
                              {(() => {
                                const utcDate = new Date(analysis.analysis_date);
                                const istDate = toZonedTime(utcDate, 'Asia/Kolkata');
                                return formatTz(istDate, 'dd MMM yyyy, hh:mm a (IST)', { timeZone: 'Asia/Kolkata' });
                              })()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-blue-600">
                              {analysis.match_percentage.toFixed(1)}%
                            </div>
                            <div className="text-lg text-gray-500">Match</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-lg mb-8">
                          <div>
                            <span className="text-gray-500">Sequence Length:</span>
                            <div className="font-medium">{analysis.sequence_length.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Mutations Found:</span>
                            <div className="font-medium">{analysis.mutations_found}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">GC Content:</span>
                            <div className="font-medium">{analysis.analysis_summary.gc_content.toFixed(1)}%</div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteHistoryItem(analysis._id)}
                          className="absolute bottom-4 right-4 bg-red-500 text-white rounded-full p-3 hover:bg-red-700 shadow-lg z-10"
                          title="Delete this record"
                          style={{ fontSize: '1.25rem' }}
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 