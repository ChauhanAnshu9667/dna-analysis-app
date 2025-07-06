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
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M60 30V70" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 50L60 30L80 50" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 90H90" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const MatchIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M30 60L50 40L90 80" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M50 80L90 40" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="50" cy="40" r="4" fill="#646cff"/>
    <circle cx="90" cy="80" r="4" fill="#646cff"/>
  </svg>
);

export const AnalyzeIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M25 95V25H95V95H25Z" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25 45H95" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25 65H95" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 25V95" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M65 25V95" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M85 25V95" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const PredictIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M60 25C60 25 75 40 75 60C75 80 60 95 60 95" stroke="#646cff" strokeWidth="6" strokeLinecap="round"/>
    <path d="M45 35C45 35 60 50 60 70C60 90 45 105 45 105" stroke="#646cff" strokeWidth="6" strokeLinecap="round"/>
    <path d="M75 35C75 35 90 50 90 70C90 90 75 105 75 105" stroke="#646cff" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="60" cy="60" r="8" fill="#646cff"/>
  </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#646cff" fillOpacity="0.1"/>
    <path d="M30 40H90V80H30V40Z" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M40 40V35H80V40" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 55H75" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 65H75" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M45 75H65" stroke="#646cff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
); 