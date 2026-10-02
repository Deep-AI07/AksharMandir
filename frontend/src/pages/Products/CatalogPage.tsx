import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl, getCategoryImageUrl, handleImageError } from '../../utils/imageUtils';
import { Product } from '../../types';
import { 
  Filter, 
  SlidersHorizontal, 
  Search, 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  Eye, 
  Sparkles, 
  Check, 
  Plus,
  Layers,
  Home,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CatalogPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { 
    products, 
    categories, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    formatPrice, 
    setQuickViewProduct,
    isAdmin
  } = useApp();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlug || searchParams.get('category') || 'All');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('All');
  const [selectedMounting, setSelectedMounting] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Synchronize category slug from URL
  useEffect(() => {
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    } else if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category') || 'All');
    }
    setCurrentPage(1);
  }, [categorySlug, searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMaterial, selectedMounting, maxPrice, inStockOnly, searchQuery, sortBy]);

  // Synchronize search query from URL
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const materials = ['All', 'Sheesham Wood', 'Teak Wood', 'Rosewood', 'Composite Marble', 'Brass Inlay Teak'];
  const mountings = ['All', 'Floor Rested', 'Wall Mounted', 'Convertible (Floor/Wall)'];

  // Current category metadata
  const currentCatObj = categories.find(c => c.slug === selectedCategory || c.name === selectedCategory);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Status check
      if (p.status !== 'ACTIVE') return false;

      // Category check
      if (selectedCategory !== 'All') {
        const catMatch = 
          (p.category && (typeof p.category === 'object' ? (p.category.slug === selectedCategory || p.category.name.toLowerCase() === selectedCategory.toLowerCase()) : String(p.category).toLowerCase() === selectedCategory.toLowerCase())) ||
          (p.categoryId === selectedCategory);
        if (!catMatch) return false;
      }

      // Material check
      if (selectedMaterial !== 'All' && !p.material.toLowerCase().includes(selectedMaterial.toLowerCase())) {
        return false;
      }

      // Mounting check
      if (selectedMounting !== 'All' && !p.mountingType.toLowerCase().includes(selectedMounting.toLowerCase())) {
        return false;
      }

      // Price check
      if (p.price > maxPrice) return false;

      // In Stock
      if (inStockOnly && p.stockQuantity <= 0) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.material.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
      // featured
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });
  }, [products, selectedCategory, selectedMaterial, selectedMounting, maxPrice, inStockOnly, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedMaterial('All');
    setSelectedMounting('All');
    setMaxPrice(150000);
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('featured');
    setCurrentPage(1);
    navigate('/mandirs');
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    if (slug === 'All') {
      navigate('/mandirs');
    } else {
      navigate(`/mandirs/${slug}`);
    }
  };

  return (
    <div id="catalog-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb & Quick Home Action */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#eae5e2]">
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#570000] flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <Link to="/mandirs" className="hover:text-[#570000]">All Mandirs</Link>
          {currentCatObj && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-[#570000] font-bold">{currentCatObj.name}</span>
            </>
          )}
        </nav>

        <Link
          to="/"
          className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#7b581e]">
          Vedic Artisanal Directory
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1f1c1b]">
          {currentCatObj ? currentCatObj.name : 'Handcrafted Home Mandirs & Pooja Ghar'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
          {currentCatObj?.description || 'Explore our complete home mandir collection, hand-carved by master wood artisans using seasoned Sheesham and Burma Teak.'}
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#eae5e2] shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, SKU, bells, carving..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden focus:border-[#570000]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden px-4 py-2 bg-[#fbf9f8] border border-[#eae5e2] rounded-xl text-xs font-bold text-[#1f1c1b] flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold text-[#1f1c1b] focus:outline-hidden"
            >
              <option value="featured">Featured Mandirs</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horizontal Category Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => handleCategoryChange('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedCategory === 'All'
              ? 'bg-[#570000] text-[#fdcc87] shadow-md shadow-[#570000]/20'
              : 'bg-white text-gray-700 border border-[#eae5e2] hover:bg-[#f6f3f2]'
          }`}
        >
          All Collections ({products.filter(p => p.status === 'ACTIVE').length})
        </button>

        {categories.filter(c => c.isActive).map(cat => {
          const isSelected = selectedCategory === cat.slug || selectedCategory === cat.name;
          const count = products.filter(p => p.status === 'ACTIVE' && (p.categoryId === cat.id || (typeof p.category === 'object' ? p.category?.slug === cat.slug : String(p.category).toLowerCase() === cat.name.toLowerCase()))).length;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-2 border transition-all ${
                isSelected
                  ? 'bg-[#570000] text-white border-[#570000] shadow-md'
                  : 'bg-white text-gray-700 border-[#eae5e2] hover:bg-[#f6f3f2]'
              }`}
            >
              <img
                src={getCategoryImageUrl(cat)}
                alt={cat.name}
                onError={handleImageError}
                className="w-5 h-5 rounded-md object-cover"
              />
              <span>{cat.name}</span>
              {cat.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                  isSelected ? 'bg-white/20 text-[#fdcc87]' : 'bg-[#fdcc87]/30 text-[#570000]'
                }`}>
                  {cat.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-6 rounded-3xl border border-[#eae5e2] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#eae5e2]">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#570000]" />
              <span>Filter Mandirs</span>
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-[#7b581e] font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold tracking-wider text-gray-500 block">Mandir Type</label>

            <div className="space-y-1">
              <button
                onClick={() => handleCategoryChange('All')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  selectedCategory === 'All' ? 'bg-[#570000] text-white font-bold' : 'text-gray-700 hover:bg-[#f6f3f2]'
                }`}
              >
                All Handcrafted Mandirs
              </button>
              {categories.filter(c => c.isActive).map(cat => {
                const isSelected = selectedCategory === cat.slug || selectedCategory === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#570000] text-white font-bold'
                        : 'text-gray-700 hover:bg-[#f6f3f2]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={getCategoryImageUrl(cat)}
                        alt={cat.name}
                        onError={handleImageError}
                        className="w-6 h-6 rounded-md object-cover border border-[#eae5e2]"
                      />
                      <span>{cat.name}</span>
                    </div>
                    {cat.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#fdcc87]/30 text-[#570000]'
                      }`}>
                        {cat.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material Filter */}
          <div className="space-y-2 pt-4 border-t border-[#eae5e2]">
            <label className="text-xs uppercase font-bold tracking-wider text-gray-500">Timber & Material</label>
            <div className="space-y-1">
              {materials.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMaterial(m)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedMaterial === m ? 'bg-[#570000] text-white font-bold' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Mounting Filter */}
          <div className="space-y-2 pt-4 border-t border-[#eae5e2]">
            <label className="text-xs uppercase font-bold tracking-wider text-gray-500">Mounting Style</label>
            <div className="space-y-1">
              {mountings.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMounting(m)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedMounting === m ? 'bg-[#570000] text-white font-bold' : 'text-gray-700 hover:bg-[#f6f3f2]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-4 border-t border-[#eae5e2]">
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase font-bold tracking-wider text-gray-500">Max Budget</span>
              <span className="font-serif font-bold text-[#570000]">{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="150000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#570000]"
            />
          </div>

          {/* In Stock Only Toggle */}
          <div className="pt-4 border-t border-[#eae5e2]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 accent-[#570000] rounded"
              />
              <span>Ready in Stock Only</span>
            </label>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-9 space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Showing <strong className="text-[#1f1c1b]">{filteredProducts.length}</strong> mandir designs</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#eae5e2] space-y-4 p-6">
              <div className="w-16 h-16 rounded-full bg-[#570000]/10 text-[#570000] flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1f1c1b]">No Mandirs Match Your Filter</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Try widening your price range, clearing selected wood types, or configuring a custom bespoke mandir.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#800000] transition-colors"
                >
                  Reset All Filters
                </button>
                <Link
                  to="/"
                  className="px-6 py-2.5 border border-[#eae5e2] bg-white text-gray-700 hover:text-[#570000] text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Home</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedProducts.map((p) => {
                  const isSaved = isInWishlist(p.id);
                  return (
                    <div
                      key={p.id}
                      className="group bg-white rounded-3xl overflow-hidden border border-[#eae5e2] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-4/3 overflow-hidden bg-[#f6f3f2]">
                        <img
                          src={getProductImageUrl(p, 0)}
                          alt={p.title}
                          onError={handleImageError}
                          onClick={() => navigate(`/product/${p.slug}`)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {p.isBestseller && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#570000] text-white">
                              Bestseller
                            </span>
                          )}
                          {p.isNew && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#d4af37] text-[#3e0000]">
                              New
                            </span>
                          )}
                        </div>

                        {/* Wishlist Button */}
                        <button
                          onClick={() => toggleWishlist(p.id)}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                            isSaved
                              ? 'bg-[#570000] text-white shadow-md'
                              : 'bg-white/80 text-gray-700 hover:bg-white hover:text-[#570000]'
                          }`}
                          aria-label="Wishlist"
                        >
                          <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                        </button>

                        {/* Quick View */}
                        <button
                          onClick={() => setQuickViewProduct(p)}
                          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-[#1f1c1b] text-xs font-semibold hover:bg-[#570000] hover:text-white shadow-sm transition-all flex items-center gap-1 opacity-0 group-hover:opacity-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Quick View</span>
                        </button>
                      </div>

                      {/* Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{typeof p.category === 'object' ? p.category.name : (p.category || p.material)}</span>
                            <div className="flex items-center gap-1 text-[#d4af37]">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span className="font-semibold text-gray-700">{p.rating}</span>
                            </div>
                          </div>

                          <h3
                            onClick={() => navigate(`/product/${p.slug}`)}
                            className="font-serif font-bold text-base text-[#1f1c1b] group-hover:text-[#570000] transition-colors cursor-pointer line-clamp-1"
                          >
                            {p.title}
                          </h3>

                          <p className="text-xs text-gray-500 line-clamp-2">
                            {p.shortDescription}
                          </p>
                        </div>

                        {/* Price & Action */}
                        <div className="pt-2 border-t border-[#eae5e2] flex items-center justify-between">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-serif font-bold text-[#570000]">
                                {formatPrice(p.price)}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(p.originalPrice)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              {p.stockQuantity > 0 ? '✓ Ready to Dispatch' : 'Out of Stock'}
                            </span>
                          </div>

                          <button
                            onClick={() => addToCart(p, 1)}
                            disabled={p.stockQuantity <= 0}
                            className="p-2.5 rounded-xl bg-[#570000] text-white hover:bg-[#800000] disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm transition-colors"
                            aria-label="Add to Cart"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls Bar */}
              {totalPages > 1 && (
                <div className="p-4 rounded-2xl bg-white border border-[#eae5e2] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                  <div className="text-xs text-gray-500">
                    Showing <strong className="text-[#1f1c1b]">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-[#1f1c1b]">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of <strong className="text-[#1f1c1b]">{filteredProducts.length}</strong> Mandirs
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-xl border border-[#eae5e2] text-xs font-semibold text-gray-700 hover:border-[#570000] hover:text-[#570000] disabled:opacity-40 disabled:hover:border-[#eae5e2] disabled:hover:text-gray-700 flex items-center gap-1 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#570000] text-white shadow-xs'
                            : 'border border-[#eae5e2] text-gray-700 hover:border-[#570000] hover:text-[#570000] bg-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-xl border border-[#eae5e2] text-xs font-semibold text-gray-700 hover:border-[#570000] hover:text-[#570000] disabled:opacity-40 disabled:hover:border-[#eae5e2] disabled:hover:text-gray-700 flex items-center gap-1 transition-colors"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#eae5e2]">
              <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Filter Mandirs</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-gray-500">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => { handleCategoryChange('All'); setMobileFilterOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                    selectedCategory === 'All' ? 'bg-[#570000] text-white font-bold' : 'text-gray-700'
                  }`}
                >
                  All Mandirs
                </button>
                {categories.filter(c => c.isActive).map(c => (
                  <button
                    key={c.id}
                    onClick={() => { handleCategoryChange(c.slug); setMobileFilterOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs ${
                      selectedCategory === c.slug ? 'bg-[#570000] text-white font-bold' : 'text-gray-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#eae5e2]">
              <button
                onClick={() => { resetFilters(); setMobileFilterOpen(false); }}
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-[#eae5e2] text-gray-700 hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
