import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { getProductImageUrl, handleImageError } from '../../../utils/imageUtils';
import { AddCategoryModal } from '../../../components/common/AddCategoryModal';
import { Product, Category } from '../../../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Eye, 
  EyeOff, 
  Upload, 
  Filter, 
  Star, 
  SlidersHorizontal,
  Package,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { categories, formatPrice, showToast, refreshProducts } = useApp();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('45000');
  const [originalPrice, setOriginalPrice] = useState('50000');
  const [stockQuantity, setStockQuantity] = useState('8');
  const [material, setMaterial] = useState('Sheesham Wood');
  const [dimensions, setDimensions] = useState('36"W x 24"D x 48"H');
  const [mountingType, setMountingType] = useState('Floor Rested');
  const [colorFinish, setColorFinish] = useState('Natural Teak Polish');
  const [weight, setWeight] = useState('42 kg');
  const [warranty, setWarranty] = useState('5 Years Structural');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [vastuNotes, setVastuNotes] = useState('Designed according to Vedic Shastra proportions. Best positioned in North-East corner.');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'COMING_SOON'>('ACTIVE');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNew, setIsNew] = useState(false);
  
  // Image gallery URLs
  const [imageUrls, setImageUrls] = useState<string[]>([
    '/images/mandirs/mandir_royal_sheesham.jpg'
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchAdminProducts = async () => {
    try {
      setLoading(true);
      const res = await api.products.getAll({
        includeAllStatus: true,
        limit: 100,
      });
      if (res.success && res.data.products) {
        setProducts(res.data.products);
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setCategoryId(categories[0]?.id || '');
    setSku(`AKM-MND-${Math.floor(100 + Math.random() * 900)}`);
    setPrice('45000');
    setOriginalPrice('50000');
    setStockQuantity('8');
    setMaterial('Sheesham Wood');
    setDimensions('36"W x 24"D x 48"H');
    setMountingType('Floor Rested');
    setColorFinish('Natural Teak Polish');
    setWeight('42 kg');
    setWarranty('5 Years Structural');
    setShortDescription('Handcrafted seasoned timber home mandir with solid brass bells.');
    setFullDescription('The mandir is hand-chiseled by Saharanpur master woodcarvers featuring dual velvet-lined drawers and illuminated dome cavity.');
    setVastuNotes('Designed according to Vedic Shastra proportions. Best positioned in North-East (Ishanya) corner facing East.');
    setStatus('ACTIVE');
    setIsFeatured(false);
    setIsBestseller(false);
    setIsNew(true);
    setImageUrls([
      '/images/mandirs/mandir_royal_sheesham.jpg'
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setCategoryId(p.categoryId || categories.find(c => c.slug === p.category?.slug)?.id || categories[0]?.id || '');
    setSku(p.sku);
    setPrice(String(p.price));
    setOriginalPrice(String(p.originalPrice || p.price));
    setStockQuantity(String(p.stockQuantity));
    setMaterial(p.material);
    setDimensions(p.dimensions);
    setMountingType(p.mountingType);
    setColorFinish(p.colorFinish);
    setWeight(p.weight || '35 kg');
    setWarranty(p.warranty || '5 Years Structural');
    setShortDescription(p.shortDescription || '');
    setFullDescription(p.fullDescription || '');
    setVastuNotes(p.vastuNotes || '');
    setStatus(p.status || 'ACTIVE');
    setIsFeatured(p.isFeatured);
    setIsBestseller(p.isBestseller);
    setIsNew(p.isNew);
    setImageUrls(p.images && p.images.length > 0 ? p.images : ['/images/mandirs/mandir_royal_sheesham.jpg']);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingImage(true);
      try {
        const uploadedUrl = await api.upload.uploadImage(file);
        setImageUrls(prev => [...prev, uploadedUrl]);
        showToast('Image uploaded successfully.', 'success');
      } catch (err: any) {
        showToast(err.message || 'Image upload failed.', 'error');
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !categoryId || !price) {
      showToast('Title, Category, and Price are required.', 'error');
      return;
    }

    try {
      const payload = {
        title: title.trim(),
        categoryId,
        sku: sku.trim(),
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(price),
        stockQuantity: parseInt(stockQuantity, 10) || 0,
        material,
        dimensions,
        mountingType,
        colorFinish,
        availableFinishes: [colorFinish, 'Dark Walnut', 'Antique Honey', 'Heritage Rosewood'],
        weight,
        warranty,
        shortDescription: shortDescription.trim(),
        fullDescription: fullDescription.trim(),
        vastuNotes: vastuNotes.trim(),
        status,
        isFeatured,
        isBestseller,
        isNew,
        images: imageUrls.filter(url => url.trim() !== ''),
      };

      if (editingProduct) {
        const res = await api.products.update(editingProduct.id, payload);
        showToast(`Product "${title}" updated successfully!`, 'success');
      } else {
        const res = await api.products.create(payload);
        showToast(`New Product "${title}" created and published successfully!`, 'success');
      }

      setIsModalOpen(false);
      await fetchAdminProducts();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Error saving product.', 'error');
    }
  };

  const handleQuickStatusToggle = async (p: Product, newStatus: string) => {
    try {
      await api.products.updateStatus(p.id, newStatus);
      showToast(`Product "${p.title}" status updated to ${newStatus} successfully!`, 'success');
      await fetchAdminProducts();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to update product status.', 'error');
    }
  };

  const handleQuickStockUpdate = async (p: Product, delta: number) => {
    const newQty = Math.max(0, p.stockQuantity + delta);
    try {
      await api.products.updateStock(p.id, newQty);
      showToast(`Stock for "${p.title}" updated to ${newQty} units successfully!`, 'success');
      await fetchAdminProducts();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock quantity.', 'error');
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!window.confirm(`Are you sure you want to delete product "${p.title}"?`)) return;

    try {
      const res = await api.products.delete(p.id);
      showToast(`Product "${p.title}" deleted successfully!`, 'info');
      await fetchAdminProducts();
      await refreshProducts();
    } catch (err: any) {
      showToast(err.message || 'Error deleting product.', 'error');
    }
  };

  // Filtered list
  const filteredList = products.filter(p => {
    if (selectedCatFilter !== 'All') {
      const catMatch = (p.category && (p.category.slug === selectedCatFilter || p.category.id === selectedCatFilter)) || p.categoryId === selectedCatFilter;
      if (!catMatch) return false;
    }
    if (selectedStatusFilter !== 'All' && p.status !== selectedStatusFilter) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.material.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div id="admin-products-page" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Finished Mandir Inventory</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Product Management ({products.length})
          </h1>
          <p className="text-xs text-gray-500">Live database-driven products catalog. Changes reflect immediately on storefront.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Mandir Creation</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#eae5e2] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, SKU, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold text-gray-700 focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold text-gray-700 focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
            <option value="COMING_SOON">Coming Soon</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eae5e2] bg-[#fbf9f8] text-gray-500 uppercase font-bold">
                <th className="p-4">Product Details</th>
                <th className="p-4">SKU & Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Product Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae5e2]">
              {filteredList.map((p) => {
                const isOutOfStock = p.stockQuantity <= 0;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductImageUrl(p, 0)}
                          alt={p.title}
                          onError={handleImageError}
                          className="w-14 h-14 rounded-xl object-cover border border-[#eae5e2]"
                        />
                        <div>
                          <strong className="text-sm font-serif font-bold text-[#1f1c1b] block">{p.title}</strong>
                          <span className="text-[11px] text-gray-500">{p.material} • {p.mountingType}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-mono text-gray-600 block">{p.sku}</span>
                      <span className="text-[11px] text-[#7b581e] font-semibold">{p.category?.name || 'Traditional'}</span>
                    </td>

                    <td className="p-4">
                      <strong className="font-serif font-bold text-sm text-[#570000] block">{formatPrice(p.price)}</strong>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span className="text-[11px] text-gray-400 line-through">{formatPrice(p.originalPrice)}</span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickStockUpdate(p, -1)}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                          isOutOfStock ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.stockQuantity} {isOutOfStock ? '(Out of Stock)' : 'Units'}
                        </span>
                        <button
                          onClick={() => handleQuickStockUpdate(p, 1)}
                          className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 font-bold flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="p-4">
                      <select
                        value={p.status}
                        onChange={(e) => handleQuickStatusToggle(p, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border focus:outline-hidden ${
                          p.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : p.status === 'DRAFT'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="DRAFT">DRAFT</option>
                        <option value="COMING_SOON">COMING_SOON</option>
                      </select>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#570000] hover:border-[#570000]"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-300"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveProduct} className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
              <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">
                {editingProduct ? `Edit Mandir: ${editingProduct.title}` : 'Add New Handcrafted Mandir'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="uppercase font-bold text-gray-500 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Royal Sheesham Wood Mandir"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="uppercase font-bold text-gray-500 block">Mandir Category</label>
                  <button
                    type="button"
                    onClick={() => setIsAddCatModalOpen(true)}
                    className="text-[11px] font-bold text-[#570000] hover:text-[#800000] flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ New Category</span>
                  </button>
                </div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">SKU Code</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-mono font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-bold text-sm focus:outline-hidden"
                />
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Original / Strike Price (₹)</label>
                <input
                  type="number"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-bold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Product Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
                >
                  <option value="ACTIVE">ACTIVE (Visible on Storefront)</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="COMING_SOON">COMING SOON</option>
                </select>
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Material / Timber</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Dimensions</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Mounting Type</label>
                <select
                  value={mountingType}
                  onChange={(e) => setMountingType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                >
                  <option value="Floor Rested">Floor Rested</option>
                  <option value="Wall Mounted">Wall Mounted</option>
                  <option value="Convertible (Floor/Wall)">Convertible (Floor/Wall)</option>
                </select>
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Polish / Finish</label>
                <input
                  type="text"
                  value={colorFinish}
                  onChange={(e) => setColorFinish(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="uppercase font-bold text-gray-500 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="uppercase font-bold text-gray-500 block mb-1">Full Description & Artisan Notes</label>
                <textarea
                  rows={3}
                  value={fullDescription}
                  onChange={(e) => setFullDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                />
              </div>

              {/* Multi-Image Gallery */}
              <div className="sm:col-span-2 space-y-2 pt-2 border-t border-[#eae5e2]">
                <div className="flex justify-between items-center">
                  <label className="uppercase font-bold text-gray-500 block">Product Gallery Images ({imageUrls.length})</label>
                  <label className="px-3 py-1 bg-[#570000] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#800000]">
                    + Upload Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-[#eae5e2] aspect-4/3">
                      <img
                        src={getProductImageUrl(url)}
                        alt={`Gallery ${idx}`}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2 border-t border-[#eae5e2]">
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#570000] rounded"
                  />
                  <span>Featured Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                    className="w-4 h-4 accent-[#570000] rounded"
                  />
                  <span>Bestseller</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="w-4 h-4 accent-[#570000] rounded"
                  />
                  <span>New Arrival</span>
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
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddCatModalOpen && (
        <AddCategoryModal
          isOpen={isAddCatModalOpen}
          onClose={() => setIsAddCatModalOpen(false)}
          onCategoryCreated={(newCat) => {
            setCategoryId(newCat.id);
          }}
        />
      )}
    </div>
  );
};
