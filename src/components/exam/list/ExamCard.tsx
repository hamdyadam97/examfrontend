import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BarChart3, BookOpen, CalendarDays, CheckCircle2, Clock3, ListChecks, PlayCircle, XCircle } from 'lucide-react';

export interface ExamItem {
  id: number;
  title?: string | null;
  mode?: string;
  status: string;
  question_count?: number | null;
  total_questions?: number | null;
  correct_answers?: number | null;
  details_count?: number;
  created_at?: string;
  path?: string[];
  score?: number | null;
  categories?: { id: number; name: string }[];
}

type Tone = 'progress' | 'passed' | 'failed';
const TONES: Record<Tone, { chip: string; accent: string; ring: string }> = {
  progress: { chip: 'bg-blue-500/10 text-blue-600 ring-blue-500/30 dark:text-sky-300', accent: 'from-blue-500 to-cyan-400', ring: '#3B82F6' },
  passed: { chip: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-300', accent: 'from-emerald-500 to-teal-400', ring: '#10B981' },
  failed: { chip: 'bg-rose-500/10 text-rose-600 ring-rose-500/30 dark:text-rose-300', accent: 'from-rose-500 to-orange-400', ring: '#F43F5E' },
};

function ScoreRing({ value, color }: { value: number; color: string }) {
  const reduce = useReducedMotion();
  const size = 76;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${value}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-200 dark:stroke-slate-700" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (Math.min(value, 100) / 100) * c }}
          transition={{ duration: reduce ? 0 : 1, ease: 'easeOut' }} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-base font-black tabular-nums text-slate-900 dark:text-white">{Math.round(value)}%</span>
    </div>
  );
}

export function ExamCard({ exam, passMark, index }: { exam: ExamItem; passMark: number; index: number }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const completed = exam.status === 'completed';
  const total = exam.total_questions || exam.question_count || 0;
  const answered = exam.details_count ?? 0;
  const score = completed ? exam.score ?? (total ? Math.round(((exam.correct_answers ?? 0) * 1000) / total) / 10 : 0) : null;
  const tone: Tone = !completed ? 'progress' : (score ?? 0) >= passMark ? 'passed' : 'failed';
  const style = TONES[tone];
  const path = exam.path?.length ? exam.path : exam.categories?.map((c) => c.name) || [];
  const title = path.length > 1 ? path[path.length - 1] : exam.title && exam.title !== 'Exam' ? exam.title : path[0] || `${t('exam.exam')} #${exam.id}`;
  const subtitle = path.length > 1 ? path.slice(0, -1).join(' › ') : null;
  const date = exam.created_at ? new Date(exam.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const progress = total ? Math.round((answered * 100) / total) : 0;
  const StatusIcon = tone === 'progress' ? Clock3 : tone === 'passed' ? CheckCircle2 : XCircle;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ y: -4 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl dark:border-slate-700/60 dark:bg-[#111C33] dark:hover:shadow-blue-950/40"
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${style.accent}`} aria-hidden />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${style.chip}`}>
            <StatusIcon size={14} aria-hidden />
            {tone === 'progress' ? t('myExams.status.inProgress') : tone === 'passed' ? t('myExams.status.passed') : t('myExams.status.failed')}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <CalendarDays size={13} aria-hidden /> {date}
          </span>
        </div>

        <div className="mt-4 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            {subtitle && <p className="truncate text-xs font-semibold text-sky-600 dark:text-sky-300" title={subtitle}>{subtitle}</p>}
            <h3 className="mt-0.5 line-clamp-2 text-lg font-extrabold leading-snug text-slate-900 dark:text-white" title={title}>{title}</h3>
          </div>
          {completed && score !== null && <ScoreRing value={score} color={style.ring} />}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-[#1A2742]">
            <BookOpen size={16} className="shrink-0 text-blue-500" aria-hidden />
            <div className="min-w-0">
              <dt className="text-[11px] text-slate-500 dark:text-slate-400">{t('myExams.card.questions')}</dt>
              <dd className="font-bold tabular-nums text-slate-900 dark:text-white">{total}</dd>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-[#1A2742]">
            <ListChecks size={16} className="shrink-0 text-cyan-500" aria-hidden />
            <div className="min-w-0">
              <dt className="text-[11px] text-slate-500 dark:text-slate-400">{t('myExams.card.answered')}</dt>
              <dd className="font-bold tabular-nums text-slate-900 dark:text-white">{answered} / {total}</dd>
            </div>
          </div>
        </dl>

        {!completed && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{t('myExams.card.progress')}</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-[#1A2742]">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
            </div>
          </div>
        )}
        {completed && (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            {t('myExams.card.scoreLine', { correct: exam.correct_answers ?? 0, total })}
          </p>
        )}

        <div className="mt-auto pt-5">
          <Link
            to={completed ? `/user/exam/${exam.id}/result` : `/user/exam/${exam.id}/show`}
            className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 ${
              completed
                ? 'border border-slate-200 text-slate-800 hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-white dark:hover:border-sky-400'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/25 hover:brightness-110'
            }`}
          >
            {completed ? <BarChart3 size={18} aria-hidden /> : <PlayCircle size={18} aria-hidden />}
            {completed ? t('myExams.card.viewResult') : t('myExams.card.continue')}
            <Arrow size={16} className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
