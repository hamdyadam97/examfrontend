import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { BookOpenCheck, CalendarDays, Clock, Download, Hash, ListChecks, Loader2, RotateCcw, Share2, Stethoscope, User } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { useCountUp } from '@/hooks/useCountUp';
import type { Analytics, Level } from './types';
import { clock } from './format';

const LEVEL_STYLE: Record<Level, { ring: string; badge: string }> = {
  excellent: { ring: '#10B981', badge: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-emerald-500/30' },
  very_good: { ring: '#2563EB', badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-300 ring-blue-500/30' },
  good: { ring: '#7C3AED', badge: 'bg-violet-500/15 text-violet-600 dark:text-violet-300 ring-violet-500/30' },
  needs_improvement: { ring: '#F59E0B', badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30' },
};

function ScoreRing({ score, correct, total, color }: { score: number; correct: number; total: number; color: string }) {
  const reduce = useReducedMotion();
  const size = 176;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const shown = useCountUp(Math.round(score));
  return (
    <div className="relative" style={{ width: size, height: size }} role="img" aria-label={`${score}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-200 dark:stroke-slate-700" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (Math.min(score, 100) / 100) * c }}
          transition={{ duration: reduce ? 0 : 1.3, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black tabular-nums text-slate-900 dark:text-white">{shown}%</span>
        <span className="mt-1 text-sm font-bold tabular-nums text-slate-500 dark:text-slate-400" dir="ltr">{correct}/{total}</span>
      </div>
    </div>
  );
}

export function ResultsHeader({ data, onReview }: { data: Analytics; onReview: () => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [retaking, setRetaking] = useState(false);
  const { exam, summary, time } = data;
  const style = LEVEL_STYLE[summary.level];
  const locale = i18n.language === 'ar' ? 'ar-JO' : 'en-GB';
  const when = exam.date ? new Date(exam.date).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const retake = async () => {
    setRetaking(true);
    try {
      const res = await api.post(`/exams/${exam.id}/retake`);
      navigate(`/user/exam/${res.data?.data?.exam_id}/show`);
    } catch (err) {
      toast.error(apiErrorMessage(err) || t('results.retakeFailed', 'Could not start a new attempt.'));
      setRetaking(false);
    }
  };

  // Shares a sentence only (no link): results stay private to the student's account.
  const share = async () => {
    const text = t('results.shareText', { score: summary.score, exam: exam.path.join(' › ') || exam.title });
    try {
      if (navigator.share) await navigator.share({ text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success(t('results.copied', 'Copied'));
      }
    } catch {
      /* the student closed the share sheet */
    }
  };

  const facts = [
    { icon: User, label: t('results.student'), value: exam.student || '—' },
    { icon: Stethoscope, label: t('results.specialty'), value: exam.path[exam.path.length - 1] || '—' },
    { icon: CalendarDays, label: t('results.date'), value: when },
    { icon: Hash, label: t('results.attempt'), value: `#${exam.attempt_number}` },
    { icon: ListChecks, label: t('results.questions'), value: String(summary.total) },
    { icon: Clock, label: t('results.timeSpent'), value: clock(time.elapsed_seconds) },
  ];

  const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-500/30';

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-[#1E293B] sm:p-7"
    >
      <div aria-hidden className="pointer-events-none absolute -end-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 blur-3xl" />
      <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-300">{exam.path.slice(0, -1).join(' › ') || t('results.examResult')}</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-slate-900 dark:text-white sm:text-3xl">
            {exam.path[exam.path.length - 1] || exam.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-extrabold ring-1 ${style.badge}`}>{t(`results.level.${summary.level}`)}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ring-1 ${summary.passed ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-600 ring-rose-500/30 dark:text-rose-300'}`}>
              {summary.passed ? t('results.passed') : t('results.notPassed')} · {t('results.passMark', { mark: summary.pass_mark })}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-[#263449] dark:text-slate-300">
              {t(`results.status.${exam.status}`, exam.status)}
            </span>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {facts.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex min-w-0 items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-[#263449]">
                  <Icon size={16} className="shrink-0 text-violet-500" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500 dark:text-slate-400">{f.label}</dt>
                    <dd className="truncate text-sm font-bold text-slate-900 dark:text-white" title={f.value}>{f.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>

          <div className="mt-5 flex flex-wrap gap-2 print:hidden">
            {exam.can_review && (
              <button type="button" onClick={onReview} className={`${btn} bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-600/20 hover:brightness-110`}>
                <BookOpenCheck size={18} /> {t('results.reviewAnswers')}
              </button>
            )}
            <button type="button" onClick={() => window.print()} className={`${btn} border border-slate-200 bg-white text-slate-800 hover:border-violet-400 dark:border-slate-600 dark:bg-[#263449] dark:text-white`}>
              <Download size={18} /> {t('results.downloadPdf')}
            </button>
            <button type="button" onClick={retake} disabled={retaking} className={`${btn} border border-slate-200 bg-white text-slate-800 hover:border-violet-400 disabled:opacity-60 dark:border-slate-600 dark:bg-[#263449] dark:text-white`}>
              {retaking ? <Loader2 size={18} className="animate-spin" /> : <RotateCcw size={18} />} {t('results.retake')}
            </button>
            <button type="button" onClick={share} className={`${btn} border border-slate-200 bg-white text-slate-800 hover:border-violet-400 dark:border-slate-600 dark:bg-[#263449] dark:text-white`}>
              <Share2 size={18} /> {t('results.share')}
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <ScoreRing score={summary.score} correct={summary.correct} total={summary.total} color={style.ring} />
        </div>
      </div>
    </motion.section>
  );
}
