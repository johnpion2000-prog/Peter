import {
  doc,
  getDoc,
  runTransaction,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/** Save or update a user's rating for a product.
 *  Uses a Firestore transaction so ratingAvg and ratingCount stay consistent. */
export async function submitRating(
  productId: string,
  userId: string,
  stars: number,
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  const ratingRef  = doc(collection(db, 'products', productId, 'ratings'), userId);

  await runTransaction(db, async tx => {
    const [productSnap, ratingSnap] = await Promise.all([
      tx.get(productRef),
      tx.get(ratingRef),
    ]);

    if (!productSnap.exists()) throw new Error('Product not found');

    const prev = productSnap.data() as { ratingAvg?: number; ratingCount?: number };
    const prevCount = prev.ratingCount ?? 0;
    const prevSum   = (prev.ratingAvg ?? 0) * prevCount;

    let newCount: number;
    let newSum: number;

    if (ratingSnap.exists()) {
      // Replace old rating
      const oldStars = (ratingSnap.data() as { rating: number }).rating;
      newCount = prevCount;
      newSum   = prevSum - oldStars + stars;
    } else {
      newCount = prevCount + 1;
      newSum   = prevSum + stars;
    }

    const newAvg = newCount > 0 ? newSum / newCount : 0;

    tx.set(ratingRef, { rating: stars, userId, updatedAt: serverTimestamp() });
    tx.update(productRef, {
      ratingAvg:   Math.round(newAvg * 10) / 10,
      ratingCount: newCount,
    });
  });
}

/** Returns the star value (1-5) the user has already given, or null. */
export async function getUserRating(
  productId: string,
  userId: string,
): Promise<number | null> {
  const snap = await getDoc(
    doc(collection(db, 'products', productId, 'ratings'), userId),
  );
  if (!snap.exists()) return null;
  return (snap.data() as { rating: number }).rating;
}
