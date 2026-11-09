import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, Stethoscope, HeartPulse, Pill, Syringe, type LucideIcon } from 'lucide-react';
import type { Specialty } from '@/components/SpecialtyCard';
import { SectionHeading } from './SectionHeading';

// Each card gets its own tint and watermark icon so the row does not look uniform.
const looks: { gradient: string; icon: LucideIcon }[] = [
  { gradient: 'from-sky-100 via-white to-blue-50', icon: Stethoscope },
  { gradient: 'from-indigo-100 via-white to-sky-50', icon: HeartPulse },
  { gradient: 'from-emerald-50 via-white to-sky-50', icon: Pill },
  { gradient: 'from-blue-100 via-white to-cyan-50', icon: Syringe },
];

interface Props {
  categories: Specialty[];
}

interface Card {
  id: string | number;
  name: string;
  description?: string | null;
  icon?: string | null;
  questions?: number;
  to: string;
}

// Shown until specialties are added in the admin panel.
const FALLBACK = ['nclex', 'dha', 'prometric', 'dcpd'] as const;

/** The specialties with the most questions, as big exam cards. */
export function PopularExams({ categories }: Props) {
  const { t } = useTranslation();
  const top: Card[] = [...categories]
    .sort((a, b) => (b.questions_count || 0) - (a.questions_count || 0))
    .slice(0, 4)
    .map((c) => ({ id: c.id, name: c.name, description: c.description, icon: c.icon, questions: c.questions_count || 0, to: `/packages/category/${c.id}` }));
  const cards: Card[] = top.length
    ? top
    : FALLBACK.map((key) => ({
        id: key,
        name: t(`home.popular.fallback.${key}.name`),
        description: t(`home.popular.fallback.${key}.desc`),
        to: '/exams',
      }));

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('home.popular.title', 'Most requested exams')}
          link={{ to: '/exams', label: t('home.popular.viewAll', 'View all exams') }}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((category, idx) => {
            const { gradient, icon: Icon } = looks[idx % looks.length];
            return (
              <motion.article
                key={category.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={`group relative flex min-h-60 flex-col overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br ${gradient} p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl`}
              >
                <Icon aria-hidden="true" className="absolute -bottom-6 -end-6 text-primary/10 transition group-hover:scale-110" size={150} />
                {category.icon ? (
                  <img src={category.icon} alt="" className="relative mx-auto mb-3 h-12 w-12 object-contain" loading="lazy" />
                ) : null}
                <h3 className="relative text-3xl font-extrabold tracking-tight text-secondary" dir="auto">{category.name}</h3>
                {category.description && (
                  <p className="relative mt-2 line-clamp-2 text-sm font-medium text-slate-600" dir="auto">{category.description}</p>
                )}
                {category.questions !== undefined && (
                  <p className="relative mt-2 text-xs text-slate-500">
                    {t('home.popular.questions', { count: category.questions, defaultValue: '{{count}} questions' })}
                  </p>
                )}
                <Link
                  to={category.to}
                  className="relative mx-auto mt-auto inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primary"
                >
                  <Play size={14} className="fill-white rtl:rotate-180" /> {t('home.popular.start', 'Start practicing')}
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
