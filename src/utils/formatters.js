import { CURRENCY_CONFIG } from '../types/finance';

export function formatCurrency(amount, currency = 'USD', compact = false) {
  const cfg = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  try {
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency,
      notation: compact ? 'compact' : 'standard',
      minimumFractionDigits: compact ? 0 : 2,
      maximumFractionDigits: compact ? 1 : 2,
    }).format(amount);
  } catch {
    return `${cfg.symbol}${amount.toFixed(2)}`;
  }
}

export function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonthKey(monthKey, delta) {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const date = new Date(year, month + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(monthKey) {
  if (monthKey === 'all') return 'All Time';
  const [yearStr, monthStr] = monthKey.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatShortMonthLabel(monthKey) {
  const [yearStr, monthStr] = monthKey.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getRecentMonthKeys(anchorMonth, count = 6) {
  const keys = [];
  for (let i = count - 1; i >= 0; i--) {
    keys.push(shiftMonthKey(anchorMonth, -i));
  }
  return keys;
}

export function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SW';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const CATEGORY_CHART_PALETTE = [
  '#0B4F44', // deep forest emerald
  '#B4833E', // burnished champagne gold
  '#1E293B', // deep obsidian slate
  '#0F766E', // teal jade
  '#64748B', // cool slate
  '#9A3412', // dark terracotta ochre
  '#0369A1', // deep sapphire
  '#475569', // charcoal slate
  '#059669', // vibrant emerald
  '#78716C', // warm stone
];
