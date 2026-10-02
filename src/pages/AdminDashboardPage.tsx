import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from '../components/BrandLogo';
import { LogoCustomizerModal } from '../components/LogoCustomizerModal';
import { OrderStatus } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  CheckCircle2, 
  Plus, 
  SlidersHorizontal, 
  Package, 
  Sparkles,
  ChevronDown,
  Palette
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { 
    orders, 
    products, 
    customRequests, 
    brandConfig,
    adminUpdateOrderStatus, 
    adminUpdateCustomRequestStatus, 
    formatPrice, 
    navigateTo 
  } = useApp();

  const [logoModalOpen, setLogoModalOpen] = useState(false);

  const totalSales = orders.reduce((sum, ord) => sum + ord.total, 0) + 1750000;
  const pendingOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const lowStockCount = products.filter(p => p.stock < 5).length;

  const monthlySales = [
    { month: 'Mar', sales: 120000 },
    { month: 'Apr', sales: 185000 },
    { month: 'May', sales: 240000 },
    { month: 'Jun', sales: 310000 },
    { month: 'Jul', sales: 420000 },
    { month: 'Aug', sales: 570000 },
  ];

  const maxMonthly = Math.max(...monthlySales.map(m => m.sales));

  return (
    <div id="admin-dashboard-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Admin Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Live Store Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-1">
            Akshar Mandir Administration
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setLogoModalOpen(true)}
            className="px-4 py-2.5 bg-white border border-[#eae5e2] text-[#7b581e] hover:border-[#7b581e] hover:bg-[#7b581e]/5 text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <Palette className="w-4 h-4 text-[#7b581e]" />
            <span>Customize Logo & Brand</span>
          </button>

          <button
            onClick={() => navigateTo('admin-products')}
            className="px-4 py-2.5 bg-white border border-[#eae5e2] text-[#1f1c1b] hover:border-[#570000] text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-[#7b581e]" />
            <span>Manage Products ({products.length})</span>
          </button>

          <button
            onClick={() => navigateTo('home')}
            className="px-4 py-2.5 bg-[#570000] hover:bg-[#800000] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
          >
            <span>View Public Storefront →</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae5e2] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Total Sales</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-serif font-bold text-[#1f1c1b]">{formatPrice(totalSales)}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae5e2] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Total Orders</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-800">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-serif font-bold text-[#1f1c1b]">142 Orders</p>
          <div className="flex items-center gap-1 text-[11px] text-amber-800 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingOrders} in active crafting</span>
          </div>
        </div>

        {/* Bespoke Requests */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae5e2] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Bespoke Inquiries</span>
            <span className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-serif font-bold text-[#1f1c1b]">{customRequests.length} Custom Requests</p>
          <p className="text-[11px] text-gray-500">CAD Mockups ready for review</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-[#eae5e2] shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Low Stock Inventory</span>
            <span className="p-2 rounded-lg bg-red-50 text-red-700">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-serif font-bold text-red-700">{lowStockCount} Mandirs</p>
          <p className="text-[11px] text-gray-500">Inventory under 5 units</p>
        </div>
      </div>

      {/* Sales Trend Bar Chart & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#eae5e2] shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-[#eae5e2]">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Monthly Sales Trend (2026)</h3>
              <p className="text-xs text-gray-500">Monthly revenue from standard & bespoke mandir orders</p>
            </div>
            <span className="text-xs font-bold text-[#570000] bg-[#570000]/10 px-3 py-1 rounded-full">
              6 Months Growth: +375%
            </span>
          </div>

          {/* Bar chart */}
          <div className="h-48 flex items-end justify-between gap-4 pt-6 px-2">
            {monthlySales.map((item, idx) => {
              const heightPercent = Math.round((item.sales / maxMonthly) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatPrice(item.sales)}
                  </span>
                  <div className="w-full bg-[#f6f3f2] rounded-t-xl overflow-hidden h-36 flex items-end">
                    <div 
                      className="w-full bg-gradient-to-t from-[#570000] to-[#7b581e] rounded-t-xl transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#eae5e2] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1f1c1b] pb-2 border-b border-[#eae5e2]">
              Payment Breakdown
            </h3>
            <div className="space-y-3 pt-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">UPI / QR Code</span>
                <span className="font-bold text-gray-900">58% (₹10.7L)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-[#570000] w-[58%]" />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-medium text-gray-700">Credit / Debit Cards</span>
                <span className="font-bold text-gray-900">26% (₹4.8L)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-[#7b581e] w-[26%]" />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-medium text-gray-700">Pay on Installation</span>
                <span className="font-bold text-gray-900">16% (₹2.95L)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-amber-500 w-[16%]" />
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#f6f3f2] rounded-xl text-[11px] text-gray-600 space-y-1 border border-[#eae5e2]">
            <p className="font-bold text-[#1f1c1b]">White-Glove Dispatch Note</p>
            <p>All crated shipments require 48h drying window before dispatch.</p>
          </div>
        </div>
      </div>

      {/* Live Orders Management Table */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#eae5e2]">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Live Store Orders</h3>
            <p className="text-xs text-gray-500">Update order status live across customer tracking portals</p>
          </div>
          <span className="text-xs font-semibold text-gray-500">{orders.length} total orders recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eae5e2] text-gray-500 font-bold uppercase text-[10px]">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Live Status Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae5e2]">
              {orders.map(ord => (
                <tr key={ord.id} className="hover:bg-[#fbf9f8] transition-colors">
                  <td className="py-3.5 font-mono font-bold text-[#570000]">{ord.orderNumber}</td>
                  <td className="py-3.5 font-semibold text-[#1f1c1b]">
                    {ord.shippingAddress.fullName}
                    <span className="block text-[10px] text-gray-400 font-normal">{ord.shippingAddress.city}</span>
                  </td>
                  <td className="py-3.5 text-gray-600 max-w-xs truncate">
                    {ord.items.map(i => `${i.title} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3.5 text-gray-500">{ord.date}</td>
                  <td className="py-3.5 text-gray-600 font-medium">{ord.paymentMethod}</td>
                  <td className="py-3.5 font-bold font-serif text-[#1f1c1b]">{formatPrice(ord.total)}</td>
                  <td className="py-3.5">
                    <select
                      value={ord.status}
                      onChange={e => adminUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="text-xs font-semibold p-1.5 rounded-lg border border-[#eae5e2] bg-[#f6f3f2] focus:outline-none focus:border-[#570000]"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Artisan Crafting">Artisan Crafting</option>
                      <option value="Quality Check">Quality Check</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bespoke Requests Queue Table */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-[#eae5e2]">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Bespoke Custom Mandir Queue</h3>
            <p className="text-xs text-gray-500">Client architectural blueprints and quote approvals</p>
          </div>
          <span className="text-xs font-semibold text-gray-500">{customRequests.length} pending review</span>
        </div>

        <div className="space-y-3">
          {customRequests.map(req => (
            <div key={req.id} className="p-4 rounded-2xl bg-[#fbf9f8] border border-[#eae5e2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#570000] text-xs">{req.id}</span>
                  <span className="font-bold text-xs text-[#1f1c1b]">{req.fullName} ({req.city})</span>
                  <span className="text-[10px] text-gray-400">{req.phone}</span>
                </div>
                <p className="text-xs text-gray-600">
                  {req.width}"W × {req.depth}"D × {req.height}"H • {req.materialPreference} • {req.finishType}
                </p>
                {req.engravingRequirements && (
                  <p className="text-[11px] text-[#7b581e] italic">"{req.engravingRequirements}"</p>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="font-serif font-bold text-[#570000] text-sm">{formatPrice(req.estimatedQuote)}</span>
                <select
                  value={req.status}
                  onChange={e => adminUpdateCustomRequestStatus(req.id, e.target.value as any)}
                  className="text-xs font-semibold p-2 rounded-lg border border-[#eae5e2] bg-white focus:outline-none focus:border-[#570000]"
                >
                  <option value="Pending Review">Pending Review</option>
                  <option value="CAD Design Ready">CAD Design Ready</option>
                  <option value="In Production">In Production</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Logo and Brand Customizer Modal */}
      <LogoCustomizerModal
        isOpen={logoModalOpen}
        onClose={() => setLogoModalOpen(false)}
      />
    </div>
  );
};
