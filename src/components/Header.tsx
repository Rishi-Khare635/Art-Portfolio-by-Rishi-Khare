import React from 'react';
import { 
  Palette, 
  PlusCircle, 
  Lock, 
  Unlock, 
  Search,
  Inbox
} from 'lucide-react';

interface HeaderProps {
  currentView: 'gallery' | 'inbox';
  setCurrentView: (view: 'gallery' | 'inbox') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenUpload: () => void;
  onOpenContact: () => void;
  unreadCount: number;
  isOwnerMode: boolean;
  setIsOwnerMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  onOpenContact,
  unreadCount,
  isOwnerMode,
  setIsOwnerMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#121526]/90 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button 
              id="logo-btn"
              onClick={() => setCurrentView('gallery')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform border border-white/20">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white font-display">Rishi Khare</span>
              </div>
            </button>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sketches..."
                className="w-full bg-white/5 text-xs text-slate-100 placeholder-slate-400 pl-8 pr-3 py-1.5 rounded-xl border border-white/10 focus:border-indigo-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            
            {/* Contact / Ask Question */}
            <button
              id="header-contact-btn"
              onClick={onOpenContact}
              className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl backdrop-blur-md transition-all active:scale-95 shadow-sm"
            >
              Ask a Question
            </button>

            {/* Owner Actions */}
            {isOwnerMode && (
              <>
                <button
                  id="header-upload-btn"
                  onClick={onOpenUpload}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all active:scale-95"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Sketch</span>
                </button>

                <button
                  id="header-inbox-toggle-btn"
                  onClick={() => setCurrentView(currentView === 'gallery' ? 'inbox' : 'gallery')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    currentView === 'inbox'
                      ? 'bg-indigo-600 border-indigo-400 text-white'
                      : 'bg-white/10 border-white/15 text-slate-300 hover:text-white'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5 text-indigo-300" />
                  <span>{currentView === 'inbox' ? 'View Gallery' : 'Private Inbox'}</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-pink-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Discreet Artist / Owner Lock Toggle */}
            <button
              id="header-owner-lock-btn"
              onClick={() => setIsOwnerMode(!isOwnerMode)}
              className={`p-2 rounded-xl border text-xs transition-all ${
                isOwnerMode 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title={isOwnerMode ? 'Artist Mode Active (Click to switch to Public View)' : 'Owner Mode (Access Private Inbox)'}
            >
              {isOwnerMode ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
