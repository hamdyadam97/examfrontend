import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, HelpCircle, Loader2, Lock, ShieldCheck, Tag, X } from 'lucide-react';
import { api, type ApiError } from '@/lib/api';
import type { RootState } from '@/store';
import type { Package } from '@/types/package';
import { examTheme } from '@/components/packages/examTheme';
import { formatPrice, getAccessPeriod } from '@/components/packages/packageFormat';
import { HyperPayForm } from './HyperPayForm';

interface Props {
  pkg: Package | null;
  onClose: () => void;
}

interface Checkout {
  paymentId: string;
  widgetUrl: string;
  brands: string;
  amount: string;
}

type Step = 'summary' | 'card' | 'done';

/** Subscribe to a package without leaving the page: summary and coupon, then the card form. */
export function CheckoutModal({ pkg, onClose }: Props) {
  const open = !!pkg;
  return createPortal(
    <AnimatePresence>{open && <CheckoutDialog key={pkg.id} pkg={pkg} onClose={onClose} />}</AnimatePresence>,
    document.body,
  );
}

function CheckoutDialog({ pkg, onClose }: { pkg: Package; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const navigate = useNavigate();
  const authenticated = useSelector((state: RootState) => state.auth.authenticated);

  const [step, setStep] = useState<Step>('summary');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState<{ code: string; amount: number; total: number } | null>(null);
  const [couponError, setCouponError] = useState<string>();
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; link?: { to: string; label: string } }>();
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [formReady, setFormReady] = useState(false);

  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  // Never leave the spinner over the card form if HyperPay does not report it ready.
  useEffect(() => {
    if (step !== 'card') return;
    const timer = setTimeout(() => setFormReady(true), 8000);
    return () => clearTimeout(timer);
  }, [step]);

  const theme = examTheme(pkg.category?.path ?? []);
  const price = Number(pkg.price) || 0;
  const total = discount ? discount.total : price;
  const currency = t('packageCard.currency', 'JOD');
  const questions = pkg.number_of_questions || pkg.questions_count || 0;

  const applyCoupon = async () => {
    if (!coupon.trim() || checkingCoupon) return;
    if (!authenticated) return goLogin();
    setCheckingCoupon(true);
    setCouponError(undefined);
    try {
      const res = await api.post('/packages/check-coupon', { coupon: coupon.trim(), package_id: pkg.id });
      const d = res.data?.data;
      setDiscount({ code: d.coupon, amount: Number(d.discount) || 0, total: Number(d.final_price) || 0 });
    } catch (err) {
      setDiscount(null);
      // The server says why: not_found, inactive, not_started, expired, used_up.
      const reason = (err as ApiError | undefined)?.errors?.reason?.[0];
      setCouponError(t(`checkout.couponReason.${reason}`, { defaultValue: t('checkout.couponInvalid', 'This discount code is not valid.') }));
    } finally {
      setCheckingCoupon(false);
    }
  };

  const goLogin = () => {
    onClose();
    navigate('/login', { state: { from: '/packages' } });
  };

  const proceed = async () => {
    if (!authenticated) return goLogin();
    setBusy(true);
    setError(undefined);
    try {
      const res = await api.post('/packages/subscribe', { package_id: pkg.id, ...(discount ? { coupon: discount.code } : {}) });
      const data = res.data?.data;
      if (data?.subscription) {
        setStep('done');
        return;
      }
      const paymentId: string | undefined = data?.checkout?.payment_id;
      if (!paymentId) throw new Error('no checkout');
      const info = (await api.get(`/payment/info?id=${encodeURIComponent(paymentId)}`)).data?.data;
      if (!info?.widget_url) throw new Error('no widget');
      setCheckout({ paymentId, widgetUrl: info.widget_url, brands: info.brands, amount: String(info.amount) });
      setStep('card');
    } catch (err) {
      const errors = (err as ApiError | undefined)?.errors || {};
      if (errors.profile) {
        setError({ text: t('checkout.profileIncomplete', 'Please complete your profile before subscribing.'), link: { to: '/user/settings', label: t('checkout.completeProfile', 'Complete profile') } });
      } else if (errors.payment) {
        setError({ text: t('checkout.paymentUnavailable', 'Online payment is not available right now. Please contact us to subscribe.'), link: { to: '/contact', label: t('common.contact', 'Contact us') } });
      } else {
        setError({ text: t('checkout.failed', 'We could not start the payment. Please try again.') });
      }
    } finally {
      setBusy(false);
    }
  };

  const Back = isRtl ? ArrowRight : ArrowLeft;

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t('checkout.title', 'Subscribe')}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900 sm:rounded-3xl md:flex-row"
      >
        {/* Order summary */}
        <aside className="relative shrink-0 overflow-hidden text-white md:w-[42%]">
          <img src={pkg.logo || theme.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/85 to-secondary/50" />
          <div className="relative flex h-full flex-col p-6">
            <button type="button" onClick={onClose} aria-label={t('common.close', 'Close')} className="absolute end-4 top-4 rounded-full bg-white/20 p-1.5 hover:bg-white/30 md:hidden">
              <X size={18} />
            </button>
            <p className="text-sm font-semibold text-white/80">{pkg.category?.path?.join(' › ')}</p>
            <h2 className="mt-1 pe-8 text-2xl font-extrabold leading-snug">{pkg.name}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2"><Calendar size={16} /> {t('packageCard.accessFor', { period: getAccessPeriod(pkg.period_days, t), defaultValue: 'Access for {{period}}' })}</li>
              {questions > 0 && <li className="flex items-center gap-2"><HelpCircle size={16} /> {questions.toLocaleString()} {t('common.questions', 'Questions')}</li>}
              <li className="flex items-center gap-2"><ShieldCheck size={16} /> {t('checkout.instant', 'Access opens as soon as the payment is confirmed')}</li>
            </ul>
            <div className="mt-auto space-y-2 rounded-2xl bg-white/10 p-4 text-sm backdrop-blur">
              <div className="flex justify-between"><span>{t('checkout.price', 'Price')}</span><span>{formatPrice(price)} {currency}</span></div>
              {discount && (
                <div className="flex justify-between text-emerald-300"><span>{t('checkout.discount', 'Discount')} ({discount.code})</span><span>-{formatPrice(discount.amount)} {currency}</span></div>
              )}
              <div className="flex justify-between border-t border-white/20 pt-2 text-lg font-extrabold">
                <span>{t('checkout.total', 'Total')}</span><span>{formatPrice(total)} {currency}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Steps */}
        <section className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-6 sm:p-8">
          <button type="button" onClick={onClose} aria-label={t('common.close', 'Close')} className="absolute end-4 top-4 hidden rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-secondary md:block dark:hover:bg-slate-800">
            <X size={20} />
          </button>

          <ol className="mb-6 flex items-center gap-3 text-xs font-bold">
            {(['summary', 'card'] as const).map((s, i) => {
              const active = step === s || (step === 'done' && s === 'card');
              const doneStep = step === 'card' && s === 'summary';
              return (
                <li key={s} className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${active || doneStep ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{i + 1}</span>
                  <span className={active ? 'text-secondary dark:text-white' : 'text-slate-400'}>{s === 'summary' ? t('checkout.stepReview', 'Review') : t('checkout.stepPay', 'Payment')}</span>
                  {i === 0 && <span className="mx-1 h-px w-8 bg-slate-200 dark:bg-slate-700" />}
                </li>
              );
            })}
          </ol>

          {step === 'summary' && (
            <div className="flex flex-1 flex-col">
              <h3 className="text-xl font-extrabold text-secondary dark:text-white">{t('checkout.reviewTitle', 'Review your subscription')}</h3>
              <p className="mt-1 text-sm text-slate-500">{t('checkout.reviewHint', 'Have a discount code? Apply it before paying.')}</p>

              <label htmlFor="checkout-coupon" className="mt-6 block text-sm font-bold text-secondary dark:text-white">{t('checkout.coupon', 'Discount code')}</label>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Tag size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="checkout-coupon"
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value); setCouponError(undefined); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(); }}
                    placeholder={t('checkout.couponPlaceholder', 'Enter the code')}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white ps-9 pe-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <button type="button" onClick={applyCoupon} disabled={!coupon.trim() || checkingCoupon} className="h-12 rounded-xl border-2 border-secondary px-5 text-sm font-bold text-secondary transition hover:bg-secondary hover:text-white disabled:opacity-50 dark:border-white dark:text-white">
                  {checkingCoupon ? <Loader2 size={16} className="animate-spin" /> : t('checkout.apply', 'Apply')}
                </button>
              </div>
              {couponError && <p role="alert" className="mt-2 text-sm text-red-500">{couponError}</p>}
              {discount && <p className="mt-2 text-sm font-semibold text-emerald-600">{t('checkout.couponApplied', 'Discount applied.')}</p>}

              {error && (
                <div role="alert" className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                  {error.text}
                  {error.link && <Link to={error.link.to} onClick={onClose} className="ms-2 font-bold underline">{error.link.label}</Link>}
                </div>
              )}

              <div className="mt-auto pt-8">
                <button type="button" onClick={proceed} disabled={busy} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-secondary to-primary text-base font-bold text-white shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-60">
                  {busy && <Loader2 size={18} className="animate-spin" />}
                  {!authenticated
                    ? t('checkout.loginToContinue', 'Log in to continue')
                    : total > 0
                      ? t('checkout.continueToPay', { amount: `${formatPrice(total)} ${currency}`, defaultValue: 'Continue to pay {{amount}}' })
                      : t('checkout.activate', 'Activate subscription')}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500"><Lock size={12} /> {t('payment.secureNote')}</p>
              </div>
            </div>
          )}

          {step === 'card' && checkout && (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-secondary dark:text-white">{t('checkout.cardTitle', 'Card details')}</h3>
                <button type="button" onClick={() => setStep('summary')} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                  <Back size={14} /> {t('common.previous', 'Back')}
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t('checkout.cardHint', 'Visa and Mastercard are accepted. Your card details go directly to the bank.')}</p>
              <div className="relative mt-5 min-h-[260px] rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                {!formReady && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-slate-900/70"><Loader2 className="animate-spin text-primary" size={28} /></div>}
                <HyperPayForm widgetUrl={checkout.widgetUrl} brands={checkout.brands} paymentId={checkout.paymentId} onReady={() => setFormReady(true)} />
              </div>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500"><Lock size={12} /> {t('payment.secureNote')}</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 size={56} className="text-emerald-500" />
              <h3 className="mt-4 text-2xl font-extrabold text-secondary dark:text-white">{t('payment.success')}</h3>
              <Link to="/user/exam/create" onClick={onClose} className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">
                {t('payment.startExam')}
              </Link>
            </div>
          )}
        </section>
      </motion.div>
    </motion.div>
  );
}
