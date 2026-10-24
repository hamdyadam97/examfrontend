import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, RefreshCw, ArrowUpCircle, Lock } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { AnimatedCounter } from './AnimatedCounter';
import type { StudentSubscription } from '@/types/insights';

interface Props {
  subscription: StudentSubscription | null;
}

export function SubscriptionCard({ subscription }: Props) {
  const { t } = useTranslation();

  if (!subscription) {
    return (
      <SectionCard title={t('dashboard.subscription.title')} className="lg:col-span-1">
        <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-700/30">
          <Lock className="mb-3 text-slate-400" size={36} />
          <p className="font-bold text-secondary dark:text-white">{t('examBuilder.noSubscription.title')}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('examBuilder.noSubscription.subtitle')}</p>
          <Link to="/packages" className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
            {t('examBuilder.noSubscription.cta')}
          </Link>
        </div>
      </SectionCard>
    );
  }

  const included = subscription.package?.number_of_questions || null;
  const used = subscription.questions_used;
  const remaining = included ? Math.max(included - used, 0) : null;
  const percent = included ? Math.min(100, Math.round((used / included) * 100)) : 0;

  return (
    <SectionCard title={t('dashboard.subscription.title')} className="lg:col-span-1">
      <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-teal-50 p-5 dark:from-primary/10 dark:to-slate-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.subscription.packageName')}</p>
            <p className="text-lg font-extrabold text-secondary dark:text-white">{subscription.package?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-slate-800">
            <p className="text-xl font-extrabold text-secondary dark:text-white">
              {included ? <AnimatedCounter value={included} /> : '∞'}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('dashboard.subscription.questionsIncluded')}</p>
          </div>
          <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-slate-800">
            <p className="text-xl font-extrabold text-primary">
              {remaining !== null ? <AnimatedCounter value={remaining} /> : '∞'}
            </p>
            <p className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{t('dashboard.remainingQuestions')}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400">{t('dashboard.questionsUsed')}</span>
            <span className="text-secondary dark:text-white">{included ? `${percent}%` : used}</span>
          </div>
          {included && (
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400" style={{ width: `${percent}%` }} />
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {t('dashboard.subscriptionExpiry')}: <span className="font-bold text-secondary dark:text-white">{subscription.end_date || '-'}</span>
        </p>

        <div className="mt-5 flex gap-3">
          <Link to="/user/subscriptions" className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-secondary transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <RefreshCw size={16} /> {t('dashboard.subscription.renew')}
          </Link>
          <Link to="/packages" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition hover:bg-primary/90">
            <ArrowUpCircle size={16} /> {t('dashboard.subscription.upgrade')}
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
