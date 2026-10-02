import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl, getCategoryImageUrl, handleImageError } from '../../utils/imageUtils';
import { BrandLogo } from '../common/BrandLogo';
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
  LogOut,
  SlidersHorizontal,
  Package,
  Layers,
  Palette,
  ChevronRight
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    cartCount, 
    wishlist, 
    user, 
    products, 
    categories,
    brandConfig,
    formatPrice,
    logout,
    isAdmin,
    isAuthenticated
  } = useApp();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setCategoriesDropdownOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && (typeof p.category === 'object' ? p.category.name : String(p.category)).toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
      ).slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/mandirs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const activeCategories = categories.filter(c => c.isActive);

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#fbf9f8]/95 backdrop-blur-md border-b border-[#eae5e2] transition-all">
      {/* Announcement Bar */}
      <div className="bg-[#570000] text-[#fdcc87] text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>Auspicious Vedic Dimensions & Pure Seasoned Timber • Pan-India White Glove Mandir Delivery</span>
      </div>

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
            <Link to="/" className="no-underline">
              <BrandLogo 
                config={brandConfig}
                variant="header"
                theme="light"
                align="left"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav id="desktop-nav" className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/'
                  ? 'text-[#570000] font-semibold bg-[#570000]/5'
                  : 'text-[#1f1c1b] hover:text-[#570000] hover:bg-[#f6f3f2]'
              }`}
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <div className="relative group">
              <button
                id="header-categories-dropdown-btn"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                onMouseEnter={() => setCategoriesDropdownOpen(true)}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                  location.pathname.startsWith('/mandirs')
                    ? 'text-[#570000] font-semibold bg-[#570000]/5'
                    : 'text-[#1f1c1b] hover:text-[#570000] hover:bg-[#f6f3f2]'
                }`}
              >
                <Layers className="w-4 h-4 text-[#570000]" />
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180 text-[#570000]' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <div 
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
                className={`absolute left-0 top-full pt-2 w-80 z-50 transition-all ${
                  categoriesDropdownOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                }`}
              >
                <div className="bg-white rounded-2xl shadow-2xl border border-[#eae5e2] py-2 overflow-hidden divide-y divide-[#eae5e2]">
                  {/* Dropdown Top Bar */}
                  <div className="px-4 py-2.5 bg-[#fbf9f8] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[#7b581e]">Divine Collections</p>
                      <p className="text-xs font-semibold text-gray-700">{activeCategories.length} Available Types</p>
                    </div>
                    <Link
                      to="/mandirs"
                      className="text-[11px] font-bold text-[#570000] hover:text-[#800000] flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Categories List */}
                  <div className="max-h-72 overflow-y-auto py-1 divide-y divide-gray-50">
                    {activeCategories.map(cat => (
                      <Link
                        key={cat.id}
                        to={`/mandirs/${cat.slug}`}
                        className="flex items-center justify-between p-2.5 mx-2 rounded-xl hover:bg-[#f6f3f2] transition-colors group/item"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getCategoryImageUrl(cat)}
                            alt={cat.name}
                            onError={handleImageError}
                            className="w-10 h-10 rounded-lg object-cover border border-[#eae5e2] shrink-0 group-hover/item:scale-105 transition-transform"
                          />
                          <div>
                            <span className="font-serif font-bold text-xs text-[#1f1c1b] group-hover/item:text-[#570000] block transition-colors">
                              {cat.name}
                            </span>
                            {cat.description && (
                              <span className="text-[10px] text-gray-500 line-clamp-1 max-w-[140px]">
                                {cat.description}
                              </span>
                            )}
                          </div>
                        </div>

                        {cat.badge && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#fdcc87]/30 text-[#570000] font-bold uppercase tracking-wider shrink-0 border border-[#fdcc87]/50">
                            {cat.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Explore All Link */}
                  <div className="p-2.5 bg-[#fbf9f8] border-t border-[#eae5e2] text-center">
                    <Link
                      to="/mandirs"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="text-xs font-bold text-[#570000] hover:text-[#800000] flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Explore Mandir Collection</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/custom-mandir"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                location.pathname === '/custom-mandir'
                  ? 'text-[#570000] font-semibold bg-[#570000]/5'
                  : 'text-[#1f1c1b] hover:text-[#570000] hover:bg-[#f6f3f2]'
              }`}
            >
              <span>Bespoke Custom</span>
              <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
            </Link>

            <Link
              to="/about"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/about'
                  ? 'text-[#570000] font-semibold bg-[#570000]/5'
                  : 'text-[#1f1c1b] hover:text-[#570000] hover:bg-[#f6f3f2]'
              }`}
            >
              Heritage Story
            </Link>

            <Link
              to="/contact"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                location.pathname === '/contact'
                  ? 'text-[#570000] font-semibold bg-[#570000]/5'
                  : 'text-[#1f1c1b] hover:text-[#570000] hover:bg-[#f6f3f2]'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Trigger */}
            <button
              id="header-search-btn"
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-xl text-[#1f1c1b] hover:bg-[#f6f3f2] hover:text-[#570000] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              id="header-wishlist-btn"
              className="relative p-2 rounded-xl text-[#1f1c1b] hover:bg-[#f6f3f2] hover:text-[#570000] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#570000] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              id="header-cart-btn"
              className="relative p-2 rounded-xl text-[#1f1c1b] hover:bg-[#f6f3f2] hover:text-[#570000] transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#570000] text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile Menu */}
            <div className="relative">
              <button
                id="header-user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 rounded-xl text-[#1f1c1b] hover:bg-[#f6f3f2] hover:text-[#570000] transition-colors flex items-center gap-1.5"
                aria-label="User Account"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full object-cover border border-[#d4af37]" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                {isAuthenticated && (
                  <span className="hidden md:inline text-xs font-semibold text-[#570000] max-w-[90px] truncate">
                    {user?.name.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#eae5e2] py-2 z-50">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-[#eae5e2]">
                        <p className="text-xs font-bold text-[#1f1c1b]">{user?.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#570000] text-white">
                            ADMINISTRATOR
                          </span>
                        )}
                      </div>

                      <Link
                        to="/account"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#1f1c1b] hover:bg-[#f6f3f2]"
                      >
                        <User className="w-4 h-4 text-[#7b581e]" />
                        <span>My Account & Orders</span>
                      </Link>

                      <Link
                        to="/account/orders"
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#1f1c1b] hover:bg-[#f6f3f2]"
                      >
                        <Package className="w-4 h-4 text-[#7b581e]" />
                        <span>My Orders & Invoices</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#570000] hover:bg-[#570000]/5 border-t border-[#eae5e2]"
                        >
                          <Layers className="w-4 h-4" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 border-t border-[#eae5e2] text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 space-y-2">
                        <Link
                          to="/login"
                          className="block w-full py-2 text-center text-xs font-bold rounded-xl bg-[#570000] text-white shadow-xs hover:bg-[#800000]"
                        >
                          Customer Sign In
                        </Link>
                        <Link
                          to="/register"
                          className="block w-full py-2 text-center text-xs font-bold rounded-xl border border-[#eae5e2] text-[#1f1c1b] hover:bg-[#f6f3f2]"
                        >
                          Create Account
                        </Link>
                      </div>
                      <div className="border-t border-[#eae5e2] px-3 pt-2">
                        <Link
                          to="/admin/login"
                          className="text-[11px] text-[#7b581e] font-semibold hover:underline block py-1 text-center"
                        >
                          Admin Access Portal →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#eae5e2] overflow-hidden animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleSearchSubmit} className="p-4 flex items-center gap-3 border-b border-[#eae5e2]">
              <Search className="w-5 h-5 text-[#7b581e]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by mandir title, wood type, SKU, bells..."
                className="w-full bg-transparent text-base text-[#1f1c1b] placeholder:text-gray-400 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Results */}
            {searchResults.length > 0 && (
              <div className="p-4 divide-y divide-[#eae5e2] max-h-96 overflow-y-auto">
                <p className="text-[11px] uppercase tracking-wider font-bold text-gray-400 pb-2">Matching Mandirs</p>
                {searchResults.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      navigate(`/product/${prod.slug}`);
                      setSearchOpen(false);
                    }}
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-[#fbf9f8] px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getProductImageUrl(prod, 0)}
                        alt={prod.title}
                        onError={handleImageError}
                        className="w-12 h-12 object-cover rounded-lg border border-[#eae5e2]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#1f1c1b]">{prod.title}</h4>
                        <p className="text-[11px] text-gray-500">{prod.material} • {prod.mountingType}</p>
                      </div>
                    </div>
                    <span className="text-xs font-serif font-bold text-[#570000]">{formatPrice(prod.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#eae5e2] px-4 pt-2 pb-6 space-y-3">
          <Link to="/" className="block py-2 text-sm font-semibold text-[#1f1c1b]">Home</Link>
          <Link to="/mandirs" className="block py-2 text-sm font-semibold text-[#1f1c1b]">All Handcrafted Mandirs</Link>
          <div className="pl-3 space-y-2 border-l-2 border-[#570000]/20">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#7b581e]">Mandir Categories</p>
            {activeCategories.map(c => (
              <Link key={c.id} to={`/mandirs/${c.slug}`} className="flex items-center justify-between py-1 text-xs text-gray-600 font-medium">
                <span>{c.name}</span>
                {c.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#fdcc87]/30 text-[#570000] font-bold">
                    {c.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <Link to="/custom-mandir" className="block py-2 text-sm font-semibold text-[#570000] flex items-center gap-1.5">
            <span>Bespoke Custom Mandir</span>
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          </Link>
          <Link to="/about" className="block py-2 text-sm font-semibold text-[#1f1c1b]">Heritage Story</Link>
          <Link to="/contact" className="block py-2 text-sm font-semibold text-[#1f1c1b]">Contact & Workshop</Link>

          <div className="pt-4 border-t border-[#eae5e2] flex items-center justify-between">
            {isAuthenticated ? (
              <div className="flex items-center justify-between w-full">
                <Link to="/account" className="text-xs font-bold text-[#570000]">My Account ({user?.name})</Link>
                <button onClick={logout} className="text-xs text-red-600 font-semibold">Logout</button>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <Link to="/login" className="flex-1 py-2 text-center text-xs font-bold bg-[#570000] text-white rounded-xl">Sign In</Link>
                <Link to="/register" className="flex-1 py-2 text-center text-xs font-bold border border-[#eae5e2] rounded-xl">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
