import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { verifyArtistPassword, getLockoutRemainingSeconds } from '../services/authService';

interface OwnerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Please enter your artist password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await verifyArtistPassword(password);
      if (result.success) {
        setLoginSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 600);
      } else {
        setErrorMessage(result.error || 'Incorrect password.');
        setPassword('');
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const lockoutSeconds = getLockoutRemainingSeconds();
  const isLocked = lockoutSeconds > 0;

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
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display">
            Artist Access
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Enter your secret master password to unlock portfolio management controls.
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
            <div className="font-semibold">Access granted! Unlocking studio controls...</div>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
              Master Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isLocked || loginSuccess}
                placeholder="Enter password..."
                autoFocus
                className="w-full bg-white/5 text-xs text-white placeholder-slate-500 pl-10 pr-10 py-3 rounded-2xl border border-white/10 focus:border-indigo-400 focus:outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isLocked || !password || loginSuccess}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-[0.98] shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 border border-indigo-400/30 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? 'Verifying...' : 'Unlock Studio'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security badge note */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted SHA-256 Authentication • Brute-force protected</span>
        </div>
      </div>
    </div>
  );
};
