import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Info, Rabbit, Snail, Turtle, Zap } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import type { Analytics } from './types';
import { STATUS_COLORS } from './types';
import { clock, duration } from './format';

export function TimeAnalytics({ data }: { data: Analytics }) {
  const { t } = useTranslation();
  const { isDark } = useDarkMode();
  const time = data.time;
  const tick = isDark ? '#94A3B8' : '#64748B';
  const grid = isDark ? '#334155' : '#E2E8F0';

  const facts = [
    { label: t('results.time.limit'), value: time.limit_seconds ? clock(time.limit_seconds) : t('results.time.untimed') },
    { label: t('results.time.elapsed'), value: clock(time.elapsed_seconds) },
    { label: t('results.time.remaining'), value: time.remaining_seconds === null ? '—' : clock(time.remaining_seconds) },
    { label: t('results.time.avg'), value: duration(time.avg_answered_seconds, t) },
    { label: t('results.time.fastest'), value: time.fastest ? `${t('results.q')} ${time.fastest.number} · ${duration(time.fastest.seconds, t)}` : '—' },
    { label: t('results.time.slowest'), value: time.slowest ? `${t('results.q')} ${time.slowest.number} · ${duration(time.slowest.seconds, t)}` : '—' },
    { label: t('results.time.avgCorrect'), value: duration(time.avg_correct_seconds, t) },
    { label: t('results.time.avgWrong'), value: duration(time.avg_wrong_seconds, t) },
  ];

  const bars = data.questions.filter((q) => q.seconds !== null).map((q) => ({ n: q.number, seconds: q.seconds as number, status: q.status }));
  const quadrants = time.quadrants;
  const quads = quadrants ? [
    { key: 'fast_correct', icon: Zap, tone: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-300', value: quadrants.fast_correct },
    { key: 'slow_correct', icon: Turtle, tone: 'text-blue-600 bg-blue-500/10 dark:text-blue-300', value: quadrants.slow_correct },
    { key: 'fast_wrong', icon: Rabbit, tone: 'text-amber-600 bg-amber-500/10 dark:text-amber-300', value: quadrants.fast_wrong },
    { key: 'slow_wrong', icon: Snail, tone: 'text-rose-600 bg-rose-500/10 dark:text-rose-300', value: quadrants.slow_wrong },
  ] : [];

  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1E293B]">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('results.time.title')}</h2>

      <dl className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-[#263449]">
            <dt className="text-xs text-slate-500 dark:text-slate-400">{f.label}</dt>
            <dd className="mt-0.5 text-sm font-bold tabular-nums text-slate-900 dark:text-white">{f.value}</dd>
          </div>
        ))}
      </dl>

      {!time.has_question_timing ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300">
          <Info size={18} className="mt-0.5 shrink-0 text-violet-500" aria-hidden />
          {t('results.time.noPerQuestion')}
        </p>
      ) : (
        <>
          <h3 className="mt-6 text-sm font-bold text-slate-700 dark:text-slate-200">{t('results.time.perQuestion')}</h3>
          <div className="mt-2 h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="n" tick={{ fill: tick, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: tick, fontSize: 11 }} axisLine={false} tickLine={false} unit="s" />
                <Tooltip
                  cursor={{ fill: isDark ? 'rgba(148,163,184,0.08)' : 'rgba(15,23,42,0.04)' }}
                  contentStyle={{ borderRadius: 12, border: 'none', background: isDark ? '#263449' : '#fff', color: isDark ? '#F8FAFC' : '#0F172A' }}
                  formatter={(v) => [duration(Number(v), t), t('results.time.seconds')]}
                  labelFormatter={(n) => `${t('results.q')} ${n}`}
                />
                <ReferenceLine y={time.target_seconds} stroke="#F59E0B" strokeDasharray="5 4" label={{ value: t('results.time.target'), fill: '#F59E0B', fontSize: 11, position: 'insideTopRight' }} />
                <Bar dataKey="seconds" radius={[6, 6, 0, 0]} isAnimationActive>
                  {bars.map((b) => <Cell key={b.n} fill={STATUS_COLORS[b.status]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('results.time.legend', { target: duration(time.target_seconds, t) })}</p>

          {quads.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
              {quads.map((q) => {
                const Icon = q.icon;
                return (
                  <div key={q.key} className={`rounded-xl p-3 ${q.tone}`}>
                    <Icon size={18} aria-hidden />
                    <p className="mt-1 text-2xl font-extrabold tabular-nums">{q.value}</p>
                    <p className="text-xs font-semibold">{t(`results.time.quad.${q.key}`)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
