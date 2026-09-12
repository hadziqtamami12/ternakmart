// formatters.js - Currency, Weight & Number Formatting
export function formatRupiah(amount) {
  if (amount === undefined || amount === null) return 'Rp 0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

export function formatWeight(kg) {
  if (!kg) return '0 kg';
  const num = parseFloat(kg);
  return `${num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kg`;
}

export function formatNumber(num) {
  if (!num) return '0';
  return Number(num).toLocaleString('id-ID');
}
