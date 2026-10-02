import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { printInvoice, downloadInvoicePdf, formatCurrency } from '../../utils/invoiceUtils';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  const { brandConfig, showToast } = useApp();
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !order) return null;

  const address =
    order.addressSnapshot ||
    (typeof order.addressSnapshot === 'string' ? JSON.parse(order.addressSnapshot) : order.shippingAddress);

  const subtotal =
    order.subtotal ||
    order.items?.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0) ||
    order.total;
  const discount = order.discount || 0;
  const total = order.total;

  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    printInvoice(order, brandConfig);
    showToast('Sent 1-page invoice to printer.', 'info');
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await downloadInvoicePdf(order, brandConfig);
      showToast('Invoice PDF downloaded successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to generate PDF. Using print dialog instead.', 'warning');
      printInvoice(order, brandConfig);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl relative border border-[#eae5e2] animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-[#eae5e2] flex items-center justify-between bg-[#fbf9f8]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#570000]/10 text-[#570000]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#1f1c1b]">
                Invoice #{order.orderNumber}
              </h3>
              <p className="text-xs text-gray-500">Official Tax Invoice & Proof of Purchase</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-[#eae5e2] text-[#1f1c1b] hover:border-[#570000] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              title="Print 1-page invoice"
            >
              <Printer className="w-3.5 h-3.5 text-[#570000]" />
              <span className="hidden sm:inline">Print (1 Page)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3.5 py-1.5 bg-[#570000] text-[#fdcc87] hover:bg-[#7b0000] text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-75"
              title="Download Invoice PDF"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          <div
            ref={invoiceRef}
            className="bg-white border border-[#eae5e2] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs max-w-xl mx-auto text-xs text-[#1f1c1b]"
          >
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b-2 border-[#570000] pb-5">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#570000] tracking-wide">
                  {brandConfig?.brandName || 'AKSHAR MANDIR'}
                </h2>
                <p className="text-[11px] text-gray-500 font-medium">
                  {brandConfig?.tagline || 'Divine Modernity • Handcrafted Home Mandirs'}
                </p>
                <p className="text-[10px] text-stone-500 mt-1">
                  Vedic Dimensions &amp; Seasoned Hardwood Mandir Workshop<br />
                  {brandConfig?.supportPhone || '+91 98765 43210'} • {brandConfig?.supportEmail || 'blessings@aksharmandir.com'}
                </p>
              </div>

              <div className="text-right">
                <span className="font-serif font-bold text-base text-[#570000] block uppercase tracking-wider">
                  Tax Invoice
                </span>
                <span className="font-mono font-bold text-xs text-[#1f1c1b] block">#{order.orderNumber}</span>
                <span className="text-[10px] text-gray-500 block">Date: {orderDate}</span>
                <span className={`inline-block mt-1 text-[9px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider border ${
                  order.paymentStatus === 'SUCCESS'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  Payment: {order.paymentStatus || 'PENDING'} ({order.paymentMethod || 'COD'})
                </span>
              </div>
            </div>

            {/* Bill To & Dispatch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-[#faf7f5] border border-[#eedcd0] text-[11px]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">
                  Billed & Delivered To:
                </span>
                <strong className="font-bold text-[#1f1c1b] block">{order.customerName || address?.fullName || 'Valued Customer'}</strong>
                <p className="text-gray-600">{order.customerPhone || address?.phone} {order.customerEmail ? `• ${order.customerEmail}` : ''}</p>
                {address && (
                  <p className="text-gray-500 mt-1 leading-snug">
                    {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}<br />
                    {address.city}, {address.state} - {address.postalCode}
                  </p>
                )}
              </div>

              <div className="sm:border-l sm:border-[#eedcd0] sm:pl-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-0.5">
                  Fulfillment & Delivery:
                </span>
                <p className="text-gray-700"><strong>Service:</strong> White-Glove Mandir Delivery</p>
                <p className="text-gray-700"><strong>Delivery Status:</strong> {order.deliveryStatus || 'CONFIRMED'}</p>
                {order.trackingNumber && (
                  <p className="text-gray-700"><strong>Tracking AWB:</strong> <span className="font-mono">{order.trackingNumber}</span></p>
                )}
                <p className="text-[10px] text-gray-500 mt-1">Includes 5-Year Structural Integrity Warranty.</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-[#eae5e2] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5efe9] text-[#570000] text-[10px] uppercase font-bold tracking-wider border-b border-[#d6c7bc]">
                    <th className="p-2.5">Item Description</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Price</th>
                    <th className="p-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eae5e2] text-xs">
                  {order.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-2.5 font-semibold text-[#1f1c1b]">
                        {item.title}
                        <div className="text-[10px] text-gray-400 font-normal">
                          Finish: {item.finish || 'Natural Teak'} {item.sku ? `• SKU: ${item.sku}` : ''}
                        </div>
                      </td>
                      <td className="p-2.5 text-center text-gray-600">{item.quantity}</td>
                      <td className="p-2.5 text-right text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="p-2.5 text-right font-bold text-[#1f1c1b]">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary & Authentic Stamp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <div className="border-1.5 border-dashed border-[#570000] text-[#570000] text-[9px] font-bold uppercase p-2 rounded-lg text-center tracking-wider bg-[#570000]/5">
                  ✦ Authentic Handcrafted Mandir Guaranteed ✦<br />
                  Akshar Mandir Seal of Craftsmanship
                </div>
                <p className="text-[10px] text-gray-400">
                  GST included. All deliveries packaged in moisture-proof heavy export wooden crates.
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Discount ({order.couponCode || 'PROMO'}):</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>White-Glove Delivery:</span>
                  <span className="text-green-700 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t-2 border-[#570000] text-sm">
                  <span className="font-serif font-bold text-[#570000]">Total Paid:</span>
                  <span className="font-serif font-bold text-base text-[#570000]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Footer Blessings */}
            <div className="border-t border-dashed border-[#eae5e2] pt-3 text-center text-[10px] text-gray-400">
              May this mandir bring peace, prosperity, and Bhakti at Home to your family.<br />
              Need custom modifications or support? Contact: {brandConfig?.supportEmail || 'blessings@aksharmandir.com'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
