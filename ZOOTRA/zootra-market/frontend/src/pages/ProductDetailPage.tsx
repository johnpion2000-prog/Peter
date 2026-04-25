import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, MessageSquare } from 'lucide-react';
import { getProductById } from '../services/productService';
import { Product } from '../types/product.types';
import { useCartStore } from '../stores/cartStore';
import { formatCurrency } from '../utils/formatCurrency';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import { useSubjectReviews } from '../hooks/useReviews';
import { createReview, getUserReviewForSubject } from '../services/reviewService';
import { useUIStore } from '../stores/uiStore';
import StarRating from '../components/common/StarRating';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const showToast = useUIStore((s) => s.showToast);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  // Reviews state
  const { reviews, loading: reviewsLoading, avgRating } = useSubjectReviews(id);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id).then((p) => { setProduct(p); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    getUserReviewForSubject(user.uid, id)
      .then((r) => setHasReviewed(!!r))
      .catch(() => { /* index may be building, silently ignore */ });
  }, [user, id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !product) return;
    if (rating < 1) { showToast('Please select a star rating', 'error'); return; }
    setSubmitting(true);
    try {
      await createReview({
        userId: user.uid,
        userName: user.displayName ?? 'Anonymous',
        userEmail: user.email ?? '',
        subjectType: 'product',
        subjectId: id,
        subjectName: product.productName,
        rating,
        comment: comment.trim(),
      });
      showToast('Review submitted!', 'success');
      setHasReviewed(true);
      setShowForm(false);
      setComment('');
      setRating(5);
    } catch {
      showToast('Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!product) return <div className="text-center py-24 text-gray-500">Product not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-green-600 hover:underline text-sm mb-6 flex items-center gap-1">← Back</button>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img src={product.imageURL || '/placeholder.jpg'} alt={product.productName} className="w-full h-80 object-cover" />
            </div>
            <div className="p-6 md:w-1/2">
              {product.discountPercent > 0 && (
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">-{product.discountPercent}% OFF</span>
              )}
              <h1 className="text-2xl font-bold text-gray-900 mt-2">{product.productName}</h1>
              <p className="text-sm text-green-600 font-medium capitalize mt-1">{product.category}</p>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{product.location}</p>
              {/* Average rating */}
              {reviews.length > 0 && (
                <div className="mt-2">
                  <StarRating value={avgRating} size="sm" showValue count={reviews.length} />
                </div>
              )}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-3xl font-bold text-green-700">{formatCurrency(product.discountedPrice)}</span>
                {product.discountPercent > 0 && <span className="text-gray-400 line-through">{formatCurrency(product.price)}</span>}
              </div>
              <p className="text-gray-600 text-sm mt-4 leading-relaxed">{product.description}</p>
              <p className="text-sm text-gray-500 mt-2">Stock: <span className={product.stock > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>{product.stock > 0 ? `${product.stock} available` : 'Sold Out'}</span></p>
              {product.stock > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center border rounded-lg overflow-hidden">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">−</button>
                    <span className="px-4 py-2 text-sm font-medium">{qty}</span>
                    <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-2 text-gray-600 hover:bg-gray-100">+</button>
                  </div>
                  <button onClick={() => { addItem(product, qty); navigate('/cart'); }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition">
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Reviews Section ── */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
              {reviews.length > 0 && (
                <span className="text-sm text-gray-400">({reviews.length})</span>
              )}
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={avgRating} size="md" showValue count={reviews.length} />
              </div>
            )}
          </div>

          {/* Write a review CTA */}
          {user && !hasReviewed && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition"
            >
              Write a Review
            </button>
          )}
          {!user && (
            <p className="mb-4 text-sm text-gray-500">
              <button onClick={() => navigate('/login')} className="text-green-600 hover:underline font-medium">Sign in</button> to leave a review.
            </p>
          )}
          {user && hasReviewed && (
            <p className="mb-4 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg inline-block">You've already reviewed this product.</p>
          )}

          {/* Review form */}
          {showForm && (
            <form onSubmit={handleReviewSubmit} className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">Your Rating</p>
              <StarRating value={rating} onChange={setRating} size="lg" />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience with this product..."
                className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setComment(''); setRating(5); }}
                  className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reviews list */}
          {reviewsLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{r.userName}</p>
                      <StarRating value={r.rating} size="sm" />
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {r.createdAt?.toDate?.().toLocaleDateString?.() ?? ''}
                    </span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetailPage;
