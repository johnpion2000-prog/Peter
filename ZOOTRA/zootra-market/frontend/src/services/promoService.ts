import { getDocs, query, where } from 'firebase/firestore';
import { promoCodesCol } from '../firebase/collections';

export const validatePromoCode = async (code: string): Promise<number> => {
  const snap = await getDocs(
    query(promoCodesCol, where('code', '==', code.toUpperCase()), where('active', '==', true))
  );
  if (snap.empty) throw new Error('Invalid or expired promo code.');
  const promo = snap.docs[0].data();
  const now = new Date().toISOString();
  if (promo.expiresAt && promo.expiresAt < now) throw new Error('Promo code has expired.');
  return promo.discount;
};
