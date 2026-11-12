import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import { useCountUp } from '@/hooks/useCountUp';
import { Award, Download, Rocket, Share2, Sparkles, Target, TrendingUp, type LucideIcon } from 'lucide-react';

interface Props {
  title?: string;
  percentage: number;
  onDownload: () => void;
  onShare: () => void;
}

interface Tier {
  key: 'excellent' | 'passed' | 'close' | 'keepGoing';
  gradient: string;
  glow: string;
  ring: string;
  icon: LucideIcon;
}

/** The banner's colour follows the grade: encouraging at every level, never an alarm red. */
function tierFor(pct: number): Tier {
  if (pct >= 80) return { key: 'excellent', gradient: 'from-emerald-500 via-teal-500 to-cyan-600', glow: 'bg-emerald-300', ring: '#ffffff', icon: Award };
  if (pct >= 60) return { key: 'passed', gradient: 'from-secondary via-blue-700 to-primary', glow: 'bg-sky-300', ring: '#ffffff', icon: TrendingUp };
  if (pct >= 40) return { key: 'close', gradient: 'from-amber-500 via-orange-500 to-rose-500', glow: 'bg-yellow-200', ring: '#ffffff', icon: Target };
  return { key: 'keepGoing', gradient: 'from-indigo-600 via-violet-600 to-fuchsia-600', glow: 'bg-fuchsia-300', ring: '#ffffff', icon: Rocket };
}

function ScoreRing({ value, color }: { value: number; color: string }) {
  const reduce = useReducedMotion();
  const size = 168;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const shown = useCountUp(value);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.22)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (Math.min(value, 100) / 100) * circumference }}
          transition={{ duration: reduce ? 0 : 1.4, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black tabular-nums">{shown}%</span>
      </div>
    </div>
  );
}

/** A short burst of confetti for a pass; nothing when the visitor prefers less motion. */
function Confetti() {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () => Array.from({ length: 36 }, (_, i) => ({
      left: (i * 37) % 100,
      delay: (i % 12) * 0.08,
      drift: ((i * 53) % 60) - 30,
      rotate: (i * 97) % 360,
      color: ['#facc15', '#ffffff', '#34d399', '#60a5fa', '#f472b6'][i % 5],
      size: 6 + (i % 4) * 2,
    })),
    [],
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-0 rounded-sm"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 0.5, backgroundColor: p.color }}
          initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: 360, x: p.drift, rotate: p.rotate + 360, opacity: 0 }}
          transition={{ duration: 2.6, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

export function ResultHero({ title, percentage, onDownload, onShare }: Props) {
  const { t } = useTranslation();
  const reduce = useReducedMotion();
  const tier = tierFor(percentage);
  const Icon = tier.icon;
  const passed = percentage >= 60;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${tier.gradient} p-8 text-white shadow-2xl md:p-10`}
    >
      {/* Moving lights and a soft dotted texture */}
      <motion.div
        aria-hidden
        className={`absolute -end-24 -top-24 h-72 w-72 rounded-full ${tier.glow} opacity-30 blur-3xl`}
        animate={reduce ? undefined : { x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-28 -start-20 h-80 w-80 rounded-full bg-white opacity-10 blur-3xl"
        animate={reduce ? undefined : { x: [0, 50, 0], y: [0, -20, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]" />
      {passed && <Confetti />}

      <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:justify-between">
        <div className="text-center lg:text-start">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold backdrop-blur"
          >
            <motion.span
              animate={reduce ? undefined : passed ? { rotate: [0, -12, 12, 0] } : { y: [0, -4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1 }}
              className="inline-flex"
            >
              <Icon size={18} />
            </motion.span>
            {t(`examResult.tier.${tier.key}.badge`)}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-3xl font-extrabold md:text-4xl"
          >
            {t(`examResult.tier.${tier.key}.title`)}
          </motion.h1>
          {title && <p className="mt-1 text-white/80">{title}</p>}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-3 max-w-xl text-lg text-white/95"
          >
            {t(`examResult.tier.${tier.key}.message`)}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start"
          >
            <button type="button" onClick={onDownload} className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-sm font-bold text-secondary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
              <Download size={18} /> {t('examResult.downloadPdf')}
            </button>
            <button type="button" onClick={onShare} className="inline-flex items-center gap-2 rounded-2xl bg-white/20 px-5 py-2.5 text-sm font-bold backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/30">
              <Share2 size={18} /> {t('examResult.shareResult')}
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 120, damping: 14 }}
          className="relative flex flex-col items-center rounded-[1.75rem] bg-white/15 p-6 shadow-xl backdrop-blur-md ring-1 ring-white/25"
        >
          <ScoreRing value={percentage} color={tier.ring} />
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-sm font-extrabold ${passed ? 'bg-white text-emerald-600' : 'bg-white/90 text-secondary'}`}
          >
            {passed && <Sparkles size={14} />} {passed ? t('examResult.pass') : t('examResult.fail')}
          </motion.span>
        </motion.div>
      </div>
    </motion.section>
  );
}

