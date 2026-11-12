import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { saveExamSingle, finishExam, advanceStage } from '@/store/examSlice';
import type { AppDispatch, RootState } from '@/store';

import { ExamHeader } from '@/components/exam/ExamHeader';
import { QuestionNavigator } from '@/components/exam/QuestionNavigator';
import { QuestionPanel } from '@/components/exam/QuestionPanel';
import { ExamSummary } from '@/components/exam/ExamSummary';
import { ExamToolbar } from '@/components/exam/ExamToolbar';
import { FinishDialog } from '@/components/exam/FinishDialog';

interface Detail {
  question_id: number;
  answer_id?: number | null;
  answer_ids?: number[];
  is_correct?: boolean | null;
  is_marked?: boolean;
  is_review?: boolean;
}

interface QuestionData {
  id: number;
  text_question: string;
  answers?: { id: number; answer: string }[];
  correct_answer_id?: number | string;
  correct_answer_ids?: number[];
  notes?: string;
  references?: string;
  question_type?: string;
}

/** Response of GET /exams/get-questions. */
interface ExamData {
  exam: {
    id: number;
    title: string;
    mode: string;
    status: string;
    duration?: number | null;
    remaining_seconds?: number | null;
  };
  questions: number[];
  details: Detail[];
  saved_question_ids?: number[];
  current_stage: number;
  total_stages: number;
  stage_offset?: number;
  is_last_stage?: boolean;
}

/** Client-clock deadline for a countdown the server reported in seconds. */
function deadlineFromNow(seconds: number) {
  return Date.now() + seconds * 1000;
}

