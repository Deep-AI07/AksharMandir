import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { Address, Order } from '../../types';
import { api } from '../../services/api';
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
  Lock,
  Printer,
  Download,
  Camera,
  Upload,
  Eye,
  EyeOff,
  Save,
  Mail,
  Home,
  ArrowLeft
} from 'lucide-react';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { downloadInvoicePdf, printInvoice } from '../../utils/invoiceUtils';

export const AccountPage: React.FC = () => {
  const { id: orderIdParam } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const { 
    user, 
    updateUserProfile, 
    changePassword,
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress,
    addresses,
    orders, 
    customRequests, 
    wishlist, 
    products, 
    addToCart, 
    toggleWishlist, 
    formatPrice,
    showToast,
    logout,
    isAuthenticated,
    refreshOrders,
    refreshAddresses,
    refreshCustomRequests
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'wishlist' | 'addresses' | 'custom'>('orders');

  // Edit profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfilePhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  // Handle Avatar Photo File Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const uploadedUrl = await api.upload.uploadImage(file);
      setAvatarUrl(uploadedUrl);
      await updateUserProfile({ avatarUrl: uploadedUrl });
      showToast('Profile photo updated successfully.', 'success');
    } catch (err: any) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
          await updateUserProfile({ avatarUrl: reader.result });
          showToast('Profile photo updated locally.', 'success');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Add Address state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState(user?.name || '');
  const [newAddrPhone, setNewAddrPhone] = useState(user?.phone || '');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrApartment, setNewAddrApartment] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');
  const [newAddrType, setNewAddrType] = useState<string>('Home');
  const [newAddrIsDefault, setNewAddrIsDefault] = useState(false);

  // Track Order Modal
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // View Invoice Modal
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderIdParam) {
      const match = orders.find(o => o.id === orderIdParam || o.orderNumber === orderIdParam);
      if (match) {
        setTrackingOrder(match);
      }
    }
  }, [orderIdParam, orders]);

  // Fetch orders and profile data when viewing account
  useEffect(() => {
    if (isAuthenticated) {
      refreshOrders();
      refreshAddresses();
      refreshCustomRequests();
    }
  }, [isAuthenticated, refreshOrders, refreshAddresses, refreshCustomRequests]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#570000]/10 text-[#570000] flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#1f1c1b]">Sign In to Your Account</h2>
        <p className="text-xs text-gray-500">Access your order history, tracking details, and saved delivery addresses.</p>
        <div className="flex justify-center gap-3 pt-2">
          <Link to="/login" className="px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl">
            Customer Sign In
          </Link>
          <Link to="/register" className="px-6 py-2.5 border border-[#eae5e2] text-xs font-semibold rounded-xl">
            Register
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    if (!profileEmail.trim() || !profileEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    try {
      setSavingProfile(true);
      await updateUserProfile({
        name: profileName.trim(),
        email: profileEmail.trim().toLowerCase(),
        phone: profilePhone.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass) {
      showToast('Please enter both current and new password.', 'error');
      return;
    }
    if (newPass.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPass !== confirmNewPass) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      setChangingPass(true);
      const res = await changePassword(currentPass, newPass);
      if (res.success) {
        setCurrentPass('');
        setNewPass('');
        setConfirmNewPass('');
      }
    } finally {
      setChangingPass(false);
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName.trim() || !newAddrPhone.trim() || !newAddrStreet.trim() || !newAddrCity.trim() || !newAddrState.trim() || !newAddrPincode.trim()) {
      showToast('All address fields are required.', 'error');
      return;
    }
    if (newAddrPhone.trim().replace(/[\s\-()]/g, '').length < 10) {
      showToast('Please enter a valid 10-digit contact phone number.', 'error');
      return;
    }
    if (newAddrPincode.trim().length < 6) {
      showToast('Please enter a valid 6-digit postal pincode.', 'error');
      return;
    }

    await addAddress({
      fullName: newAddrName.trim(),
      phone: newAddrPhone.trim(),
      streetAddress: newAddrStreet.trim(),
      apartment: newAddrApartment.trim() || undefined,
      city: newAddrCity.trim(),
      state: newAddrState.trim(),
      pincode: newAddrPincode.trim(),
      type: newAddrType,
      isDefault: newAddrIsDefault,
    });
    setIsAddingAddress(false);
    setNewAddrStreet('');
    setNewAddrApartment('');
  };

  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div id="account-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Store Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5e2]">
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#570000] flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[#570000] font-bold">My Account</span>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-gray-600 capitalize">{activeTab}</span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link
            to="/mandirs"
            className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#570000]" />
            <span>Browse Mandirs</span>
          </Link>
          <Link
            to="/"
            className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </div>

      {/* Account Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#2b2422] to-[#1f1c1b] text-white border border-[#d4af37]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                onError={handleImageError}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#fdcc87] shadow-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#570000] border-2 border-[#fdcc87] flex items-center justify-center font-serif text-2xl font-bold text-[#fdcc87] shadow-lg">
                {user?.name?.charAt(0) || 'D'}
              </div>
            )}
            <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-[#fdcc87]">
              <Camera className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#fbf9f8]">{user?.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fdcc87]/20 text-[#fdcc87] border border-[#fdcc87]/30">
                {user?.role === 'ADMIN' ? 'Admin Custodian' : 'Valued Customer'}
              </span>
            </div>
            <p className="text-xs text-stone-300">{user?.email} • {user?.phone || 'No phone added'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2 rounded-xl bg-[#570000] hover:bg-[#7b0000] text-xs font-bold text-[#fdcc87] border border-[#fdcc87]/30 transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="flex border-b border-[#eae5e2] gap-6 text-xs sm:text-sm font-semibold overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'orders' ? 'text-[#570000] border-b-2 border-[#570000]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'custom' ? 'text-[#570000] border-b-2 border-[#570000]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Custom Mandirs ({customRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'wishlist' ? 'text-[#570000] border-b-2 border-[#570000]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlist.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'addresses' ? 'text-[#570000] border-b-2 border-[#570000]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Addresses ({addresses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 transition-colors ${
            activeTab === 'profile' ? 'text-[#570000] border-b-2 border-[#570000]' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#eae5e2] space-y-4">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-serif font-bold text-[#1f1c1b]">No Orders Placed Yet</h3>
              <p className="text-xs text-gray-500">You have not ordered any handcrafted mandirs yet.</p>
              <Link to="/mandirs" className="inline-block px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl">
                Browse Handcrafted Mandirs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
                  {/* Order Top Line */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eae5e2] gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Order Reference</span>
                      <strong className="font-mono text-sm text-[#1f1c1b]">{ord.orderNumber}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Order Date</span>
                      <strong className="text-gray-700">{new Date(ord.createdAt).toLocaleDateString('en-IN')}</strong>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Amount</span>
                      <strong className="font-serif font-bold text-sm text-[#570000]">{formatPrice(ord.total)}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#570000]/10 text-[#570000]">
                        {ord.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-[#eae5e2]">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={getProductImageUrl(item.image || item)}
                            alt={item.title}
                            onError={handleImageError}
                            className="w-12 h-12 object-cover rounded-xl border border-[#eae5e2]"
                          />
                          <div>
                            <strong className="text-[#1f1c1b] block">{item.title}</strong>
                            <span className="text-gray-500">Finish: {item.finish} • Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-serif font-bold text-sm text-gray-800">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Truck className="w-4 h-4 text-[#7b581e]" />
                      <span>Delivery: <strong>{ord.deliveryStatus.replace('_', ' ')}</strong></span>
                      {ord.trackingNumber && <span className="font-mono text-[11px] text-gray-400">({ord.trackingNumber})</span>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setTrackingOrder(ord)}
                        className="px-4 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-[#1f1c1b] font-semibold hover:border-[#570000]"
                      >
                        Track Status
                      </button>
                      <button
                        onClick={() => setInvoiceOrder(ord)}
                        className="px-4 py-2 rounded-xl bg-[#570000] text-white font-semibold hover:bg-[#800000] flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Custom Mandir Requests */}
      {activeTab === 'custom' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Your Custom Mandir Consultations</h3>
            <Link to="/custom-mandir" className="px-4 py-2 rounded-xl bg-[#570000] text-white text-xs font-bold">
              + New Custom Request
            </Link>
          </div>

          {customRequests.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#eae5e2] space-y-4">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-serif font-bold text-[#1f1c1b]">No Custom Requests Yet</h3>
              <p className="text-xs text-gray-500">Configure a mandir designed specifically for your home and deity.</p>
              <Link to="/custom-mandir" className="inline-block px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl">
                Configure Custom Mandir
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {customRequests.map((req) => (
                <div key={req.id} className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4 text-xs">
                  <div className="flex justify-between items-start pb-4 border-b border-[#eae5e2]">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Consultation Reference</span>
                      <strong className="font-mono text-sm text-[#1f1c1b]">{req.requestNumber || req.id}</strong>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#570000]">
                      {req.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-400 block uppercase font-bold text-[10px]">Dimensions</span>
                      <strong>{req.width}"W x {req.depth}"D x {req.height}"H ({req.unit})</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block uppercase font-bold text-[10px]">Timber</span>
                      <strong>{req.materialPreference}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block uppercase font-bold text-[10px]">Finish</span>
                      <strong>{req.finishType}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block uppercase font-bold text-[10px]">Master Estimate</span>
                      <strong className="font-serif font-bold text-sm text-[#570000]">{formatPrice(req.estimatedQuote)}</strong>
                    </div>
                  </div>

                  {req.adminNotes && (
                    <div className="p-3 rounded-xl bg-[#fdcc87]/15 border border-[#fdcc87]/30 text-stone-800">
                      <p className="font-bold">Artisan Studio Notes:</p>
                      <p>{req.adminNotes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Saved Wishlist Mandirs</h3>
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#eae5e2] space-y-4">
              <Heart className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-lg font-serif font-bold text-[#1f1c1b]">Your Wishlist is Empty</h3>
              <p className="text-xs text-gray-500">Save mandirs to your wishlist while exploring our catalog.</p>
              <Link to="/mandirs" className="inline-block px-6 py-2.5 bg-[#570000] text-white text-xs font-bold rounded-xl">
                Explore Mandirs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-[#eae5e2] p-4 space-y-3">
                  <img
                    src={getProductImageUrl(p, 0)}
                    alt={p.title}
                    onError={handleImageError}
                    className="w-full h-40 object-cover rounded-2xl cursor-pointer"
                    onClick={() => navigate(`/product/${p.slug}`)}
                  />
                  <h4 className="font-serif font-bold text-sm text-[#1f1c1b] truncate">{p.title}</h4>
                  <p className="font-serif font-bold text-base text-[#570000]">{formatPrice(p.price)}</p>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => addToCart(p, 1)}
                      className="flex-1 py-2 rounded-xl bg-[#570000] text-white text-xs font-bold hover:bg-[#800000]"
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Delivery Address Book</h3>
            <button
              onClick={() => setIsAddingAddress(true)}
              className="px-4 py-2 rounded-xl bg-[#570000] text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-6 rounded-3xl bg-white border border-[#eae5e2] space-y-2 text-xs relative">
                <div className="flex justify-between items-center">
                  <strong className="text-sm font-serif font-bold text-[#1f1c1b]">{addr.fullName}</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">{addr.type}</span>
                </div>
                <p className="text-gray-600">{addr.streetAddress}</p>
                {addr.apartment && <p className="text-gray-500">{addr.apartment}</p>}
                <p className="text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-gray-400 font-mono">Mobile: {addr.phone}</p>

                <div className="pt-3 border-t border-[#eae5e2] flex items-center justify-between">
                  {addr.isDefault ? (
                    <span className="text-[11px] text-emerald-700 font-bold">✓ Default Delivery Address</span>
                  ) : (
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-[11px] text-[#7b581e] font-semibold hover:underline"
                    >
                      Set as Default
                    </button>
                  )}

                  <button
                    onClick={() => deleteAddress(addr.id)}
                    className="text-gray-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Address Modal */}
          {isAddingAddress && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <form onSubmit={handleAddAddressSubmit} className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center pb-2 border-b border-[#eae5e2]">
                  <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Add New Delivery Address</h3>
                  <button type="button" onClick={() => setIsAddingAddress(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Full Name"
                    value={newAddrName}
                    onChange={(e) => setNewAddrName(e.target.value)}
                    className="col-span-2 px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Mobile Phone"
                    value={newAddrPhone}
                    onChange={(e) => setNewAddrPhone(e.target.value)}
                    className="col-span-2 px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street Address / Flat No"
                    value={newAddrStreet}
                    onChange={(e) => setNewAddrStreet(e.target.value)}
                    className="col-span-2 px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Apartment / Landmark"
                    value={newAddrApartment}
                    onChange={(e) => setNewAddrApartment(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newAddrCity}
                    onChange={(e) => setNewAddrCity(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={newAddrState}
                    onChange={(e) => setNewAddrState(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    value={newAddrPincode}
                    onChange={(e) => setNewAddrPincode(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#eae5e2]">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#570000] text-white text-xs font-bold hover:bg-[#800000]"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="space-y-8 max-w-3xl">
          {/* Personal Info & Photo Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eae5e2] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#eae5e2] pb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Customer Profile Details</h3>
                <p className="text-xs text-gray-500">Update your avatar photo, display name, and contact phone number.</p>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#570000]/10 text-[#570000]">
                Account Settings
              </span>
            </div>

            {/* Profile Photo Section */}
            <div className="p-4 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profileName || 'User'}
                    onError={handleImageError}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#570000] shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-[#570000] border-2 border-[#fdcc87] flex items-center justify-center font-serif text-3xl font-bold text-[#fdcc87] shadow-md">
                    {profileName?.charAt(0) || user?.name?.charAt(0) || 'D'}
                  </div>
                )}
                <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-[#fdcc87]">
                  <Camera className="w-6 h-6" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <h4 className="font-bold text-xs text-[#1f1c1b]">Profile Photo</h4>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="px-4 py-2 rounded-xl bg-[#570000] text-[#fdcc87] text-xs font-bold hover:bg-[#7b0000] cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingAvatar ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        setAvatarUrl('');
                        await updateUserProfile({ avatarUrl: '' });
                        showToast('Profile photo removed.', 'info');
                      }}
                      className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 text-xs font-semibold transition-colors"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-400">Recommended: Square JPG or PNG. Max size 5MB.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="uppercase font-bold text-gray-600 block mb-1">
                    Full Name <span className="text-[#570000]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                    />
                  </div>
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-600 block mb-1">Mobile Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="uppercase font-bold text-gray-600 block mb-1">
                    Registered Account Email <span className="text-[#570000]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Order confirmations, invoices, and dispatch tracking will be sent to this email.</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Password Security Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#eae5e2] shadow-xs space-y-6">
            <div className="flex items-center gap-2 border-b border-[#eae5e2] pb-4">
              <div className="p-2 rounded-xl bg-[#570000]/10 text-[#570000]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#1f1c1b]">Account Password & Security</h4>
                <p className="text-xs text-gray-500">Update your account password regularly to keep your account secure.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="uppercase font-bold text-gray-600 block mb-1">
                  Current Password <span className="text-[#570000]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    placeholder="Enter your existing password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="uppercase font-bold text-gray-600 block mb-1">
                    New Password <span className="text-[#570000]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Min. 6 characters"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden focus:border-[#570000]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-600 block mb-1">
                    Confirm New Password <span className="text-[#570000]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border font-semibold focus:outline-hidden ${
                      confirmNewPass && confirmNewPass !== newPass
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-[#eae5e2] focus:border-[#570000]'
                    }`}
                  />
                  {confirmNewPass && confirmNewPass !== newPass && (
                    <span className="text-[10px] text-red-600 block mt-1">Passwords do not match</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={changingPass}
                  className="px-6 py-2.5 rounded-xl border border-[#570000] text-[#570000] hover:bg-[#570000]/5 text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{changingPass ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Order Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7b581e]">Tracking Mandir Dispatch</span>
                <h3 className="font-serif font-bold text-base text-[#1f1c1b]">{trackingOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setTrackingOrder(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tracking Steps */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-gray-800">Order Confirmed</strong>
                  <p className="text-gray-400">Timber allocation & seasoning verified.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-gray-800">Master Artisan Crafting</strong>
                  <p className="text-gray-400">Hand-carved jaali and Gopuram fitting.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className={`w-5 h-5 shrink-0 ${trackingOrder.deliveryStatus === 'DELIVERED' ? 'text-emerald-600' : 'text-amber-500'}`} />
                <div>
                  <strong className="text-gray-800">White-Glove Dispatch</strong>
                  <p className="text-gray-400">Delivery Status: {trackingOrder.deliveryStatus.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full py-2.5 rounded-xl bg-[#570000] text-white text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal with 1-page print and PDF download */}
      <InvoiceModal
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    </div>
  );
};
