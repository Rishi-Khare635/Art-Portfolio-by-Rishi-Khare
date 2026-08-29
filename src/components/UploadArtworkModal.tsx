import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Palette,
  Loader2
} from 'lucide-react';
import { Artwork, MediumType } from '../types';
import confetti from 'canvas-confetti';
import { compressImageFile } from '../utils/imageCompressor';

interface UploadArtworkModalProps {
  onClose: () => void;
  onAddArtwork: (newArtwork: Artwork) => void;
}

const COMMON_TOOLS = [
  'Procreate',
  'Clip Studio Paint',
  'Photoshop CC',
  'Wacom Cintiq',
  'iPad Pro + Apple Pencil',
  'Sakura Micron Pens',
  'Blender 3D',
  'Fountain Pen',
  'Gouache / Oil',
  'Graphite Pencils'
];

export const UploadArtworkModal: React.FC<UploadArtworkModalProps> = ({
  onClose,
  onAddArtwork
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [medium, setMedium] = useState<MediumType>('Manga & Line Art');
  const [tools, setTools] = useState<string[]>(['Micron Pens', 'Ink']);
  const [customTool, setCustomTool] = useState('');
  const [dimensions, setDimensions] = useState('A4 (210 x 297 mm)');
  const [year, setYear] = useState(new Date().getFullYear());
  const [tagsInput, setTagsInput] = useState('Original, Line Art, Sketch');
  const [featured, setFeatured] = useState(true);
  const [forSale, setForSale] = useState(false);
  const [price, setPrice] = useState('$150');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      try {
        const compressedDataUrl = await compressImageFile(file, 1600, 0.85);
        setImageUrl(compressedDataUrl);
      } catch (err) {
        console.error('Image compression failed, using direct data url', err);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImageUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const toggleTool = (tool: string) => {
    if (tools.includes(tool)) {
      setTools(tools.filter(t => t !== tool));
    } else {
      setTools([...tools, tool]);
    }
  };

  const addCustomTool = () => {
    if (customTool.trim() && !tools.includes(customTool.trim())) {
      setTools([...tools, customTool.trim()]);
      setCustomTool('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newArtwork: Artwork = {
      id: `art-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'An original artwork and study by Rishi Khare.',
      imageUrl,
      medium,
      toolsUsed: tools.length > 0 ? tools : ['Drawing Pen'],
      dimensions: dimensions.trim() || 'A4 Sketchbook',
      year: Number(year) || new Date().getFullYear(),
      tags: parsedTags.length > 0 ? parsedTags : ['OriginalArt'],
      featured,
      likesCount: 0,
      viewsCount: 0,
      sharesCount: 0,
      commentsCount: 0,
      createdAt: Date.now(),
      aspectRatio: 'portrait',
      forSale,
      price: forSale ? price : undefined
    };

    onAddArtwork(newArtwork);
    onClose();

    confetti({
      particleCount: 45,
      spread: 60,
      colors: ['#6366f1', '#a855f7', '#ec4899']
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] bg-[#161828]/95 border border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg border border-indigo-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Upload New Artwork
              </h2>
              <p className="text-xs text-slate-300">
                Publish your own drawing or sketch directly to the live gallery.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 backdrop-blur-md transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Image Upload / Drop Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>1. Artwork Image <span className="text-pink-400">*</span></span>
              {imageUrl && <span className="text-emerald-400 font-normal lowercase">✓ Image ready</span>}
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dropzone / Upload button */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all backdrop-blur-md group ${
                  imageUrl 
                    ? 'border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-400' 
                    : 'border-white/15 hover:border-indigo-400 bg-white/5 hover:bg-white/10'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="p-3 rounded-2xl bg-white/10 group-hover:bg-indigo-500/20 text-slate-300 group-hover:text-indigo-400 mb-2 transition-all">
                  {isProcessingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div className="text-xs font-bold text-white">
                  {isProcessingImage ? 'Optimizing Image...' : 'Click or Drag Artwork File'}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP formats</div>
              </div>

              {/* Image Preview & URL input */}
              <div className="flex flex-col justify-between space-y-2">
                {imageUrl ? (
                  <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-white/15 bg-black/40">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 backdrop-blur-md rounded-full text-white hover:bg-black"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="h-28 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-center text-xs text-slate-400">
                    No image chosen yet
                  </div>
                )}

                <input
                  type="url"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste external image URL..."
                  className="w-full bg-black/30 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
                />
              </div>
            </div>
          </div>

          {/* Title & Medium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Artwork Title <span className="text-pink-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Manga Ink Study, Character Concept..."
                className="w-full bg-black/30 text-sm text-white placeholder-slate-500 px-4 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                3. Category / Style
              </label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value as MediumType)}
                className="w-full bg-black/30 text-sm text-white px-4 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              >
                <option value="Character Sketches" className="bg-[#161828]">Character Sketches</option>
                <option value="Manga & Line Art" className="bg-[#161828]">Manga & Line Art</option>
                <option value="Digital Anime" className="bg-[#161828]">Digital Anime</option>
                <option value="Concept & OC" className="bg-[#161828]">Concept & OC</option>
                <option value="Speed Sketches" className="bg-[#161828]">Speed Sketches</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              4. Concept Notes & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the backstory, linework technique, inspirations, or anatomy breakdown..."
              className="w-full bg-black/30 text-xs text-white placeholder-slate-500 p-3.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md resize-none"
            />
          </div>

          {/* Tools & Mediums Used */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              5. Tools & Mediums Used
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TOOLS.map((tool) => {
                const isSelected = tools.includes(tool);
                return (
                  <button
                    type="button"
                    key={tool}
                    onClick={() => toggleTool(tool)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-medium border border-indigo-400/50 shadow-md shadow-indigo-900/30'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    <span>{tool}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customTool}
                onChange={(e) => setCustomTool(e.target.value)}
                placeholder="Add custom pen, software, or paper type..."
                className="flex-1 bg-black/30 text-xs text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTool();
                  }
                }}
              />
              <button
                type="button"
                onClick={addCustomTool}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-xl border border-white/15 transition-all"
              >
                Add Tool
              </button>
            </div>
          </div>

          {/* Tags & Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                6. Comma-Separated Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Naruto, LineArt, Crosshatch, Pencil"
                className="w-full bg-black/30 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Year Created
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-black/30 text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              />
            </div>
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <input
              type="checkbox"
              id="featured-check"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-black/40 border-white/20 focus:ring-indigo-500"
            />
            <label htmlFor="featured-check" className="text-xs text-slate-200 cursor-pointer font-medium">
              Pin as Featured Artwork (Highlights in gallery)
            </label>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!title.trim() || !imageUrl || isProcessingImage}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 border border-indigo-400/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              <span>Publish to Portfolio</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
