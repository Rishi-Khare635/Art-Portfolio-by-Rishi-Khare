import React, { useState, useEffect, useMemo } from 'react';
import { 
  Artwork, 
  Comment, 
  InboxMessage
} from './types';
import { INITIAL_ARTWORKS, INITIAL_COMMENTS } from './data/initialArtworks';
import { Header } from './components/Header';
import { ArtistHero } from './components/ArtistHero';
import { GalleryGrid } from './components/GalleryGrid';
import { ArtworkModal } from './components/ArtworkModal';
import { UploadArtworkModal } from './components/UploadArtworkModal';
import { EditArtworkModal } from './components/EditArtworkModal';
import { ContactQuestionModal } from './components/ContactQuestionModal';
import { PrivateInboxView } from './components/PrivateInboxView';
import { Shield, Lock } from 'lucide-react';

const STORAGE_KEY_ARTWORKS = 'rishikhare_artworks_v4';
const STORAGE_KEY_COMMENTS = 'rishikhare_comments_v4';
const STORAGE_KEY_LIKES = 'rishikhare_liked_v4';
const STORAGE_KEY_OWNER = 'rishikhare_owner_mode';
const STORAGE_KEY_INBOX = 'rishikhare_inbox_v1';

export default function App() {
  // 1. Core Data State
  const [artworks, setArtworks] = useState<Artwork[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ARTWORKS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ARTWORKS;
  });

  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMMENTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COMMENTS;
  });

  const [likedArtworkIds, setLikedArtworkIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LIKES);
      if (stored) return new Set(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
    return new Set<string>();
  });

  // 2. Private Inbox Messages State
  const [inboxMessages, setInboxMessages] = useState<InboxMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INBOX);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // 3. Owner / Artist Privacy State
  const [isOwnerMode, setIsOwnerMode] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('owner') === 'true' || urlParams.get('admin') === 'true') return true;
      return localStorage.getItem(STORAGE_KEY_OWNER) === 'true';
    } catch {
      return false;
    }
  });

  // Save owner mode preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OWNER, String(isOwnerMode));
    } catch (e) {
      console.error(e);
    }
  }, [isOwnerMode]);

  // 4. Navigation & View State
  const [currentView, setCurrentView] = useState<'gallery' | 'inbox'>('gallery');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 5. Modals State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCopyrightAlert, setShowCopyrightAlert] = useState(false);

  // Anti-Save / Screenshot Detection Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect PrintScreen or Save shortcut
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

  // Sync artworks to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ARTWORKS, JSON.stringify(artworks));
    } catch (e) {
      console.error(e);
    }
  }, [artworks]);

  // Sync comments to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(commentsMap));
    } catch (e) {
      console.error(e);
    }
  }, [commentsMap]);

  // Sync inbox messages to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INBOX, JSON.stringify(inboxMessages));
    } catch (e) {
      console.error(e);
    }
  }, [inboxMessages]);

  // Handle Send Question to Private Inbox
  const handleSendMessage = (msgData: Omit<InboxMessage, 'id' | 'timestamp' | 'read'>) => {
    const newMsg: InboxMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      read: false,
      ...msgData
    };
    setInboxMessages(prev => [newMsg, ...prev]);
  };

  // Handle Delete Inbox Message
  const handleDeleteMessage = (id: string) => {
    setInboxMessages(prev => prev.filter(m => m.id !== id));
  };

  // Handle Toggle Read Status
  const handleToggleRead = (id: string) => {
    setInboxMessages(prev => prev.map(m => m.id === id ? { ...m, read: !m.read } : m));
  };

  // Filter artworks strictly by search
  const filteredArtworks = useMemo(() => {
    return artworks.filter(art => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.description.toLowerCase().includes(q) ||
        art.tags.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [artworks, searchQuery]);

  // Likes & Interactions
  const handleLikeArtwork = (artworkId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setLikedArtworkIds(prev => {
      const next = new Set(prev);
      const isCurrentlyLiked = next.has(artworkId);

      if (isCurrentlyLiked) {
        next.delete(artworkId);
      } else {
        next.add(artworkId);
      }

      try {
        localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error(err);
      }

      setArtworks(artList => 
        artList.map(item => {
          if (item.id === artworkId) {
            return {
              ...item,
              likesCount: isCurrentlyLiked ? Math.max(0, item.likesCount - 1) : item.likesCount + 1
            };
          }
          return item;
        })
      );

      return next;
    });
  };

  const handleAddComment = (artworkId: string, authorName: string, content: string, isArtist?: boolean) => {
    const newComment: Comment = {
      id: 'cmt-' + Date.now(),
      artworkId,
      authorName: authorName.trim() || 'Fellow Artist',
      content: content.trim(),
      timestamp: Date.now(),
      likes: 0,
      isArtist: Boolean(isArtist)
    };

    setCommentsMap(prev => ({
      ...prev,
      [artworkId]: [newComment, ...(prev[artworkId] || [])]
    }));

    setArtworks(artList => 
      artList.map(item => {
        if (item.id === artworkId) {
          return { ...item, commentsCount: (item.commentsCount || 0) + 1 };
        }
        return item;
      })
    );
  };

  const handleLikeComment = (artworkId: string, commentId: string) => {
    setCommentsMap(prev => {
      const artComments = prev[artworkId] || [];
      return {
        ...prev,
        [artworkId]: artComments.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c)
      };
    });
  };

  const handleAddArtwork = (newArt: Artwork) => {
    setArtworks(prev => [newArt, ...prev]);
    setShowUploadModal(false);
  };

  const handleUpdateArtwork = (updatedArt: Artwork) => {
    setArtworks(prev => prev.map(art => art.id === updatedArt.id ? updatedArt : art));
    if (selectedArtwork?.id === updatedArt.id) {
      setSelectedArtwork(updatedArt);
    }
    setEditingArtwork(null);
  };

  const handleDeleteArtwork = (artworkId: string) => {
    setArtworks(prev => prev.filter(art => art.id !== artworkId));
    if (selectedArtwork?.id === artworkId) {
      setSelectedArtwork(null);
    }
  };

  const unreadMessagesCount = inboxMessages.filter(m => !m.read).length;
  const totalLikesCount = artworks.reduce((acc, a) => acc + a.likesCount, 0);

  return (
    <div className="min-h-screen bg-[#0d0f1a] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col antialiased">
      
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenUpload={() => setShowUploadModal(true)}
        onOpenContact={() => setShowContactModal(true)}
        unreadCount={unreadMessagesCount}
        isOwnerMode={isOwnerMode}
        setIsOwnerMode={setIsOwnerMode}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1">
        {currentView === 'inbox' && isOwnerMode ? (
          /* Private Owner Inbox */
          <PrivateInboxView
            messages={inboxMessages}
            onDeleteMessage={handleDeleteMessage}
            onToggleRead={handleToggleRead}
            onBackToGallery={() => setCurrentView('gallery')}
            onOpenUpload={() => setShowUploadModal(true)}
          />
        ) : (
          <div>
            {/* Minimal Artist Hero Banner (No face, no category buttons) */}
            <ArtistHero
              artworksCount={artworks.length}
              totalLikes={totalLikesCount}
              onOpenQuestionModal={() => setShowContactModal(true)}
              onOpenUpload={() => setShowUploadModal(true)}
              onOpenInbox={() => setCurrentView('inbox')}
              unreadCount={unreadMessagesCount}
              isOwnerMode={isOwnerMode}
            />

            {/* Gallery Grid */}
            <GalleryGrid
              artworks={filteredArtworks}
              onSelectArtwork={(art) => setSelectedArtwork(art)}
              onLikeArtwork={handleLikeArtwork}
              onShareQuick={() => setShowContactModal(true)}
              likedArtworkIds={likedArtworkIds}
              onResetFilters={() => setSearchQuery('')}
              onDeleteArtwork={handleDeleteArtwork}
              onEditArtwork={(art) => setEditingArtwork(art)}
              isOwnerMode={isOwnerMode}
            />
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-white/10 bg-white/[0.01] py-8 mt-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200 font-display">Rishi Khare</span>
            <span>• Anime Sketches & Line Art</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button 
              onClick={() => setShowContactModal(true)} 
              className="hover:text-slate-200 transition-colors"
            >
              Ask a Question
            </button>
            {isOwnerMode && (
              <button 
                onClick={() => setCurrentView(currentView === 'inbox' ? 'gallery' : 'inbox')} 
                className="hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <span>Private Inbox</span>
                {unreadMessagesCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-pink-500 text-white">
                    {unreadMessagesCount}
                  </span>
                )}
              </button>
            )}
            <button 
              onClick={() => setIsOwnerMode(!isOwnerMode)} 
              className="hover:text-indigo-300 transition-colors"
            >
              {isOwnerMode ? '🔒 Exit Owner Mode' : '🔑 Owner Mode'}
            </button>
          </div>
        </div>
      </footer>

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
          currentReferralSource={'direct'}
          onShareTracked={() => {}}
          onDeleteArtwork={handleDeleteArtwork}
          onEditArtwork={(art) => setEditingArtwork(art)}
          isOwnerMode={isOwnerMode}
        />
      )}

      {editingArtwork && (
        <EditArtworkModal
          artwork={editingArtwork}
          onClose={() => setEditingArtwork(null)}
          onUpdateArtwork={handleUpdateArtwork}
        />
      )}

      {showUploadModal && (
        <UploadArtworkModal
          onClose={() => setShowUploadModal(false)}
          onAddArtwork={handleAddArtwork}
        />
      )}

      {showContactModal && (
        <ContactQuestionModal
          onClose={() => setShowContactModal(false)}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Floating Copyright & Anti-Theft Toast */}
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
