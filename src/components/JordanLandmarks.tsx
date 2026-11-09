import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { landmarks, type Landmark } from '@/config/landmarks';

interface Props {
  /** Landmark shown first; the others follow every few seconds. */
  start?: Landmark['key'];
  className?: string;
  /** Tailwind aspect class for the frame. */
  aspect?: string;
}

/** Rotating photos of Jordanian landmarks with the place name and the required photo credit. */
export function JordanLandmarks({ start = 'petra', className = '', aspect = 'aspect-[4/3]' }: Props) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const first = Math.max(0, landmarks.findIndex((l) => l.key === start));
  const [index, setIndex] = useState(first);
  const current = landmarks[index];

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % landmarks.length), 6000);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <figure className={`relative overflow-hidden rounded-[2rem] bg-sky-soft shadow-2xl shadow-secondary/15 ${aspect} ${className}`}>
      <AnimatePresence initial={false}>
        <motion.img
          key={current.key}
          src={current.src}
          alt={t(`landmarks.${current.key}`)}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="absolute inset-0 h-full w-full object-cover"
          loading={current.key === start ? 'eager' : 'lazy'}
          draggable={false}
        />
      </AnimatePresence>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-secondary/80 to-transparent" />

      <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-extrabold text-secondary shadow">
            <MapPin size={15} className="shrink-0 text-primary" /> <span className="truncate">{t(`landmarks.${current.key}`)}</span>
          </p>
          <p className="mt-2 truncate text-[10px] text-white/85" dir="ltr">
            ©{' '}
            <a href={current.source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
              {current.author}
            </a>{' '}
            ·{' '}
            <a href={current.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline-offset-2 hover:underline">
              {current.license}
            </a>
          </p>
        </div>
      </figcaption>

      <div className="absolute end-4 top-4 flex gap-1.5 rounded-full bg-secondary/40 px-2.5 py-2 backdrop-blur-sm" role="tablist" aria-label={t('landmarks.label', 'Landmarks of Jordan')}>
          {landmarks.map((l, i) => (
            <button
              key={l.key}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t(`landmarks.${l.key}`)}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
      </div>
    </figure>
  );
}
