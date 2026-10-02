import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { CustomMandirRequest } from '../../../types';
import { 
  Sparkles, 
  Search, 
  Eye, 
  Edit3, 
  X, 
  DollarSign, 
  Ruler, 
  TreePine, 
  CheckCircle2, 
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const AdminCustomOrdersPage: React.FC = () => {
  const { formatPrice, showToast } = useApp();

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Quote Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [quoteTotal, setQuoteTotal] = useState('75000');
  const [advanceAmount, setAdvanceAmount] = useState('25000');
  const [remainingAmount, setRemainingAmount] = useState('50000');
  const [quoteStatus, setQuoteStatus] = useState('QUOTED');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.customOrders.getAdminRequests({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      if (res.success && res.data.customOrders) {
        setRequests(res.data.customOrders);
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching custom mandir requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const openQuoteModal = (req: any) => {
    setSelectedRequest(req);
    setQuoteTotal(String(req.estimatedQuote || 50000));
    setAdvanceAmount(String(req.advanceAmount || Math.round((req.estimatedQuote || 50000) * 0.3)));
    setRemainingAmount(String(req.remainingAmount || Math.round((req.estimatedQuote || 50000) * 0.7)));
    setQuoteStatus(req.status || 'QUOTED');
    setAdminNotes(req.adminNotes || '');
  };

  const handleTotalChange = (val: string) => {
    setQuoteTotal(val);
    const num = parseFloat(val) || 0;
    const adv = Math.round(num * 0.3);
    setAdvanceAmount(String(adv));
    setRemainingAmount(String(Math.max(0, num - adv)));
  };

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      const res = await api.customOrders.updateQuote(selectedRequest.id, {
        estimatedQuote: parseFloat(quoteTotal),
        advanceAmount: parseFloat(advanceAmount),
        remainingAmount: parseFloat(remainingAmount),
        status: quoteStatus,
        adminNotes: adminNotes.trim(),
      });
      showToast(res.message || 'Custom mandir quote & status updated.', 'success');
      setSelectedRequest(null);
      fetchRequests();
    } catch (err: any) {
      showToast(err.message || 'Failed to update quote.', 'error');
    }
  };

  return (
    <div id="admin-custom-orders-page" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Custom Mandir Consultations</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Custom Mandir Requests ({requests.length})
          </h1>
          <p className="text-xs text-gray-500">Review custom dimensions, reference sketches, generate quotes, and track artisan CAD status.</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#eae5e2] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by request number, customer name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRequests()}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold text-gray-700"
        >
          <option value="All">All Consultation Statuses</option>
          <option value="PENDING_REVIEW">PENDING REVIEW</option>
          <option value="QUOTED">QUOTED</option>
          <option value="CAD_READY">CAD DESIGN READY</option>
          <option value="IN_PRODUCTION">IN PRODUCTION</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Consultation Ref</span>
                  <strong className="font-mono text-sm text-[#570000] block">{req.requestNumber || req.id}</strong>
                  <span className="text-gray-400 text-[10px]">{new Date(req.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#d4af37]/20 text-[#570000]">
                  {req.status}
                </span>
              </div>

              {/* Reference Photo */}
              {req.referenceImageUrl && (
                <div className="aspect-video rounded-2xl overflow-hidden border border-[#eae5e2] bg-[#fbf9f8]">
                  <img src={req.referenceImageUrl} alt="Reference Sketch" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Customer Info */}
              <div className="p-3 rounded-2xl bg-[#fbf9f8] space-y-1">
                <strong className="text-[#1f1c1b] block text-sm">{req.customerName}</strong>
                <p className="text-gray-600">{req.customerPhone} • {req.customerEmail}</p>
                <p className="text-gray-500">{req.city}, {req.pincode}</p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-gray-400 block font-bold">Dimensions</span>
                  <strong>{req.width}"W x {req.depth}"D x {req.height}"H ({req.unit})</strong>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold">Timber</span>
                  <strong>{req.materialPreference}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold">Finish</span>
                  <strong>{req.finishType}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold">Mounting</span>
                  <strong>{req.mounting}</strong>
                </div>
              </div>

              {req.engravingRequirements && (
                <div className="p-2.5 rounded-xl bg-[#fdcc87]/15 border border-[#fdcc87]/30 text-[11px]">
                  <strong>Sanskrit Engraving:</strong> {req.engravingRequirements}
                </div>
              )}
            </div>

            {/* Quote & Actions */}
            <div className="pt-3 border-t border-[#eae5e2] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block">Current Quote</span>
                <strong className="font-serif font-bold text-base text-[#570000]">{formatPrice(req.estimatedQuote)}</strong>
              </div>

              <button
                onClick={() => openQuoteModal(req)}
                className="px-4 py-2 bg-[#570000] text-white hover:bg-[#800000] rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Quote & Update</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quote / Status Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveQuote} className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#7b581e]">Artisan Quotation Studio</span>
                <h3 className="font-serif font-bold text-base text-[#1f1c1b]">{selectedRequest.requestNumber}</h3>
              </div>
              <button type="button" onClick={() => setSelectedRequest(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Consultation Status</label>
                <select
                  value={quoteStatus}
                  onChange={(e) => setQuoteStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-bold text-[#570000] focus:outline-hidden"
                >
                  <option value="PENDING_REVIEW">PENDING REVIEW</option>
                  <option value="QUOTED">QUOTED (Quote Sent to Customer)</option>
                  <option value="CAD_READY">CAD DESIGN READY</option>
                  <option value="IN_PRODUCTION">IN PRODUCTION (Timber Allocated)</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Total Quote (₹)</label>
                  <input
                    type="number"
                    required
                    value={quoteTotal}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-bold text-[#570000] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Advance (30%)</label>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Remaining (70%)</label>
                  <input
                    type="number"
                    value={remainingAmount}
                    onChange={(e) => setRemainingAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Artisan Notes / CAD Feedback</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes on timber seasoning, jaali cutting, or delivery timeline..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#eae5e2]">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#570000] text-white text-xs font-bold hover:bg-[#800000]"
              >
                Save Quote & Status
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
