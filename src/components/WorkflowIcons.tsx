import React from 'react';

interface IconProps {
  className?: string;
}

export const GeneScopeLogo: React.FC<IconProps> = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M256 32C192 96 128 192 128 256C128 320 192 416 256 480" stroke="#646cff" strokeWidth="32" strokeLinecap="round"/>
    <path d="M256 32C320 96 384 192 384 256C384 320 320 416 256 480" stroke="#535bf2" strokeWidth="32" strokeLinecap="round"/>
    <circle cx="256" cy="128" r="16" fill="#646cff"/>
    <circle cx="256" cy="384" r="16" fill="#535bf2"/>
    <circle cx="192" cy="256" r="16" fill="#646cff"/>
    <circle cx="320" cy="256" r="16" fill="#535bf2"/>
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M40 60L60 40L80 60" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M60 40V80" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M35 85H85" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const MatchIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M30 45C30 45 45 30 60 45C75 60 90 45 90 45" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M30 60C30 60 45 45 60 60C75 75 90 60 90 60" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M30 75C30 75 45 60 60 75C75 90 90 75 90 75" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const AnalyzeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <circle cx="75" cy="45" r="20" stroke="#646cff" strokeWidth="4"/>
    <path d="M60 60L35 85" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="30" cy="90" r="10" stroke="#646cff" strokeWidth="4"/>
    <path d="M70 45L80 45" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M75 40L75 50" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const PredictIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M30 90L30 50" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M60 90L60 30" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M90 90L90 40" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
    <path d="M20 90L100 90" stroke="#646cff" strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M35 40H85V80H35V40Z" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 40V35H75V40" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 60H70" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 70H70" stroke="#646cff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
); 