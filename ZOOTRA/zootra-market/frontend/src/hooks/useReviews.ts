import { useState, useEffect } from 'react';
import { onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { reviewsCol } from '../firebase/collections';
import { Review } from '../types/review.types';
import { getAllReviews, deleteReview } from '../services/reviewService';

/** Real-time reviews for a specific product or booking */
export const useSubjectReviews = (subjectId: string | undefined) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subjectId) { setLoading(false); return; }
    const q = query(reviewsCol, where('subjectId', '==', subjectId), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setReviews(snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Review));
        setLoading(false);
      },
      () => {
        // Query may fail if composite index is still building — fail gracefully
        setLoading(false);
      }
    );
    return unsub;
  }, [subjectId]);

  const avgRating = reviews.length
    ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return { reviews, loading, avgRating };
};

/** All reviews for admin management */
export const useAdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setReviews(await getAllReviews());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return { reviews, loading, remove, refetch: load };
};
