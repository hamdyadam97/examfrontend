import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, Users, CircleCheck, Trophy, Landmark, Timer, BookOpen, ChartColumn, Clock, type LucideIcon } from 'lucide-react';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { HeroArt } from './HeroArt';
import type { LandingStats } from './types';

interface Props {
  stats?: LandingStats;
}

export function HomeHero({ stats }: Props) {
  const { t } = useTranslation();

  const items: { icon: LucideIcon; value: number; prefix?: string; suffix?: string; label: string }[] = stats
    ? [
        { icon: Users, value: stats.students, prefix: '+', label: t('home.stats.students', 'Registered users') },
        { icon: CircleCheck, value: stats.attempts, prefix: '+', label: t('home.stats.attempts', 'Practice attempts') },
        { icon: Trophy, value: stats.pass_rate, suffix: '%', label: t('home.stats.passRate', 'Success rate') },
        { icon: Landmark, value: stats.partners, prefix: '+', label: t('home.stats.partners', 'Accredited partners') },
      ].filter((item) => item.value > 0)
    : [];

  const highlights: { icon: LucideIcon; label: string }[] = [
    { icon: Timer, label: t('home.highlights.timed', 'Timed mock exams') },
    { icon: BookOpen, label: t('home.highlights.study', 'Study mode with explanations') },
    { icon: ChartColumn, label: t('home.highlights.reports', 'Instant performance reports') },
    { icon: Clock, label: t('home.highlights.anytime', 'Available 24/7') },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-soft via-white to-white pb-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(29,99,216,0.10), transparent 35%), radial-gradient(circle at 85% 60%, rgba(11,42,111,0.06), transparent 35%)',
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              {t('home.hero.badge', 'Medical exams platform')}
            </span>
            <h1 className="text-4xl font-extrabold leading-tight text-secondary sm:text-5xl">
              {t('home.hero.titleLine1', 'RootsExams')}
              <span className="mt-2 block text-primary">{t('home.hero.titleLine2', 'for medical exams and training')}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              {t('home.hero.subtitle', 'Prepare with confidence and achieve your best result in your medical exams.')}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/exams"
                className="inline-flex items-center gap-3 rounded-full bg-secondary px-8 py-4 text-base font-bold text-white shadow-lg shadow-secondary/20 transition hover:-translate-y-0.5 hover:bg-secondary/90"
              >
                <Play size={18} className="fill-white rtl:rotate-180" /> {t('home.hero.cta', 'Start now')}
              </Link>
              <Link
                to="/packages"
                className="inline-flex items-center rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-bold text-secondary transition hover:border-primary hover:text-primary"
              >
                {t('home.hero.secondaryCta', 'View packages')}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mx-auto w-full max-w-xl lg:max-w-none"
          >
            <HeroArt />
          </motion.div>
        </div>

        {items.length === 0 && (
          // No real numbers yet: show what the platform offers instead of invented figures.
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 grid divide-slate-100 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-secondary/5 sm:grid-cols-2 sm:divide-x lg:grid-cols-4 rtl:sm:divide-x-reverse"
          >
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center justify-center gap-4 px-6 py-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon size={26} />
                </div>
                <p className="font-bold text-secondary">{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-10 grid divide-slate-100 rounded-3xl border border-slate-100 bg-white shadow-xl shadow-secondary/5 sm:divide-x rtl:sm:divide-x-reverse ${
              ['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3', 'sm:grid-cols-2 lg:grid-cols-4'][items.length]
            }`}
          >
            {items.map(({ icon: Icon, value, prefix = '', suffix = '', label }) => (
              <div key={label} className="flex items-center justify-center gap-4 px-6 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon size={26} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-secondary" dir="ltr">
                    <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
                  </p>
                  <p className="text-sm text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
