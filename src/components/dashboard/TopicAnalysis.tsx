import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, Target, TrendingUp } from 'lucide-react';
import { SectionCard } from './SectionCard';
import type { StudentInsights } from '@/types/insights';

interface Props {
  insights: StudentInsights;
}

export function TopicAnalysis({ insights }: Props) {
  const { t } = useTranslation();
  const { strong, needs_improvement, weak, untouched } = insights.topics;

  const blocks: { key: string; icon: typeof CheckCircle2; color: string; items: { id: number; name: string; accuracy?: number }[] }[] = [
    { key: 'strongTopics', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10', items: strong },
    { key: 'weakTopics', icon: AlertCircle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-500/10', items: weak },
    { key: 'needsImprovement', icon: TrendingUp, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10', items: needs_improvement },
    { key: 'recommendedTopics', icon: Target, color: 'text-primary bg-teal-50 dark:bg-primary/10', items: untouched },
  ];

  return (
    <SectionCard title={t('dashboard.strengthWeakness.title')} className="lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2">
        {blocks.map((block) => {
          const Icon = block.icon;
          return (
            <div
              key={block.key}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-700/30"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${block.color}`}>
                  <Icon size={16} />
                </div>
                <h5 className="text-sm font-bold text-secondary dark:text-white">{t(`dashboard.strengthWeakness.${block.key}`)}</h5>
              </div>
              {block.items.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.strengthWeakness.empty')}</p>
              ) : (
                <ul className="space-y-2">
                  {block.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300"
                    >
                      <span className="truncate">{item.name}</span>
                      {item.accuracy !== undefined && <span className="shrink-0 text-xs font-bold">{item.accuracy}%</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-slate-400">{t('dashboard.strengthWeakness.note')}</p>
    </SectionCard>
  );
}
