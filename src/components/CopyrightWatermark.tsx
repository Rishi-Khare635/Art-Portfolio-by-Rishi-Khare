import React from 'react';

interface CopyrightWatermarkProps {
  variant?: 'card' | 'modal';
  title?: string;
  year?: number;
  density?: 'standard' | 'high' | 'ultra';
}

export const CopyrightWatermark: React.FC<CopyrightWatermarkProps> = ({ 
  variant = 'card',
  density = 'high'
}) => {
  const isModal = variant === 'modal';

  return (
    <div 
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 flex flex-col justify-between p-2.5 sm:p-4"
      aria-hidden="true"
    >
      {/* 
        1. ADVERSARIAL HIGH-FREQUENCY ANTI-AI MESH
        Interlocking SVG diagonal crosshatch with micro-lines.
        This disrupts AI Inpainting (Photoshop Gen Fill / Stable Diffusion) 
        from interpolating pixel gradients to erase the signature without warping the linework.
      */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-35 mix-blend-overlay pointer-events-none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="anti-ai-mesh" width="36" height="36" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="36" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,3" />
            <line x1="0" y1="0" x2="36" y2="0" stroke="#000000" strokeWidth="0.8" strokeDasharray="3,3" />
            <line x1="0" y1="36" x2="36" y2="0" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.7" />
            <circle cx="18" cy="18" r="1.5" fill="#ffffff" opacity="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#anti-ai-mesh)" />
      </svg>

      {/* 
        2. DENSE MULTI-BAND DIAGONAL WATERMARK MATRIX: 'rishi'
        Covers the focal sketch area (eyes, face, core shading).
        If AI attempts inpainting removal, the character's facial anatomy & linework are permanently destroyed.
      */}
      <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-[28deg] scale-135 pointer-events-none space-y-4 sm:space-y-6 opacity-60">
        <div className="flex items-center gap-6 text-white font-mono font-black text-xs sm:text-sm tracking-[0.35em] uppercase select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          <span className="text-white/80">rishi</span>
          <span className="text-pink-300">•</span>
          <span className="text-white/80">rishi</span>
          <span className="text-indigo-300">•</span>
          <span className="text-white/80">rishi</span>
          <span className="text-pink-300">•</span>
          <span className="text-white/80">rishi</span>
        </div>
        
        <div className="flex items-center gap-6 text-white font-mono font-black text-xs sm:text-sm tracking-[0.35em] uppercase select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          <span className="text-indigo-200">rishi</span>
          <span className="text-white/90">©</span>
          <span className="text-indigo-200">rishi</span>
          <span className="text-white/90">©</span>
          <span className="text-indigo-200">rishi</span>
          <span className="text-white/90">©</span>
          <span className="text-indigo-200">rishi</span>
        </div>

        <div className="flex items-center gap-6 text-white font-mono font-black text-xs sm:text-sm tracking-[0.35em] uppercase select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          <span className="text-white/80">rishi</span>
          <span className="text-pink-300">•</span>
          <span className="text-white/80">rishi</span>
          <span className="text-indigo-300">•</span>
          <span className="text-white/80">rishi</span>
          <span className="text-pink-300">•</span>
          <span className="text-white/80">rishi</span>
        </div>

        {isModal && (
          <div className="hidden sm:flex items-center gap-6 text-white font-mono font-black text-xs sm:text-sm tracking-[0.35em] uppercase select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <span className="text-indigo-200">rishi</span>
            <span className="text-white/90">©</span>
            <span className="text-indigo-200">rishi</span>
            <span className="text-white/90">©</span>
            <span className="text-indigo-200">rishi</span>
          </div>
        )}
      </div>

      {/* 
        3. TOP-LEFT COPYRIGHT BADGE WITH COLOR-SHIFT ACCENT
      */}
      <div className="self-start relative z-10">
        <span className="px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-[10px] sm:text-xs font-mono font-black text-white border border-white/30 shadow-xl flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
          <span className="tracking-wider">© rishi</span>
        </span>
      </div>

      {/* 
        4. BOTTOM-RIGHT SIGNATURE WATERMARK STAMP
      */}
      <div className="self-end relative z-10 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-black/90 backdrop-blur-md border border-white/30 text-xs sm:text-sm text-white font-black tracking-widest font-mono shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="drop-shadow-md text-slate-100 uppercase">rishi</span>
        </div>
      </div>
    </div>
  );
};
