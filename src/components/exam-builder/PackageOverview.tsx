import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Layers, Clock, ArrowUpCircle, Lock } from 'lucide-react';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';

interface Props {
  name: string;
  /** Question allowance of the package; null means unlimited. */
  total: number | null;
  used: number;
  expiry?: string | null;
}

export function PackageOverview({ name, total, used, expiry }: Props) {
  const { t } = useTranslation();
  const limited = typeof total === 'number' && total > 0;
  const remaining = limited ? Math.max(total - used, 0) : null;
  const percent = limited ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#0a1f5c] to-primary p-6 text-white shadow-2xl md:p-8">
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <Package size={28} />
          </div>
          <div>
            <p className="text-sm text-white/70">{t('examBuilder.packageOverview.packageName')}</p>
            <h2 className="text-2xl font-extrabold">{name}</h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
            <p className="text-2xl font-extrabold">{limited ? <AnimatedCounter value={total} /> : '∞'}</p>
            <p className="text-xs text-white/70">{t('examBuilder.packageOverview.totalQuestions')}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
            <p className="text-2xl font-extrabold"><AnimatedCounter value={used} /></p>
            <p className="text-xs text-white/70">{t('examBuilder.packageOverview.usedQuestions')}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur-sm">
            <p className="text-2xl font-extrabold">{remaining !== null ? <AnimatedCounter value={remaining} /> : '∞'}</p>
            <p className="text-xs text-white/70">{t('examBuilder.packageOverview.remainingQuestions')}</p>
          </div>
        </div>

        <div className="min-w-[220px]">
          {limited && (
            <>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-white/80"><Layers size={14} /> {t('examBuilder.packageOverview.usedQuestions')}</span>
                <span className="font-bold">{percent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${percent}%` }} />
              </div>
            </>
          )}
          {expiry && (
            <p className="mt-2 flex items-center gap-1 text-xs text-white/70">
              <Clock size={12} /> {t('examBuilder.packageOverview.expiryDate')}: {expiry}
            </p>
          )}
          <Link
            to="/packages"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-sm transition hover:bg-white/20"
          >
            <ArrowUpCircle size={14} /> {t('examBuilder.packageOverview.upgrade')}
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-16 -start-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 -end-16 h-48 w-48 rounded-full bg-teal-300/10 blur-3xl" />
    </div>
  );
}

/** Shown in place of the package overview when the student has no active subscription. */
export function NoSubscriptionNotice() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-amber-200 bg-amber-50 p-6 text-center md:flex-row md:p-8 md:text-start dark:border-amber-900/50 dark:bg-amber-900/20">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/40">
        <Lock size={26} />
      </div>
      <div className="flex-1">
        <h2 className="text-lg font-extrabold text-secondary dark:text-white">
          {t('examBuilder.noSubscription.title', 'You have no active subscription')}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {t('examBuilder.noSubscription.subtitle', 'Subscribe to a package to unlock its question bank and start building exams.')}
        </p>
      </div>
      <Link to="/packages" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90">
        {t('examBuilder.noSubscription.cta', 'View Packages')}
      </Link>
    </div>
  );
}
