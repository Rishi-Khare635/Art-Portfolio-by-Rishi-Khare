import { PlatformSource } from '../types';

export interface SocialPlatformConfig {
  id: PlatformSource;
  name: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  icon: string; // lucide icon identifier or custom name
  description: string;
  defaultChannel: string;
  getShareUrl: (url: string, title: string, description?: string) => string | null;
  getFormattedMessage: (url: string, title: string, artistName: string) => string;
}

export const SOCIAL_PLATFORMS: SocialPlatformConfig[] = [
  {
    id: 'discord',
    name: 'Discord',
    badgeBg: 'bg-[#5865F2]/20',
    textColor: 'text-[#5865F2]',
    borderColor: 'border-[#5865F2]/30',
    icon: 'MessageSquare',
    description: 'Post to #art-share, community servers, or DM art critique groups',
    defaultChannel: '#art-portfolio',
    getShareUrl: () => null, // Discord uses clipboard or bot/webhook, we provide formatted rich markdown
    getFormattedMessage: (url, title, artistName) => 
      `**${title}** by ${artistName} 🎨\nCheck out my latest artwork & leave your feedback here:\n👉 ${url}`
  },
  {
    id: 'reddit',
    name: 'Reddit',
    badgeBg: 'bg-[#FF4500]/20',
    textColor: 'text-[#FF4500]',
    borderColor: 'border-[#FF4500]/30',
    icon: 'Flame',
    description: 'Post to r/Art, r/DigitalArt, r/Drawings, or r/Illustration',
    defaultChannel: 'r/DigitalArt',
    getShareUrl: (url, title) => 
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(`[OC] ${title} - College Portfolio Submission`)}`,
    getFormattedMessage: (url, title, artistName) => 
      `[OC] ${title} - Original drawing by ${artistName}. Portfolio link: ${url}`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    badgeBg: 'bg-[#25D366]/20',
    textColor: 'text-[#25D366]',
    borderColor: 'border-[#25D366]/30',
    icon: 'PhoneCall',
    description: 'Share directly to family, friends, or art school group chats',
    defaultChannel: 'Art Group Chat',
    getShareUrl: (url, title, desc) => 
      `https://api.whatsapp.com/send?text=${encodeURIComponent(`🎨 Hey! Take a look at my new artwork "${title}":\n${url}\n\n${desc || ''}`)}`,
    getFormattedMessage: (url, title) => 
      `Hey! Take a look at my artwork "${title}": ${url}`
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    badgeBg: 'bg-white/10',
    textColor: 'text-neutral-200',
    borderColor: 'border-neutral-700',
    icon: 'Twitter',
    description: 'Tweet with tags like #ArtCommunity #DigitalArtist #PortfolioDay',
    defaultChannel: '#PortfolioDay',
    getShareUrl: (url, title) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`✨ "${title}"\nExcited to share this piece from my portfolio! Thoughts & critique welcome 👇`)}&url=${encodeURIComponent(url)}&hashtags=art,drawing,illustration,portfolio`,
    getFormattedMessage: (url, title) => 
      `✨ "${title}" - check out my portfolio piece: ${url} #ArtCommunity`
  },
  {
    id: 'instagram',
    name: 'Instagram / Stories',
    badgeBg: 'bg-gradient-to-r from-[#833AB4]/20 via-[#FD1D1D]/20 to-[#FCB045]/20',
    textColor: 'text-[#FD1D1D]',
    borderColor: 'border-[#FD1D1D]/30',
    icon: 'Camera',
    description: 'Copy custom bio link or link sticker for Stories',
    defaultChannel: 'Bio Link & Story Sticker',
    getShareUrl: () => null,
    getFormattedMessage: (url, title) => 
      `New artwork added to my portfolio: "${title}" 🎨 Tap the link to view the full resolution & details: ${url}`
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    badgeBg: 'bg-[#E60023]/20',
    textColor: 'text-[#E60023]',
    borderColor: 'border-[#E60023]/30',
    icon: 'Pin',
    description: 'Pin artwork to visual moodboards and illustration discovery feeds',
    defaultChannel: 'Concept Art Board',
    getShareUrl: (url, title, desc) => 
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(`${title} - ${desc || 'Portfolio drawing'}`)}`,
    getFormattedMessage: (url, title) => 
      `Pin "${title}" directly: ${url}`
  }
];
