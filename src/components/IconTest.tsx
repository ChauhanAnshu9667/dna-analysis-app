import React, { useState } from 'react';

const IconTest = () => {
  const [iconStatus, setIconStatus] = useState<{[key: string]: string}>({});

  const testIcon = (iconName: string, iconPath: string) => {
    const img = new Image();
    img.onload = () => setIconStatus(prev => ({ ...prev, [iconName]: '✅ Loaded' }));
    img.onerror = () => setIconStatus(prev => ({ ...prev, [iconName]: '❌ Failed' }));
    img.src = iconPath;
  };

  React.useEffect(() => {
    const icons = [
      { name: 'Upload', path: '/workflow-icons/upload.svg' },
      { name: 'Match', path: '/workflow-icons/match.svg' },
      { name: 'Analyze', path: '/workflow-icons/analyze.svg' },
      { name: 'Predict', path: '/workflow-icons/predict.svg' },
      { name: 'Save', path: '/workflow-icons/save.svg' },
      { name: 'Photo', path: '/dev2.jpg' }
    ];

    icons.forEach(icon => testIcon(icon.name, icon.path));
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Icon Loading Test</h3>
      <div className="space-y-2">
        {Object.entries(iconStatus).map(([name, status]) => (
          <div key={name} className="flex items-center space-x-2">
            <span className="font-medium">{name}:</span>
            <span className={status.includes('✅') ? 'text-green-600' : 'text-red-600'}>
              {status}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Icon Previews:</h4>
        <div className="flex space-x-4">
          <img src="/workflow-icons/upload.svg" alt="Upload" className="w-8 h-8" />
          <img src="/workflow-icons/match.svg" alt="Match" className="w-8 h-8" />
          <img src="/workflow-icons/analyze.svg" alt="Analyze" className="w-8 h-8" />
          <img src="/workflow-icons/predict.svg" alt="Predict" className="w-8 h-8" />
          <img src="/workflow-icons/save.svg" alt="Save" className="w-8 h-8" />
          <img src="/dev2.jpg" alt="Photo" className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default IconTest; 