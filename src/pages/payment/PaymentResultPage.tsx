import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

type Status = 'checking' | 'paid' | 'pending' | 'failed';

const RETRY_MS = 3000;
const MAX_RETRIES = 10;

/** HyperPay sends the shopper here after paying; our server asks HyperPay whether it really succeeded. */
export function PaymentResultPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('id') || '';
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const check = () => {
      api.post('/payment/confirm', { payment_id: paymentId })
        .then((res) => {
          if (cancelled) return;
          const next: Status = res.data?.data?.status === 'paid' ? 'paid' : 'pending';
          setStatus(next);
          // Some card payments take a few seconds to settle at the gateway.
          if (next === 'pending' && ++attempts < MAX_RETRIES) timer = setTimeout(check, RETRY_MS);
        })
        .catch(() => {
          if (!cancelled) setStatus('failed');
        });
    };
    check();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [paymentId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        {status === 'checking' || status === 'pending' ? (
          <>
            <Loader2 className="mx-auto mb-4 animate-spin text-primary" size={44} />
            <h1 className="text-xl font-extrabold text-secondary">{t('payment.verifying')}</h1>
            {status === 'pending' && <p className="mt-2 text-sm text-slate-500">{t('payment.pending')}</p>}
          </>
        ) : status === 'paid' ? (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-emerald-500" size={52} />
            <h1 className="text-xl font-extrabold text-secondary">{t('payment.success')}</h1>
            <Link to="/user/exam/create" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">
              {t('payment.startExam')}
            </Link>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-4 text-rose-500" size={52} />
            <h1 className="text-xl font-extrabold text-secondary">{t('payment.failed')}</h1>
            <p className="mt-2 text-sm text-slate-500">{t('payment.failedHint')}</p>
            <Link to="/packages" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">
              {t('payment.backToPackages')}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
