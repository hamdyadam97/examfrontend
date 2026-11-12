import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { motion } from 'framer-motion';
import { HelpCircle, Calendar, Users, Award, Sparkles, ArrowRight, Stethoscope, Loader2 } from 'lucide-react';
import type { Package } from '@/types/package';

interface PackageCardProps {
  pkg: Package;
  index?: number;
  onSubscribe?: (pkg: Package) => void;
  subscribingId?: number | null;
  /** Hide the category badge when the card already sits under its category heading. */
  hideCategory?: boolean;
}

/** 14 -> "14", 14.5 -> "14.50". */
function formatPrice(value: string | number | undefined | null) {
  const num = typeof value === 'string' ? parseFloat(value) : value ?? 0;
  if (Number.isNaN(num)) return '0';
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
}

function getAccessPeriod(days: number | null | undefined, t: TFunction) {
  if (!days) return t('packageCard.lifetime', 'Lifetime');
  if (days >= 365 && days % 365 === 0) {
    const years = days / 365;
    return `${years} ${t(years === 1 ? 'packageCard.year' : 'packageCard.years', years === 1 ? 'Year' : 'Years')}`;
  }
  return `${days} ${t('packageCard.days', 'days')}`;
}

export function PackageCard({ pkg, index = 0, onSubscribe, subscribingId = null, hideCategory = false }: PackageCardProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const subscribing = subscribingId === pkg.id;

  const coverUrl = pkg.logo || pkg.icon;
  const categoryName = pkg.category?.name;
  const hasDiscount = !!pkg.discount_percentage && pkg.discount_percentage > 0;
  const questions = pkg.number_of_questions || pkg.questions_count || 0;
  const students = pkg.students_count ?? 0;
  const currency = t('packageCard.currency', 'JOD');

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.06 }}
      whileHover={{ y: -6 }}
      className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
    >
      {coverUrl ? (
        <div className="relative h-40 overflow-hidden bg-slate-100">
          <img src={coverUrl} alt={pkg.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        </div>
      ) : (
        <div className="relative flex h-20 items-center justify-between bg-gradient-to-l from-primary/15 to-secondary/10 px-5 text-primary">
          <Stethoscope size={30} />
          <span className="text-3xl font-black text-secondary/80 dark:text-white/80">
            {getAccessPeriod(pkg.period_days, t)}
          </span>
        </div>
      )}

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {!hideCategory && categoryName && (
            <span className="w-fit rounded-full bg-secondary/5 px-3 py-1 text-xs font-bold text-secondary dark:bg-white/10 dark:text-white">
              {categoryName}
            </span>
          )}
          {pkg.is_bestseller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-white">
              <Award size={12} /> {t('packageCard.bestSeller', 'Best Seller')}
            </span>
          )}
          {pkg.is_new && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
              <Sparkles size={12} /> {t('packageCard.new', 'New')}
            </span>
          )}
        </div>

        <h3 className="text-lg font-extrabold leading-snug text-secondary transition-colors duration-300 group-hover:text-primary dark:text-white">
          {pkg.name}
        </h3>
        {pkg.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{pkg.description}</p>}

        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {questions > 0 && (
            <div className="flex items-center gap-2">
              <HelpCircle size={15} className="text-primary" />
              <span>
                {pkg.number_of_questions
                  ? t('packageCard.questionsLimit', { n: questions.toLocaleString(), defaultValue: 'Up to {{n}} questions' })
                  : t('packageCard.questionsBank', { n: questions.toLocaleString(), defaultValue: '{{n}} questions in the bank' })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-primary" />
            <span>{t('packageCard.accessFor', { period: getAccessPeriod(pkg.period_days, t), defaultValue: 'Access for {{period}}' })}</span>
          </div>
          {students > 0 && (
            <div className="flex items-center gap-2">
              <Users size={15} className="text-primary" />
              <span>{students.toLocaleString()} {t('packageCard.enrolled', 'enrolled')}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-5">
          <div className="flex items-end gap-3">
            <p className="text-2xl font-extrabold text-primary">
              {formatPrice(pkg.price)} <span className="text-base font-bold">{currency}</span>
            </p>
            {hasDiscount && (
              <>
                <p className="mb-1 text-sm font-medium text-slate-400 line-through">{formatPrice(pkg.original_price)} {currency}</p>
                <span className="mb-1 rounded bg-rose-50 px-1.5 py-0.5 text-xs font-bold text-rose-600">-{pkg.discount_percentage}%</span>
              </>
            )}
          </div>

          <div className="mt-4">
            {onSubscribe ? (
              <button
                type="button"
                disabled={subscribing}
                onClick={() => onSubscribe(pkg)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg disabled:opacity-60"
              >
                {subscribing && <Loader2 size={16} className="animate-spin" />}
                {t('packageCard.subscribe', 'Subscribe')}
              </button>
            ) : (
              <Link
                to="/packages"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
              >
                {t('packageCard.viewPackage', 'View Package')}
                <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
