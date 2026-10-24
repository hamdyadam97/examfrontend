import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gift, Percent, Star, Package, ArrowRight } from 'lucide-react';
import { SectionCard } from './SectionCard';
import type { StudentInsights } from '@/types/insights';

const gradients = ['from-rose-500 to-pink-600', 'from-primary to-teal-500', 'from-amber-500 to-orange-600', 'from-blue-500 to-indigo-600'];
const icons = [Gift, Percent, Star, Package];

interface Props {
  offers: StudentInsights['offers'];
}

/** Packages the student is not subscribed to yet, biggest discount first. */
export function OffersSection({ offers }: Props) {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('dashboard.offers.title')} className="lg:col-span-1">
      {offers.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 py-10 text-center dark:bg-slate-700/30">
          <Gift className="mx-auto mb-3 text-slate-400" size={36} />
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.offers.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Link
                key={offer.id}
                to="/packages"
                className={`group flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r ${gradients[i % gradients.length]} p-4 text-white shadow-md transition hover:shadow-lg`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{offer.name}</p>
                    <p className="text-xs text-white/80">
                      {offer.discount_percentage > 0
                        ? t('dashboard.offers.discount', { percent: offer.discount_percentage })
                        : offer.category || ''}
                    </p>
                  </div>
                </div>
                <ArrowRight size={18} className="shrink-0 transition group-hover:translate-x-1 rtl:rotate-180" />
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
