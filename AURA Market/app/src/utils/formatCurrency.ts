export function formatCurrency(amount: number, currency = 'RWF'): string {
  const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
  return `${currency} ${number}`;
}

export const fmt = formatCurrency;
