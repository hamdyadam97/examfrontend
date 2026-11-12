import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, HelpCircle, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Package } from '@/types/package';
import { examTheme } from './examTheme';
import { formatPrice, getAccessPeriod } from './packageFormat';

interface Sample {
  id: number;
  text: string;
  options: string[];
}

interface Props {
  packageId: number;
  open: boolean;
  onClose: () => void;
  onSubscribe?: () => void;
}

const LETTERS = 'ABCDEFGHIJ';

/** Package details plus a few real questions from its bank (answers are not shown). */
export function PackagePreviewModal({ packageId, open, onClose, onSubscribe }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<{ package: Package; samples: Sample[] } | null>(null);
  const [failed, setFailed] = useState(false);
  // The latest onClose without re-running the effect (callers pass a new function on every render).
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    api.get(`/packages/${packageId}/preview`)
      .then((res) => { if (!cancelled) { setData(res.data?.data); setFailed(false); } })
      .catch(() => { if (!cancelled) setFailed(true); });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      cancelled = true;
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, packageId]);

  const pkg = data?.package;
  const theme = examTheme(pkg?.category?.path ?? []);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={pkg?.name || t('packageCard.preview', 'Preview')}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-3xl"
          >
            <div className="relative overflow-hidden px-6 pb-6 pt-5 text-white">
              <img src={pkg?.logo || theme.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/95 via-secondary/70 to-secondary/40" />
              <button type="button" onClick={onClose} aria-label={t('common.close', 'Close')} className="absolute end-4 top-4 z-10 rounded-full bg-white/20 p-1.5 hover:bg-white/30">
                <X size={18} />
              </button>
                            {pkg ? (
                <div className="relative">
                  <p className="text-sm font-semibold text-white/85">{pkg.category?.path?.join(' › ')}</p>
                  <h2 className="mt-1 pe-10 text-2xl font-extrabold">{pkg.name}</h2>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
                      <Calendar size={14} /> {getAccessPeriod(pkg.period_days, t)}
                    </span>
                    {(pkg.questions_count ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1">
                        <HelpCircle size={14} /> {(pkg.number_of_questions || pkg.questions_count || 0).toLocaleString()} {t('common.questions', 'Questions')}
                      </span>
                    )}
                    <span className="rounded-full bg-white px-3 py-1 font-extrabold text-secondary">
                      {formatPrice(pkg.price)} {t('packageCard.currency', 'JOD')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-24" />
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <h3 className="font-extrabold text-secondary dark:text-white">{t('packagePreview.samples', 'Sample questions from this package')}</h3>
              {!data && !failed && (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={30} /></div>
              )}
              {failed && <p className="py-8 text-center text-slate-500">{t('packages.loadError', 'We could not load the packages. Please try again.')}</p>}
              {data && data.samples.length === 0 && (
                <p className="py-8 text-center text-slate-500">{t('packagePreview.noSamples', 'Sample questions will be available soon.')}</p>
              )}
              <ol className="mt-4 space-y-5">
                {data?.samples.map((s, i) => (
                  <li key={s.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                    <p className="mb-2 text-xs font-bold text-primary">{t('packagePreview.question', { n: i + 1, defaultValue: 'Question {{n}}' })}</p>
                    <div className="prose prose-sm max-w-none text-secondary dark:prose-invert dark:text-white" dangerouslySetInnerHTML={{ __html: s.text }} />
                    <ul className="mt-3 space-y-2">
                      {s.options.map((o, j) => (
                        <li key={j} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-secondary shadow-sm dark:bg-slate-700 dark:text-white">{LETTERS[j]}</span>
                          <span className="min-w-0 flex-1 [&_img]:max-h-40" dangerouslySetInnerHTML={{ __html: o }} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
              {data && data.samples.length > 0 && (
                <p className="mt-4 text-center text-xs text-slate-500">{t('packagePreview.answersHint', 'Answers and explanations are available after subscribing.')}</p>
              )}
            </div>

            {onSubscribe && (
              <div className="border-t border-slate-100 p-4 dark:border-slate-700">
                <button type="button" onClick={onSubscribe} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90">
                  {t('packageCard.subscribe', 'Subscribe')}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
