import { useTranslation } from 'react-i18next';

const marks = [10, 20, 30, 50, 75, 100, 150, 200];

interface Props {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function QuestionCountSlider({ value, onChange, max = 200 }: Props) {
  const { t } = useTranslation();
  const upper = Math.max(1, Math.min(200, max));
  const lower = Math.min(10, upper);
  const current = Math.min(Math.max(value, lower), upper);
  const estimated = Math.max(1, Math.round(current * 0.75));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-secondary dark:text-white">{t('examBuilder.questionCount.title')}</h3>
        <span className="rounded-xl bg-primary/10 px-4 py-1.5 text-lg font-extrabold text-primary">{current}</span>
      </div>
      <input
        type="range"
        min={lower}
        max={upper}
        step={upper > 50 ? 5 : 1}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
        {marks.filter((m) => m <= upper).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className="rounded px-1 hover:text-primary"
          >
            {m}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
        {t('examBuilder.questionCount.estimatedDuration', { minutes: estimated })}
      </p>
    </div>
  );
}
