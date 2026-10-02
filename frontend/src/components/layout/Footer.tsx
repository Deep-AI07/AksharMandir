import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BrandLogo } from '../common/BrandLogo';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Award, 
  Mail, 
  MapPin, 
  Phone, 
  Clock, 
  Heart,
  ArrowRight,
  Check
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { showToast, brandConfig, categories } = useApp();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      showToast('Thank you for subscribing to our Tradition journal!', 'success');
      setEmail('');
    }
  };

  const activeCategories = categories.filter(c => c.isActive);

  return (
    <footer id="main-footer" className="bg-[#1f1c1b] text-[#fbf9f8] border-t border-[#3e0000]">
      {/* Value Pillars Banner */}
      <div className="border-b border-white/10 py-10 bg-[#161413]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Solid Hardwood</h4>
                <p className="text-xs text-gray-400 mt-0.5">Ethically seasoned Sheesham & Burmese Teak.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">White-Glove Delivery</h4>
                <p className="text-xs text-gray-400 mt-0.5">Complimentary pan-India setup by temple experts.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Vastu Shastra Compliant</h4>
                <p className="text-xs text-gray-400 mt-0.5">Exact Vastu dimensional ratios and auspicious directions.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">5-Year Warranty</h4>
                <p className="text-xs text-gray-400 mt-0.5">Comprehensive structural & termite protection.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <Link to="/">
              <BrandLogo 
                config={brandConfig}
                variant="footer"
                theme="dark"
                align="left"
              />
            </Link>
            <p className="text-sm text-stone-300 leading-relaxed max-w-sm">
              {brandConfig.footerDescription || 'Crafting beautiful handcrafted home mandirs that bring timeless tradition and Bhakti at Home to modern living spaces.'}
            </p>

            <div className="pt-2 text-xs text-stone-400 space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#fdcc87] shrink-0" />
                <span>Ateliers: {brandConfig.workshopLocations || 'Saharanpur (UP) • Bengaluru (KA), India'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#fdcc87] shrink-0" />
                <span>Customer Support: {brandConfig.supportPhone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#fdcc87] shrink-0" />
                <span>Direct Inquiries: {brandConfig.supportEmail || 'care@aksharmandir.com'}</span>
              </div>
            </div>
          </div>

          {/* Quick Collections */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#fdcc87]">Mandir Collection</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link to="/mandirs" className="hover:text-[#fdcc87] transition-colors">
                  All Handcrafted Mandirs
                </Link>
              </li>
              {activeCategories.slice(0, 5).map(c => (
                <li key={c.id}>
                  <Link to={`/mandirs/${c.slug}`} className="hover:text-[#fdcc87] transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/custom-mandir" className="hover:text-[#fdcc87] text-[#fdcc87] font-semibold transition-colors flex items-center gap-1">
                  <span>Bespoke Customization</span>
                  <Sparkles className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#fdcc87]">Customer Care</h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link to="/account" className="hover:text-[#fdcc87] transition-colors">My Account & Orders</Link>
              </li>
              <li>
                <Link to="/account/orders" className="hover:text-[#fdcc87] transition-colors">Track Orders & Invoices</Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#fdcc87] transition-colors">Shopping Cart</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-[#fdcc87] transition-colors">Saved Wishlist</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#fdcc87] transition-colors">Artisan Heritage</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#fdcc87] transition-colors">Workshop Visits & Support</Link>
              </li>
            </ul>
          </div>

          {/* Journal Subscription */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-bold text-[#fdcc87]">Bhakti at Home Journal</h4>
            <p className="text-xs text-stone-400">
              Receive auspicious Vastu guidance, artisan woodcraft stories, and festival mandir collections.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-gray-400 focus:outline-hidden focus:border-[#fdcc87]"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#570000] hover:bg-[#800000] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                {subscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} AKSHAR MANDIR. All Rights Reserved. Handcrafted Home Mandirs & Pooja Ghar.</p>
          <div className="flex items-center gap-6">
            <Link to="/admin/login" className="hover:text-[#fdcc87] transition-colors">
              Admin Portal
            </Link>
            <span>•</span>
            <Link to="/about" className="hover:text-[#fdcc87] transition-colors">Vedic Craft Heritage</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-[#fdcc87] transition-colors">Privacy & Quality Guarantee</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
