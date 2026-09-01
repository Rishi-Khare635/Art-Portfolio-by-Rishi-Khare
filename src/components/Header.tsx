import React from 'react';
import { 
  Palette, 
  PlusCircle, 
  Lock, 
  Unlock, 
  Search,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenUpload: () => void;
  isOwnerMode: boolean;
  onOpenOwnerLogin: () => void;
  onLogoutOwner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  isOwnerMode,
  onOpenOwnerLogin,
  onLogoutOwner
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

            {/* Owner Status / Login & Lock Button */}
            {isOwnerMode ? (
              <button
                id="header-owner-lock-btn"
                onClick={onLogoutOwner}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-all bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 group"
                title="Artist Mode Active. Click to lock and switch to Visitor Mode."
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 group-hover:hidden" />
                <LogOut className="w-3.5 h-3.5 text-red-400 hidden group-hover:inline" />
                <span className="group-hover:hidden">Owner</span>
                <span className="hidden group-hover:inline">Lock</span>
              </button>
            ) : (
              <button
                id="header-owner-login-btn"
                onClick={onOpenOwnerLogin}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs transition-all bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10 hover:border-indigo-500/30"
                title="Artist Login"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Artist Login</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
