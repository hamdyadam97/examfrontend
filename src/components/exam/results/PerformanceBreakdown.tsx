import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowUpDown, Eye, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import type { Analytics, Group, ReviewFilter } from './types';
import { duration } from './format';

type Dimension = 'subjects' | 'sections' | 'topics';
type Sort = 'accuracy_desc' | 'accuracy_asc' | 'wrong_desc' | 'time_desc';
const MIN_SAMPLE = 3;

function sortGroups(groups: Group[], sort: Sort) {
  const acc = (g: Group) => g.accuracy ?? -1;
  const copy = [...groups];
  if (sort === 'accuracy_desc') copy.sort((a, b) => acc(b) - acc(a));
  if (sort === 'accuracy_asc') copy.sort((a, b) => acc(a) - acc(b));
  if (sort === 'wrong_desc') copy.sort((a, b) => b.wrong - a.wrong);
  if (sort === 'time_desc') copy.sort((a, b) => (b.avg_seconds ?? -1) - (a.avg_seconds ?? -1));
  return copy;
}

export function PerformanceBreakdown({ data, onShow }: { data: Analytics; onShow: (filter: ReviewFilter) => void }) {
  const { t } = useTranslation();
  const available = (['subjects', 'sections', 'topics'] as Dimension[]).filter((d) => data.breakdown[d].length > 0);
  const [dim, setDim] = useState<Dimension>(available[0] || 'subjects');
  const [sort, setSort] = useState<Sort>('accuracy_asc');
  const groups = useMemo(() => sortGroups(data.breakdown[dim] || [], sort), [data, dim, sort]);

  if (!available.length) return null;

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1E293B]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('results.breakdown.title')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-[#263449]" role="tablist">
            {available.map((d) => (
              <button
                key={d} type="button" role="tab" aria-selected={dim === d} onClick={() => setDim(d)}
                className={`min-h-9 rounded-lg px-3 text-sm font-bold transition ${dim === d ? 'bg-white text-violet-700 shadow dark:bg-[#1E293B] dark:text-violet-300' : 'text-slate-600 dark:text-slate-300'}`}
              >
                {t(`results.breakdown.${d}`)}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
            <ArrowUpDown size={16} aria-hidden />
            <span className="sr-only">{t('results.breakdown.sort')}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="min-h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm dark:border-slate-600 dark:bg-[#263449] dark:text-white">
              {(['accuracy_asc', 'accuracy_desc', 'wrong_desc', 'time_desc'] as Sort[]).map((s) => <option key={s} value={s}>{t(`results.breakdown.sorts.${s}`)}</option>)}
            </select>
          </label>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {groups.map((g, i) => (
          <motion.li key={g.name} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 10) * 0.03 }}
            className="rounded-2xl border border-slate-100 p-3 dark:border-slate-700/60">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="min-w-0 flex-1 font-bold leading-snug text-slate-900 [overflow-wrap:anywhere] dark:text-white">{g.name}</p>
              <span className="text-sm font-extrabold tabular-nums text-slate-900 dark:text-white">
                {g.accuracy === null ? t('results.notAvailable') : `${g.accuracy}%`}
              </span>
            </div>
            <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-[#263449]" role="img"
              aria-label={t('results.breakdown.barLabel', { correct: g.correct, wrong: g.wrong, unanswered: g.unanswered })}>
              {(['correct', 'wrong', 'unanswered'] as const).map((k) => (
                <motion.div key={k} className={k === 'correct' ? 'bg-emerald-500' : k === 'wrong' ? 'bg-rose-500' : 'bg-slate-400'}
                  initial={{ width: 0 }} animate={{ width: `${(g[k] * 100) / g.total}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="tabular-nums">
                {t('results.breakdown.counts', { total: g.total, correct: g.correct, wrong: g.wrong, unanswered: g.unanswered })}
                {g.avg_seconds !== null && ` · ${t('results.breakdown.avgTime', { time: duration(g.avg_seconds, t) })}`}
              </span>
              {data.exam.can_review && (
                <button type="button" onClick={() => onShow({ status: 'all', numbers: g.questions, label: g.name })}
                  className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 font-bold text-violet-700 hover:bg-violet-500/10 dark:text-violet-300 print:hidden">
                  <Eye size={14} aria-hidden /> {t('results.breakdown.showQuestions')}
                </button>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

/** Strong and weak areas; a group needs MIN_SAMPLE answered questions to be judged at all. */
export function StrengthsWeaknesses({ data, onShow }: { data: Analytics; onShow: (filter: ReviewFilter) => void }) {
  const { t } = useTranslation();
  const source = data.breakdown.topics.length ? data.breakdown.topics : data.breakdown.sections.length ? data.breakdown.sections : data.breakdown.subjects;
  const judged = source.filter((g) => g.correct + g.wrong >= MIN_SAMPLE && g.accuracy !== null);
  const strengths = judged.filter((g) => (g.accuracy as number) >= 70).sort((a, b) => (b.accuracy as number) - (a.accuracy as number)).slice(0, 5);
  const weaknesses = judged.filter((g) => (g.accuracy as number) < 60).sort((a, b) => (a.accuracy as number) - (b.accuracy as number)).slice(0, 5);
  const priority = (g: Group) => ((g.accuracy as number) < 40 || g.wrong >= 5 ? 'high' : (g.accuracy as number) < 50 ? 'medium' : 'low');
  const tooFew = judged.length === 0;

  const card = 'rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1E293B]';
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className={card}>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-emerald-600 dark:text-emerald-300"><TrendingUp size={20} aria-hidden /> {t('results.strengths')}</h2>
        {tooFew || !strengths.length ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{tooFew ? t('results.notEnoughData', { min: MIN_SAMPLE }) : t('results.noStrengths')}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {strengths.map((g) => (
              <li key={g.name} className="flex items-center justify-between gap-3 rounded-xl bg-emerald-500/10 px-3 py-2">
                <span className="min-w-0 font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-white">{g.name}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{g.accuracy}% · {t('results.answeredN', { n: g.correct + g.wrong })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={card}>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-rose-600 dark:text-rose-300"><TrendingDown size={20} aria-hidden /> {t('results.weaknesses')}</h2>
        {tooFew || !weaknesses.length ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{tooFew ? t('results.notEnoughData', { min: MIN_SAMPLE }) : t('results.noWeaknesses')}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {weaknesses.map((g) => {
              const p = priority(g);
              return (
                <li key={g.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-rose-500/10 px-3 py-2">
                  <span className="min-w-0 flex-1 font-semibold text-slate-900 [overflow-wrap:anywhere] dark:text-white">{g.name}</span>
                  <span className="text-sm font-bold tabular-nums text-rose-700 dark:text-rose-300">{g.accuracy}% · {t('results.wrongN', { n: g.wrong })}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${p === 'high' ? 'bg-rose-600 text-white' : p === 'medium' ? 'bg-amber-500 text-white' : 'bg-slate-500 text-white'}`}>
                    <ShieldAlert size={12} aria-hidden /> {t(`results.priority.${p}`)}
                  </span>
                  {data.exam.can_review && (
                    <button type="button" onClick={() => onShow({ status: 'all', numbers: g.questions, label: g.name })} className="min-h-8 rounded-lg px-2 text-xs font-bold text-violet-700 hover:bg-violet-500/10 dark:text-violet-300 print:hidden">
                      {t('results.reviewThese')}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
