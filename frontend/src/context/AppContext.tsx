import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  CartItem,
  CustomMandirRequest,
  Order,
  UserProfile,
  Address,
  ToastMessage
} from '../types';
import { BrandConfig, DEFAULT_BRAND_CONFIG } from '../config/branding';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../data/products';
import { DEFAULT_MANDIR_IMAGE } from '../utils/imageUtils';
import { api } from '../services/api';

interface AppliedCoupon {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
  discountAmount?: number;
}

export interface AppContextType {
  // Brand Configuration
  brandConfig: BrandConfig;
  setBrandConfig: (config: BrandConfig | ((prev: BrandConfig) => BrandConfig)) => void;
  updateBrandConfig: (config: Partial<BrandConfig>) => void;
  resetBrandConfig: () => void;

  // Authentication & Profile
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { name: string; email: string; password: string; phone?: string; preferredDeity?: string }) => Promise<{ success: boolean; message: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;

  // Products & Categories
  products: Product[];
  categories: Category[];
  isLoadingProducts: boolean;
  refreshProducts: (params?: Record<string, any>) => Promise<void>;
  refreshCategories: () => Promise<void>;
  createCategory: (data: any) => Promise<Category>;
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: string) => Product | undefined;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  appliedCoupon: AppliedCoupon | null;
  addToCart: (product: Product, quantity?: number, finish?: string, customNotes?: string) => Promise<void>;
  updateCartQuantity: (itemIdOrProductId: string, quantity: number, finish?: string) => Promise<void>;
  removeFromCart: (itemIdOrProductId: string, finish?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  // Orders
  orders: Order[];
  refreshOrders: (overrideToken?: string) => Promise<void>;
  placeOrder: (shippingAddress: Address, paymentMethod: any, notes?: string, customerDetails?: { email?: string; name?: string; phone?: string }) => Promise<Order>;

  // Custom Mandir
  customRequests: CustomMandirRequest[];
  refreshCustomRequests: (overrideToken?: string) => Promise<void>;
  submitCustomRequest: (data: any) => Promise<CustomMandirRequest>;

  // Addresses
  addresses: Address[];
  refreshAddresses: (overrideToken?: string) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;

  // UI helpers
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  formatPrice: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('akshar_auth_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('akshar_user_profile');
    return saved ? JSON.parse(saved) : null;
  });

  // Data states
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomMandirRequest[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    const saved = localStorage.getItem('akshar_brand_config');
    if (!saved) return DEFAULT_BRAND_CONFIG;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_BRAND_CONFIG,
        ...parsed,
        logoUrl: parsed.logoUrl && parsed.logoUrl.trim() !== '' ? parsed.logoUrl : DEFAULT_BRAND_CONFIG.logoUrl,
      };
    } catch {
      return DEFAULT_BRAND_CONFIG;
    }
  });

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const formatPrice = useCallback((amount: number): string => {
    return `₹${Math.round(amount || 0).toLocaleString('en-IN')}`;
  }, []);

  // Fetch Categories
  const refreshCategories = useCallback(async () => {
    try {
      const res = await api.categories.getAll();
      if (res.success && res.data.categories) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.warn('Could not fetch categories from server, retrying...', err);
    }
  }, []);

  // Create Category
  const createCategory = useCallback(async (data: Partial<Category>): Promise<Category> => {
    try {
      const res = await api.categories.create(data);
      if (res.success && res.data.category) {
        const newCat = res.data.category;
        setCategories(prev => [...prev, newCat]);
        return newCat;
      }
      throw new Error(res.message || 'Failed to create category.');
    } catch (err: any) {
      // Fallback for offline/mock mode
      const fallbackCat: Category = {
        id: `cat-${Date.now()}`,
        name: data.name || 'New Category',
        slug: data.slug || (data.name ? data.name.toLowerCase().trim().replace(/\s+/g, '-') : `category-${Date.now()}`),
        description: data.description || null,
        image: data.image || DEFAULT_MANDIR_IMAGE,
        badge: data.badge || null,
        orderIndex: categories.length + 1,
        isActive: true,
      };
      setCategories(prev => [...prev, fallbackCat]);
      return fallbackCat;
    }
  }, [categories.length]);

  // Fetch Products
  const refreshProducts = useCallback(async (params?: Record<string, any>) => {
    try {
      setIsLoadingProducts(true);
      const res = await api.products.getAll(params);
      if (res.success && res.data.products) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.warn('Could not fetch products from server:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // Fetch Cart
  const refreshCart = useCallback(async () => {
    try {
      const res = await api.cart.get();
      if (res.success && res.data.items) {
        setCart(res.data.items);
      }
    } catch (err) {
      console.warn('Error fetching cart:', err);
    }
  }, []);

  // Fetch Wishlist
  const refreshWishlist = useCallback(async () => {
    try {
      const res = await api.wishlist.get();
      if (res.success && res.data.productIds) {
        setWishlist(res.data.productIds);
      }
    } catch (err) {
      console.warn('Error fetching wishlist:', err);
    }
  }, []);

  // Fetch Orders
  const refreshOrders = useCallback(async (overrideToken?: string) => {
    const activeToken = overrideToken || token || localStorage.getItem('akshar_auth_token');
    if (!activeToken) return;
    try {
      const res = await api.orders.getMyOrders();
      if (res.success && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.warn('Error fetching user orders:', err);
    }
  }, [token]);

  // Fetch Custom Requests
  const refreshCustomRequests = useCallback(async (overrideToken?: string) => {
    const activeToken = overrideToken || token || localStorage.getItem('akshar_auth_token');
    if (!activeToken) return;
    try {
      const res = await api.customOrders.getMyRequests();
      if (res.success && res.data.customOrders) {
        setCustomRequests(res.data.customOrders);
      }
    } catch (err) {
      console.warn('Error fetching custom requests:', err);
    }
  }, [token]);

  // Fetch Addresses
  const refreshAddresses = useCallback(async (overrideToken?: string) => {
    const activeToken = overrideToken || token || localStorage.getItem('akshar_auth_token');
    if (!activeToken) return;
    try {
      const res = await api.addresses.getAll();
      if (res.success && res.data.addresses) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.warn('Error fetching addresses:', err);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    refreshCategories();
    refreshProducts();
    refreshCart();
    refreshWishlist();
  }, [refreshCategories, refreshProducts, refreshCart, refreshWishlist]);

  // When token changes, load user-specific data
  useEffect(() => {
    if (token) {
      api.auth.getMe()
        .then(res => {
          if (res.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('akshar_user_profile', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Token invalid, clear session
          localStorage.removeItem('akshar_auth_token');
          localStorage.removeItem('akshar_user_profile');
          setToken(null);
          setUser(null);
        });

      refreshCart();
      refreshWishlist();
      refreshOrders();
      refreshCustomRequests();
      refreshAddresses();
    } else {
      setOrders([]);
      setCustomRequests([]);
      setAddresses([]);
    }
  }, [token, refreshOrders, refreshCustomRequests, refreshAddresses, refreshCart, refreshWishlist]);

  // Auth operations
  const login = async (email: string, pass: string) => {
    try {
      const res = await api.auth.login({ email, password: pass });
      if (res.success && res.data.token) {
        localStorage.setItem('akshar_auth_token', res.data.token);
        localStorage.setItem('akshar_user_profile', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        showToast(res.message || 'Logged in successfully!', 'success');

        // Immediately refresh all user-specific state with newly obtained token
        await Promise.allSettled([
          refreshCart(),
          refreshWishlist(),
          refreshOrders(res.data.token),
          refreshAddresses(res.data.token),
          refreshCustomRequests(res.data.token),
        ]);

        return { success: true, message: res.message };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err: any) {
      showToast(err.message || 'Login failed', 'error');
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; preferredDeity?: string }) => {
    try {
      const res = await api.auth.register(data);
      if (res.success && res.data.token) {
        localStorage.setItem('akshar_auth_token', res.data.token);
        localStorage.setItem('akshar_user_profile', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        showToast(res.message || 'Registration successful! Welcome.', 'success');

        // Immediately refresh all user-specific state with newly obtained token
        await Promise.allSettled([
          refreshCart(),
          refreshWishlist(),
          refreshOrders(res.data.token),
          refreshAddresses(res.data.token),
          refreshCustomRequests(res.data.token),
        ]);

        return { success: true, message: res.message };
      }
      return { success: false, message: 'Registration failed' };
    } catch (err: any) {
      showToast(err.message || 'Registration error', 'error');
      return { success: false, message: err.message || 'Registration error' };
    }
  };

  const adminLogin = async (email: string, pass: string) => {
    try {
      const res = await api.auth.adminLogin({ email, password: pass });
      if (res.success && res.data.token) {
        localStorage.setItem('akshar_auth_token', res.data.token);
        localStorage.setItem('akshar_user_profile', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        showToast('Admin authorized successfully.', 'success');

        await Promise.allSettled([
          refreshCart(),
          refreshWishlist(),
          refreshOrders(res.data.token),
          refreshAddresses(res.data.token),
          refreshCustomRequests(res.data.token),
        ]);

        return { success: true, message: res.message };
      }
      return { success: false, message: 'Admin authentication failed' };
    } catch (err: any) {
      showToast(err.message || 'Admin authentication failed', 'error');
      return { success: false, message: err.message || 'Admin authentication failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('akshar_auth_token');
    localStorage.removeItem('akshar_user_profile');
    setToken(null);
    setUser(null);
    setOrders([]);
    setCustomRequests([]);
    setAddresses([]);
    refreshCart();
    refreshWishlist();
    showToast('You have been logged out.', 'info');
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    try {
      const res = await api.auth.updateProfile(updates);
      if (res.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('akshar_user_profile', JSON.stringify(res.data.user));
        showToast('Profile updated successfully.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  };

  const changePassword = async (currentPass: string, newPass: string) => {
    try {
      const res = await api.auth.changePassword({ currentPassword: currentPass, newPassword: newPass });
      showToast(res.message || 'Password changed successfully.', 'success');
      return { success: true, message: res.message };
    } catch (err: any) {
      showToast(err.message || 'Error changing password', 'error');
      return { success: false, message: err.message || 'Error changing password' };
    }
  };

  // Cart operations
  const addToCart = async (product: Product, quantity = 1, finish?: string, customNotes?: string) => {
    const selectedFinish = finish || product.colorFinish || product.finish || 'Natural Teak Polish';

    // Resolve database ID if product was seeded with mock id
    let targetProductId = product.id;
    if (targetProductId.startsWith('prod-')) {
      const matched = products.find(p => (p.slug === product.slug || p.title === product.title) && !p.id.startsWith('prod-'));
      if (matched) {
        targetProductId = matched.id;
      }
    }

    try {
      const res = await api.cart.add(targetProductId, quantity, selectedFinish, customNotes);
      showToast(res.message || `Added ${product.title} to cart.`, 'success');
      await refreshCart();
    } catch (err: any) {
      // Graceful local fallback
      setCart(prev => {
        const existingIndex = prev.findIndex(
          item => (item.productId === product.id || item.product?.id === product.id) && item.selectedFinish === selectedFinish
        );
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `local-item-${Date.now()}`,
              cartId: 'local-cart',
              productId: product.id,
              quantity,
              selectedFinish,
              customNotes,
              product,
            } as any
          ];
        }
      });
      showToast(`Added ${product.title} to cart.`, 'success');
    }
  };

  const updateCartQuantity = async (itemIdOrProductId: string, quantity: number, finish?: string) => {
    const item = cart.find(i => i.id === itemIdOrProductId || (i.productId === itemIdOrProductId && (!finish || i.selectedFinish === finish)));
    if (quantity <= 0) {
      if (item) await removeFromCart(item.id || item.productId, finish);
      return;
    }

    try {
      if (item && item.id && !item.id.startsWith('local-item-')) {
        await api.cart.update(item.id, quantity);
        await refreshCart();
      } else {
        setCart(prev => prev.map(i => (i === item ? { ...i, quantity } : i)));
      }
    } catch (err: any) {
      setCart(prev => prev.map(i => (i === item ? { ...i, quantity } : i)));
    }
  };

  const removeFromCart = async (itemIdOrProductId: string, finish?: string) => {
    const item = cart.find(i => i.id === itemIdOrProductId || (i.productId === itemIdOrProductId && (!finish || i.selectedFinish === finish)));
    try {
      if (item && item.id && !item.id.startsWith('local-item-')) {
        await api.cart.remove(item.id);
        await refreshCart();
      } else {
        setCart(prev => prev.filter(i => i !== item));
      }
      showToast('Item removed from cart.', 'info');
    } catch (err: any) {
      setCart(prev => prev.filter(i => i !== item));
      showToast('Item removed from cart.', 'info');
    }
  };

  const clearCart = async () => {
    try {
      await api.cart.clear();
    } catch (err: any) {
      console.warn('Could not clear cart on server:', err);
    } finally {
      setCart([]);
      setAppliedCoupon(null);
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await api.coupons.validate(code, cartSubtotal);
      if (res.success && res.data) {
        setAppliedCoupon({
          code: res.data.code,
          discountPercent: res.data.discountType === 'PERCENTAGE' ? res.data.discountValue : undefined,
          discountFixed: res.data.discountType === 'FIXED' ? res.data.discountValue : undefined,
          discountAmount: res.data.discountAmount,
        });
        showToast(res.message, 'success');
        return { success: true, message: res.message };
      }
      return { success: false, message: 'Invalid coupon' };
    } catch (err: any) {
      showToast(err.message || 'Coupon could not be applied.', 'error');
      return { success: false, message: err.message || 'Coupon could not be applied.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);
  const cartDiscount = appliedCoupon
    ? (appliedCoupon.discountAmount !== undefined
        ? appliedCoupon.discountAmount
        : (appliedCoupon.discountPercent ? Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100) : (appliedCoupon.discountFixed || 0)))
    : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist
  const toggleWishlist = async (productId: string) => {
    let targetProductId = productId;
    if (targetProductId.startsWith('prod-')) {
      const matched = products.find(p => (p.slug === productId || p.title === productId) && !p.id.startsWith('prod-'));
      if (matched) {
        targetProductId = matched.id;
      }
    }

    try {
      const res = await api.wishlist.toggle(targetProductId);
      showToast(res.message, 'info');
      await refreshWishlist();
    } catch (err: any) {
      // Local fallback
      setWishlist(prev =>
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      );
      showToast(wishlist.includes(productId) ? 'Removed from wishlist.' : 'Saved to wishlist.', 'info');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  // Orders
  const placeOrder = async (
    shippingAddress: Address, 
    paymentMethod: any, 
    notes?: string,
    customerDetails?: { email?: string; name?: string; phone?: string }
  ): Promise<Order> => {
    const orderItems = cart.map(i => ({
      productId: i.productId,
      title: i.product.title,
      sku: i.product.sku,
      image: i.product.images[0] || '',
      finish: i.selectedFinish,
      price: i.product.price,
      quantity: i.quantity,
    }));

    const res = await api.orders.create({
      customerName: customerDetails?.name || shippingAddress.fullName || user?.name || 'Valued Customer',
      customerEmail: customerDetails?.email || user?.email || (shippingAddress as any).email || 'customer@aksharmandir.com',
      customerPhone: customerDetails?.phone || shippingAddress.phone || user?.phone || '+91 98765 43210',
      shippingAddress,
      items: orderItems,
      couponCode: appliedCoupon?.code || null,
      paymentMethod: String(paymentMethod),
      notes: notes || null,
    });

    if (!res.success || !res.data.order) {
      throw new Error(res.message || 'Order creation failed.');
    }

    // Refresh cart & orders
    await refreshCart();
    setAppliedCoupon(null);
    await refreshOrders();
    showToast('Order Placed Successfully!', 'success');

    return res.data.order;
  };

  // Custom Mandir
  const submitCustomRequest = async (data: any): Promise<CustomMandirRequest> => {
    const res = await api.customOrders.submit(data);
    if (!res.success || !res.data.customOrder) {
      throw new Error(res.message || 'Could not submit custom mandir request.');
    }
    showToast('Custom Mandir Request Submitted!', 'success');
    await refreshCustomRequests();
    return res.data.customOrder;
  };

  // Address operations
  const addAddress = async (address: Omit<Address, 'id'>) => {
    try {
      const res = await api.addresses.create(address);
      showToast(res.message || 'Address added.', 'success');
      await refreshAddresses();
    } catch (err: any) {
      showToast(err.message || 'Failed to add address.', 'error');
    }
  };

  const updateAddress = async (id: string, address: Partial<Address>) => {
    try {
      const res = await api.addresses.update(id, address);
      showToast(res.message || 'Address updated.', 'success');
      await refreshAddresses();
    } catch (err: any) {
      showToast(err.message || 'Failed to update address.', 'error');
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const res = await api.addresses.delete(id);
      showToast(res.message || 'Address deleted.', 'info');
      await refreshAddresses();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete address.', 'error');
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const res = await api.addresses.setDefault(id);
      showToast(res.message || 'Default address updated.', 'success');
      await refreshAddresses();
    } catch (err: any) {
      showToast(err.message || 'Failed to set default address.', 'error');
    }
  };

  // Brand config
  const updateBrandConfig = (updates: Partial<BrandConfig>) => {
    const updated = { ...brandConfig, ...updates };
    setBrandConfig(updated);
    localStorage.setItem('akshar_brand_config', JSON.stringify(updated));
    showToast('Brand settings updated.', 'success');
  };

  const resetBrandConfig = () => {
    setBrandConfig(DEFAULT_BRAND_CONFIG);
    localStorage.removeItem('akshar_brand_config');
    showToast('Brand settings reset to defaults.', 'info');
  };

  // Product helpers
  const getProductBySlug = useCallback((slug: string) => {
    return products.find(p => p.slug === slug || p.id === slug);
  }, [products]);

  const getProductById = useCallback((id: string) => {
    return products.find(p => p.id === id);
  }, [products]);

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: !!user && user.role === 'ADMIN',
        login,
        register,
        adminLogin,
        logout,
        updateUserProfile,
        changePassword,
        categories,
        refreshCategories,
        createCategory,
        isAddCategoryModalOpen,
        setIsAddCategoryModalOpen,
        products,
        refreshProducts,
        isLoadingProducts,
        getProductBySlug,
        getProductById,
        cart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        appliedCoupon,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        refreshOrders,
        placeOrder,
        customRequests,
        refreshCustomRequests,
        submitCustomRequest,
        addresses,
        refreshAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        brandConfig,
        setBrandConfig,
        updateBrandConfig,
        resetBrandConfig,
        toasts,
        showToast,
        removeToast,
        quickViewProduct,
        setQuickViewProduct,
        formatPrice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
