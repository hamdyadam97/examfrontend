import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, PackageOpen, Search } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { CustomPackageCard } from '@/components/packages/CustomPackageCard';
import { PackageCard } from '@/components/packages/PackageCard';
import { CheckoutModal } from '@/components/payment/CheckoutModal';
import type { Package } from '@/types/package';
import type { RootState } from '@/store';

const PAGE_SIZE = 9;

/** Path of a package's category: [exam, specialty, ...]. */
const pathOf = (pkg: Package) => (pkg.category?.path?.length ? pkg.category.path : [pkg.category?.name || '']);

export function PackagesPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const navigate = useNavigate();
  const authenticated = useSelector((state: RootState) => state.auth.authenticated);
  const [packages, setPackages] = useState<Package[]>([]);
  const [subscribingId, setSubscribingId] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [checkoutPkg, setCheckoutPkg] = useState<Package | null>(null);
  const gridTop = useRef<HTMLDivElement>(null);

  // Filters live in the address (?exam=&specialty=&q=&page=) so a filtered page can be shared or reloaded.
  const [params, setParams] = useSearchParams();
  const exam = params.get('exam') || '';
  const specialty = params.get('specialty') || '';
  const query = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const setFilter = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    api.get('/packages/index')
      .then((res) => {
        setPackages(res.data?.data?.packages || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const exams = useMemo(() => {
    const counts = new Map<string, number>();
    packages.forEach((p) => counts.set(pathOf(p)[0], (counts.get(pathOf(p)[0]) || 0) + 1));
    return [...counts.entries()];
  }, [packages]);

  const specialties = useMemo(() => {
    if (!exam) return [];
    const names = new Set<string>();
    packages.forEach((p) => {
      const path = pathOf(p);
      if (path[0] === exam && path[1]) names.add(path[1]);
    });
    return [...names];
  }, [packages, exam]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter((p) => {
      const path = pathOf(p);
      if (exam && path[0] !== exam) return false;
      if (specialty && path[1] !== specialty) return false;
      if (q && !`${p.name} ${path.join(' ')}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [packages, exam, specialty, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const goToPage = (n: number) => {
    setFilter({ page: n > 1 ? String(n) : '' });
    gridTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Custom packages (days chosen by the student) keep their direct flow; every other package opens the checkout.
  const subscribeCustom = async (pkg: Package, customDays?: number) => {
    if (!authenticated) {
      navigate('/login', { state: { from: '/packages' } });
      return;
    }
    setSubscribingId(pkg.id);
    try {
      const res = await api.post('/packages/subscribe', { package_id: pkg.id, custom_days: customDays });
      const data = res.data?.data;
      if (data?.subscription) toast.success(t('packages.subscribeSuccess', 'Subscribed successfully!'));
      else if (data?.checkout?.url) navigate(data.checkout.url);
    } catch (err) {
      toast.error(apiErrorMessage(err) || t('packages.subscribeError', 'Subscription failed.'));
    } finally {
      setSubscribingId(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
        <div className="max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-soft text-secondary">
            <PackageOpen size={30} />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-secondary dark:text-white">{t('common.packages')}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {status === 'error'
              ? t('packages.loadError', 'We could not load the packages. Please try again.')
              : t('packages.empty', 'New packages are coming soon. Contact us to know about the available offers.')}
          </p>
          {status === 'error' ? (
            <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
              {t('common.retry', 'Try again')}
            </button>
          ) : (
            <Link to="/contact" className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
              {t('common.contact', 'Contact us')}
            </Link>
          )}
        </div>
      </div>
    );
  }

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
      active
        ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
        : 'border-slate-200 bg-white text-secondary hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white'
    }`;
  const subChip = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-bold transition ${
      active ? 'bg-secondary text-white' : 'bg-slate-100 text-secondary hover:bg-slate-200 dark:bg-slate-700 dark:text-white'
    }`;
  const pageBtn = 'flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-secondary transition hover:border-primary hover:text-primary disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white sm:text-4xl">{t('common.packages')}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            {t('packages.subtitle', 'Choose a premium package and start preparing for your medical exams.')}
          </p>
        </div>

        {/* Filters */}
        <div ref={gridTop} className="mb-6 scroll-mt-28 space-y-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setFilter({ q: e.target.value })}
              placeholder={t('packages.searchPlaceholder', 'Search packages...')}
              aria-label={t('packages.searchPlaceholder', 'Search packages...')}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 ps-11 pe-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label={t('packages.filterExam', 'Exam')}>
            <button type="button" role="tab" aria-selected={!exam} onClick={() => setFilter({ exam: '', specialty: '' })} className={chip(!exam)}>
              {t('packages.allExams', 'All exams')} <span className="opacity-70">({packages.length})</span>
            </button>
            {exams.map(([name, count]) => (
              <button key={name} type="button" role="tab" aria-selected={exam === name} onClick={() => setFilter({ exam: name, specialty: '' })} className={chip(exam === name)}>
                {name} <span className="opacity-70">({count})</span>
              </button>
            ))}
          </div>
          {specialties.length > 1 && (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
              <button type="button" onClick={() => setFilter({ specialty: '' })} className={subChip(!specialty)}>
                {t('packages.allSpecialties', 'All specialties')}
              </button>
              {specialties.map((name) => (
                <button key={name} type="button" onClick={() => setFilter({ specialty: name })} className={subChip(specialty === name)}>
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mb-4 text-sm text-slate-500">{t('packages.resultsCount', { count: filtered.length, defaultValue: '{{count}} packages' })}</p>

        {shown.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 dark:border-slate-700">
            {t('packages.noResults', 'No packages match your search.')}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((pkg, idx) =>
              pkg.is_custom ? (
                <CustomPackageCard key={pkg.id} pkg={pkg} onSubscribe={subscribeCustom} subscribingId={subscribingId} />
              ) : (
                <PackageCard key={pkg.id} pkg={pkg} index={idx} onSubscribe={setCheckoutPkg} subscribingId={subscribingId} />
              ),
            )}
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label={t('packages.pagination', 'Pages')}>
            <button type="button" disabled={current === 1} onClick={() => goToPage(current - 1)} aria-label={t('common.previous', 'Previous')} className={pageBtn}>
              {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => goToPage(n)}
                aria-current={n === current ? 'page' : undefined}
                className={n === current ? 'h-10 min-w-10 rounded-xl bg-primary px-3 text-sm font-bold text-white shadow-md shadow-primary/25' : `${pageBtn} min-w-10 text-sm font-bold`}
              >
                {n}
              </button>
            ))}
            <button type="button" disabled={current === pages} onClick={() => goToPage(current + 1)} aria-label={t('common.next', 'Next')} className={pageBtn}>
              {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </nav>
        )}
      </div>

      <CheckoutModal pkg={checkoutPkg} onClose={() => setCheckoutPkg(null)} />
    </div>
  );
}
