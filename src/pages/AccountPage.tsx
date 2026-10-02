import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/BrandLogo';
import { Address, Order, OrderStatus } from '../types';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Sparkles, 
  Edit3, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Truck, 
  ShieldCheck, 
  ChevronRight, 
  ShoppingBag, 
  X, 
  FileText, 
  Phone, 
  Mail,
  Check
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { 
    user, 
    updateUserProfile, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress,
    orders, 
    customRequests, 
    wishlist, 
    products, 
    addToCart, 
    toggleWishlist, 
    formatPrice, 
    brandConfig,
    navigateTo 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'addresses' | 'custom'>('orders');

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profileDeity, setProfileDeity] = useState(user.preferredDeity || '');

  // Add Address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState(user.name);
  const [newAddrPhone, setNewAddrPhone] = useState(user.phone);
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrApartment, setNewAddrApartment] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('Bengaluru');
  const [newAddrState, setNewAddrState] = useState('Karnataka');
  const [newAddrPincode, setNewAddrPincode] = useState('560038');
  const [newAddrType, setNewAddrType] = useState<'Home' | 'Office' | 'Pooja Ghar'>('Home');
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);

  // Track Order Modal
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // View Invoice Modal
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: profileName,
      phone: profilePhone,
      email: profileEmail,
      preferredDeity: profileDeity
    });
    setIsEditingProfile(false);
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress({
      fullName: newAddrName,
      phone: newAddrPhone,
      streetAddress: newAddrStreet,
      apartment: newAddrApartment,
      city: newAddrCity,
      state: newAddrState,
      pincode: newAddrPincode,
      type: newAddrType,
      isDefault: newAddrIsDefault
    });
    setIsAddingAddress(false);
    setNewAddrStreet('');
    setNewAddrApartment('');
  };

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  const getOrderStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Dispatched': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Artisan Crafting': return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Quality Check': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Processing': return 'bg-stone-100 text-stone-800 border-stone-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div id="account-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Header Profile Banner */}
      <div className="bg-gradient-to-r from-[#570000] to-[#7b581e] text-white rounded-3xl p-6 sm:p-10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-[#fdcc87] text-[#570000] font-serif font-bold text-3xl flex items-center justify-center border-4 border-white/20 shadow-lg shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">{user.name}</h1>
              <span className="text-[11px] bg-[#fdcc87] text-[#3e0000] font-bold px-2.5 py-0.5 rounded-full">
                Valued Member
              </span>
            </div>
            <p className="text-xs text-stone-200 mt-1 flex items-center gap-2">
              <span>{user.email}</span> • <span>{user.phone}</span>
            </p>
            {user.preferredDeity && (
              <p className="text-xs text-[#fdcc87] mt-0.5 font-medium">
                Family Devotion: {user.preferredDeity}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsEditingProfile(true)}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-semibold flex items-center gap-2 backdrop-blur-sm"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-[#eae5e2] overflow-x-auto space-x-2 sm:space-x-4">
        {[
          { id: 'orders', label: 'My Orders', icon: <Package className="w-4 h-4" />, count: orders.length },
          { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" />, count: wishlist.length },
          { id: 'addresses', label: 'Saved Addresses', icon: <MapPin className="w-4 h-4" />, count: user.addresses.length },
          { id: 'custom', label: 'Bespoke Inquiries', icon: <Sparkles className="w-4 h-4" />, count: customRequests.length },
          { id: 'profile', label: 'Profile Settings', icon: <User className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-4 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-white text-[#570000] border-t-2 border-l border-r border-[#eae5e2] shadow-xs'
                : 'text-gray-600 hover:text-black hover:bg-[#f6f3f2]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id ? 'bg-[#570000] text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: MY ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#eae5e2] p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-serif font-bold">No Mandir Orders Found</h3>
              <p className="text-xs text-gray-500">Your placed temple orders will appear here with live tracking.</p>
              <button
                onClick={() => navigateTo('catalog')}
                className="px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl"
              >
                Browse Mandirs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(ord => (
                <div key={ord.id} className="bg-white rounded-3xl border border-[#eae5e2] p-6 shadow-sm space-y-4">
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#eae5e2]">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#1f1c1b]">{ord.orderNumber}</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getOrderStatusColor(ord.status)}`}>
                          ● {ord.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Placed on {ord.date} • {ord.paymentMethod}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTrackingOrder(ord)}
                        className="px-4 py-2 rounded-xl bg-[#570000]/10 text-[#570000] hover:bg-[#570000] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Status</span>
                      </button>
                      <button
                        onClick={() => setInvoiceOrder(ord)}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-xl border border-[#eae5e2]" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#1f1c1b] truncate">{item.title}</h4>
                          <p className="text-[11px] text-gray-500">Finish: {item.finish} • Qty: {item.quantity}</p>
                          <p className="text-xs font-bold text-[#570000]">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="pt-3 border-t border-[#eae5e2] flex flex-wrap items-center justify-between text-xs text-gray-600 gap-2">
                    <div>
                      <span>Delivery Address: </span>
                      <strong className="text-gray-900">{ord.shippingAddress.fullName}, {ord.shippingAddress.city}</strong>
                    </div>
                    <div>
                      <span>Total Amount: </span>
                      <strong className="text-base font-bold font-serif text-[#570000]">{formatPrice(ord.total)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WISHLIST */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6 animate-in fade-in">
          {wishlistedProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#eae5e2] p-12 text-center space-y-4">
              <Heart className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-serif font-bold">Your Wishlist is Empty</h3>
              <p className="text-xs text-gray-500">Save mandirs while browsing to keep track of your favorite handcrafted designs.</p>
              <button
                onClick={() => navigateTo('catalog')}
                className="px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl"
              >
                Explore Mandirs
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistedProducts.map(prod => (
                <div key={prod.id} className="bg-white rounded-2xl overflow-hidden border border-[#eae5e2] shadow-sm flex flex-col justify-between">
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer" onClick={() => navigateTo('product', { productId: prod.id })}>
                    <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white text-red-600 shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#7b581e] uppercase">{prod.category}</span>
                      <h4
                        onClick={() => navigateTo('product', { productId: prod.id })}
                        className="font-serif font-bold text-sm text-[#1f1c1b] hover:text-[#570000] cursor-pointer"
                      >
                        {prod.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">{prod.material} • {prod.dimensions}</p>
                    </div>

                    <div className="pt-2 border-t border-[#eae5e2] flex items-center justify-between">
                      <span className="text-base font-bold text-[#570000]">{formatPrice(prod.price)}</span>
                      <button
                        onClick={() => addToCart(prod, 1, prod.finish)}
                        className="py-2 px-3 bg-[#570000] hover:bg-[#800000] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAVED ADDRESSES */}
      {activeTab === 'addresses' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Saved Delivery Addresses</h3>
            <button
              onClick={() => setIsAddingAddress(true)}
              className="px-4 py-2 bg-[#570000] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.addresses.map(addr => (
              <div key={addr.id} className="bg-white p-6 rounded-2xl border border-[#eae5e2] shadow-sm space-y-3 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase bg-[#7b581e]/10 text-[#7b581e] px-2.5 py-0.5 rounded">
                      {addr.type}
                    </span>
                    {addr.isDefault && (
                      <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Remove address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-[#1f1c1b]">{addr.fullName}</h4>
                  <p className="text-xs text-gray-500">{addr.phone}</p>
                  <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                    {addr.streetAddress} {addr.apartment && `, ${addr.apartment}`} <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="text-xs font-bold text-[#570000] hover:underline"
                  >
                    Set as Default Address
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BESPOKE INQUIRIES */}
      {activeTab === 'custom' && (
        <div className="space-y-6 animate-in fade-in">
          {customRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#eae5e2] p-12 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-serif font-bold">No Custom Mandir Inquiries</h3>
              <p className="text-xs text-gray-500">Design a temple tailored to your exact room corners, wood preference, and deity heights.</p>
              <button
                onClick={() => navigateTo('custom')}
                className="px-6 py-2.5 bg-[#fdcc87] text-[#3e0000] text-xs font-bold rounded-xl shadow"
              >
                Create Custom Mandir Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customRequests.map(req => (
                <div key={req.id} className="bg-white rounded-3xl border border-[#eae5e2] p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#eae5e2]">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#570000]">{req.id}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          ● {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Submitted on {req.createdAt}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">Estimated Quote:</span>
                      <span className="text-lg font-serif font-bold text-[#570000]">{formatPrice(req.estimatedQuote)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-[#f6f3f2]">
                      <span className="text-gray-500 block">Dimensions:</span>
                      <strong className="text-[#1f1c1b]">{req.width}"W × {req.depth}"D × {req.height}"H ({req.mounting})</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f3f2]">
                      <span className="text-gray-500 block">Material & Polish:</span>
                      <strong className="text-[#1f1c1b]">{req.materialPreference} • {req.finishType}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-[#f6f3f2]">
                      <span className="text-gray-500 block">Special Features:</span>
                      <strong className="text-[#1f1c1b]">{req.features.length} inclusions</strong>
                    </div>
                  </div>

                  {req.engravingRequirements && (
                    <div className="text-xs text-gray-700 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <strong>Engraving:</strong> {req.engravingRequirements}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-[#eae5e2] p-8 shadow-sm max-w-2xl space-y-6 animate-in fade-in">
          <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Account & Mandir Preferences</h3>
          
          <div className="space-y-4 text-xs text-gray-700">
            <div className="p-3.5 bg-[#f6f3f2] rounded-xl flex justify-between items-center">
              <div>
                <span className="text-gray-500 block">Full Name</span>
                <span className="font-bold text-sm text-[#1f1c1b]">{user.name}</span>
              </div>
              <button onClick={() => setIsEditingProfile(true)} className="text-[#570000] font-semibold hover:underline">Edit</button>
            </div>

            <div className="p-3.5 bg-[#f6f3f2] rounded-xl flex justify-between items-center">
              <div>
                <span className="text-gray-500 block">Email Address</span>
                <span className="font-bold text-sm text-[#1f1c1b]">{user.email}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#f6f3f2] rounded-xl flex justify-between items-center">
              <div>
                <span className="text-gray-500 block">Phone Number</span>
                <span className="font-bold text-sm text-[#1f1c1b]">{user.phone}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#f6f3f2] rounded-xl flex justify-between items-center">
              <div>
                <span className="text-gray-500 block">Preferred Deity / Puja Focus</span>
                <span className="font-bold text-sm text-[#1f1c1b]">{user.preferredDeity || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-[#eae5e2]">
            <div className="flex justify-between items-center pb-2 border-b border-[#eae5e2]">
              <h3 className="font-bold text-sm text-[#1f1c1b]">Edit Profile</h3>
              <button onClick={() => setIsEditingProfile(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={e => setProfileEmail(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Preferred Deities / Spiritual Focus</label>
                <input
                  type="text"
                  value={profileDeity}
                  onChange={e => setProfileDeity(e.target.value)}
                  placeholder="e.g. Lord Krishna, Shiva, Ganesha"
                  className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#570000] text-white rounded-xl font-bold shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddingAddress && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-[#eae5e2]">
            <div className="flex justify-between items-center pb-2 border-b border-[#eae5e2]">
              <h3 className="font-bold text-sm text-[#1f1c1b]">Add New Delivery Address</h3>
              <button onClick={() => setIsAddingAddress(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSaveNewAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={newAddrName}
                    onChange={e => setNewAddrName(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newAddrPhone}
                    onChange={e => setNewAddrPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddrStreet}
                  onChange={e => setNewAddrStreet(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddrCity}
                    onChange={e => setNewAddrCity(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newAddrState}
                    onChange={e => setNewAddrState(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={newAddrPincode}
                    onChange={e => setNewAddrPincode(e.target.value)}
                    className="w-full p-2.5 rounded-lg border bg-[#fbf9f8]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-4 py-2 border rounded-xl text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#570000] text-white rounded-xl font-bold shadow"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Order Live Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setTrackingOrder(null)}>
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#eae5e2] space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7b581e]">Live Mandir Tracker</span>
                <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Order {trackingOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setTrackingOrder(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            {/* 5-Stage Milestone Progress */}
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#570000]/20 pl-8 text-xs">
              {[
                { title: 'Order Confirmed & Timber Allocated', desc: 'Seasoned Sheesham/Teak logs selected', done: true },
                { title: 'Artisan Woodcarving & Jaali Work', desc: 'Master woodcarver sculpting arches and pillars', done: trackingOrder.status !== 'Processing' },
                { title: 'Multi-Coat Wax Polishing & Brass Fitting', desc: 'Hand-buffed organic teak oil finish and bells mounting', done: trackingOrder.status === 'Dispatched' || trackingOrder.status === 'Delivered' },
                { title: 'Dispatched in Heavy Wooden Crate', desc: `Tracking ID: ${trackingOrder.trackingNumber}`, done: trackingOrder.status === 'Dispatched' || trackingOrder.status === 'Delivered' },
                { title: 'White-Glove Room Delivery & Installation', desc: 'Estimated delivery: ' + trackingOrder.estimatedDelivery, done: trackingOrder.status === 'Delivered' }
              ].map((step, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-8 top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done ? 'bg-[#570000] text-white shadow' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.done ? <Check className="w-3.5 h-3.5 text-[#fdcc87]" /> : idx + 1}
                  </div>
                  <div>
                    <h4 className={`font-bold ${step.done ? 'text-[#1f1c1b]' : 'text-gray-400'}`}>{step.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full py-3 bg-[#570000] text-white text-xs font-bold rounded-xl shadow"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setInvoiceOrder(null)}>
          <div className="bg-white max-w-xl w-full rounded-3xl p-8 shadow-2xl border border-[#eae5e2] space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start pb-4 border-b border-[#eae5e2]">
              <div>
                <BrandLogo config={brandConfig} variant="invoice" theme="light" align="left" />
                <p className="text-[10px] text-stone-500 uppercase tracking-wider mt-1">Official Tax Invoice</p>
              </div>
              <div className="text-right text-xs text-stone-500">
                <p className="font-mono font-bold text-[#1f1c1b]">Invoice #{invoiceOrder.orderNumber}</p>
                <p>Date: {invoiceOrder.date}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-700">
              <div className="flex justify-between pb-2 border-b border-[#eae5e2] font-bold text-gray-900">
                <span>Mandir Item</span>
                <span>Amount</span>
              </div>
              {invoiceOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{item.title} ({item.finish}) × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              {invoiceOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Promo Discount ({invoiceOrder.couponCode})</span>
                  <span>-{formatPrice(invoiceOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>White-Glove Shipping & Installation</span>
                <span className="text-emerald-700 font-bold">Complimentary (₹0)</span>
              </div>
              <div className="pt-3 border-t border-[#eae5e2] flex justify-between text-sm font-bold text-[#570000]">
                <span>Total Paid:</span>
                <span>{formatPrice(invoiceOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setInvoiceOrder(null)}
                className="px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
