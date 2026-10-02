import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { getCategoryImageUrl, handleImageError } from '../../../utils/imageUtils';
import { Category } from '../../../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Layers, 
  X, 
  Check, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ArrowUpDown,
  Camera,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { showToast, refreshCategories } = useApp();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [image, setImage] = useState('');
  const [orderIndex, setOrderIndex] = useState('1');
  const [isActive, setIsActive] = useState(true);

  // Image Upload
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchAllCategories = async () => {
    try {
      setLoading(true);
      const res = await api.categories.getAll(true); // includeInactive = true
      if (res.success && res.data.categories) {
        setCategories(res.data.categories);
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('Handcrafted home mandirs designed with authentic Gujarati & Vedic jaali carvings.');
    setBadge('Heritage Classic');
    setImage('/images/mandirs/mandir_royal_sheesham.jpg');
    setOrderIndex(String(categories.length + 1));
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setBadge(cat.badge || '');
    setImage(cat.image || '');
    setOrderIndex(String(cat.orderIndex));
    setIsActive(cat.isActive);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const uploadedUrl = await api.upload.uploadImage(file);
        setImage(uploadedUrl);
        showToast('Category image uploaded successfully!', 'success');
      } catch (err: any) {
        showToast(err.message || 'Image upload failed.', 'error');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleDirectCategoryImageUpload = async (cat: Category, file: File) => {
    try {
      showToast(`Uploading image for ${cat.name}...`, 'info');
      const uploadedUrl = await api.upload.uploadImage(file);
      await api.categories.update(cat.id, { image: uploadedUrl });
      showToast(`Image updated for "${cat.name}"!`, 'success');
      await fetchAllCategories();
      await refreshCategories();
    } catch (err: any) {
      showToast(err.message || 'Image upload failed.', 'error');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Category name is required.', 'error');
      return;
    }

    try {
      if (editingCategory) {
        // Update
        const res = await api.categories.update(editingCategory.id, {
          name: name.trim(),
          description: description.trim(),
          badge: badge.trim() || null,
          image,
          orderIndex: parseInt(orderIndex, 10) || 1,
          isActive,
        });
        showToast(`Category "${name}" updated successfully!`, 'success');
      } else {
        // Create
        const res = await api.categories.create({
          name: name.trim(),
          description: description.trim(),
          badge: badge.trim() || null,
          image,
          orderIndex: parseInt(orderIndex, 10) || 1,
          isActive,
        });
        showToast(`New Mandir Category "${name}" created successfully!`, 'success');
      }

      setIsModalOpen(false);
      await fetchAllCategories();
      await refreshCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to save category.', 'error');
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await api.categories.update(cat.id, { isActive: !cat.isActive });
      showToast(`Category "${cat.name}" is now ${cat.isActive ? 'Inactive' : 'Active'} on storefront!`, 'info');
      await fetchAllCategories();
      await refreshCategories();
    } catch (err: any) {
      showToast(err.message || 'Error updating status.', 'error');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;

    try {
      const res = await api.categories.delete(cat.id);
      showToast(`Category "${cat.name}" deleted successfully!`, 'info');
      await fetchAllCategories();
      await refreshCategories();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category.', 'error');
    }
  };

  return (
    <div id="admin-categories-page" className="space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Catalog Taxonomies</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Mandir Categories ({categories.length})
          </h1>
          <p className="text-xs text-gray-500">Manage primary mandir types (Traditional, Modern, Temple Style, etc.).</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Mandir Type</span>
        </button>
      </div>

      {/* Category Grid / Table */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eae5e2] bg-[#fbf9f8] text-gray-500 uppercase font-bold">
                <th className="p-4">Category</th>
                <th className="p-4">Slug URL</th>
                <th className="p-4">Badge</th>
                <th className="p-4">Products</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae5e2]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative group w-14 h-14 shrink-0 rounded-2xl overflow-hidden border border-[#eae5e2] shadow-2xs bg-[#fbf9f8]">
                        <img
                          src={getCategoryImageUrl(cat)}
                          alt={cat.name}
                          onError={handleImageError}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <label
                          className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[#fdcc87] text-[9px] font-bold text-center p-1"
                          title="Change Category Photo"
                        >
                          <Camera className="w-4 h-4 mb-0.5" />
                          <span>Change</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleDirectCategoryImageUpload(cat, e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <strong className="text-sm font-serif font-bold text-[#1f1c1b] block">{cat.name}</strong>
                        <span className="text-[11px] text-gray-500 line-clamp-1 max-w-xs">{cat.description}</span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-gray-600">/mandirs/{cat.slug}</td>

                  <td className="p-4">
                    {cat.badge ? (
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#fdcc87]/30 text-[#570000]">
                        {cat.badge}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 font-bold text-gray-700">
                      {cat._count?.products || 0} Mandirs
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(cat)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        cat.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {cat.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{cat.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#570000] hover:border-[#570000]"
                        title="Edit Category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveCategory} className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
              <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">
                {editingCategory ? 'Edit Mandir Category' : 'Create New Mandir Category'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luxury Glass Mandirs, Temple Style"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Display Badge (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Heritage Classic, Masterpiece, New"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description for collection cards..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
                />
              </div>

              {/* Category Image Upload & Preview */}
              <div className="space-y-2 pt-2 border-t border-[#eae5e2]">
                <label className="uppercase font-bold text-gray-600 block">Category Image / Photo</label>
                
                {/* Live Image Preview */}
                <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-[#eae5e2] bg-[#fbf9f8] group shadow-inner">
                  {image ? (
                    <img
                      src={image}
                      alt="Category Preview"
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1.5">
                      <ImageIcon className="w-8 h-8 stroke-1" />
                      <span className="text-[11px]">No category image assigned</span>
                    </div>
                  )}

                  {/* Upload overlay */}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-bold gap-1">
                    <Camera className="w-6 h-6 text-[#fdcc87]" />
                    <span>{uploadingImage ? 'Uploading image...' : 'Click or drop to replace photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-bold gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#fdcc87]" />
                      <span>Uploading Image...</span>
                    </div>
                  )}
                </div>

                {/* Upload & URL Controls */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <label className="px-4 py-2.5 bg-[#570000] text-white hover:bg-[#800000] rounded-xl cursor-pointer font-bold text-xs shrink-0 flex items-center justify-center gap-2 shadow-xs transition-colors">
                    <Upload className="w-4 h-4 text-[#fdcc87]" />
                    <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Or enter image URL (https://...)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-mono text-[11px] focus:outline-hidden focus:border-[#570000]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#570000] rounded"
                  />
                  <span className="font-semibold text-gray-700">Category Active on Storefront</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#eae5e2]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#570000] text-white text-xs font-bold hover:bg-[#800000]"
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
