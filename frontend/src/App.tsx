import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { ToastContainer } from './components/common/Toast';

// Customer Pages
import { HomePage } from './pages/Home/HomePage';
import { CatalogPage } from './pages/Products/CatalogPage';
import { ProductDetailPage } from './pages/ProductDetails/ProductDetailPage';
import { CustomMandirPage } from './pages/CustomMandir/CustomMandirPage';
import { CartPage } from './pages/Cart/CartPage';
import { CheckoutPage } from './pages/Checkout/CheckoutPage';
import { AccountPage } from './pages/Account/AccountPage';
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/Dashboard/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/Products/AdminProductsPage';
import { AdminCategoriesPage } from './pages/admin/Categories/AdminCategoriesPage';
import { AdminOrdersPage } from './pages/admin/Orders/AdminOrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminCustomOrdersPage } from './pages/admin/CustomOrders/AdminCustomOrdersPage';
import { AdminCustomersPage } from './pages/admin/Customers/AdminCustomersPage';
import { AdminPaymentsPage } from './pages/admin/Payments/AdminPaymentsPage';
import { AdminReportsPage } from './pages/admin/Reports/AdminReportsPage';
import { AdminCouponsPage } from './pages/admin/Coupons/AdminCouponsPage';
import { AdminReviewsPage } from './pages/admin/Reviews/AdminReviewsPage';
import { AdminContentPage } from './pages/admin/Content/AdminContentPage';
import { AdminSettingsPage } from './pages/admin/Settings/AdminSettingsPage';

// Scroll to top helper on route transition
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Customer Layout Wrapper
const StorefrontLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f8] text-[#1f1c1b] font-sans selection:bg-[#fdcc87] selection:text-[#3e0000]">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <QuickViewModal />
      <FloatingWhatsApp />
    </div>
  );
};

// Admin Protected Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isAuthenticated } = useApp();
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Customer Storefront Routes */}
        <Route path="/" element={<StorefrontLayout><HomePage /></StorefrontLayout>} />
        <Route path="/mandirs" element={<StorefrontLayout><CatalogPage /></StorefrontLayout>} />
        <Route path="/mandirs/:categorySlug" element={<StorefrontLayout><CatalogPage /></StorefrontLayout>} />
        <Route path="/product/:slug" element={<StorefrontLayout><ProductDetailPage /></StorefrontLayout>} />
        <Route path="/custom-mandir" element={<StorefrontLayout><CustomMandirPage /></StorefrontLayout>} />
        <Route path="/cart" element={<StorefrontLayout><CartPage /></StorefrontLayout>} />
        <Route path="/checkout" element={<StorefrontLayout><CheckoutPage /></StorefrontLayout>} />
        <Route path="/account" element={<StorefrontLayout><AccountPage /></StorefrontLayout>} />
        <Route path="/account/orders" element={<StorefrontLayout><AccountPage /></StorefrontLayout>} />
        <Route path="/account/orders/:id" element={<StorefrontLayout><AccountPage /></StorefrontLayout>} />
        <Route path="/login" element={<StorefrontLayout><LoginPage /></StorefrontLayout>} />
        <Route path="/register" element={<StorefrontLayout><RegisterPage /></StorefrontLayout>} />
        <Route path="/about" element={<StorefrontLayout><AboutPage /></StorefrontLayout>} />
        <Route path="/contact" element={<StorefrontLayout><ContactPage /></StorefrontLayout>} />

        {/* Admin Authentication */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Portal (Protected) */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="orders/:id" element={<AdminOrderDetailPage />} />
          <Route path="custom-orders" element={<AdminCustomOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
