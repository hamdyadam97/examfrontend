import { motion } from 'framer-motion';

/*
 * Simplified outline of Jordan from approximate border coordinates, projected as
 * x = (lon - 34.9) * 70, y = (33.5 - lat) * 70. Accurate enough for a decorative map.
 */
const OUTLINE = [
  [45.5, 54.6], [62.3, 53.2], [105, 78.4], [135.8, 83.3], [272.3, 9.1], [308, 88.9], [147, 140],
  [217, 210], [182, 245], [129.5, 254], [112, 280], [81.9, 301.7], [4.2, 289.8], [17.5, 231],
  [30.1, 203], [38.5, 168], [45.5, 140], [43.4, 119], [45.5, 77],
];

const PATH = `M${OUTLINE.map(([x, y]) => `${x} ${y}`).join(' L')} Z`;

// Main cities, same projection.
const CITY_PINS = [
  { key: 'irbid', x: 66.5, y: 66.5 },
  { key: 'mafraq', x: 91.7, y: 81 },
  { key: 'zarqa', x: 83.3, y: 100 },
  { key: 'amman', x: 72.1, y: 108.5 },
  { key: 'karak', x: 56, y: 162.4 },
  { key: 'maan', x: 58.1, y: 231.7 },
  { key: 'aqaba', x: 7, y: 277.9 },
];

function Pin({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: -12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 14 }}
    >
      <circle cx={x} cy={y} r="12" fill="#1d63d8" opacity="0.18">
        <animate attributeName="r" values="6;16;6" dur="2.6s" begin={`${delay}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="2.6s" begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      <path
        d={`M${x} ${y} c-6 -7 -9 -11 -9 -15 a9 9 0 0 1 18 0 c0 4 -3 8 -9 15 z`}
        fill="#ffffff" stroke="#1d63d8" strokeWidth="2.5"
      />
      <circle cx={x} cy={y - 15} r="3.6" fill="#1d63d8" />
    </motion.g>
  );
}

export function JordanMap({ label }: { label: string }) {
  return (
    <svg viewBox="-20 -10 350 330" className="h-full w-full" role="img" aria-label={label}>
      <defs>
        <linearGradient id="jo-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5b9bff" />
          <stop offset="100%" stopColor="#1d4fbf" />
        </linearGradient>
        <filter id="jo-depth" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#0b2a6f" floodOpacity="0.35" />
        </filter>
      </defs>
      <path d={PATH} fill="url(#jo-fill)" stroke="#9cc2ff" strokeWidth="2" filter="url(#jo-depth)" strokeLinejoin="round" />
      {/* Light grid of governorate-like lines for texture */}
      <g stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.2" fill="none">
        <path d="M45 140 L147 140" />
        <path d="M60 100 L135 83" />
        <path d="M38 200 L182 245" />
      </g>
      {CITY_PINS.map((pin, i) => (
        <Pin key={pin.key} x={pin.x} y={pin.y} delay={0.15 * i} />
      ))}
    </svg>
  );
}
