import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { Coupon } from '../../../types';
import { 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Eye, 
  EyeOff, 
  Calendar, 
  DollarSign, 
  Percent 
} from 'lucide-react';

export const AdminCouponsPage: React.FC = () => {
  const { formatPrice, showToast } = useApp();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('10');
  const [minOrderValue, setMinOrderValue] = useState('20000');
  const [maxDiscount, setMaxDiscount] = useState('15000');
  const [usageLimit, setUsageLimit] = useState('100');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('2027-12-31');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.coupons.getAll();
      if (res.success && res.data.coupons) {
        setCoupons(res.data.coupons);
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching coupons.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCode(`SHANTI${Math.floor(10 + Math.random() * 90)}`);
    setDiscountType('PERCENTAGE');
    setDiscountValue('10');
    setMinOrderValue('25000');
    setMaxDiscount('10000');
    setUsageLimit('100');
    setIsActive(true);
    setExpiresAt('2027-12-31');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(String(c.discountValue));
    setMinOrderValue(String(c.minOrderValue || 0));
    setMaxDiscount(String(c.maxDiscount || 0));
    setUsageLimit(String(c.usageLimit || 100));
    setIsActive(c.isActive);
    setExpiresAt(c.expiresAt ? c.expiresAt.substring(0, 10) : '2027-12-31');
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Coupon code is required.', 'error');
      return;
    }

    try {
      const payload = {
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue) || 0,
        maxDiscount: parseFloat(maxDiscount) || null,
        usageLimit: parseInt(usageLimit, 10) || null,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      if (editingCoupon) {
        const res = await api.coupons.update(editingCoupon.id, payload);
        showToast(res.message || 'Coupon updated.', 'success');
      } else {
        const res = await api.coupons.create(payload);
        showToast(res.message || 'Coupon created.', 'success');
      }

      setIsModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      showToast(err.message || 'Failed to save coupon.', 'error');
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    try {
      await api.coupons.update(c.id, { isActive: !c.isActive });
      showToast(`Coupon ${c.isActive ? 'deactivated' : 'activated'}.`, 'info');
      fetchCoupons();
    } catch (err: any) {
      showToast(err.message || 'Error updating status.', 'error');
    }
  };

  const handleDelete = async (c: Coupon) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    try {
      const res = await api.coupons.delete(c.id);
      showToast(res.message || 'Coupon deleted.', 'info');
      fetchCoupons();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete coupon.', 'error');
    }
  };

  return (
    <div id="admin-coupons-page" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Promotions & Discounts</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Coupons & Offers ({coupons.length})
          </h1>
          <p className="text-xs text-gray-500">Configure promotional vouchers, festive discounts, and order thresholds.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-3xl border border-[#eae5e2] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#eae5e2] bg-[#fbf9f8] text-gray-500 uppercase font-bold">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Order & Cap</th>
                <th className="p-4">Usage Count</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eae5e2]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4">
                    <strong className="font-mono text-sm text-[#570000] px-2.5 py-1 rounded-lg bg-[#570000]/10 inline-block">
                      {c.code}
                    </strong>
                  </td>

                  <td className="p-4">
                    <strong className="font-serif font-bold text-sm text-gray-900">
                      {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `${formatPrice(c.discountValue)} FLAT`}
                    </strong>
                  </td>

                  <td className="p-4">
                    <span className="block text-gray-700">Min: {formatPrice(c.minOrderValue || 0)}</span>
                    {c.maxDiscount && (
                      <span className="text-[10px] text-gray-400">Max Cap: {formatPrice(c.maxDiscount)}</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-gray-800">{c.timesUsed}</span>
                    <span className="text-gray-400"> / {c.usageLimit || '∞'} uses</span>
                  </td>

                  <td className="p-4 font-mono text-gray-600">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'Never'}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-[#570000] hover:border-[#570000]"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveCoupon} className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
              <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Voucher'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="uppercase font-bold text-gray-500 block mb-1">Coupon Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DIVINE10"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-mono font-bold text-[#570000] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Flat Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">
                    {discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-bold focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Max Discount Cap (₹, Optional)</label>
                  <input
                    type="number"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Usage Limit (Max Uses)</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="uppercase font-bold text-gray-500 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-[#570000] rounded"
                />
                <span className="font-semibold text-gray-700">Coupon Active on Checkout</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#eae5e2]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#570000] text-white font-bold hover:bg-[#800000]"
              >
                Save Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
