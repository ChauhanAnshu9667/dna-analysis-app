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