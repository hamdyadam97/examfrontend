import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, PackageOpen } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { CustomPackageCard } from '@/components/packages/CustomPackageCard';
import { PackageCard } from '@/components/packages/PackageCard';
import type { Package } from '@/types/package';
import type { RootState } from '@/store';

export function PackagesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authenticated = useSelector((state: RootState) => state.auth.authenticated);
  const [packages, setPackages] = useState<Package[]>([]);
  const [subscribingId, setSubscribingId] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    api.get('/packages/index')
      .then((res) => {
        setPackages(res.data?.data?.packages || []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const handleSubscribe = async (pkg: Package, customDays?: number) => {
    if (!authenticated) {
      navigate('/login');
      return;
    }
    setSubscribingId(pkg.id);
    try {
      const payload: { package_id: number; custom_days?: number } = { package_id: pkg.id };
      if (pkg.is_custom && customDays) {
        payload.custom_days = customDays;
      }
      const res = await api.post('/packages/subscribe', payload);
      const data = res.data?.data;
      if (data?.subscription) {
        toast.success(t('packages.subscribeSuccess', 'Subscribed successfully!'));
      } else if (data?.checkout?.url) {
        navigate(data.checkout.url);
      } else {
        toast.info(t('packages.paymentNotConfigured', 'Redirect to payment (gateway not configured).'));
      }
    } catch (err) {
      const msg = apiErrorMessage(err) || t('packages.subscribeError', 'Subscription failed.');
      toast.error(msg);
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

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-secondary sm:text-4xl">{t('common.packages')}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            {t('packages.subtitle', 'Choose a premium package and start preparing for your medical exams.')}
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, idx) =>
            pkg.is_custom ? (
              <CustomPackageCard key={pkg.id} pkg={pkg} onSubscribe={handleSubscribe} subscribingId={subscribingId} />
            ) : (
              <PackageCard key={pkg.id} pkg={pkg} index={idx} onSubscribe={(p) => handleSubscribe(p)} subscribingId={subscribingId} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
