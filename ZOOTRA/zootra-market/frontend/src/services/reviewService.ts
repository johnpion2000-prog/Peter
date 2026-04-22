import {
  getDocs, addDoc, deleteDoc, doc, query,
  where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { reviewsCol, db } from '../firebase/collections';
import { Review, ReviewSubject } from '../types/review.types';

export const getReviewsBySubject = async (subjectId: string): Promise<Review[]> => {
  const snap = await getDocs(
    query(reviewsCol, where('subjectId', '==', subjectId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Review);
};

export const getUserReviewForSubject = async (
  userId: string, subjectId: string
): Promise<Review | null> => {
  const snap = await getDocs(
    query(reviewsCol, where('userId', '==', userId), where('subjectId', '==', subjectId))
  );
  if (snap.empty) return null;
  return { ...snap.docs[0].data(), id: snap.docs[0].id } as Review;
};

export const getAllReviews = async (): Promise<Review[]> => {
  const snap = await getDocs(query(reviewsCol, orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Review);
};

export const createReview = async (
  data: Omit<Review, 'id' | 'createdAt'>
): Promise<string> => {
  const ref = await addDoc(reviewsCol, {
    ...data,
    createdAt: serverTimestamp(),
  } as any);
  return ref.id;
};

export const deleteReview = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'reviews', id));
};

export const getReviewsByType = async (subjectType: ReviewSubject): Promise<Review[]> => {
  const snap = await getDocs(
    query(reviewsCol, where('subjectType', '==', subjectType), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }) as Review);
};
