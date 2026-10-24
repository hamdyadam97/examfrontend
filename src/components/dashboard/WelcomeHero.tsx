import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PlusCircle, Award, CheckCircle2, TrendingUp, Clock, Layers, Zap } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';
import type { DashboardStats } from '@/pages/dashboard/DashboardPage';

interface Props {
  name: string;
  stats: DashboardStats;
}

export function WelcomeHero({ name, stats }: Props) {
  const { t } = useTranslation();
  const noPackage = t('dashboard.noActivePackage', 'No active package');

  const pills = [
    { icon: Layers, label: t('dashboard.currentPackage'), value: stats.current_package?.name || noPackage },
    { icon: Clock, label: t('dashboard.subscriptionExpiry'), value: stats.current_package?.end_date || '-' },
    { icon: CheckCircle2, label: t('dashboard.stats.completedExams'), value: String(stats.completed_exams) },
    { icon: Award, label: t('dashboard.stats.averageScore'), value: `${stats.average_score}%` },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-secondary via-[#0a1f5c] to-primary p-6 text-white shadow-2xl md:p-10"
    >
      <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm"
          >
            <Zap size={16} className="text-yellow-300" />
            {t('dashboard.welcomeBack')}
          </motion.div>
          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
            {t('dashboard.hello')}, {name} 👋
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            {t('dashboard.heroText')}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/user/exam/create"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-secondary shadow-lg transition hover:bg-slate-50"
            >
              <PlusCircle size={18} />
              {t('dashboard.createExam')}
            </Link>
            <Link
              to="/exams"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              {t('dashboard.browseExams')}
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {pills.map((pill) => {
              const Icon = pill.icon;
              return (
                <div
                  key={pill.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                >
                  <p className="text-xs text-white/60">{pill.label}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-bold">
                    <Icon size={14} /> {pill.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/10 to-transparent blur-2xl" />
            <div className="relative space-y-4 rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/70">{t('dashboard.examReadiness')}</span>
                <span className="text-sm font-bold">{stats.success_rate}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.success_rate}%` }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-teal-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl bg-white/10 p-4 text-center">
                  <p className="text-2xl font-extrabold"><AnimatedCounter value={stats.total_answered} /></p>
                  <p className="text-xs text-white/60">{t('dashboard.stats.answeredQuestions')}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4 text-center">
                  <p className="text-2xl font-extrabold"><AnimatedCounter value={stats.total_correct} /></p>
                  <p className="text-xs text-white/60">{t('dashboard.correctAnswers', 'Correct Answers')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/20 text-yellow-300">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-sm font-bold">{t('dashboard.stats.bestScore')}</p>
                </div>
                <span className="text-xl font-extrabold">{stats.best_score}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-24 -start-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 -end-24 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl" />
    </motion.div>
  );
}
