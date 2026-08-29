import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  Check, 
  Copy,
  Trash2
} from 'lucide-react';
import { Artwork } from '../types';
import { CopyrightWatermark } from './CopyrightWatermark';
import confetti from 'canvas-confetti';

interface ArtworkCardProps {
  artwork: Artwork;
  onSelect: (artwork: Artwork) => void;
  onLike: (artworkId: string, e: React.MouseEvent) => void;
  onShareQuick: (artwork: Artwork, e: React.MouseEvent) => void;
  hasLiked: boolean;
  onDeleteArtwork?: (artworkId: string) => void;
  isOwnerMode?: boolean;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  onSelect,
  onLike,
  onShareQuick,
  hasLiked,
  onDeleteArtwork,
  isOwnerMode
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleQuickCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?art=${artwork.id}&ref=direct`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(artwork.id, e);
    if (!hasLiked) {
      confetti({
        particleCount: 25,
        spread: 45,
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
      className="group relative bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Image Showcase with Anti-Theft Protection & Dynamic Watermark */}
      <div 
        className="relative w-full overflow-hidden bg-black/50 aspect-[3/4] flex items-center justify-center p-1 artwork-shield select-none"
        onContextMenu={(e) => e.preventDefault()}
      >
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          loading="lazy"
          draggable={false}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02] protected-artwork-img"
          referrerPolicy="no-referrer"
        />

        {/* Dynamic Un-Croppable Copyright Watermark */}
        <CopyrightWatermark 
          variant="card" 
          title={artwork.title}
          year={artwork.year} 
        />

        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-[#121526]/90 via-[#121526]/20 to-transparent transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-90' : 'opacity-40'}`} />

        {/* Featured Badge */}
        {artwork.featured && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 shadow-md border border-indigo-400/30">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Featured</span>
          </div>
        )}

        {/* Medium Pill Top Right */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-slate-200 text-[10px] font-medium border border-white/15">
          {artwork.medium}
        </div>

        {/* Floating Quick Action Buttons on Hover */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {isOwnerMode && onDeleteArtwork && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${artwork.title}" from your portfolio?`)) {
                  onDeleteArtwork(artwork.id);
                }
              }}
              title="Delete Sketch (Owner)"
              className="p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white border border-red-400/30 backdrop-blur-md transition-all active:scale-95 shadow-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleQuickCopy}
            title="Copy Direct Link"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 backdrop-blur-md transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareQuick(artwork, e);
            }}
            title="Share to Discord, Reddit, WhatsApp"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-300 border border-white/20 backdrop-blur-md transition-all active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
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
          <div className="flex flex-wrap gap-1 mb-2.5">
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

        {/* Bottom Actions */}
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-slate-400" title="Critiques & Comments">
              <MessageSquare className="w-3 h-3 text-slate-400" />
              <span>{artwork.commentsCount}</span>
            </span>
          </div>

          {/* Interactive Heart Button */}
          <button
            id={`like-btn-${artwork.id}`}
            onClick={triggerLike}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs transition-all ${
              hasLiked
                ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 font-semibold'
                : 'bg-white/5 hover:bg-white/15 text-slate-300 hover:text-pink-300 border-white/10'
            }`}
            title="Appreciate sketch"
          >
            <Heart className={`w-3 h-3 ${hasLiked ? 'fill-pink-500 text-pink-400' : ''}`} />
            <span>{artwork.likesCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
