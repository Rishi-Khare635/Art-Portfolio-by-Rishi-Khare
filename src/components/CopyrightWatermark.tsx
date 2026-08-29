import React from 'react';
import { Shield } from 'lucide-react';

interface CopyrightWatermarkProps {
  variant?: 'card' | 'modal';
  title?: string;
  year?: number;
}

export const CopyrightWatermark: React.FC<CopyrightWatermarkProps> = ({ 
  variant = 'card',
  title,
  year = 2024
}) => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-2.5 sm:p-4"
      aria-hidden="true"
    >
      {/* Subtle Diagonal Central Watermark Pattern (Non-intrusive but un-croppable) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.14] rotate-[-25deg] scale-110 pointer-events-none">
        <div className="text-center font-bold tracking-widest text-white uppercase text-[11px] sm:text-xs font-mono space-y-12">
          <div>© RISHI KHARE • ORIGINAL ARTWORK • ALL RIGHTS RESERVED</div>
          <div>© RISHI KHARE • ORIGINAL ARTWORK • ALL RIGHTS RESERVED</div>
          <div>© RISHI KHARE • ORIGINAL ARTWORK • ALL RIGHTS RESERVED</div>
        </div>
      </div>

      {/* Top Right Security Pill */}
      <div className="self-end">
        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] sm:text-[10px] font-mono text-slate-300 border border-white/15 flex items-center gap-1 shadow-sm">
          <Shield className="w-2.5 h-2.5 text-indigo-400" />
          <span>© Rishi Khare</span>
        </span>
      </div>

      {/* Bottom Citation Stamp */}
      <div className="self-start">
        <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/15 text-[9px] sm:text-[10px] text-slate-200 font-mono flex items-center gap-1.5 shadow-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>© {year} Rishi Khare {title ? `• "${title}"` : ''} • Protected Art</span>
        </div>
      </div>
    </div>
  );
};
