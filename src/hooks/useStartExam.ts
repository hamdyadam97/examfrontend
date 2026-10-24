import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { openLoginModal } from '@/store/uiSlice';
import type { AppDispatch, RootState } from '@/store';

interface ApiError {
  errors?: Record<string, string[]>;
}

/**
 * Starts (or resumes) an attempt at a ready-made exam and opens the exam player.
 * Guests get the login modal; users without a matching subscription are sent to the packages page.
 */
export function useStartExam() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authenticated = useSelector((state: RootState) => state.auth.authenticated);
  const [startingId, setStartingId] = useState<number | null>(null);

  const startExam = async (examId: number) => {
    if (!authenticated) {
      toast.info(t('exams.loginToStart', 'Log in to start the exam'));
      dispatch(openLoginModal());
      return;
    }
    if (startingId !== null) return;

    setStartingId(examId);
    try {
      const res = await api.post(`/exams/${examId}/start`);
      navigate(`/user/exam/${res.data.data.exam_id}/show`);
    } catch (error) {
      const response = isAxiosError<ApiError>(error) ? error.response : undefined;
      const errors = response?.data?.errors || {};
      if (errors.SubscriptionRequired) {
        toast.error(t('exams.subscriptionRequired', 'Subscribe to a package for this specialty to take this exam'));
        navigate('/packages');
      } else if (errors.AttemptsExhausted) {
        toast.error(t('exams.attemptsExhausted', 'You have used all attempts for this exam'));
      } else if (errors.ExamEmpty) {
        toast.error(t('exams.examEmpty', 'This exam has no questions yet'));
      } else if (response?.status !== 401) {
        toast.error(t('exams.startFailed', 'Could not start the exam. Please try again.'));
      }
    } finally {
      setStartingId(null);
    }
  };

  return { startExam, startingId };
}
