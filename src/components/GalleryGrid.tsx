import React, { useState } from 'react';
import { Artwork } from '../types';
import { ArtworkCard } from './ArtworkCard';
import { Grid, LayoutGrid, Plus, Palette } from 'lucide-react';

interface GalleryGridProps {
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onLikeArtwork: (artworkId: string, e: React.MouseEvent) => void;
  onShareQuick: (artwork: Artwork, e: React.MouseEvent) => void;
  likedArtworkIds: Set<string>;
  onResetFilters: () => void;
  onDeleteArtwork?: (artworkId: string) => void;
  onEditArtwork?: (artwork: Artwork) => void;
  onOpenUpload?: () => void;
  isOwnerMode?: boolean;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  artworks,
  onSelectArtwork,
  onLikeArtwork,
  onShareQuick,
  likedArtworkIds,
  onResetFilters,
  onDeleteArtwork,
  onEditArtwork,
  onOpenUpload,
  isOwnerMode
}) => {
  const [layoutMode, setLayoutMode] = useState<'standard' | 'dense'>('standard');

  if (artworks.length === 0) {
    return (
      <div className="py-24 text-center max-w-lg mx-auto px-4">
        <div className="w-20 h-20 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 backdrop-blur-xl flex items-center justify-center mx-auto mb-5 text-indigo-400 shadow-2xl">
          <Palette className="w-9 h-9 text-indigo-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-display">Gallery is Ready for Your Art</h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          The default sample pieces have been cleared. You can now upload your own original drawings, manga studies, and sketches.
        </p>
        
        {isOwnerMode && onOpenUpload && (
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl shadow-xl shadow-indigo-900/50 border border-indigo-400/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Your First Artwork</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar showing item count & density */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-200 font-display">
            Portfolio Exhibition ({artworks.length} {artworks.length === 1 ? 'Piece' : 'Pieces'})
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">• Click artwork for high-res study & community comments</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 bg-white/5 backdrop-blur-md p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setLayoutMode('standard')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              layoutMode === 'standard'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Spacious Grid"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode('dense')}
            className={`p-1.5 rounded-lg text-xs transition-all ${
              layoutMode === 'dense'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Dense Multi-Column Grid"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid container */}
      <div 
        className={`grid gap-6 ${
          layoutMode === 'dense'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {artworks.map((art) => (
          <ArtworkCard
            key={art.id}
            artwork={art}
            onSelect={onSelectArtwork}
            onLike={onLikeArtwork}
            onShareQuick={onShareQuick}
            hasLiked={likedArtworkIds.has(art.id)}
            onDeleteArtwork={onDeleteArtwork}
            onEditArtwork={onEditArtwork}
            isOwnerMode={isOwnerMode}
          />
        ))}
      </div>
    </div>
  );
};
