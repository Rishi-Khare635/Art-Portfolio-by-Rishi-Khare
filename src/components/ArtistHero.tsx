import React from 'react';
import { 
  Sparkles, 
  Mail, 
  PlusCircle,
  Inbox
} from 'lucide-react';

interface ArtistHeroProps {
  artworksCount: number;
  totalLikes: number;
  onOpenQuestionModal: () => void;
  onOpenUpload?: () => void;
  onOpenInbox?: () => void;
  unreadCount?: number;
  isOwnerMode?: boolean;
}

export const ArtistHero: React.FC<ArtistHeroProps> = ({
  artworksCount,
  onOpenQuestionModal,
  onOpenUpload,
  onOpenInbox,
  unreadCount = 0,
  isOwnerMode
}) => {
  return (
    <div className="relative pt-8 pb-6 border-b border-white/10 overflow-hidden bg-white/[0.01]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Main Bio Section (No avatar image, clean typography) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                Rishi Khare
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Artist & Sketches
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Original sketches, line art, and character studies. Click any drawing to view in high resolution.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                id="ask-question-btn"
                onClick={onOpenQuestionModal}
                className="px-4 py-2 font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all flex items-center gap-2 text-xs active:scale-95 shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Ask a Question / Contact</span>
              </button>

              {isOwnerMode && onOpenInbox && (
                <button
                  id="owner-inbox-btn"
                  onClick={onOpenInbox}
                  className="px-3.5 py-2 font-medium text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl transition-all flex items-center gap-2 text-xs active:scale-95"
                >
                  <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Private Inbox</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-indigo-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}

              {isOwnerMode && onOpenUpload && (
                <button
                  id="hero-upload-btn"
                  onClick={onOpenUpload}
                  className="px-3.5 py-2 font-medium text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center gap-1.5 text-xs active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Add Sketch</span>
                </button>
              )}
            </div>
          </div>

          {/* Simple count */}
          <div className="text-xs text-slate-400 sm:text-right">
            <div className="text-lg font-bold text-white">{artworksCount}</div>
            <div>Sketches in Portfolio</div>
          </div>

        </div>

      </div>
    </div>
  );
};
