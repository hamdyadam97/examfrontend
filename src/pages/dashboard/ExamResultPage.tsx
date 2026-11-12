import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { isAxiosError } from 'axios';
import { api, type ApiError } from '@/lib/api';
import { ResultsDashboard, ResultsSkeleton } from '@/components/exam/results/ResultsDashboard';
import type { Analytics } from '@/components/exam/results/types';

type State = { status: 'loading' } | { status: 'ready'; data: Analytics } | { status: 'in_progress' } | { status: 'error' };

export function ExamResultPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    api.get(`/exams/${id}/analytics`)
      .then((res) => setState({ status: 'ready', data: res.data?.data }))
      .catch((err) => {
        // The server keeps results hidden until an exam-mode attempt is submitted.
        const inProgress = isAxiosError<ApiError>(err) && !!err.response?.data?.errors?.ExamInProgress;
        setState({ status: inProgress ? 'in_progress' : 'error' });
      });
  }, [id]);

  if (state.status === 'in_progress') return <Navigate to={`/user/exam/${id}/show`} replace />;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 dark:bg-[#080D1D] sm:px-6 lg:py-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl">
        {state.status === 'loading' && <ResultsSkeleton />}
        {state.status === 'error' && (
          <div className="mx-auto mt-20 max-w-md rounded-[20px] border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#1E293B]">
            <AlertTriangle className="mx-auto text-amber-500" size={36} />
            <p className="mt-3 font-bold text-slate-800 dark:text-white">{t('examResult.loadError')}</p>
            <Link to="/user/exam" className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white">{t('results.backToExams')}</Link>
          </div>
        )}
        {state.status === 'ready' && <ResultsDashboard data={state.data} />}
      </div>
    </div>
  );
}
