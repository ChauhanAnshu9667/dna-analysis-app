import React from 'react';

interface IconProps {
  className?: string;
}

export const UploadIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M40 60L60 40L80 60" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M60 40V80" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M35 85H85" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const MatchIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M35 60L50 45L85 80" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 80L85 45" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AnalyzeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M30 90V30H90V90H30Z" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 50H90" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 70H90" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 30V90" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M70 30V90" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PredictIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M60 30C60 30 70 40 70 60C70 80 60 90 60 90" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M50 40C50 40 60 50 60 70C60 90 50 100 50 100" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M70 40C70 40 80 50 80 70C80 90 70 100 70 100" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M35 40H85V80H35V40Z" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 40V35H75V40" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 60H70" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 70H70" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
); 