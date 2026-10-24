import { useTranslation } from 'react-i18next';
import { Trophy, Medal, Flame, CalendarCheck, Layers } from 'lucide-react';
import { SectionCard } from './SectionCard';
import { AnimatedCounter } from './AnimatedCounter';
import type { StudentInsights } from '@/types/insights';

interface Props {
  insights: StudentInsights;
}

export function Achievements({ insights }: Props) {
  const { t } = useTranslation();
  const a = insights.achievements;

  const items = [
    { key: 'currentStreak', icon: Flame, value: a.current_streak, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
    { key: 'passedExams', icon: Trophy, value: a.passed_exams, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
    { key: 'perfectScores', icon: Medal, value: a.perfect_scores, color: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10' },
    { key: 'activeDays', icon: CalendarCheck, value: a.active_days, color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10' },
    { key: 'topicsPracticed', icon: Layers, value: a.topics_practiced, color: 'text-primary bg-teal-50 dark:bg-primary/10' },
  ];

  return (
    <SectionCard title={t('dashboard.achievements.title')}>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${s.color}`}>
                <Icon size={24} />
              </div>
              <p className="text-2xl font-extrabold text-secondary dark:text-white"><AnimatedCounter value={s.value} /></p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t(`dashboard.achievements.${s.key}`)}</p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
