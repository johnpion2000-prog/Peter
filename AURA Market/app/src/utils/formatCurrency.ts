export function formatCurrency(amount: number, currency = 'RWF'): string {
  return new Intl.NumberFormat('rw-RW', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export const fmt = formatCurrency;
