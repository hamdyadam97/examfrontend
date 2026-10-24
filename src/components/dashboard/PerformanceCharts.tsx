import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { SectionCard } from './SectionCard';
import { useDarkMode } from '@/hooks/useDarkMode';
import type { StudentInsights } from '@/types/insights';

const tabs = ['scoreProgress', 'dailyActivity', 'bySpecialty'] as const;
type Tab = (typeof tabs)[number];

interface Props {
  insights: StudentInsights;
}

export function PerformanceCharts({ insights }: Props) {
  const { t, i18n } = useTranslation();
  const { isDark } = useDarkMode();
  const [active, setActive] = useState<Tab>('scoreProgress');

  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const subjectColors = ['#06bfb0', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];
  const tooltipStyle = {
    borderRadius: 16,
    border: 'none',
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    background: isDark ? '#1e293b' : '#fff',
    color: isDark ? '#f1f5f9' : '#1e293b',
  };

  const weekday = (date: string) => new Date(date).toLocaleDateString(i18n.language, { weekday: 'short' });
  const scoreData = insights.score_history.map((row, i) => ({ ...row, name: `${i + 1}` }));
  const dailyData = insights.daily_activity.map((row) => ({ ...row, name: weekday(row.date) }));
  const specialtyData = insights.categories.map((c) => ({ name: c.name, value: c.answered }));

  const isEmpty =
    (active === 'scoreProgress' && scoreData.length === 0) ||
    (active === 'dailyActivity' && dailyData.every((d) => d.correct + d.wrong === 0)) ||
    (active === 'bySpecialty' && specialtyData.length === 0);

  return (
    <SectionCard
      title={t('dashboard.performance.title')}
      action={
        <select
          value={active}
          onChange={(e) => setActive(e.target.value as Tab)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-secondary outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-700 dark:text-slate-100"
        >
          {tabs.map((tab) => (
            <option key={tab} value={tab}>{t(`dashboard.performance.${tab}`)}</option>
          ))}
        </select>
      }
      className="lg:col-span-3"
    >
      <div className="h-80 w-full">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-slate-50 text-center dark:bg-slate-700/30">
            <BarChart3 className="mb-3 text-slate-400" size={40} />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.performance.empty')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {active === 'scoreProgress' ? (
              <AreaChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06bfb0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06bfb0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: textColor }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fill: textColor }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.title ?? ''}
                  formatter={(value) => [`${value}%`, t('dashboard.recentExams.score')]}
                />
                <Area type="monotone" dataKey="score" stroke="#06bfb0" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            ) : active === 'dailyActivity' ? (
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: textColor }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: textColor }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="correct" name={t('dashboard.performance.correct')} stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="wrong" name={t('dashboard.performance.wrong')} stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Pie data={specialtyData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {specialtyData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={subjectColors[i % subjectColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </SectionCard>
  );
}
