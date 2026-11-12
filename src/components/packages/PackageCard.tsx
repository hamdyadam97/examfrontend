import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HelpCircle, Calendar, Star, Users, Award, Flame, Sparkles, Eye, ArrowRight, Loader2 } from 'lucide-react';
import type { Package } from '@/types/package';
import { examTheme } from './examTheme';
import { formatPrice, getAccessPeriod } from './packageFormat';
import { PackagePreviewModal } from './PackagePreviewModal';

interface PackageCardProps {
  pkg: Package;
  index?: number;
  showPreview?: boolean;
  onSubscribe?: (pkg: Package) => void;
  subscribingId?: number | null;
}

export function PackageCard({ pkg, index = 0, showPreview = true, onSubscribe, subscribingId = null }: PackageCardProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const subscribing = subscribingId === pkg.id;
  const [previewOpen, setPreviewOpen] = useState(false);

  const coverUrl = pkg.logo || pkg.icon;
  const path = pkg.category?.path ?? (pkg.category?.name ? [pkg.category.name] : []);
  const theme = examTheme(path);
  const categoryName = pkg.category?.name || t('packageCard.medical', 'Medical');
  const hasDiscount = !!pkg.discount_percentage && pkg.discount_percentage > 0;
  const questions = pkg.number_of_questions || pkg.questions_count || 0;
  const rating = Number(pkg.rating || 0);
  const students = pkg.students_count ?? 0;
  const currency = t('packageCard.currency', 'JOD');

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.08 }}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800"
    >
      {/* Cover: the package's own image, otherwise the photo of its specialty / exam */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={coverUrl || theme.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
        <span className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-sm font-extrabold text-secondary shadow">
          <Calendar size={14} className="text-primary" /> {getAccessPeriod(pkg.period_days, t)}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-secondary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute start-4 top-4 flex flex-wrap gap-2">
          {pkg.is_bestseller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-white shadow">
              <Award size={12} /> {t('packageCard.bestSeller', 'Best Seller')}
            </span>
          )}
          {pkg.is_new && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white shadow">
              <Sparkles size={12} /> {t('packageCard.new', 'New')}
            </span>
          )}
          {!pkg.is_bestseller && !pkg.is_new && students > 2000 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow">
              <Flame size={12} /> {t('packageCard.popular', 'Popular')}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <span className="mb-3 w-fit rounded-full bg-secondary/5 px-3 py-1 text-xs font-bold text-secondary dark:bg-white/10 dark:text-white">
          {categoryName}
        </span>

        <h3 className="text-xl font-extrabold text-secondary transition-colors duration-300 group-hover:text-primary dark:text-white">
          {pkg.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {pkg.description || t('packageCard.fallbackDescription', 'Comprehensive exam preparation package designed by medical experts.')}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          {questions > 0 && (
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-primary" />
              <span>{questions.toLocaleString()} {t('common.questions', 'Questions')}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary" />
            <span>{getAccessPeriod(pkg.period_days, t)}</span>
          </div>
        </div>

        {(rating > 0 || students > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {rating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 ring-1 ring-inset ring-amber-200">
                <Star size={12} fill="currentColor" /> {rating.toFixed(1)}
              </span>
            )}
            {students > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Users size={12} /> {students.toLocaleString()} {t('packageCard.enrolled', 'enrolled')}
              </span>
            )}
          </div>
        )}

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

          <div className="mt-5 flex items-center gap-3">
            {onSubscribe ? (
              <button
                type="button"
                disabled={subscribing}
                onClick={() => onSubscribe(pkg)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg disabled:opacity-60"
              >
                {subscribing && <Loader2 size={16} className="animate-spin" />}
                {t('packageCard.subscribe', 'Subscribe')}
              </button>
            ) : (
              <Link
                to="/packages"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-lg"
              >
                {t('packageCard.viewPackage', 'View Package')}
                <ArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
              </Link>
            )}
            {showPreview && (
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-secondary transition-all duration-300 hover:border-primary hover:text-primary dark:border-slate-600 dark:text-white"
              >
                <Eye size={16} /> {t('packageCard.preview', 'Preview')}
              </button>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <PackagePreviewModal
          packageId={pkg.id}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          onSubscribe={onSubscribe ? () => { setPreviewOpen(false); onSubscribe(pkg); } : undefined}
        />
      )}
    </motion.div>
  );
}
