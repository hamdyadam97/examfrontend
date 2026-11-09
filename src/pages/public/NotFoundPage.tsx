import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ClipboardList } from 'lucide-react';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-7xl font-extrabold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold text-secondary sm:text-3xl">{t('notFound.title', 'Page not found')}</h1>
      <p className="mt-3 max-w-md text-slate-600">
        {t('notFound.subtitle', 'The page you are looking for does not exist or has been moved.')}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90">
          <Home size={18} /> {t('notFound.home', 'Back to Home')}
        </Link>
        <Link to="/packages" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-secondary hover:border-primary hover:text-primary">
          <ClipboardList size={18} /> {t('notFound.packages', 'Browse packages')}
        </Link>
      </div>
    </section>
  );
}
