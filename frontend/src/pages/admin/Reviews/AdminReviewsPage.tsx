import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { 
  Star, 
  CheckCircle2, 
  EyeOff, 
  Trash2, 
  Search, 
  MessageSquare, 
  Check, 
  X 
} from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const { showToast } = useApp();

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.reviews.getAdminReviews({
        isApproved: statusFilter === 'All' ? undefined : statusFilter === 'approved',
      });
      if (res.success && res.data.reviews) {
        setReviews(res.data.reviews);
      }
    } catch (err: any) {
      showToast(err.message || 'Error fetching customer reviews.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleToggleApproval = async (rev: any) => {
    try {
      await api.reviews.updateApproval(rev.id, !rev.isApproved);
      showToast(`Review ${rev.isApproved ? 'hidden' : 'approved & published'}.`, 'success');
      fetchReviews();
    } catch (err: any) {
      showToast(err.message || 'Error moderating review.', 'error');
    }
  };

  const handleDelete = async (rev: any) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      await api.reviews.delete(rev.id);
      showToast('Review deleted.', 'info');
      fetchReviews();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review.', 'error');
    }
  };

  return (
    <div id="admin-reviews-page" className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Customer Testimonials</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Customer Reviews & Ratings ({reviews.length})
          </h1>
          <p className="text-xs text-gray-500">Moderate product ratings, verify woodcraft feedback, and publish customer testimonials.</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white border border-[#eae5e2] text-xs font-semibold text-gray-700 shadow-xs"
        >
          <option value="All">All Reviews</option>
          <option value="approved">Approved & Visible</option>
          <option value="pending">Pending Moderation</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <div key={rev.id} className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <strong className="text-sm font-bold text-[#1f1c1b] block">{rev.userName}</strong>
                  <span className="text-[11px] text-gray-500">{rev.product?.title || 'Home Mandir'}</span>
                </div>
                <div className="flex text-[#d4af37]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>

              {rev.title && <p className="font-bold text-gray-800">{rev.title}</p>}
              <p className="text-gray-600 leading-relaxed italic">"{rev.comment}"</p>
            </div>

            <div className="pt-3 border-t border-[#eae5e2] flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                rev.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {rev.isApproved ? 'Approved' : 'Hidden'}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleApproval(rev)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors ${
                    rev.isApproved
                      ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {rev.isApproved ? <EyeOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{rev.isApproved ? 'Hide Review' : 'Approve'}</span>
                </button>
                <button
                  onClick={() => handleDelete(rev)}
                  className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
