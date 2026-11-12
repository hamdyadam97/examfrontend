import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleSlash, Gauge, Hourglass, Timer, XCircle, type LucideIcon } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useCountUp } from '@/hooks/useCountUp';
import type { Analytics } from './types';
import { STATUS_COLORS } from './types';
import { clock, duration, percent } from './format';

function Count({ value }: { value: number }) {
  return <>{useCountUp(value, 1000)}</>;
}

interface Card {
  key: string;
  icon: LucideIcon;
  tone: string;
  label: string;
  value: React.ReactNode;
  sub: string;
  bar?: number;
}

export function StatCards({ data }: { data: Analytics }) {
  const { t } = useTranslation();
  const { summary: s, time } = data;
  const share = (n: number) => percent(s.total ? Math.round((n * 1000) / s.total) / 10 : 0);

  const cards: Card[] = [
    { key: 'correct', icon: CheckCircle2, tone: 'text-emerald-500 bg-emerald-500/10', label: t('results.cards.correct'), value: <Count value={s.correct} />, sub: share(s.correct) },
    { key: 'wrong', icon: XCircle, tone: 'text-rose-500 bg-rose-500/10', label: t('results.cards.wrong'), value: <Count value={s.wrong} />, sub: share(s.wrong) },
    { key: 'unanswered', icon: CircleSlash, tone: 'text-slate-500 bg-slate-500/10', label: t('results.cards.unanswered'), value: <Count value={s.unanswered} />, sub: share(s.unanswered) },
    {
      key: 'time', icon: Timer, tone: 'text-blue-500 bg-blue-500/10', label: t('results.cards.time'),
      value: clock(time.elapsed_seconds),
      sub: time.limit_seconds ? t('results.cards.ofLimit', { limit: clock(time.limit_seconds) }) : t('results.cards.noLimit'),
    },
    {
      key: 'avg', icon: Hourglass, tone: 'text-violet-500 bg-violet-500/10', label: t('results.cards.avg'),
      value: time.has_question_timing ? duration(time.avg_answered_seconds, t) : '—',
      sub: time.has_question_timing ? t('results.cards.perAnswered') : t('results.cards.notRecorded'),
    },
    {
      key: 'completion', icon: Gauge, tone: 'text-amber-500 bg-amber-500/10', label: t('results.cards.completion'),
      value: `${Math.round(s.completion)}%`, sub: t('results.cards.answeredOf', { answered: s.answered, total: s.total }), bar: s.completion,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileHover={{ y: -3 }}
            className="rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-[#1E293B]"
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.tone}`}><Icon size={20} aria-hidden /></span>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{c.label}</p>
            <p className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">{c.value}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.sub}</p>
            {c.bar !== undefined && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-[#263449]">
                <motion.div className="h-full rounded-full bg-amber-500" initial={{ width: 0 }} animate={{ width: `${c.bar}%` }} transition={{ duration: 0.9 }} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

/** Donut of correct / wrong / unanswered with a legend that does not rely on colour alone. */
export function AnswerDistribution({ data }: { data: Analytics }) {
  const { t } = useTranslation();
  const s = data.summary;
  const slices = [
    { key: 'correct' as const, value: s.correct, label: t('results.cards.correct') },
    { key: 'wrong' as const, value: s.wrong, label: t('results.cards.wrong') },
    { key: 'unanswered' as const, value: s.unanswered, label: t('results.cards.unanswered') },
  ];
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1E293B]">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{t('results.distribution')}</h2>
      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices.filter((x) => x.value > 0)} dataKey="value" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="none" isAnimationActive>
                {slices.filter((x) => x.value > 0).map((x) => <Cell key={x.key} fill={STATUS_COLORS[x.key]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="w-full space-y-2">
          {slices.map((x) => (
            <li key={x.key} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-[#263449]">
              <span className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[x.key] }} aria-hidden />
                {x.label}
              </span>
              <span className="tabular-nums font-bold text-slate-900 dark:text-white">
                {x.value} <span className="text-slate-400">({s.total ? Math.round((x.value * 100) / s.total) : 0}%)</span>
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between px-3 pt-1 text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t('results.accuracy')}</span>
            <span className="font-bold text-slate-900 dark:text-white">{s.accuracy === null ? t('results.notAvailable') : `${s.accuracy}%`}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
