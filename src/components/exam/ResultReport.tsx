import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpenCheck, CalendarDays, ClipboardList, FileText, Lightbulb, RotateCcw, Stethoscope, Timer, TrendingDown, TrendingUp, User } from 'lucide-react';
import type { RootState } from '@/store';

export interface ReportRow {
  name: string;
  correct: number;
  wrong: number;
  total: number;
  pct: number;
}

interface Props {
  examId: number;
  title?: string;
  createdAt?: string;
  path: string[];
  image: string;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  percentage: number;
  minutes?: number | null;
  rows: ReportRow[];
}

/**
 * The written part of the result, laid out like a clinical report: who, which exam, when, what the numbers
 * say in plain words, where the student is strong or weak, and what to do next. Rule-based, no AI.
 */
export function ResultReport({ examId, title, createdAt, path, image, total, correct, wrong, skipped, percentage, minutes, rows }: Props) {
  const { t, i18n } = useTranslation();
  const user = useSelector((state: RootState) => state.auth.user) as { first_name?: string; last_name?: string } | null;
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || '—';
  const answered = correct + wrong;
  const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
  const date = createdAt ? new Date(createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-JO' : 'en-GB', { dateStyle: 'long' }) : '';

  const ranked = rows.filter((r) => r.total > 0).sort((a, b) => b.pct - a.pct);
  const best = ranked.find((r) => r.pct >= 50);
  const worst = [...ranked].reverse().find((r) => r.pct < 60 && r !== best);

  const advice: string[] = [];
  if (skipped > 0) advice.push(t('report.advice.skipped', { count: skipped }));
  if (wrong > 0) advice.push(t('report.advice.reviewWrong', { count: wrong }));
  if (worst) advice.push(t('report.advice.practiceWeak', { name: worst.name }));
  if (percentage >= 80) advice.push(t('report.advice.harder'));
  else advice.push(t('report.advice.timed'));

  const facts = [
    { icon: User, label: t('report.student'), value: name },
    { icon: ClipboardList, label: t('report.exam'), value: path.length ? path.join(' › ') : title || '—' },
    { icon: CalendarDays, label: t('report.date'), value: date || '—' },
    { icon: Timer, label: t('report.duration'), value: minutes ? `${minutes} ${t('examResult.minutes', 'min')}` : '—' },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
    >
      {/* Report letterhead */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-slate-200 bg-gradient-to-l from-sky-50 to-white px-6 py-5 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl rounded-tr-md bg-gradient-to-br from-primary to-secondary text-white shadow-md">
            <Stethoscope size={24} />
          </span>
          <div>
            <p className="text-lg font-extrabold text-secondary dark:text-white">{t('report.title')}</p>
            <p className="text-xs font-semibold text-slate-500" dir="ltr">RootsExams · Medical Exams Platform</p>
          </div>
        </div>
        <span className="rounded-full bg-secondary/5 px-3 py-1 text-xs font-bold text-secondary dark:bg-white/10 dark:text-white">
          {t('report.number')} #{String(examId).padStart(5, '0')}
        </span>
      </header>

      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6 p-6">
          <dl className="grid gap-3 sm:grid-cols-2">
            {facts.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-700/40">
                  <Icon size={18} className="mt-0.5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500 dark:text-slate-400">{f.label}</dt>
                    <dd className="truncate font-bold text-secondary dark:text-white" title={f.value}>{f.value}</dd>
                  </div>
                </div>
              );
            })}
          </dl>

          <section>
            <h3 className="mb-2 flex items-center gap-2 font-extrabold text-secondary dark:text-white">
              <FileText size={18} className="text-primary" /> {t('report.summaryTitle')}
            </h3>
            <p className="leading-loose text-slate-700 dark:text-slate-200">
              {t('report.summary', { answered, total, correct, percentage, accuracy })}{' '}
              {best && t('report.best', { name: best.name, pct: best.pct })}{' '}
              {worst && t('report.worst', { name: worst.name, pct: worst.pct })}
            </p>
          </section>

          {ranked.length > 0 && (
            <section>
              <h3 className="mb-3 font-extrabold text-secondary dark:text-white">{t('report.bySubject')}</h3>
              <ul className="space-y-3">
                {ranked.slice(0, 6).map((r, i) => (
                  <li key={r.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 font-semibold text-secondary dark:text-white">
                        {r.pct >= 60 ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" />}
                        {r.name}
                      </span>
                      <span className="tabular-nums text-slate-500">{r.correct}/{r.total} · {r.pct}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <motion.div
                        className={`h-full rounded-full ${r.pct >= 60 ? 'bg-emerald-500' : r.pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(r.pct, 2)}%` }}
                        transition={{ delay: 0.7 + i * 0.1, duration: 0.9, ease: 'easeOut' }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <h3 className="mb-2 flex items-center gap-2 font-extrabold text-amber-800 dark:text-amber-200">
              <Lightbulb size={18} /> {t('report.adviceTitle')}
            </h3>
            <ol className="list-inside list-decimal space-y-1.5 text-sm leading-relaxed text-amber-900 dark:text-amber-100">
              {advice.map((a) => <li key={a}>{a}</li>)}
            </ol>
          </section>

          <div className="flex flex-wrap gap-3 print:hidden">
            <Link to={`/user/exam/${examId}/show`} className="inline-flex items-center gap-2 rounded-2xl bg-secondary px-5 py-2.5 text-sm font-bold text-white hover:bg-secondary/90">
              <BookOpenCheck size={18} /> {t('report.reviewAnswers')}
            </Link>
            <Link to="/user/exam/create" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-secondary hover:border-primary hover:text-primary dark:border-slate-600 dark:text-white">
              <RotateCcw size={18} /> {t('report.newExam')}
            </Link>
          </div>
        </div>

        {/* Medical photo of the exam's specialty */}
        <figure className="relative hidden min-h-[320px] overflow-hidden lg:block">
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/30 to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{t('report.specialty')}</p>
            <p className="mt-1 text-lg font-extrabold leading-snug">{path[path.length - 1] || title}</p>
          </figcaption>
        </figure>
      </div>
    </motion.article>
  );
}
