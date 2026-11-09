import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, FileText, XCircle, Compass, ArrowRight, Sparkles } from 'lucide-react';
import { SectionCard } from './SectionCard';
import type { StudentInsights } from '@/types/insights';

interface Props {
  insights: StudentInsights;
}

interface Recommendation {
  key: string;
  icon: typeof Brain;
  color: string;
  title: string;
  desc: string;
  to: string;
}

/** Suggestions derived from the student's own results: weakest topics, wrong answers and untaken exams. */
export function AiRecommendations({ insights }: Props) {
  const { t } = useTranslation();
  const recs: Recommendation[] = [];

  const weakest = insights.topics.weak[0] || insights.topics.needs_improvement[0];
  if (weakest) {
    recs.push({
      key: `topic-${weakest.id}`,
      icon: Brain,
      color: 'bg-purple-100 text-purple-600',
      title: weakest.name,
      desc: t('dashboard.aiRecommendations.reviewTopicDesc', { accuracy: weakest.accuracy }),
      to: '/user/exam/create',
    });
  }
  if (insights.wrong_questions > 0) {
    recs.push({
      key: 'wrong',
      icon: XCircle,
      color: 'bg-rose-100 text-rose-600',
      title: t('dashboard.aiRecommendations.wrongTitle', { count: insights.wrong_questions }),
      desc: t('dashboard.aiRecommendations.wrongDesc'),
      to: '/user/questions/wrong',
    });
  }
  insights.recommended_exams.slice(0, 2).forEach((exam) => {
    recs.push({
      key: `exam-${exam.id}`,
      icon: FileText,
      color: 'bg-primary/10 text-primary',
      title: exam.title,
      desc: [exam.category, exam.duration_minutes ? `${exam.duration_minutes} min` : null].filter(Boolean).join(' · ')
        || t('dashboard.aiRecommendations.recommendedExam'),
      to: `/exams/${exam.id}`,
    });
  });
  const untouched = insights.topics.untouched[0];
  if (untouched) {
    recs.push({
      key: `new-${untouched.id}`,
      icon: Compass,
      color: 'bg-amber-100 text-amber-600',
      title: untouched.name,
      desc: t('dashboard.aiRecommendations.newTopicDesc'),
      to: '/user/exam/create?mode=unusedOnly',
    });
  }

  return (
    <SectionCard title={t('dashboard.aiRecommendations.title')} className="lg:col-span-1">
      {recs.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 py-10 text-center dark:bg-slate-700/30">
          <Sparkles className="mx-auto mb-3 text-slate-400" size={36} />
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.aiRecommendations.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recs.map((rec) => {
            const Icon = rec.icon;
            return (
              <Link
                key={rec.key}
                to={rec.to}
                className="group flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${rec.color}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-secondary dark:text-white">{rec.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{rec.desc}</p>
                </div>
                <ArrowRight size={16} className="mt-2 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180" />
              </Link>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
