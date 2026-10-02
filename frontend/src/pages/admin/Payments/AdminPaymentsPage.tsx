import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { 
  CreditCard, 
  Search, 
  Filter, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  QrCode,
  Building2,
  Truck
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const { formatPrice, showToast } = useApp();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.payments.getAdminPayments({
        method: methodFilter !== 'All' ? methodFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      if (res.success && res.data.payments) {
        setPayments(res.data.payments);
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading payments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'UPI': return <Building2 className="w-4 h-4 text-[#570000]" />;
      case 'QR':
      case 'QR CODE': return <QrCode className="w-4 h-4 text-[#570000]" />;
      case 'CARD': return <CreditCard className="w-4 h-4 text-[#570000]" />;
      default: return <Truck className="w-4 h-4 text-[#570000]" />;
    }
  };

  return (
    <div id="admin-payments-page" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Financial Settlement Ledger</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Payment Transactions ({payments.length})
          </h1>
          <p className="text-xs text-gray-500">Live Indian payment audit log covering UPI VPAs, QR Codes, Cards, and Cash On Delivery collections.</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#eae5e2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by transaction ID, order number, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold text-gray-700"
          >
            <option value="All">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="QR">QR CODE</option>
            <option value="CARD">CARD</option>
            <option value="COD">CASH ON DELIVERY</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold text-gray-700"
          >
            <option value="All">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eae5e2] bg-[#fbf9f8] text-gray-500 uppercase font-bold">
                <th className="p-4">Transaction ID & Date</th>
                <th className="p-4">Order Reference</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae5e2]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <strong className="font-mono text-gray-800 block">{p.transactionId}</strong>
                    <span className="text-[11px] text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                  </td>

                  <td className="p-4 font-mono font-bold text-[#570000]">
                    {p.order?.orderNumber || p.orderId}
                  </td>

                  <td className="p-4">
                    <strong className="text-gray-900 block">{p.order?.customerName || p.user?.name || 'Customer'}</strong>
                    <span className="text-[11px] text-gray-400">{p.order?.customerEmail || p.user?.email}</span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(p.method)}
                      <span className="font-semibold text-gray-800">{p.method}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <strong className="font-serif font-bold text-sm text-[#1f1c1b]">{formatPrice(p.amount)}</strong>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
