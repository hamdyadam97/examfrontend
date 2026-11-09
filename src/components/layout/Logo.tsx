import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Stethoscope } from 'lucide-react';

interface Props {
  /** Light text for dark backgrounds (footer). */
  inverted?: boolean;
  onClick?: () => void;
}

export function Logo({ inverted = false, onClick }: Props) {
  const { t } = useTranslation();
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2.5" aria-label={t('common.appName')}>
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-2xl rounded-tr-md shadow-md ${
          inverted ? 'bg-white/10 text-white ring-1 ring-white/30' : 'bg-gradient-to-br from-primary to-secondary text-white'
        }`}
      >
        <Stethoscope size={24} />
      </span>
      <span className="leading-tight" dir="ltr">
        <span className={`block text-xl font-extrabold tracking-tight ${inverted ? 'text-white' : 'text-secondary'}`}>
          RootsExams
        </span>
        <span className={`block text-[11px] font-semibold ${inverted ? 'text-white/70' : 'text-primary'}`}>
          Medical Exams Platform
        </span>
      </span>
    </Link>
  );
}
