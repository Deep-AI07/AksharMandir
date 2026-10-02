import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
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
  Layers,
  CreditCard
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { formatPrice } = useApp();

  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    api.admin.getDashboard()
      .then(res => {
        if (res.success && res.data) {
          setMetrics(res.data);
        }
      })
      .catch(err => {
        console.error('Error fetching admin dashboard metrics:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading || !metrics) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#570000] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#7b581e]">Loading Store Analytics...</p>
      </div>
    );
  }

  const { kpi, salesOverview, paymentMethodsBreakdown, recentOrders, bestSellers, recentCustomers } = metrics;
  const maxSales = Math.max(...salesOverview.map((s: any) => s.sales), 1);

  return (
    <div id="admin-dashboard-page" className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Live Analytics Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Store Performance Overview
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-white border border-[#eae5e2] text-[#1f1c1b] hover:border-[#570000] text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
          >
            <Package className="w-4 h-4 text-[#7b581e]" />
            <span>Manage Products</span>
          </Link>

          <Link
            to="/admin/categories"
            className="px-4 py-2 bg-white border border-[#eae5e2] text-[#1f1c1b] hover:border-[#570000] text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-[#7b581e]" />
            <span>Categories</span>
          </Link>
        </div>
      </div>

      {/* 7 Key KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-[#eae5e2] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Total Revenue</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1f1c1b]">
            {formatPrice(kpi.totalSales)}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">Includes online + confirmed orders</p>
        </div>

        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-3xl border border-[#eae5e2] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Today's Sales</span>
            <span className="p-2 rounded-xl bg-[#570000]/10 text-[#570000]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#570000]">
            {formatPrice(kpi.todaySales)}
          </div>
          <p className="text-[11px] text-gray-500">Real-time daily transaction sum</p>
        </div>

        {/* Orders Count */}
        <div className="bg-white p-5 rounded-3xl border border-[#eae5e2] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Orders</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1f1c1b]">
            {kpi.totalOrders} <span className="text-xs font-sans text-gray-400">Total</span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold">
            {kpi.pendingOrders} Pending Fulfillment
          </p>
        </div>

        {/* Customers & Stock */}
        <div className="bg-white p-5 rounded-3xl border border-[#eae5e2] shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="font-semibold uppercase tracking-wider">Catalog & Users</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-serif font-bold text-[#1f1c1b]">
            {kpi.totalProducts} <span className="text-xs font-sans text-gray-400">Products</span>
          </div>
          <p className="text-[11px] text-gray-500">
            {kpi.totalCustomers} Registered Customers • {kpi.outOfStockProducts} Out of stock
          </p>
        </div>
      </div>

      {/* Charts Section: Monthly Sales Overview & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#eae5e2] shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Monthly Sales Overview</h3>
              <p className="text-xs text-gray-500">Gross revenue generated across last 6 months</p>
            </div>
            <Link to="/admin/reports" className="text-xs text-[#570000] font-bold hover:underline">
              Detailed Reports →
            </Link>
          </div>

          <div className="h-48 flex items-end justify-between gap-4 pt-6 pb-2 px-2 border-b border-[#eae5e2]">
            {salesOverview.map((item: any) => {
              const heightPct = Math.max(12, Math.round((item.sales / maxSales) * 100));
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-[#570000] opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatPrice(item.sales)}
                  </span>
                  <div className="w-full max-w-[40px] bg-[#570000]/10 rounded-t-xl overflow-hidden flex items-end h-36">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-gradient-to-t from-[#570000] to-[#800000] rounded-t-xl group-hover:brightness-110 transition-all"
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#eae5e2] shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Payment Method Mix</h3>
            <p className="text-xs text-gray-500">UPI, QR Code, Card & COD</p>
          </div>

          <div className="space-y-4 text-xs">
            {paymentMethodsBreakdown.map((pm: any) => {
              const total = kpi.totalSales || 1;
              const pct = Math.round((pm.amount / total) * 100);
              return (
                <div key={pm.method} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>{pm.method}</span>
                    <span className="text-[#570000] font-bold">{formatPrice(pm.amount)} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full bg-[#570000] rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders & Bestsellers Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#eae5e2] shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs text-[#570000] font-bold hover:underline">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#eae5e2] text-gray-400 uppercase font-bold">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eae5e2]">
                {recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono font-bold text-[#570000]">{ord.orderNumber}</td>
                    <td className="py-3 font-semibold text-gray-800">{ord.customerName}</td>
                    <td className="py-3 font-serif font-bold">{formatPrice(ord.total)}</td>
                    <td className="py-3 font-semibold">{ord.paymentMethod}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#570000]/10 text-[#570000]">
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bestsellers List */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#eae5e2] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Best Selling Mandirs</h3>
          <div className="divide-y divide-[#eae5e2] text-xs">
            {bestSellers.map((item: any, idx: number) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <strong className="text-gray-800 block truncate max-w-[170px]">{item.title}</strong>
                  <span className="text-[11px] text-gray-400 font-mono">ID: {item.productId}</span>
                </div>
                <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs">
                  {item.totalSold} Sold
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
