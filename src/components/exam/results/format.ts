import type { TFunction } from 'i18next';

/** 75 -> "1:15" (or "1:02:05" past an hour). */
export function clock(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) return '—';
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** 45 -> "45 s", 130 -> "2 min 10 s". */
export function duration(seconds: number | null | undefined, t: TFunction) {
  if (seconds === null || seconds === undefined) return '—';
  const s = Math.round(seconds);
  if (s < 60) return `${s} ${t('results.units.sec', 's')}`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest ? `${m} ${t('results.units.min', 'min')} ${rest} ${t('results.units.sec', 's')}` : `${m} ${t('results.units.min', 'min')}`;
}

export const percent = (value: number | null | undefined) => (value === null || value === undefined ? '—' : `${value}%`);
