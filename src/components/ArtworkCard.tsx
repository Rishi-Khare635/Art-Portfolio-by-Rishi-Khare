import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Trash2,
  Edit3
} from 'lucide-react';
import { Artwork } from '../types';
import { CopyrightWatermark } from './CopyrightWatermark';
import confetti from 'canvas-confetti';

interface ArtworkCardProps {
  artwork: Artwork;
  onSelect: (artwork: Artwork) => void;
  onLike: (artworkId: string, e: React.MouseEvent) => void;
  hasLiked: boolean;
  onDeleteArtwork?: (artworkId: string) => void;
  onEditArtwork?: (artwork: Artwork) => void;
  isOwnerMode?: boolean;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  onSelect,
  onLike,
  hasLiked,
  onDeleteArtwork,
  onEditArtwork,
  isOwnerMode
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const triggerLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(artwork.id, e);
    if (!hasLiked) {
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { 
          x: e.clientX / window.innerWidth, 
          y: e.clientY / window.innerHeight 
        },
        colors: ['#f43f5e', '#ec4899', '#fb7185']
      });
    }
  };

  return (
    <div
      id={`artwork-card-${artwork.id}`}
      onClick={() => onSelect(artwork)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image Showcase with Dynamic Watermark */}
      <div 
        className="relative w-full overflow-hidden bg-black/50 aspect-[3/4] flex items-center justify-center p-1.5 select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          loading="lazy"
          draggable={false}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02] protected-artwork-img pointer-events-none select-none"
          referrerPolicy="no-referrer"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Dynamic Anti-AI Inpainting Copyright Watermark */}
        <CopyrightWatermark 
          variant="card" 
          title={artwork.title} 
          year={artwork.year} 
        />

        {/* Invisible Click & Drag Trap Shield preventing image drag/extract */}
        <div 
          className="absolute inset-0 z-10 select-none pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Subtle Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#121526]/95 via-[#121526]/25 to-transparent transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-90' : 'opacity-40'}`} />

        {/* Featured Badge */}
        {artwork.featured && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-md border border-indigo-400/30">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Featured</span>
          </div>
        )}

        {/* Medium Pill Top Right */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-medium border border-white/15">
          {artwork.medium}
        </div>

        {/* Owner Quick Controls (Edit / Delete) */}
        {isOwnerMode && (
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {onEditArtwork && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditArtwork(artwork);
                }}
                title="Edit Artwork (Owner)"
                className="p-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white border border-indigo-400/30 backdrop-blur-md transition-all active:scale-95 shadow-md"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {onDeleteArtwork && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${artwork.title}" from your portfolio?`)) {
                    onDeleteArtwork(artwork.id);
                  }
                }}
                title="Delete Sketch (Owner)"
                className="p-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white border border-red-400/30 backdrop-blur-md transition-all active:scale-95 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 font-display">
              {artwork.title}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">{artwork.year}</span>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2.5">
            {artwork.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {artwork.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Actions: Pure Like & Comment */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          
          {/* Comment Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(artwork);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
            title="View & post comments"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-200">{artwork.commentsCount || 0}</span>
            <span className="text-[11px] text-slate-400">Comments</span>
          </button>

          {/* Like Button */}
          <button
            id={`like-btn-${artwork.id}`}
            onClick={triggerLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all active:scale-95 ${
              hasLiked
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 font-bold shadow-sm'
                : 'bg-white/5 hover:bg-pink-500/15 text-slate-300 hover:text-pink-300 border-white/10'
            }`}
            title={hasLiked ? 'Liked (Click to unlike)' : 'Like this drawing'}
          >
            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-pink-500 text-pink-400' : ''}`} />
            <span>{artwork.likesCount || 0}</span>
          </button>

        </div>
      </div>
    </div>
  );
};
