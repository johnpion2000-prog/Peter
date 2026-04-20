export function calculateDiscountedPrice(price: number, discountPercent: number): number {
  if (discountPercent <= 0) return price;
  return parseFloat((price - price * (discountPercent / 100)).toFixed(2));
}

export function getSavings(price: number, discountPercent: number): number {
  return parseFloat((price * (discountPercent / 100)).toFixed(2));
}
