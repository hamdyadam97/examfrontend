import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, TrendingUp, CheckCircle2, BookOpen, Loader2, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';
import { SectionCard } from '@/components/dashboard/SectionCard';
import type { Exam } from '@/components/dashboard/RecentExams';
import { emptyInsights, type StudentInsights } from '@/types/insights';
import type { DashboardStats } from './DashboardPage';

const PASS_SCORE = 50;

export function GradesPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<StudentInsights>(emptyInsights);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/home').then((res) => setStats(res.data?.data || null)),
      api.get('/dashboard/insights').then((res) => setInsights({ ...emptyInsights, ...(res.data?.data || {}) })),
      api.get('/exams/get?status=completed&per_page=100').then((res) => setExams(res.data?.data?.exams || [])),
    ])
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={36} /></div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-secondary dark:text-white">{t('dashboard.sidebar.myGrades')}</h1>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label={t('dashboard.stats.averageScore')} value={stats?.average_score ?? 0} suffix="%" color="bg-blue-100 text-blue-600" />
        <StatCard icon={Trophy} label={t('dashboard.stats.bestScore')} value={stats?.best_score ?? 0} suffix="%" color="bg-amber-100 text-amber-600" />
        <StatCard icon={CheckCircle2} label={t('dashboard.achievements.passedExams')} value={insights.achievements.passed_exams} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={TrendingUp} label={t('dashboard.stats.successRate')} value={stats?.success_rate ?? 0} suffix="%" color="bg-purple-100 text-purple-600" />
      </section>

      <SectionCard title={t('grades.bySpecialty')}>
        {insights.categories.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.performance.empty')}</p>
        ) : (
          <div className="space-y-4">
            {insights.categories.map((c) => (
              <div key={c.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-bold text-secondary dark:text-white">{c.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {c.accuracy}% · {t('grades.questionsAnswered', { count: c.answered })}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full ${c.accuracy >= 75 ? 'bg-emerald-500' : c.accuracy >= PASS_SCORE ? 'bg-amber-400' : 'bg-rose-500'}`}
                    style={{ width: `${c.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title={t('grades.examScores')}>
        {exams.length === 0 ? (
          <div className="py-10 text-center">
            <GraduationCap className="mx-auto mb-3 text-slate-400" size={40} />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('grades.empty')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <th className="py-3 text-start">{t('grades.exam')}</th>
                  <th className="py-3 text-start">{t('grades.date')}</th>
                  <th className="py-3 text-start">{t('grades.correct')}</th>
                  <th className="py-3 text-start">{t('dashboard.recentExams.score')}</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {exams.map((exam) => {
                  const total = exam.total_questions || exam.question_count || 0;
                  const score = total ? Math.round(((exam.correct_answers ?? 0) * 100) / total) : 0;
                  return (
                    <tr key={exam.id}>
                      <td className="py-3 font-bold text-secondary dark:text-white">{exam.title || `${t('exam.exam')} #${exam.id}`}</td>
                      <td className="py-3 text-slate-500">{exam.created_at?.split('T')[0]}</td>
                      <td className="py-3 text-slate-500">{exam.correct_answers ?? 0}/{total}</td>
                      <td className={`py-3 font-extrabold ${score >= PASS_SCORE ? 'text-emerald-600' : 'text-rose-600'}`}>{score}%</td>
                      <td className="py-3 text-end">
                        <Link to={`/user/exam/${exam.id}/result`} className="text-sm font-bold text-primary hover:underline">
                          {t('dashboard.recentExams.viewResult')}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
