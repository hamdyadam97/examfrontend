import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Lock, LogIn, UserPlus } from 'lucide-react';
import { login } from '@/store/authSlice';
import type { AppDispatch } from '@/store';
import { isJordanMobile, JORDAN_DIAL, normalizeJordanMobile } from '@/lib/phone';
import { JordanPhoneField } from './JordanPhoneField';
import { OtpVerifyModal } from './OtpVerify';
import { classifyLoginError, normalizeMobileInput, validateLoginInput, type LoginFieldErrors } from '@/lib/authErrors';

interface Props {
  /** Opens the signup form (modal view switch or signup modal). */
  onSwitchToSignup: () => void;
  /** Called after a successful login or before leaving for another auth page (closes the modal). */
  onDone?: () => void;
}

/** Login with mobile number and password; shared by the /login page and the auth modal. */
export function LoginForm({ onSwitchToSignup, onDone }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [otpOpen, setOtpOpen] = useState(false);

  // Page the user was sent away from by ProtectedRoute, to return there after login.
  const from = (location.state as { from?: string } | null)?.from;

  // Explains a forced logout caused by an expired/invalid session (401 interceptor).
  useEffect(() => {
    if (window.sessionStorage.getItem('auth:session-expired') === '1') {
      window.sessionStorage.removeItem('auth:session-expired');
      toast.error(t('auth.sessionExpired'));
    }
  }, [t]);

  const fieldMessage = (error?: string) => (error === 'required' ? t('auth.mobileRequired') : t('auth.invalidMobile'));

  const runValidation = (): boolean => {
    const errors = validateLoginInput(mobile, password);
    if (!errors.mobile && !isJordanMobile(mobile)) errors.mobile = 'invalid';
    setFieldErrors({
      mobile: errors.mobile ? fieldMessage(errors.mobile) : undefined,
      password: errors.password ? t('auth.passwordRequired') : undefined,
    });
    return !errors.mobile && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !runValidation()) return;
    setLoading(true);
    try {
      const result = await dispatch(login({ mobile_number: normalizeJordanMobile(normalizeMobileInput(mobile)), dial_code: JORDAN_DIAL, password })).unwrap();
      if (result?.go_to_verify) {
        // The phone is not verified yet: a new code was sent, so ask for it here.
        toast.success(t('auth.otpSent'));
        setOtpOpen(true);
      } else {
        onDone?.();
        toast.success(t('auth.loginSuccess'));
        navigate(from || '/user/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const failure = classifyLoginError(err);
      switch (failure.kind) {
        case 'invalid_credentials':
          // Generic message on purpose: never reveal whether the phone is registered.
          toast.error(t('auth.invalidCredentials'));
          break;
        case 'account_disabled':
          toast.error(t('auth.accountDisabled'));
          break;
        case 'rate_limited':
          toast.error(t('auth.tooManyAttempts'));
          break;
        case 'session_expired':
          toast.error(t('auth.sessionExpired'));
          break;
        case 'network':
          toast.error(t('auth.networkError'));
          break;
        case 'server_error':
          toast.error(t('auth.unexpectedError'));
          break;
        case 'field_errors':
          setFieldErrors({
            mobile: failure.fields?.mobile ? fieldMessage('invalid') : undefined,
            password: failure.fields?.password ? t('auth.passwordRequired') : undefined,
          });
          toast.error(t('auth.loginFailed'));
          break;
        default:
          toast.error(t('auth.loginFailed'));
      }
      // The entered mobile number is kept in the input so the user can retry.
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (invalid?: boolean) =>
    `h-14 w-full rounded-2xl border bg-white px-4 ps-12 text-base text-secondary outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-slate-800 dark:text-white ${
      invalid ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
    }`;

  return (
    <div>
      <div className="mb-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-soft to-primary/15 text-secondary shadow-inner">
          <LogIn size={34} className="rtl:-scale-x-100" />
        </div>
        <div className="sm:text-start">
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white">{t('common.login')}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{t('auth.loginSubtitle', 'Sign in to your account to start practicing')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <JordanPhoneField
          id="login-mobile"
          value={mobile}
          error={fieldErrors.mobile}
          onChange={(value) => {
            setMobile(value);
            if (fieldErrors.mobile) setFieldErrors((f) => ({ ...f, mobile: undefined }));
          }}
        />

        <div>
          <label htmlFor="login-password" className="sr-only">{t('auth.password')}</label>
          <div className="relative">
            <Lock size={20} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
              }}
              className={inputClass(!!fieldErrors.password)}
              placeholder={t('auth.password')}
              autoComplete="current-password"
              aria-invalid={!!fieldErrors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
              className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {fieldErrors.password && <p role="alert" className="mt-1.5 text-xs text-red-500">{fieldErrors.password}</p>}
        </div>

        <div className="flex justify-end">
          <Link to="/forget" onClick={onDone} className="text-sm font-semibold text-primary hover:underline">
            {t('auth.forgetPassword')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-secondary to-primary text-lg font-bold text-white shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? <Loader2 size={22} className="animate-spin" /> : <><LogIn size={20} className="rtl:-scale-x-100" /> {t('auth.signIn', 'Sign in')}</>}
        </button>
      </form>

      <div className="mt-8 rounded-3xl bg-sky-soft/70 p-6 text-center dark:bg-slate-800">
        <p className="text-lg font-extrabold text-secondary dark:text-white">{t('auth.noAccount')}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('auth.joinNow', 'Join now and enjoy all the platform features')}</p>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-secondary bg-white px-6 py-2.5 text-sm font-bold text-secondary transition hover:bg-secondary hover:text-white dark:bg-transparent dark:text-white"
        >
          <UserPlus size={18} /> {t('auth.createNewAccount', 'Create a new account')}
        </button>
      </div>
      <OtpVerifyModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onVerified={() => {
          onDone?.();
          navigate(from || '/user/dashboard', { replace: true });
        }}
      />
    </div>
  );
}
