import { useEffect, useState, type ComponentProps } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { api, type ApiError } from '@/lib/api';
import { ResultsView } from '@/components/exam/ResultsView';

type ResultsProps = ComponentProps<typeof ResultsView>;

interface ResultData {
  exam: ResultsProps['exam'];
  exam_report: ResultsProps['examReport'];
}

type State = { status: 'loading' } | { status: 'ready'; data: ResultData } | { status: 'in_progress' } | { status: 'error' };

export function ExamResultPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    api.get(`/exams/${id}/get`)
      .then((res) => setState({ status: 'ready', data: res.data?.data }))
      .catch((err) => {
        // The server keeps results hidden until an exam-mode attempt is submitted.
        const inProgress = isAxiosError<ApiError>(err) && !!err.response?.data?.errors?.ExamInProgress;
        setState({ status: inProgress ? 'in_progress' : 'error' });
      });
  }, [id]);

  if (state.status === 'in_progress') return <Navigate to={`/user/exam/${id}/show`} replace />;

  if (state.status !== 'ready') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        {state.status === 'error' ? (
          <p className="text-slate-600 dark:text-slate-300">{t('examResult.loadError')}</p>
        ) : (
          <Loader2 className="animate-spin text-primary" size={40} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <ResultsView exam={state.data.exam} examReport={state.data.exam_report} examId={Number(id)} />
      </div>
    </div>
  );
}
