import React from 'react';
import { 
  Sparkles, 
  PlusCircle,
  Heart
} from 'lucide-react';

interface ArtistHeroProps {
  artworksCount: number;
  totalLikes: number;
  onOpenUpload?: () => void;
  isOwnerMode?: boolean;
}

export const ArtistHero: React.FC<ArtistHeroProps> = ({
  artworksCount,
  totalLikes,
  onOpenUpload,
  isOwnerMode
}) => {
  return (
    <div className="relative pt-7 pb-6 border-b border-white/10 overflow-hidden bg-white/[0.01]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Main Bio Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                Rishi Khare
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Original Anime & Sketches
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Personal portfolio of hand-drawn character studies, manga line art, and illustrations. Click any piece to appreciate with a like and share your comments.
            </p>

            {/* Action Buttons */}
            {isOwnerMode && onOpenUpload && (
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  id="hero-upload-btn"
                  onClick={onOpenUpload}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all flex items-center gap-2 text-xs active:scale-95 shadow-lg shadow-indigo-950/50 border border-indigo-400/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Upload New Artwork</span>
                </button>
              </div>
            )}
          </div>

          {/* Counts & Stats */}
          <div className="flex items-center sm:flex-col sm:items-end gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="text-lg sm:text-xl font-bold text-white font-display">{artworksCount}</div>
              <span className="text-xs text-slate-400">{artworksCount === 1 ? 'Drawing' : 'Drawings'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-pink-300 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-400" />
              <span>{totalLikes} Total Likes</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
