import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { InvoiceModal } from '../../../components/common/InvoiceModal';
import { printInvoice, downloadInvoicePdf } from '../../../utils/invoiceUtils';
import { Order } from '../../../types';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText,
  AlertCircle,
  Printer,
  Download
} from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { formatPrice, showToast, brandConfig } = useApp();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deliveryFilter, setDeliveryFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.getAdminOrders({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        deliveryStatus: deliveryFilter !== 'All' ? deliveryFilter : undefined,
        paymentStatus: paymentFilter !== 'All' ? paymentFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      if (res.success && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, deliveryFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateOrderStatus = async (orderId: string, orderStatus: string) => {
    try {
      const res = await api.orders.updateStatus(orderId, { orderStatus });
      showToast(res.message || 'Order status updated.', 'success');
      fetchOrders();
    } catch (err: any) {
      showToast(err.message || 'Error updating order status.', 'error');
    }
  };

  const handleUpdateDeliveryStatus = async (orderId: string, deliveryStatus: string) => {
    try {
      const res = await api.orders.updateStatus(orderId, { deliveryStatus });
      showToast(`Delivery status set to ${deliveryStatus}.`, 'success');
      fetchOrders();
    } catch (err: any) {
      showToast(err.message || 'Error updating delivery status.', 'error');
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const res = await api.orders.updateStatus(orderId, { paymentStatus });
      showToast(`Payment status updated to ${paymentStatus}.`, 'success');
      fetchOrders();
    } catch (err: any) {
      showToast(err.message || 'Error updating payment status.', 'error');
    }
  };

  return (
    <div id="admin-orders-page" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Order Fulfillment</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Customer Orders ({orders.length})
          </h1>
          <p className="text-xs text-gray-500">Live order processing, delivery management, and payment verification.</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#eae5e2] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold text-gray-700"
          >
            <option value="All">All Order Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="READY">READY</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold text-gray-700"
          >
            <option value="All">All Delivery Statuses</option>
            <option value="NOT_DELIVERED">NOT DELIVERED</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold text-gray-700"
          >
            <option value="All">All Payments</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="PENDING">PENDING</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eae5e2] bg-[#fbf9f8] text-gray-500 uppercase font-bold">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Amount & Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae5e2]">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <strong className="font-mono text-sm text-[#570000] block">{ord.orderNumber}</strong>
                    <span className="text-[11px] text-gray-400">{new Date(ord.createdAt).toLocaleDateString('en-IN')}</span>
                  </td>

                  <td className="p-4">
                    <strong className="text-gray-900 block">{ord.customerName}</strong>
                    <p className="text-gray-500 text-[11px]">{ord.customerPhone}</p>
                    <p className="text-gray-400 text-[10px] truncate max-w-[140px]">{ord.customerEmail}</p>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold block">{ord.items?.length || 0} Mandir(s)</span>
                    <span className="text-[11px] text-gray-500 line-clamp-1 max-w-[150px]">
                      {ord.items?.[0]?.title}
                    </span>
                  </td>

                  <td className="p-4">
                    <strong className="font-serif font-bold text-sm text-[#1f1c1b] block">{formatPrice(ord.total)}</strong>
                    <span className="text-[11px] text-gray-500 block">{ord.paymentMethod}</span>
                    <select
                      value={ord.paymentStatus}
                      onChange={(e) => handleUpdatePaymentStatus(ord.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 mt-0.5 border ${
                        ord.paymentStatus === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="SUCCESS">SUCCESS</option>
                      <option value="PENDING">PENDING</option>
                      <option value="FAILED">FAILED</option>
                      <option value="REFUNDED">REFUNDED</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                      className="px-2 py-1 rounded-lg text-xs font-bold bg-[#fbf9f8] border border-[#eae5e2] text-[#570000]"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="READY">READY</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <select
                      value={ord.deliveryStatus}
                      onChange={(e) => handleUpdateDeliveryStatus(ord.id, e.target.value)}
                      className={`px-2 py-1 rounded-lg text-xs font-bold border ${
                        ord.deliveryStatus === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="NOT_DELIVERED">NOT DELIVERED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="p-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-gray-700 hover:text-[#570000] hover:border-[#570000] transition-colors"
                        title="View Tax Invoice & Actions"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => printInvoice(ord, brandConfig)}
                        className="p-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-gray-700 hover:text-[#570000] hover:border-[#570000] transition-colors"
                        title="Quick Print Invoice (1 Page)"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            await downloadInvoicePdf(ord, brandConfig);
                            showToast('Invoice PDF downloaded.', 'success');
                          } catch (err) {
                            showToast('Failed to download invoice PDF.', 'error');
                          }
                        }}
                        className="p-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-gray-700 hover:text-[#570000] hover:border-[#570000] transition-colors"
                        title="Download Invoice PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#570000] hover:border-[#570000] transition-colors"
                        title="View Full Order Particulars"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          isOpen={!!selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
};
