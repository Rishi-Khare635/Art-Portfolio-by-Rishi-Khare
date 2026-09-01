import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  OWNER_EMAIL, 
  signInOwnerWithGoogle, 
  verifyOwnerPasscode 
} from '../services/firebaseService';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (method: 'google' | 'passcode', email?: string) => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [passcode, setPasscode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signInOwnerWithGoogle();
      if (!res.success) {
        setErrorMessage(res.error || 'Google sign in was cancelled or failed.');
        setIsLoading(false);
        return;
      }

      if (res.isOwner) {
        setLoginSuccess(true);
        setTimeout(() => {
          onSuccess('google', res.email);
          onClose();
        }, 700);
      } else {
        setErrorMessage(
          `Access restricted: Signed in as "${res.email}". Only the artist account (${OWNER_EMAIL}) can enter Owner Mode.`
        );
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setErrorMessage(null);
    if (verifyOwnerPasscode(passcode)) {
      setLoginSuccess(true);
      setTimeout(() => {
        onSuccess('passcode');
        onClose();
      }, 700);
    } else {
      setErrorMessage('Incorrect passcode. Please enter the artist key.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-[#131627] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display">
            Artist / Owner Access
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Owner mode is protected and only accessible by Rishi Khare ({OWNER_EMAIL}).
          </p>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {loginSuccess && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <div className="font-semibold">Artist verified! Entering owner mode...</div>
          </div>
        )}

        <div className="space-y-4">
          {/* Method 1: Google Sign In */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading || loginSuccess}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoading ? 'Verifying...' : 'Sign in with Google (Artist Email)'}</span>
            </button>
            <div className="text-[10px] text-slate-400 text-center mt-1.5">
              Must match <span className="text-slate-300 font-mono font-semibold">{OWNER_EMAIL}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">or with passcode</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Method 2: Passcode Entry */}
          <form onSubmit={handlePasscodeSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Artist Secret Key</span>
                <span className="text-[10px] text-slate-400 font-mono">Default: rishi1224</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter secret artist key..."
                  className="w-full bg-white/5 text-xs text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-2xl border border-white/10 focus:border-indigo-400 focus:outline-none transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !passcode.trim() || loginSuccess}
              className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 border border-indigo-400/30 disabled:opacity-50"
            >
              <span>Unlock Owner Mode</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Security badge note */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Restricted to portfolio creator</span>
        </div>
      </div>
    </div>
  );
};
