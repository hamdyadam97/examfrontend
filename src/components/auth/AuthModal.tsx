import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { X, Loader2, Phone, Lock, Eye, EyeOff, User, GraduationCap, MapPin, Cake, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { login, register } from '@/store/authSlice';
import { closeLoginModal, setAuthModalView } from '@/store/uiSlice';
import type { AppDispatch, RootState } from '@/store';
import { CountryCodeSelect } from '@/components/CountryCodeSelect';
import {
  classifyLoginError,
  normalizeMobileInput,
  validateLoginInput,
  type LoginFieldErrors,
} from '@/lib/authErrors';

export function AuthModal() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const isOpen = useSelector((state: RootState) => state.ui.loginModalOpen);
  const view = useSelector((state: RootState) => state.ui.authModalView);

  if (!isOpen) return null;

  const switchToLogin = () => dispatch(setAuthModalView('login'));
  const switchToSignup = () => dispatch(setAuthModalView('signup'));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => dispatch(closeLoginModal())}
      />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-900">
        <button
          onClick={() => dispatch(closeLoginModal())}
          className="absolute end-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X size={20} />
        </button>

        {view === 'login' ? (
          <LoginForm onSwitchToSignup={switchToSignup} t={t} />
        ) : (
          <SignupForm onSwitchToLogin={switchToLogin} t={t} />
        )}
      </div>
    </div>
  );
}

function LoginForm({ onSwitchToSignup, t }: { onSwitchToSignup: () => void; t: (key: string) => string }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [dialCode, setDialCode] = useState('+962');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const handleClose = () => dispatch(closeLoginModal());

  // Explains a forced logout caused by an expired/invalid session (401 interceptor).
  useEffect(() => {
    if (window.sessionStorage.getItem('auth:session-expired') === '1') {
      window.sessionStorage.removeItem('auth:session-expired');
      toast.error(t('auth.sessionExpired'));
    }
  }, [t]);

  const fieldMessage = (error?: string) =>
    error === 'required' ? t('auth.mobileRequired') : t('auth.invalidMobile');

  const runValidation = (): boolean => {
    const errors = validateLoginInput(mobile, password);
    setFieldErrors({
      mobile: errors.mobile ? fieldMessage(errors.mobile) : undefined,
      password: errors.password ? t('auth.passwordRequired') : undefined,
    });
    return !errors.mobile && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!runValidation()) return;
    setLoading(true);
    try {
      const result = await dispatch(
        login({ mobile_number: normalizeMobileInput(mobile), dial_code: dialCode, password })
      ).unwrap();
      handleClose();
      if (result?.go_to_verify) {
        toast.success(t('auth.otpSent'));
        navigate('/verify-otp');
      } else {
        toast.success(t('auth.loginSuccess'));
        navigate('/user/dashboard');
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

  const mobileInputClass = `h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800 ${
    fieldErrors.mobile ? 'border-red-500' : ''
  }`;
  const passwordInputClass = `h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800 ${
    fieldErrors.password ? 'border-red-500' : ''
  }`;

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-secondary dark:text-white">
        {t('common.login')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('auth.mobile')}</label>
          <div className="flex gap-2">
            <CountryCodeSelect value={dialCode} onChange={(dial) => setDialCode(dial)} />
            <div className="relative flex-1">
              <Phone size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  if (fieldErrors.mobile) setFieldErrors((f) => ({ ...f, mobile: undefined }));
                }}
                className={mobileInputClass}
                placeholder="795123456"
                dir="ltr"
                autoComplete="tel-national"
                aria-invalid={!!fieldErrors.mobile}
              />
            </div>
          </div>
          {fieldErrors.mobile && (
            <p role="alert" className="mt-1 text-xs text-red-500">
              {fieldErrors.mobile}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('auth.password')}</label>
          <div className="relative">
            <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
              }}
              className={passwordInputClass}
              autoComplete="current-password"
              aria-invalid={!!fieldErrors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && (
            <p role="alert" className="mt-1 text-xs text-red-500">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : t('common.login')}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <Link to="/forget" onClick={handleClose} className="text-primary hover:underline">
          {t('auth.forgetPassword')}
        </Link>
      </div>
      <div className="mt-2 text-center text-sm">
        <span>{t('auth.noAccount')} </span>
        <button type="button" onClick={onSwitchToSignup} className="text-primary hover:underline">
          {t('common.signup')}
        </button>
      </div>
    </>
  );
}

function SignupForm({ onSwitchToLogin, t }: { onSwitchToLogin: () => void; t: (key: string) => string }) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    mobile_number: '',
    dial_code: '+962',
    mobile_country_code: 'JO',
    password: '',
    password_confirmation: '',
    specialization: '',
    governorate: '',
    birth_date: '',
    email: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => dispatch(closeLoginModal());

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(register({
        ...form,
        mobile: form.mobile_number.replace(/^0/, ''),
      })).unwrap();
      handleClose();
      navigate('/verify-otp');
    } catch (err: any) {
      toast.error((err?.statusCode && err?.message) || t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-bold text-secondary dark:text-white">
        {t('common.signup')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('auth.firstName')}</label>
            <div className="relative">
              <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={form.first_name}
                onChange={(e) => update('first_name', e.target.value)}
                className="h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('auth.lastName')}</label>
            <div className="relative">
              <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={form.last_name}
                onChange={(e) => update('last_name', e.target.value)}
                className="h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('auth.mobile')}</label>
          <div className="flex gap-2">
            <CountryCodeSelect
              value={form.dial_code}
              onChange={(dial, code) => {
                update('dial_code', dial);
                update('mobile_country_code', code);
              }}
            />
            <div className="relative flex-1">
              <Phone size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={form.mobile_number}
                onChange={(e) => update('mobile_number', e.target.value)}
                className="h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800"
                placeholder="795123456"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('auth.password')}</label>
            <div className="relative">
              <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                className="h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('auth.confirmPassword')}</label>
            <div className="relative">
              <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password_confirmation}
                onChange={(e) => update('password_confirmation', e.target.value)}
                className="h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('auth.specialization')}</label>
            <div className="relative">
              <GraduationCap size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={form.specialization}
                onChange={(e) => update('specialization', e.target.value)}
                className="h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('auth.governorate')}</label>
            <div className="relative">
              <MapPin size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                value={form.governorate}
                onChange={(e) => update('governorate', e.target.value)}
                className="h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('auth.birthDate')}</label>
          <div className="relative">
            <Cake size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              required
              value={form.birth_date}
              onChange={(e) => update('birth_date', e.target.value)}
              className="h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Email (optional)</label>
          <div className="relative">
            <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              className="h-10 w-full rounded-lg border bg-white px-3 ps-10 text-sm outline-none focus:border-primary dark:bg-slate-800"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? <Loader2 size={18} className="mx-auto animate-spin" /> : t('common.signup')}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        <span>Already have an account? </span>
        <button type="button" onClick={onSwitchToLogin} className="text-primary hover:underline">
          {t('common.login')}
        </button>
      </div>
    </>
  );
}
