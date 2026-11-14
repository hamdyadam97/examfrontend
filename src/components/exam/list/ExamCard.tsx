import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarDays, FileText } from 'lucide-react';
import { examTheme } from '@/components/packages/examTheme';

export interface ExamItem {
  id: number;
  title?: string | null;
  mode?: string;
  status: string;
  question_count?: number | null;
  total_questions?: number | null;
  correct_answers?: number | null;
  wrong_answers?: number | null;
  details_count?: number;
  created_at?: string;
  path?: string[];
  score?: number | null;
  categories?: { id: number; name: string }[];
}

type Tone = 'progress' | 'passed' | 'failed';
const TONE: Record<Tone, { pill: string; dot: string; ring: string; icon: string }> = {
  progress: { pill: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300', dot: 'bg-blue-500', ring: '#3B82F6', icon: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300' },
  passed: { pill: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', dot: 'bg-emerald-500', ring: '#10B981', icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' },
  failed: { pill: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300', dot: 'bg-rose-500', ring: '#F43F5E', icon: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300' },
};

function Ring({ value, color }: { value: number; color: string }) {
  const reduce = useReducedMotion();
  const size = 52;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-100 dark:stroke-slate-800" />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (Math.min(value, 100) / 100) * c }}
        transition={{ duration: reduce ? 0 : 0.9, ease: 'easeOut' }} />
    </svg>
  );
}

export function ExamCard({ exam, passMark, index }: { exam: ExamItem; passMark: number; index: number }) {
  const { t, i18n } = useTranslation();
  const Arrow = i18n.dir() === 'rtl' ? ArrowLeft : ArrowRight;
  const completed = exam.status === 'completed';
  const total = exam.total_questions || exam.question_count || 0;
  const answered = exam.details_count ?? 0;
  const correct = exam.correct_answers ?? 0;
  const score = completed ? exam.score ?? (total ? Math.round((correct * 1000) / total) / 10 : 0) : null;
  const tone: Tone = !completed ? 'progress' : (score ?? 0) >= passMark ? 'passed' : 'failed';
  const style = TONE[tone];

  const path = exam.path?.length ? exam.path : exam.categories?.map((c) => c.name) || [];
  const title = path.length > 1 ? path[path.length - 1] : exam.title && exam.title !== 'Exam' ? exam.title : path[0] || `${t('exam.exam')} #${exam.id}`;
  const subtitle = path.length > 1 ? path.slice(0, -1).join(' · ') : null;
  const Icon = examTheme(path).icon;
  const date = exam.created_at
    ? new Date(exam.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const progress = total ? Math.round((answered * 100) / total) : 0;
  const statusLabel = tone === 'progress' ? t('myExams.status.inProgress') : tone === 'passed' ? t('myExams.status.passed') : t('myExams.status.failed');

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.3 }}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      {/* Head: specialty icon, names, status */}
      <div className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
          <Icon size={22} strokeWidth={1.8} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-6 text-slate-900 dark:text-slate-100" title={title}>{title}</h3>
          <p className="truncate text-[13px] leading-5 text-slate-500 dark:text-slate-400" title={subtitle || undefined}>{subtitle || ' '}</p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.pill}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />
          {statusLabel}
        </span>
      </div>

      {/* Body: score or progress */}
      <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
        {completed && score !== null ? (
          <div className="flex items-center gap-4">
            <Ring value={score} color={style.ring} />
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none tabular-nums text-slate-900 dark:text-white">{Math.round(score)}%</p>
              <p className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">{t('myExams.card.scoreLine', { correct, total })}</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline justify-between">
              <p className="text-[13px] font-medium text-slate-600 dark:text-slate-300">{t('myExams.card.progress')}</p>
              <p className="text-[13px] tabular-nums text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-900 dark:text-white">{answered}</span> / {total}
              </p>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700">
              <motion.div className="h-full rounded-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7 }} />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('myExams.card.percentDone', { percent: progress })}</p>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="mt-4 flex items-center gap-4 text-[13px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} aria-hidden /> {date}</span>
        <span className="inline-flex items-center gap-1.5"><FileText size={15} aria-hidden /> {t('myExams.card.questionsN', { count: total })}</span>
      </div>

      {/* Action */}
      <div className="mt-auto pt-5">
        <Link
          to={completed ? `/user/exam/${exam.id}/result` : `/user/exam/${exam.id}/show`}
          className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 ${
            completed
              ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {completed ? t('myExams.card.viewResult') : t('myExams.card.continue')}
          <Arrow size={16} className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </motion.article>
  );
}
