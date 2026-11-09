import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Shuffle,
  Sparkles,
  XCircle,
  Bookmark,
  Flag,
  Timer,
} from 'lucide-react';

/**
 * Exam modes offered to the student. `examMode` is how the backend runs the exam
 * ('tatur' shows each answer immediately, 'exam' only after submitting) and
 * `questionMode` filters which questions are drawn.
 */
export const examModes = [
  { key: 'practice', icon: BookOpen, examMode: 'tatur', questionMode: 'all' },
  { key: 'mock', icon: ClipboardCheck, examMode: 'exam', questionMode: 'all' },
  { key: 'final', icon: GraduationCap, examMode: 'exam', questionMode: 'all' },
  { key: 'random', icon: Shuffle, examMode: 'exam', questionMode: 'all' },
  { key: 'unusedOnly', icon: Sparkles, examMode: 'tatur', questionMode: 'unused' },
  { key: 'wrongOnly', icon: XCircle, examMode: 'tatur', questionMode: 'incorrect' },
  { key: 'savedOnly', icon: Bookmark, examMode: 'tatur', questionMode: 'saved' },
  { key: 'flaggedOnly', icon: Flag, examMode: 'tatur', questionMode: 'marked' },
  { key: 'timedPractice', icon: Timer, examMode: 'tatur', questionMode: 'all' },
] as const;
