import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Eye, 
  Share2, 
  MessageSquare, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  Send, 
  CornerDownRight, 
  Maximize2, 
  ZoomIn,
  ShieldCheck,
  Shield,
  Calendar,
  Layers,
  Wrench,
  Flame,
  User,
  Lock,
  Trash2,
  Edit3
} from 'lucide-react';
import { Artwork, Comment, PlatformSource } from '../types';
import { SOCIAL_PLATFORMS } from '../data/socialPlatforms';
import { generateShareUrl } from '../utils/analytics';
import { CopyrightWatermark } from './CopyrightWatermark';
import confetti from 'canvas-confetti';

interface ArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
  onLike: (artworkId: string, e: React.MouseEvent) => void;
  hasLiked: boolean;
  comments: Comment[];
  onAddComment: (artworkId: string, authorName: string, authorHandle: string, content: string, parentCommentId?: string) => void;
  onLikeComment: (commentId: string) => void;
  currentReferralSource?: PlatformSource;
  onShareTracked: (source: PlatformSource, campaign?: string) => void;
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
  currentReferralSource,
  onShareTracked,
  onDeleteArtwork,
  onEditArtwork,
  isOwnerMode
}) => {
  const [commentName, setCommentName] = useState('');
  const [commentHandle, setCommentHandle] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'comments' | 'share'>('info');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const directTrackedLink = generateShareUrl(currentReferralSource || 'direct', artwork.id, 'portfolio_view');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directTrackedLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePlatformShare = (platform: PlatformSource) => {
    const url = generateShareUrl(platform, artwork.id, 'social_share');
    onShareTracked(platform, 'modal_share');

    const config = SOCIAL_PLATFORMS.find(p => p.id === platform);
    if (!config) return;

    const shareUrl = config.getShareUrl(url, artwork.title, artwork.description);
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    } else {
      // For Discord/Instagram where direct URL protocol isn't standard, copy rich formatted text
      const richMsg = config.getFormattedMessage(url, artwork.title, 'Rishi Khare');
      navigator.clipboard.writeText(richMsg);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2500);
    }
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const name = commentName.trim() || 'Fellow Creator';
    const handle = commentHandle.trim() || (currentReferralSource && currentReferralSource !== 'direct' ? `@${currentReferralSource}_visitor` : '@guest');
    
    onAddComment(artwork.id, name, handle, commentText.trim());
    setCommentText('');
    setActiveTab('comments');

    confetti({
      particleCount: 20,
      spread: 35,
      colors: ['#38bdf8', '#818cf8', '#c084fc']
    });
  };

  const submitReply = (parentCommentId: string) => {
    if (!replyText.trim()) return;
    const name = commentName.trim() || 'Artist / Visitor';
    const handle = commentHandle.trim() || '@visitor';
    
    onAddComment(artwork.id, name, handle, replyText.trim(), parentCommentId);
    setReplyText('');
    setReplyingToId(null);
  };

  const formatTimeAgo = (timestamp: number) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-black/80 backdrop-blur-2xl animate-fade-in">
      
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative z-10 w-full max-w-6xl max-h-[94vh] bg-[#141625]/90 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row backdrop-blur-2xl">
        
        {/* Close Button Top Right */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT / CENTER: High-Res Drawing Display with Anti-Theft Protection */}
        <div 
          className="lg:w-7/12 bg-black/50 flex flex-col items-center justify-center relative p-3 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/10 select-none min-h-[300px] lg:min-h-[600px] artwork-shield overflow-hidden"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Main Image with Zoom toggle and Protective Watermark */}
          <div 
            className={`relative max-h-[70vh] flex items-center justify-center cursor-zoom-in transition-all duration-300 ${isZoomed ? 'scale-125 cursor-zoom-out' : ''}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              draggable={false}
              className="max-h-[65vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 protected-artwork-img"
              referrerPolicy="no-referrer"
            />

            {/* Dynamic Watermark Stamp on Top */}
            <CopyrightWatermark 
              variant="modal" 
              title={artwork.title} 
              year={artwork.year} 
            />
          </div>

          {/* Bottom Floating Bar on Canvas */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl text-xs text-slate-200 border border-white/15">
                {artwork.medium}
              </span>
              {artwork.dimensions && (
                <span className="hidden sm:inline px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl text-xs text-slate-300 border border-white/15">
                  {artwork.dimensions}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 rounded-xl bg-black/60 text-slate-200 hover:text-white hover:bg-white/20 border border-white/15 backdrop-blur-xl transition-all"
                title="Toggle High-Res Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 text-xs text-emerald-300 border border-emerald-500/30 backdrop-blur-xl"
                title="This artwork is registered and protected by copyright"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px]">Protected Art</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT: Metadata, Social Share & Interactive Comment Section */}
        <div className="lg:w-5/12 flex flex-col bg-white/[0.02] backdrop-blur-2xl overflow-y-auto max-h-[94vh]">
          
          {/* Header & Tabs */}
          <div className="p-5 sm:p-6 border-b border-white/10">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {artwork.medium} • {artwork.year}
              </span>
              
              {/* Like Button */}
              <button
                id="modal-like-artwork-btn"
                onClick={(e) => onLike(artwork.id, e)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all backdrop-blur-md ${
                  hasLiked 
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-sm'
                    : 'bg-white/10 hover:bg-pink-500/15 text-slate-300 hover:text-pink-300 border-white/15'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-pink-500 text-pink-400' : ''}`} />
                <span>{artwork.likesCount} Likes</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-2 font-display">
              {artwork.title}
            </h2>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{artwork.viewsCount.toLocaleString()} views</span>
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>{comments.length} comments</span>
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{artwork.sharesCount} shares</span>
              </span>
            </div>

            {/* Nav Tabs */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'info'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                Artwork Info
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'comments'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <span>Comments & Critiques</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px]">
                  {comments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('share')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                  activeTab === 'share'
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                }`}
              >
                <Share2 className="w-3 h-3 text-pink-300" />
                <span>Share Links</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ARTWORK INFO */}
          {activeTab === 'info' && (
            <div className="p-5 sm:p-6 space-y-5 flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Artist Statement & Concept
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {artwork.description}
                </p>
              </div>

              {/* Tools & Software Used */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  Tools & Mediums
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {artwork.toolsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-200 border border-white/10 font-mono"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tags & Taxonomy
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {artwork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-full bg-white/5 text-xs text-indigo-300 border border-white/10"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sale status */}
              {artwork.forSale && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between backdrop-blur-md">
                  <div>
                    <div className="text-xs font-bold text-emerald-300">Available for Acquisition</div>
                    <div className="text-sm font-semibold text-white">{artwork.price}</div>
                  </div>
                  <button
                    onClick={() => setActiveTab('comments')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all shadow-md shadow-emerald-950/40"
                  >
                    Inquire via Comments
                  </button>
                </div>
              )}

              {/* Legal Copyright & Rights Assertion Card */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Copyright & Intellectual Property Notice</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  © {artwork.year} <strong>Rishi Khare</strong>. All Rights Reserved. This drawing and its original compositional elements are protected under international copyright law. Screenshots, reproduction, modification, NFT minting, or unauthorized commercial use are strictly prohibited without written consent.
                </p>
                <div className="pt-1 text-[10px] font-mono text-slate-400">
                  Citation ID: RK-SKETCH-{artwork.id.toUpperCase()}-{artwork.year}
                </div>
              </div>

              {/* Owner Controls (Edit & Delete Artwork) */}
              {isOwnerMode && (
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/15 space-y-3 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Owner Management Controls</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Rishi Khare • Studio</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onEditArtwork && (
                      <button
                        onClick={() => onEditArtwork(artwork)}
                        className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Image & Details</span>
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
                            className="px-3 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Confirm Delete</span>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(false)}
                            className="px-2.5 py-2 text-xs bg-white/10 hover:bg-white/15 text-slate-300 rounded-xl transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="px-3 py-2 text-xs font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Quick Share Teaser */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Want to share this drawing with friends?</span>
                <button
                  onClick={() => setActiveTab('share')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>Open Share Hub</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE COMMENTS SECTION */}
          {activeTab === 'comments' && (
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-6">
              
              {/* Comment list */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-300">No critiques or comments yet.</p>
                    <p className="text-xs text-slate-400 mt-1">Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2.5 transition-all hover:border-white/20"
                    >
                      {/* Author Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden shadow-sm">
                            {comment.avatarUrl ? (
                              <img src={comment.avatarUrl} alt={comment.authorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">{comment.authorName}</span>
                              {comment.isArtist && (
                                <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                                  ARTIST
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{comment.authorHandle}</span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400">{formatTimeAgo(comment.timestamp)}</span>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-slate-200 leading-relaxed pl-9">
                        {comment.content}
                      </p>

                      {/* Reply & Likes */}
                      <div className="flex items-center justify-between pl-9 pt-1 text-[11px] text-slate-400">
                        <button
                          onClick={() => onLikeComment(comment.id)}
                          className="flex items-center gap-1 hover:text-pink-400 transition-colors"
                        >
                          <Heart className="w-3 h-3" />
                          <span>{comment.likes}</span>
                        </button>

                        <button
                          onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-6 pt-2 space-y-2 border-l border-white/10">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-200">{reply.authorName}</span>
                                <span className="text-[9px] text-slate-400">{formatTimeAgo(reply.timestamp)}</span>
                              </div>
                              <p className="text-slate-300 text-[11px] leading-relaxed">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Inline Reply Form */}
                      {replyingToId === comment.id && (
                        <div className="pl-6 pt-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Reply to ${comment.authorName}...`}
                              className="flex-1 bg-white/5 backdrop-blur-md text-xs text-white placeholder-slate-400 px-3 py-1.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-400"
                            />
                            <button
                              onClick={() => submitReply(comment.id)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Box */}
              <form onSubmit={submitComment} className="pt-4 border-t border-white/10 space-y-2.5">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Leave a Comment or Feedback</span>
                  {currentReferralSource && currentReferralSource !== 'direct' && (
                    <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Posting via {currentReferralSource.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="Your Name / Handle"
                    className="bg-white/5 backdrop-blur-md text-xs text-white placeholder-slate-400 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-400"
                  />
                  <input
                    type="text"
                    value={commentHandle}
                    onChange={(e) => setCommentHandle(e.target.value)}
                    placeholder="Social tag (e.g. @discord_name)"
                    className="bg-white/5 backdrop-blur-md text-xs text-white placeholder-slate-400 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="relative">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a constructive critique, compliment, or question about technique..."
                    className="w-full bg-white/5 backdrop-blur-md text-xs text-white placeholder-slate-400 p-3 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-400 resize-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 bottom-3.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 flex items-center gap-1.5 transition-all active:scale-95 border border-indigo-500/40"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 3: SOCIAL MEDIA SHARE HUB */}
          {activeTab === 'share' && (
            <div className="p-5 sm:p-6 space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  1-Click Trackable Social Share
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Send this drawing to Discord servers, Reddit threads, or WhatsApp groups. When people click your link, our built-in tracker logs their referral platform!
                </p>

                {/* Platform Action Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformShare(platform.id)}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 text-left backdrop-blur-md ${platform.badgeBg} ${platform.borderColor}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl bg-black/40 ${platform.textColor}`}>
                          <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${platform.textColor}`}>
                            {platform.name}
                          </div>
                          <div className="text-[10px] text-slate-300 line-clamp-1">
                            {platform.defaultChannel}
                          </div>
                        </div>
                      </div>

                      {copiedPlatform === platform.id ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 px-2 py-1 rounded-lg">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Tracked URL Box */}
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Direct Tracked Link</span>
                  <span className="text-[11px] text-indigo-300 font-mono">UTM auto-tagged</span>
                </div>

                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                  <input
                    type="text"
                    readOnly
                    value={directTrackedLink}
                    className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none font-mono truncate px-1"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15 shadow-sm"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
