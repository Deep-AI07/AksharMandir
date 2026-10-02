import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl, getCategoryImageUrl, handleImageError, DEFAULT_HERO_IMAGE } from '../../utils/imageUtils';
import { ShopOwnersSlider } from '../../components/home/ShopOwnersSlider';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Heart, 
  ShoppingBag, 
  Eye, 
  Truck, 
  Award, 
  Compass, 
  Hammer,
  CheckCircle2
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { 
    products, 
    categories,
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    formatPrice, 
    setQuickViewProduct 
  } = useApp();

  const navigate = useNavigate();

  const featuredProducts = products.filter(p => p.isFeatured || p.isBestseller).slice(0, 4);

  const activeCategories = categories.filter(c => c.isActive);

  return (
    <div id="home-page" className="space-y-16 pb-16">
      {/* Hero Section */}
      <section id="hero-section" className="relative overflow-hidden bg-gradient-to-b from-[#3e0000] via-[#570000] to-[#2a0000] text-white">
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,204,135,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(197,155,39,0.1),transparent_40%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fdcc87]/15 border border-[#fdcc87]/30 text-[#fdcc87] text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generational Vedic Craftsmanship</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#fbf9f8] tracking-tight leading-[1.15]">
                Your Pooja Ghar, <br />
                <span className="text-[#fdcc87] italic font-normal">Crafted Beautifully.</span>
              </h1>

              <p className="text-base sm:text-lg text-stone-200 font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
                Bring devotion, peace, and positive energy into your home. Hand-carved from seasoned solid Sheesham and Burma Teak, designed according to authentic Vastu Shastra principles.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  id="hero-explore-cta"
                  to="/mandirs"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#fdcc87] hover:bg-[#ffe3b3] text-[#3e0000] font-bold text-sm tracking-wide shadow-xl shadow-black/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Explore Mandirs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  id="hero-bespoke-cta"
                  to="/custom-mandir"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm tracking-wide border border-white/25 backdrop-blur-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#fdcc87]" />
                  <span>Create Your Custom Mandir</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-stone-300">
                <div>
                  <p className="text-2xl font-serif font-bold text-[#fdcc87]">15,000+</p>
                  <p className="text-xs text-stone-400">Mandirs Delivered</p>
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-[#fdcc87]">100%</p>
                  <p className="text-xs text-stone-400">Seasoned Timber</p>
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-[#fdcc87]">4.9 / 5</p>
                  <p className="text-xs text-stone-400">Customer Rating</p>
                </div>
              </div>
            </div>

            {/* Right Hero: 3 Shop Owners & Master Artisans Slider */}
            <div className="lg:col-span-5 relative">
              <ShopOwnersSlider />
            </div>
          </div>
        </div>
      </section>

      {/* Categories (Mandir Types) Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#eae5e2] gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#7b581e]">Divine Collections</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-1">
              Explore by Mandir Type
            </h2>
          </div>
          <Link
            to="/mandirs"
            className="text-xs font-bold text-[#570000] hover:text-[#800000] flex items-center gap-1 group"
          >
            <span>Browse All Collections</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeCategories.map((col) => (
            <div
              key={col.id}
              onClick={() => navigate(`/mandirs/${col.slug}`)}
              className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border border-[#eae5e2]"
            >
              <img
                src={getCategoryImageUrl(col)}
                alt={col.name}
                onError={handleImageError}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1c1b]/95 via-[#1f1c1b]/40 to-transparent" />
              
              <div className="absolute top-4 left-4">
                {col.badge && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#570000]/80 text-[#fdcc87] border border-[#fdcc87]/30 backdrop-blur-xs">
                    {col.badge}
                  </span>
                )}
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <h3 className="text-xl font-serif font-bold text-[#fbf9f8] group-hover:text-[#fdcc87] transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-2">
                  {col.description}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-[#fdcc87] font-semibold">
                  <span>Explore Mandirs</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Masterpieces */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#eae5e2] gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#7b581e]">Featured Mandirs</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-1">
              Handcrafted Masterpieces
            </h2>
          </div>
          <Link
            to="/mandirs"
            className="text-xs font-bold text-[#570000] hover:text-[#800000] flex items-center gap-1 group"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => {
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

                  {/* Quick View Button */}
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
      </section>

      {/* Bespoke Mandir Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-[#2b2422] text-white p-8 sm:p-12 lg:p-16 border border-[#d4af37]/30 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(253,204,135,0.1),transparent_50%)] pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdcc87]/15 border border-[#fdcc87]/30 text-[#fdcc87] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom Mandir Studio</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#fbf9f8] leading-tight">
                Design a Mandir Tailored to Your Home & Deity
              </h2>
              <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Whether you need specific mandir dimensions for your deity idols, dedicated brass bell layouts, LED backlit panels, or custom Sanskrit mantra engravings, our Saharanpur master artisans bring your dream home mandir to life.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/custom-mandir"
                  className="px-8 py-3.5 rounded-xl bg-[#fdcc87] text-[#3e0000] text-xs font-bold hover:bg-[#ffe3b3] shadow-lg transition-all"
                >
                  Configure Custom Mandir →
                </Link>
                <Link
                  to="/contact"
                  className="px-6 py-3.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 border border-white/20 transition-all"
                >
                  Speak with Temple Architect
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="p-6 rounded-2xl bg-black/40 border border-white/15 space-y-3 max-w-xs text-xs text-stone-300">
                <div className="flex items-center gap-2 text-[#fdcc87] font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Custom Process</span>
                </div>
                <p>1. Submit dimension & wood preferences</p>
                <p>2. Master artisan reviews & provides CAD quote</p>
                <p>3. Seasoned wood crafting & white-glove setup</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
