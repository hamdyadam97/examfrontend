import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PlayCircle, BookOpen, RotateCcw, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { StudentInsights } from '@/types/insights';

interface CardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  progress?: number;
  to: string;
  action: string;
  color: string;
  delay: number;
}

function ContinueCard({ icon: Icon, title, subtitle, progress, to, action, color, delay }: CardProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
        <Icon size={24} />
      </div>
      <h4 className="text-lg font-bold text-secondary dark:text-white">{title}</h4>
      <p className="mt-1 flex-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t('dashboard.progress', 'Progress')}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2 }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400"
            />
          </div>
        </div>
      )}
      <Link
        to={to}
        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary transition group-hover:gap-3"
      >
        {action} <ArrowRight size={16} className="rtl:rotate-180" />
      </Link>
    </motion.div>
  );
}

interface Props {
  insights: StudentInsights;
}

export function ContinueLearning({ insights }: Props) {
  const { t } = useTranslation();
  const current = insights.in_progress;
  const nextExam = insights.recommended_exams[0];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {current ? (
        <ContinueCard
          icon={PlayCircle}
          title={t('dashboard.continueLearning.lastExam')}
          subtitle={`${current.title} · ${current.answered}/${current.total}`}
          progress={current.total ? Math.round((current.answered * 100) / current.total) : 0}
          to={`/user/exam/${current.id}/show`}
          action={t('dashboard.continueLearning.continue')}
          color="bg-rose-100 text-rose-600"
          delay={0.1}
        />
      ) : (
        <ContinueCard
          icon={PlayCircle}
          title={t('dashboard.continueLearning.noExamInProgress')}
          subtitle={t('dashboard.continueLearning.noExamInProgressDesc')}
          to="/user/exam/create"
          action={t('dashboard.createExam')}
          color="bg-rose-100 text-rose-600"
          delay={0.1}
        />
      )}
      <ContinueCard
        icon={BookOpen}
        title={nextExam ? nextExam.title : t('dashboard.continueLearning.browseExams')}
        subtitle={nextExam?.category || t('dashboard.continueLearning.browseExamsDesc')}
        to={nextExam ? `/exams/${nextExam.id}` : '/exams'}
        action={nextExam ? t('exams.startExam') : t('dashboard.browseExams')}
        color="bg-blue-100 text-blue-600"
        delay={0.2}
      />
      <ContinueCard
        icon={RotateCcw}
        title={t('dashboard.continueLearning.practice')}
        subtitle={
          insights.wrong_questions > 0
            ? t('dashboard.aiRecommendations.wrongTitle', { count: insights.wrong_questions })
            : t('dashboard.continueLearning.practiceDesc')
        }
        to="/user/exam/create"
        action={t('dashboard.createExam')}
        color="bg-emerald-100 text-emerald-600"
        delay={0.3}
      />
    </div>
  );
}
