import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpDown, CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, Clock3, FileStack, Gauge, LayoutGrid,
  PlusCircle, Search, SearchX, Sparkles, Trophy, XCircle, type LucideIcon,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useCountUp } from '@/hooks/useCountUp';
import { ExamCard, type ExamItem } from '@/components/exam/list/ExamCard';

const PER_PAGE = 12;
const FILTERS = ['all', 'in_progress', 'completed', 'passed', 'failed'] as const;
type Filter = (typeof FILTERS)[number];
const SORTS = ['-date', 'date', '-score', 'score'] as const;
type Sort = (typeof SORTS)[number];
const FILTER_ICONS: Record<Filter, LucideIcon> = { all: LayoutGrid, in_progress: Clock3, completed: FileStack, passed: CheckCircle2, failed: XCircle };

interface Stats { total: number; in_progress: number; completed: number; passed: number; average_score: number | null }
interface Response {
  exams: ExamItem[];
  pagination?: { count: number };
  stats?: Stats;
  pass_mark?: number;
}

function Count({ value }: { value: number }) {
  return <>{useCountUp(value, 900)}</>;
}

export function ExamListPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [params, setParams] = useSearchParams();
  const status: Filter = FILTERS.includes(params.get('status') as Filter) ? (params.get('status') as Filter) : 'all';
  const ordering: Sort = SORTS.includes(params.get('ordering') as Sort) ? (params.get('ordering') as Sort) : '-date';
  const query = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [search, setSearch] = useState(query);
  const requestKey = `${status}|${ordering}|${query}|${page}`;
  // Each response is kept with the request it answers, so a new filter shows the skeleton until it arrives.
  const [result, setResult] = useState<{ key: string; data: Response | null } | null>(null);
  const [stats, setStats] = useState<{ stats: Stats; passMark: number } | null>(null);

  const update = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: 'q' in changes });
  };

  // Search as you type, once typing pauses.
  useEffect(() => {
    if (search === query) return;
    const id = setTimeout(() => update({ q: search.trim() }), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    let active = true;
    const qs = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE), ordering });
    if (status !== 'all') qs.set('status', status);
    if (query) qs.set('q', query);
    api.get(`/exams/get?${qs}`)
      .then((res) => {
        if (!active) return;
        const data: Response = res.data?.data;
        setResult({ key: requestKey, data });
        if (data?.stats) setStats({ stats: data.stats, passMark: data.pass_mark ?? 60 });
      })
      .catch(() => active && setResult({ key: requestKey, data: null }));
    return () => { active = false; };
  }, [status, ordering, query, page, requestKey]);

  const loading = result?.key !== requestKey;
  const failedToLoad = !loading && !result?.data;
  const exams = loading ? [] : result?.data?.exams || [];
  const count = result?.data?.pagination?.count ?? 0;
  const pages = Math.max(1, Math.ceil(count / PER_PAGE));
  const passMark = stats?.passMark ?? 60;
  const filtered = status !== 'all' || !!query;

  const statCards = [
    { key: 'total', icon: ClipboardList, tone: 'from-blue-600 to-blue-400', value: stats?.stats.total },
    { key: 'in_progress', icon: Clock3, tone: 'from-sky-500 to-cyan-400', value: stats?.stats.in_progress },
    { key: 'completed', icon: Trophy, tone: 'from-emerald-500 to-teal-400', value: stats?.stats.completed },
    { key: 'average', icon: Gauge, tone: 'from-indigo-500 to-blue-500', value: stats?.stats.average_score ?? undefined, suffix: '%' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0B1B3F] via-[#0F2A5F] to-[#0B4A6F] p-6 text-white shadow-lg sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -end-16 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 start-10 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
              <Sparkles size={24} className="text-cyan-300" aria-hidden /> {t('myExams.title')}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-blue-100/90 sm:text-base">{t('myExams.subtitle')}</p>
          </div>
          <Link to="/user/exam/create"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-extrabold text-[#0F2A5F] shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/50">
            <PlusCircle size={20} aria-hidden /> {t('myExams.create')}
          </Link>
        </div>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i }} whileHover={{ y: -3 }}
              className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700/60 dark:bg-[#111C33]">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${s.tone} text-white shadow-md`}><Icon size={22} aria-hidden /></span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{t(`myExams.stats.${s.key}`)}</p>
                <p className="text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                  {stats ? (s.value === undefined ? '—' : <><Count value={Math.round(s.value)} />{s.suffix || ''}</>) : <span className="inline-block h-7 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters, search, sort */}
      <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700/60 dark:bg-[#111C33] lg:flex-row lg:items-center">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 lg:pb-0" role="tablist" aria-label={t('myExams.filterLabel')}>
          {FILTERS.map((f) => {
            const Icon = FILTER_ICONS[f];
            const on = status === f;
            return (
              <button key={f} type="button" role="tab" aria-selected={on} onClick={() => update({ status: f === 'all' ? '' : f })}
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-3.5 text-sm font-bold transition ${on ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#1A2742]'}`}>
                <Icon size={16} aria-hidden /> {t(`myExams.filters.${f}`)}
              </button>
            );
          })}
        </div>
        <div className="flex flex-1 gap-2 lg:justify-end">
          <div className="relative min-w-0 flex-1 lg:max-w-xs">
            <Search size={17} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('myExams.search')} aria-label={t('myExams.search')}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-[#1A2742] dark:text-white" />
          </div>
          <label className="relative flex items-center">
            <ArrowUpDown size={16} className="pointer-events-none absolute start-3 text-slate-400" aria-hidden />
            <span className="sr-only">{t('myExams.sortLabel')}</span>
            <select value={ordering} onChange={(e) => update({ ordering: e.target.value === '-date' ? '' : e.target.value })}
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 ps-9 pe-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-[#1A2742] dark:text-white">
              {SORTS.map((s) => <option key={s} value={s}>{t(`myExams.sort.${s}`)}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* Exams */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[300px] animate-pulse rounded-[20px] border border-slate-200 bg-white p-5 dark:border-slate-700/60 dark:bg-[#111C33]">
              <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="mt-5 h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-6 grid grid-cols-2 gap-2"><div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" /></div>
              <div className="mt-8 h-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      ) : failedToLoad ? (
        <div className="rounded-[20px] border border-slate-200 bg-white p-10 text-center dark:border-slate-700/60 dark:bg-[#111C33]">
          <p className="font-bold text-slate-800 dark:text-white">{t('myExams.loadError')}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white">{t('common.retry', 'Try again')}</button>
        </div>
      ) : exams.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-600 dark:bg-[#111C33]">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/15 to-cyan-400/15 text-blue-600 dark:text-sky-300">
            {filtered ? <SearchX size={38} aria-hidden /> : <ClipboardList size={38} aria-hidden />}
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-white">{filtered ? t('myExams.emptyFiltered.title') : t('myExams.empty.title')}</h2>
          <p className="mt-2 max-w-md text-slate-600 dark:text-slate-300">{filtered ? t('myExams.emptyFiltered.text') : t('myExams.empty.text')}</p>
          {filtered ? (
            <button type="button" onClick={() => { setSearch(''); setParams(new URLSearchParams()); }} className="mt-6 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-800 hover:border-blue-400 dark:border-slate-600 dark:text-white">
              {t('myExams.clearFilters')}
            </button>
          ) : (
            <Link to="/user/exam/create" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25">
              <PlusCircle size={18} aria-hidden /> {t('myExams.create')}
            </Link>
          )}
        </motion.div>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('myExams.count', { count })}</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {exams.map((exam, i) => <ExamCard key={exam.id} exam={exam} passMark={passMark} index={i} />)}
          </div>
        </>
      )}

      {!loading && pages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2" aria-label={t('myExams.pages')}>
          <button type="button" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} aria-label={t('examList.previous')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 dark:border-slate-600 dark:bg-[#111C33] dark:text-white">
            {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
            .map((n, i, arr) => (
              <span key={n} className="flex items-center gap-2">
                {i > 0 && n - arr[i - 1] > 1 && <span className="text-slate-400">…</span>}
                <button type="button" onClick={() => update({ page: n > 1 ? String(n) : '' })} aria-current={n === page ? 'page' : undefined}
                  className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold ${n === page ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md' : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-400 dark:border-slate-600 dark:bg-[#111C33] dark:text-white'}`}>
                  {n}
                </button>
              </span>
            ))}
          <button type="button" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })} aria-label={t('examList.next')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 dark:border-slate-600 dark:bg-[#111C33] dark:text-white">
            {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </nav>
      )}
    </div>
  );
}
