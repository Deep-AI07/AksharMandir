import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, CustomMandirRequest, Order, UserProfile, Address, FinishType, OrderStatus, ToastMessage } from '../types';
import { INITIAL_PRODUCTS, INITIAL_USER, INITIAL_ORDERS, INITIAL_CUSTOM_REQUESTS } from '../data/products';
import { BrandConfig, DEFAULT_BRAND_CONFIG } from '../config/branding';

interface AppliedCoupon {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  customRequests: CustomMandirRequest[];
  user: UserProfile;
  brandConfig: BrandConfig;
  updateBrandConfig: (updates: Partial<BrandConfig>) => void;
  resetBrandConfig: () => void;
  currentPage: string;
  selectedProductId: string | null;
  selectedCategory: string | null;
  searchQuery: string;
  appliedCoupon: AppliedCoupon | null;
  toasts: ToastMessage[];
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  navigateTo: (page: string, params?: { productId?: string; category?: string; searchQuery?: string }) => void;
  addToCart: (product: Product, quantity?: number, finish?: FinishType, customNotes?: string) => void;
  updateCartQuantity: (productId: string, finish: FinishType, quantity: number) => void;
  removeFromCart: (productId: string, finish: FinishType) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  placeOrder: (shippingAddress: Address, paymentMethod: 'UPI / QR' | 'Credit/Debit Card' | 'NetBanking' | 'Cash on Delivery') => Order;
  submitCustomRequest: (data: Omit<CustomMandirRequest, 'id' | 'createdAt' | 'status'>) => CustomMandirRequest;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  adminAddProduct: (product: Omit<Product, 'id'>) => void;
  adminUpdateProduct: (id: string, updates: Partial<Product>) => void;
  adminDeleteProduct: (id: string) => void;
  adminUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  adminUpdateCustomRequestStatus: (requestId: string, status: CustomMandirRequest['status']) => void;
  formatPrice: (amount: number) => string;
  cartSubtotal: number;
  cartDiscount: number;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage state initialization with fallbacks
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('akshar_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('akshar_cart');
    return saved ? JSON.parse(saved) : [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 1,
        selectedFinish: 'Natural Teak Polish'
      }
    ];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('akshar_wishlist');
    return saved ? JSON.parse(saved) : ['prod-2', 'prod-5'];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('akshar_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customRequests, setCustomRequests] = useState<CustomMandirRequest[]>(() => {
    const saved = localStorage.getItem('akshar_custom_requests');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_REQUESTS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('akshar_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [brandConfig, setBrandConfig] = useState<BrandConfig>(() => {
    const saved = localStorage.getItem('akshar_brand_config');
    return saved ? { ...DEFAULT_BRAND_CONFIG, ...JSON.parse(saved) } : DEFAULT_BRAND_CONFIG;
  });

  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>('prod-1');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>({ code: 'DIVINE10', discountPercent: 10 });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('akshar_brand_config', JSON.stringify(brandConfig));
  }, [brandConfig]);

  const updateBrandConfig = (updates: Partial<BrandConfig>) => {
    setBrandConfig(prev => ({ ...prev, ...updates }));
    showToast('Brand settings & logo updated successfully!', 'success');
  };

  const resetBrandConfig = () => {
    setBrandConfig(DEFAULT_BRAND_CONFIG);
    localStorage.removeItem('akshar_brand_config');
    showToast('Brand settings reset to original defaults.', 'info');
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('akshar_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('akshar_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('akshar_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('akshar_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('akshar_custom_requests', JSON.stringify(customRequests));
  }, [customRequests]);

  useEffect(() => {
    localStorage.setItem('akshar_user', JSON.stringify(user));
  }, [user]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigateTo = (page: string, params?: { productId?: string; category?: string; searchQuery?: string }) => {
    if (params?.productId) {
      setSelectedProductId(params.productId);
    }
    if (params?.category !== undefined) {
      setSelectedCategory(params.category || null);
    }
    if (params?.searchQuery !== undefined) {
      setSearchQuery(params.searchQuery);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product, quantity = 1, finish?: FinishType, customNotes?: string) => {
    const chosenFinish = finish || product.finish;
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id && item.selectedFinish === chosenFinish);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, selectedFinish: chosenFinish, customNotes }];
      }
    });
    showToast(`Added "${product.title}" (${chosenFinish}) to your cart.`, 'success');
  };

  const updateCartQuantity = (productId: string, finish: FinishType, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, finish);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId && item.selectedFinish === finish
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, finish: FinishType) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedFinish === finish)));
    showToast('Item removed from cart.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    const isSaved = wishlist.includes(productId);
    if (isSaved) {
      setWishlist(prev => prev.filter(id => id !== productId));
      showToast('Removed from your sacred wishlist.', 'info');
    } else {
      setWishlist(prev => [...prev, productId]);
      showToast('Saved to your sacred wishlist.', 'success');
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (normalized === 'DIVINE10') {
      setAppliedCoupon({ code: 'DIVINE10', discountPercent: 10 });
      showToast('Coupon "DIVINE10" applied: 10% discount added!', 'success');
      return { success: true, message: '10% discount applied.' };
    } else if (normalized === 'VASTU500') {
      setAppliedCoupon({ code: 'VASTU500', discountFixed: 500 });
      showToast('Coupon "VASTU500" applied: ₹500 off your sanctum!', 'success');
      return { success: true, message: '₹500 discount applied.' };
    } else if (normalized === 'FESTIVE15') {
      setAppliedCoupon({ code: 'FESTIVE15', discountPercent: 15 });
      showToast('Festive Blessing! 15% discount applied.', 'success');
      return { success: true, message: '15% discount applied.' };
    } else {
      showToast('Invalid promo code. Try "DIVINE10" or "FESTIVE15"', 'error');
      return { success: false, message: 'Invalid promo code' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Promo code removed.', 'info');
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountFixed) {
      cartDiscount = Math.min(cartSubtotal, appliedCoupon.discountFixed);
    }
  }

  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const placeOrder = (shippingAddress: Address, paymentMethod: 'UPI / QR' | 'Credit/Debit Card' | 'NetBanking' | 'Cash on Delivery'): Order => {
    const orderNumber = `AKM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString().split('T')[0],
      items: cart.map(item => ({
        productId: item.product.id,
        title: item.product.title,
        image: item.product.images[0],
        finish: item.selectedFinish,
        price: item.product.price,
        quantity: item.quantity
      })),
      shippingAddress,
      paymentMethod,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      couponCode: appliedCoupon?.code,
      shipping: 0,
      tax: 0,
      total: cartTotal,
      status: 'Processing',
      trackingNumber: `EXP-IND-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showToast(`Sanctum Order #${orderNumber} placed successfully!`, 'success');
    return newOrder;
  };

  const submitCustomRequest = (data: Omit<CustomMandirRequest, 'id' | 'createdAt' | 'status'>): CustomMandirRequest => {
    const newRequest: CustomMandirRequest = {
      ...data,
      id: `req-${Date.now().toString().slice(-4)}`,
      status: 'Pending Review',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setCustomRequests(prev => [newRequest, ...prev]);
    showToast('Bespoke custom mandir request submitted! Our master artisan will contact you within 24 hours.', 'success');
    return newRequest;
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
    showToast('Profile information updated successfully.', 'success');
  };

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`
    };
    if (newAddress.isDefault) {
      setUser(prev => ({
        ...prev,
        addresses: prev.addresses.map(a => ({ ...a, isDefault: false })).concat(newAddress)
      }));
    } else {
      setUser(prev => ({
        ...prev,
        addresses: [...prev.addresses, newAddress]
      }));
    }
    showToast('New delivery address saved.', 'success');
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    setUser(prev => {
      let updatedAddresses = prev.addresses.map(a => a.id === id ? { ...a, ...updates } : a);
      if (updates.isDefault) {
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: a.id === id }));
      }
      return { ...prev, addresses: updatedAddresses };
    });
    showToast('Address updated.', 'success');
  };

  const deleteAddress = (id: string) => {
    setUser(prev => ({
      ...prev,
      addresses: prev.addresses.filter(a => a.id !== id)
    }));
    showToast('Address removed.', 'info');
  };

  const setDefaultAddress = (id: string) => {
    setUser(prev => ({
      ...prev,
      addresses: prev.addresses.map(a => ({ ...a, isDefault: a.id === id }))
    }));
    showToast('Default address updated.', 'success');
  };

  // Admin Actions
  const adminAddProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
    showToast(`Added product "${newProduct.title}" to catalog.`, 'success');
  };

  const adminUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast('Product updated successfully in live store.', 'success');
  };

  const adminDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product removed from catalog.', 'info');
  };

  const adminUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showToast(`Order status updated to "${status}".`, 'success');
  };

  const adminUpdateCustomRequestStatus = (requestId: string, status: CustomMandirRequest['status']) => {
    setCustomRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    showToast(`Custom Mandir request status updated to "${status}".`, 'success');
  };

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        customRequests,
        user,
        brandConfig,
        updateBrandConfig,
        resetBrandConfig,
        currentPage,
        selectedProductId,
        selectedCategory,
        searchQuery,
        appliedCoupon,
        toasts,
        quickViewProduct,
        setQuickViewProduct,
        navigateTo,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        placeOrder,
        submitCustomRequest,
        showToast,
        removeToast,
        updateUserProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        adminAddProduct,
        adminUpdateProduct,
        adminDeleteProduct,
        adminUpdateOrderStatus,
        adminUpdateCustomRequestStatus,
        formatPrice,
        cartSubtotal,
        cartDiscount,
        cartTotal,
        cartCount
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
