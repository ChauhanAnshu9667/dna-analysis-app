import React, { useState } from 'react';

const PhotoTest = () => {
  const [photoStatus, setPhotoStatus] = useState<string>('Loading...');

  const testPhoto = () => {
    const img = new Image();
    img.onload = () => setPhotoStatus('✅ Photo loaded successfully');
    img.onerror = () => setPhotoStatus('❌ Photo failed to load');
    img.src = '/dev2.jpg';
  };

  React.useEffect(() => {
    testPhoto();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Photo Loading Test</h3>
      <div className="space-y-4">
        <div>
          <span className="font-medium">Status: </span>
          <span className={photoStatus.includes('✅') ? 'text-green-600' : 'text-red-600'}>
            {photoStatus}
          </span>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Photo Preview:</h4>
          <img 
            src="/dev2.jpg" 
            alt="Test Photo" 
            className="w-16 h-16 rounded-full border-2 border-gray-300"
            onError={(e) => {
              console.error('Photo test failed');
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <div>
          <h4 className="font-medium mb-2">Direct Link Test:</h4>
          <a 
            href="/dev2.jpg" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Open photo in new tab
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhotoTest; 