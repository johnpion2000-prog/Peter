import { useState } from 'react';
import { getDocs, query, where } from 'firebase/firestore';
import { discountsCol } from '../firebase/collections';
import toast from 'react-hot-toast';

export interface PromoResult {
  code: string;
  discountPercent: number;
}

export function useDiscounts() {
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [checking, setChecking] = useState(false);

  async function applyCode(code: string): Promise<PromoResult | null> {
    setChecking(true);
    try {
      const q = query(discountsCol, where('code', '==', code.toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) { toast.error('Invalid promo code'); return null; }
      const data = snap.docs[0].data();
      if (data.validUntil.toDate() < new Date()) { toast.error('Promo code has expired'); return null; }
      const result: PromoResult = { code: code.toUpperCase(), discountPercent: data.discountPercent };
      setPromo(result);
      toast.success(`${data.discountPercent}% discount applied!`);
      return result;
    } finally {
      setChecking(false);
    }
  }

  function clearPromo() { setPromo(null); }

  return { promo, checking, applyCode, clearPromo };
}
