import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { getCategoryImageUrl, handleImageError, CATEGORY_FALLBACK_IMAGES } from '../../utils/imageUtils';
import { 
  X, 
  Layers, 
  Sparkles, 
  Check, 
  Image as ImageIcon, 
  Tag, 
  FileText,
  CheckCircle2,
  Upload,
  Camera,
  RefreshCw
} from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: (newCategory: any) => void;
}

const PRESET_IMAGES = [
  { label: 'Traditional Teak', url: '/images/mandirs/mandir_royal_sheesham.jpg' },
  { label: 'Modern Mandir', url: '/images/mandirs/mandir_aura_modern.jpg' },
  { label: 'Apartment Wall Shrine', url: '/images/mandirs/mandir_wall_shrine.jpg' },
  { label: 'Grand Haveli Temple', url: '/images/mandirs/mandir_grand_haveli.jpg' },
  { label: 'Lotus Brass Mandir', url: '/images/mandirs/mandir_lotus_brass.jpg' },
  { label: 'White Marble Temple', url: '/images/mandirs/mandir_white_marble.jpg' },
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryCreated
}) => {
  const { createCategory, showToast } = useApp();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const uploadedUrl = await api.upload.uploadImage(file);
        setCustomImageUrl(uploadedUrl);
        setUseCustomImage(true);
        showToast('Image uploaded successfully!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Image upload failed.', 'error');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const finalImage = useCustomImage && customImageUrl.trim() ? customImageUrl.trim() : image;

      const created = await createCategory({
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().trim().replace(/\s+/g, '-'),
        description: description.trim() || undefined,
        badge: badge.trim() || undefined,
        image: finalImage,
        isActive: true,
      });

      showToast(`Category "${created.name}" created successfully!`, 'success');
      if (onCategoryCreated) {
        onCategoryCreated(created);
      }
      // Reset form
      setName('');
      setSlug('');
      setDescription('');
      setBadge('');
      setCustomImageUrl('');
      setUseCustomImage(false);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create category.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl relative border border-[#eae5e2] animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#eae5e2] flex items-center justify-between bg-gradient-to-r from-[#570000] to-[#3a0000] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 text-[#fdcc87] border border-white/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Add New Mandir Category</h3>
              <p className="text-xs text-stone-300">Create a new mandir collection or style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-stone-300 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs flex-1">
          <div>
            <label className="uppercase font-bold text-gray-600 block mb-1">
              Category Name <span className="text-[#570000]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Marble Mandirs, South Indian Gopuram"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold text-sm focus:outline-hidden focus:border-[#570000]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="uppercase font-bold text-gray-600 block mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. marble-mandirs"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-mono focus:outline-hidden focus:border-[#570000]"
              />
            </div>

            <div>
              <label className="uppercase font-bold text-gray-600 block mb-1">Badge (Optional)</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Bestseller, New, Luxury"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden focus:border-[#570000]"
              />
            </div>
          </div>

          <div>
            <label className="uppercase font-bold text-gray-600 block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this mandir collection and architectural highlights..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden focus:border-[#570000]"
            />
          </div>

          {/* Image Selection */}
          <div className="space-y-2 pt-2 border-t border-[#eae5e2]">
            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3 py-1.5 bg-[#570000] text-white hover:bg-[#800000] rounded-xl cursor-pointer font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors">
                <Upload className="w-3.5 h-3.5 text-[#fdcc87]" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setUseCustomImage(!useCustomImage)}
                className="text-[#570000] font-semibold hover:underline text-[11px] px-2 py-1"
              >
                {useCustomImage ? '← Choose from Presets' : 'Or Enter Custom Image URL'}
              </button>
            </div>

            {useCustomImage ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden focus:border-[#570000]"
                />
                {customImageUrl && (
                  <div className="w-full h-24 rounded-xl overflow-hidden border border-[#eae5e2] relative">
                    <img
                      src={customImageUrl}
                      alt="Preview"
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {PRESET_IMAGES.map((preset, idx) => {
                  const isSelected = image === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className={`group relative h-20 rounded-xl overflow-hidden border-2 transition-all text-left ${
                        isSelected ? 'border-[#570000] ring-2 ring-[#570000]/20' : 'border-[#eae5e2] opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <span className="absolute bottom-1 left-1.5 right-1.5 text-[10px] text-white font-medium truncate block">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 p-0.5 rounded-full bg-[#570000] text-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#eae5e2] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#eae5e2] text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#570000] text-[#fdcc87] font-bold hover:bg-[#800000] transition-colors shadow-md disabled:bg-gray-300 disabled:text-gray-500 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
