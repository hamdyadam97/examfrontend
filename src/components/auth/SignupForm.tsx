import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { GOVERNORATES, optionLabel, SPECIALIZATIONS, type ProfileOption } from '@/config/profileOptions';
import { Cake, ChevronDown, Eye, EyeOff, GraduationCap, Loader2, Lock, LogIn, Mail, MapPin, User, UserPlus, type LucideIcon } from 'lucide-react';
import { register } from '@/store/authSlice';
import type { AppDispatch } from '@/store';
import { apiErrorMessage, type ApiError } from '@/lib/api';
import { isJordanMobile, JORDAN_COUNTRY, JORDAN_DIAL, normalizeJordanMobile } from '@/lib/phone';
import { JordanPhoneField } from './JordanPhoneField';
import { OtpVerifyModal } from './OtpVerify';

interface Props {
  onSwitchToLogin: () => void;
}

// Latest accepted birth date: the student must be at least 15 (the server enforces the same rule).
const MAX_BIRTH_DATE = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 15);
  return d.toISOString().slice(0, 10);
})();

const inputClass =
  'h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 ps-12 text-base text-secondary outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white';

/** Input with a leading icon; the label is visually hidden because the placeholder names the field. */
function Field({ id, icon: Icon, label, children }: { id: string; icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{label}</label>
      <Icon size={20} className="pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-secondary" />
      {children}
    </div>
  );
}

