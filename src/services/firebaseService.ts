import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  increment 
} from '../lib/firebase';
import { Artwork, Comment, InboxMessage } from '../types';

const ARTWORKS_COLLECTION = 'artworks';
const COMMENTS_COLLECTION = 'comments';
const INBOX_COLLECTION = 'inbox_messages';

/**
 * Remove any legacy default/seeded artworks from Firestore if requested
 */
export async function clearLegacySampleArtworks(): Promise<void> {
  const sampleIds = [
    'art-madara-reality',
    'art-goku-vegeta',
    'art-madara-portrait',
    'art-fresh-doodle'
  ];

  try {
    for (const id of sampleIds) {
      await deleteDoc(doc(db, ARTWORKS_COLLECTION, id));
    }
  } catch (err) {
    console.warn('Could not clear sample artworks:', err);
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
      onUpdate(list);
    },
    (err) => {
      console.warn('Firestore realtime error:', err);
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
 * Add a new artwork
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
 * Update an existing artwork
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
 * Add a comment to cloud
 */
export async function addCommentToCloud(
  artworkId: string, 
  comment: Comment
): Promise<void> {
  try {
    // Add comment document
    const commentDocRef = doc(db, COMMENTS_COLLECTION, comment.id);
    await setDoc(commentDocRef, {
      ...comment,
      artworkId
    });

    // Increment artwork commentsCount
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await setDoc(artDocRef, {
      commentsCount: increment(1)
    }, { merge: true });
  } catch (err) {
    console.warn('Error adding comment:', err);
  }
}

/**
 * Delete comment
 */
export async function deleteCommentFromCloud(
  artworkId: string, 
  commentId: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await setDoc(artDocRef, {
      commentsCount: increment(-1)
    }, { merge: true });
  } catch (err) {
    console.warn('Could not decrement comment count', err);
  }
}

/**
 * Like a comment
 */
export async function likeCommentInCloud(commentId: string): Promise<void> {
  try {
    const commentDocRef = doc(db, COMMENTS_COLLECTION, commentId);
    await setDoc(commentDocRef, {
      likes: increment(1)
    }, { merge: true });
  } catch (err) {
    console.warn('Error liking comment:', err);
  }
}

/**
 * Send inquiry / message to cloud inbox
 */
export async function sendInboxMessageToCloud(message: InboxMessage): Promise<void> {
  try {
    const inboxDocRef = doc(db, INBOX_COLLECTION, message.id);
    await setDoc(inboxDocRef, message);
  } catch (err) {
    console.error('Error sending message:', err);
  }
}

/**
 * Mark inbox message read
 */
export async function markInboxMessageReadInCloud(messageId: string): Promise<void> {
  try {
    const inboxDocRef = doc(db, INBOX_COLLECTION, messageId);
    await setDoc(inboxDocRef, {
      read: true
    }, { merge: true });
  } catch (err) {
    console.warn('Error marking read:', err);
  }
}

/**
 * Delete inbox message
 */
export async function deleteInboxMessageFromCloud(messageId: string): Promise<void> {
  try {
    const inboxDocRef = doc(db, INBOX_COLLECTION, messageId);
    await deleteDoc(inboxDocRef);
  } catch (err) {
    console.warn('Error deleting inbox message:', err);
  }
}
