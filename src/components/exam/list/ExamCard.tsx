import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, FileText, XCircle } from 'lucide-react';
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
const TONE: Record<Tone, { pill: string; score: string; icon: typeof Clock3 }> = {
  progress: { pill: 'bg-white text-blue-700', score: 'text-blue-600 dark:text-blue-400', icon: Clock3 },
  passed: { pill: 'bg-emerald-500 text-white', score: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
  failed: { pill: 'bg-rose-500 text-white', score: 'text-rose-600 dark:text-rose-400', icon: XCircle },
};

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex-1 rounded-xl bg-slate-50 px-2 py-2.5 text-center dark:bg-slate-800/70">
      <p className={`text-lg font-bold leading-none tabular-nums ${color}`}>{value}</p>
      <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export function ExamCard({ exam, passMark, index }: { exam: ExamItem; passMark: number; index: number }) {
  const { t, i18n } = useTranslation();
  const Arrow = i18n.dir() === 'rtl' ? ArrowLeft : ArrowRight;
  const completed = exam.status === 'completed';
  const total = exam.total_questions || exam.question_count || 0;
  const answered = exam.details_count ?? 0;
  const correct = exam.correct_answers ?? 0;
  const wrong = exam.wrong_answers ?? 0;
  const skipped = Math.max(total - correct - wrong, 0);
  const score = completed ? exam.score ?? (total ? Math.round((correct * 1000) / total) / 10 : 0) : null;
  const tone: Tone = !completed ? 'progress' : (score ?? 0) >= passMark ? 'passed' : 'failed';
  const style = TONE[tone];
  const StatusIcon = style.icon;

  const path = exam.path?.length ? exam.path : exam.categories?.map((c) => c.name) || [];
  const title = path.length > 1 ? path[path.length - 1] : exam.title && exam.title !== 'Exam' ? exam.title : path[0] || `${t('exam.exam')} #${exam.id}`;
  const subtitle = path.length > 1 ? path.slice(0, -1).join(' · ') : null;
  const theme = examTheme(path);
  const date = exam.created_at
    ? new Date(exam.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  const progress = total ? Math.round((answered * 100) / total) : 0;
  const statusLabel = tone === 'progress' ? t('myExams.status.inProgress') : tone === 'passed' ? t('myExams.status.passed') : t('myExams.status.failed');
  const pct = (n: number) => (total ? `${(n * 100) / total}%` : '0%');

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.35 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Cover: specialty photo with the exam name on it */}
      <div className="relative h-40 overflow-hidden bg-slate-200 dark:bg-slate-800">
        <img src={theme.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/10" />

        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow ${style.pill}`}>
            <StatusIcon size={14} aria-hidden /> {statusLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <CalendarDays size={13} aria-hidden /> {date}
          </span>
        </div>

        <div className="absolute inset-x-4 bottom-3.5">
          <h3 className="line-clamp-1 text-lg font-bold leading-7 text-white" title={title}>{title}</h3>
          {subtitle && <p className="line-clamp-1 text-[13px] leading-5 text-white/75" title={subtitle}>{subtitle}</p>}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        {completed && score !== null ? (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('myExams.card.score')}</p>
                <p className={`mt-1 text-3xl font-bold leading-none tabular-nums ${style.score}`}>{Math.round(score)}%</p>
              </div>
              <p className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                <FileText size={14} aria-hidden /> {t('myExams.card.questionsN', { count: total })}
              </p>
            </div>
            {/* correct / wrong / skipped split of all the questions */}
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: pct(correct) }} transition={{ duration: 0.7 }} />
              <motion.div className="h-full bg-rose-500" initial={{ width: 0 }} animate={{ width: pct(wrong) }} transition={{ duration: 0.7, delay: 0.15 }} />
            </div>
            <div className="mt-4 flex gap-2">
              <Stat value={correct} label={t('myExams.card.correct')} color="text-emerald-600 dark:text-emerald-400" />
              <Stat value={wrong} label={t('myExams.card.wrong')} color="text-rose-600 dark:text-rose-400" />
              <Stat value={skipped} label={t('myExams.card.skipped')} color="text-slate-700 dark:text-slate-200" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('myExams.card.progress')}</p>
                <p className="mt-1 text-3xl font-bold leading-none tabular-nums text-blue-600 dark:text-blue-400">{progress}%</p>
              </div>
              <p className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 dark:text-slate-400">
                <FileText size={14} aria-hidden /> {t('myExams.card.questionsN', { count: total })}
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <motion.div className="h-full rounded-full bg-blue-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.7 }} />
            </div>
            <div className="mt-4 flex gap-2">
              <Stat value={answered} label={t('myExams.card.answered')} color="text-blue-600 dark:text-blue-400" />
              <Stat value={Math.max(total - answered, 0)} label={t('myExams.card.remaining')} color="text-slate-700 dark:text-slate-200" />
            </div>
          </>
        )}

        <div className="mt-auto pt-5">
          <Link
            to={completed ? `/user/exam/${exam.id}/result` : `/user/exam/${exam.id}/show`}
            className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 ${
              completed
                ? 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800'
                : 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-700'
            }`}
          >
            {completed ? t('myExams.card.viewResult') : t('myExams.card.continue')}
            <Arrow size={16} className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
