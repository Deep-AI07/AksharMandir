// Akshar Mandir Centralized API Service Client

const getApiBaseUrl = (): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  // In production browser environments, use relative '/api' if no custom URL specified
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Retrieve or generate guest session token for anonymous cart/wishlist
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('akshar_guest_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('akshar_guest_session_id', sessionId);
  }
  return sessionId;
};

// Generic fetch wrapper with JWT and guest session headers
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('akshar_auth_token');
  const sessionId = getSessionId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Server communication failed.' }));

  if (!response.ok) {
    throw new Error(data.message || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    adminLogin: (body: any) => request<any>('/auth/admin-login', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => request<any>('/auth/me'),
    updateProfile: (body: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
    changePassword: (body: any) => request<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  },

  // Categories
  categories: {
    getAll: (includeInactive = false) => request<any>(`/categories?includeInactive=${includeInactive}`),
    getBySlug: (slug: string) => request<any>(`/categories/${slug}`),
    create: (body: any) => request<any>('/categories', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string, targetCategoryId?: string) =>
      request<any>(`/categories/${id}`, { method: 'DELETE', body: JSON.stringify({ targetCategoryId }) }),
    reorder: (orderedIds: string[]) =>
      request<any>('/categories/reorder', { method: 'POST', body: JSON.stringify({ orderedIds }) }),
  },

  // Products
  products: {
    getAll: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
      return request<any>(`/products?${query.toString()}`);
    },
    getBySlug: (slug: string) => request<any>(`/products/${slug}`),
    create: (body: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    updateStock: (id: string, stockQuantity: number) =>
      request<any>(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ stockQuantity }) }),
    delete: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  },

  // Cart
  cart: {
    get: () => request<any>('/cart'),
    add: (productId: string, quantity = 1, finish?: string, customNotes?: string) =>
      request<any>('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity, finish, customNotes }) }),
    update: (itemId: string, quantity: number) =>
      request<any>('/cart/update', { method: 'PUT', body: JSON.stringify({ itemId, quantity }) }),
    remove: (itemId: string) => request<any>(`/cart/item/${itemId}`, { method: 'DELETE' }),
    clear: () => request<any>('/cart/clear', { method: 'POST' }),
  },

  // Wishlist
  wishlist: {
    get: () => request<any>('/wishlist'),
    toggle: (productId: string) => request<any>('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),
  },

  // Addresses
  addresses: {
    getAll: () => request<any>('/addresses'),
    create: (body: any) => request<any>('/addresses', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/addresses/${id}`, { method: 'DELETE' }),
    setDefault: (id: string) => request<any>(`/addresses/${id}/default`, { method: 'PATCH' }),
  },

  // Coupons
  coupons: {
    validate: (code: string, subtotal: number) =>
      request<any>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
    getAll: () => request<any>('/coupons'),
    create: (body: any) => request<any>('/coupons', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/coupons/${id}`, { method: 'DELETE' }),
  },

  // Orders
  orders: {
    create: (body: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(body) }),
    getMyOrders: () => request<any>('/orders/my-orders'),
    getById: (id: string) => request<any>(`/orders/${id}`),
    getAdminOrders: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
      return request<any>(`/orders/admin/all?${query.toString()}`);
    },
    updateStatus: (id: string, body: any) =>
      request<any>(`/orders/admin/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

  // Payments
  payments: {
    initiate: (body: any) => request<any>('/payments/initiate', { method: 'POST', body: JSON.stringify(body) }),
    getAdminPayments: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
      return request<any>(`/payments/admin/all?${query.toString()}`);
    },
  },

  // Custom Orders
  customOrders: {
    submit: (body: any) => request<any>('/custom-orders', { method: 'POST', body: JSON.stringify(body) }),
    getMyRequests: () => request<any>('/custom-orders/my-requests'),
    getAdminRequests: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
      return request<any>(`/custom-orders/admin/all?${query.toString()}`);
    },
    updateQuote: (id: string, body: any) =>
      request<any>(`/custom-orders/admin/${id}/quote`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

  // Reviews
  reviews: {
    submit: (body: any) => request<any>('/reviews', { method: 'POST', body: JSON.stringify(body) }),
    getAdminReviews: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
      return request<any>(`/reviews/admin/all?${query.toString()}`);
    },
    updateApproval: (id: string, isApproved: boolean) =>
      request<any>(`/reviews/admin/${id}/approval`, { method: 'PATCH', body: JSON.stringify({ isApproved }) }),
    delete: (id: string) => request<any>(`/reviews/admin/${id}`, { method: 'DELETE' }),
  },

  // Content & Settings
  content: {
    getPublic: () => request<any>('/content/public'),
    getAdminContent: () => request<any>('/content/admin'),
    upsertContent: (key: string, value: string, description?: string) =>
      request<any>('/content/admin/upsert', { method: 'POST', body: JSON.stringify({ key, value, description }) }),
    getAdminSettings: () => request<any>('/content/settings'),
    updateSetting: (key: string, value: string, group?: string) =>
      request<any>('/content/settings', { method: 'POST', body: JSON.stringify({ key, value, group }) }),
  },

  // Admin Analytics & Customers
  admin: {
    getDashboard: () => request<any>('/admin/dashboard'),
    getReports: (period = 'monthly') => request<any>(`/admin/reports?period=${period}`),
    getCustomers: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') query.append(key, String(val));
      });
      return request<any>(`/admin/customers?${query.toString()}`);
    },
    createCustomer: (data: { name: string; email: string; password?: string; phone?: string; role?: string }) =>
      request<any>('/admin/customers', { method: 'POST', body: JSON.stringify(data) }),
    updateCustomer: (id: string, data: { name?: string; email?: string; password?: string; phone?: string; role?: string }) =>
      request<any>(`/admin/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCustomer: (id: string) =>
      request<any>(`/admin/customers/${id}`, { method: 'DELETE' }),
  },

  // Image Upload
  upload: {
    uploadImage: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('akshar_auth_token');
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Image upload failed');
      return data.data.url;
    }
  }
};
