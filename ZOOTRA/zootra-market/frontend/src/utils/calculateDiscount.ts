export const calculateDiscountedPrice = (price: number, discountPercent: number): number => {
  if (discountPercent <= 0) return price;
  if (discountPercent >= 100) return 0;
  return Math.round(price * (1 - discountPercent / 100));
};

export const calculateDiscountAmount = (price: number, discountPercent: number): number => {
  return Math.round(price * (discountPercent / 100));
};
