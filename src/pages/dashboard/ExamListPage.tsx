import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, BookOpen, CheckCircle2, XCircle, Clock, Loader2, ClipboardList, PlusCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { Exam } from '@/components/dashboard/RecentExams';

const PER_PAGE = 10;
const PASS_SCORE = 50;
const tabs = ['all', 'in_progress', 'completed'] as const;
type Tab = (typeof tabs)[number];

interface Page {
  exams: Exam[];
  pagination?: { count: number; next: string | null; previous: string | null };
}

export function ExamListPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const status: Tab = tabs.includes(searchParams.get('status') as Tab) ? (searchParams.get('status') as Tab) : 'all';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const requestKey = `${status}:${page}`;
  // The response is stored with the request it answers, so a new tab or page shows the spinner until it arrives.
  const [result, setResult] = useState<{ key: string; data: Page | null } | null>(null);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE) });
    if (status !== 'all') params.set('status', status);
    api.get(`/exams/get?${params}`)
      .then((res) => active && setResult({ key: requestKey, data: res.data?.data || null }))
      .catch(() => active && setResult({ key: requestKey, data: null }));
    return () => { active = false; };
  }, [status, page, requestKey]);

  const loading = result?.key !== requestKey;
  const data = loading ? null : result?.data ?? null;

  const go = (next: { status?: Tab; page?: number }) => {
    const params = new URLSearchParams();
    const s = next.status ?? status;
    if (s !== 'all') params.set('status', s);
    const p = next.page ?? 1;
    if (p > 1) params.set('page', String(p));
    setSearchParams(params);
  };

  const total = data?.pagination?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const exams = data?.exams || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-secondary dark:text-white">
          {status === 'completed' ? t('dashboard.sidebar.examHistory') : t('dashboard.sidebar.myExams')}
        </h1>
        <Link to="/user/exam/create" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90">
          <PlusCircle size={18} /> {t('dashboard.createExam')}
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => go({ status: tab })}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${
              status === tab ? 'bg-secondary text-white' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {t(`examList.tabs.${tab}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={36} /></div>
      ) : exams.length === 0 ? (
        <div className="rounded-3xl bg-white py-16 text-center shadow-sm dark:bg-slate-800">
          <ClipboardList className="mx-auto mb-3 text-slate-400" size={40} />
          <p className="text-slate-600 dark:text-slate-300">{t('dashboard.recentExams.empty')}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-3xl bg-white px-5 shadow-sm dark:divide-slate-700 dark:bg-slate-800">
          {exams.map((exam) => {
            const completed = exam.status === 'completed';
            const count = exam.total_questions || exam.question_count || 0;
            const score = completed && count ? Math.round(((exam.correct_answers ?? 0) * 100) / count) : null;
            return (
              <div key={exam.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-secondary dark:text-white">{exam.title || `${t('exam.exam')} #${exam.id}`}</p>
                    {score !== null ? (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        score >= PASS_SCORE ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                        {score >= PASS_SCORE ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                        {score >= PASS_SCORE ? t('dashboard.recentExams.pass') : t('dashboard.recentExams.fail')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                        <Clock size={10} /> {t('dashboard.recentExams.inProgress')}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {exam.categories?.[0] && <span>{exam.categories.map((c) => c.name).join('، ')}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> {exam.created_at?.split('T')[0] || '-'}</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {count}</span>
                    {score !== null ? (
                      <span className="font-bold text-secondary dark:text-slate-200">{t('dashboard.recentExams.score')}: {score}%</span>
                    ) : (
                      <span>{t('dashboard.recentExams.answered', { answered: exam.details_count ?? 0, total: count })}</span>
                    )}
                  </div>
                </div>
                <Link
                  to={completed ? `/user/exam/${exam.id}/result` : `/user/exam/${exam.id}/show`}
                  className="self-start rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20 sm:self-auto"
                >
                  {completed ? t('dashboard.recentExams.viewResult') : t('dashboard.continueLearning.continue')}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => go({ page: page - 1 })}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm disabled:opacity-40 dark:bg-slate-800 dark:text-white"
          >
            {t('examList.previous')}
          </button>
          <span className="text-sm text-slate-500">{page} / {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => go({ page: page + 1 })}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-secondary shadow-sm disabled:opacity-40 dark:bg-slate-800 dark:text-white"
          >
            {t('examList.next')}
          </button>
        </div>
      )}
    </div>
  );
}