/** Dropdown styled like the text inputs; the empty first option acts as the placeholder. */
function OptionSelect({ id, value, options, placeholder, onChange }: { id: string; value: string; options: ProfileOption[]; placeholder: string; onChange: (value: string) => void }) {
  const { i18n } = useTranslation();
  return (
    <>
      <select id={id} required value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} appearance-none pe-10 ${value ? '' : 'text-slate-400'}`}>
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-secondary dark:text-white">{optionLabel(o, i18n.language)}</option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-slate-400" />
    </>
  );
}

/** Account registration with a Jordanian mobile; the SMS code is entered in a modal on the same page. */
export function SignupForm({ onSwitchToLogin }: Props) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    mobile_number: '',
    dial_code: JORDAN_DIAL,
    mobile_country_code: JORDAN_COUNTRY,
    password: '',
    password_confirmation: '',
    specialization: '',
    governorate: '',
    birth_date: '',
    email: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>();
  const [otpOpen, setOtpOpen] = useState(false);

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!isJordanMobile(form.mobile_number)) {
      setPhoneError(t('auth.invalidJordanMobile', 'Enter a Jordanian mobile number, e.g. 7X XXX XXXX'));
      return;
    }
    if (form.password !== form.password_confirmation) {
      toast.error(t('auth.passwordMismatch', 'Passwords do not match.'));
      return;
    }
    setLoading(true);
    try {
      const mobile = normalizeJordanMobile(form.mobile_number);
      await dispatch(register({ ...form, mobile_number: mobile, mobile })).unwrap();
      setOtpOpen(true);
    } catch (err) {
      const errors = (err as ApiError | undefined)?.errors;
      if (errors?.PhoneTaken) toast.error(t('auth.phoneTaken', 'This phone number is already registered. Please log in.'));
      else if (errors?.PhoneNotJordanian) setPhoneError(t('auth.invalidJordanMobile', 'Enter a Jordanian mobile number, e.g. 7X XXX XXXX'));
      else if (errors?.SmsFailed) toast.error(t('auth.smsFailed', 'We could not send the verification code right now. Please try again later.'));
      else if (errors?.birth_date) toast.error(t('auth.invalidBirthDate', 'Please enter a valid birth date.'));
      else if (errors?.email) toast.error(t('auth.emailTaken', 'This email is already registered.'));
      else toast.error(Object.values(errors || {})[0]?.[0] || apiErrorMessage(err) || t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  };

  const eye = (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      aria-label={showPassword ? t('auth.hidePassword', 'Hide password') : t('auth.showPassword', 'Show password')}
      className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary"
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );

  return (
    <div>
      <div className="mb-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-soft to-primary/15 text-secondary shadow-inner">
          <UserPlus size={34} />
        </div>
        <div className="sm:text-start">
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white">{t('header.createAccount', 'Create Account')}</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{t('auth.signupSubtitle', 'Create your account and start practicing today')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="su-first" icon={User} label={t('auth.firstName')}>
            <input id="su-first" required value={form.first_name} onChange={(e) => update('first_name', e.target.value)} placeholder={t('auth.firstName')} autoComplete="given-name" className={inputClass} />
          </Field>
          <Field id="su-last" icon={User} label={t('auth.lastName')}>
            <input id="su-last" required value={form.last_name} onChange={(e) => update('last_name', e.target.value)} placeholder={t('auth.lastName')} autoComplete="family-name" className={inputClass} />
          </Field>
        </div>

        <JordanPhoneField
          id="su-mobile"
          value={form.mobile_number}
          error={phoneError}
          onChange={(value) => {
            update('mobile_number', value);
            setPhoneError(undefined);
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="su-pass" icon={Lock} label={t('auth.password')}>
            <input id="su-pass" type={showPassword ? 'text' : 'password'} required minLength={8} value={form.password} onChange={(e) => update('password', e.target.value)} placeholder={t('auth.password')} autoComplete="new-password" className={inputClass} />
            {eye}
          </Field>
          <Field id="su-pass2" icon={Lock} label={t('auth.confirmPassword')}>
            <input id="su-pass2" type={showPassword ? 'text' : 'password'} required minLength={8} value={form.password_confirmation} onChange={(e) => update('password_confirmation', e.target.value)} placeholder={t('auth.confirmPassword')} autoComplete="new-password" className={inputClass} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="su-spec" icon={GraduationCap} label={t('auth.specialization')}>
            <OptionSelect id="su-spec" value={form.specialization} options={SPECIALIZATIONS} placeholder={t('auth.specialization')} onChange={(v) => update('specialization', v)} />
          </Field>
          <Field id="su-gov" icon={MapPin} label={t('auth.governorate')}>
            <OptionSelect id="su-gov" value={form.governorate} options={GOVERNORATES} placeholder={t('auth.governorate')} onChange={(v) => update('governorate', v)} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="su-birth" className="mb-1 block text-xs font-semibold text-slate-500">{t('auth.birthDate')}</label>
            <Field id="su-birth" icon={Cake} label={t('auth.birthDate')}>
              <input id="su-birth" type="date" required max={MAX_BIRTH_DATE} value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} className={inputClass} />
            </Field>
          </div>
          <div>
            <label htmlFor="su-email" className="mb-1 block text-xs font-semibold text-slate-500">{t('auth.emailOptional', 'Email (optional)')}</label>
            <Field id="su-email" icon={Mail} label={t('auth.emailOptional', 'Email (optional)')}>
              <input id="su-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="name@example.com" autoComplete="email" dir="ltr" className={inputClass} />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-secondary to-primary text-lg font-bold text-white shadow-lg shadow-primary/25 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? <Loader2 size={22} className="animate-spin" /> : <><UserPlus size={20} /> {t('header.createAccount', 'Create Account')}</>}
        </button>
        <p className="text-center text-xs text-slate-500">{t('auth.otpNote', 'We will send a verification code to your mobile number.')}</p>
      </form>

      <div className="mt-8 rounded-3xl bg-sky-soft/70 p-6 text-center dark:bg-slate-800">
        <p className="text-lg font-extrabold text-secondary dark:text-white">{t('auth.haveAccount', 'Already have an account?')}</p>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-secondary bg-white px-6 py-2.5 text-sm font-bold text-secondary transition hover:bg-secondary hover:text-white dark:bg-transparent dark:text-white"
        >
          <LogIn size={18} className="rtl:-scale-x-100" /> {t('common.login')}
        </button>
      </div>
      <OtpVerifyModal open={otpOpen} onClose={() => setOtpOpen(false)} onVerified={() => navigate('/user/dashboard', { replace: true })} />
    </div>
  );
}
