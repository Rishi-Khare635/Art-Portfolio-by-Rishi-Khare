import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  increment 
} from '../lib/firebase';
import { Artwork, Comment, InboxMessage } from '../types';

const ARTWORKS_COLLECTION = 'artworks';
const COMMENTS_COLLECTION = 'comments';
const INBOX_COLLECTION = 'inbox_messages';
const CACHE_KEY_ARTWORKS = 'rishikhare_artworks_cache_v1';

/**
 * Helper to get cached artworks for instant rendering on reload
 */
export function getCachedArtworks(): Artwork[] {
  try {
    const cached = localStorage.getItem(CACHE_KEY_ARTWORKS);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Failed to read artworks cache:', e);
  }
  return [];
}

/**
 * Helper to save artworks to local cache
 */
function setCachedArtworks(artworks: Artwork[]) {
  try {
    localStorage.setItem(CACHE_KEY_ARTWORKS, JSON.stringify(artworks));
  } catch (e) {
    // If local storage is full due to large base64 images, ignore cache error
    console.warn('Could not cache all artworks to localStorage:', e);
  }
}

/**
 * Real-time listener for all artworks
 */
export function subscribeToArtworks(
  onUpdate: (artworks: Artwork[]) => void,
  onError?: (err: Error) => void
) {
  const artworksRef = collection(db, ARTWORKS_COLLECTION);
  return onSnapshot(
    artworksRef,
    (snapshot) => {
      const list: Artwork[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Artwork;
        list.push({ ...data, id: docSnap.id });
      });
      // Sort by createdAt descending or featured
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setCachedArtworks(list);
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore realtime artworks error:', err);
      // Fallback to local cache if network error
      const cached = getCachedArtworks();
      if (cached.length > 0) {
        onUpdate(cached);
      }
      onError?.(err);
    }
  );
}

/**
 * Real-time listener for comments of a specific artwork
 */
export function subscribeToArtworkComments(
  artworkId: string,
  onUpdate: (comments: Comment[]) => void
) {
  const commentsRef = collection(db, COMMENTS_COLLECTION);
  return onSnapshot(commentsRef, (snapshot) => {
    const list: Comment[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Comment;
      if (data.artworkId === artworkId) {
        list.push({ ...data, id: docSnap.id });
      }
    });
    // Sort chronological descending
    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    onUpdate(list);
  });
}

/**
 * Real-time listener for all comments (grouped by artworkId)
 */
export function subscribeToAllComments(
  onUpdate: (commentsMap: Record<string, Comment[]>) => void
) {
  const commentsRef = collection(db, COMMENTS_COLLECTION);
  return onSnapshot(commentsRef, (snapshot) => {
    const map: Record<string, Comment[]> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Comment;
      const artId = data.artworkId;
      if (artId) {
        if (!map[artId]) map[artId] = [];
        map[artId].push({ ...data, id: docSnap.id });
      }
    });

    // Sort comments inside each list
    for (const artId of Object.keys(map)) {
      map[artId].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
    onUpdate(map);
  });
}

/**
 * Real-time listener for private inbox messages
 */
export function subscribeToInbox(
  onUpdate: (messages: InboxMessage[]) => void
) {
  const inboxRef = collection(db, INBOX_COLLECTION);
  return onSnapshot(inboxRef, (snapshot) => {
    const list: InboxMessage[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as InboxMessage;
      list.push({ ...data, id: docSnap.id });
    });
    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    onUpdate(list);
  });
}

/**
 * Toggle artwork like in cloud database
 */
export async function toggleArtworkLikeInCloud(
  artworkId: string, 
  incrementLike: boolean
): Promise<void> {
  try {
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await setDoc(artDocRef, {
      likesCount: increment(incrementLike ? 1 : -1)
    }, { merge: true });
  } catch (e) {
    console.error('Failed to update like in cloud:', e);
  }
}

/**
 * Increment view count
 */
export async function incrementArtworkViewInCloud(artworkId: string): Promise<void> {
  try {
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await setDoc(artDocRef, {
      viewsCount: increment(1)
    }, { merge: true });
  } catch (e) {
    console.warn('Failed to increment view count:', e);
  }
}

/**
 * Increment share count
 */
export async function incrementArtworkShareInCloud(artworkId: string): Promise<void> {
  try {
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await setDoc(artDocRef, {
      sharesCount: increment(1)
    }, { merge: true });
  } catch (e) {
    console.warn('Failed to increment share count:', e);
  }
}

/**
 * Add a new artwork directly to Firestore
 */
export async function addArtworkToCloud(artwork: Artwork): Promise<void> {
  try {
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artwork.id);
    await setDoc(artDocRef, {
      ...artwork,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.error('Error adding artwork to Firestore:', err);
    throw err;
  }
}

/**
 * Update an existing artwork in Firestore
 */
export async function updateArtworkInCloud(artwork: Artwork): Promise<void> {
  try {
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artwork.id);
    await setDoc(artDocRef, {
      ...artwork,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (err) {
    console.error('Error updating artwork in Firestore:', err);
    throw err;
  }
}

/**
 * Delete an artwork from cloud
 */
export async function deleteArtworkFromCloud(artworkId: string): Promise<void> {
  try {
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await deleteDoc(artDocRef);
  } catch (err) {
    console.error('Error deleting artwork from Firestore:', err);
    throw err;
  }
}

/**
 * Add comment to cloud
 */
export async function addCommentToCloud(artworkId: string, comment: Comment): Promise<void> {
  try {
    const commentDocRef = doc(db, COMMENTS_COLLECTION, comment.id);
    await setDoc(commentDocRef, {
      ...comment,
      createdAt: Date.now()
    });

    // Increment comment count on the artwork document
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await setDoc(artDocRef, {
      commentsCount: increment(1)
    }, { merge: true });
  } catch (e) {
    console.error('Failed to add comment to Firestore:', e);
  }
}

/**
 * Like comment
 */
export async function likeCommentInCloud(commentId: string): Promise<void> {
  try {
    const commentDocRef = doc(db, COMMENTS_COLLECTION, commentId);
    await setDoc(commentDocRef, {
      likes: increment(1)
    }, { merge: true });
  } catch (e) {
    console.error('Failed to upvote comment in Firestore:', e);
  }
}

/**
 * Send an inquiry message to private inbox
 */
export async function sendInboxMessageToCloud(msg: InboxMessage): Promise<void> {
  try {
    const msgDocRef = doc(db, INBOX_COLLECTION, msg.id);
    await setDoc(msgDocRef, {
      ...msg,
      createdAt: Date.now()
    });
  } catch (e) {
    console.error('Failed to send inbox message to Firestore:', e);
  }
}

/**
 * Mark inbox message as read
 */
export async function markInboxMessageReadInCloud(msgId: string): Promise<void> {
  try {
    const msgDocRef = doc(db, INBOX_COLLECTION, msgId);
    await setDoc(msgDocRef, {
      read: true
    }, { merge: true });
  } catch (e) {
    console.error('Failed to mark message as read in Firestore:', e);
  }
}

/**
 * Delete inbox message
 */
export async function deleteInboxMessageFromCloud(msgId: string): Promise<void> {
  try {
    const msgDocRef = doc(db, INBOX_COLLECTION, msgId);
    await deleteDoc(msgDocRef);
  } catch (e) {
    console.error('Failed to delete inbox message from Firestore:', e);
  }
}
