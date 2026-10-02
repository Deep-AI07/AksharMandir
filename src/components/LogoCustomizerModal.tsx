import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Image as ImageIcon,
  Sliders,
  Code
} from 'lucide-react';

interface LogoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoCustomizerModal: React.FC<LogoCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { brandConfig, updateBrandConfig, resetBrandConfig, showToast } = useApp();

  const [formData, setFormData] = useState({
    brandName: brandConfig.brandName,
    tagline: brandConfig.tagline,
    subTagline: brandConfig.subTagline,
    logoUrl: brandConfig.logoUrl,
    logoAltText: brandConfig.logoAltText,
  });

  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'text'>('url');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be under 2MB for optimal performance', 'warning');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setFormData(prev => ({
          ...prev,
          logoUrl: e.target?.result as string
        }));
        showToast('Logo image loaded into preview!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBrandConfig(formData);
    onClose();
  };

  const handleReset = () => {
    resetBrandConfig();
    setFormData({
      brandName: 'AKSHAR MANDIR',
      tagline: 'Divine Modernity',
      subTagline: 'Handcrafted Sacred Sanctums',
      logoUrl: '',
      logoAltText: 'Akshar Mandir Logo',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        id="logo-customizer-modal"
        className="bg-[#fbf9f8] rounded-2xl max-w-xl w-full border border-[#d4af37]/30 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#570000] via-[#430000] to-[#2e0000] text-white flex items-center justify-between border-b border-[#d4af37]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#fdcc87]/20 text-[#fdcc87]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#fbf9f8]">Customize Logo & Brand Identity</h3>
              <p className="text-xs text-[#fdcc87]/80">Easily update your brand logo, name, and tagline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Preview Box */}
          <div className="p-4 rounded-xl bg-white border border-[#eae5e2] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#7b581e]" />
                Live Brand Preview
              </span>
              <span className="text-[11px] text-stone-400">Desktop & Laptop Header Layout</span>
            </div>

            <div className="p-4 rounded-lg bg-[#fbf9f8] border border-[#d4af37]/20 flex items-center justify-between">
              <BrandLogo config={formData} variant="header" theme="light" />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded bg-[#570000]/10 text-[#570000] font-medium">Nav item</span>
                <span className="text-xs px-2.5 py-1 rounded bg-[#570000]/10 text-[#570000] font-medium">Catalog</span>
              </div>
            </div>

            {/* Dark/Footer preview */}
            <div className="p-4 rounded-lg bg-[#1f1c1b] border border-white/10 flex items-center justify-between">
              <BrandLogo config={formData} variant="footer" theme="dark" />
              <span className="text-[11px] text-stone-400">Dark / Footer Theme</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#eae5e2] text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`pb-2.5 px-4 font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'url'
                  ? 'border-b-2 border-[#570000] text-[#570000] font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              Logo Image URL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-4 font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-b-2 border-[#570000] text-[#570000] font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`pb-2.5 px-4 font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'border-b-2 border-[#570000] text-[#570000] font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Brand Text
            </button>
          </div>

          {/* Tab 1: Image URL */}
          {activeTab === 'url' && (
            <div className="space-y-3 animate-fadeIn">
              <label className="block text-xs font-bold text-[#1f1c1b] uppercase tracking-wider">
                Logo Image Link / CDN URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/your-logo.png or /assets/logo.png"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-[#eae5e2] bg-white focus:outline-none focus:ring-2 focus:ring-[#570000]/20 focus:border-[#570000]"
                />
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Paste any publicly accessible PNG, JPG, or SVG image link. If left blank, the high-resolution sacred Kalash Temple vector icon will be displayed.
              </p>
            </div>
          )}

          {/* Tab 2: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3 animate-fadeIn">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-colors ${
                  dragOver 
                    ? 'border-[#570000] bg-[#570000]/5' 
                    : 'border-[#eae5e2] bg-white hover:border-[#570000]/50 hover:bg-stone-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#570000]/10 text-[#570000] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-stone-800">Click to upload or drag & drop logo</p>
                  <p className="text-[11px] text-stone-400">PNG, JPG, SVG, WebP (Max 2MB)</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Brand Text Settings */}
          {activeTab === 'text' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-[#1f1c1b] uppercase tracking-wider mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-[#eae5e2] bg-white focus:outline-none focus:border-[#570000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f1c1b] uppercase tracking-wider mb-1">
                  Tagline / Bottom Text
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. Divine Modernity"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-[#eae5e2] bg-white focus:outline-none focus:border-[#570000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1f1c1b] uppercase tracking-wider mb-1">
                  Logo Alt Text
                </label>
                <input
                  type="text"
                  value={formData.logoAltText}
                  onChange={(e) => setFormData(prev => ({ ...prev, logoAltText: e.target.value }))}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-[#eae5e2] bg-white focus:outline-none focus:border-[#570000]"
                />
              </div>
            </div>
          )}

          {/* Code Configuration Note */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2.5">
            <Code className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Direct Code Config:</strong> You can also modify your logo and brand text directly in <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px] font-mono">/src/config/branding.ts</code>.
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-[#eae5e2] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-xs font-medium text-stone-600 hover:text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#570000] hover:bg-[#800000] text-[#fdcc87] hover:text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
