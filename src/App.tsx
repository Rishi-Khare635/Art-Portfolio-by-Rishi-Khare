import React, { useState, useEffect, useMemo } from 'react';
import { 
  Artwork, 
  Comment 
} from './types';
import { Header } from './components/Header';
import { ArtistHero } from './components/ArtistHero';
import { GalleryGrid } from './components/GalleryGrid';
import { ArtworkModal } from './components/ArtworkModal';
import { UploadArtworkModal } from './components/UploadArtworkModal';
import { EditArtworkModal } from './components/EditArtworkModal';
import { OwnerLoginModal } from './components/OwnerLoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { AntiScreenshotShield } from './components/AntiScreenshotShield';
import { Shield, ShieldCheck, Lock } from 'lucide-react';
import { 
  getCachedArtworks,
  setCachedArtworks,
  getCachedComments,
  setCachedComments,
  subscribeToArtworks,
  subscribeToAllComments,
  toggleArtworkLikeInCloud,
  addArtworkToCloud,
  updateArtworkInCloud,
  deleteArtworkFromCloud,
  addCommentToCloud,
  likeCommentInCloud,
  deleteCommentFromCloud
} from './services/firebaseService';
import { hasActiveOwnerSession, endOwnerSession } from './services/authService';

const STORAGE_KEY_LIKES = 'rishikhare_liked_v5';

/**
 * Reconciles artworks and comments using only authentic data.
 * Does not generate any fake or placeholder comments.
 */
function reconcileArtworksAndComments(
  artworksList: Artwork[],
  existingComments: Record<string, Comment[]>
): { syncedArtworks: Artwork[]; syncedComments: Record<string, Comment[]> } {
  const syncedComments: Record<string, Comment[]> = {};
  
  // Only keep real, non-placeholder comments
  for (const [artId, list] of Object.entries(existingComments)) {
    if (Array.isArray(list)) {
      syncedComments[artId] = list.filter(c => !c.id?.startsWith('cmt-sync-'));
    }
  }

  let modified = false;
  const syncedArtworks = artworksList.map(art => {
    const list = syncedComments[art.id] || [];
    if (list.length > 0 && art.commentsCount !== list.length) {
      modified = true;
      return {
        ...art,
        commentsCount: list.length
      };
    }
    return art;
  });

  if (modified) {
    setCachedComments(syncedComments);
    setCachedArtworks(syncedArtworks);
  }

  return { syncedArtworks, syncedComments };
}

