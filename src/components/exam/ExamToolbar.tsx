import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Save, Flag, Eye, Trash2, CheckCircle2, type LucideIcon } from 'lucide-react';

interface Props {
  canPrevious: boolean;
  canNext: boolean;
  isSaved: boolean;
  isFlagged: boolean;
  isReview: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onFlag: () => void;
  onReview: () => void;
  onClear: () => void;
  onFinish: () => void;
  /** Replaces "Next" (e.g. "Next stage" on the last question of a stage). */
  nextLabel?: string;
}

export function ExamToolbar({
  canPrevious,
  canNext,
  isSaved,
  isFlagged,
  isReview,
  onPrevious,
  onNext,
  onSave,
  onFlag,
  onReview,
  onClear,
  onFinish,
  nextLabel,
}: Props) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Typing in a field must not trigger shortcuts (Backspace would otherwise clear the answer).
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      if (e.key === 'ArrowLeft') {
        if (canPrevious) onPrevious();
      } else if (e.key === 'ArrowRight') {
        if (canNext) onNext();
      } else if (e.key.toLowerCase() === 's') {
        onSave();
      } else if (e.key.toLowerCase() === 'f') {
        onFlag();
      } else if (e.key.toLowerCase() === 'r') {
        onReview();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        onClear();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        onFinish();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canPrevious, canNext, onPrevious, onNext, onSave, onFlag, onReview, onClear, onFinish]);

  const btn = (label: string, icon: LucideIcon, onClick: () => void, active?: boolean, disabled?: boolean, variant: 'default' | 'primary' | 'danger' = 'default') => {
    const Icon = icon;
    return (
      <button
        key={label}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`
          flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition
          ${variant === 'primary' ? 'bg-primary text-white shadow-md hover:bg-primary/90' : ''}
          ${variant === 'danger' ? 'bg-rose-500 text-white hover:bg-rose-600' : ''}
          ${variant === 'default' ? (active ? 'bg-secondary text-white' : 'border border-slate-200 bg-white text-secondary hover:border-primary hover:text-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200') : ''}
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <Icon size={18} /> {label}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap gap-2">
        {btn(t('examPlayer.toolbar.previous'), isRTL ? ChevronRight : ChevronLeft, onPrevious, false, !canPrevious)}
        {btn(nextLabel || t('examPlayer.toolbar.next'), isRTL ? ChevronLeft : ChevronRight, onNext, !!nextLabel, !canNext)}
      </div>

      <div className="flex flex-wrap gap-2">
        {btn(t('examPlayer.toolbar.save'), Save, onSave, isSaved)}
        {btn(t('examPlayer.toolbar.flag'), Flag, onFlag, isFlagged)}
        {btn(t('examPlayer.toolbar.reviewLater'), Eye, onReview, isReview)}
        {btn(t('examPlayer.toolbar.clear'), Trash2, onClear, false, false, 'default')}
      </div>

      <div>
        {btn(t('examPlayer.toolbar.finish'), CheckCircle2, onFinish, false, false, 'danger')}
      </div>
    </div>
  );
}
