import React, { useState } from 'react';
import { X, Sparkles, MessageSquare, Flame, Share2, Heart } from 'lucide-react';
import { PlatformSource } from '../types';

interface ReferralBannerProps {
  source: PlatformSource;
  artworkTitle?: string;
  onDismiss: () => void;
}

export const ReferralBanner: React.FC<ReferralBannerProps> = ({
  source,
  artworkTitle,
  onDismiss
}) => {
  if (source === 'direct') return null;

  const platformLabels: Record<PlatformSource, { name: string; bg: string; text: string; icon: string }> = {
    discord: { name: 'Discord Community', bg: 'bg-[#5865F2]/20 border-[#5865F2]/40', text: 'text-[#5865F2]', icon: '💬' },
    reddit: { name: 'Reddit Thread', bg: 'bg-[#FF4500]/20 border-[#FF4500]/40', text: 'text-[#FF4500]', icon: '🔥' },
    whatsapp: { name: 'WhatsApp Study Chat', bg: 'bg-[#25D366]/20 border-[#25D366]/40', text: 'text-[#25D366]', icon: '📱' },
    twitter: { name: 'X / Twitter Post', bg: 'bg-sky-500/20 border-sky-500/40', text: 'text-sky-400', icon: '✨' },
    instagram: { name: 'Instagram Story', bg: 'bg-pink-500/20 border-pink-500/40', text: 'text-pink-400', icon: '📸' },
    pinterest: { name: 'Pinterest Moodboard', bg: 'bg-red-500/20 border-red-500/40', text: 'text-red-400', icon: '📌' },
    telegram: { name: 'Telegram Channel', bg: 'bg-cyan-500/20 border-cyan-500/40', text: 'text-cyan-400', icon: '✈️' },
    linkedin: { name: 'LinkedIn Showcase', bg: 'bg-blue-500/20 border-blue-500/40', text: 'text-blue-400', icon: '💼' },
    direct: { name: 'Direct Visit', bg: '', text: '', icon: '' },
    other: { name: 'External Link', bg: 'bg-white/10 border-white/15', text: 'text-slate-300', icon: '🌐' }
  };

  const current = platformLabels[source] || platformLabels.other;

  return (
    <div className={`w-full py-2.5 px-4 sm:px-8 border-b ${current.bg} backdrop-blur-xl transition-all animate-fade-in`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">{current.icon}</span>
          <span className="text-slate-200">
            Welcome! You arrived via <strong className={current.text}>{current.name}</strong>.
            {artworkTitle ? (
              <span> Viewing featured study: <strong className="text-white">"{artworkTitle}"</strong></span>
            ) : (
              <span> Enjoy exploring my drawing portfolio & college submission pieces!</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-400 text-[11px]">
            Leave critiques, feedback, or likes below!
          </span>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