export default function App() {
  // 1. Core Data State (instant local storage cache + reconciliation + real-time cloud sync)
  const initialCacheArtworks = getCachedArtworks();
  const initialCacheComments = getCachedComments();
  const initialReconciled = reconcileArtworksAndComments(initialCacheArtworks, initialCacheComments);

  const [artworks, setArtworks] = useState<Artwork[]>(initialReconciled.syncedArtworks);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(initialReconciled.syncedComments);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);

  // 2. Personal liked status (stored locally for visitor)
  const [likedArtworkIds, setLikedArtworkIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LIKES);
      if (stored) return new Set(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
    return new Set<string>();
  });

  // 3. Owner Mode (Protected by Master Password)
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(() => hasActiveOwnerSession());

  // 4. Modals and Active Artwork
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [showOwnerLoginModal, setShowOwnerLoginModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showCopyrightAlert, setShowCopyrightAlert] = useState(false);

  // INITIALIZE FIREBASE & REAL-TIME LISTENERS
  useEffect(() => {
    // 1. Subscribe to Artworks in Real-Time
    const unsubArtworks = subscribeToArtworks(
      (cloudArtworks) => {
        setIsCloudConnected(true);
        setCommentsMap(currComments => {
          const { syncedArtworks, syncedComments } = reconcileArtworksAndComments(cloudArtworks, currComments);
          setArtworks(syncedArtworks);
          // Keep active selected artwork in sync
          setSelectedArtwork(curr => {
            if (!curr) return null;
            const matched = syncedArtworks.find(a => a.id === curr.id);
            return matched || null;
          });
          return syncedComments;
        });
      },
      () => {
        setIsCloudConnected(false);
      }
    );

    // 2. Subscribe to All Comments in Real-Time
    const unsubComments = subscribeToAllComments((cloudCommentsMap) => {
      setArtworks(currArtworks => {
        const { syncedArtworks, syncedComments } = reconcileArtworksAndComments(currArtworks, cloudCommentsMap);
        setCommentsMap(syncedComments);
        return syncedArtworks;
      });
    });

    return () => {
      unsubArtworks();
      unsubComments();
    };
  }, []);

  // Anti-Save / Screenshot Detection Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' || 
        ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S'))
      ) {
        setShowCopyrightAlert(true);
        setTimeout(() => setShowCopyrightAlert(false), 4500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter artworks by search query
  const filteredArtworks = useMemo(() => {
    return artworks.filter(art => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.description.toLowerCase().includes(q) ||
        art.medium.toLowerCase().includes(q) ||
        (art.tags && art.tags.some(t => t.toLowerCase().includes(q)))
      );
    });
  }, [artworks, searchQuery]);

  // Handle Likes (Synced to Cloud Firestore + Local Visitor Memory)
  const handleLikeArtwork = (artworkId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isCurrentlyLiked = likedArtworkIds.has(artworkId);
    const nextSet = new Set(likedArtworkIds);

    if (isCurrentlyLiked) {
      nextSet.delete(artworkId);
    } else {
      nextSet.add(artworkId);
    }
    setLikedArtworkIds(nextSet);

    try {
      localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(Array.from(nextSet)));
    } catch (err) {
      console.error(err);
    }

    // Optimistic UI update
    setArtworks(artList => 
      artList.map(item => {
        if (item.id === artworkId) {
          return {
            ...item,
            likesCount: isCurrentlyLiked ? Math.max(0, (item.likesCount || 1) - 1) : (item.likesCount || 0) + 1
          };
        }
        return item;
      })
    );

    // Sync to Cloud Database
    toggleArtworkLikeInCloud(artworkId, !isCurrentlyLiked);
  };

  // Handle Add Comment (Direct to Cloud Firestore + Instant Local Cache)
  const handleAddComment = async (
    artworkId: string, 
    authorName: string, 
    content: string, 
    isArtist?: boolean
  ) => {
    const cleanContent = content.trim();
    if (!cleanContent) return;

    const newComment: Comment = {
      id: 'cmt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8),
      artworkId,
      authorName: authorName.trim() || (isArtist ? 'Rishi Khare (Artist)' : 'Visitor'),
      authorHandle: isArtist ? '@artist' : '@visitor',
      content: cleanContent,
      timestamp: Date.now(),
      likes: 0,
      isArtist: Boolean(isArtist)
    };

    // Instant local state & cache update for comments
    setCommentsMap(prev => {
      const nextMap = {
        ...prev,
        [artworkId]: [newComment, ...(prev[artworkId] || [])]
      };
      setCachedComments(nextMap);
      return nextMap;
    });

    // Instant local state & cache update for artwork comment count
    setArtworks(artList => {
      const updated = artList.map(item => {
        if (item.id === artworkId) {
          return {
            ...item,
            commentsCount: (item.commentsCount || 0) + 1
          };
        }
        return item;
      });
      setCachedArtworks(updated);
      return updated;
    });

    // Send to Cloud Database safely (won't crash if quota reached)
    try {
      await addCommentToCloud(artworkId, newComment);
    } catch (e) {
      console.warn('Comment saved locally; cloud sync pending/limited:', e);
    }
  };

  // Handle Comment Upvote (Synced to Cloud + Local Cache)
  const handleLikeComment = (commentId: string) => {
    setCommentsMap(prev => {
      const nextMap = { ...prev };
      for (const artId in nextMap) {
        nextMap[artId] = nextMap[artId].map(c => 
          c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
        );
      }
      setCachedComments(nextMap);
      return nextMap;
    });

    try {
      likeCommentInCloud(commentId);
    } catch (e) {
      console.warn('Comment like saved locally; cloud sync pending:', e);
    }
  };

  // Handle Delete Comment (Owner Action + Local Cache)
  const handleDeleteComment = async (artworkId: string, commentId: string) => {
    if (!isOwnerMode) return;

    setCommentsMap(prev => {
      const nextMap = {
        ...prev,
        [artworkId]: (prev[artworkId] || []).filter(c => c.id !== commentId)
      };
      setCachedComments(nextMap);
      return nextMap;
    });

    setArtworks(artList => {
      const updated = artList.map(item => {
        if (item.id === artworkId) {
          return {
            ...item,
            commentsCount: Math.max(0, (item.commentsCount || 1) - 1)
          };
        }
        return item;
      });
      setCachedArtworks(updated);
      return updated;
    });

    try {
      await deleteCommentFromCloud(artworkId, commentId);
    } catch (e) {
      console.warn('Comment delete applied locally; cloud sync pending:', e);
    }
  };

  // Handle Add Artwork (Owner Action)
  const handleAddArtwork = async (newArt: Artwork) => {
    if (!isOwnerMode) return;
    await addArtworkToCloud(newArt);
    setArtworks(prev => {
      if (prev.some(a => a.id === newArt.id)) return prev;
      return [newArt, ...prev];
    });
  };

  // Handle Update Artwork (Owner Action)
  const handleUpdateArtwork = async (updatedArt: Artwork) => {
    if (!isOwnerMode) return;
    await updateArtworkInCloud(updatedArt);
    setArtworks(prev => prev.map(art => art.id === updatedArt.id ? updatedArt : art));
    if (selectedArtwork?.id === updatedArt.id) {
      setSelectedArtwork(updatedArt);
    }
  };

  // Handle Delete Artwork (Owner Action)
  const handleDeleteArtwork = async (artworkId: string) => {
    if (!isOwnerMode) return;
    setArtworks(prev => prev.filter(art => art.id !== artworkId));
    if (selectedArtwork?.id === artworkId) {
      setSelectedArtwork(null);
    }
    await deleteArtworkFromCloud(artworkId);
  };

  // Owner Authentication Handlers
  const handleOwnerLoginSuccess = () => {
    setIsOwnerMode(true);
  };

  const handleLogoutOwner = () => {
    endOwnerSession();
    setIsOwnerMode(false);
  };

  const totalLikesCount = artworks.reduce((acc, a) => acc + (a.likesCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col antialiased">
      
      {/* Navigation Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenUpload={() => {
          if (isOwnerMode) setShowUploadModal(true);
          else setShowOwnerLoginModal(true);
        }}
        isOwnerMode={isOwnerMode}
        onOpenOwnerLogin={() => setShowOwnerLoginModal(true)}
        onLogoutOwner={handleLogoutOwner}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Minimal Artist Hero Banner */}
        <ArtistHero
          artworksCount={artworks.length}
          totalLikes={totalLikesCount}
          onOpenUpload={() => setShowUploadModal(true)}
          isOwnerMode={isOwnerMode}
        />

        {/* Gallery Grid with Like and Comment Buttons */}
        <GalleryGrid
          artworks={filteredArtworks}
          onSelectArtwork={(art) => setSelectedArtwork(art)}
          onLikeArtwork={handleLikeArtwork}
          likedArtworkIds={likedArtworkIds}
          onResetFilters={() => setSearchQuery('')}
          onDeleteArtwork={isOwnerMode ? handleDeleteArtwork : undefined}
          onEditArtwork={isOwnerMode ? (art) => setEditingArtwork(art) : undefined}
          onOpenUpload={() => setShowUploadModal(true)}
          isOwnerMode={isOwnerMode}
        />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/10 bg-white/[0.01] py-8 mt-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200 font-display">Rishi Khare</span>
            <span>• Original Sketches & Anime Art</span>
            {isCloudConnected && (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firestore Live
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs">
            {isOwnerMode ? (
              <button 
                onClick={handleLogoutOwner} 
                className="flex items-center gap-1 text-emerald-400 hover:text-red-400 transition-colors font-medium"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Owner Mode Active (Click to Lock)</span>
              </button>
            ) : (
              <button 
                onClick={() => setShowOwnerLoginModal(true)} 
                className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Artist Access</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Full Screen Anti-Screenshot Blackout Shield & Attempt Tracker */}
      <AntiScreenshotShield />

      {/* MODALS */}
      {selectedArtwork && (
        <ArtworkModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onLike={handleLikeArtwork}
          hasLiked={likedArtworkIds.has(selectedArtwork.id)}
          comments={commentsMap[selectedArtwork.id] || []}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onDeleteComment={isOwnerMode ? handleDeleteComment : undefined}
          onDeleteArtwork={isOwnerMode ? handleDeleteArtwork : undefined}
          onEditArtwork={isOwnerMode ? (art) => setEditingArtwork(art) : undefined}
          isOwnerMode={isOwnerMode}
        />
      )}

      {/* Owner Login Modal */}
      <OwnerLoginModal
        isOpen={showOwnerLoginModal}
        onClose={() => setShowOwnerLoginModal(false)}
        onSuccess={handleOwnerLoginSuccess}
      />

      {/* Change Master Password Modal */}
      {isOwnerMode && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => setShowChangePasswordModal(false)}
        />
      )}

      {isOwnerMode && editingArtwork && (
        <EditArtworkModal
          artwork={editingArtwork}
          onClose={() => setEditingArtwork(null)}
          onUpdateArtwork={handleUpdateArtwork}
        />
      )}

      {isOwnerMode && showUploadModal && (
        <UploadArtworkModal
          onClose={() => setShowUploadModal(false)}
          onAddArtwork={handleAddArtwork}
        />
      )}

      {/* Floating Anti-Theft / Copyright Toast */}
      {showCopyrightAlert && (
        <div 
          role="alert" 
          className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl bg-[#141728]/95 border border-indigo-500/40 shadow-2xl backdrop-blur-xl animate-fade-in flex items-start gap-3 text-xs"
        >
          <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="font-bold text-white font-display mb-0.5">
              Protected Artwork • © Rishi Khare
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              All sketches and line drawings are protected intellectual property. Screenshots or reproductions without written permission are prohibited.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
