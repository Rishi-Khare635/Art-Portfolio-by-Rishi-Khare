import React from 'react';

interface CopyrightWatermarkProps {
  variant?: 'card' | 'modal';
  title?: string;
  year?: number;
}

export const CopyrightWatermark: React.FC<CopyrightWatermarkProps> = ({ 
  variant = 'card'
}) => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-3 sm:p-4"
      aria-hidden="true"
    >
      {/* Central Repeating Diagonal Watermark: Bolder 'rishi' pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-45 rotate-[-26deg] scale-125 pointer-events-none">
        <div className="text-center font-black tracking-[0.3em] text-white font-mono space-y-7 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
          <div className="text-sm sm:text-base font-extrabold uppercase">rishi • rishi • rishi • rishi</div>
          <div className="text-sm sm:text-base font-extrabold uppercase">rishi • rishi • rishi • rishi</div>
          <div className="text-sm sm:text-base font-extrabold uppercase">rishi • rishi • rishi • rishi</div>
          <div className="text-sm sm:text-base font-extrabold uppercase">rishi • rishi • rishi • rishi</div>
        </div>
      </div>

      {/* Top Left Watermark Badge */}
      <div className="self-start relative z-10">
        <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[11px] sm:text-xs font-mono font-extrabold text-white border border-white/30 shadow-lg flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
          <span>© rishi</span>
        </span>
      </div>

      {/* Bottom Right Signature Watermark Stamp */}
      <div className="self-end relative z-10">
        <div className="px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/30 text-xs sm:text-sm text-white font-black tracking-wider font-mono shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="drop-shadow-md text-slate-100">rishi</span>
        </div>
      </div>
    </div>
  );
};
