import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchCreateData, fetchSubCategories, fetchSubSubCategories,
  fetchSections, fetchTopics, storeExam, clearExamData,
} from '@/store/examSlice';
import { subscription } from '@/store/packagesSlice';
import type { AppDispatch, RootState } from '@/store';
import { apiErrorMessage, type ApiError } from '@/lib/api';

import { PackageOverview, NoSubscriptionNotice } from '@/components/exam-builder/PackageOverview';
import { Stepper } from '@/components/exam-builder/Stepper';
import { SelectionGrid } from '@/components/exam-builder/SelectionGrid';
import { ExamModeSelector } from '@/components/exam-builder/ExamModeSelector';
import { examModes } from '@/components/exam-builder/examModes';
import { DifficultySelector } from '@/components/exam-builder/DifficultySelector';
import { QuestionCountSlider } from '@/components/exam-builder/QuestionCountSlider';
import { DurationSelector } from '@/components/exam-builder/DurationSelector';
import { AdvancedSettings } from '@/components/exam-builder/AdvancedSettings';
import { ExamSummary } from '@/components/exam-builder/ExamSummary';
import { Recommendations } from '@/components/exam-builder/Recommendations';
import { QuickActions } from '@/components/exam-builder/QuickActions';
import { getIconForName } from '@/components/exam-builder/iconMap';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Item {
  id: number;
  name: string;
  questions_count?: number;
  section_id?: number | null;
}

interface Advanced {
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
}

// Topics are not a step: they are an optional filter shown inside the section step.
const stepsKeys = ['specialty', 'category', 'subcategory', 'section', 'configure'] as const;
const CONFIGURE_STEP = stepsKeys.length - 1;

