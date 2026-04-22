export const formatCurrency = (amount: number, currency = 'RWF'): string => {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string =>
  new Intl.NumberFormat('rw-RW').format(num);
