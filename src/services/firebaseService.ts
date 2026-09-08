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
const CACHE_KEY_COMMENTS = 'rishikhare_comments_cache_v2';

/**
 * Strips undefined properties recursively so Firestore setDoc never throws an invalid data error
 */
function sanitizeForFirestore<T>(data: T): Record<string, any> {
  const clean = (obj: any): any => {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) {
      return obj.map(clean).filter((v) => v !== undefined);
    }
    if (typeof obj === 'object') {
      const res: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        if (val !== undefined) {
          res[key] = clean(val);
        }
      }
      return res;
    }
    return obj;
  };
  return clean(data) || {};
}

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
export function setCachedArtworks(artworks: Artwork[]) {
  try {
    localStorage.setItem(CACHE_KEY_ARTWORKS, JSON.stringify(artworks));
  } catch (e) {
    // If local storage is full due to large base64 images, ignore cache error
    console.warn('Could not cache all artworks to localStorage:', e);
  }
}

/**
 * Helper to get cached comments for instant rendering on reload
 */
export function getCachedComments(): Record<string, Comment[]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY_COMMENTS);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read comments cache:', e);
  }
  return {};
}

/**
 * Helper to save comments to local cache
 */
export function setCachedComments(commentsMap: Record<string, Comment[]>) {
  try {
    localStorage.setItem(CACHE_KEY_COMMENTS, JSON.stringify(commentsMap));
  } catch (e) {
    console.warn('Could not cache comments to localStorage:', e);
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
  onUpdate: (commentsMap: Record<string, Comment[]>) => void,
  onError?: (err: Error) => void
) {
  // 1. Immediately push cached comments so modal never shows 0 comments if data exists
  const initialCache = getCachedComments();
  if (Object.keys(initialCache).length > 0) {
    onUpdate(initialCache);
  }

  const commentsRef = collection(db, COMMENTS_COLLECTION);
  return onSnapshot(
    commentsRef, 
    (snapshot) => {
      // Start with existing cache to preserve any offline/pending items
      const map: Record<string, Comment[]> = { ...getCachedComments() };
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        const artId = data.artworkId;
        if (artId) {
          if (!map[artId]) map[artId] = [];
          
          // Parse timestamp safely (number, Firestore Timestamp, or date string)
          const millis = typeof data.timestamp === 'number'
            ? data.timestamp
            : typeof data.timestamp?.toMillis === 'function'
              ? data.timestamp.toMillis()
              : typeof data.timestamp?.seconds === 'number'
                ? data.timestamp.seconds * 1000
                : typeof data.createdAt === 'number'
                  ? data.createdAt
                  : Date.now();

          const formattedComment: Comment = {
            id: docSnap.id,
            artworkId: artId,
            authorName: data.authorName || 'Visitor',
            authorHandle: data.authorHandle || '@visitor',
            avatarUrl: data.avatarUrl,
            content: data.content || '',
            timestamp: millis,
            likes: Number(data.likes) || 0,
            isArtist: Boolean(data.isArtist)
          };

          const existingIdx = map[artId].findIndex(c => c.id === docSnap.id);
          if (existingIdx >= 0) {
            map[artId][existingIdx] = formattedComment;
          } else {
            map[artId].push(formattedComment);
          }
        }
      });

      // Sort comments inside each list (chronological descending - newest first)
      for (const artId of Object.keys(map)) {
        map[artId].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }

      setCachedComments(map);
      onUpdate(map);
    },
    (err) => {
      console.warn('Comments realtime subscription fallback to local cache:', err);
      const fallback = getCachedComments();
      onUpdate(fallback);
      onError?.(err);
    }
  );
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
    const sanitized = sanitizeForFirestore({
      ...artwork,
      updatedAt: Date.now()
    });
    await setDoc(artDocRef, sanitized);
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
    const sanitized = sanitizeForFirestore({
      ...artwork,
      updatedAt: Date.now()
    });
    await setDoc(artDocRef, sanitized, { merge: true });
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
    const sanitized = sanitizeForFirestore({
      ...comment,
      createdAt: Date.now()
    });
    await setDoc(commentDocRef, sanitized);

    // Increment comment count on the artwork document
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await setDoc(artDocRef, {
      commentsCount: increment(1)
    }, { merge: true });
  } catch (e) {
    console.error('Failed to add comment to Firestore:', e);
    throw e;
  }
}

/**
 * Delete comment from cloud
 */
export async function deleteCommentFromCloud(artworkId: string, commentId: string): Promise<void> {
  try {
    const commentDocRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(commentDocRef);

    // Decrement comment count on the artwork document
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await setDoc(artDocRef, {
      commentsCount: increment(-1)
    }, { merge: true });
  } catch (e) {
    console.error('Failed to delete comment from Firestore:', e);
  }
}

/**
 * Like / upvote comment
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
    const sanitized = sanitizeForFirestore({
      ...msg,
      createdAt: Date.now()
    });
    await setDoc(msgDocRef, sanitized);
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
