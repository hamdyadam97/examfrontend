/** Shape of GET /exams/:id/analytics (backend apps/exams/analytics.py). */
export type QuestionStatus = 'correct' | 'wrong' | 'unanswered';
export type Level = 'excellent' | 'very_good' | 'good' | 'needs_improvement';

export interface QuestionRow {
  number: number;
  question_id: number;
  answer_id: number | null;
  status: QuestionStatus;
  seconds: number | null;
  marked: boolean;
  saved: boolean;
  subject: string | null;
  sections: string[];
  topics: string[];
}

export interface Group {
  name: string;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  accuracy: number | null;
  avg_seconds: number | null;
  questions: number[];
}

export interface Attempt {
  id: number;
  date: string;
  score: number;
  accuracy: number | null;
  wrong: number;
  total: number;
  avg_seconds: number | null;
  difficulty: number | null;
  current: boolean;
}

export interface Analytics {
  exam: {
    id: number;
    title: string;
    path: string[];
    student: string;
    date: string;
    submitted_at: string | null;
    status: string;
    mode: string;
    attempt_number: number;
    can_review: boolean;
    timed: boolean;
  };
  summary: {
    total: number;
    correct: number;
    wrong: number;
    unanswered: number;
    answered: number;
    score: number;
    accuracy: number | null;
    completion: number;
    pass_mark: number;
    passed: boolean;
    level: Level;
    thresholds: { excellent: number; very_good: number; good: number };
  };
  time: {
    limit_seconds: number | null;
    elapsed_seconds: number | null;
    remaining_seconds: number | null;
    has_question_timing: boolean;
    target_seconds: number;
    avg_answered_seconds: number | null;
    avg_correct_seconds: number | null;
    avg_wrong_seconds: number | null;
    fastest: { number: number; seconds: number } | null;
    slowest: { number: number; seconds: number } | null;
    quadrants: { fast_correct: number; fast_wrong: number; slow_correct: number; slow_wrong: number } | null;
  };
  questions: QuestionRow[];
  breakdown: { subjects: Group[]; sections: Group[]; topics: Group[] };
  attempts: Attempt[];
}

/** Filter applied to the question review, set from other sections (e.g. "show questions" of a topic). */
export interface ReviewFilter {
  status: 'all' | QuestionStatus | 'marked';
  numbers?: number[];
  label?: string;
}

export const STATUS_COLORS: Record<QuestionStatus, string> = {
  correct: '#10B981',
  wrong: '#F43F5E',
  unanswered: '#94A3B8',
};
