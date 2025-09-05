import React from 'react';

export function Sundari() {
  return (
    <svg
      width="100"
      height="150"
      viewBox="0 0 100 150"
      xmlns="http://www.w3.org/2000/svg"
      data-ai-hint="woman portrait"
    >
      <g>
        {/* Face */}
        <path
          d="M20 50 C 20 20, 80 20, 80 50 C 95 80, 85 130, 70 145 C 50 155, 30 155, 10 145 C -5 130, 5 80, 20 50 Z"
          fill="#f4a278" // A warm skin tone
        />
        {/* Hair */}
        <path
          d="M15 50 C 10 20, 90 20, 85 50 C 100 80, 90 140, 75 150 L 25 150 C 10 140, 0 80, 15 50 Z"
          fill="#2C1608" // Dark brown hair
        />

        {/* Eyes */}
        <ellipse cx="35" cy="55" rx="6" ry="4" fill="#fff" />
        <ellipse cx="65" cy="55" rx="6" ry="4" fill="#fff" />
        <circle cx="35" cy="55" r="2.5" fill="#5C3B1E" />
        <circle cx="65" cy="55" r="2.5" fill="#5C3B1E" />
        <circle cx="36" cy="54" r="1" fill="#fff" />
        <circle cx="66" cy="54" r="1" fill="#fff" />
        
        {/* Eyebrows */}
        <path d="M 30 45 C 35 42, 40 42, 45 45" stroke="#2C1608" strokeWidth="2" fill="none" />
        <path d="M 60 45 C 65 42, 70 42, 75 45" stroke="#2C1608" strokeWidth="2" fill="none" />

        {/* Nose */}
        <path d="M 50 58 L 50 70 L 53 70" stroke="#000" strokeOpacity="0.3" strokeWidth="1" fill="none" />

        {/* Mouth */}
        <path d="M 45 80 C 50 85, 55 85, 60 80 C 55 82, 50 82, 45 80" fill="#d16071" />
        
        {/* Forehead dot (Bindi) */}
        <circle cx="50" cy="42" r="3" fill="#c44" />
        
        {/* Neck */}
        <path d="M40 95 C 40 105, 60 105, 60 95 L 60 100 C 60 110, 40 110, 40 100 Z" fill="#e89a6f" />

        {/* Blouse */}
        <path d="M25 100 C 25 120, 75 120, 75 100 L 75 150 L 25 150 Z" fill="#d16071" />
        <path d="M25 100 C 50 110, 50 110, 75 100" stroke="#b04a5c" strokeWidth="2" fill="none" />

        {/* Earrings */}
        <circle cx="20" cy="80" r="5" fill="#ffd700" />
        <path d="M20 85 L 20 95 L 18 95 L 22 95 Z" stroke="#ffd700" strokeWidth="1" fill="#ffd700" />
        <circle cx="80" cy="80" r="5" fill="#ffd700" />
        <path d="M80 85 L 80 95 L 78 95 L 82 95 Z" stroke="#ffd700" strokeWidth="1" fill="#ffd700" />
      </g>
    </svg>
  );
}
