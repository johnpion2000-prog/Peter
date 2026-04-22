import React, { useState } from 'react';
import { Star, Trash2, MessageSquare, Filter } from 'lucide-react';
import { useAdminReviews } from '../../hooks/useReviews';
import { ReviewSubject } from '../../types/review.types';
import StarRating from '../../components/common/StarRating';
import Spinner from '../../components/ui/Spinner';

const ReviewManagement: React.FC = () => {
  const { reviews, loading, remove } = useAdminReviews();
  const [typeFilter, setTypeFilter] = useState<ReviewSubject | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 0>(0);

  const filtered = reviews.filter((r) => {
    if (typeFilter !== 'all' && r.subjectType !== typeFilter) return false;
    if (ratingFilter > 0 && r.rating !== ratingFilter) return false;
    return true;
  });

  const avgAll = reviews.length
    ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await remove(id);
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" /> Reviews & Ratings
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {reviews.length} total review{reviews.length !== 1 ? 's' : ''}
            {reviews.length > 0 && (
              <span className="ml-2 text-yellow-500 font-semibold">★ {avgAll} avg</span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ReviewSubject | 'all')}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value={0}>All Ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats bar */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
            return (
              <div key={star} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-gray-700">{star}</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-400">{pct}%</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No reviews found</p>
          <p className="text-sm mt-1">Try adjusting the filters</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Comment</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.subjectType === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {r.subjectType}
                    </span>
                    <p className="text-xs text-gray-700 mt-0.5 truncate max-w-[120px]" title={r.subjectName}>{r.subjectName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-[100px]">{r.userName}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[100px]">{r.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating value={r.rating} size="sm" showValue />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-600 truncate max-w-[200px]" title={r.comment}>
                      {r.comment || <span className="text-gray-300 italic">No comment</span>}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {r.createdAt?.toDate?.().toLocaleDateString?.() ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;
