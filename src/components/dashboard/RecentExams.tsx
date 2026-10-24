import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, BookOpen, ChevronRight, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { SectionCard } from './SectionCard';

/** An exam trail as returned by GET /exams/get. */
export interface Exam {
  id: number;
  title?: string;
  status?: string;
  categories?: { id: number; name: string }[];
  created_at?: string;
  question_count?: number;
  total_questions?: number;
  correct_answers?: number;
  wrong_answers?: number;
  details_count?: number;
}

const PASS_SCORE = 50;

interface Props {
  exams: Exam[];
}

export function RecentExams({ exams }: Props) {
  const { t } = useTranslation();

  const recent = exams.slice(0, 5);

  return (
    <SectionCard
      title={t('dashboard.recentExams.title')}
      action={
        <Link
          to="/user/exam"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
        >
          {t('common.viewAll', 'View all')} <ChevronRight size={16} />
        </Link>
      }
      className="lg:col-span-2"
    >
      {recent.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 py-12 text-center dark:bg-slate-700/30">
          <Calendar className="mx-auto mb-3 text-slate-400" size={40} />
          <p className="text-slate-600 dark:text-slate-300">{t('dashboard.recentExams.empty')}</p>
          <Link
            to="/user/exam/create"
            className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            {t('dashboard.createExam')}
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {recent.map((exam) => {
            const completed = exam.status === 'completed';
            const total = exam.total_questions || exam.question_count || 0;
            const score = completed && total ? Math.round(((exam.correct_answers ?? 0) * 100) / total) : null;
            const pass = score !== null && score >= PASS_SCORE;
            return (
              <div
                key={exam.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-secondary dark:text-white">{exam.title || `${t('exam.exam')} #${exam.id}`}</p>
                    {completed ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          pass ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20'
                        }`}
                      >
                        {pass ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {pass ? t('dashboard.recentExams.pass') : t('dashboard.recentExams.fail')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-500/20">
                        <Clock size={10} /> {t('dashboard.recentExams.inProgress')}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {exam.categories?.[0] && <span>{exam.categories.map((c) => c.name).join('، ')}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> {exam.created_at?.split('T')[0] || '-'}</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {total}</span>
                    {score !== null ? (
                      <span className="font-bold text-secondary dark:text-slate-200">{t('dashboard.recentExams.score')}: {score}%</span>
                    ) : (
                      <span>{t('dashboard.recentExams.answered', { answered: exam.details_count ?? 0, total })}</span>
                    )}
                  </div>
                </div>
                <Link
                  to={completed ? `/user/exam/${exam.id}/result` : `/user/exam/${exam.id}/show`}
                  className="self-start rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary/20 sm:self-auto"
                >
                  {completed ? t('dashboard.recentExams.viewResult') : t('dashboard.continueLearning.continue')}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
