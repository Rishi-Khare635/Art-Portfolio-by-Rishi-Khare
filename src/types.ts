export interface InboxMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  subject?: string;
  question: string;
  timestamp: number;
  read: boolean;
}

export type MediumType = 
  | 'Character Sketches' 
  | 'Manga & Line Art' 
  | 'Digital Anime' 
  | 'Concept & OC' 
  | 'Traditional Ink' 
  | 'Speed Sketches'
  | 'Digital Painting' 
  | 'Ink & Sketch' 
  | 'Character Design' 
  | 'Concept Art';

export interface Comment {
  id: string;
  artworkId: string;
  authorName: string;
  authorHandle?: string;
  avatarUrl?: string;
  content: string;
  timestamp: number; // Unix timestamp ms
  likes: number;
  replies?: Comment[];
  isArtist?: boolean;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  medium: MediumType;
  toolsUsed: string[];
  dimensions?: string;
  year: number;
  tags: string[];
  featured?: boolean;
  likesCount: number;
  viewsCount: number;
  sharesCount: number;
  commentsCount: number;
  createdAt: number;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  forSale?: boolean;
  price?: string;
}

export type PlatformSource = 
  | 'discord' 
  | 'reddit' 
  | 'whatsapp' 
  | 'twitter' 
  | 'instagram' 
  | 'pinterest' 
  | 'telegram' 
  | 'linkedin' 
  | 'direct' 
  | 'other';

export interface TrackingClickEvent {
  id: string;
  timestamp: number;
  source: PlatformSource;
  campaign?: string;
  targetArtworkId?: string;
  targetArtworkTitle?: string;
  path: string;
  userAgent?: string;
  referrer?: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalUniqueVisitors: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  sourceBreakdown: Record<PlatformSource, number>;
  dailyViews: { date: string; views: number; discord: number; reddit: number; whatsapp: number; other: number }[];
  hourlyActivity: { hour: string; clicks: number }[];
  recentEvents: TrackingClickEvent[];
}

export interface ShareConfig {
  platform: PlatformSource;
  name: string;
  iconName: string;
  color: string;
  badgeBg: string;
  generateUrl: (baseUrl: string, artwork?: Artwork, campaign?: string) => string;
}
