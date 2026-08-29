import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  increment 
} from '../lib/firebase';
import { Artwork, Comment, InboxMessage } from '../types';
import { INITIAL_ARTWORKS, INITIAL_COMMENTS } from '../data/initialArtworks';

const ARTWORKS_COLLECTION = 'artworks';
const COMMENTS_COLLECTION = 'comments';
const INBOX_COLLECTION = 'inbox_messages';

/**
 * Initialize / Seed Firestore with default artworks if collection is empty
 */
export async function syncInitialArtworksIfEmpty(): Promise<void> {
  try {
    const artworksRef = collection(db, ARTWORKS_COLLECTION);
    const snapshot = await getDocs(artworksRef);
    
    if (snapshot.empty) {
      console.log('Firebase Artworks collection is empty. Seeding initial sketches...');
      // Seed artworks
      for (const art of INITIAL_ARTWORKS) {
        await setDoc(doc(db, ARTWORKS_COLLECTION, art.id), {
          ...art,
          updatedAt: Date.now()
        });
      }

      // Seed comments
      for (const [artId, comments] of Object.entries(INITIAL_COMMENTS)) {
        for (const comment of comments) {
          await setDoc(doc(db, COMMENTS_COLLECTION, comment.id), {
            ...comment,
            artworkId: artId
          });
        }
      }
      console.log('Seeding completed successfully!');
    }
  } catch (error) {
    console.error('Error synchronizing initial Firebase data:', error);
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
      if (!snapshot.empty) {
        const list: Artwork[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Artwork;
          list.push({ ...data, id: docSnap.id });
        });
        // Sort by createdAt descending or featured
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        onUpdate(list);
      } else {
        // If empty, fallback to initial artworks
        onUpdate(INITIAL_ARTWORKS);
      }
    },
    (err) => {
      console.warn('Firestore realtime error, using local fallback:', err);
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
    await updateDoc(artDocRef, {
      likesCount: increment(incrementLike ? 1 : -1)
    });
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
    await updateDoc(artDocRef, {
      viewsCount: increment(1)
    });
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
    await updateDoc(artDocRef, {
      sharesCount: increment(1)
    });
  } catch (e) {
    console.warn('Failed to increment share count:', e);
  }
}

/**
 * Add a new artwork
 */
export async function addArtworkToCloud(artwork: Artwork): Promise<void> {
  const artDocRef = doc(db, ARTWORKS_COLLECTION, artwork.id);
  await setDoc(artDocRef, {
    ...artwork,
    updatedAt: Date.now()
  });
}

/**
 * Update an existing artwork
 */
export async function updateArtworkInCloud(artwork: Artwork): Promise<void> {
  const artDocRef = doc(db, ARTWORKS_COLLECTION, artwork.id);
  await setDoc(artDocRef, {
    ...artwork,
    updatedAt: Date.now()
  }, { merge: true });
}

/**
 * Delete an artwork from cloud
 */
export async function deleteArtworkFromCloud(artworkId: string): Promise<void> {
  const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
  await deleteDoc(artDocRef);
}

/**
 * Add a comment to cloud
 */
export async function addCommentToCloud(
  artworkId: string, 
  comment: Comment
): Promise<void> {
  // Add comment document
  const commentDocRef = doc(db, COMMENTS_COLLECTION, comment.id);
  await setDoc(commentDocRef, {
    ...comment,
    artworkId
  });

  // Increment artwork commentsCount
  try {
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await updateDoc(artDocRef, {
      commentsCount: increment(1)
    });
  } catch (err) {
    console.warn('Could not increment artwork comment count', err);
  }
}

/**
 * Delete comment
 */
export async function deleteCommentFromCloud(
  artworkId: string, 
  commentId: string
): Promise<void> {
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
  try {
    const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
    await updateDoc(artDocRef, {
      commentsCount: increment(-1)
    });
  } catch (err) {
    console.warn('Could not decrement comment count', err);
  }
}

/**
 * Like a comment
 */
export async function likeCommentInCloud(commentId: string): Promise<void> {
  const commentDocRef = doc(db, COMMENTS_COLLECTION, commentId);
  await updateDoc(commentDocRef, {
    likes: increment(1)
  });
}

/**
 * Send inquiry / message to cloud inbox
 */
export async function sendInboxMessageToCloud(message: InboxMessage): Promise<void> {
  const inboxDocRef = doc(db, INBOX_COLLECTION, message.id);
  await setDoc(inboxDocRef, message);
}

/**
 * Mark inbox message read
 */
export async function markInboxMessageReadInCloud(messageId: string): Promise<void> {
  const inboxDocRef = doc(db, INBOX_COLLECTION, messageId);
  await updateDoc(inboxDocRef, {
    read: true
  });
}

/**
 * Delete inbox message
 */
export async function deleteInboxMessageFromCloud(messageId: string): Promise<void> {
  const inboxDocRef = doc(db, INBOX_COLLECTION, messageId);
  await deleteDoc(inboxDocRef);
}
