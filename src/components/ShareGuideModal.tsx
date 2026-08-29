import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  GraduationCap, 
  MessageSquare, 
  Flame, 
  PhoneCall, 
  Globe, 
  FileText, 
  Sparkles,
  BookOpen,
  Mail,
  ShieldCheck,
  Download,
  Info
} from 'lucide-react';
import { SOCIAL_PLATFORMS } from '../data/socialPlatforms';
import { generateShareUrl } from '../utils/analytics';
import confetti from 'canvas-confetti';

interface ShareGuideModalProps {
  onClose: () => void;
  onOpenLinkGenerator: () => void;
}

export const ShareGuideModal: React.FC<ShareGuideModalProps> = ({
  onClose,
  onOpenLinkGenerator
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'college' | 'communities' | 'direct' | 'print'>('college');

  const portfolioUrl = window.location.origin + window.location.pathname;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
    confetti({
      particleCount: 20,
      spread: 35,
      colors: ['#6366f1', '#ec4899', '#3b82f6']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-[#121526]/95 border border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg border border-indigo-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30">
                  Sharing & Distribution Guide
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Personal Portfolio Ready
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-1">
                Where & How to Share Your Portfolio
              </h2>
              <p className="text-xs text-slate-300">
                Recommended channels and tailored message templates to showcase your artwork.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setActiveCategory('college')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeCategory === 'college'
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>College Apps</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Common App & SlideRoom</div>
          </button>

          <button
            onClick={() => setActiveCategory('communities')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeCategory === 'communities'
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <MessageSquare className="w-4 h-4 text-[#5865F2]" />
              <span>Social & Chats</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Discord, Reddit, WhatsApp</div>
          </button>

          <button
            onClick={() => setActiveCategory('direct')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeCategory === 'direct'
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Direct Link</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Clients, Mentors, Bio</div>
          </button>

          <button
            onClick={() => setActiveCategory('print')}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeCategory === 'print'
                ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <FileText className="w-4 h-4 text-rose-400" />
              <span>Resume & PDF</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Print summary & stats</div>
          </button>
        </div>

        {/* Content based on Active Category */}
        
        {/* 1. College & University Applications */}
        {activeCategory === 'college' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    College Admissions (Common App / SlideRoom / Supplementals)
                  </h3>
                </div>
                <span className="text-[11px] text-indigo-300 font-mono">UTM: college_app</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Paste this clean portfolio URL directly into your <strong>Common App Additional Information section</strong>, <strong>SlideRoom portfolio link field</strong>, or university arts supplement portal.
              </p>

              <div className="p-3 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs font-mono text-slate-200 truncate">
                  {generateShareUrl('direct', undefined, 'college_admissions')}
                </span>
                <button
                  onClick={() => copyToClipboard(generateShareUrl('direct', undefined, 'college_admissions'), 'college-url')}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 active:scale-95"
                >
                  {copiedSection === 'college-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'college-url' ? 'Copied Link' : 'Copy Admissions Link'}</span>
                </button>
              </div>

              {/* Ready-to-paste text snippet for college supplement */}
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold text-slate-300">
                  Ready-to-paste statement for Common App / Resume:
                </div>
                <div className="p-3 bg-black/30 rounded-2xl border border-white/10 text-xs text-slate-300 font-mono leading-relaxed relative">
                  {`Visual Art Portfolio by Rishi Khare:\nFeatures original concept art, character design, and traditional ink studies with high-resolution view and tool breakdowns at: ${generateShareUrl('direct', undefined, 'common_app')}`}
                  <button
                    onClick={() => copyToClipboard(`Visual Art Portfolio by Rishi Khare:\nFeatures original concept art, character design, and traditional ink studies with high-resolution view and tool breakdowns at: ${generateShareUrl('direct', undefined, 'common_app')}`, 'college-statement')}
                    className="mt-2 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 active:scale-95"
                  >
                    {copiedSection === 'college-statement' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'college-statement' ? 'Copied Statement!' : 'Copy Statement Text'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Social Communities (Discord, Reddit, WhatsApp) */}
        {activeCategory === 'communities' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white">
                Social Communities & Art Sharing Channels
              </h3>
              <p className="text-xs text-slate-300">
                Share directly with peer artists, Discord study servers, Reddit critique boards, or WhatsApp group chats.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Discord Box */}
                <div className="p-4 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#5865F2]">1. Discord (#art-share)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Post in servers like Art Lounge, DeviantArt Discord, or school art clubs.
                  </p>
                  <button
                    onClick={() => copyToClipboard(generateShareUrl('discord', undefined, 'art_share'), 'disc-link')}
                    className="w-full py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    {copiedSection === 'disc-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'disc-link' ? 'Copied!' : 'Copy Discord Link'}</span>
                  </button>
                </div>

                {/* Reddit Box */}
                <div className="p-4 rounded-2xl bg-[#FF4500]/15 border border-[#FF4500]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#FF4500]">2. Reddit (r/DigitalArt)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Post OC art with portfolio link to r/Art, r/DigitalArt, or r/Illustration.
                  </p>
                  <button
                    onClick={() => copyToClipboard(generateShareUrl('reddit', undefined, 'reddit_art'), 'red-link')}
                    className="w-full py-2 rounded-xl bg-[#FF4500] hover:bg-[#D93A00] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    {copiedSection === 'red-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'red-link' ? 'Copied!' : 'Copy Reddit Link'}</span>
                  </button>
                </div>

                {/* WhatsApp Box */}
                <div className="p-4 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#25D366]">3. WhatsApp Groups</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Send to art study groups, friends, mentors, and family group chats.
                  </p>
                  <button
                    onClick={() => copyToClipboard(generateShareUrl('whatsapp', undefined, 'whatsapp_chat'), 'wa-link')}
                    className="w-full py-2 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    {copiedSection === 'wa-link' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'wa-link' ? 'Copied!' : 'Copy WhatsApp Link'}</span>
                  </button>
                </div>
              </div>

              {/* Custom link builder shortcut */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onOpenLinkGenerator();
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Open Custom Link Generator for Specific Drawings</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Direct Link & Social Bio */}
        {activeCategory === 'direct' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  Direct Bio & Recruiter Link
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Use this clean link in your Instagram bio, Linktree, Twitter/X header, LinkedIn profile, or email signature.
              </p>

              <div className="p-3.5 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                <input
                  type="text"
                  readOnly
                  value={portfolioUrl}
                  className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none w-full truncate"
                />
                <button
                  onClick={() => copyToClipboard(portfolioUrl, 'direct-main')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 active:scale-95"
                >
                  {copiedSection === 'direct-main' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'direct-main' ? 'Copied!' : 'Copy Direct URL'}</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-300">
                ✨ <strong>Private Portfolio Experience:</strong> Your visitors only see your artwork, artist bio, categories, and drawings. They can appreciate, comment, or share your work directly.
              </div>
            </div>
          </div>
        )}

        {/* 4. Resume & PDF Summary */}
        {activeCategory === 'print' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">
                  Resume & Print Summary
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                You can print or save your portfolio summary directly from your browser (Ctrl+P / Cmd+P) for college interview binders.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 border border-white/10 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>All links support real-time click tracking in your Analytics dashboard.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold active:scale-95"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
