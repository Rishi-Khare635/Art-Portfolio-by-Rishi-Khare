import React from 'react';
import { 
  Palette, 
  PlusCircle, 
  Lock, 
  Unlock, 
  Search
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenUpload: () => void;
  isOwnerMode: boolean;
  setIsOwnerMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  isOwnerMode,
  setIsOwnerMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#121526]/90 backdrop-blur-xl border-b border-white/10 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-600/20 border border-white/20">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white font-display">Rishi Khare</span>
                <span className="hidden sm:inline text-xs text-slate-400 ml-2">• Sketches</span>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search drawings & tags..."
                className="w-full bg-white/5 text-xs text-slate-100 placeholder-slate-400 pl-8 pr-3 py-1.5 rounded-xl border border-white/10 focus:border-indigo-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            
            {/* Owner Upload Action */}
            {isOwnerMode && (
              <button
                id="header-upload-btn"
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-900/30"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Sketch</span>
              </button>
            )}

            {/* Artist / Owner Lock Toggle */}
            <button
              id="header-owner-lock-btn"
              onClick={() => setIsOwnerMode(!isOwnerMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-all ${
                isOwnerMode 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
              title={isOwnerMode ? 'Artist Mode Active (Click to switch to Public View)' : 'Switch to Owner Mode'}
            >
              {isOwnerMode ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Owner Mode</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Visitor</span>
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