export function ExamCreatePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isRTL = i18n.language === 'ar';

  const {
    categories, subCategories, subSubCategories, sections, topics,
    totalQuestionsFromSections, subscriptions,
  } = useSelector((state: RootState) => ({
    categories: state.exam.categories as Item[],
    subCategories: state.exam.subCategories as Item[],
    subSubCategories: state.exam.subSubCategories as Item[],
    sections: state.exam.sections as Item[],
    topics: state.exam.topics as Item[],
    totalQuestionsFromSections: state.exam.totalQuestionsFromSections,
    subscriptions: state.packages.subscriptions,
  }));

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>([]);
  const [selectedSubSubCategories, setSelectedSubSubCategories] = useState<number[]>([]);
  const [selectedSections, setSelectedSections] = useState<number[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(() => {
    const requested = searchParams.get('mode');
    return examModes.some((m) => m.key === requested) ? (requested as string) : 'practice';
  });
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(50);
  const [duration, setDuration] = useState('automatic');
  const [advanced, setAdvanced] = useState<Advanced>({
    randomizeQuestions: true,
    randomizeAnswers: true,
  });

  useEffect(() => {
    dispatch(fetchCreateData());
    dispatch(subscription());
    return () => { dispatch(clearExamData()); };
  }, [dispatch]);

  // These effects only fetch. Clearing the lower levels when a level changes is done in the
  // click handlers (clearBelow), so a selection change does not render twice.
  useEffect(() => {
    dispatch(fetchSubCategories(selectedCategories));
  }, [selectedCategories, dispatch]);

  useEffect(() => {
    dispatch(fetchSubSubCategories(selectedSubCategories));
  }, [selectedSubCategories, dispatch]);

  useEffect(() => {
    dispatch(fetchSections({
      categoryIds: selectedCategories,
      subCategoryIds: selectedSubCategories,
      subSubCategoryIds: selectedSubSubCategories,
      difficulty,
    }));
    // Difficulty changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedSubCategories, selectedSubSubCategories, dispatch]);

  useEffect(() => {
    dispatch(fetchTopics({
      sectionIds: selectedSections,
      categoryIds: selectedCategories,
      subCategoryIds: selectedSubCategories,
      subSubCategoryIds: selectedSubSubCategories,
      difficulty,
    }));
    // Tree changes always clear the sections too, so this refetches with the current tree then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSections, dispatch]);

  // A new difficulty only refreshes the question counts; the student's selections stay.
  useEffect(() => {
    const tree = {
      categoryIds: selectedCategories,
      subCategoryIds: selectedSubCategories,
      subSubCategoryIds: selectedSubSubCategories,
      difficulty,
    };
    dispatch(fetchSections(tree));
    if (selectedSections.length) dispatch(fetchTopics({ ...tree, sectionIds: selectedSections }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const activeSubscription = subscriptions?.find((s) => s.is_active);
  const packageTotal: number | null = activeSubscription?.package?.number_of_questions ?? null;
  const packageUsed: number = activeSubscription?.questions_used ?? 0;
  const packageRemaining = packageTotal ? Math.max(packageTotal - packageUsed, 0) : 0;

  const selectedTopicsTotal = useMemo(
    () => topics.filter((t) => selectedTopics.includes(t.id)).reduce((acc, t) => acc + (t.questions_count || 0), 0),
    [topics, selectedTopics],
  );
  const selectedSectionsTotal = useMemo(
    () => sections.filter((s) => selectedSections.includes(s.id)).reduce((acc, s) => acc + (s.questions_count || 0), 0),
    [sections, selectedSections],
  );

  // The exam pool is the most specific selection: chosen topics, else chosen
  // sections, else all fetched sections, else the package balance.
  const availableForSelection = selectedTopicsTotal || selectedSectionsTotal || totalQuestionsFromSections || packageRemaining;
  const maxQuestions = Math.min(200, availableForSelection);
  const effectiveQuestionCount = Math.max(1, Math.min(questionCount, maxQuestions));
  const remainingAfter = Math.max(availableForSelection - effectiveQuestionCount, 0);

  const stepsLabels = stepsKeys.map((k) => t(`examBuilder.steps.${k}`));

  const stepItems: Record<number, Item[]> = {
    0: categories,
    1: subCategories,
    2: subSubCategories,
    3: sections,
  };

  const stepSelections: Record<number, [number[], React.Dispatch<React.SetStateAction<number[]>>]> = {
    0: [selectedCategories, setSelectedCategories],
    1: [selectedSubCategories, setSelectedSubCategories],
    2: [selectedSubSubCategories, setSelectedSubSubCategories],
    3: [selectedSections, setSelectedSections],
  };

  const selectedNames = (items: Item[], ids: number[]) =>
    items.filter((i) => ids.includes(i.id)).map((i) => i.name).join(', ') || '-';

  const summaryLabels = useMemo(() => ({
    specialty: selectedNames(categories, selectedCategories),
    category: selectedNames(subCategories, selectedSubCategories),
    subcategory: selectedNames(subSubCategories, selectedSubSubCategories),
    section: selectedNames(sections, selectedSections),
    topic: selectedNames(topics, selectedTopics),
  }), [categories, selectedCategories, subCategories, selectedSubCategories, subSubCategories, selectedSubSubCategories, sections, selectedSections, topics, selectedTopics]);

  /** A change at one level invalidates every level below it, including the topic filter. */
  const clearBelow = (level: number) => {
    for (let lower = level + 1; lower < CONFIGURE_STEP; lower++) {
      const [, setter] = stepSelections[lower];
      setter((prev) => (prev.length ? [] : prev));
    }
    setSelectedTopics((prev) => (prev.length ? [] : prev));
  };

  const toggleTopic = (id: number) =>
    setSelectedTopics((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Topics of the chosen sections, grouped under their section.
  const topicGroups = useMemo(
    () => sections
      .filter((s) => selectedSections.includes(s.id))
      .map((s) => ({ section: s, topics: topics.filter((tp) => tp.section_id === s.id) }))
      .filter((g) => g.topics.length > 0),
    [sections, selectedSections, topics],
  );

  const handleToggle = (id: number) => {
    const [, setter] = stepSelections[step];
    setter((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    clearBelow(step);
  };

  const handleSelectAll = () => {
    const [selected, setter] = stepSelections[step];
    const items = stepItems[step];
    setter(selected.length === items.length ? [] : items.map((i) => i.id));
    clearBelow(step);
  };

  const canProceed = stepSelections[step]?.[0].length > 0;

  const handleNext = () => {
    if (step < stepsKeys.length - 1) {
      if (!canProceed) {
        toast.error(t('examBuilder.alerts.selectCategory'));
        return;
      }
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleGenerate = async () => {
    if (!selectedCategories.length) {
      toast.error(t('examBuilder.alerts.selectCategory'));
      setStep(0);
      return;
    }
    setLoading(true);
    try {
      const selectedMode = examModes.find((m) => m.key === mode) ?? examModes[0];
      const durationMap: Record<string, number> = { automatic: 0, min30: 30, min45: 45, min60: 60, min90: 90, unlimited: 0 };
      const res: { data: { exam_id: number } } = await dispatch(storeExam({
        exam_mode: selectedMode.examMode,
        question_mode: selectedMode.questionMode,
        is_timed_mode: duration !== 'unlimited',
        categories: selectedCategories,
        sub_categories: selectedSubCategories,
        sub_sub_categories: selectedSubSubCategories,
        sections: selectedSections,
        topics: selectedTopics,
        question_count: effectiveQuestionCount,
        duration_minutes: durationMap[duration] || 0,
        difficulty,
        randomize_questions: advanced.randomizeQuestions,
        randomize_answers: advanced.randomizeAnswers,
      })).unwrap();
      toast.success(t('examBuilder.alerts.examCreated'));
      navigate(`/user/exam/${res.data.exam_id}/show`);
    } catch (err) {
      const apiErr = err as ApiError;
      const details = apiErr?.errors ? Object.values(apiErr.errors).flat() : [];
      toast.error(details[0] || apiErrorMessage(err) || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-950 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white md:text-4xl">{t('examBuilder.title')}</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{t('examBuilder.subtitle')}</p>
        </div>

        {activeSubscription ? (
          <PackageOverview
            name={activeSubscription.package?.name || ''}
            total={packageTotal}
            used={packageUsed}
            expiry={activeSubscription.end_date}
          />
        ) : (
          <NoSubscriptionNotice />
        )}

        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-6">
          <Stepper steps={stepsLabels} current={step} onChange={setStep} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {step < CONFIGURE_STEP ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8"
                >
                  <SelectionGrid
                    title={t(`examBuilder.step.choose${stepsKeys[step].charAt(0).toUpperCase() + stepsKeys[step].slice(1)}`)}
                    items={stepItems[step]}
                    selected={stepSelections[step][0]}
                    onToggle={handleToggle}
                    iconFn={getIconForName}
                    showAll
                    onSelectAll={handleSelectAll}
                  />

                  {step === 3 && topicGroups.length > 0 && (
                    <div className="mt-8 rounded-2xl border border-dashed border-slate-200 p-5 dark:border-slate-700">
                      <h3 className="font-bold text-secondary dark:text-white">{t('examBuilder.topicFilter.title', 'Focus on specific topics (optional)')}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('examBuilder.topicFilter.hint', 'Leave empty to include every topic in the chosen sections.')}</p>
                      <div className="mt-4 space-y-4">
                        {topicGroups.map(({ section, topics: sectionTopics }) => (
                          <div key={section.id}>
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">{section.name}</p>
                            <div className="flex flex-wrap gap-2">
                              {sectionTopics.map((tp) => {
                                const active = selectedTopics.includes(tp.id);
                                return (
                                  <button
                                    key={tp.id}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => toggleTopic(tp.id)}
                                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                                      active
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                    }`}
                                  >
                                    {tp.name} <span className={active ? 'text-white/80' : 'text-slate-400'}>({tp.questions_count || 0})</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={step === 0}
                      onClick={handleBack}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-secondary transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {t('common.previous', 'Back')}
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90"
                    >
                      {t('common.next', 'Next')} {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="configure"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
                    <ExamModeSelector value={mode} onChange={setMode} />
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
                    <DifficultySelector value={difficulty} onChange={setDifficulty} />
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
                    <QuestionCountSlider value={effectiveQuestionCount} onChange={setQuestionCount} max={maxQuestions} />
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
                    <DurationSelector value={duration} onChange={setDuration} />
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 md:p-8">
                    <AdvancedSettings settings={advanced} onChange={(key, value) => setAdvanced((prev) => ({ ...prev, [key]: value }))} />
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-secondary transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {t('common.previous', 'Back')}
                    </button>
                    <div />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Recommendations />
            <QuickActions />
          </div>

          <div className="lg:col-span-1">
            <ExamSummary
              specialty={summaryLabels.specialty}
              category={summaryLabels.category}
              subcategory={summaryLabels.subcategory}
              section={summaryLabels.section}
              topic={summaryLabels.topic}
              mode={mode}
              difficulty={difficulty}
              questionCount={effectiveQuestionCount}
              duration={duration}
              remainingAfter={remainingAfter}
              onGenerate={handleGenerate}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        </div>
      )}
    </div>
  );
}
