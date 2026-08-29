import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  ArrowUpRight, 
  ExternalLink, 
  Sparkles, 
  Flame, 
  Radio, 
  Copy, 
  Check, 
  Calendar,
  Layers,
  Award,
  RefreshCw,
  Zap,
  Globe,
  Filter
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { AnalyticsSummary, Artwork, TrackingClickEvent, PlatformSource } from '../types';
import { generateShareUrl } from '../utils/analytics';
import confetti from 'canvas-confetti';

interface AnalyticsDashboardProps {
  analytics: AnalyticsSummary;
  artworks: Artwork[];
  onSelectArtwork: (artwork: Artwork) => void;
  onSimulateClick: (source: PlatformSource, artId?: string) => void;
  onOpenLinkGenerator: () => void;
}

const SOURCE_COLORS: Record<string, string> = {
  discord: '#5865F2',
  reddit: '#FF4500',
  whatsapp: '#25D366',
  twitter: '#38bdf8',
  instagram: '#e1306c',
  pinterest: '#e60023',
  direct: '#a855f7',
  other: '#71717a'
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  artworks,
  onSelectArtwork,
  onSimulateClick,
  onOpenLinkGenerator
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | 'all'>('7d');
  const [copiedReport, setCopiedReport] = useState(false);

  // Compute artwork popularity score
  const rankedArtworks = [...artworks].map(art => {
    // Viral/Popularity index formula
    const score = (art.viewsCount * 1) + (art.likesCount * 4) + (art.sharesCount * 8) + (art.commentsCount * 6);
    const engagementRate = art.viewsCount > 0 ? (((art.likesCount + art.commentsCount + art.sharesCount) / art.viewsCount) * 100).toFixed(1) : '0.0';
    return {
      ...art,
      score,
      engagementRate
    };
  }).sort((a, b) => b.score - a.score);

  // Prepare Pie Chart Data
  const pieData = (Object.entries(analytics.sourceBreakdown) as [PlatformSource, number][])
    .filter(([_, count]) => count > 0)
    .map(([source, count]) => ({
      name: source.toUpperCase(),
      sourceKey: source,
      value: count,
      color: SOURCE_COLORS[source] || '#71717a'
    }));

  const totalLinkClicks = (Object.values(analytics.sourceBreakdown) as number[]).reduce((a, b) => a + b, 0);

  // Export college application analytics report
  const handleExportReport = () => {
    const discordClicks = Number(analytics.sourceBreakdown.discord || 0);
    const redditClicks = Number(analytics.sourceBreakdown.reddit || 0);
    const waClicks = Number(analytics.sourceBreakdown.whatsapp || 0);
    const directClicks = Number(analytics.sourceBreakdown.direct || 0) + Number(analytics.sourceBreakdown.twitter || 0);

    const report = `=== ARTVault ARTIST PORTFOLIO ANALYTICS REPORT ===
Artist: Rishi Khare (2026 Admissions Portfolio)
Generated: ${new Date().toLocaleDateString()}

[EXHIBITION PERFORMANCE SUMMARY]
• Total Art Portfolio Views: ${analytics.totalViews.toLocaleString()}
• Unique Link Visitors: ${analytics.totalUniqueVisitors.toLocaleString()}
• Total Community Likes: ${analytics.totalLikes.toLocaleString()}
• Total Social Link Clicks: ${totalLinkClicks.toLocaleString()}
• Total Critiques & Comments: ${analytics.totalComments}

[REFERRAL PLATFORM BREAKDOWN]
• Discord Communities: ${discordClicks} clicks (${totalLinkClicks > 0 ? Math.round((discordClicks / totalLinkClicks) * 100) : 0}%)
• Reddit Threads (r/DigitalArt): ${redditClicks} clicks (${totalLinkClicks > 0 ? Math.round((redditClicks / totalLinkClicks) * 100) : 0}%)
• WhatsApp Art Groups: ${waClicks} clicks (${totalLinkClicks > 0 ? Math.round((waClicks / totalLinkClicks) * 100) : 0}%)
• Direct & Other Inquiries: ${directClicks} clicks

[TOP 3 MOST ACCLAIMED ARTWORKS]
1. "${rankedArtworks[0]?.title}" (${rankedArtworks[0]?.viewsCount} views, ${rankedArtworks[0]?.likesCount} likes, ${rankedArtworks[0]?.commentsCount} comments)
2. "${rankedArtworks[1]?.title}" (${rankedArtworks[1]?.viewsCount} views, ${rankedArtworks[1]?.likesCount} likes, ${rankedArtworks[1]?.commentsCount} comments)
3. "${rankedArtworks[2]?.title}" (${rankedArtworks[2]?.viewsCount} views, ${rankedArtworks[2]?.likesCount} likes, ${rankedArtworks[2]?.commentsCount} comments)
`;

    navigator.clipboard.writeText(report);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);

    confetti({
      particleCount: 25,
      spread: 40,
      colors: ['#10b981', '#34d399', '#6ee7b7']
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5 backdrop-blur-md">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Real-Time Audience Telemetry
            </span>
            <span className="text-xs text-slate-400">Live link tracking active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Artist Growth & Link Analytics
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Monitor real-time clicks from Discord, Reddit, and WhatsApp. Track which artworks are gaining traction, highest engagement rates, and viewer retention.
          </p>
        </div>

        {/* Action buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenLinkGenerator}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all flex items-center gap-2 border border-indigo-500/40 active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Create Trackable Link</span>
          </button>

          <button
            onClick={handleExportReport}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-white/15 backdrop-blur-md transition-all flex items-center gap-2 active:scale-95 shadow-sm"
            title="Export summary to clipboard for college admissions or resume"
          >
            {copiedReport ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Report Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Export College Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Pageviews */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Pageviews</span>
            <div className="p-1.5 rounded-xl bg-white/10 text-indigo-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {analytics.totalViews.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>+24.8% this week</span>
            </div>
          </div>
        </div>

        {/* Discord Clicks */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-[#5865F2]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="text-[#5865F2] font-bold">Discord Clicks</span>
            <div className="p-1.5 rounded-xl bg-[#5865F2]/20 text-[#5865F2]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {analytics.sourceBreakdown.discord || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              #art-share & DMs
            </div>
          </div>
        </div>

        {/* Reddit Clicks */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-[#FF4500]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="text-[#FF4500] font-bold">Reddit Clicks</span>
            <div className="p-1.5 rounded-xl bg-[#FF4500]/20 text-[#FF4500]">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {analytics.sourceBreakdown.reddit || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              r/Art & r/DigitalArt
            </div>
          </div>
        </div>

        {/* WhatsApp Clicks */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-[#25D366]/40 backdrop-blur-xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="text-[#25D366] font-bold">WhatsApp Clicks</span>
            <div className="p-1.5 rounded-xl bg-[#25D366]/20 text-[#25D366]">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {analytics.sourceBreakdown.whatsapp || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Direct & Group Chats
            </div>
          </div>
        </div>

        {/* Total Appreciations / Likes */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between col-span-2 lg:col-span-1 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Likes</span>
            <div className="p-1.5 rounded-xl bg-pink-500/20 text-pink-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              {analytics.totalLikes.toLocaleString()}
            </div>
            <div className="text-[11px] text-pink-400 mt-1 font-semibold">
              {analytics.totalComments} critiques posted
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Traffic Timeline Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Weekly Link Traffic by Platform
              </h3>
              <p className="text-xs text-slate-400">
                Daily link accesses and referral influx over the past 7 days
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5865F2]"></span> Discord
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500]"></span> Reddit
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]"></span> WhatsApp
              </span>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyViews}>
                <defs>
                  <linearGradient id="discordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5865F2" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#5865F2" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="redditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4500" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#FF4500" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="waGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#25D366" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#25D366" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20, 22, 37, 0.95)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '1rem', fontSize: '12px', backdropFilter: 'blur(12px)', color: '#fff' }}
                />
                <Area type="monotone" dataKey="discord" stackId="1" stroke="#5865F2" fill="url(#discordGrad)" />
                <Area type="monotone" dataKey="reddit" stackId="1" stroke="#FF4500" fill="url(#redditGrad)" />
                <Area type="monotone" dataKey="whatsapp" stackId="1" stroke="#25D366" fill="url(#waGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Referral Breakdown Pie Chart (1 col) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-base font-bold text-white font-display">
              Referral Source Share
            </h3>
            <p className="text-xs text-slate-400">
              Where your art portfolio visitors are arriving from
            </p>
          </div>

          <div className="h-48 sm:h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20, 22, 37, 0.95)', borderColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '1rem', fontSize: '12px', backdropFilter: 'blur(12px)', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/5">
                <span className="flex items-center gap-1.5 text-slate-300 truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-bold text-white ml-2">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* REAL-TIME ARTWORK POPULARITY LEADERBOARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white font-display">
                Real-Time Artwork Popularity Leaderboard
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Ranked dynamically by total view velocity, likes, community discussions, and link shares
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300 self-start sm:self-auto border border-white/15 backdrop-blur-md">
            Top Performing Portfolio Pieces
          </span>
        </div>

        {/* Table of ranked artworks */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Artwork Title</th>
                <th className="pb-3">Medium</th>
                <th className="pb-3 text-right">Views</th>
                <th className="pb-3 text-right">Likes</th>
                <th className="pb-3 text-right">Shares</th>
                <th className="pb-3 text-right">Comments</th>
                <th className="pb-3 text-right">Engagement</th>
                <th className="pb-3 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rankedArtworks.map((art, idx) => (
                <tr 
                  key={art.id} 
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => onSelectArtwork(art)}
                >
                  {/* Rank Column */}
                  <td className="py-3 pl-2 font-bold">
                    {idx === 0 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-extrabold text-xs">
                        1
                      </span>
                    ) : idx === 1 ? (
                      <span className="w-6 h-6 rounded-full bg-slate-300/20 text-slate-200 border border-slate-400/40 flex items-center justify-center font-extrabold text-xs">
                        2
                      </span>
                    ) : idx === 2 ? (
                      <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-400 border border-amber-700/40 flex items-center justify-center font-extrabold text-xs">
                        3
                      </span>
                    ) : (
                      <span className="text-slate-400 pl-2">#{idx + 1}</span>
                    )}
                  </td>

                  {/* Artwork Preview + Title */}
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={art.imageUrl} 
                        alt={art.title}
                        className="w-10 h-10 rounded-xl object-cover bg-black/40 flex-shrink-0 border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {art.title}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span>{art.year}</span>
                          <span>•</span>
                          <span className="text-indigo-300 font-mono">Score: {art.score}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Medium */}
                  <td className="py-3 text-slate-300">{art.medium}</td>

                  {/* Views */}
                  <td className="py-3 text-right font-semibold text-slate-200 font-mono">
                    {art.viewsCount.toLocaleString()}
                  </td>

                  {/* Likes */}
                  <td className="py-3 text-right font-semibold text-pink-400 font-mono">
                    {art.likesCount}
                  </td>

                  {/* Shares */}
                  <td className="py-3 text-right font-semibold text-slate-300 font-mono">
                    {art.sharesCount}
                  </td>

                  {/* Comments */}
                  <td className="py-3 text-right font-semibold text-slate-300 font-mono">
                    {art.commentsCount}
                  </td>

                  {/* Engagement Rate */}
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      {art.engagementRate}%
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 text-right pr-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectArtwork(art);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] font-semibold border border-white/15"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIVE EVENT LOG & SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live Event Stream (2 cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-base font-bold text-white font-display">
                Live Link Influx & Activity Stream
              </h3>
            </div>
            <span className="text-xs text-slate-400">Real-time referral log</span>
          </div>

          {/* Event Stream List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {analytics.recentEvents.slice(0, 10).map((evt) => (
              <div 
                key={evt.id}
                className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase"
                    style={{ 
                      backgroundColor: `${SOURCE_COLORS[evt.source] || '#71717a'}25`, 
                      color: SOURCE_COLORS[evt.source] || '#ffffff',
                      border: `1px solid ${SOURCE_COLORS[evt.source] || '#71717a'}50`
                    }}
                  >
                    {evt.source}
                  </span>
                  <div>
                    <span className="text-slate-300">
                      Visited <span className="font-bold text-white">"{evt.targetArtworkTitle}"</span>
                    </span>
                    <div className="text-[10px] text-slate-400">{evt.campaign}</div>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Simulator Test Box (1 col) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-1.5 text-amber-400 mb-1">
              <Zap className="w-4 h-4" />
              <h3 className="text-base font-bold text-white font-display">
                Test Real-Time Tracking
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Simulate someone clicking your shared link from Discord, Reddit, or WhatsApp to see metrics update instantly.
            </p>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => onSimulateClick('discord', artworks[0]?.id)}
              className="w-full p-3 rounded-2xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#5865F2] border border-[#5865F2]/40 text-xs font-bold transition-all flex items-center justify-between backdrop-blur-md active:scale-95 shadow-sm"
            >
              <span>Simulate Discord Click</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSimulateClick('reddit', artworks[1]?.id)}
              className="w-full p-3 rounded-2xl bg-[#FF4500]/20 hover:bg-[#FF4500]/30 text-[#FF4500] border border-[#FF4500]/40 text-xs font-bold transition-all flex items-center justify-between backdrop-blur-md active:scale-95 shadow-sm"
            >
              <span>Simulate Reddit Click</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSimulateClick('whatsapp', artworks[2]?.id)}
              className="w-full p-3 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-bold transition-all flex items-center justify-between backdrop-blur-md active:scale-95 shadow-sm"
            >
              <span>Simulate WhatsApp Click</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-slate-300 backdrop-blur-md">
            💡 Pro-tip: You can paste your link into any browser window with <code className="text-indigo-300 font-mono">?ref=discord</code> to test live external visits!
          </div>
        </div>

      </div>

    </div>
  );
};
