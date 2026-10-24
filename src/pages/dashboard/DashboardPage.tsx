import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layers,
  BookOpen,
  Award,
  CreditCard,
  Clock,
  TrendingUp,
  Trophy,
  CheckCircle2,
} from 'lucide-react';
import { getProfileData } from '@/store/authSlice';
import { getExams } from '@/store/examSlice';
import { api } from '@/lib/api';
import type { AppDispatch, RootState } from '@/store';
import { emptyInsights, type StudentInsights } from '@/types/insights';

import { WelcomeHero } from '@/components/dashboard/WelcomeHero';
import { StatCard } from '@/components/dashboard/StatCard';
import { ContinueLearning } from '@/components/dashboard/ContinueLearning';
import { RecentExams, type Exam } from '@/components/dashboard/RecentExams';
import { PerformanceCharts } from '@/components/dashboard/PerformanceCharts';
import { TopicAnalysis } from '@/components/dashboard/TopicAnalysis';
import { AiRecommendations } from '@/components/dashboard/AiRecommendations';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { Achievements } from '@/components/dashboard/Achievements';
import { OffersSection } from '@/components/dashboard/OffersSection';
import { NotificationsList } from '@/components/dashboard/NotificationsList';
import { SupportCenter } from '@/components/dashboard/SupportCenter';
import { ReportQuestion } from '@/components/dashboard/ReportQuestion';
import { Suggestions } from '@/components/dashboard/Suggestions';
import { FooterWidgets } from '@/components/dashboard/FooterWidgets';

interface Notification {
  id: number;
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  categories_count: number;
  active_subscriptions: number;
  total_answered: number;
  total_correct: number;
  success_rate: number;
  completed_exams: number;
  in_progress_exams: number;
  average_score: number;
  best_score: number;
  current_package: { name: string; end_date: string } | null;
}

const emptyStats: DashboardStats = {
  categories_count: 0,
  active_subscriptions: 0,
  total_answered: 0,
  total_correct: 0,
  success_rate: 0,
  completed_exams: 0,
  in_progress_exams: 0,
  average_score: 0,
  best_score: 0,
  current_package: null,
};

export function DashboardPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const exams = useSelector((state: RootState) => state.exam.exams);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [insights, setInsights] = useState<StudentInsights>(emptyInsights);

  useEffect(() => {
    dispatch(getProfileData());
    dispatch(getExams(1));
    api.get('/notifications')
      .then((res) => setNotifications(res.data?.data?.notifications || []))
      .catch(() => setNotifications([]));
    api.get('/home')
      .then((res) => setStats({ ...emptyStats, ...(res.data?.data || {}) }))
      .catch(() => setStats(emptyStats));
    api.get('/dashboard/insights')
      .then((res) => setInsights({ ...emptyInsights, ...(res.data?.data || {}) }))
      .catch(() => setInsights(emptyInsights));
  }, [dispatch]);

  const recentExams = useMemo(() => (Array.isArray(exams) ? exams.slice(0, 5) : []) as Exam[], [exams]);
  const fullName = `${String(user.first_name || '')} ${String(user.last_name || '')}`.trim() || t('common.user', 'Student');

  const statItems = [
    { icon: Layers, label: t('dashboard.stats.answeredQuestions'), value: stats.total_answered, color: 'bg-primary/10 text-primary' },
    { icon: CheckCircle2, label: t('dashboard.stats.completedExams'), value: stats.completed_exams, color: 'bg-emerald-100 text-emerald-600' },
    { icon: BookOpen, label: t('dashboard.stats.averageScore'), value: stats.average_score, suffix: '%', color: 'bg-blue-100 text-blue-600' },
    { icon: Trophy, label: t('dashboard.stats.bestScore'), value: stats.best_score, suffix: '%', color: 'bg-amber-100 text-amber-600' },
    { icon: TrendingUp, label: t('dashboard.stats.successRate'), value: stats.success_rate, suffix: '%', color: 'bg-purple-100 text-purple-600' },
    { icon: Clock, label: t('dashboard.stats.inProgressExams'), value: stats.in_progress_exams, color: 'bg-rose-100 text-rose-600' },
    { icon: Award, label: t('dashboard.stats.subscribedSpecialties'), value: stats.categories_count, color: 'bg-teal-100 text-teal-600' },
    { icon: CreditCard, label: t('dashboard.stats.activeSubscriptions'), value: stats.active_subscriptions, color: 'bg-indigo-100 text-indigo-600' },
  ];

  return (
    <div className="space-y-8">
      <WelcomeHero name={fullName} stats={stats} />

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat, i) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            suffix={stat.suffix}
            color={stat.color}
            delay={i * 0.05}
          />
        ))}
      </section>

      <section>
        <ContinueLearning insights={insights} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <RecentExams exams={recentExams} />
        <AiRecommendations insights={insights} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <PerformanceCharts insights={insights} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <TopicAnalysis insights={insights} />
        <SubscriptionCard subscription={insights.subscription} />
      </section>

      <section>
        <Achievements insights={insights} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <NotificationsList notifications={notifications} />
        <OffersSection offers={insights.offers} />
        <SupportCenter />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <ReportQuestion />
        <Suggestions />
        <div className="hidden lg:block" />
      </section>

      <section>
        <FooterWidgets />
      </section>
    </div>
  );
}
