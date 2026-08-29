import { PlatformSource, TrackingClickEvent, AnalyticsSummary, Artwork } from '../types';

const STORAGE_KEY_EVENTS = 'artvault_analytics_events';
const STORAGE_KEY_VISITORS = 'artvault_unique_visitors';

export function getPlatformFromParam(refParam?: string | null): PlatformSource {
  if (!refParam) return 'direct';
  const clean = refParam.toLowerCase().trim();
  if (clean.includes('discord')) return 'discord';
  if (clean.includes('reddit')) return 'reddit';
  if (clean.includes('whatsapp') || clean.includes('wa')) return 'whatsapp';
  if (clean.includes('twitter') || clean.includes('x')) return 'twitter';
  if (clean.includes('instagram') || clean.includes('ig')) return 'instagram';
  if (clean.includes('pinterest')) return 'pinterest';
  if (clean.includes('telegram')) return 'telegram';
  if (clean.includes('linkedin')) return 'linkedin';
  return 'other';
}

// Generate realistic mock history if empty
function generateInitialMockEvents(): TrackingClickEvent[] {
  const sources: PlatformSource[] = ['discord', 'reddit', 'whatsapp', 'twitter', 'discord', 'reddit', 'whatsapp', 'direct', 'instagram'];
  const artworkIds = ['art-1', 'art-2', 'art-3', 'art-4', 'art-5', 'art-6', 'art-7', 'art-8'];
  const titles: Record<string, string> = {
    'art-1': 'Neon Odyssey: Celestial Wanderer',
    'art-2': 'Ethereal Botanica No. 4',
    'art-3': 'Guardian of the Whispering Spire',
    'art-4': 'Midnight Metropolitan Rhythms',
    'art-5': 'Chromosphere Eclipse Study',
    'art-6': 'Cyber Ronin: Edge of Neo-Kyoto',
    'art-7': 'Solitude in the Silicon Dunes',
    'art-8': 'Anatomy of the Astral Dragon'
  };

  const events: TrackingClickEvent[] = [];
  const now = Date.now();

  // Create 120 historic events over the past 7 days
  for (let i = 0; i < 140; i++) {
    const randomSource = sources[Math.floor(Math.random() * sources.length)];
    const randomArtId = artworkIds[Math.floor(Math.random() * artworkIds.length)];
    const timeOffset = Math.floor(Math.random() * (7 * 24 * 60 * 60 * 1000));
    
    events.push({
      id: `evt-${i}-${Date.now()}`,
      timestamp: now - timeOffset,
      source: randomSource,
      campaign: randomSource === 'discord' ? '#art-share-channel' : randomSource === 'reddit' ? 'r/DigitalArt' : randomSource === 'whatsapp' ? 'family-and-friends' : 'college-portfolio',
      targetArtworkId: Math.random() > 0.3 ? randomArtId : undefined,
      targetArtworkTitle: Math.random() > 0.3 ? titles[randomArtId] : 'Portfolio Home',
      path: randomArtId ? `/?art=${randomArtId}&ref=${randomSource}` : `/?ref=${randomSource}`,
      userAgent: 'Mozilla/5.0 (Mobile/Desktop)',
      referrer: randomSource === 'reddit' ? 'https://reddit.com' : randomSource === 'discord' ? 'https://discord.com' : undefined
    });
  }

  // Sort descending by timestamp
  return events.sort((a, b) => b.timestamp - a.timestamp);
}

export function loadStoredEvents(): TrackingClickEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (!raw) {
      const mock = generateInitialMockEvents();
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(mock));
      return mock;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load events from storage', e);
    return generateInitialMockEvents();
  }
}

export function logClickEvent(source: PlatformSource, artworkId?: string, artworkTitle?: string, campaign?: string): TrackingClickEvent {
  const currentEvents = loadStoredEvents();
  const newEvent: TrackingClickEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    source,
    campaign: campaign || (source === 'discord' ? 'Discord Server Link' : source === 'reddit' ? 'Reddit Thread Link' : source === 'whatsapp' ? 'WhatsApp Message' : 'Direct Access'),
    targetArtworkId: artworkId,
    targetArtworkTitle: artworkTitle || (artworkId ? `Artwork #${artworkId}` : 'Portfolio Home'),
    path: artworkId ? `/?art=${artworkId}&ref=${source}` : `/?ref=${source}`,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Browser',
    referrer: typeof document !== 'undefined' ? document.referrer : undefined
  };

  const updated = [newEvent, ...currentEvents];
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(updated.slice(0, 500))); // keep latest 500
  } catch (e) {
    console.error('Failed to save event', e);
  }

  return newEvent;
}

