import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductCategory } from '../types';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  Eye, 
  ChevronDown, 
  Check, 
  RotateCcw,
  Sparkles,
  Grid,
  List
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    searchQuery, 
    navigateTo, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    formatPrice, 
    setQuickViewProduct 
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>(selectedCategory || 'All');
  const [materialFilter, setMaterialFilter] = useState<string>('All');
  const [mountingFilter, setMountingFilter] = useState<string>('All');
  const [finishFilter, setFinishFilter] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<number>(10000);
  const [maxPrice, setMaxPrice] = useState<number>(130000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [localSearch, setLocalSearch] = useState<string>(searchQuery || '');

  // Update category when context selectedCategory changes
  React.useEffect(() => {
    if (selectedCategory) {
      setCategoryFilter(selectedCategory);
    }
  }, [selectedCategory]);

  React.useEffect(() => {
    if (searchQuery !== undefined) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  const categories: string[] = ['All', 'Traditional', 'Modern', 'Home Mandirs', 'Temple Style'];
  const materials: string[] = ['All', 'Sheesham Wood', 'Teak Wood', 'Rosewood', 'Composite Marble', 'Brass Inlay Teak'];
  const mountings: string[] = ['All', 'Floor Rested', 'Wall Mounted', 'Convertible (Floor/Wall)'];
  const finishes: string[] = ['All', 'Natural Teak Polish', 'Dark Walnut', 'Antique Honey', 'Heritage Rosewood', 'Matte Ivory & Gold'];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category match
      if (categoryFilter !== 'All' && product.category !== categoryFilter) {
        return false;
      }
      // Material match
      if (materialFilter !== 'All' && product.material !== materialFilter) {
        return false;
      }
      // Mounting match
      if (mountingFilter !== 'All' && product.mounting !== mountingFilter) {
        return false;
      }
      // Finish match
      if (finishFilter !== 'All' && !product.availableFinishes.includes(finishFilter as any)) {
        return false;
      }
      // Price range
      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }
      // Stock
      if (inStockOnly && !product.inStock) {
        return false;
      }
      // Search
      if (localSearch.trim() !== '') {
        const query = localSearch.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        const matchesMaterial = product.material.toLowerCase().includes(query);
        const matchesSku = product.sku.toLowerCase().includes(query);
        const matchesTags = product.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesCategory && !matchesMaterial && !matchesSku && !matchesTags) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, categoryFilter, materialFilter, mountingFilter, finishFilter, minPrice, maxPrice, inStockOnly, localSearch, sortBy]);

  const resetAllFilters = () => {
    setCategoryFilter('All');
    setMaterialFilter('All');
    setMountingFilter('All');
    setFinishFilter('All');
    setMinPrice(10000);
    setMaxPrice(130000);
    setInStockOnly(false);
    setLocalSearch('');
  };

  const activeFiltersCount = 
    (categoryFilter !== 'All' ? 1 : 0) +
    (materialFilter !== 'All' ? 1 : 0) +
    (mountingFilter !== 'All' ? 1 : 0) +
    (finishFilter !== 'All' ? 1 : 0) +
    (minPrice > 10000 || maxPrice < 130000 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (localSearch ? 1 : 0);

  return (
    <div id="catalog-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#570000] to-[#7b581e] text-white rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#fdcc87]">
            Handcrafted Mandir Collection
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#fbf9f8]">
            Handcrafted Home Mandirs
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
            Discover 100% solid seasoned Sheesham and Teak wood home temples. Engineered for cosmic harmony and modern living spaces.
          </p>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar (Desktop) */}
        <aside id="catalog-filters-sidebar" className="hidden lg:block bg-white p-6 rounded-2xl border border-[#eae5e2] shadow-sm space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-[#eae5e2]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#570000]" />
              <h3 className="font-bold text-sm text-[#1f1c1b]">Filter Mandirs</h3>
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-[#7b581e] hover:text-[#570000] font-semibold flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search inside catalog */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Search Catalog</label>
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="e.g., Sheesham, Gopuram..."
              className="w-full text-xs px-3 py-2 rounded-lg bg-[#f6f3f2] border border-[#eae5e2] focus:outline-none focus:border-[#570000]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Mandir Category</label>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    categoryFilter === cat
                      ? 'bg-[#570000] text-white font-semibold'
                      : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  <span>{cat}</span>
                  {categoryFilter === cat && <Check className="w-3.5 h-3.5 text-[#fdcc87]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Material Filter */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Wood / Material</label>
            <div className="space-y-1">
              {materials.map(mat => (
                <button
                  key={mat}
                  onClick={() => setMaterialFilter(mat)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    materialFilter === mat
                      ? 'bg-[#7b581e] text-white font-semibold'
                      : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  <span>{mat}</span>
                  {materialFilter === mat && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mounting Filter */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">Mounting Style</label>
            <div className="space-y-1">
              {mountings.map(m => (
                <button
                  key={m}
                  onClick={() => setMountingFilter(m)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    mountingFilter === m
                      ? 'bg-[#7b581e] text-white font-semibold'
                      : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  <span>{m}</span>
                  {mountingFilter === m && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Dual Slider */}
          <div className="space-y-2 pt-2 border-t border-[#eae5e2]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-700">Price Range</span>
              <span className="text-[#570000] font-bold">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="130000"
              step="2000"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#570000] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>{formatPrice(10000)}</span>
              <span>{formatPrice(130000)}</span>
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-2 border-t border-[#eae5e2]">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#570000] focus:ring-[#570000] accent-[#570000]"
              />
              <span>In Stock Only (Ready to Ship)</span>
            </label>
          </div>
        </aside>

        {/* Product Catalog Grid / Main Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#eae5e2] flex flex-wrap items-center justify-between gap-4 shadow-sm">
            {/* Left: Count and Active Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden px-3 py-2 rounded-lg bg-[#570000] text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
              </button>

              <p className="text-xs font-semibold text-gray-700">
                Showing <span className="text-[#570000] font-bold">{filteredProducts.length}</span> mandirs
              </p>

              {categoryFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#570000]/10 text-[#570000] font-semibold px-2.5 py-1 rounded-full">
                  Category: {categoryFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setCategoryFilter('All')} />
                </span>
              )}

              {materialFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-[#7b581e]/10 text-[#7b581e] font-semibold px-2.5 py-1 rounded-full">
                  {materialFilter}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMaterialFilter('All')} />
                </span>
              )}
            </div>

            {/* Right: Sort and View Mode */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500 font-medium hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold bg-[#f6f3f2] border border-[#eae5e2] rounded-lg px-2.5 py-1.5 text-gray-800 focus:outline-none focus:border-[#570000]"
                >
                  <option value="featured">Featured Artisanal</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                  <option value="newest">Newest Designs</option>
                </select>
              </div>

              {/* View Switcher */}
              <div className="hidden sm:flex items-center border border-[#eae5e2] rounded-lg p-0.5 bg-[#f6f3f2]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow text-[#570000]' : 'text-gray-500 hover:text-black'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow text-[#570000]' : 'text-gray-500 hover:text-black'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid or Empty State */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#eae5e2] p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#f6f3f2] text-gray-400 flex items-center justify-center mx-auto">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold font-serif text-[#1f1c1b]">No Mandirs Match Your Filters</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Try widening your price range, clearing filters, or exploring our bespoke custom design service for unique dimensional requests.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={resetAllFilters}
                  className="px-4 py-2 bg-[#570000] text-white text-xs font-bold rounded-xl shadow"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={() => navigateTo('custom')}
                  className="px-4 py-2 bg-[#fdcc87] text-[#3e0000] text-xs font-bold rounded-xl shadow"
                >
                  Request Bespoke Mandir ✨
                </button>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(prod => {
                const isSaved = isInWishlist(prod.id);
                return (
                  <div
                    key={prod.id}
                    id={`catalog-card-${prod.id}`}
                    className="bg-white rounded-2xl overflow-hidden border border-[#eae5e2] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    {/* Image */}
                    <div 
                      className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer"
                      onClick={() => navigateTo('product', { productId: prod.id })}
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {prod.isNew && (
                          <span className="bg-[#7b581e] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            New Design
                          </span>
                        )}
                        {prod.discountPercentage && (
                          <span className="bg-[#570000] text-[#fdcc87] text-[10px] font-bold px-2 py-0.5 rounded shadow">
                            {prod.discountPercentage}% OFF
                          </span>
                        )}
                      </div>

                      {/* Floating actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(prod.id);
                          }}
                          className={`p-2 rounded-full backdrop-blur-md shadow-md transition-all ${
                            isSaved 
                              ? 'bg-[#570000] text-white' 
                              : 'bg-white/90 text-gray-700 hover:text-[#570000] hover:bg-white'
                          }`}
                          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(prod);
                          }}
                          className="p-2 rounded-full bg-white/90 text-gray-700 hover:text-[#570000] hover:bg-white backdrop-blur-md shadow-md transition-all"
                          title="Quick View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                          <span className="font-semibold text-[#7b581e] uppercase tracking-wider">{prod.category}</span>
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="font-bold text-gray-800 ml-0.5">{prod.rating}</span>
                          </div>
                        </div>

                        <h3 
                          onClick={() => navigateTo('product', { productId: prod.id })}
                          className="font-serif font-bold text-base text-[#1f1c1b] group-hover:text-[#570000] transition-colors cursor-pointer line-clamp-1"
                        >
                          {prod.title}
                        </h3>

                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {prod.material} • {prod.dimensions}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#eae5e2] flex items-center justify-between">
                        <div>
                          <span className="text-base font-bold text-[#570000] block">{formatPrice(prod.price)}</span>
                          {prod.originalPrice > prod.price && (
                            <span className="text-[11px] text-gray-400 line-through">{formatPrice(prod.originalPrice)}</span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(prod, 1, prod.finish)}
                          className="py-2 px-3 rounded-lg bg-[#570000] hover:bg-[#800000] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {filteredProducts.map(prod => {
                const isSaved = isInWishlist(prod.id);
                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl overflow-hidden border border-[#eae5e2] p-4 flex flex-col sm:flex-row gap-4 items-center shadow-sm hover:shadow-md transition-all group"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      onClick={() => navigateTo('product', { productId: prod.id })}
                      className="w-full sm:w-48 h-36 object-cover rounded-xl cursor-pointer"
                    />

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="text-[10px] font-bold text-[#570000] bg-[#570000]/10 px-2 py-0.5 rounded uppercase">
                          {prod.category}
                        </span>
                        <div className="flex items-center text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                          <span>{prod.rating} ({prod.reviewsCount})</span>
                        </div>
                      </div>

                      <h3
                        onClick={() => navigateTo('product', { productId: prod.id })}
                        className="font-serif font-bold text-lg text-[#1f1c1b] group-hover:text-[#570000] cursor-pointer"
                      >
                        {prod.title}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2">
                        {prod.shortDescription}
                      </p>

                      <p className="text-xs text-[#7b581e] font-semibold">
                        Specs: {prod.material} • {prod.dimensions} • {prod.mounting}
                      </p>
                    </div>

                    <div className="sm:border-l border-[#eae5e2] sm:pl-6 text-center sm:text-right flex flex-col justify-between space-y-3 w-full sm:w-auto">
                      <div>
                        <span className="text-xl font-bold text-[#570000] block">{formatPrice(prod.price)}</span>
                        {prod.originalPrice > prod.price && (
                          <span className="text-xs text-gray-400 line-through block">{formatPrice(prod.originalPrice)}</span>
                        )}
                      </div>

                      <div className="flex gap-2 justify-center sm:justify-end">
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className={`p-2.5 rounded-xl border ${isSaved ? 'bg-[#570000] text-white border-[#570000]' : 'border-gray-200 text-gray-600'}`}
                        >
                          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => addToCart(prod, 1, prod.finish)}
                          className="px-4 py-2.5 bg-[#570000] hover:bg-[#800000] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-[#eae5e2]">
              <h3 className="font-bold text-base text-[#1f1c1b]">Filter Mandirs</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-center border ${
                      categoryFilter === cat ? 'bg-[#570000] text-white border-[#570000]' : 'bg-[#f6f3f2] border-[#eae5e2] text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">Material</label>
              <div className="space-y-1">
                {materials.map(mat => (
                  <button
                    key={mat}
                    onClick={() => setMaterialFilter(mat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between ${
                      materialFilter === mat ? 'bg-[#7b581e] text-white' : 'text-gray-700 hover:bg-[#f6f3f2]'
                    }`}
                  >
                    <span>{mat}</span>
                    {materialFilter === mat && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Max Price: {formatPrice(maxPrice)}
              </label>
              <input
                type="range"
                min="10000"
                max="130000"
                step="2000"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#570000]"
              />
            </div>

            <div className="pt-4 border-t border-[#eae5e2] flex gap-3">
              <button
                onClick={resetAllFilters}
                className="flex-1 py-3 border border-gray-300 text-gray-700 text-xs font-bold rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 bg-[#570000] text-white text-xs font-bold rounded-xl shadow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
