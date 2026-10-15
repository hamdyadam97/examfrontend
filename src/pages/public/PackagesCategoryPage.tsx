import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutGrid,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';
import { api } from '@/lib/api';
import { CustomPackageCard } from '@/components/packages/CustomPackageCard';
import { PackageCard } from '@/components/packages/PackageCard';
import { getIconForName } from '@/components/exam-builder/iconMap';
import type { Package } from '@/types/package';
import type { RootState } from '@/store';

export function PackagesCategoryPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === 'ar';
  const authenticated = useSelector((state: RootState) => state.auth.authenticated);
  const [category, setCategory] = useState<any>(null);
  const [subscribingId, setSubscribingId] = useState<number | null>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<number | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [packagesLoading, setPackagesLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([api.get(`/categories/${id}/subcategories`), api.get('/categories')])
      .then(([subRes, catRes]) => {
        setSubCategories(subRes.data?.data?.sub_categories || []);
        const cats = catRes.data?.data?.categories || [];
        setCategory(cats.find((c: any) => String(c.id) === id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const loadPackages = (subId: number) => {
    setSelectedSub(subId);
    setPackagesLoading(true);
    api.get(`/subcategories/${subId}/packages`)
      .then((res) => {
        setPackages(res.data?.data?.packages || []);
      })
      .finally(() => setPackagesLoading(false));
  };

  const totalQuestions = useMemo(
    () => subCategories.reduce((acc: number, s: any) => acc + (s.questions_count || 0), 0),
    [subCategories],
  );

  const selectedSubName = subCategories.find((s: any) => s.id === selectedSub)?.name;

  const handleSubscribe = async (pkg: Package, customDays?: number) => {
    if (!authenticated) {
      navigate('/login');
      return;
    }
    setSubscribingId(pkg.id);
    try {
      const payload: any = { package_id: pkg.id };
      if (pkg.is_custom && customDays) {
        payload.custom_days = customDays;
      }
      const res = await api.post('/packages/subscribe', payload);
      const data = res.data?.data;
      if (data?.subscription) {
        toast.success(t('packages.subscribeSuccess', 'Subscribed successfully!'));
      } else if (data?.checkout?.url) {
        window.open(data.checkout.url, '_blank');
      } else {
        toast.info(t('packages.paymentNotConfigured', 'Redirect to payment (gateway not configured).'));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('packages.subscribeError', 'Subscription failed.');
      toast.error(msg);
    } finally {
      setSubscribingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600">{t('packages.categoryNotFound', 'Category not found')}</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          {t('common.back_home', 'Back to home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hero band */}
      <div className="relative overflow-hidden bg-gradient-to-bl from-secondary via-secondary to-primary">
        <div className="pointer-events-none absolute -top-24 -start-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 end-10 h-96 w-96 rounded-full bg-primary/20" />
        <div className="pointer-events-none absolute top-1/3 end-1/3 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-1.5 text-sm font-medium text-white/70">
            <Link to="/" className="transition hover:text-white">
              {t('common.home', 'Home')}
            </Link>
            {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            <Link to="/packages" className="transition hover:text-white">
              {t('common.packages', 'Packages')}
            </Link>
            {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            <span className="text-white">{category.name}</span>
          </nav>

          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{category.name}</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-white/80">
            {category.description || t('packages.chooseSubcategory', 'Choose a subcategory to view available exam packages.')}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
              <LayoutGrid size={14} />
              {subCategories.length} {t('common.subcategories', 'Subcategories')}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">
              <HelpCircle size={14} />
              {totalQuestions} {t('common.questions', 'questions')}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Subcategories */}
        <div className="mt-10">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-secondary">
            <FolderOpen size={20} className="text-primary" />
            {t('common.subcategories', 'Subcategories')}
          </h2>

          {subCategories.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
              {t('packages.noSubcategories', 'No subcategories available.')}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subCategories.map((sub, idx) => {
                const Icon = getIconForName(sub.name);
                const isSelected = selectedSub === sub.id;
                return (
                  <motion.button
                    key={sub.id}
                    type="button"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -6 }}
                    onClick={() => loadPackages(sub.id)}
                    className={clsx(
                      'group relative flex flex-col items-center overflow-hidden rounded-3xl border p-6 pb-5 text-center transition-all duration-300',
                      isSelected
                        ? 'border-primary bg-gradient-to-b from-primary/10 to-transparent shadow-lg ring-2 ring-primary dark:border-primary dark:from-primary/20'
                        : 'border-slate-100 bg-white hover:border-primary/50 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800',
                    )}
                  >
                    <div className="pointer-events-none absolute -end-10 -top-10 h-28 w-28 rounded-full bg-primary/5 transition-colors duration-300 group-hover:bg-primary/10" />

                    {isSelected && (
                      <span className="absolute start-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-md">
                        <Check size={14} />
                      </span>
                    )}

                    <div
                      className={clsx(
                        'relative flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110',
                        isSelected
                          ? 'bg-gradient-to-br from-primary to-primary/70 shadow-primary/40'
                          : 'bg-gradient-to-br from-secondary to-secondary/80 shadow-secondary/30 group-hover:from-primary group-hover:to-primary/70 group-hover:shadow-primary/40',
                      )}
                    >
                      <Icon size={30} />
                    </div>

                    <h3 className="mt-4 text-lg font-extrabold text-secondary transition-colors duration-200 group-hover:text-primary dark:text-white">
                      {sub.name}
                    </h3>

                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary dark:bg-slate-700 dark:text-slate-300">
                      <ClipboardList size={12} />
                      {sub.questions_count} {t('common.questions', 'questions')}
                    </span>

                    <span
                      className={clsx(
                        'mt-4 inline-flex items-center gap-1 text-xs font-bold transition-all duration-200',
                        isSelected
                          ? 'text-primary'
                          : 'translate-y-1 text-slate-400 opacity-0 group-hover:translate-y-0 group-hover:text-primary group-hover:opacity-100',
                      )}
                    >
                      {t('packages.viewPackages', 'عرض الباقات')}
                      {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Packages */}
        <AnimatePresence mode="wait">
          {selectedSub && (
            <motion.div
              key={selectedSub}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mt-14"
            >
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-xl font-bold text-secondary">
                  {t('common.packages', 'Packages')}
                  {selectedSubName && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                      {selectedSubName}
                    </span>
                  )}
                </h2>
              </div>

              {packagesLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-primary" />
                </div>
              ) : packages.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                  {t('packages.noPackages', 'No packages available for this subcategory.')}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {packages.map((pkg, idx) =>
                    pkg.is_custom ? (
                      <CustomPackageCard key={pkg.id} pkg={pkg} onSubscribe={handleSubscribe} subscribingId={subscribingId} />
                    ) : (
                      <PackageCard key={pkg.id} pkg={pkg} index={idx} onSubscribe={(p) => handleSubscribe(p)} subscribingId={subscribingId} />
                    ),
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
