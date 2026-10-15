import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { Loader2, CheckCircle2, XCircle, ArrowLeft, Phone, Mail, Pencil, RotateCw } from 'lucide-react';
import { verifyOtp, resendOtp } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

function maskContact(value: string) {
  if (!value) return '';
  if (value.length <= 4) return value;
  const start = value.slice(0, 2);
  const end = value.slice(-2);
  return `${start}${'•'.repeat(Math.min(value.length - 4, 8))}${end}`;
}

export function VerifyOtpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isForget, user } = useSelector((state: RootState) => state.auth);

  const storedMobile = user?.mobile || Cookies.get('otp_mobile') || '';
  const isEmail = storedMobile.includes('@');
  const [contact, setContact] = useState(storedMobile);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editValue, setEditValue] = useState(storedMobile);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    setCanResend(false);
    const id = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const updateDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    if (!digit && value.length > 0) return;

    setError(null);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (otp[index]) {
        setOtp((prev) => {
          const next = [...prev];
          next[index] = '';
          return next;
        });
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    setError(null);
    const digits = pasted.split('');
    setOtp((prev) => {
      const next = [...prev];
      digits.forEach((digit, i) => {
        if (i < OTP_LENGTH) next[i] = digit;
      });
      return next;
    });

    const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
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
      setTimeout(() => {
        navigate(isForget ? '/reset' : '/user/dashboard');
      }, 900);
    } catch (err: any) {
      const message = (err?.statusCode && err?.message) || t('auth.verificationFailed', 'Invalid verification code');
      setError(message);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setResending(true);
    setError(null);
    try {
      await dispatch(resendOtp({ mobile: contact || undefined })).unwrap();
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimer(RESEND_SECONDS);
      setCanResend(false);
      inputRefs.current[0]?.focus();
      toast.success(t('auth.codeResent', 'Verification code resent'));
    } catch (err: any) {
      const message = (err?.statusCode && err?.message) || t('auth.resendFailed', 'Failed to resend code');
      setError(message);
    } finally {
      setResending(false);
    }
  };

  const saveContactEdit = () => {
    if (!editValue.trim()) return;
    setContact(editValue.trim());
    setIsEditingContact(false);
  };

  const cancelContactEdit = () => {
    setEditValue(contact);
    setIsEditingContact(false);
  };

  const formattedTimer = `00:${timer.toString().padStart(2, '0')}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/60 p-4 font-sans">
      <div className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group mb-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          aria-label={t('common.back', 'Go back')}
        >
          <ArrowLeft size={16} className="transition group-hover:-translate-x-0.5" />
          {t('common.back', 'Back')}
        </button>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
            {isEmail ? <Mail size={26} /> : <Phone size={26} />}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {t('auth.verificationCode', 'Verification Code')}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
            {t(
              'auth.verificationSubtitle',
              "We've sent a 6-digit verification code to your email or phone number.",
            )}
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-slate-600">
          {isEditingContact ? (
            <div className="flex w-full items-center gap-2">
              <input
                type={isEmail ? 'email' : 'tel'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveContactEdit();
                  if (e.key === 'Escape') cancelContactEdit();
                }}
                className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                autoFocus
                aria-label={t('auth.editContactLabel', 'Edit contact')}
              />
              <button
                type="button"
                onClick={saveContactEdit}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                {t('common.save', 'Save')}
              </button>
              <button
                type="button"
                onClick={cancelContactEdit}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            </div>
          ) : (
            <>
              <span className="font-medium" aria-label={t('auth.contactLabel', 'Verification contact')}>
                {maskContact(contact)}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingContact(true)}
                className="inline-flex items-center gap-1 rounded-md p-1 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                aria-label={t('auth.editContact', 'Edit contact')}
              >
                <Pencil size={14} />
              </button>
            </>
          )}
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label={t('auth.otpLabel', 'One-time password')}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => updateDigit(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading || success}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'otp-error' : undefined}
                  className={`h-14 w-12 rounded-xl border-2 bg-slate-50 text-center text-2xl font-semibold text-slate-900 shadow-sm outline-none transition-all duration-200 sm:h-16 sm:w-14 ${
                    error
                      ? 'border-red-300 bg-red-50/50 text-red-700 focus:border-red-500 focus:ring-4 focus:ring-red-500/15'
                      : success
                        ? 'border-emerald-400 bg-emerald-50/50 text-emerald-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15'
                        : 'border-slate-200 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10'
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                />
              ))}
            </div>

            {error && (
              <div
                id="otp-error"
                role="alert"
                className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 animate-in fade-in slide-in-from-top-1"
              >
                <XCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600 animate-in fade-in slide-in-from-top-1"
              >
                <CheckCircle2 size={16} />
                {t('auth.verificationSuccess', 'Verified successfully')}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success || otp.join('').length < OTP_LENGTH}
            className="group relative flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-400 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                {t('auth.verify', 'Verify')}
                <CheckCircle2 size={16} className="opacity-80 transition group-hover:scale-110" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-60"
            >
              {resending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RotateCw size={14} />
              )}
              {t('auth.resendOtp', 'Resend Code')}
            </button>
          ) : (
            <p className="text-sm text-slate-500">
              {t('auth.resendIn', 'Resend code in')}{' '}
              <span className="font-semibold tabular-nums text-slate-700">{formattedTimer}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
