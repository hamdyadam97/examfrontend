import { useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

/**
 * Measures how long the student looks at each question and adds it on the server
 * (POST /exams/:id/question-time). The clock pauses while the tab is hidden, and what was measured is
 * sent when the student moves to another question, hides the tab, finishes, or leaves the page.
 */
export function useQuestionTimer(examId: number, questionId: number, active: boolean) {
  const startRef = useRef<number | null>(null);
  const qidRef = useRef(questionId);

  const flush = useCallback((keepalive = false): Promise<unknown> => {
    const started = startRef.current;
    const qid = qidRef.current;
    startRef.current = null;
    if (started === null || !qid || !examId) return Promise.resolve();
    const seconds = Math.round((Date.now() - started) / 1000);
    if (seconds < 1) return Promise.resolve();
    const url = `${api.defaults.baseURL}/exams/${examId}/question-time`;
    const body = JSON.stringify({ question_id: qid, seconds });
    if (keepalive) {
      // The page may be closing: fetch with keepalive survives it (and keeps the cookie and headers).
      return fetch(url, {
        method: 'POST', body, keepalive: true, credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      }).catch(() => {});
    }
    return api.post(`/exams/${examId}/question-time`, { question_id: qid, seconds }).catch(() => {});
  }, [examId]);

  // A new question (or the exam becoming active): send the previous one, start a new clock.
  useEffect(() => {
    if (!active || !questionId) return;
    qidRef.current = questionId;
    startRef.current = document.visibilityState === 'visible' ? Date.now() : null;
    return () => {
      flush();
    };
  }, [questionId, active, flush]);

  useEffect(() => {
    if (!active) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush(true);
      else startRef.current = Date.now();
    };
    const onLeave = () => flush(true);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onLeave);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onLeave);
    };
  }, [active, flush]);

  /** Call before submitting the exam so the last question's time is counted. */
  return flush;
}
