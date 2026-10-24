import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ChevronRight } from 'lucide-react';

interface LegalSection {
  heading: string;
  body: string;
}

/** Privacy policy and terms pages; their text lives in i18n under `legal.<page>`. */
export function LegalPage({ page }: { page: 'privacy' | 'terms' }) {
  const { t } = useTranslation();
  const title = t(`legal.${page}.title`);
  const sections = t(`legal.${page}.sections`, { returnObjects: true });
  const list: LegalSection[] = Array.isArray(sections) ? sections : [];

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  return (
    <div>
      <section className="bg-gradient-to-br from-secondary to-slate-900 px-4 py-16 text-center text-white sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <li>
              <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
                <Home size={14} /> {t('header.nav.home', 'Home')}
              </Link>
            </li>
            <li><ChevronRight size={14} /></li>
            <li className="text-white" aria-current="page">{title}</li>
          </ol>
        </nav>
        <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
        <p className="mt-4 text-sm text-slate-300">{t('legal.lastUpdated')}</p>
      </section>

      <article className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6">
        {list.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-xl font-bold text-secondary">{section.heading}</h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-600">{section.body}</p>
          </section>
        ))}
        <p className="border-t border-slate-100 pt-6 text-sm text-slate-500">
          {t('legal.questions')}{' '}
          <Link to="/contact" className="font-semibold text-primary hover:underline">
            {t('contactPage.title', 'Contact Us')}
          </Link>
        </p>
      </article>
    </div>
  );
}
