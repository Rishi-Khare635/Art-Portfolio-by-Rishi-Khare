import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  MessageSquare, 
  Send, 
  ZoomIn,
  ShieldCheck,
  Shield,
  Wrench,
  User,
  Trash2,
  Edit3
} from 'lucide-react';
import { Artwork, Comment } from '../types';
import { CopyrightWatermark } from './CopyrightWatermark';
import confetti from 'canvas-confetti';

interface ArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
  onLike: (artworkId: string, e: React.MouseEvent) => void;
  hasLiked: boolean;
  comments: Comment[];
  onAddComment: (artworkId: string, authorName: string, content: string, isArtist?: boolean) => Promise<void> | void;
  onLikeComment: (commentId: string) => void;
  onDeleteComment?: (artworkId: string, commentId: string) => void;
  onDeleteArtwork?: (artworkId: string) => void;
  onEditArtwork?: (artwork: Artwork) => void;
  isOwnerMode?: boolean;
}

export const ArtworkModal: React.FC<ArtworkModalProps> = ({
  artwork,
  onClose,
  onLike,
  hasLiked,
  comments,
  onAddComment,
  onLikeComment,
  onDeleteComment,
  onDeleteArtwork,
  onEditArtwork,
  isOwnerMode
}) => {
  const [commentName, setCommentName] = useState(isOwnerMode ? 'Rishi Khare (Artist)' : '');
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    const name = commentName.trim() || (isOwnerMode ? 'Rishi Khare (Artist)' : 'Visitor');
    const text = commentText.trim();
    
    setIsSubmitting(true);
    try {
      await onAddComment(artwork.id, name, text, Boolean(isOwnerMode));
      setCommentText('');
      if (!isOwnerMode) setCommentName('');

      confetti({
        particleCount: 20,
        spread: 35,
        colors: ['#38bdf8', '#818cf8', '#c084fc']
      });
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    if (!timestamp) return 'recently';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] bg-[#141625] border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row backdrop-blur-2xl">
        
        {/* Close Button Top Right */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT: Drawing Display with Anti-Theft Protection */}
        <div 
          className="lg:w-7/12 bg-black/60 flex flex-col items-center justify-center relative p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/10 select-none min-h-[300px] lg:min-h-[580px] overflow-hidden"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Main Image with Zoom toggle and Protective Watermark */}
          <div 
            className={`relative max-h-[65vh] flex items-center justify-center cursor-zoom-in transition-all duration-300 ${isZoomed ? 'scale-125 cursor-zoom-out' : ''}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              draggable={false}
              className="max-h-[60vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 protected-artwork-img"
              referrerPolicy="no-referrer"
            />

            {/* Dynamic Watermark */}
            <CopyrightWatermark 
              variant="modal" 
              title={artwork.title} 
              year={artwork.year} 
            />
          </div>

          {/* Floating Details on Canvas Bottom */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-xl text-xs text-slate-200 border border-white/15">
                {artwork.medium}
              </span>
              {artwork.dimensions && (
                <span className="hidden sm:inline px-3 py-1 rounded-full bg-black/70 backdrop-blur-xl text-xs text-slate-300 border border-white/15">
                  {artwork.dimensions}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 rounded-xl bg-black/70 text-slate-200 hover:text-white hover:bg-white/20 border border-white/15 backdrop-blur-xl transition-all"
                title="Toggle Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 text-xs text-emerald-300 border border-emerald-500/30 backdrop-blur-xl"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px]">Protected Art</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Details, Like & Direct Interactive Comments */}
        <div className="lg:w-5/12 flex flex-col bg-[#141625] overflow-y-auto max-h-[92vh]">
          
          {/* Header & Main Like Button */}
          <div className="p-5 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {artwork.medium} • {artwork.year}
              </span>
              
              {/* Primary Like Button */}
              <button
                id="modal-like-artwork-btn"
                onClick={(e) => onLike(artwork.id, e)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all active:scale-95 ${
                  hasLiked 
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm'
                    : 'bg-white/10 hover:bg-pink-500/15 text-slate-300 hover:text-pink-300 border-white/15'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-pink-500 text-pink-400' : ''}`} />
                <span>{artwork.likesCount || 0} Likes</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
              {artwork.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {artwork.description}
            </p>

            {/* Tools / Mediums */}
            {artwork.toolsUsed && artwork.toolsUsed.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {artwork.toolsUsed.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] text-slate-300 border border-white/10 font-mono"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {artwork.tags && artwork.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {artwork.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-[11px] text-indigo-300 border border-indigo-500/20"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* For Sale Price if specified */}
            {artwork.forSale && artwork.price && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-300">Original Piece Acquisition</span>
                <span className="font-bold text-white text-sm">{artwork.price}</span>
              </div>
            )}

            {/* Owner Management Controls */}
            {isOwnerMode && (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/15 space-y-2">
                <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Owner Options</span>
                </div>
                <div className="flex items-center gap-2">
                  {onEditArtwork && (
                    <button
                      onClick={() => onEditArtwork(artwork)}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Sketch</span>
                    </button>
                  )}

                  {onDeleteArtwork && (
                    confirmDelete ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onDeleteArtwork(artwork.id);
                            onClose();
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all active:scale-95 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="px-2.5 py-1.5 text-xs bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* COMMENTS & DISCUSSION SECTION */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            
            {/* Section Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Comments & Feedback</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px]">
                  {comments.length}
                </span>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 flex-1 min-h-[140px] max-h-[320px] overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="text-center py-8 px-4 bg-white/[0.02] rounded-2xl border border-white/5">
                  <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-slate-300 font-medium">No comments yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Share your feedback or critique on this drawing below!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div 
                    key={comment.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5 transition-all hover:border-white/20"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-[10px] font-bold text-white">
                          <User className="w-3 h-3" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{comment.authorName}</span>
                          {comment.isArtist && (
                            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                              ARTIST
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{formatTimeAgo(comment.timestamp)}</span>
                        {isOwnerMode && onDeleteComment && (
                          <button
                            onClick={() => onDeleteComment(artwork.id, comment.id)}
                            title="Delete comment"
                            className="text-slate-400 hover:text-red-400 p-0.5 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-xs text-slate-200 leading-relaxed pl-8">
                      {comment.content}
                    </p>

                    {/* Likes on Comment */}
                    <div className="flex items-center justify-end pl-8 pt-0.5 text-[11px] text-slate-400">
                      <button
                        onClick={() => onLikeComment(comment.id)}
                        className="flex items-center gap-1 hover:text-pink-400 text-slate-400 transition-colors"
                        title="Upvote comment"
                      >
                        <Heart className="w-3 h-3" />
                        <span>{comment.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={submitComment} className="pt-3 border-t border-white/10 space-y-2">
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder={isOwnerMode ? "Rishi Khare (Artist)" : "Your Name (optional)"}
                className="w-full bg-white/5 text-xs text-white placeholder-slate-400 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-400"
              />

              <div className="relative">
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment or critique..."
                  required
                  className="w-full bg-white/5 text-xs text-white placeholder-slate-400 p-3 pr-20 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-400 resize-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !commentText.trim()}
                  className="absolute right-2.5 bottom-3.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
