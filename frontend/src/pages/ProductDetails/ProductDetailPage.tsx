import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl, getAllProductImages, handleImageError } from '../../utils/imageUtils';
import { Product } from '../../types';
import { api } from '../../services/api';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Award, 
  ChevronRight, 
  Check, 
  Eye, 
  RotateCw, 
  Maximize2, 
  Share2, 
  CheckCircle2,
  ArrowRight,
  Flame,
  FileText,
  Clock,
  Compass,
  ArrowLeft,
  ChevronLeft,
  Home
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { 
    products,
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    formatPrice, 
    showToast,
    setQuickViewProduct,
    user,
    isAuthenticated
  } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [selectedFinish, setSelectedFinish] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'vastu' | 'features' | 'care' | 'reviews'>('vastu');
  const [zoomModalOpen, setZoomModalOpen] = useState<boolean>(false);

  // Review Form
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewName, setNewReviewName] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  // Fetch product from API
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.products.getBySlug(slug)
      .then(res => {
        if (res.success && res.data.product) {
          setProduct(res.data.product);
          setSelectedFinish(res.data.product.colorFinish || res.data.product.availableFinishes[0] || 'Natural Teak Polish');
          setSelectedImageIdx(0);
          setQuantity(1);
        }
      })
      .catch(err => {
        console.error('Error fetching product:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#570000] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase tracking-widest font-bold text-[#7b581e]">Loading Mandir Details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1f1c1b]">Mandir Design Not Found</h2>
        <p className="text-xs text-gray-500">The requested handcrafted mandir is unavailable or has moved.</p>
        <Link to="/mandirs" className="inline-block px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl">
          Return to Mandirs Catalog
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);

  // Compute Adjacent Products for Next/Previous Mandir Navigation
  const currentProductIndex = products.findIndex(p => p.slug === slug || p.id === product.id);
  const prevProduct = currentProductIndex > 0 ? products[currentProductIndex - 1] : null;
  const nextProduct = currentProductIndex >= 0 && currentProductIndex < products.length - 1 ? products[currentProductIndex + 1] : null;

  const handleAddToCart = async () => {
    await addToCart(product, quantity, selectedFinish);
  };

  const handleBuyNow = async () => {
    await addToCart(product, quantity, selectedFinish);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Mandir link copied to clipboard!', 'info');
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim() || !newReviewName.trim()) {
      showToast('Please provide both your name and review comment.', 'error');
      return;
    }
    if (newReviewText.trim().length < 5) {
      showToast('Review comment must be at least 5 characters long.', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.reviews.submit({
        productId: product.id,
        rating: newReviewRating,
        userName: newReviewName.trim(),
        comment: newReviewText.trim(),
      });
      showToast(res.message || 'Review submitted successfully!', 'success');
      setNewReviewText('');
      setNewReviewName('');
      // Reload product details to show new review
      if (slug) {
        const updated = await api.products.getBySlug(slug);
        if (updated.success) setProduct(updated.data.product);
      }
    } catch (err: any) {
      showToast(err.message || 'Error submitting review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div id="product-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Header Navigation Bar (Home, Back, Breadcrumbs, Next/Prev) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#eae5e2]">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#570000] flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <Link to="/mandirs" className="hover:text-[#570000]">Mandirs</Link>
          {product.category && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
              <Link 
                to={`/mandirs/${typeof product.category === 'object' ? product.category.slug : String(product.category).toLowerCase().replace(/\s+/g, '-')}`} 
                className="hover:text-[#570000]"
              >
                {typeof product.category === 'object' ? product.category.name : String(product.category)}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[#570000] font-bold truncate max-w-[200px] sm:max-w-none">{product.title}</span>
        </nav>

        {/* Action Buttons: Back to Catalog & Next/Prev Mandir */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <Link
            to="/mandirs"
            className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </Link>

          {prevProduct && (
            <Link
              to={`/product/${prevProduct.slug}`}
              className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              title={`Previous: ${prevProduct.title}`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prev</span>
            </Link>
          )}

          {nextProduct && (
            <Link
              to={`/product/${nextProduct.slug}`}
              className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
              title={`Next: ${nextProduct.title}`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-[#f6f3f2] border border-[#eae5e2] shadow-sm">
            <img
              src={getProductImageUrl(product, selectedImageIdx)}
              alt={product.title}
              onError={handleImageError}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isBestseller && (
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#570000] text-white shadow-xs">
                  Bestseller
                </span>
              )}
              {product.isNew && (
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#d4af37] text-[#3e0000] shadow-xs">
                  New Arrival
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:bg-white hover:text-[#570000] shadow-md transition-all"
                aria-label="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full backdrop-blur-md transition-all shadow-md ${
                  isSaved
                    ? 'bg-[#570000] text-white'
                    : 'bg-white/90 text-gray-700 hover:bg-white hover:text-[#570000]'
                }`}
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Thumbnails Row */}
          {getAllProductImages(product).length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {getAllProductImages(product).map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImageIdx === idx
                      ? 'border-[#570000] ring-2 ring-[#570000]/20 scale-105'
                      : 'border-[#eae5e2] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    onError={handleImageError}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Specifications & Purchase */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="uppercase font-bold tracking-wider text-[#7b581e]">
                {typeof product.category === 'object' ? product.category.name : (product.category || product.material)}
              </span>
              <span className="font-mono text-[11px] text-gray-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] leading-snug">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-[#d4af37]">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-[#1f1c1b] text-sm">{product.rating}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">{product.reviewsCount || (product.reviews?.length || 0)} customer reviews</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl bg-white border border-[#eae5e2] space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-serif font-bold text-[#570000]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    {product.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-500">Includes all taxes • Free pan-India white-glove setup</p>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Finish / Polish Selector */}
          {product.availableFinishes && product.availableFinishes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-gray-600">
                Selected Finish: <strong className="text-[#570000]">{selectedFinish}</strong>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.availableFinishes.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFinish(f)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedFinish === f
                        ? 'border-[#570000] bg-[#570000] text-white shadow-xs'
                        : 'border-[#eae5e2] bg-white text-gray-700 hover:border-[#570000]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] text-xs">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Wood / Material</span>
              <strong className="text-[#1f1c1b]">{product.material}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Dimensions</span>
              <strong className="text-[#1f1c1b]">{product.dimensions}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Mounting</span>
              <strong className="text-[#1f1c1b]">{product.mountingType}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Weight & Warranty</span>
              <strong className="text-[#1f1c1b]">{product.weight} • {product.warranty}</strong>
            </div>
          </div>

          {/* Quantity and CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[#eae5e2] rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-[#1f1c1b]">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity || 10, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold"
                >
                  +
                </button>
              </div>

              <div className="text-xs">
                {product.stockQuantity > 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock ({product.stockQuantity} ready for dispatch)</span>
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">Made to order (7-10 days craft time)</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0}
                className="w-full py-3.5 rounded-xl bg-white border-2 border-[#570000] text-[#570000] hover:bg-[#570000]/5 text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stockQuantity <= 0}
                className="w-full py-3.5 rounded-xl bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#570000]/20 transition-all disabled:opacity-50"
              >
                <span>Buy Now →</span>
              </button>
            </div>

            {/* Customization Prompt */}
            {product.isCustomizable && (
              <div className="pt-2 text-center">
                <Link
                  to="/custom-mandir"
                  className="text-xs text-[#7b581e] font-semibold hover:underline inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>Need this mandir in different dimensions or wood? Request Customization</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Vastu, Features, Care & Customer Reviews */}
      <div className="space-y-6 pt-8 border-t border-[#eae5e2]">
        <div className="flex border-b border-[#eae5e2] gap-6 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('vastu')}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'vastu' ? 'text-[#570000] border-b-2 border-[#570000]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Vastu & Pooja Ghar Placement</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'features' ? 'text-[#570000] border-b-2 border-[#570000]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Artisan Carving Features</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeTab === 'reviews' ? 'text-[#570000] border-b-2 border-[#570000]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Customer Reviews ({product.reviews?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eae5e2] shadow-xs">
          {activeTab === 'vastu' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Vastu Shastra Dimensions & Placement</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.vastuNotes || 'Designed according to Vedic Shastra proportions. Best positioned in the North-East (Ishanya) corner of your living room or dedicated pooja room facing East.'}
              </p>
              <div className="p-4 rounded-2xl bg-[#fdcc87]/15 border border-[#fdcc87]/30 text-xs text-[#3e0000] space-y-1">
                <p className="font-bold">Auspicious Orientation:</p>
                <p>• Best placed facing East or North-East so that family members face East during morning prayers.</p>
                <p>• Mandir elevation ensures deity idols are positioned higher than navel height during pooja.</p>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Master Craftsmanship Highlights</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {product.fullDescription}
              </p>
              {product.features && product.features.length > 0 && (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-gray-700">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Existing Reviews */}
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Customer Reviews & Experiences</h3>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="divide-y divide-[#eae5e2] space-y-4">
                    {product.reviews.map((rev) => (
                      <div key={rev.id} className="pt-4 first:pt-0 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <strong className="text-[#1f1c1b]">{rev.userName}</strong>
                          <div className="flex items-center text-[#d4af37]">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </div>
                        {rev.title && <p className="text-xs font-bold text-gray-800">{rev.title}</p>}
                        <p className="text-xs text-gray-600">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No reviews yet. Be the first to share your experience with this mandir!</p>
                )}
              </div>

              {/* Submit Review Form (Requires Authentication) */}
              {isAuthenticated ? (
                <form onSubmit={handleAddReview} className="p-6 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] space-y-4 max-w-xl">
                  <h4 className="font-serif font-bold text-sm text-[#1f1c1b]">Leave a Verified Review</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={newReviewName || user?.name || ''}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#eae5e2] text-xs focus:outline-hidden"
                    />
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Divine)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars - Good)</option>
                    </select>
                  </div>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share details about wood grain, brass bells, finish, and mandir delivery..."
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#eae5e2] text-xs focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2.5 rounded-xl bg-[#570000] text-white text-xs font-bold hover:bg-[#800000] shadow-xs transition-colors"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Customer Review'}
                  </button>
                </form>
              ) : (
                <div className="p-6 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] space-y-3 max-w-xl">
                  <h4 className="font-serif font-bold text-sm text-[#1f1c1b]">Share Your Review</h4>
                  <p className="text-xs text-gray-500">
                    Please sign in to your account to leave a verified product review.
                  </p>
                  <Link
                    to={`/login?redirect=/product/${product.slug}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#570000] text-white text-xs font-bold hover:bg-[#800000] shadow-sm transition-colors"
                  >
                    <span>Sign In to Write Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-[#eae5e2]">
          <h3 className="text-2xl font-serif font-bold text-[#1f1c1b]">Similar Mandir Designs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map(rp => (
              <div
                key={rp.id}
                onClick={() => navigate(`/product/${rp.slug}`)}
                className="group bg-white rounded-3xl overflow-hidden border border-[#eae5e2] shadow-xs hover:shadow-lg transition-all cursor-pointer"
              >
                <img
                  src={getProductImageUrl(rp, 0)}
                  alt={rp.title}
                  onError={handleImageError}
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4 space-y-1">
                  <h4 className="font-serif font-bold text-xs text-[#1f1c1b] truncate">{rp.title}</h4>
                  <p className="text-xs font-serif font-bold text-[#570000]">{formatPrice(rp.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation & Journey Actions */}
      <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/mandirs"
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#eae5e2] hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Mandirs</span>
          </Link>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl border border-[#eae5e2] hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/custom-mandir"
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-[#d4af37]/40 bg-[#fdcc87]/15 hover:bg-[#fdcc87]/25 text-[#3e0000] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-[#7b581e]" />
            <span>Customize Bespoke Mandir</span>
          </Link>
          <Link
            to="/cart"
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
