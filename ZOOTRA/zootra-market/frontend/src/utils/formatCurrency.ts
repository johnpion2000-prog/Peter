
// Format number with comma as thousands separator, no currency symbol
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US');
};

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('rw-RW').format(num);
