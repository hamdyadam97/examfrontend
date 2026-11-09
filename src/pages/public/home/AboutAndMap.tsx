import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CircleCheck } from 'lucide-react';
import { JordanMap } from './JordanMap';

/** Laptop showing a question with answer options, drawn in SVG. */
function LaptopArt() {
  return (
    <svg viewBox="0 0 260 180" className="h-full w-full" aria-hidden="true">
      <rect x="40" y="14" width="180" height="118" rx="10" fill="#0b2a6f" />
      <rect x="48" y="22" width="164" height="102" rx="5" fill="#f4f8ff" />
      <rect x="58" y="32" width="90" height="8" rx="4" fill="#1d63d8" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(58 ${50 + i * 17})`}>
          <rect width="144" height="12" rx="6" fill={i === 1 ? '#dbe8ff' : '#ffffff'} stroke="#c9d8f2" />
          <circle cx="8" cy="6" r="3.5" fill={i === 1 ? '#1d63d8' : '#c9d8f2'} />
          <rect x="18" y="4" width={[70, 90, 60, 80][i]} height="4" rx="2" fill="#9fb4d8" />
        </g>
      ))}
      <path d="M20 132 h220 l-14 18 H34 Z" fill="#c9d4e8" />
      <rect x="110" y="134" width="40" height="5" rx="2.5" fill="#9fb0cc" />
      {/* Stethoscope resting beside the laptop */}
      <path d="M214 150 c18 6 30 -6 26 -22 c-3 -12 -14 -14 -18 -8" stroke="#64748b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="222" cy="120" r="6" fill="#94a3b8" />
      <circle cx="210" cy="152" r="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2.5" />
    </svg>
  );
}

const DEFAULT_CITIES = ['amman', 'irbid', 'zarqa', 'aqaba'];

interface Props {
  /** City names set by the admin (Setting "home_map_cities"); defaults are used when empty. */
  cities?: string[];
}

export function AboutAndMap({ cities }: Props) {
  const { t, i18n } = useTranslation();
  const Arrow = i18n.language === 'ar' ? ArrowLeft : ArrowRight;
  const cityNames = cities?.length ? cities : DEFAULT_CITIES.map((c) => t(`home.map.cities.${c}`));

  return (
    <section className="pb-16 sm:pb-20">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid items-center gap-6 rounded-3xl border border-slate-100 bg-gradient-to-br from-white to-sky-soft p-8 shadow-sm sm:grid-cols-5"
        >
          <div className="sm:col-span-3">
            <h2 className="text-2xl font-extrabold text-primary">{t('home.about.title', 'About RootsExams')}</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              {t('home.about.text', 'A platform dedicated to training for the most important medical exams accredited internationally, with smart tools and a professional training experience.')}
            </p>
            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-white px-6 py-2.5 text-sm font-bold text-secondary transition hover:border-primary hover:text-primary"
            >
              {t('home.about.more', 'Learn more')} <Arrow size={16} />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-xs sm:col-span-2">
            <LaptopArt />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid items-center gap-6 rounded-3xl border border-slate-100 bg-gradient-to-br from-sky-soft to-white p-8 shadow-sm sm:grid-cols-5"
        >
          <div className="sm:col-span-2">
            <h2 className="text-2xl font-extrabold text-secondary">{t('home.map.title', 'Our students across the Kingdom')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('home.map.subtitle', 'Proud to serve trainees in every region of Jordan')}</p>
            <ul className="mt-5 space-y-2.5">
              {cityNames.map((city) => (
                <li key={city} className="flex items-center gap-2 font-semibold text-secondary">
                  <CircleCheck size={18} className="shrink-0 text-primary" /> {city}
                </li>
              ))}
              <li className="flex items-center gap-2 font-semibold text-secondary">
                <CircleCheck size={18} className="shrink-0 text-primary" /> {t('home.map.everywhere', 'And all other regions')}
              </li>
            </ul>
          </div>
          <div className="mx-auto h-72 w-full max-w-sm sm:col-span-3">
            <JordanMap label={t('home.map.title', 'Our students across the Kingdom')} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
