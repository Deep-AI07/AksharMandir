import React from 'react';
import { useApp } from '../context/AppContext';
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
    navigateTo, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    formatPrice, 
    setQuickViewProduct 
  } = useApp();

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);

  const collections = [
    {
      id: 'col-traditional',
      title: 'Traditional Mandirs',
      category: 'Traditional',
      subtitle: 'Rich Jaali carvings & solid Sheesham wood',
      image: '/images/mandirs/mandir_royal_sheesham.jpg',
      badge: 'Heritage Classic',
      span: 'md:col-span-2'
    },
    {
      id: 'col-modern',
      title: 'Modern Mandirs',
      category: 'Modern',
      subtitle: 'Clean architectural lines & integrated backlit aura',
      image: '/images/mandirs/mandir_aura_modern.jpg',
      badge: 'Contemporary',
      span: 'md:col-span-1'
    },
    {
      id: 'col-home',
      title: 'Home Mandirs',
      category: 'Home Mandirs',
      subtitle: 'Space-conscious shrines for urban apartments',
      image: '/images/mandirs/mandir_devi_sanctum.jpg',
      badge: 'Wall & Floor',
      span: 'md:col-span-1'
    },
    {
      id: 'col-temple',
      title: 'Temple Style Mandirs',
      category: 'Temple Style',
      subtitle: 'Grand multi-tier Shikhar & hand-sculpted pillars',
      image: '/images/mandirs/mandir_grand_haveli.jpg',
      badge: 'Masterpiece',
      span: 'md:col-span-2'
    }
  ];

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
                Imbue your home with peace and divine sanctity. Hand-carved from seasoned solid Sheesham and Burma Teak, designed according to authentic Vastu Shastra principles.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="hero-explore-cta"
                  onClick={() => navigateTo('catalog')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#fdcc87] hover:bg-[#ffe3b3] text-[#3e0000] font-bold text-sm tracking-wide shadow-xl shadow-black/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Explore Mandirs</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-bespoke-cta"
                  onClick={() => navigateTo('custom')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm tracking-wide border border-white/25 backdrop-blur-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#fdcc87]" />
                  <span>Create Your Custom Mandir</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-stone-300">
                <div>
                  <p className="text-2xl font-serif font-bold text-[#fdcc87]">15,000+</p>
                  <p className="text-xs text-stone-300">Mandirs Delivered</p>
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-[#fdcc87]">100%</p>
                  <p className="text-xs text-stone-300">Solid Hardwood</p>
                </div>
                <div>
                  <p className="text-2xl font-serif font-bold text-[#fdcc87]">5-Year</p>
                  <p className="text-xs text-stone-300">Craft Guarantee</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Feature */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#fdcc87]/30 bg-stone-900 aspect-4/5 group">
                <img
                  src="/images/mandirs/mandir_hero_banner.jpg"
                  alt="Handcrafted Mandir with Warm Diya Lamps"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Designed Sacred Typography Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-px w-6 bg-[#fdcc87]" />
                    <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#fdcc87]">
                      Pavitra Sannidhi
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#fbf9f8] tracking-tight leading-snug">
                    Handcrafted Home Mandir
                  </h3>
                  <p className="text-xs text-stone-300 font-light mt-1 max-w-xs leading-relaxed">
                    Sculpted with devotion and precision to bring peace, prosperity, and spiritual grace into your home.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Collections Section (Bento Grid) */}
      <section id="curated-collections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#7b581e] bg-[#7b581e]/10 px-3 py-1 rounded-full">
            Architectural Lineage
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1f1c1b] mt-3">
            Curated Mandir Collections
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Each collection is thoughtfully designed to harmonise traditional rituals and Bhakti at Home with contemporary interior spaces.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => navigateTo('catalog', { category: col.category })}
              className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-[#eae5e2] bg-[#f6f3f2] cursor-pointer transition-all duration-300 min-h-[300px] ${col.span}`}
            >
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent transition-opacity" />

              <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 text-white">
                    {col.badge}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-[#fdcc87] group-hover:text-[#3e0000] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-bold text-white group-hover:text-[#fdcc87] transition-colors">
                    {col.title}
                  </h3>
                  <p className="text-xs text-gray-200 mt-1 max-w-md line-clamp-2">
                    {col.subtitle}
                  </p>
                  <span className="inline-block mt-3 text-xs font-semibold text-[#fdcc87] group-hover:underline">
                    Explore Collection →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Masterpieces Carousel / Grid */}
      <section id="featured-masterpieces" className="bg-[#f6f3f2] py-16 border-y border-[#eae5e2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#570000]">
                Artisanal Spotlight
              </span>
              <h2 className="text-3xl font-serif font-bold text-[#1f1c1b] mt-1">
                Featured Mandirs
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Handcrafted masterpieces ready for white-glove home delivery.
              </p>
            </div>

            <button
              onClick={() => navigateTo('catalog')}
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#570000] hover:text-[#800000] hover:underline"
            >
              <span>View All Handcrafted Mandirs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => {
              const isSaved = isInWishlist(prod.id);
              return (
                <div
                  key={prod.id}
                  id={`product-card-${prod.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-[#eae5e2] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => navigateTo('product', { productId: prod.id })}>
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      {prod.isBestseller && (
                        <span className="bg-[#570000] text-[#fdcc87] text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          Bestseller
                        </span>
                      )}
                      {prod.discountPercentage && (
                        <span className="bg-[#7b581e] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {prod.discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* Quick action buttons on hover */}
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

                  {/* Card Content */}
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
        </div>
      </section>

      {/* Bespoke Custom Mandir Teaser Banner */}
      <section id="bespoke-teaser" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#570000] text-white rounded-3xl overflow-hidden shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#fdcc87] bg-black/30 px-3.5 py-1 rounded-full inline-block">
                Your Space. Your Design. Your Mandir.
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight text-white">
                Custom Mandirs, Made to Exact Millimeter Dimensions
              </h2>
              <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-2xl">
                Have a unique niche, apartment corner, or specific deity requirements? Our master artisans craft custom wooden mandirs with tailored jaali patterns, LED aura backlights, and traditional mantra carvings.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fdcc87]" />
                  <span>3D CAD Simulation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fdcc87]" />
                  <span>Custom Wood Choice</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#fdcc87]" />
                  <span>Vastu Shastra Alignment</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigateTo('custom')}
                  className="px-8 py-3.5 bg-[#fdcc87] hover:bg-[#ffe3b3] text-[#3e0000] font-bold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Request Custom Mandir Consultation</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center space-y-3 w-full max-w-sm">
                <div className="w-14 h-14 rounded-full bg-[#fdcc87] text-[#3e0000] flex items-center justify-center mx-auto shadow-lg">
                  <Hammer className="w-7 h-7" />
                </div>
                <h4 className="font-serif font-bold text-lg text-white">Atelier Master Craftsmen</h4>
                <p className="text-xs text-stone-300">
                  Over 40 years of generational wood carving lineage in Saharanpur & Jaipur.
                </p>
                <div className="text-xs font-semibold text-[#fdcc87]">
                  Average Crafting Timeline: 18-24 Days
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Pillars / Why Akshar Mandir */}
      <section id="craft-pillars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#7b581e]">
            Our Tradition & Standards
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#1f1c1b] mt-2">
            Built to Endure for Generations
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-white border border-[#eae5e2] shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#570000]/10 text-[#570000] flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Vastu Compliant Proportions</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every mandir follows the ancient Ayadi dimensional calculation system to harmonize cosmic vibrations, ensuring auspiciousness for family health and prosperity.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-[#eae5e2] shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#570000]/10 text-[#570000] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Kiln-Seasoned Hardwood</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We use 100% solid, vacuum-pressure treated Indian Sheesham and Burma Teak. Completely warp-resistant, termite-proof, and finished with organic protective oils.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-[#eae5e2] shadow-sm hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#570000]/10 text-[#570000] flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">White-Glove Installation</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Complimentary room placement and assembly by our trained craftsmen. Multi-layered wooden crating ensures zero transit damage across India.
            </p>
          </div>
        </div>
      </section>

      {/* Customer Sanctum Testimonials */}
      <section id="testimonials" className="bg-[#fbf9f8] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#f6f3f2] border border-[#eae5e2]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-500" />
              ))}
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#1f1c1b]">
              Cherished in Over 15,000 Homes
            </h3>
            <p className="text-xs text-gray-500 mt-1">Real reviews from our spiritual community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-[#eae5e2] shadow-sm space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-gray-700 italic leading-relaxed">
                "The Royal Sheesham Wood Mandir is breathtaking. The jaali work and brass bells ring so peacefully with the morning breeze. Installation was smooth and handled respectfully."
              </p>
              <div>
                <p className="text-xs font-bold text-[#1f1c1b]">Sunita & Rajesh Iyer</p>
                <p className="text-[10px] text-gray-400">Bengaluru • Verified Customer</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#eae5e2] shadow-sm space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-gray-700 italic leading-relaxed">
                "We requested a bespoke 5-foot teak mandir for our new apartment. The 3D CAD design phase and final finish exceeded our expectations. Truly divine!"
              </p>
              <div>
                <p className="text-xs font-bold text-[#1f1c1b]">Vikram Singhania</p>
                <p className="text-[10px] text-gray-400">Mumbai • Custom Bespoke Order</p>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-white border border-[#eae5e2] shadow-sm space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                ))}
              </div>
              <p className="text-xs text-gray-700 italic leading-relaxed">
                "The LED backlit Om mandir blends seamlessly into our modern living room. The warm light creates an immediate sense of tranquility during our evening aarti."
              </p>
              <div>
                <p className="text-xs font-bold text-[#1f1c1b]">Ananya & Dr. Mehta</p>
                <p className="text-[10px] text-gray-400">New Delhi • Verified Customer</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
