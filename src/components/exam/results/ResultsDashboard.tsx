import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stethoscope } from 'lucide-react';
import type { Analytics, ReviewFilter } from './types';
import { ResultsHeader } from './ResultsHeader';
import { AnswerDistribution, StatCards } from './StatCards';
import { TimeAnalytics } from './TimeAnalytics';
import { PerformanceBreakdown, StrengthsWeaknesses } from './PerformanceBreakdown';
import { AttemptsTrend, StudyRecommendations } from './Recommendations';
import { QuestionReview } from './QuestionReview';

/** Medical exam performance dashboard (order follows the mobile reading order). */
export function ResultsDashboard({ data }: { data: Analytics }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ReviewFilter>({ status: 'all' });

  const goToReview = (f?: ReviewFilter) => {
    if (f) setFilter(f);
    requestAnimationFrame(() => document.getElementById('review')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="space-y-5">
      {/* Letterhead for the printed / PDF report */}
      <div className="hidden items-center gap-3 border-b border-slate-300 pb-3 print:flex">
        <Stethoscope size={28} />
        <div>
          <p className="text-xl font-extrabold">Roots Exams</p>
          <p className="text-xs">{t('results.printTitle')}</p>
        </div>
      </div>

      <ResultsHeader data={data} onReview={() => goToReview({ status: 'all' })} />
      <StatCards data={data} />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2"><TimeAnalytics data={data} /></div>
        <AnswerDistribution data={data} />
      </div>
      <PerformanceBreakdown data={data} onShow={goToReview} />
      <StrengthsWeaknesses data={data} onShow={goToReview} />
      <div className="grid gap-5 xl:grid-cols-2">
        <StudyRecommendations data={data} />
        <AttemptsTrend data={data} />
      </div>
      {data.exam.can_review ? (
        <QuestionReview data={data} filter={filter} setFilter={setFilter} />
      ) : (
        <p className="rounded-[20px] border border-dashed border-slate-300 p-6 text-center text-slate-500 dark:border-slate-600">{t('results.review.locked')}</p>
      )}
    </div>
  );
}

/** Placeholder with the page's shape while the analytics load. */
export function ResultsSkeleton() {
  const block = 'animate-pulse rounded-[20px] bg-slate-200/80 dark:bg-[#1E293B]';
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className={`${block} h-72`} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className={`${block} h-36`} />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <div className={`${block} h-80 xl:col-span-2`} />
        <div className={`${block} h-80`} />
      </div>
      <div className={`${block} h-96`} />
    </div>
  );
}
