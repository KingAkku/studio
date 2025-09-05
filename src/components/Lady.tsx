import React from 'react';

export function Lady() {
  return (
    <svg
      width="100"
      height="150"
      viewBox="0 0 100 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M20 50 C 20 20, 80 20, 80 50 C 95 80, 85 130, 70 145 C 50 155, 30 155, 10 145 C -5 130, 5 80, 20 50 Z"
          fill="#fde3cf"
        />
        <path
          d="M15 50 C 10 20, 90 20, 85 50 C 100 80, 90 140, 75 150 L 25 150 C 10 140, 0 80, 15 50 Z"
          fill="#1C1C1C"
        />

        <ellipse cx="35" cy="55" rx="5" ry="3" fill="#6b4f3a" />
        <ellipse cx="65" cy="55" rx="5" ry="3" fill="#6b4f3a" />
        <circle cx="35" cy="55" r="1.5" fill="#000" />
        <circle cx="65" cy="55" r="1.5" fill="#000" />

        <path d="M 30 45 C 35 40, 65 40, 70 45" stroke="#000" strokeWidth="2" fill="none" />
        <path d="M 45 65 C 50 70, 55 70, 60 65" stroke="#c44" strokeWidth="1.5" fill="none" />
        
        <path d="M49 50 L51 50" stroke="#000" strokeWidth="0.5" />

        <path d="M 40 75 C 50 80, 60 75" fill="#e75480" />

        <rect x="10" y="110" width="80" height="40" fill="#fff" />
        <path d="M10 110 C 20 100, 80 100, 90 110" fill="none" stroke="#ccc" strokeWidth="3" />
        <path d="M10 115 C 20 105, 80 105, 90 115" fill="none" stroke="#ccc" strokeWidth="1" />

        <circle cx="20" cy="80" r="5" fill="#ccc" />
        <circle cx="20" cy="85" r="1" fill="#aaa" />
        <circle cx="20" cy="90" r="1" fill="#aaa" />

        <circle cx="80" cy="80" r="5" fill="#ccc" />
        <circle cx="80" cy="85" r="1" fill="#aaa" />
        <circle cx="80" cy="90" r="1" fill="#aaa" />
      </g>
    </svg>
  );
}
