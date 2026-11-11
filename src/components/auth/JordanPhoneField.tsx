import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';
import { CountryFlag } from '@/components/CountryCodeSelect';
import { JORDAN_COUNTRY, JORDAN_DIAL } from '@/lib/phone';

interface Props {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

/** Mobile number input locked to Jordan (+962): SMS codes are delivered to Jordanian numbers only. */
export function JordanPhoneField({ id, value, onChange, error }: Props) {
  const { t } = useTranslation();
  return (
    <div>
      <label htmlFor={id} className="sr-only">{t('auth.mobile')}</label>
      <div className="flex gap-2" dir="ltr">
        <span
          className="flex h-14 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-semibold text-secondary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          title={t('auth.jordanOnly', 'Jordanian mobile numbers only')}
        >
          <CountryFlag code={JORDAN_COUNTRY} className="h-auto w-5 rounded-sm" />
          {JORDAN_DIAL}
        </span>
        <div className="relative flex-1">
          <Phone size={20} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            id={id}
            type="tel"
            inputMode="tel"
            required
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="7X XXX XXXX"
            autoComplete="tel-national"
            aria-invalid={!!error}
            aria-describedby={`${id}-hint`}
            className={`h-14 w-full rounded-2xl border bg-white px-4 ps-12 text-base text-secondary outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-slate-800 dark:text-white ${
              error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
            }`}
          />
        </div>
      </div>
      <p id={`${id}-hint`} role={error ? 'alert' : undefined} className={`mt-1.5 text-xs ${error ? 'text-red-500' : 'text-slate-500'}`}>
        {error || t('auth.jordanOnly', 'Jordanian mobile numbers only')}
      </p>
    </div>
  );
}
