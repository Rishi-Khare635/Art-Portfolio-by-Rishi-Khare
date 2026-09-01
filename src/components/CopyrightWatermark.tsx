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
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-2.5 sm:p-4"
      aria-hidden="true"
    >
      {/* Central Repeating Diagonal Watermark: 'rishi' */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 rotate-[-24deg] scale-125 pointer-events-none">
        <div className="text-center font-bold tracking-[0.25em] text-white font-mono space-y-8 select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          <div className="text-xs sm:text-sm">rishi • rishi • rishi • rishi</div>
          <div className="text-xs sm:text-sm">rishi • rishi • rishi • rishi</div>
          <div className="text-xs sm:text-sm">rishi • rishi • rishi • rishi</div>
          <div className="text-xs sm:text-sm">rishi • rishi • rishi • rishi</div>
        </div>
      </div>

      {/* Top Left Watermark Badge */}
      <div className="self-start">
        <span className="px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-[10px] sm:text-[11px] font-mono font-bold text-white/90 border border-white/20 shadow-md">
          © rishi
        </span>
      </div>

      {/* Bottom Right Signature Watermark Stamp */}
      <div className="self-end">
        <div className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-white font-bold tracking-widest font-mono shadow-xl flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="drop-shadow-sm">rishi</span>
        </div>
      </div>
    </div>
  );
};
