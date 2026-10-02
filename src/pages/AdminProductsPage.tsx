import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductCategory, MandirMaterial, FinishType, MountingType } from '../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  X, 
  Eye
} from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { products, adminAddProduct, adminUpdateProduct, adminDeleteProduct, formatPrice, navigateTo } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states for Add/Edit
  const [title, setTitle] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Traditional');
  const [material, setMaterial] = useState<MandirMaterial>('Teak Wood');
  const [price, setPrice] = useState('45000');
  const [originalPrice, setOriginalPrice] = useState('52000');
  const [dimensions, setDimensions] = useState('36"W x 20"D x 48"H');
  const [weight, setWeight] = useState('42 kg');
  const [finish, setFinish] = useState<FinishType>('Antique Honey');
  const [mounting, setMounting] = useState<MountingType>('Floor Rested');
  const [stock, setStock] = useState('8');
  const [imageUrl, setImageUrl] = useState('/images/mandirs/mandir_royal_sheesham.jpg');
  const [fullDesc, setFullDesc] = useState('Handcrafted home mandir crafted from aged timber with warm backlit LED illumination.');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const openAddModal = () => {
    setTitle('');
    setShortDesc('Handcrafted Solid Hardwood Home Mandir');
    setCategory('Traditional');
    setMaterial('Teak Wood');
    setPrice('45000');
    setOriginalPrice('52000');
    setDimensions('36"W x 20"D x 48"H');
    setWeight('42 kg');
    setFinish('Antique Honey');
    setMounting('Floor Rested');
    setStock('8');
    setImageUrl('/images/mandirs/mandir_royal_sheesham.jpg');
    setFullDesc('Handcrafted home mandir crafted from aged timber with warm backlit LED illumination.');
    setIsFeatured(false);
    setIsNew(true);
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setShortDesc(p.shortDescription || '');
    setCategory(p.category);
    setMaterial(p.material);
    setPrice(p.price.toString());
    setOriginalPrice(p.originalPrice?.toString() || '');
    setDimensions(p.dimensions);
    setWeight(p.weight);
    setFinish(p.finish);
    setMounting(p.mounting);
    setStock(p.stock.toString());
    setImageUrl(p.images[0] || '');
    setFullDesc(p.fullDescription || '');
    setIsFeatured(!!p.isFeatured);
    setIsNew(!!p.isNew);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const numericStock = parseInt(stock, 10) || 0;
    const numericPrice = parseFloat(price) || 0;
    const numericOriginalPrice = originalPrice ? parseFloat(originalPrice) : numericPrice;

    if (editingProduct) {
      // Update
      adminUpdateProduct(editingProduct.id, {
        title,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        category,
        material,
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        dimensions,
        weight,
        finish,
        mounting,
        stock: numericStock,
        inStock: numericStock > 0,
        images: [imageUrl, ...(editingProduct.images.slice(1))],
        isFeatured,
        isNew
      });
      setEditingProduct(null);
    } else {
      // Create
      adminAddProduct({
        id: `mandir-${Date.now()}`,
        sku: `AKM-${Math.floor(1000 + Math.random() * 9000)}`,
        title,
        shortDescription: shortDesc,
        fullDescription: fullDesc,
        category,
        material,
        price: numericPrice,
        originalPrice: numericOriginalPrice,
        dimensions,
        weight,
        finish,
        availableFinishes: ['Antique Honey', 'Dark Walnut', 'Natural Teak Polish'],
        mounting,
        stock: numericStock,
        inStock: numericStock > 0,
        images: [imageUrl, '/images/mandirs/mandir_detail_bells.jpg'],
        isFeatured,
        isNew,
        rating: 5.0,
        reviewsCount: 1,
        features: ['Warm LED Backlit Om', 'Solid Brass Bells (6x)', 'Slide-out Bhog Tray', 'Velvet Storage Drawer'],
        vastuNotes: 'Aligned with Ishanya (North-East) auspicious Vastu orientation principles.',
        warranty: '5 Years Structural Guarantee',
        tags: ['Pooja Mandir', 'Teak Wood', 'Handcrafted', 'Vastu Compliant'],
        status: 'active'
      });
      setIsAddModalOpen(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.material.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="admin-products-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <button
            onClick={() => navigateTo('admin-dashboard')}
            className="text-xs font-semibold text-[#7b581e] hover:text-[#570000] flex items-center gap-1 mb-1 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b]">
            Product Catalog Inventory ({products.length})
          </h1>
        </div>

        <button
          onClick={openAddModal}
          id="admin-add-product-btn"
          className="px-5 py-3 bg-[#570000] hover:bg-[#800000] text-white text-xs font-bold rounded-2xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Mandir Model</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#eae5e2] p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by model or wood..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'Traditional', 'Modern', 'Home Mandirs', 'Temple Style'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat ? 'bg-[#570000] text-white' : 'bg-[#f6f3f2] text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f3f2] border-b border-[#eae5e2] text-gray-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Mandir Model</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Material</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae5e2]">
              {filteredProducts.map(prod => (
                <tr key={prod.id} className="hover:bg-[#fbf9f8] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img src={prod.images[0]} alt={prod.title} className="w-12 h-12 object-cover rounded-xl border border-[#eae5e2]" />
                      <div>
                        <p className="font-serif font-bold text-[#1f1c1b] text-xs">{prod.title}</p>
                        <p className="text-[10px] text-gray-500">{prod.dimensions}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-gray-700">{prod.category}</td>
                  <td className="py-4 px-4 text-gray-600">{prod.material}</td>
                  <td className="py-4 px-4 font-bold font-serif text-[#570000]">{formatPrice(prod.price)}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      prod.stock > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${prod.stock > 5 ? 'bg-emerald-600' : 'bg-red-600'}`} />
                      {prod.stock} units
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {prod.isFeatured && <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded">Featured</span>}
                      {prod.isNew && <span className="bg-blue-100 text-blue-900 text-[9px] font-bold px-1.5 py-0.2 rounded">New</span>}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => navigateTo('product', { productId: prod.id })}
                      className="p-1.5 text-gray-400 hover:text-black"
                      title="View Product Page"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(prod)}
                      className="p-1.5 text-gray-400 hover:text-[#570000]"
                      title="Edit Product"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => adminDeleteProduct(prod.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#eae5e2] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
              <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">
                {editingProduct ? `Edit Mandir: ${editingProduct.title}` : 'Add New Handcrafted Mandir'}
              </h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Somnath Shikhara Teak Mandir"
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Short Description</label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={e => setShortDesc(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  >
                    <option value="Traditional">Traditional</option>
                    <option value="Modern">Modern</option>
                    <option value="Home Mandirs">Home Mandirs</option>
                    <option value="Temple Style">Temple Style</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Wood Material</label>
                  <select
                    value={material}
                    onChange={e => setMaterial(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  >
                    <option value="Teak Wood">Teak Wood</option>
                    <option value="Sheesham Wood">Sheesham Wood</option>
                    <option value="Rosewood">Rosewood</option>
                    <option value="White Cedar">White Cedar</option>
                    <option value="Composite Marble">Composite Marble</option>
                    <option value="Brass Inlay Teak">Brass Inlay Teak</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Finish</label>
                  <select
                    value={finish}
                    onChange={e => setFinish(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  >
                    <option value="Antique Honey">Antique Honey</option>
                    <option value="Natural Teak Polish">Natural Teak Polish</option>
                    <option value="Dark Walnut">Dark Walnut</option>
                    <option value="Heritage Rosewood">Heritage Rosewood</option>
                    <option value="Matte Ivory & Gold">Matte Ivory & Gold</option>
                    <option value="Pure White PU">Pure White PU</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="font-bold block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Weight</label>
                  <input
                    type="text"
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                    placeholder='36"W x 20"D x 48"H'
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Primary Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={fullDesc}
                  onChange={e => setFullDesc(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                />
              </div>

              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={e => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#570000]"
                  />
                  <span>Mark as Featured Mandir</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={e => setIsNew(e.target.checked)}
                    className="w-4 h-4 rounded text-[#570000]"
                  />
                  <span>Mark as New Arrival</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#eae5e2] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="px-5 py-2.5 border rounded-xl text-gray-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#570000] text-white rounded-xl font-bold shadow"
                >
                  {editingProduct ? 'Save Changes' : 'Create Mandir Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
