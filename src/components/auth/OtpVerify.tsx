import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { CheckCircle2, Loader2, Phone, RotateCw, X, XCircle } from 'lucide-react';
import { resendOtp, verifyOtp } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';
import type { ApiError } from '@/lib/api';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

function maskPhone(value: string) {
  if (value.length <= 6) return value;
  return `${value.slice(0, 4)}${'•'.repeat(Math.min(value.length - 7, 6))}${value.slice(-3)}`;
}

interface CardProps {
  /** Called once the code is accepted; receives whether this was the forgot-password flow. */
  onVerified: (isForget: boolean) => void;
  /** Shown as a close (X) button; used by the modal to go back to the form. */
  onClose?: () => void;
}

/** Six-digit code entry with resend countdown, for the phone saved in the auth store. */
export function OtpVerifyCard({ onVerified, onClose }: CardProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isForget, user } = useSelector((state: RootState) => state.auth);
  const phone = String(user?.phone || user?.mobile || Cookies.get('otp_mobile') || '');

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const counting = timer > 0;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // One interval per countdown; resending resets the timer, which starts a new one.
  useEffect(() => {
    if (!counting) return;
    const id = setInterval(() => setTimer((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(id);
  }, [counting]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const setDigits = (digits: string[], start: number) => {
    setError(null);
    setOtp((prev) => {
      const next = [...prev];
      digits.forEach((d, i) => {
        if (start + i < OTP_LENGTH) next[start + i] = d;
      });
      return next;
    });
    inputRefs.current[Math.min(start + digits.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '').split('');
    if (digits.length) setDigits(digits, index);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return;
    e.preventDefault();
    if (otp[index]) {
      setOtp((prev) => prev.map((d, i) => (i === index ? '' : d)));
    } else if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    if (digits.length) setDigits(digits, 0);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError(t('auth.otpIncomplete', 'Please enter all 6 digits'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await dispatch(verifyOtp({ otp: code, isForget })).unwrap();
      setSuccess(true);
      setTimeout(() => onVerified(isForget), 700);
    } catch (err) {
      const apiErr = err as ApiError;
      setError((apiErr?.statusCode && apiErr?.message) || t('auth.verificationFailed', 'Invalid verification code'));
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (counting) return;
    setResending(true);
    setError(null);
    try {
      await dispatch(resendOtp({ mobile: phone || undefined })).unwrap();
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimer(RESEND_SECONDS);
      inputRefs.current[0]?.focus();
      toast.success(t('auth.codeResent', 'Verification code resent'));
    } catch (err) {
      const apiErr = err as ApiError;
      setError((apiErr?.statusCode && apiErr?.message) || t('auth.resendFailed', 'Failed to resend code'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close', 'Close')}
          className="absolute -end-2 -top-2 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-secondary"
        >
          <X size={20} />
        </button>
      )}

      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-soft to-primary/15 text-secondary">
          <Phone size={28} />
        </div>
        <h2 className="text-2xl font-extrabold text-secondary">{t('auth.verificationCode', 'Verification Code')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('auth.otpSentTo', 'We sent a 6-digit code to')}</p>
        <p className="mt-1 font-bold text-secondary" dir="ltr">{maskPhone(phone)}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex justify-center gap-2" dir="ltr" role="group" aria-label={t('auth.otpLabel', 'One-time password')}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading || success}
              aria-label={`${index + 1}`}
              aria-invalid={!!error}
              className={`h-14 w-11 rounded-2xl border-2 bg-white text-center text-2xl font-bold text-secondary outline-none transition sm:w-12 ${
                error
                  ? 'border-red-300 bg-red-50/50'
                  : success
                    ? 'border-emerald-400 bg-emerald-50/50'
                    : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10'
              } disabled:opacity-60`}
            />
          ))}
        </div>

        {error && (
          <p role="alert" className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
            <XCircle size={16} /> {error}
          </p>
        )}
        {success && (
          <p role="status" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600">
            <CheckCircle2 size={16} /> {t('auth.verificationSuccess', 'Verified successfully')}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || success || otp.join('').length < OTP_LENGTH}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-secondary to-primary text-lg font-bold text-white shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? <Loader2 size={22} className="animate-spin" /> : t('auth.verify', 'Verify')}
        </button>
      </form>

      <div className="mt-5 text-center text-sm">
        {counting ? (
          <p className="text-slate-500">
            {t('auth.resendIn', 'Resend code in')}{' '}
            <span className="font-bold tabular-nums text-secondary">00:{timer.toString().padStart(2, '0')}</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-2 font-bold text-primary hover:underline disabled:opacity-60"
          >
            {resending ? <Loader2 size={14} className="animate-spin" /> : <RotateCw size={14} />}
            {t('auth.resendOtp', 'Resend Code')}
          </button>
        )}
      </div>
    </div>
  );
}

/** The code entry over the current page (signup or login), instead of a separate empty page. */
export function OtpVerifyModal({ open, ...props }: CardProps & { open: boolean }) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-secondary/50 backdrop-blur-sm" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl sm:p-9">
        <OtpVerifyCard {...props} />
      </div>
    </div>
  );
}