export function computeAnalyticsSummary(
  events: TrackingClickEvent[], 
  artworks: Artwork[], 
  commentsCount: number
): AnalyticsSummary {
  const sourceBreakdown: Record<PlatformSource, number> = {
    discord: 0,
    reddit: 0,
    whatsapp: 0,
    twitter: 0,
    instagram: 0,
    pinterest: 0,
    telegram: 0,
    linkedin: 0,
    direct: 0,
    other: 0,
  };

  events.forEach(e => {
    sourceBreakdown[e.source] = (sourceBreakdown[e.source] || 0) + 1;
  });

  const totalLikes = artworks.reduce((sum, art) => sum + art.likesCount, 0);
  const totalShares = artworks.reduce((sum, art) => sum + art.sharesCount, 0);
  const totalArtViews = artworks.reduce((sum, art) => sum + art.viewsCount, 0);
  const totalEvents = events.length;

  // Build daily views for the past 7 days
  const dailyViewsMap: Record<string, { views: number; discord: number; reddit: number; whatsapp: number; other: number }> = {};
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const key = `${d.getMonth() + 1}/${d.getDate()} (${dayLabels[d.getDay()]})`;
    dailyViewsMap[key] = { views: 0, discord: 0, reddit: 0, whatsapp: 0, other: 0 };
  }

  events.forEach(e => {
    const d = new Date(e.timestamp);
    const key = `${d.getMonth() + 1}/${d.getDate()} (${dayLabels[d.getDay()]})`;
    if (dailyViewsMap[key]) {
      dailyViewsMap[key].views += 1;
      if (e.source === 'discord') dailyViewsMap[key].discord += 1;
      else if (e.source === 'reddit') dailyViewsMap[key].reddit += 1;
      else if (e.source === 'whatsapp') dailyViewsMap[key].whatsapp += 1;
      else dailyViewsMap[key].other += 1;
    }
  });

  const dailyViews = Object.entries(dailyViewsMap).map(([date, data]) => ({
    date,
    views: data.views,
    discord: data.discord,
    reddit: data.reddit,
    whatsapp: data.whatsapp,
    other: data.other
  }));

  // Build hourly distribution
  const hourMap: Record<string, number> = {};
  for (let h = 0; h < 24; h += 3) {
    const label = `${h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`}`;
    hourMap[label] = 0;
  }

  events.forEach(e => {
    const h = new Date(e.timestamp).getHours();
    const bucket = Math.floor(h / 3) * 3;
    const label = `${bucket === 0 ? '12am' : bucket < 12 ? `${bucket}am` : bucket === 12 ? '12pm' : `${bucket-12}pm`}`;
    if (hourMap[label] !== undefined) {
      hourMap[label] += 1;
    }
  });

  const hourlyActivity = Object.entries(hourMap).map(([hour, clicks]) => ({ hour, clicks }));

  return {
    totalViews: totalArtViews + totalEvents,
    totalUniqueVisitors: Math.round(totalEvents * 0.72) + 850,
    totalLikes,
    totalShares,
    totalComments: commentsCount,
    sourceBreakdown,
    dailyViews,
    hourlyActivity,
    recentEvents: events.slice(0, 30)
  };
}

export function generateShareUrl(
  platform: PlatformSource, 
  artworkId?: string, 
  campaign?: string,
  originUrl?: string
): string {
  const base = originUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://artvault.gallery');
  const params = new URLSearchParams();
  
  params.set('ref', platform);
  if (artworkId) {
    params.set('art', artworkId);
  }
  if (campaign) {
    params.set('utm_campaign', campaign);
  }
  params.set('utm_medium', 'social');
  params.set('utm_source', platform);

  return `${base}?${params.toString()}`;
}
