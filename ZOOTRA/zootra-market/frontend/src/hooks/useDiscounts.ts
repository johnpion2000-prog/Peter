import { useState } from 'react';
import { validatePromoCode } from '../services/promoService';

export const useDiscounts = () => {
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const applyPromoCode = async (code: string) => {
    setPromoLoading(true);
    setPromoError('');
    try {
      const discount = await validatePromoCode(code);
      setPromoDiscount(discount);
      setPromoCode(code.toUpperCase());
    } catch (err: any) {
      setPromoError(err.message);
      setPromoDiscount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  const clearPromo = () => { setPromoDiscount(0); setPromoCode(''); setPromoError(''); };

  return { promoDiscount, promoCode, promoError, promoLoading, applyPromoCode, clearPromo };
};
