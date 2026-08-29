import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Check, 
  Copy, 
  Sparkles, 
  ExternalLink, 
  MessageSquare, 
  Flame, 
  Send,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Artwork, PlatformSource } from '../types';
import { SOCIAL_PLATFORMS } from '../data/socialPlatforms';
import { generateShareUrl } from '../utils/analytics';
import confetti from 'canvas-confetti';

interface LinkGeneratorModalProps {
  artworks: Artwork[];
  selectedArtworkId?: string;
  onClose: () => void;
  onTrackLinkCreated?: (source: PlatformSource, campaign?: string) => void;
}

export const LinkGeneratorModal: React.FC<LinkGeneratorModalProps> = ({
  artworks,
  selectedArtworkId,
  onClose,
  onTrackLinkCreated
}) => {
  const [targetType, setTargetType] = useState<'home' | 'artwork'>(selectedArtworkId ? 'artwork' : 'home');
  const [targetArtId, setTargetArtId] = useState<string>(selectedArtworkId || artworks[0]?.id || '');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformSource>('discord');
  const [customCampaign, setCustomCampaign] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const selectedArt = artworks.find(a => a.id === targetArtId);
  const platformConfig = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform) || SOCIAL_PLATFORMS[0];

  const effectiveArtworkId = targetType === 'artwork' ? targetArtId : undefined;
  const campaignTag = customCampaign.trim() || platformConfig.defaultChannel.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  const generatedUrl = generateShareUrl(selectedPlatform, effectiveArtworkId, campaignTag);
  const formattedPostText = platformConfig.getFormattedMessage(
    generatedUrl, 
    selectedArt?.title || 'Rishi Khare - Visual Art Portfolio', 
    'Rishi Khare'
  );

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);

    confetti({
      particleCount: 20,
      spread: 35,
      colors: ['#ec4899', '#f43f5e', '#38bdf8']
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(formattedPostText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);

    confetti({
      particleCount: 20,
      spread: 35,
      colors: ['#10b981', '#34d399', '#a7f3d0']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-[#161828]/90 border border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-lg border border-indigo-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Trackable Share Link Builder
              </h2>
              <p className="text-xs text-slate-300">
                Create referral links for Discord, Reddit, or WhatsApp with automatic click logging.
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

        {/* Step 1: Target Selector (Entire Portfolio vs Specific Artwork) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            1. Select Link Destination
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTargetType('home')}
              className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-md ${
                targetType === 'home'
                  ? 'bg-indigo-600/25 border-indigo-500/60 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="text-xs font-bold">Entire Portfolio Gallery</div>
              <div className="text-[11px] text-slate-300">Full drawing showcase</div>
            </button>

            <button
              onClick={() => setTargetType('artwork')}
              className={`p-3.5 rounded-2xl border text-left transition-all backdrop-blur-md ${
                targetType === 'artwork'
                  ? 'bg-indigo-600/25 border-indigo-500/60 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="text-xs font-bold">Specific Drawing / Concept</div>
              <div className="text-[11px] text-slate-300">Opens artwork modal on load</div>
            </button>
          </div>

          {targetType === 'artwork' && (
            <div className="pt-2">
              <select
                value={targetArtId}
                onChange={(e) => setTargetArtId(e.target.value)}
                className="w-full bg-black/40 text-xs text-white border border-white/15 rounded-xl p-3 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              >
                {artworks.map((art) => (
                  <option key={art.id} value={art.id} className="bg-[#161828] text-white">
                    {art.title} ({art.medium})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Step 2: Platform Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            2. Choose Platform / Channel
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SOCIAL_PLATFORMS.map((plat) => (
              <button
                key={plat.id}
                onClick={() => setSelectedPlatform(plat.id)}
                className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all backdrop-blur-md ${
                  selectedPlatform === plat.id
                    ? `${plat.badgeBg} ${plat.borderColor} border-2 ${plat.textColor} font-bold shadow-md`
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-xs">{plat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Custom Campaign Tag */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-300 uppercase tracking-wider">
              3. Channel / Subreddit Tag (Optional)
            </label>
            <span className="text-slate-400">e.g. #art-critique or r/DigitalArt</span>
          </div>
          <input
            type="text"
            value={customCampaign}
            onChange={(e) => setCustomCampaign(e.target.value)}
            placeholder={platformConfig.defaultChannel}
            className="w-full bg-black/30 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
          />
        </div>

        {/* Generated Results Box */}
        <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-3 backdrop-blur-xl">
          
          {/* URL Box */}
          <div>
            <div className="text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Ready-To-Share Link (Auto-Tracked):</span>
              <span className="text-indigo-300 font-mono">UTM Source: {selectedPlatform}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 p-2 rounded-2xl border border-white/10">
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="flex-1 bg-transparent text-xs text-slate-200 font-mono focus:outline-none truncate px-2"
              />
              <button
                onClick={handleCopyUrl}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 border border-indigo-500/30"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied URL!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Message for Discord / Reddit */}
          <div>
            <div className="text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Pre-formatted Social Post ({platformConfig.name}):</span>
            </div>
            <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-line relative">
              {formattedPostText}
              <button
                onClick={handleCopyMessage}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15 active:scale-95"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'Copied Formatted Post!' : 'Copy Full Post Text'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
