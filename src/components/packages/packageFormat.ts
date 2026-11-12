import type { TFunction } from 'i18next';

/** 14 -> "14", 14.5 -> "14.50". */
export function formatPrice(value: string | number | undefined | null) {
  const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  if (Number.isNaN(num)) return '0';
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

export function getAccessPeriod(days: number | null | undefined, t: TFunction) {
  if (!days) return t('packageCard.lifetime', 'Lifetime');
  if (days >= 365 && days % 365 === 0) {
    const years = days / 365;
    return `${years} ${t(years === 1 ? 'packageCard.year' : 'packageCard.years', years === 1 ? 'Year' : 'Years')}`;
  }
  return `${days} ${t('packageCard.days', 'days')}`;
}
