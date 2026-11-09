import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bookmark, BookmarkCheck, Loader2, PlayCircle, XCircle, Flag, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface CollectionQuestion {
  id: number;
  text: string;
  category: string | null;
  date: string;
  times_wrong: number | null;
  saved: boolean;
}

/** Each list and the exam-creation mode that drills exactly those questions. */
const kinds = {
  saved: { icon: Bookmark, mode: 'savedOnly' },
  wrong: { icon: XCircle, mode: 'wrongOnly' },
  flagged: { icon: Flag, mode: 'flaggedOnly' },
} as const;
type Kind = keyof typeof kinds;

export function QuestionCollectionPage() {
  const { t } = useTranslation();
  const { kind } = useParams<{ kind: string }>();
  // Stored with the list it belongs to, so switching lists shows the spinner until the new one arrives.
  const [result, setResult] = useState<{ kind: string; questions: CollectionQuestion[] } | null>(null);
  const valid = !!kind && kind in kinds;

  useEffect(() => {
    if (!valid || !kind) return;
    let active = true;
    api.get(`/questions/collection/${kind}`)
      .then((res) => active && setResult({ kind, questions: res.data?.data?.questions || [] }))
      .catch(() => active && setResult({ kind, questions: [] }));
    return () => { active = false; };
  }, [kind, valid]);

  const loading = result?.kind !== kind;
  const questions = loading ? [] : result?.questions ?? [];
  const setQuestions = (update: (prev: CollectionQuestion[]) => CollectionQuestion[]) =>
    setResult((prev) => (prev ? { ...prev, questions: update(prev.questions) } : prev));

  if (!valid) return <Navigate to="/user/dashboard" replace />;
  const { icon: Icon, mode } = kinds[kind as Kind];

  const toggleSave = async (q: CollectionQuestion) => {
    try {
      if (q.saved) await api.delete(`/questions/${q.id}/save`);
      else await api.post(`/questions/${q.id}/save`);
      setQuestions((prev) =>
        kind === 'saved' && q.saved
          ? prev.filter((x) => x.id !== q.id)
          : prev.map((x) => (x.id === q.id ? { ...x, saved: !q.saved } : x)),
      );
    } catch {
      toast.error(t('examPlayer.alerts.saveFailed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon size={22} /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-secondary dark:text-white">{t(`questionCollection.${kind}.title`)}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t(`questionCollection.${kind}.subtitle`)}</p>
          </div>
        </div>
        {questions.length > 0 && (
          <Link
            to={`/user/exam/create?mode=${mode}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90"
          >
            <PlayCircle size={18} /> {t('questionCollection.practice')}
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={36} /></div>
      ) : questions.length === 0 ? (
        <div className="rounded-3xl bg-white py-16 text-center shadow-sm dark:bg-slate-800">
          <Icon className="mx-auto mb-3 text-slate-400" size={40} />
          <p className="text-slate-600 dark:text-slate-300">{t(`questionCollection.${kind}.empty`)}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-800">
              <div className="min-w-0 flex-1">
                <p className="text-secondary dark:text-slate-100">{q.text || `#${q.id}`}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {q.category && <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-700">{q.category}</span>}
                  <span className="flex items-center gap-1"><Calendar size={12} /> {q.date?.split('T')[0]}</span>
                  {q.times_wrong ? <span className="font-bold text-rose-600">{t('questionCollection.timesWrong', { count: q.times_wrong })}</span> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleSave(q)}
                aria-label={q.saved ? t('examPlayer.alerts.unsavedQuestion') : t('examPlayer.alerts.savedQuestion')}
                className={`shrink-0 rounded-xl p-2 transition ${q.saved ? 'text-primary hover:bg-primary/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              >
                {q.saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
