/** Response of GET /dashboard/insights (see backend apps/exams/insights.py). */

export interface TopicStat {
  id: number;
  name: string;
  answered: number;
  accuracy: number;
}

export interface StudentSubscription {
  id: number;
  package: { id: number; name: string; number_of_questions: number | null } | null;
  start_date: string | null;
  end_date: string | null;
  subscription_status: number;
  is_active: boolean;
  questions_used: number;
}

export interface StudentInsights {
  score_history: { date: string; title: string; score: number }[];
  daily_activity: { date: string; correct: number; wrong: number }[];
  categories: TopicStat[];
  topics: {
    strong: TopicStat[];
    needs_improvement: TopicStat[];
    weak: TopicStat[];
    untouched: { id: number; name: string }[];
  };
  achievements: {
    passed_exams: number;
    perfect_scores: number;
    active_days: number;
    current_streak: number;
    topics_practiced: number;
  };
  wrong_questions: number;
  in_progress: { id: number; title: string; answered: number; total: number } | null;
  recommended_exams: { id: number; title: string; duration_minutes: number | null; category: string | null }[];
  subscription: StudentSubscription | null;
  offers: { id: number; name: string; price: number; discount_percentage: number; category: string | null }[];
}

export const emptyInsights: StudentInsights = {
  score_history: [],
  daily_activity: [],
  categories: [],
  topics: { strong: [], needs_improvement: [], weak: [], untouched: [] },
  achievements: { passed_exams: 0, perfect_scores: 0, active_days: 0, current_streak: 0, topics_practiced: 0 },
  wrong_questions: 0,
  in_progress: null,
  recommended_exams: [],
  subscription: null,
  offers: [],
};