export function ExamShowPage() {
  const { id } = useParams<{ id: string }>();
  const examId = Number(id);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<Record<number, QuestionData>>({});
  const [detailsMap, setDetailsMap] = useState<Record<number, Detail>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stageCompleted, setStageCompleted] = useState(false);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [review, setReview] = useState<Set<number>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({});
  const [showFinish, setShowFinish] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  // Deadline in client time, derived from the server's remaining_seconds so clock skew does not matter.
  const [deadlineMs, setDeadlineMs] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closingRef = useRef(false);
  const warnedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingSeconds = deadlineMs === null ? null : Math.max(0, Math.ceil((deadlineMs - now) / 1000));

  /** Leave the player for the result page once the server no longer accepts answers. */
  const closeExam = (message: string) => {
    if (closingRef.current) return;
    closingRef.current = true;
    toast.info(message);
    navigate(`/user/exam/${examId}/result`, { replace: true });
  };

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = t('examPlayer.alerts.unsavedChanges');
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [t]);

  // Callers that reload show the spinner themselves; the first load starts with loading=true.
  // State is only set once the response arrives, so this is safe to start from an effect.
  const loadExam = () =>
    api.get(`/exams/get-questions?exam_id=${examId}`)
      .then(async (res) => {
        const d: ExamData = res.data?.data;
        if (d?.exam?.status === 'completed') {
          closeExam(t('examPlayer.alerts.alreadyFinished'));
          return;
        }
        const remaining = d?.exam?.remaining_seconds;
        setDeadlineMs(typeof remaining === 'number' ? deadlineFromNow(remaining) : null);
        setData(d);
        const map: Record<number, Detail> = {};
        d.details?.forEach((det) => {
          map[det.question_id] = det;
        });
        setDetailsMap(map);
        setSaved(new Set<number>(d.saved_question_ids || []));
        setFlagged(new Set(Object.values(map).filter((det) => det.is_marked).map((det) => det.question_id)));
        setReview(new Set(Object.values(map).filter((det) => det.is_review).map((det) => det.question_id)));
        if (d.questions?.length) {
          await loadQuestion(d.questions[0]);
        }
      })
      .catch((err) => {
        const message = isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined;
        toast.error(message || 'Failed to load exam');
      })
      .finally(() => setLoading(false));

  const loadQuestion = async (qid: number) => {
    if (questions[qid]) return;
    try {
      const res = await api.get(`/exams/${qid}/get-question?exam_id=${examId}`);
      setQuestions((prev) => ({ ...prev, [qid]: res.data?.data?.question }));
    } catch {
      toast.error('Failed to load question');
    }
  };

  // 0 is never a real id, so lookups simply miss before the exam has loaded.
  const currentQid: number = data?.questions[currentIndex] ?? 0;
  const currentQuestion = questions[currentQid];
  const currentDetail = detailsMap[currentQid];
  const reviewMode = data?.exam?.mode === 'tatur' || data?.exam?.mode === 'review';

  const answeredCount = useMemo(
    () => data?.questions?.filter((qid: number) => detailsMap[qid]?.answer_id || selectedAnswers[qid]?.length).length || 0,
    [data, detailsMap, selectedAnswers]
  );
  const correctCount = useMemo(
    () => data?.questions?.filter((qid: number) => detailsMap[qid]?.is_correct).length || 0,
    [data, detailsMap]
  );
  const wrongCount = useMemo(
    () => data?.questions?.filter((qid: number) => detailsMap[qid]?.answer_id && detailsMap[qid]?.is_correct === false).length || 0,
    [data, detailsMap]
  );

  /** Save an answer (null clears it). The server grades it and, in tutor mode only, returns the correct answer. */
  const persistAnswer = async (qid: number, selected: number[]) => {
    if (!questions[qid]) return;
    const answerId = selected[0] ?? null;
    try {
      const res = await dispatch(
        saveExamSingle({
          examId,
          obj: { question_id: qid, answer_id: answerId, is_marked: flagged.has(qid) },
        })
      ).unwrap();
      const saved = res?.data ?? {};
      setDetailsMap((prev) => ({
        ...prev,
        [qid]: { ...prev[qid], answer_id: answerId, is_correct: saved.is_correct ?? null },
      }));
      if (saved.correct_answer_id !== undefined) {
        setQuestions((prev) => ({
          ...prev,
          [qid]: { ...prev[qid], correct_answer_id: saved.correct_answer_id, notes: saved.notes },
        }));
      }
    } catch (err) {
      const errors = (err as { errors?: Record<string, unknown> })?.errors;
      if (errors?.TimeUp) closeExam(t('examPlayer.alerts.timeUp'));
      else if (errors?.ExamFinished) closeExam(t('examPlayer.alerts.alreadyFinished'));
      // Anything else is transient; autosave will retry.
    }
  };

  useEffect(() => {
    loadExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  // Retry saving the current selection every 10s, but only while the server does not have it yet.
  useEffect(() => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    autoSaveRef.current = setInterval(() => {
      const qid = data?.questions?.[currentIndex];
      const selected = qid ? selectedAnswers[qid] : undefined;
      if (qid && selected?.length && detailsMap[qid]?.answer_id !== selected[0]) {
        persistAnswer(qid, selected);
      }
    }, 10000);
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
    // persistAnswer is recreated every render; the values it reads are the deps listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, data, selectedAnswers, detailsMap]);

  const handleTimeUp = async () => {
    if (closingRef.current) return;
    const qid = data?.questions?.[currentIndex];
    const selected = qid ? selectedAnswers[qid] : undefined;
    if (qid && selected?.length) await persistAnswer(qid, selected);
    try {
      await dispatch(finishExam(examId)).unwrap();
    } catch {
      // The server finishes timed-out exams on its own; the result page reads its state.
    }
    closeExam(t('examPlayer.alerts.timeUp'));
  };

  // The deadline timer fires once; it calls the latest handleTimeUp so it sees the current answer.
  const timeUpRef = useRef(handleTimeUp);
  useEffect(() => {
    timeUpRef.current = handleTimeUp;
  });
  useEffect(() => {
    if (deadlineMs === null) return;
    const timer = setTimeout(() => timeUpRef.current(), Math.max(0, deadlineMs - Date.now()));
    return () => clearTimeout(timer);
  }, [deadlineMs]);

  useEffect(() => {
    if (remainingSeconds === null) return;
    for (const mark of [300, 60]) {
      if (remainingSeconds <= mark && !warnedRef.current.has(mark)) {
        warnedRef.current.add(mark);
        toast.warning(t('examPlayer.alerts.timeWarning', { minutes: mark / 60 }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds]);

  const formatClock = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSingleAnswer = async (answerId: number) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQid]: [answerId] }));
    await persistAnswer(currentQid, [answerId]);
  };

  const handleToggleMultiple = (answerId: number) => {
    setSelectedAnswers((prev) => {
      const current = prev[currentQid] || [];
      const updated = current.includes(answerId) ? current.filter((id) => id !== answerId) : [...current, answerId];
      return { ...prev, [currentQid]: updated };
    });
  };

  const handleTrueFalse = async (value: boolean) => {
    const answerId = value ? 1 : 0;
    setSelectedAnswers((prev) => ({ ...prev, [currentQid]: [answerId] }));
    await persistAnswer(currentQid, [answerId]);
  };

  const handleClear = async () => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQid]: [] }));
    await persistAnswer(currentQid, []);
    toast.info(t('examPlayer.alerts.answerCleared'));
  };

  /** Toggle the current question in a set, persist it, and roll back if the server refuses. */
  const toggleSet = async (
    current: Set<number>,
    setter: React.Dispatch<React.SetStateAction<Set<number>>>,
    persist: (on: boolean) => Promise<unknown>,
    addMsg: string,
    removeMsg: string,
  ) => {
    const qid = currentQid;
    const on = !current.has(qid);
    const apply = (value: boolean) => setter((prev) => {
      const next = new Set(prev);
      if (value) next.add(qid); else next.delete(qid);
      return next;
    });
    apply(on);
    try {
      await persist(on);
      if (on) toast.success(addMsg); else toast.info(removeMsg);
    } catch {
      apply(!on);
      toast.error(t('examPlayer.alerts.saveFailed'));
    }
  };

  const saveQuestionState = (field: 'is_marked' | 'is_review') => (on: boolean) =>
    api.post(`/exams/${examId}/question-state`, { question_id: currentQid, [field]: on });

  const handleSave = () => toggleSet(
    saved, setSaved,
    (on) => (on ? api.post(`/questions/${currentQid}/save`) : api.delete(`/questions/${currentQid}/save`)),
    t('examPlayer.alerts.savedQuestion'), t('examPlayer.alerts.unsavedQuestion'),
  );
  const handleFlag = () => toggleSet(
    flagged, setFlagged, saveQuestionState('is_marked'),
    t('examPlayer.alerts.flagged'), t('examPlayer.alerts.unflagged'),
  );
  const handleReview = () => toggleSet(
    review, setReview, saveQuestionState('is_review'),
    t('examPlayer.alerts.reviewLaterAdded'), t('examPlayer.alerts.reviewLaterRemoved'),
  );

  const handleNavigate = (index: number) => {
    setCurrentIndex(index);
    const qid = data?.questions[index];
    if (qid) loadQuestion(qid);
  };

  // The last question of a stage leads to the stage summary, unless it is the final stage.
  const atStageEnd = !!data && currentIndex === data.questions.length - 1;
  const isLastStage = !data || (data.is_last_stage ?? data.current_stage >= data.total_stages);
  const handleNext = () => {
    if (!data) return;
    if (currentIndex < data.questions.length - 1) handleNavigate(currentIndex + 1);
    else if (!isLastStage) setStageCompleted(true);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) handleNavigate(currentIndex - 1);
  };

  const handleFinish = () => setShowFinish(true);

  const handleConfirmFinish = async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    try {
      await dispatch(finishExam(examId)).unwrap();
      navigate(`/user/exam/${examId}/result`, { replace: true });
    } catch (err) {
      closingRef.current = false;
      const apiErr = err as { statusCode?: number; code?: number; message?: string };
      toast.error(((apiErr?.statusCode || apiErr?.code) && apiErr?.message) || 'Failed to finish exam');
    }
  };

  const handleAdvance = async () => {
    await dispatch(advanceStage(examId)).unwrap();
    setStageCompleted(false);
    setLoading(true);
    await loadExam();
    setCurrentIndex(0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (loading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (stageCompleted) {
    const answeredInStage = data.questions.filter((qid) => data.details.find((d) => d.question_id === qid)?.answer_id).length;
    const unanswered = data.questions.length - answeredInStage;
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl dark:bg-slate-800">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-secondary dark:text-white">
            {t('examPlayer.stageDone.title', { n: data.current_stage, defaultValue: 'Stage {{n}} completed' })}
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {t('examPlayer.stageDone.progress', { n: data.current_stage, total: data.total_stages, defaultValue: 'Stage {{n}} of {{total}}' })}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
              <p className="text-2xl font-extrabold text-emerald-600">{answeredInStage}</p>
              <p className="text-slate-600 dark:text-slate-300">{t('examPlayer.stageDone.answered', 'Answered')}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 dark:bg-amber-500/10">
              <p className="text-2xl font-extrabold text-amber-600">{unanswered}</p>
              <p className="text-slate-600 dark:text-slate-300">{t('examPlayer.stageDone.unanswered', 'Not answered')}</p>
            </div>
          </div>
          {unanswered > 0 && (
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">{t('examPlayer.stageDone.warning', 'You cannot come back to this stage after moving on.')}</p>
          )}
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" onClick={handleAdvance} className="rounded-xl bg-primary px-8 py-3 font-bold text-white hover:bg-primary/90">
              {t('examPlayer.stageDone.start', { n: data.current_stage + 1, defaultValue: 'Start stage {{n}}' })}
            </button>
            <button type="button" onClick={() => setStageCompleted(false)} className="rounded-xl border border-slate-200 px-8 py-3 font-bold text-secondary hover:bg-slate-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
              {t('examPlayer.stageDone.back', 'Back to this stage')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const stageText = `${t('exam.stage')} ${data.current_stage}/${data.total_stages} • ${t('exam.question')} ${currentIndex + 1 + (data.stage_offset || 0)}`;
  const selectedIds = selectedAnswers[currentQid] || (currentDetail?.answer_id ? [Number(currentDetail.answer_id)] : []);
  const unanswered = data.questions.length - answeredCount;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <ExamHeader
        examTitle={data.exam?.title}
        stageText={stageText}
        timerText={
          remainingSeconds !== null
            ? `${t('examPlayer.summary.remainingTime')}: ${formatClock(remainingSeconds)}`
            : `${t('examPlayer.timer')}: ${formatClock(elapsedSeconds)}`
        }
        timerUrgent={remainingSeconds !== null && remainingSeconds <= 300}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onExit={() => navigate('/user/exam')}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-72 overflow-y-auto border-e border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 lg:block">
          <QuestionNavigator
            questionIds={data.questions}
            detailsMap={detailsMap}
            currentIndex={currentIndex}
            saved={saved}
            flagged={flagged}
            review={review}
            onNavigate={handleNavigate}
          />
        </aside>

        <main className="flex flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
          <div className="flex-1 overflow-y-auto p-4 lg:p-8">
            <div className="mx-auto max-w-4xl rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-10">
              <QuestionPanel
                question={currentQuestion}
                detail={currentDetail}
                reviewMode={reviewMode}
                onSingleAnswer={handleSingleAnswer}
                onToggleMultiple={handleToggleMultiple}
                onTrueFalse={handleTrueFalse}
                selectedIds={selectedIds}
                showExplanation={!!currentDetail?.answer_id || selectedIds.length > 0}
              />
            </div>
          </div>
          <ExamToolbar
            canPrevious={currentIndex > 0}
            canNext={!atStageEnd || !isLastStage}
            nextLabel={atStageEnd && !isLastStage ? t('examPlayer.toolbar.nextStage', 'Next stage') : undefined}
            isSaved={saved.has(currentQid)}
            isFlagged={flagged.has(currentQid)}
            isReview={review.has(currentQid)}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSave={handleSave}
            onFlag={handleFlag}
            onReview={handleReview}
            onClear={handleClear}
            onFinish={handleFinish}
          />
        </main>

        <aside className="hidden w-80 overflow-y-auto border-s border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 xl:block">
          <ExamSummary
            studentName={`${String(user.first_name || '')} ${String(user.last_name || '')}`.trim() || t('common.user')}
            examName={data.exam?.title}
            currentIndex={currentIndex}
            total={data.questions.length}
            answered={answeredCount}
            remaining={unanswered}
            correct={reviewMode ? correctCount : undefined}
            wrong={reviewMode ? wrongCount : undefined}
            saved={saved.size}
            flagged={flagged.size}
            review={review.size}
            elapsedSeconds={
              remainingSeconds !== null && data.exam?.duration
                ? Math.max(0, data.exam.duration * 60 - remainingSeconds)
                : elapsedSeconds
            }
            totalSeconds={data.exam?.duration ? data.exam.duration * 60 : undefined}
          />
        </aside>
      </div>

      {showFinish && (
        <FinishDialog
          unanswered={unanswered}
          flagged={flagged.size}
          review={review.size}
          onCancel={() => setShowFinish(false)}
          onConfirm={handleConfirmFinish}
        />
      )}
    </div>
  );
}
