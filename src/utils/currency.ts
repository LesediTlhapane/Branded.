/**
 * South African Rand (ZAR) Currency Utilities
 */

export function formatZAR(amount: number): string {
  if (isNaN(amount)) return 'R 0.00';
  const formatted = new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `R ${formatted}`;
}

export function parseZARInput(val: string): number {
  const cleaned = val.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
