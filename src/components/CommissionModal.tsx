import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  Sparkles, 
  Check, 
  Palette, 
  Calendar, 
  DollarSign,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CommissionModalProps {
  onClose: () => void;
}

export const CommissionModal: React.FC<CommissionModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<'character' | 'concept' | 'print' | 'college'>('character');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setSubmitted(true);
    confetti({
      particleCount: 30,
      spread: 45,
      colors: ['#f43f5e', '#fb7185', '#ec4899']
    });

    setTimeout(() => {
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl bg-[#161828]/95 border border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg border border-indigo-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Commissions & Inquiries
              </h2>
              <p className="text-xs text-slate-300">
                Contact Rishi Khare for artwork commissions, print purchases, or critique exchanges.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 backdrop-blur-md transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Inquiry Sent Successfully!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Thank you for reaching out, {name}! I will review your inquiry and reply to <span className="text-indigo-300 font-mono">{email}</span> within 24-48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Inquiry Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Inquiry Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTier('character')}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all backdrop-blur-md ${
                    tier === 'character'
                      ? 'bg-indigo-600/25 border-indigo-500/60 text-white font-bold shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-slate-200">⚔️ Character Design</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Original character / OC illustration</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('concept')}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all backdrop-blur-md ${
                    tier === 'concept'
                      ? 'bg-indigo-600/25 border-indigo-500/60 text-white font-bold shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-slate-200">🌌 Concept Art / Scene</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Atmospheric environment study</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('print')}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all backdrop-blur-md ${
                    tier === 'print'
                      ? 'bg-indigo-600/25 border-indigo-500/60 text-white font-bold shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-slate-200">🖼️ Fine Art Prints</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Archival physical print orders</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('college')}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all backdrop-blur-md ${
                    tier === 'college'
                      ? 'bg-indigo-600/25 border-indigo-500/60 text-white font-bold shadow-md'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-slate-200">🎓 College & Collaboration</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Admissions review & art chats</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex River"
                  className="w-full bg-black/30 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full bg-black/30 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Project Brief & Details</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell me about your idea, deadlines, or which drawing in the portfolio caught your attention..."
                className="w-full bg-black/30 text-xs text-white placeholder-slate-500 p-3 rounded-2xl border border-white/15 focus:border-indigo-500 focus:outline-none resize-none backdrop-blur-md"
              />
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                🔒 Direct artist correspondence
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-1.5 border border-indigo-500/30 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Inquiry</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
