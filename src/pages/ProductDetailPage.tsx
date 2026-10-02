import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FinishType } from '../types';
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
  Compass
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { 
    products, 
    selectedProductId, 
    navigateTo, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    formatPrice, 
    showToast,
    setQuickViewProduct 
  } = useApp();

  const product = products.find(p => p.id === selectedProductId) || products[0];
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [selectedFinish, setSelectedFinish] = useState<FinishType>(product.finish);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'vastu' | 'features' | 'care' | 'reviews'>('vastu');
  const [zoomModalOpen, setZoomModalOpen] = useState<boolean>(false);
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewName, setNewReviewName] = useState<string>('');

  const isSaved = isInWishlist(product.id);

  // Synchronize initial finish if product changes
  React.useEffect(() => {
    setSelectedFinish(product.finish);
    setSelectedImageIdx(0);
    setQuantity(1);
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedFinish);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedFinish);
    navigateTo('checkout');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('Product link copied to clipboard!', 'info');
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewText.trim() && newReviewName.trim()) {
      showToast('Thank you! Your mandir review will appear after verification.', 'success');
      setNewReviewText('');
      setNewReviewName('');
    }
  };

  // Related collection products
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.material === product.material))
    .slice(0, 4);

  return (
    <div id="product-detail-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav id="pdp-breadcrumbs" className="flex items-center space-x-2 text-xs text-gray-500">
        <button onClick={() => navigateTo('home')} className="hover:text-[#570000] font-medium">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigateTo('catalog')} className="hover:text-[#570000] font-medium">Mandirs</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => navigateTo('catalog', { category: product.category })} className="hover:text-[#570000] font-medium">{product.category}</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1f1c1b] font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Interactive Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#f6f3f2] border border-[#eae5e2] shadow-sm group">
            <img
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={`${product.title} - View ${selectedImageIdx + 1}`}
              className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105 cursor-zoom-in"
              onClick={() => setZoomModalOpen(true)}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-[#570000] text-[#fdcc87] text-xs font-bold px-3 py-1 rounded-full shadow tracking-wider uppercase">
                {product.category}
              </span>
              {product.isBestseller && (
                <span className="bg-[#7b581e] text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  Bestseller
                </span>
              )}
            </div>

            {/* Floating Action Controls on Gallery */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => setZoomModalOpen(true)}
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-gray-700 hover:text-black hover:bg-white transition-all"
                title="Full Screen Zoom"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md text-gray-700 hover:text-black hover:bg-white transition-all"
                title="Share Mandir Design"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Hint overlay */}
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[11px] px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#fdcc87]" />
              <span>Click image to inspect high-resolution wood carving details</span>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIdx(idx)}
                className={`relative w-24 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  selectedImageIdx === idx 
                    ? 'border-[#570000] ring-2 ring-[#570000]/30 shadow-md scale-105' 
                    : 'border-[#eae5e2] opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
                  {idx === 0 ? 'Front' : idx === 1 ? 'Angled' : idx === 2 ? 'Inner' : 'Detail'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Title, Price, Specs Bento, Finishes, Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Rating and SKU */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="font-bold text-gray-900 ml-1">{product.rating}</span>
                </div>
                <span className="text-gray-400">({product.reviewsCount} customer reviews)</span>
              </div>
              <span className="font-mono text-gray-500 bg-[#f6f3f2] px-2 py-0.5 rounded border border-[#eae5e2]">
                SKU: {product.sku}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] leading-tight">
              {product.title}
            </h1>

            {/* Stock status */}
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-800">
                In Stock • Ready for White-Glove Dispatch
              </span>
            </div>

            {/* Price Box */}
            <div className="flex items-baseline gap-3 mt-4 p-4 rounded-xl bg-[#f6f3f2] border border-[#eae5e2]">
              <span className="text-3xl font-serif font-bold text-[#570000]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Save {product.discountPercentage || 10}%
                  </span>
                </>
              )}
            </div>

            <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Bento Specifications Grid */}
          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-white border border-[#eae5e2] shadow-xs">
            <div className="p-2.5 rounded-lg bg-[#fbf9f8] border border-[#eae5e2]/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">Primary Wood</span>
              <span className="text-xs font-bold text-[#1f1c1b]">{product.material}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#fbf9f8] border border-[#eae5e2]/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">Dimensions</span>
              <span className="text-xs font-bold text-[#1f1c1b]">{product.dimensions}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#fbf9f8] border border-[#eae5e2]/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">Mounting</span>
              <span className="text-xs font-bold text-[#1f1c1b]">{product.mounting}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#fbf9f8] border border-[#eae5e2]/80">
              <span className="text-[10px] font-bold text-gray-500 uppercase block tracking-wider">Warranty</span>
              <span className="text-xs font-bold text-[#1f1c1b]">{product.warranty}</span>
            </div>
          </div>

          {/* Polish / Finish Selection */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-800">
                Finish Polish: <span className="text-[#7b581e] font-semibold">{selectedFinish}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {product.availableFinishes.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedFinish(f)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left border flex items-center justify-between transition-all ${
                    selectedFinish === f
                      ? 'border-[#570000] bg-[#570000] text-white shadow-sm font-semibold'
                      : 'border-[#eae5e2] bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <span className="truncate">{f}</span>
                  {selectedFinish === f && <Check className="w-3.5 h-3.5 shrink-0 text-[#fdcc87]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-[#eae5e2] rounded-xl bg-white shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-sm text-gray-600 hover:text-black font-bold"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-sm text-gray-600 hover:text-black font-bold"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-gray-500">Total: <strong className="text-[#570000]">{formatPrice(product.price * quantity)}</strong></span>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
              <button
                id="pdp-add-to-cart-btn"
                onClick={handleAddToCart}
                className="sm:col-span-6 py-4 px-6 rounded-xl bg-[#570000] hover:bg-[#800000] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#570000]/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                id="pdp-buy-now-btn"
                onClick={handleBuyNow}
                className="sm:col-span-4 py-4 px-6 rounded-xl bg-[#fdcc87] hover:bg-[#ffe3b3] text-[#3e0000] font-bold text-xs tracking-wide shadow-lg shadow-black/10 flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Buy Now</span>
              </button>

              <button
                id="pdp-wishlist-btn"
                onClick={() => toggleWishlist(product.id)}
                className={`sm:col-span-2 py-4 rounded-xl border flex items-center justify-center transition-all ${
                  isSaved
                    ? 'border-[#570000] bg-[#570000]/10 text-[#570000]'
                    : 'border-[#eae5e2] bg-white text-gray-600 hover:text-[#570000]'
                }`}
                title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-[#570000]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="border-t border-[#eae5e2] pt-4 space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#570000] shrink-0" />
              <span><strong>Complimentary White-Glove Installation</strong> anywhere in India.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#570000] shrink-0" />
              <span><strong>5-Year Structural & Termite Warranty</strong> included.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#7b581e] shrink-0" />
              <span><strong>Vastu Shastra Proportion Certified</strong> for North-East placement.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Tabbed Section: Vastu, Features, Care, Reviews */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex border-b border-[#eae5e2] overflow-x-auto space-x-6 pb-2">
          <button
            onClick={() => setActiveTab('vastu')}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${
              activeTab === 'vastu'
                ? 'text-[#570000] border-b-2 border-[#570000]'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Vastu Harmony & Architecture
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${
              activeTab === 'features'
                ? 'text-[#570000] border-b-2 border-[#570000]'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Artisanal Features & Storage
          </button>

          <button
            onClick={() => setActiveTab('care')}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${
              activeTab === 'care'
                ? 'text-[#570000] border-b-2 border-[#570000]'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Installation & Mandir Care
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${
              activeTab === 'reviews'
                ? 'text-[#570000] border-b-2 border-[#570000]'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Customer Reviews ({product.reviewsCount})
          </button>
        </div>

        {/* Tab 1: Vastu */}
        {activeTab === 'vastu' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-[#1f1c1b]">
                  Vastu Shastra Spatial Harmony
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {product.vastuNotes}
                </p>
                <div className="p-4 rounded-xl bg-[#f6f3f2] border border-[#eae5e2] space-y-2 text-xs">
                  <p className="font-bold text-[#570000] flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    Recommended Placement
                  </p>
                  <p className="text-gray-600">
                    Place in the <strong>Ishanya Kon (North-East direction)</strong> of your home. The person performing pooja should preferably face <strong>East</strong> or <strong>North</strong> during prayer.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-[#1f1c1b]">
                  Ayadi Dimensional Ratios
                </h3>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  The proportions of this mandir (Height: 48", Width: 36", Depth: 24") conform to Vedic golden ratios. The idol platform is elevated so deities sit gracefully above naval height when seated during meditation.
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-[#eae5e2] rounded-xl">
                    <span className="font-bold text-gray-800 block">Dome Spire (Shikhara)</span>
                    <span className="text-gray-500">Channels cosmic pyramid energy downward</span>
                  </div>
                  <div className="p-3 bg-white border border-[#eae5e2] rounded-xl">
                    <span className="font-bold text-gray-800 block">Idol Base Height</span>
                    <span className="text-gray-500">18 inches above floor level</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Features */}
        {activeTab === 'features' && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-xl font-serif font-bold text-[#1f1c1b]">
              Handcrafted Features & Daily Ritual Storage
            </h3>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {product.fullDescription}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {product.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-[#f6f3f2] border border-[#eae5e2]">
                  <CheckCircle2 className="w-5 h-5 text-[#570000] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-medium text-gray-800">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Care */}
        {activeTab === 'care' && (
          <div className="space-y-6 animate-in fade-in">
            <h3 className="text-xl font-serif font-bold text-[#1f1c1b]">
              Installation & Mandir Wood Care
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-700">
              <div className="p-5 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] space-y-2">
                <Flame className="w-6 h-6 text-[#7b581e]" />
                <h4 className="font-bold text-sm text-[#1f1c1b]">Diya & Incense Safety</h4>
                <p>
                  Always place lit lamps and diyas on the pull-out heat-resistant brass or stone tray. Never place open flames in direct contact with the wooden ceiling.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] space-y-2">
                <Sparkles className="w-6 h-6 text-[#7b581e]" />
                <h4 className="font-bold text-sm text-[#1f1c1b]">Cleaning & Dusting</h4>
                <p>
                  Wipe gently with a soft dry microfiber cloth. To maintain the rich golden wood sheen, apply pure beeswax or natural teak oil once every 12 months.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] space-y-2">
                <Truck className="w-6 h-6 text-[#7b581e]" />
                <h4 className="font-bold text-sm text-[#1f1c1b]">White-Glove Delivery</h4>
                <p>
                  Our technicians uncrate the mandir in your pooja room, level the feet, check wire routing, and safely mount wall anchors if required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Reviews Summary */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#f6f3f2] p-6 rounded-2xl border border-[#eae5e2]">
              <div className="md:col-span-4 text-center md:text-left space-y-1">
                <span className="text-4xl font-serif font-bold text-[#570000]">{product.rating}</span>
                <div className="flex items-center justify-center md:justify-start text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-gray-500">Based on {product.reviewsCount} verified customer orders</p>
              </div>

              <div className="md:col-span-8 space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span>5 Star</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-amber-500 w-[92%]" />
                  </div>
                  <span>92%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>4 Star</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-amber-500 w-[7%]" />
                  </div>
                  <span>7%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>3 Star</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-amber-500 w-[1%]" />
                  </div>
                  <span>1%</span>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[#eae5e2] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1f1c1b]">Raghavendra Joshi</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                      Verified Buyer • Pune
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">12 August 2026</span>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  "The quality of the Sheesham wood is unparalleled. The brass bells give off such a gentle chime when doing evening aarti. Packaging in wooden crate was flawless."
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#eae5e2] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1f1c1b]">Meenakshi Sundaram</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                      Verified Buyer • Chennai
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">28 July 2026</span>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  "Exceeded all expectations. The slide-out bhog tray handles heavy brass thalis without bending. Natural teak polish looks majestic in our living room corner."
                </p>
              </div>
            </div>

            {/* Submit Review Form */}
            <form onSubmit={handleAddReview} className="p-6 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] space-y-4">
              <h4 className="font-bold text-sm text-[#1f1c1b]">Share Your Mandir Experience</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewName}
                    onChange={e => setNewReviewName(e.target.value)}
                    placeholder="e.g. Rameshwar Patel"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-white focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Rating</label>
                  <select
                    value={newReviewRating}
                    onChange={e => setNewReviewRating(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-white focus:outline-none focus:border-[#570000]"
                  >
                    <option value={5}>5 Stars - Divine Perfection</option>
                    <option value={4}>4 Stars - High Quality</option>
                    <option value={3}>3 Stars - Satisfactory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Your Review</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewText}
                  onChange={e => setNewReviewText(e.target.value)}
                  placeholder="Tell us about the woodcraft, finish, and auspicious atmosphere in your home..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-white focus:outline-none focus:border-[#570000]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#570000] text-white text-xs font-bold hover:bg-[#800000] shadow"
              >
                Submit Verified Review
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Related Products: More from Collection */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-[#7b581e]">More Creations</span>
              <h3 className="text-2xl font-serif font-bold text-[#1f1c1b]">More from the {product.category} Collection</h3>
            </div>
            <button
              onClick={() => navigateTo('catalog', { category: product.category })}
              className="text-xs font-bold text-[#570000] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rel => {
              const isRelSaved = isInWishlist(rel.id);
              return (
                <div
                  key={rel.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#eae5e2] shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div
                    className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer"
                    onClick={() => navigateTo('product', { productId: rel.id })}
                  >
                    <img src={rel.images[0]} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(rel.id);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-gray-700 hover:text-[#570000] shadow"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isRelSaved ? 'fill-[#570000] text-[#570000]' : ''}`} />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <h4
                      onClick={() => navigateTo('product', { productId: rel.id })}
                      className="font-serif font-bold text-sm text-[#1f1c1b] group-hover:text-[#570000] cursor-pointer line-clamp-1"
                    >
                      {rel.title}
                    </h4>
                    <p className="text-xs text-gray-500">{rel.material} • {rel.dimensions}</p>
                    <div className="pt-2 flex items-center justify-between border-t border-[#eae5e2]">
                      <span className="text-sm font-bold text-[#570000]">{formatPrice(rel.price)}</span>
                      <button
                        onClick={() => addToCart(rel, 1, rel.finish)}
                        className="p-2 rounded-lg bg-[#570000] text-white hover:bg-[#800000]"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Full-screen Zoom Modal */}
      {zoomModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomModalOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              onClick={() => setZoomModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-[#fdcc87] p-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider"
            >
              <span>Close Inspect Mode</span>
              <Maximize2 className="w-4 h-4" />
            </button>
            <img
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.title}
              className="max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/20"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
