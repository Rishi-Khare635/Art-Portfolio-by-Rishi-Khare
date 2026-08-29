import { Artwork, Comment } from '../types';

// Empty default arrays so that when the gallery is emptied or seeded,
// only the user's authentic personal artworks appear.
export const INITIAL_ARTWORKS: Artwork[] = [];

export const INITIAL_COMMENTS: Record<string, Comment[]> = {};
