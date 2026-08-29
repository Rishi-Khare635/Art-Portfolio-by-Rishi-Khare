import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Edit3, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Artwork, MediumType } from '../types';
import confetti from 'canvas-confetti';
import { compressImageFile } from '../utils/imageCompressor';

interface EditArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
  onUpdateArtwork: (updatedArtwork: Artwork) => Promise<void> | void;
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

export const EditArtworkModal: React.FC<EditArtworkModalProps> = ({
  artwork,
  onClose,
  onUpdateArtwork
}) => {
  const [title, setTitle] = useState(artwork.title);
  const [description, setDescription] = useState(artwork.description);
  const [imageUrl, setImageUrl] = useState(artwork.imageUrl);
  const [imageSizeKb, setImageSizeKb] = useState<number | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [medium, setMedium] = useState<MediumType>(artwork.medium);
  const [tools, setTools] = useState<string[]>(artwork.toolsUsed || ['Drawing Pen']);
  const [customTool, setCustomTool] = useState('');
  const [dimensions, setDimensions] = useState(artwork.dimensions || 'A4 Sketchbook');
  const [year, setYear] = useState(artwork.year || new Date().getFullYear());
  const [tagsInput, setTagsInput] = useState(artwork.tags?.join(', ') || '');
  const [featured, setFeatured] = useState(artwork.featured ?? false);
  const [forSale, setForSale] = useState(artwork.forSale ?? false);
  const [price, setPrice] = useState(artwork.price || '$150');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      setErrorMsg(null);
      try {
        const { dataUrl, sizeKb } = await compressImageFile(file, 1200, 0.8);
        setImageUrl(dataUrl);
        setImageSizeKb(sizeKb);
      } catch (err) {
        console.error('Image compression failed', err);
        setErrorMsg('Failed to process image file.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl) return;

    setIsSavingToCloud(true);
    setErrorMsg(null);

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const updated: Artwork = {
      ...artwork,
      title: title.trim(),
      description: description.trim() || 'Original drawing and sketch study by Rishi Khare.',
      imageUrl,
      medium,
      toolsUsed: tools.length > 0 ? tools : ['Drawing Pen'],
      dimensions: dimensions.trim() || 'A4 Sketchbook',
      year: Number(year) || new Date().getFullYear(),
      tags: parsedTags.length > 0 ? parsedTags : ['OriginalArt'],
      featured,
      forSale,
      price: forSale ? price : undefined
    };

    try {
      await onUpdateArtwork(updated);
      confetti({
        particleCount: 30,
        spread: 50,
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update in cloud:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update artwork in cloud.');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl max-h-[92vh] bg-[#161828]/95 border border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 shadow-lg">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Edit Artwork Details
              </h2>
              <p className="text-xs text-slate-400">
                Modify image, description, tools, or tags for "{artwork.title}".
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

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Image Replace / Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>1. Artwork Image File</span>
              {imageSizeKb && (
                <span className="text-[11px] font-normal text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {imageSizeKb} KB (Cloud Optimized)
                </span>
              )}
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dropzone / Upload button */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/15 hover:border-indigo-400 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-white/5 hover:bg-white/10 backdrop-blur-md group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-indigo-500/20 text-slate-300 group-hover:text-indigo-400 mb-1.5 transition-all">
                  {isProcessingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div className="text-xs font-bold text-white">
                  {isProcessingImage ? 'Optimizing Image...' : 'Upload Replacement Image'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP</div>
              </div>

              {/* Preview */}
              <div className="flex flex-col justify-between space-y-2">
                <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-white/15 bg-black/40">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <input
                  type="url"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageSizeKb(null);
                  }}
                  placeholder="Or paste external image URL..."
                  className="w-full bg-black/30 text-xs text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
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
              className="w-full bg-black/30 text-xs text-white placeholder-slate-500 p-3 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md resize-none"
            />
          </div>

          {/* Tools Used */}
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
              id="edit-featured-check"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-black/40 border-white/20 focus:ring-indigo-500"
            />
            <label htmlFor="edit-featured-check" className="text-xs text-slate-200 cursor-pointer font-medium">
              Pin as Featured Artwork
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              disabled={isSavingToCloud}
              onClick={onClose}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-white/10 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!title.trim() || !imageUrl || isProcessingImage || isSavingToCloud}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 border border-indigo-400/30 transition-all active:scale-95 flex items-center gap-2"
            >
              {isSavingToCloud ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
