import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import DnaAnalysis from './components/DnaAnalysis';
import Auth from './components/Auth';
import Profile from './components/Profile';
import AboutPage from './components/AboutPage';
import IconTest from './components/IconTest';
import { GeneScopeLogo } from './components/WorkflowIcons';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DNABackground = () => {
  return (
    <div className="dna-bg">
      <div className="dna-helix">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="dna-pair" />
        ))}
      </div>
    </div>
  );
};

const WorkflowArrow = () => (
  <div className="workflow-arrow">
    <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 12h52m0 0l-8-8m8 8l-8 8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
  const token = localStorage.getItem('token');
      if (!token) {
        setIsValidating(false);
        setIsValid(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsValid(true);
        } else {
          // Token is invalid or expired
          localStorage.removeItem('token');
          setIsValid(false);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [navigate]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating session...</p>
        </div>
      </div>
    );
  }

  if (!isValid) {
    navigate('/login', { replace: true });
    return null;
  }

  return <>{children}</>;
};

const HomePage = () => {
  const navigate = useNavigate();
  const workflowSteps = [
    {
      icon: '/workflow-icons/upload.svg',
      title: 'Upload DNA',
      description: 'Upload your DNA sequence file or paste your sequence data directly into our secure platform.'
    },
    {
      icon: '/workflow-icons/match.svg',
      title: 'Match',
      description: 'Our advanced algorithms compare your DNA sequence with our comprehensive database.'
    },
    {
      icon: '/workflow-icons/analyze.svg',
      title: 'Analyze',
      description: 'Deep analysis of genetic markers, mutations, and potential health implications.'
    },
    {
      icon: '/workflow-icons/predict.svg',
      title: 'Predict',
      description: 'Get insights about traits, health predispositions, and ancestry information.'
    },
    {
      icon: '/workflow-icons/save.svg',
      title: 'Save Report',
      description: 'Download comprehensive reports and share with healthcare professionals.'
    }
  ];

  // Sample DNA and trait for demo (Sickle Cell Trait, HBB gene, with mutation)
  const sampleSequence = "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACATGGATGAAGTTGGTGGTGAGGCCCTGGGCAG";
  const sampleTrait = {
    trait: "Sickle Cell Trait",
    gene: "HBB",
    reference_sequence: "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAG",
    position: 20,
    position_start: 18,
    position_end: 22,
    reference: "A",
    variant: "T"
  };

  const handleLoadSample = () => {
    navigate('/analysis', { state: { sampleSequence, sampleTrait } });
  };

  return (
    <>
      <section className="hero">
        <h1>Unlock the Secrets of Your DNA</h1>
        <p className="hero-subtitle">
          Upload or paste your DNA sequence to detect matches, analyze mutations, and predict traits.
        </p>
        <div className="hero-buttons">
          <Link to="/analysis" className="btn primary">Try Now</Link>
        </div>
      </section>

      <section className="workflow">
        <h2>How It Works</h2>
        <div className="workflow-container">
          <div className="workflow-steps">
            {workflowSteps.map((step, index) => (
              <div key={index} className="workflow-step-container">
                <div className="workflow-step">
                  <img 
                    src={step.icon} 
                    alt={step.title} 
                    className="step-icon" 
                    onError={(e) => {
                      console.error(`Failed to load icon: ${step.icon}`);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
                {index < workflowSteps.length - 1 && <WorkflowArrow />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="demo">
        <h2>Don't have your DNA?</h2>
        <p>Try a demo!</p>
        <button className="btn secondary" onClick={handleLoadSample}>Load Sample Dataset</button>
      </section>

      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <p>"Used by students, researchers, and bio-enthusiasts"</p>
            <span className="author">- Research Community</span>
          </div>
          <div className="testimonial-card">
            <p>"Helped identify rare mutations for my research project"</p>
            <span className="author">- Dr. Sarah Johnson</span>
          </div>
        </div>
      </section>

      <section className="demo">
        <h2>Debug Info</h2>
        <IconTest />
      </section>
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };



  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserProfile();
    }
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <Router>
      <DNABackground />
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">
            <GeneScopeLogo className="nav-logo" />
            <span className="brand-name">GeneScope</span>
          </div>
          {/* Desktop Nav Links */}
          <div className="nav-links hidden md:flex">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/analysis" className="nav-link">Analyze DNA</Link>
            <Link to="/about" className="nav-link">About</Link>
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="nav-link profile-link flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {userProfile?.profile_picture ? (
                      <img 
                        src={userProfile.profile_picture} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      userProfile?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span>{userProfile?.username || 'Profile'}</span>
                </Link>
              </div>
            ) : (
              <Link to="/login" className="nav-link login-link">Login</Link>
            )}
          </div>
          {/* Hamburger for Mobile */}
          <button className="md:hidden flex items-center px-3 py-2 border rounded text-blue-700 border-blue-400 hover:bg-blue-50 focus:outline-none" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Open menu">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div ref={mobileMenuRef} className="absolute top-20 right-4 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 flex flex-col p-4 space-y-2 md:hidden animate-fade-in">
              <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/analysis" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Analyze DNA</Link>
              <Link to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
              {isLoggedIn ? (
                <>
                <Link to="/profile" className="nav-link flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {userProfile?.profile_picture ? (
                      <img 
                        src={userProfile.profile_picture} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      userProfile?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span>{userProfile?.username || 'Profile'}</span>
                </Link>
                </>
              ) : (
                <Link to="/login" className="nav-link login-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              )}
            </div>
          )}
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Auth setIsLoggedIn={setIsLoggedIn} onLoginSuccess={fetchUserProfile} />} />
            <Route path="/analysis" element={
              <PrivateRoute>
                <DnaAnalysis />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile setUserProfile={setUserProfile} setIsLoggedIn={setIsLoggedIn} />
              </PrivateRoute>
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="footer-links">
              <Link to="/about">About</Link>
              <a href="https://github.com/ChauhanAnshu9667/dna-analysis-app.git">Github repo</a>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
            <p className="footer-credit">
              Built with ❤️ using MERN & BioPython
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
