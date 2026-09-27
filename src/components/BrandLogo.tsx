import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md' }) => {
  const dimensionClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Circular Emblem with Warm Gradient Ring & Cyber Core */}
      <div className={`relative ${dimensionClass} rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-rose-500 to-cyan-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] flex items-center justify-center shrink-0`}>
        <div className="w-full h-full rounded-full bg-[#070b14] flex items-center justify-center relative overflow-hidden border border-slate-800">
          {/* Subtle inner concentric radar rings */}
          <div className="absolute inset-0 rounded-full border border-amber-500/20" />
          <div className="absolute inset-[3px] rounded-full border border-cyan-500/20" />

          {/* SVG Emblem: Cyber Shield + Twin Nodes */}
          <svg viewBox="0 0 36 36" fill="none" className="w-[68%] h-[68%] text-amber-400">
            {/* Shield outline */}
            <path
              d="M18 4L7 9V17C7 24 11.5 29.5 18 32C24.5 29.5 29 24 29 17V9L18 4Z"
              fill="rgba(245, 158, 11, 0.12)"
              stroke="url(#emblemGradient)"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Center Neural Node & Pulse Rays */}
            <circle cx="18" cy="17" r="3.2" fill="#38bdf8" />
            <circle cx="18" cy="17" r="5" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
            {/* Twin Data Lines */}
            <path d="M12 17H15M21 17H24M18 11V14M18 20V23" stroke="#e2e8f0" strokeWidth="1.4" strokeLinecap="round" />
            
            <defs>
              <linearGradient id="emblemGradient" x1="7" y1="4" x2="29" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b" />
                <stop offset="0.5" stopColor="#fb7185" />
                <stop offset="1" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Title & Tagline */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 leading-none font-sans">
            CYBERA
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-800 font-bold tracking-wide">
            SIH26153
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium leading-none mt-1">
          <span>Predictive Cyber Twin</span>
          <span className="text-slate-400 hidden sm:inline">·</span>
          <span className="text-cyan-700 font-mono hidden sm:inline text-[10px] font-bold">AI World Model</span>
        </div>
      </div>
    </div>
  );
};
