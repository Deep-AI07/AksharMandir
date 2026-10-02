import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { getProductImageUrl, handleImageError } from '../../utils/imageUtils';
import { InvoiceModal } from '../../components/common/InvoiceModal';
import { printInvoice, downloadInvoicePdf } from '../../utils/invoiceUtils';
import { Order } from '../../types';
import { 
  ArrowLeft, 
  Truck, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Printer, 
  Download,
  FileText,
  MapPin, 
  User, 
  Phone, 
  Mail,
  ShieldCheck,
  Package,
  Home,
  ChevronRight
} from 'lucide-react';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice, showToast, brandConfig } = useApp();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Status controls
  const [orderStatus, setOrderStatus] = useState<string>('PENDING');
  const [deliveryStatus, setDeliveryStatus] = useState<string>('NOT_DELIVERED');
  const [paymentStatus, setPaymentStatus] = useState<string>('PENDING');
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  const fetchOrderDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.orders.getById(id);
      if (res.success && res.data.order) {
        setOrder(res.data.order);
        setOrderStatus(res.data.order.orderStatus);
        setDeliveryStatus(res.data.order.deliveryStatus);
        setPaymentStatus(res.data.order.paymentStatus);
        setTrackingNumber(res.data.order.trackingNumber || '');
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading order details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleSaveStatus = async () => {
    if (!order) return;
    try {
      const res = await api.orders.updateStatus(order.id, {
        orderStatus,
        deliveryStatus,
        paymentStatus,
        trackingNumber: trackingNumber.trim() || null,
      });
      showToast(`Order #${order.orderNumber} updated successfully (Status: ${orderStatus}, Delivery: ${deliveryStatus}, Payment: ${paymentStatus})!`, 'success');
      fetchOrderDetail();
    } catch (err: any) {
      showToast(err.message || 'Failed to update order particulars.', 'error');
    }
  };

  if (loading || !order) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#570000] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#7b581e]">Loading Order Particulars...</p>
      </div>
    );
  }

  const address = order.addressSnapshot || (typeof order.addressSnapshot === 'string' ? JSON.parse(order.addressSnapshot) : order.shippingAddress);

  return (
    <div id="admin-order-detail-page" className="space-y-6 max-w-6xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#eae5e2]">
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/admin" className="hover:text-[#570000] flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>Admin</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <Link to="/admin/orders" className="hover:text-[#570000]">Orders</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[#570000] font-bold font-mono">{order.orderNumber}</span>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin/orders"
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
          >
            <span>Live Store</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Order Particulars</span>
          <h1 className="text-2xl font-serif font-bold text-[#1f1c1b] font-mono">{order.orderNumber}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="px-3.5 py-2 bg-white border border-[#eae5e2] text-[#1f1c1b] hover:border-[#570000] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-[#570000]" />
            <span>View Tax Invoice</span>
          </button>

          <button
            onClick={() => printInvoice(order, brandConfig)}
            className="px-3.5 py-2 bg-white border border-[#eae5e2] text-[#1f1c1b] hover:border-[#570000] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-[#570000]" />
            <span>Print (1 Page)</span>
          </button>

          <button
            onClick={async () => {
              try {
                setDownloading(true);
                await downloadInvoicePdf(order, brandConfig);
                showToast('Invoice PDF downloaded successfully.', 'success');
              } catch (err) {
                showToast('Downloading invoice failed.', 'error');
              } finally {
                setDownloading(false);
              }
            }}
            disabled={downloading}
            className="px-4 py-2 bg-[#570000] text-[#fdcc87] hover:bg-[#7b0000] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-75"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items & Customer Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Items Box */}
          <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Ordered Mandir Items ({order.items?.length || 0})</h3>
            <div className="divide-y divide-[#eae5e2]">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <img
                      src={getProductImageUrl(item.image || item)}
                      alt={item.title}
                      onError={handleImageError}
                      className="w-16 h-16 object-cover rounded-2xl border border-[#eae5e2]"
                    />
                    <div>
                      <strong className="text-sm font-serif font-bold text-[#1f1c1b] block">{item.title}</strong>
                      <span className="text-gray-500 block">Finish: {item.finish} • SKU: {item.sku || 'AKM-001'}</span>
                      <span className="text-gray-400">Unit Price: {formatPrice(item.price)} × {item.quantity}</span>
                    </div>
                  </div>
                  <strong className="font-serif font-bold text-base text-[#570000]">{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-[#eae5e2] space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <strong>{formatPrice(order.subtotal)}</strong>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({order.couponCode}):</span>
                  <span>- {formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-serif font-bold text-[#1f1c1b] pt-2 border-t border-[#eae5e2]">
                <span>Total Amount:</span>
                <span className="text-[#570000] text-xl">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b]">Delivery & Customer Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400 uppercase font-bold text-[10px] block mb-1">Customer Info</span>
                <strong className="text-sm text-[#1f1c1b] block">{order.customerName}</strong>
                <p className="text-gray-600">{order.customerEmail}</p>
                <p className="text-gray-600 font-mono">{order.customerPhone}</p>
              </div>

              <div>
                <span className="text-gray-400 uppercase font-bold text-[10px] block mb-1">Shipping Address</span>
                {address ? (
                  <>
                    <p className="text-gray-800">{address.streetAddress}</p>
                    {address.apartment && <p className="text-gray-600">{address.apartment}</p>}
                    <p className="text-gray-800">{address.city}, {address.state} - {address.pincode}</p>
                  </>
                ) : (
                  <p className="text-gray-400">Address recorded on order</p>
                )}
              </div>
            </div>

            {order.notes && (
              <div className="pt-3 border-t border-[#eae5e2] text-xs text-gray-700">
                <strong>Customer Notes:</strong> {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status Control Center */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xl space-y-4 text-xs">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b] pb-3 border-b border-[#eae5e2]">
              Order Fulfillment Controls
            </h3>

            <div>
              <label className="uppercase font-bold text-gray-500 block mb-1">Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-bold text-[#570000] focus:outline-hidden"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="READY">READY FOR DISPATCH</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="uppercase font-bold text-gray-500 block mb-1">Delivery Status</label>
              <select
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-bold text-gray-800 focus:outline-hidden"
              >
                <option value="NOT_DELIVERED">NOT DELIVERED</option>
                <option value="DELIVERED">DELIVERED</option>
              </select>
            </div>

            <div>
              <label className="uppercase font-bold text-gray-500 block mb-1">Payment Status ({order.paymentMethod})</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-bold text-gray-800 focus:outline-hidden"
              >
                <option value="PENDING">PENDING</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div>
              <label className="uppercase font-bold text-gray-500 block mb-1">Tracking Number / Dispatch Ref</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DEL-IND-992140"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-mono focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleSaveStatus}
              className="w-full py-3 rounded-xl bg-[#570000] text-white font-bold hover:bg-[#800000] shadow-md transition-all mt-2"
            >
              Update Order Status
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceModalOpen && (
        <InvoiceModal
          order={order}
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
    </div>
  );
};
