import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { api } from '../../../services/api';
import { BrandLogo } from '../../../components/common/BrandLogo';
import { DEFAULT_SHOP_OWNERS } from '../../../config/branding';
import { ShopOwner } from '../../../types';
import { handleImageError } from '../../../utils/imageUtils';
import { 
  Settings, 
  Save, 
  Store, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw,
  Upload,
  Image as ImageIcon,
  Users,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Award,
  Briefcase
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { brandConfig, updateBrandConfig, showToast } = useApp();

  const [storeName, setStoreName] = useState(brandConfig.name || brandConfig.brandName || 'AKSHAR MANDIR');
  const [tagline, setTagline] = useState(brandConfig.tagline || 'Divine Modernity');
  const [supportPhone, setSupportPhone] = useState(brandConfig.supportPhone || '+91 98765 43210');
  const [supportEmail, setSupportEmail] = useState(brandConfig.supportEmail || 'blessings@aksharmandir.com');
  const [workshopLocations, setWorkshopLocations] = useState(brandConfig.workshopLocations || 'Saharanpur (Hardwood Crafting) & Jaipur (Carving Workshop)');
  const [primaryColor, setPrimaryColor] = useState(brandConfig.primaryColor || '#570000');
  const [accentColor, setAccentColor] = useState(brandConfig.accentColor || '#fdcc87');
  const [logoIcon, setLogoIcon] = useState<'temple' | 'om' | 'kalash'>(brandConfig.logoIcon || 'temple');
  const [logoUrl, setLogoUrl] = useState(brandConfig.logoUrl || '');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Shop Owners State (Dynamic List: Add / Remove / Edit)
  const [owners, setOwners] = useState<ShopOwner[]>(
    brandConfig.owners && brandConfig.owners.length > 0
      ? brandConfig.owners
      : DEFAULT_SHOP_OWNERS
  );
  const [ownersSectionTitle, setOwnersSectionTitle] = useState(
    brandConfig.ownersSectionTitle || 'FOUNDER OWNER & CO-OWNER'
  );
  const [activeOwnerTab, setActiveOwnerTab] = useState(0);
  const [uploadingOwnerIndex, setUploadingOwnerIndex] = useState<number | null>(null);

  // Handle Logo File Upload
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const uploadedUrl = await api.upload.uploadImage(file);
      setLogoUrl(uploadedUrl);
      showToast('Logo image uploaded successfully.', 'success');
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
          showToast('Logo updated locally.', 'success');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Add New Owner or Co-Owner
  const handleAddOwner = () => {
    const newId = `owner-${Date.now()}`;
    const newOwner: ShopOwner = {
      id: newId,
      name: `New Co-Owner ${owners.length + 1}`,
      role: 'Co-Owner & Mandir Artisan',
      experience: '12 Years Vedic Woodcraft',
      bio: 'Dedicated to preserving traditional temple architecture with seasoned hardwood and auspicious proportions.',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      badge: 'Co-Owner'
    };

    const updated = [...owners, newOwner];
    setOwners(updated);
    setActiveOwnerTab(updated.length - 1);
    showToast('New Owner / Co-Owner added to list.', 'info');
  };

  // Remove Owner
  const handleRemoveOwner = (indexToRemove: number) => {
    if (owners.length <= 1) {
      showToast('At least 1 owner or co-owner must be configured for the store.', 'warning');
      return;
    }

    const removedName = owners[indexToRemove]?.name || `Owner ${indexToRemove + 1}`;
    const updated = owners.filter((_, idx) => idx !== indexToRemove);
    setOwners(updated);
    setActiveOwnerTab(Math.min(activeOwnerTab, updated.length - 1));
    showToast(`Removed "${removedName}" from store owners.`, 'info');
  };

  // Handle Owner Photo File Upload
  const handleOwnerPhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingOwnerIndex(index);
      const uploadedUrl = await api.upload.uploadImage(file);
      updateOwnerField(index, 'image', uploadedUrl);
      showToast(`Photo for Owner ${index + 1} uploaded successfully.`, 'success');
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateOwnerField(index, 'image', reader.result);
          showToast(`Photo for Owner ${index + 1} updated.`, 'success');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingOwnerIndex(null);
    }
  };

  const updateOwnerField = (index: number, field: keyof ShopOwner, val: string) => {
    setOwners(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSaveLogoAndBrand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBrandConfig({
      name: storeName.trim(),
      brandName: storeName.trim(),
      tagline: tagline.trim(),
      logoIcon,
      logoUrl: logoUrl.trim(),
      primaryColor,
      accentColor,
    });
    showToast('Brand logo, emblem & theme colors updated successfully!', 'success');
  };

  const handleSaveOwners = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBrandConfig({
      owners,
      ownersSectionTitle: ownersSectionTitle.trim(),
    });
    showToast(`Shop Owners list (${owners.length} profiles) and header title updated successfully!`, 'success');
  };

  const handleSaveContact = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBrandConfig({
      supportPhone: supportPhone.trim(),
      supportEmail: supportEmail.trim(),
      workshopLocations: workshopLocations.trim(),
    });
    showToast('Helpline phone, email & workshop locations updated successfully!', 'success');
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateBrandConfig({
      name: storeName.trim(),
      brandName: storeName.trim(),
      tagline: tagline.trim(),
      supportPhone: supportPhone.trim(),
      supportEmail: supportEmail.trim(),
      workshopLocations: workshopLocations.trim(),
      primaryColor,
      accentColor,
      logoIcon,
      logoUrl: logoUrl.trim(),
      owners,
      ownersSectionTitle: ownersSectionTitle.trim(),
    });
    showToast('All store settings, logo, owners, and contact details updated successfully!', 'success');
  };

  const handleReset = () => {
    setStoreName('AKSHAR MANDIR');
    setTagline('Divine Modernity');
    setSupportPhone('+91 98765 43210');
    setSupportEmail('blessings@aksharmandir.com');
    setWorkshopLocations('Saharanpur (Hardwood Crafting) & Jaipur (Carving Workshop)');
    setPrimaryColor('#570000');
    setAccentColor('#fdcc87');
    setLogoIcon('temple');
    setLogoUrl('');
    setOwners(DEFAULT_SHOP_OWNERS);
    setOwnersSectionTitle('FOUNDER OWNER & CO-OWNER');
    setActiveOwnerTab(0);
    showToast('Settings reset to default configuration.', 'info');
  };

  // Preview config object
  const previewConfig = {
    ...brandConfig,
    name: storeName,
    brandName: storeName,
    tagline,
    primaryColor,
    accentColor,
    logoIcon,
    logoUrl: logoUrl.trim(),
  };

  const safeActiveTab = Math.min(activeOwnerTab, Math.max(0, owners.length - 1));

  return (
    <div id="admin-settings-page" className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">System & Brand Configuration</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Store Settings, Logo & Owners Management
          </h1>
          <p className="text-xs text-gray-500">
            Upload custom logo, customize brand identity, and add/edit/remove owners and co-owners for the home page showcase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#570000] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2 rounded-xl bg-[#570000] text-[#fdcc87] hover:bg-[#800000] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All Settings</span>
          </button>
        </div>
      </div>

      <div className="space-y-8 text-xs">
        {/* Section 1: Logo & Brand Emblem Configuration */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#eae5e2] pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#570000]/10 text-[#570000]">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Store Logo & Brand Emblem</h3>
                <p className="text-[11px] text-gray-500">Upload a custom logo image or select a traditional vector motif</p>
              </div>
            </div>
            {logoUrl && (
              <button
                type="button"
                onClick={() => setLogoUrl('')}
                className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Custom Logo</span>
              </button>
            )}
          </div>

          {/* Live Previews */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[10px] uppercase font-bold text-gray-400">Header / Light Theme Preview</span>
              <BrandLogo config={previewConfig} theme="light" />
            </div>

            <div className="p-6 rounded-2xl bg-[#1f1c1b] border border-black flex flex-col items-center justify-center text-center space-y-3">
              <span className="text-[10px] uppercase font-bold text-gray-400">Footer / Dark Theme Preview</span>
              <BrandLogo config={previewConfig} theme="dark" />
            </div>
          </div>

          {/* Logo Upload & URL Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="uppercase font-bold text-gray-600 block mb-1">
                Upload Custom Logo Image (PNG, SVG, JPG)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#570000] bg-[#570000]/5 hover:bg-[#570000]/10 cursor-pointer font-bold text-[#570000] transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingLogo ? 'Uploading Logo...' : 'Browse & Upload Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Recommended: Square or transparent PNG (e.g. 256x256)</p>
            </div>

            <div>
              <label className="uppercase font-bold text-gray-600 block mb-1">
                Or Direct Logo Image URL
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-mono focus:outline-hidden focus:border-[#570000]"
              />
            </div>
          </div>

          {/* Store Name, Tagline & Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#eae5e2]">
            <div>
              <label className="uppercase font-bold text-gray-600 block mb-1">Brand Name Text</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-serif font-bold tracking-wider text-sm focus:outline-hidden focus:border-[#570000]"
              />
            </div>

            <div>
              <label className="uppercase font-bold text-gray-600 block mb-1">Tagline Subtext</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="uppercase font-bold text-gray-600 block mb-1">Fallback Vector Emblem</label>
              <select
                value={logoIcon}
                onChange={(e: any) => setLogoIcon(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
              >
                <option value="temple">Traditional Temple Mandir</option>
                <option value="kalash">Auspicious Kalash Gopuram</option>
                <option value="om">Divine Vedic Om Symbol</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="uppercase font-bold text-gray-600 block mb-1">Primary Maroon</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-[#eae5e2]"
                  />
                  <span className="font-mono text-[11px]">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="uppercase font-bold text-gray-600 block mb-1">Accent Gold</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-9 rounded-lg cursor-pointer border border-[#eae5e2]"
                  />
                  <span className="font-mono text-[11px]">{accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1 Save Button */}
          <div className="flex justify-end pt-3 border-t border-[#eae5e2]">
            <button
              type="button"
              onClick={handleSaveLogoAndBrand}
              className="px-5 py-2.5 rounded-xl bg-[#570000] text-[#fdcc87] hover:bg-[#800000] font-bold text-xs shadow-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Brand Logo & Theme</span>
            </button>
          </div>
        </div>

        {/* Section 2: Owners & Co-Owners Management (Add / Remove / Edit) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#eae5e2] pb-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#570000]/10 text-[#570000]">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#1f1c1b]">
                  Shop Owners & Co-Owners ({owners.length})
                </h3>
                <p className="text-[11px] text-gray-500">
                  Add, edit, or remove owners shown on the home page auto-sliding showcase.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddOwner}
              className="px-4 py-2 rounded-xl bg-[#570000] text-[#fdcc87] text-xs font-bold hover:bg-[#800000] shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Owner / Co-Owner</span>
            </button>
          </div>

          {/* Top Bar Header Text Configuration */}
          <div className="bg-[#fbf9f8] p-4 rounded-2xl border border-[#eae5e2] space-y-1.5">
            <label className="uppercase font-bold text-gray-700 block text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#570000]" />
              <span>Top Bar Header Text (Shown on Home Page Owner Card)</span>
            </label>
            <input
              type="text"
              required
              value={ownersSectionTitle}
              onChange={(e) => setOwnersSectionTitle(e.target.value)}
              placeholder="FOUNDER OWNER & CO-OWNER"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#eae5e2] font-serif font-bold text-xs tracking-wider text-[#570000] focus:outline-hidden focus:border-[#570000]"
            />
            <p className="text-[10px] text-gray-400">
              Default: <strong>FOUNDER OWNER & CO-OWNER</strong>. This appears at the top bar of the owner portrait card.
            </p>
          </div>

          {/* Dynamic Tab Switcher */}
          <div className="flex flex-wrap border-b border-[#eae5e2] gap-2 pb-1">
            {owners.map((owner, idx) => (
              <div key={owner.id || idx} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveOwnerTab(idx)}
                  className={`py-2 px-3.5 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
                    safeActiveTab === idx
                      ? 'border-[#570000] bg-[#570000]/5 text-[#570000]'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <img
                    src={owner.image}
                    alt={owner.name}
                    onError={handleImageError}
                    className="w-5 h-5 rounded-full object-cover border border-[#eae5e2]"
                  />
                  <span>{owner.name || `Owner ${idx + 1}`}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Active Owner Form */}
          {owners[safeActiveTab] && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between bg-[#fbf9f8] p-3 rounded-2xl border border-[#eae5e2]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#570000] text-xs">
                    Editing Owner #{safeActiveTab + 1}: {owners[safeActiveTab].name}
                  </span>
                </div>

                {owners.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOwner(safeActiveTab)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove This Owner</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                {/* Photo Upload & Preview */}
                <div className="sm:col-span-1 space-y-3">
                  <label className="uppercase font-bold text-gray-600 block">Owner / Co-Owner Photo</label>
                  <div className="relative aspect-3/4 rounded-2xl overflow-hidden border-2 border-[#eae5e2] bg-[#fbf9f8] shadow-xs group">
                    <img
                      src={owners[safeActiveTab].image}
                      alt={owners[safeActiveTab].name}
                      onError={handleImageError}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                      <label className="px-3 py-2 bg-white text-[#1f1c1b] rounded-xl font-bold text-[11px] cursor-pointer shadow-md flex items-center gap-1.5 hover:bg-gray-100">
                        <Upload className="w-3.5 h-3.5 text-[#570000]" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleOwnerPhotoUpload(safeActiveTab, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <label className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#eae5e2] bg-[#fbf9f8] hover:bg-gray-100 cursor-pointer font-semibold text-gray-700 text-[11px] transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#570000]" />
                    <span>{uploadingOwnerIndex === safeActiveTab ? 'Uploading Photo...' : 'Browse Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOwnerPhotoUpload(safeActiveTab, e)}
                      className="hidden"
                      disabled={uploadingOwnerIndex === safeActiveTab}
                    />
                  </label>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Image URL</label>
                    <input
                      type="text"
                      value={owners[safeActiveTab].image}
                      onChange={(e) => updateOwnerField(safeActiveTab, 'image', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#fbf9f8] border border-[#eae5e2] font-mono text-[10px] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Owner Details (Name, Post, Experience) */}
                <div className="sm:col-span-2 space-y-4">
                  <div className="space-y-4">
                    {/* 1. Name */}
                    <div>
                      <label className="uppercase font-bold text-gray-600 block mb-1">
                        1. Full Name <span className="text-[#570000]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={owners[safeActiveTab].name}
                        onChange={(e) => updateOwnerField(safeActiveTab, 'name', e.target.value)}
                        placeholder="e.g. Pandit Ramkrishna Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-bold text-sm focus:outline-hidden focus:border-[#570000]"
                      />
                    </div>

                    {/* 2. Post / Role */}
                    <div>
                      <label className="uppercase font-bold text-gray-600 block mb-1">
                        2. Post / Role <span className="text-[#570000]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={owners[safeActiveTab].role}
                        onChange={(e) => updateOwnerField(safeActiveTab, 'role', e.target.value)}
                        placeholder="e.g. Founder & Master Sthapati / Co-Owner & Mandir Architect"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                      />
                    </div>

                    {/* 3. Experience */}
                    <div>
                      <label className="uppercase font-bold text-gray-600 block mb-1">
                        3. Experience / Lineage <span className="text-[#570000]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={owners[safeActiveTab].experience}
                        onChange={(e) => updateOwnerField(safeActiveTab, 'experience', e.target.value)}
                        placeholder="e.g. 38 Years Experience • 3rd Generation"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                      />
                    </div>

                    {/* 4. Operational Permissions & Authority */}
                    <div>
                      <label className="uppercase font-bold text-gray-600 block mb-1">
                        4. Operational Authority & Administrative Permissions
                      </label>
                      <select
                        value={owners[safeActiveTab].permission || 'FULL_ADMIN'}
                        onChange={(e) => updateOwnerField(safeActiveTab, 'permission', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold text-gray-800 focus:outline-hidden focus:border-[#570000]"
                      >
                        <option value="FULL_ADMIN">Full Administrative Authority (Manage All Store, Products & Orders)</option>
                        <option value="WORKSHOP_LEAD">Workshop & Architecture Lead (Manage Custom Orders & Catalog)</option>
                        <option value="SANCTUM_ARTISAN">Master Mandir Artisan (Consultation & Reviews)</option>
                        <option value="SHOWCASE_ONLY">Storefront Founder Profile Only (No Backend Access)</option>
                      </select>
                    </div>

                    {/* Optional Badge */}
                    <div>
                      <label className="uppercase font-bold text-gray-600 block mb-1">
                        Auspicious Badge (Optional)
                      </label>
                      <input
                        type="text"
                        value={owners[safeActiveTab].badge || ''}
                        onChange={(e) => updateOwnerField(safeActiveTab, 'badge', e.target.value)}
                        placeholder="e.g. Founder & Lead Artisan / Co-Owner"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden focus:border-[#570000]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2 Save Button */}
          <div className="flex justify-end pt-3 border-t border-[#eae5e2]">
            <button
              type="button"
              onClick={handleSaveOwners}
              className="px-5 py-2.5 rounded-xl bg-[#570000] text-[#fdcc87] hover:bg-[#800000] font-bold text-xs shadow-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Shop Owners & Header Title</span>
            </button>
          </div>
        </div>

        {/* Section 3: Contact & Workshop Operations */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#eae5e2] pb-4">
            <div className="p-2 rounded-xl bg-[#570000]/10 text-[#570000]">
              <Store className="w-4 h-4 text-[#570000]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Store Operations & Helpline Channels</h3>
              <p className="text-[11px] text-gray-500">Contact phone, support email, and physical workshop locations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="uppercase font-bold text-gray-600 block mb-1">Support Helpline / WhatsApp</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
              />
            </div>

            <div>
              <label className="uppercase font-bold text-gray-600 block mb-1">Official Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="uppercase font-bold text-gray-600 block mb-1">Artisan Workshops & Ateliers Location</label>
              <input
                type="text"
                value={workshopLocations}
                onChange={(e) => setWorkshopLocations(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 3 Save Button */}
          <div className="flex justify-end pt-3 border-t border-[#eae5e2]">
            <button
              type="button"
              onClick={handleSaveContact}
              className="px-5 py-2.5 rounded-xl bg-[#570000] text-[#fdcc87] hover:bg-[#800000] font-bold text-xs shadow-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Contact & Workshop Details</span>
            </button>
          </div>
        </div>

        {/* Global Save All Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#570000] to-[#800000] text-[#fdcc87] hover:brightness-110 font-bold text-xs shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>Save All Store Settings, Logo, Owners & Contacts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
