import { useTranslation } from 'react-i18next';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Lightbulb, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import type { Analytics } from './types';
import { duration } from './format';

/**
 * Study advice from the attempt's own numbers (rule-based). AI-written advice is not enabled yet;
 * when it is, it will be added here without blocking the page.
 */
export function StudyRecommendations({ data }: { data: Analytics }) {
  const { t } = useTranslation();
  const { summary: s, time, breakdown } = data;
  const tips: string[] = [];
  const groups = breakdown.topics.length ? breakdown.topics : breakdown.sections.length ? breakdown.sections : breakdown.subjects;
  const weak = groups.filter((g) => g.correct + g.wrong >= 3 && (g.accuracy ?? 100) < 60).sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));
  const mostWrong = [...groups].filter((g) => g.wrong >= 2).sort((a, b) => b.wrong - a.wrong)[0];

  if (s.answered === 0) tips.push(t('results.tips.nothingAnswered'));
  if (s.unanswered > 0 && s.answered > 0) tips.push(t('results.tips.unanswered', { count: s.unanswered }));
  if (weak[0]) tips.push(t('results.tips.weakTopic', { name: weak[0].name, accuracy: weak[0].accuracy }));
  if (mostWrong && mostWrong !== weak[0]) tips.push(t('results.tips.repeatedMistakes', { name: mostWrong.name, count: mostWrong.wrong }));
  if (time.has_question_timing && time.slowest && time.slowest.seconds > time.target_seconds * 2) {
    tips.push(t('results.tips.slowQuestion', { n: time.slowest.number, time: duration(time.slowest.seconds, t) }));
  }
  if (time.quadrants && time.quadrants.fast_wrong >= 3) tips.push(t('results.tips.rushing', { count: time.quadrants.fast_wrong }));
  if (s.wrong > 0) tips.push(t('results.tips.reviewWrong', { count: s.wrong }));
  if (s.level === 'excellent') tips.push(t('results.tips.nextChallenge'));
  else if (s.level === 'needs_improvement') tips.push(t('results.tips.plan', { mark: s.pass_mark }));
  else tips.push(t('results.tips.timed'));

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1E293B]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Lightbulb size={20} className="text-amber-500" aria-hidden /> {t('results.tips.title')}</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
          <Sparkles size={12} aria-hidden /> {t('results.tips.aiSoon')}
        </span>
      </div>
      <ol className="mt-4 space-y-2">
        {tips.map((tip, i) => (
          <li key={tip} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-700 dark:bg-[#263449] dark:text-slate-200">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{i + 1}</span>
            {tip}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Score over the attempts of the same exam; shown from the second attempt on. */
export function AttemptsTrend({ data }: { data: Analytics }) {
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();
  const attempts = data.attempts;
  if (attempts.length < 2) return null;
  const current = attempts.find((a) => a.current) || attempts[attempts.length - 1];
  const index = attempts.indexOf(current);
  const previous = index > 0 ? attempts[index - 1] : null;
  const delta = previous ? Math.round((current.score - previous.score) * 10) / 10 : null;
  const mixedDifficulty = new Set(attempts.map((a) => a.difficulty ?? 0)).size > 1;
  const locale = i18n.language === 'ar' ? 'ar-JO' : 'en-GB';
  const points = attempts.map((a, i) => ({ name: `#${i + 1}`, score: a.score, accuracy: a.accuracy ?? undefined, date: new Date(a.date).toLocaleDateString(locale) }));
  const tick = isDark ? '#94A3B8' : '#64748B';

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1E293B]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('results.attempts.title')}</h2>
        {delta !== null && (
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-extrabold ${delta >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-600 dark:text-rose-300'}`}>
            {delta >= 0 ? <TrendingUp size={16} aria-hidden /> : <TrendingDown size={16} aria-hidden />}
            {t('results.attempts.improvement')}: {delta > 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      {mixedDifficulty && <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">{t('results.attempts.mixed')}</p>}
      <div className="mt-3 h-56" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#E2E8F0'} vertical={false} />
            <XAxis dataKey="name" tick={{ fill: tick, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: tick, fontSize: 12 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', background: isDark ? '#263449' : '#fff', color: isDark ? '#F8FAFC' : '#0F172A' }}
              labelFormatter={(_, p) => (p?.[0]?.payload?.date as string) || ''} />
            <Line type="monotone" dataKey="score" name={t('results.attempts.score')} stroke="#7C3AED" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="accuracy" name={t('results.accuracy')} stroke="#2563EB" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-start text-xs text-slate-500 dark:text-slate-400">
              {['attempt', 'date', 'score', 'accuracy', 'wrong', 'avgTime'].map((h) => <th key={h} className="px-2 py-1 text-start font-semibold">{t(`results.attempts.cols.${h}`)}</th>)}
            </tr>
          </thead>
          <tbody>
            {attempts.map((a, i) => (
              <tr key={a.id} className={`border-t border-slate-100 dark:border-slate-700/60 ${a.current ? 'font-bold text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-200'}`}>
                <td className="px-2 py-1.5">#{i + 1}</td>
                <td className="px-2 py-1.5">{new Date(a.date).toLocaleDateString(locale)}</td>
                <td className="px-2 py-1.5 tabular-nums">{a.score}%</td>
                <td className="px-2 py-1.5 tabular-nums">{a.accuracy === null ? '—' : `${a.accuracy}%`}</td>
                <td className="px-2 py-1.5 tabular-nums">{a.wrong}</td>
                <td className="px-2 py-1.5 tabular-nums">{duration(a.avg_seconds, t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
