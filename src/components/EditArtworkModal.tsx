import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  Wrench, 
  Check,
  Palette,
  Edit3,
  Image as ImageIcon
} from 'lucide-react';
import { Artwork, MediumType } from '../types';
import confetti from 'canvas-confetti';

interface EditArtworkModalProps {
  artwork: Artwork;
  onClose: () => void;
  onUpdateArtwork: (updatedArtwork: Artwork) => void;
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
  'Pencil & Charcoal'
];

export const EditArtworkModal: React.FC<EditArtworkModalProps> = ({
  artwork,
  onClose,
  onUpdateArtwork
}) => {
  const [title, setTitle] = useState(artwork.title);
  const [description, setDescription] = useState(artwork.description);
  const [imageUrl, setImageUrl] = useState(artwork.imageUrl);
  const [medium, setMedium] = useState<MediumType>(artwork.medium);
  const [tools, setTools] = useState<string[]>(artwork.toolsUsed || ['Digital Media']);
  const [customTool, setCustomTool] = useState('');
  const [dimensions, setDimensions] = useState(artwork.dimensions || '3840 x 2160 px');
  const [year, setYear] = useState(artwork.year || 2024);
  const [tagsInput, setTagsInput] = useState(artwork.tags?.join(', ') || '');
  const [featured, setFeatured] = useState(artwork.featured ?? false);
  const [forSale, setForSale] = useState(artwork.forSale ?? false);
  const [price, setPrice] = useState(artwork.price || '$150');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
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
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const updated: Artwork = {
      ...artwork,
      title: title.trim(),
      description: description.trim() || 'Original drawing and sketch study by Rishi Khare.',
      imageUrl: imageUrl || artwork.imageUrl,
      medium,
      toolsUsed: tools.length > 0 ? tools : ['Digital Media'],
      dimensions: dimensions.trim(),
      year,
      tags: parsedTags.length > 0 ? parsedTags : ['OriginalArt'],
      featured,
      forSale,
      price: forSale ? price : undefined
    };

    onUpdateArtwork(updated);
    onClose();

    confetti({
      particleCount: 30,
      spread: 50,
      colors: ['#6366f1', '#a855f7', '#ec4899']
    });
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
                Modify the image, description, tools, tags, or dimensions for "{artwork.title}".
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
          
          {/* Image Replace / Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>1. Artwork Image File</span>
              <span className="text-[11px] font-normal text-indigo-300">Replace or update visual</span>
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
                <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-indigo-500/20 text-slate-300 group-hover:text-indigo-400 mb-2 transition-all">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white">Click to upload replacement image</div>
                <div className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP</div>
              </div>

              {/* Current / New Image Preview */}
              <div className="flex flex-col justify-between space-y-2">
                <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-white/15 bg-black/40 flex items-center justify-center">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain" 
                    referrerPolicy="no-referrer" 
                  />
                </div>

                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Or paste image URL..."
                  className="w-full bg-black/30 text-xs text-white placeholder-slate-500 px-3.5 py-2 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
                />
              </div>
            </div>
          </div>

          {/* Title & Medium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Artwork Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Celestial Wanderer, Ronin Blade..."
                className="w-full bg-black/30 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Medium / Category
              </label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value as MediumType)}
                className="w-full bg-black/30 text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none cursor-pointer backdrop-blur-md"
              >
                <option value="Character Sketches" className="bg-[#161828]">Character Sketches</option>
                <option value="Manga & Line Art" className="bg-[#161828]">Manga & Line Art</option>
                <option value="Digital Anime" className="bg-[#161828]">Digital Anime</option>
                <option value="Concept & OC" className="bg-[#161828]">Concept & OC</option>
                <option value="Speed Sketches" className="bg-[#161828]">Speed Sketches</option>
              </select>
            </div>
          </div>

          {/* Tools & Software Used */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Tools & Mediums Used
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TOOLS.map((tool) => (
                <button
                  type="button"
                  key={tool}
                  onClick={() => toggleTool(tool)}
                  className={`px-3 py-1.5 rounded-xl text-xs transition-all backdrop-blur-md ${
                    tools.includes(tool)
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 font-semibold'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tools.includes(tool) ? `✓ ${tool}` : `+ ${tool}`}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={customTool}
                onChange={(e) => setCustomTool(e.target.value)}
                placeholder="Add another tool..."
                className="flex-1 bg-black/30 text-xs text-white placeholder-slate-500 px-3 py-2 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              />
              <button
                type="button"
                onClick={addCustomTool}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-xl border border-white/15 active:scale-95"
              >
                Add
              </button>
            </div>
          </div>

          {/* Description & Concept Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Description, Notes & Context
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the background story, process, lighting, or notes about this piece..."
              className="w-full bg-black/30 text-xs text-white placeholder-slate-500 p-3 rounded-2xl border border-white/15 focus:border-indigo-500 focus:outline-none resize-none backdrop-blur-md"
            />
          </div>

          {/* Dimensions, Year, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Dimensions / Res</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. 3840 x 2160 px"
                className="w-full bg-black/30 text-xs text-white px-3 py-2 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Creation Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-black/30 text-xs text-white px-3 py-2 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-300">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Character, Sketch, LineArt"
                className="w-full bg-black/30 text-xs text-white px-3 py-2 rounded-xl border border-white/15 focus:border-indigo-500 focus:outline-none backdrop-blur-md"
              />
            </div>
          </div>

          {/* Options: Featured */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-indigo-500 focus:ring-indigo-500"
              />
              <span>Highlight as Featured Artwork</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-95 flex items-center gap-1.5 border border-indigo-500/30"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
