import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { LogoCustomizerModal } from './LogoCustomizerModal';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Settings, 
  ChevronDown, 
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Palette
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentPage, 
    navigateTo, 
    cartCount, 
    wishlist, 
    user, 
    products, 
    brandConfig,
    formatPrice,
    applyCoupon
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoCustomizerOpen, setLogoCustomizerOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('catalog', { searchQuery: searchQuery.trim(), category: '' });
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'All Mandirs', page: 'catalog' },
    { label: 'Traditional', page: 'catalog', category: 'Traditional' },
    { label: 'Modern Sanctum', page: 'catalog', category: 'Modern' },
    { label: 'Temple Style', page: 'catalog', category: 'Temple Style' },
    { label: 'Bespoke Custom', page: 'custom' },
    { label: 'Heritage Story', page: 'story' },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#fbf9f8]/95 backdrop-blur-md border-b border-[#eae5e2] transition-all">
      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1f1c1b] hover:bg-[#f6f3f2]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo & Brand Identity */}
          <div className="flex items-center">
            <BrandLogo 
              config={brandConfig}
              variant="header"
              theme="light"
              align="left"
              onClick={() => navigateTo('home')}
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((item, idx) => {
              const isActive = currentPage === item.page && (!item.category || item.category === undefined);
              return (
                <button
                  key={idx}
                  id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    if (item.category) {
                      navigateTo('catalog', { category: item.category });
                    } else {
                      navigateTo(item.page);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-[#570000] font-semibold bg-[#570000]/5'
                      : 'text-[#1f1c1b] hover:text-[#570000] hover:bg-[#f6f3f2]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div id="header-actions" className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Trigger */}
            <button
              id="search-toggle-btn"
              onClick={() => setSearchOpen(true)}
              className="p-2.5 rounded-full text-[#1f1c1b] hover:text-[#570000] hover:bg-[#f6f3f2] transition-colors relative"
              title="Search Mandirs"
              aria-label="Search mandirs"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              id="wishlist-nav-btn"
              onClick={() => navigateTo('account')}
              className="p-2.5 rounded-full text-[#1f1c1b] hover:text-[#570000] hover:bg-[#f6f3f2] transition-colors relative"
              title="Sacred Wishlist"
              aria-label="View sacred wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span id="wishlist-count-badge" className="absolute 1 top-1 right-1 bg-[#570000] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              id="cart-nav-btn"
              onClick={() => navigateTo('cart')}
              className="flex items-center gap-2 py-2 px-3 rounded-full bg-[#570000]/5 text-[#570000] hover:bg-[#570000] hover:text-white transition-all group relative border border-[#570000]/20"
              title="Shopping Cart"
              aria-label="View shopping cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-bold tracking-tight">Cart</span>
              {cartCount > 0 && (
                <span id="cart-count-badge" className="bg-[#570000] group-hover:bg-[#fdcc87] group-hover:text-[#570000] text-white text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Portal Menu */}
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[#eae5e2] hover:border-[#7b581e] bg-white text-[#1f1c1b] transition-all"
                aria-label="User Account menu"
              >
                <div className="w-7 h-7 rounded-full bg-[#7b581e]/10 text-[#7b581e] flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-xs font-medium max-w-[90px] truncate">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:inline" />
              </button>

              {/* Dropdown popup */}
              {userMenuOpen && (
                <div 
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-2xl border border-[#eae5e2] py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#eae5e2]">
                    <p className="text-xs text-gray-500 font-medium">Namaste,</p>
                    <p className="text-sm font-bold text-[#1f1c1b] truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigateTo('account');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#1f1c1b] hover:bg-[#f6f3f2] flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-[#7b581e]" />
                      <span>My Account & Orders</span>
                    </button>
                    <button
                      onClick={() => {
                        navigateTo('custom');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#1f1c1b] hover:bg-[#f6f3f2] flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#7b581e]" />
                      <span>Bespoke Mandir Request</span>
                    </button>
                    <button
                      onClick={() => {
                        setLogoCustomizerOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#7b581e] hover:bg-[#7b581e]/10 flex items-center gap-2 font-medium"
                    >
                      <Palette className="w-4 h-4 text-[#7b581e]" />
                      <span>Customize Logo & Brand</span>
                    </button>
                  </div>

                  <div className="border-t border-[#eae5e2] pt-1">
                    <button
                      onClick={() => {
                        navigateTo('admin-dashboard');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-[#570000] hover:bg-[#570000]/10 flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4 text-[#570000]" />
                      <span>Admin Management Portal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Admin Shortcut Button */}
            <button
              id="admin-quick-btn"
              onClick={() => navigateTo(currentPage.startsWith('admin') ? 'home' : 'admin-dashboard')}
              className={`hidden md:flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-all ${
                currentPage.startsWith('admin')
                  ? 'bg-[#570000] text-white border-[#570000]'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-300'
              }`}
              title="Toggle Store / Admin Mode"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{currentPage.startsWith('admin') ? 'Storefront' : 'Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="lg:hidden border-t border-[#eae5e2] bg-[#fbf9f8] px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.category) {
                  navigateTo('catalog', { category: item.category });
                } else {
                  navigateTo(item.page);
                }
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-[#1f1c1b] hover:bg-[#f6f3f2] hover:text-[#570000] transition-colors"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-[#eae5e2] flex flex-col gap-2">
            <button
              onClick={() => {
                navigateTo('admin-dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-semibold bg-[#570000]/10 text-[#570000] flex items-center justify-between"
            >
              <span>Admin Management Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search Overlay Modal */}
      {searchOpen && (
        <div 
          id="search-overlay-modal" 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#eae5e2] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Search bar input */}
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-[#eae5e2] flex items-center gap-3">
              <Search className="w-6 h-6 text-[#7b581e]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by mandir name, wood (Sheesham, Teak), style, or dimensions..."
                className="w-full text-base font-medium outline-none bg-transparent text-[#1f1c1b] placeholder-gray-400"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs font-semibold text-gray-500 hover:text-black px-2 py-1 bg-gray-100 rounded"
              >
                ESC
              </button>
            </form>

            {/* Quick search suggestions or results */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div>
                  <p className="text-xs font-semibold text-[#7b581e] uppercase tracking-wider mb-2">Popular Searches</p>
                  <div className="flex flex-wrap gap-2">
                    {['Sheesham Wood Mandir', 'Modern LED Mandir', 'Apartment Wall Mandir', 'Burma Teak Temple', 'Brass Bell Pooja Unit', 'Lotus Inlay'].map((tag, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(tag);
                          navigateTo('catalog', { searchQuery: tag, category: '' });
                          setSearchOpen(false);
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-[#f6f3f2] hover:bg-[#570000] hover:text-white transition-colors text-gray-700 font-medium"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Mandirs Matching "{searchQuery}"</p>
                  {searchResults.map(prod => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        navigateTo('product', { productId: prod.id });
                        setSearchOpen(false);
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f6f3f2] cursor-pointer transition-colors"
                    >
                      <img 
                        src={prod.images[0]} 
                        alt={prod.title} 
                        className="w-14 h-14 rounded-lg object-cover border border-[#eae5e2]" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1f1c1b] truncate">{prod.title}</p>
                        <p className="text-xs text-gray-500">{prod.category} • {prod.material} • {prod.dimensions}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#570000]">{formatPrice(prod.price)}</p>
                        {prod.originalPrice > prod.price && (
                          <p className="text-[11px] text-gray-400 line-through">{formatPrice(prod.originalPrice)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full mt-3 py-2 text-center text-xs font-semibold text-[#570000] hover:underline"
                  >
                    View all matching mandir results →
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Compass className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium">No mandirs found for "{searchQuery}"</p>
                  <p className="text-xs text-gray-400 mt-1">Try searching for Teak, Sheesham, Modern, or Wall Mounted.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logo and Brand Customizer Modal */}
      <LogoCustomizerModal
        isOpen={logoCustomizerOpen}
        onClose={() => setLogoCustomizerOpen(false)}
      />
    </header>
  );
};
