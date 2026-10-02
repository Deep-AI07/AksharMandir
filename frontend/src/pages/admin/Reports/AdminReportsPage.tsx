import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Layers, 
  CreditCard,
  Download
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { formatPrice, showToast } = useApp();

  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const res = await api.admin.getReports(selectedPeriod);
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading sales report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  return (
    <div id="admin-reports-page" className="space-y-8">
      {/* Header & Period Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Financial Performance Intelligence</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Sales & Revenue Reports
          </h1>
          <p className="text-xs text-gray-500">Comprehensive breakdown of order volume, categorical sales, and payment mix.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-[#eae5e2] shadow-xs">
          {(['today', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p
                  ? 'bg-[#570000] text-white shadow-xs'
                  : 'text-gray-600 hover:text-[#570000]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading || !report ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-[#570000] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold uppercase tracking-wider text-[#7b581e]">Aggregating Report Data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-2">
              <span className="text-xs uppercase font-bold text-gray-500">Period Gross Revenue</span>
              <div className="text-3xl font-serif font-bold text-[#570000]">{formatPrice(report.summary.totalSales)}</div>
              <p className="text-[11px] text-emerald-700 font-semibold">Processed and confirmed orders</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-2">
              <span className="text-xs uppercase font-bold text-gray-500">Total Orders Placed</span>
              <div className="text-3xl font-serif font-bold text-[#1f1c1b]">{report.summary.totalOrders}</div>
              <p className="text-[11px] text-gray-500">Home mandirs sold</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-2">
              <span className="text-xs uppercase font-bold text-gray-500">Average Order Value</span>
              <div className="text-3xl font-serif font-bold text-gray-800">{formatPrice(report.summary.averageOrderValue)}</div>
              <p className="text-[11px] text-gray-500">Per mandir order</p>
            </div>
          </div>

          {/* Categorical & Product Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Categories */}
            <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-[#eae5e2] pb-3">
                <Layers className="w-4 h-4 text-[#570000]" />
                <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Best-Selling Mandir Categories</h3>
              </div>

              <div className="space-y-3">
                {report.categories?.map((cat: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-[#fbf9f8]">
                    <strong className="text-gray-900 text-sm">{cat.categoryName}</strong>
                    <div className="text-right">
                      <span className="font-serif font-bold text-sm text-[#570000] block">{formatPrice(cat.totalSales)}</span>
                      <span className="text-[10px] text-gray-500">{cat.unitsSold} units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-[#eae5e2] pb-3">
                <CreditCard className="w-4 h-4 text-[#570000]" />
                <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Payment Method Distribution</h3>
              </div>

              <div className="space-y-4">
                {report.paymentBreakdown?.map((pm: any, idx: number) => {
                  const total = report.summary.totalSales || 1;
                  const pct = Math.round((pm.amount / total) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>{pm.method} ({pm.count} orders)</span>
                        <strong className="text-[#570000]">{formatPrice(pm.amount)} ({pct}%)</strong>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div style={{ width: `${pct}%` }} className="h-full bg-[#570000] rounded-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
