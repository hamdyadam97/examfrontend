import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Bookmark, BookmarkCheck, CheckCircle2, ChevronLeft, ChevronRight, CircleSlash, Clock, Grid3x3, Loader2, X, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import type { Analytics, QuestionRow, ReviewFilter } from './types';
import { duration } from './format';

interface QuestionData {
  id: number;
  text_question: string;
  correct_answer_id: number | null;
  notes: string | null;
  question_image?: string | null;
  answers: { id: number; answer: string }[];
}

const LETTERS = 'ABCDEFGHIJ';
const STATUS_STYLE = {
  correct: 'border-emerald-500 bg-emerald-500 text-white',
  wrong: 'border-rose-500 bg-rose-500 text-white',
  unanswered: 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-[#263449] dark:text-slate-300',
};
const STATUS_ICON = { correct: CheckCircle2, wrong: XCircle, unanswered: CircleSlash };

export function QuestionReview({ data, filter, setFilter }: { data: Analytics; filter: ReviewFilter; setFilter: (f: ReviewFilter) => void }) {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [current, setCurrent] = useState<number | null>(null);
  const [cache, setCache] = useState<Record<number, QuestionData>>({});
  const [failed, setFailed] = useState<Set<number>>(() => new Set());
  const [saved, setSaved] = useState<Set<number>>(() => new Set(data.questions.filter((q) => q.saved).map((q) => q.question_id)));
  const [navOpen, setNavOpen] = useState(false);

  const subjects = useMemo(() => [...new Set(data.questions.map((q) => q.subject).filter(Boolean))] as string[], [data]);
  const list = useMemo(() => data.questions.filter((q) => {
    if (filter.numbers && !filter.numbers.includes(q.number)) return false;
    if (filter.status === 'marked' && !q.marked) return false;
    if (filter.status !== 'all' && filter.status !== 'marked' && q.status !== filter.status) return false;
    if (subject && q.subject !== subject) return false;
    return true;
  }), [data, filter, subject]);

  const active: QuestionRow | undefined = list.find((q) => q.number === current) || list[0];
  const position = active ? list.indexOf(active) : -1;

  useEffect(() => {
    if (!active || cache[active.question_id] || failed.has(active.question_id)) return;
    let cancelled = false;
    const qid = active.question_id;
    api.get(`/exams/${qid}/get-question?exam_id=${data.exam.id}`)
      .then((res) => { if (!cancelled) setCache((c) => ({ ...c, [qid]: res.data?.data?.question })); })
      .catch(() => {
        if (cancelled) return;
        setFailed((f) => new Set(f).add(qid));
        toast.error(t('results.review.loadError'));
      });
    return () => { cancelled = true; };
  }, [active, cache, failed, data.exam.id, t]);

  const toggleSave = async (qid: number) => {
    const on = !saved.has(qid);
    setSaved((s) => { const n = new Set(s); if (on) n.add(qid); else n.delete(qid); return n; });
    try {
      if (on) await api.post(`/questions/${qid}/save`);
      else await api.delete(`/questions/${qid}/save`);
      toast.success(on ? t('results.review.saved') : t('results.review.unsaved'));
    } catch {
      setSaved((s) => { const n = new Set(s); if (on) n.delete(qid); else n.add(qid); return n; });
    }
  };

  const counts = {
    all: data.questions.length,
    correct: data.summary.correct,
    wrong: data.summary.wrong,
    unanswered: data.summary.unanswered,
    marked: data.questions.filter((q) => q.marked).length,
  };
  const chips: ReviewFilter['status'][] = ['all', 'correct', 'wrong', 'unanswered', 'marked'];
  const q = active ? cache[active.question_id] : undefined;

  const navigator = (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-5">
      {list.map((row) => {
        const Icon = STATUS_ICON[row.status];
        return (
          <button
            key={row.number} type="button"
            onClick={() => { setCurrent(row.number); setNavOpen(false); }}
            aria-label={`${t('results.q')} ${row.number} — ${t(`results.review.status.${row.status}`)}`}
            aria-current={active?.number === row.number}
            className={`relative flex h-10 items-center justify-center rounded-lg border text-sm font-bold transition ${STATUS_STYLE[row.status]} ${active?.number === row.number ? 'ring-4 ring-violet-500/40' : ''}`}
          >
            {row.number}
            <Icon size={10} className="absolute end-0.5 top-0.5 opacity-80" aria-hidden />
          </button>
        );
      })}
    </div>
  );

  return (
    <section id="review" className="scroll-mt-24 rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1E293B] print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('results.review.title')}</h2>
        <button type="button" onClick={() => setNavOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 dark:border-slate-600 dark:text-slate-200 lg:hidden">
          <Grid3x3 size={16} aria-hidden /> {t('results.review.navigator')}
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <button key={c} type="button" onClick={() => { setFilter({ status: c }); setCurrent(null); }}
            aria-pressed={filter.status === c && !filter.numbers}
            className={`min-h-10 rounded-full border px-3 text-sm font-bold transition ${filter.status === c && !filter.numbers ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 text-slate-700 hover:border-violet-400 dark:border-slate-600 dark:text-slate-200'}`}>
            {t(`results.review.filters.${c}`)} <span className="opacity-70">({counts[c]})</span>
          </button>
        ))}
        {subjects.length > 1 && (
          <select value={subject} onChange={(e) => { setSubject(e.target.value); setCurrent(null); }} aria-label={t('results.review.bySubject')}
            className="min-h-10 rounded-full border border-slate-200 bg-white px-3 text-sm dark:border-slate-600 dark:bg-[#263449] dark:text-white">
            <option value="">{t('results.review.allSubjects')}</option>
            {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
      {filter.numbers && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-violet-700 dark:text-violet-300">
          {t('results.review.filteredBy', { name: filter.label })}
          <button type="button" onClick={() => setFilter({ status: 'all' })} className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 font-bold"><X size={12} /> {t('results.review.clear')}</button>
        </p>
      )}

      {list.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-600">{t('results.review.empty')}</p>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.article key={active?.number} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
              className="min-w-0 rounded-2xl border border-slate-100 p-4 dark:border-slate-700/60 sm:p-5">
              {active && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white dark:bg-white dark:text-slate-900">{t('results.q')} {active.number}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${active.status === 'correct' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : active.status === 'wrong' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'}`}>
                      {(() => { const I = STATUS_ICON[active.status]; return <I size={14} aria-hidden />; })()}
                      {t(`results.review.status.${active.status}`)}
                    </span>
                    {active.seconds !== null && <span className="inline-flex items-center gap-1 text-xs text-slate-500"><Clock size={12} aria-hidden /> {duration(active.seconds, t)}</span>}
                    {[active.subject, ...active.sections, ...active.topics].filter(Boolean).map((tag) => (
                      <span key={tag} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">{tag}</span>
                    ))}
                    <button type="button" onClick={() => toggleSave(active.question_id)} className="ms-auto inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#263449]">
                      {saved.has(active.question_id) ? <BookmarkCheck size={16} className="text-violet-600" /> : <Bookmark size={16} />}
                      {saved.has(active.question_id) ? t('results.review.savedLabel') : t('results.review.save')}
                    </button>
                  </div>

                  {!q ? (
                    <div className="flex justify-center py-16">
                      {failed.has(active.question_id)
                        ? <p className="text-sm text-slate-500">{t('results.review.loadError')}</p>
                        : <Loader2 className="animate-spin text-violet-500" size={28} />}
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-slate mt-4 max-w-none text-slate-800 dark:prose-invert dark:text-slate-100 [&_img]:max-h-80 [&_img]:rounded-xl" dangerouslySetInnerHTML={{ __html: q.text_question }} />
                      {q.question_image && <img src={q.question_image} alt="" className="mt-3 max-h-80 rounded-xl" />}
                      <ul className="mt-4 space-y-2">
                        {q.answers.map((a, i) => {
                          const isCorrect = q.correct_answer_id === a.id;
                          const isChosen = active.answer_id === a.id;
                          const tone = isCorrect
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : isChosen ? 'border-rose-500 bg-rose-500/10' : 'border-slate-200 dark:border-slate-700';
                          return (
                            <li key={a.id} className={`flex items-start gap-3 rounded-xl border-2 p-3 ${tone}`}>
                              <span className="mt-0.5 font-extrabold text-slate-400">{LETTERS[i]}.</span>
                              <div className="min-w-0 flex-1 text-slate-800 [overflow-wrap:anywhere] dark:text-slate-100 [&_img]:max-h-40" dangerouslySetInnerHTML={{ __html: a.answer }} />
                              <span className="flex shrink-0 flex-col items-end gap-1 text-xs font-bold">
                                {isCorrect && <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300"><CheckCircle2 size={14} /> {t('results.review.correctAnswer')}</span>}
                                {isChosen && <span className={`inline-flex items-center gap-1 ${isCorrect ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}>{isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {t('results.review.yourAnswer')}</span>}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      {active.status === 'unanswered' && <p className="mt-3 text-sm font-semibold text-slate-500">{t('results.review.notAnswered')}</p>}
                      <div className="mt-4 rounded-2xl bg-blue-500/5 p-4 ring-1 ring-blue-500/20">
                        <p className="mb-1 font-extrabold text-blue-700 dark:text-blue-300">{t('results.review.explanation')}</p>
                        {q.notes ? (
                          <div className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-200" dangerouslySetInnerHTML={{ __html: q.notes }} />
                        ) : (
                          <p className="text-sm text-slate-500">{t('results.review.noExplanation')}</p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <button type="button" disabled={position <= 0} onClick={() => setCurrent(list[position - 1].number)}
                      className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200">
                      <ChevronRight size={16} className="ltr:rotate-180" /> {t('results.review.prev')}
                    </button>
                    <span className="text-sm tabular-nums text-slate-500">{position + 1} / {list.length}</span>
                    <button type="button" disabled={position >= list.length - 1} onClick={() => setCurrent(list[position + 1].number)}
                      className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 disabled:opacity-40 dark:border-slate-600 dark:text-slate-200">
                      {t('results.review.next')} <ChevronLeft size={16} className="ltr:rotate-180" />
                    </button>
                  </div>
                </>
              )}
            </motion.article>
          </AnimatePresence>

          {/* Navigator: side column on desktop, sheet on mobile */}
          <aside className="hidden lg:block">
            <p className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-200">{t('results.review.navigator')}</p>
            <div className="max-h-[560px] overflow-y-auto pe-1">{navigator}</div>
          </aside>
        </div>
      )}

      <AnimatePresence>
        {navOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-end bg-slate-900/50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNavOpen(false)}>
            <motion.div role="dialog" aria-modal="true" aria-label={t('results.review.navigator')} initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}
              onClick={(e) => e.stopPropagation()} className="max-h-[70vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-[#1E293B]">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-extrabold text-slate-900 dark:text-white">{t('results.review.navigator')}</p>
                <button type="button" onClick={() => setNavOpen(false)} aria-label={t('common.close', 'Close')} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-[#263449]"><X size={18} /></button>
              </div>
              {navigator}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
