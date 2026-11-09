import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface PaymentInfo {
  payment_id: string;
  amount: string;
  currency: string;
  is_success: boolean;
  widget_url: string | null;
  brands: string;
  package: { name: string; period_days: number | null } | null;
}

declare global {
  interface Window {
    wpwlOptions?: Record<string, unknown>;
  }
}

/**
 * Shows HyperPay's COPYandPAY card form. The card details go straight to HyperPay; when the
 * shopper submits, HyperPay redirects to /payment/result, where our server verifies the payment.
 */
export function PaymentCheckoutPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('id') || '';
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api.get(`/payment/info?id=${encodeURIComponent(paymentId)}`)
      .then((res) => setInfo(res.data?.data))
      .catch(() => setFailed(true));
  }, [paymentId]);

  // Load HyperPay's widget script once the checkout is known.
  useEffect(() => {
    if (!info?.widget_url) return;
    window.wpwlOptions = { locale: i18n.language === 'ar' ? 'ar' : 'en', style: 'card' };
    const script = document.createElement('script');
    script.src = info.widget_url;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, [info?.widget_url, i18n.language]);

  const resultUrl = `${window.location.origin}/payment/result?id=${encodeURIComponent(paymentId)}`;

  if (failed) {
    return (
      <Shell>
        <p className="text-slate-600">{t('payment.notFound')}</p>
        <Link to="/packages" className="mt-4 inline-block font-bold text-primary hover:underline">{t('payment.backToPackages')}</Link>
      </Shell>
    );
  }

  if (!info) {
    return <Shell><Loader2 className="mx-auto animate-spin text-primary" size={36} /></Shell>;
  }

  if (info.is_success) {
    return (
      <Shell>
        <p className="font-bold text-emerald-600">{t('payment.alreadyPaid')}</p>
        <Link to="/user/dashboard" className="mt-4 inline-block font-bold text-primary hover:underline">{t('payment.goToDashboard')}</Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-start">
        <p className="text-sm text-slate-500">{t('payment.package')}</p>
        <p className="text-lg font-extrabold text-secondary">{info.package?.name}</p>
        <p className="mt-2 text-2xl font-extrabold text-primary">{info.amount} {info.currency}</p>
      </div>
      {info.widget_url ? (
        <form action={resultUrl} className="paymentWidgets" data-brands={info.brands} />
      ) : (
        <p className="text-slate-600">{t('payment.notFound')}</p>
      )}
      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Lock size={14} /> {t('payment.secureNote')}
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck size={24} />
        </div>
        <h1 className="mb-6 text-2xl font-extrabold text-secondary">{t('payment.title')}</h1>
        {children}
      </div>
    </div>
  );
}
