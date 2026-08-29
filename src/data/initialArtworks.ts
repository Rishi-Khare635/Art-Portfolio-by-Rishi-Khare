import { Artwork, Comment } from '../types';
import madaraRealityImg from '../assets/images/madara_reality_1788029931402.jpg';
import gokuVegetaImg from '../assets/images/goku_vegeta_1788029947410.jpg';
import madaraPortraitImg from '../assets/images/madara_portrait_1788029965660.jpg';
import freshDoodleImg from '../assets/images/fresh_doodle_1788029982376.jpg';

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 'art-madara-reality',
    title: 'Madara Uchiha: "Wake Up to Reality"',
    description: 'Detailed manga ink illustration of Madara Uchiha in full battle armor weaving a hand sign with Gunbai war fan, flanked by the looming Nine-Tails Kurama with iconic red Sharingan eye accent.',
    imageUrl: madaraRealityImg,
    medium: 'Manga & Line Art',
    toolsUsed: ['Fine Line Drawing Pens (0.1mm - 0.5mm)', 'Red Ink Accent', 'White Sketchbook Paper'],
    dimensions: 'A4 Sketchbook (210 x 297 mm)',
    year: 2024,
    tags: ['Madara Uchiha', 'Naruto Shippuden', 'Sharingan', 'Nine-Tails', 'Line Art'],
    featured: true,
    likesCount: 38,
    viewsCount: 245,
    sharesCount: 19,
    commentsCount: 6,
    createdAt: new Date('2024-03-11').getTime(),
    aspectRatio: 'portrait'
  },
  {
    id: 'art-goku-vegeta',
    title: 'Super Saiyan Duo: Goku & Vegeta',
    description: 'Dynamic back-to-back pencil & ink sketch of Super Saiyan Goku and Super Saiyan Vegeta with dense cross-hatch muscular shading, battle damage, and signature poses.',
    imageUrl: gokuVegetaImg,
    medium: 'Character Sketches',
    toolsUsed: ['2B/4B Graphite Pencils', 'Micron Ink Pen', 'Blending Stump'],
    dimensions: 'A4 Bristol Board',
    year: 2023,
    tags: ['Dragon Ball Z', 'Goku', 'Vegeta', 'Super Saiyan', 'Crosshatch'],
    featured: true,
    likesCount: 45,
    viewsCount: 310,
    sharesCount: 26,
    commentsCount: 8,
    createdAt: new Date('2023-02-11').getTime(),
    aspectRatio: 'portrait'
  },
  {
    id: 'art-madara-portrait',
    title: 'Madara Uchiha: Edo Tensei Portrait',
    description: 'Expressive close-up sketchbook study capturing Madara\'s sinister smirk, wild spiky mane, crack textures from Edo Tensei, and hypnotic concentric Rinnegan eye.',
    imageUrl: madaraPortraitImg,
    medium: 'Manga & Line Art',
    toolsUsed: ['Graphite Pencils (HB, 2B, 6B)', 'Black Drawing Pen', 'Spiral Sketchbook'],
    dimensions: 'Spiral Sketchbook Pad',
    year: 2023,
    tags: ['Madara', 'Rinnegan', 'Edo Tensei', 'Expression Study', 'Uchiha'],
    featured: true,
    likesCount: 29,
    viewsCount: 198,
    sharesCount: 14,
    commentsCount: 4,
    createdAt: new Date('2023-03-21').getTime(),
    aspectRatio: 'portrait'
  },
  {
    id: 'art-fresh-doodle',
    title: 'FRESH: High-Energy Ink Doodle Art',
    description: 'Full-page intricate surreal ink doodle packed with character caricatures, graffiti "FRESH" typography, boombox, street characters, clock face, and whimsical patterns.',
    imageUrl: freshDoodleImg,
    medium: 'Concept & OC',
    toolsUsed: ['0.38mm Pilot G2 Pen', 'Dual Brush Pen Black', 'Heavyweight Paper'],
    dimensions: 'Full Page (8.5 x 11 in)',
    year: 2024,
    tags: ['Doodle Art', 'Graffiti', 'Line Art', 'Surreal', 'Fresh'],
    featured: true,
    likesCount: 52,
    viewsCount: 360,
    sharesCount: 31,
    commentsCount: 9,
    createdAt: new Date('2024-08-10').getTime(),
    aspectRatio: 'portrait'
  }
];

export const INITIAL_COMMENTS: Record<string, Comment[]> = {
  'art-madara-reality': [
    {
      id: 'c-1',
      artworkId: 'art-madara-reality',
      authorName: 'Alex Mercer',
      authorHandle: '@am_draws',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      content: 'The red Sharingan pop against the dense black ink hatching is insane! Love the Kurama teeth silhouette.',
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      likes: 5
    },
    {
      id: 'c-2',
      artworkId: 'art-madara-reality',
      authorName: 'Jordan Lee',
      authorHandle: '@jordan_ink',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
      content: 'Hands and Gunbai fan perspective are super clean.',
      timestamp: Date.now() - 1000 * 60 * 60 * 12,
      likes: 3
    }
  ],
  'art-goku-vegeta': [
    {
      id: 'c-3',
      artworkId: 'art-goku-vegeta',
      authorName: 'SaiyanArtist',
      authorHandle: '@dbz_fan_art',
      avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80',
      content: 'That forearm and shoulder crosshatching on Goku is top tier Toriyama style!',
      timestamp: Date.now() - 1000 * 60 * 60 * 30,
      likes: 7
    }
  ],
  'art-fresh-doodle': [
    {
      id: 'c-4',
      artworkId: 'art-fresh-doodle',
      authorName: 'VexxFan',
      authorHandle: '@doodle_hub',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      content: 'The flow and density in this doodle piece is crazy. So many hidden characters!',
      timestamp: Date.now() - 1000 * 60 * 60 * 8,
      likes: 6
    }
  ]
};
