import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  subtitle?: string;
  /** Optional "view all" link shown at the end of the heading row. */
  link?: { to: string; label: string };
}

/** Centered title flanked by thin lines, as in the design. */
export function SectionHeading({ title, subtitle, link }: Props) {
  const { i18n } = useTranslation();
  const Arrow = i18n.language === 'ar' ? ArrowLeft : ArrowRight;
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4">
        <span className="hidden h-px flex-1 bg-gradient-to-l from-primary/40 to-transparent sm:block" />
        <h2 className="text-center text-2xl font-extrabold text-secondary sm:text-3xl">{title}</h2>
        <span className="hidden h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent sm:block" />
        {link && (
          <Link
            to={link.to}
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-secondary transition hover:border-primary hover:text-primary md:inline-flex"
          >
            {link.label} <Arrow size={16} />
          </Link>
        )}
      </div>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">{subtitle}</p>}
    </div>
  );
}
