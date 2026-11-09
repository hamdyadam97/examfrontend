/**
 * Illustrated hero: Amman's Citadel (Temple of Hercules columns), the Jordanian flag and the city
 * skyline, with a floating exam-result card representing the platform. Pure SVG, so it stays sharp
 * at any size and needs no photo assets.
 */
export function HeroArt() {
  return (
    <svg viewBox="0 0 560 420" className="h-full w-full" role="img" aria-hidden="true">
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbe8ff" />
          <stop offset="100%" stopColor="#f5f9ff" />
        </linearGradient>
        <linearGradient id="hero-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e9dcc0" />
          <stop offset="60%" stopColor="#f6eedd" />
          <stop offset="100%" stopColor="#d9c7a3" />
        </linearGradient>
        <linearGradient id="hero-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f3f7ff" />
        </linearGradient>
        <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#0b2a6f" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Sky and sun haze */}
      <rect width="560" height="420" rx="32" fill="url(#hero-sky)" />
      <circle cx="430" cy="90" r="70" fill="#ffffff" opacity="0.7" />

      {/* Distant city of Amman */}
      <g fill="#c7d8f5">
        <path d="M0 300 h40 v-30 h22 v18 h30 v-40 h26 v52 h18 v-26 h34 v34 h24 v-58 h20 v58 h36 v-22 h30 v30 h22 v-44 h28 v44 h40 v-30 h26 v30 h34 v-20 h30 v20 h36 v-36 h24 v36 H560 V420 H0Z" />
      </g>
      <g fill="#b3c9ee">
        <path d="M0 330 h30 v-22 h26 v22 h40 v-34 h20 v34 h44 v-18 h30 v18 h50 v-28 h24 v28 h46 v-16 h34 v16 h56 v-30 h22 v30 h48 v-20 h40 v20 H560 V420 H0Z" />
      </g>
      {/* Tiny windows */}
      <g fill="#ffffff" opacity="0.7">
        {[[50, 292], [104, 270], [180, 288], [262, 262], [352, 282], [440, 290], [500, 278]].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="5" height="6" rx="1" />
        ))}
      </g>

      {/* Citadel hill */}
      <path d="M60 300 C120 250 250 238 330 262 C380 276 410 290 430 300 Z" fill="#e2d2b0" />

      {/* Temple of Hercules: podium, two columns, broken entablature */}
      <g>
        <rect x="150" y="242" width="150" height="14" rx="2" fill="#cdb88f" />
        {[178, 238].map((x) => (
          <g key={x}>
            <rect x={x - 4} y="236" width="40" height="8" rx="2" fill="#d4c098" />
            <rect x={x} y="118" width="32" height="120" fill="url(#hero-stone)" />
            {[6, 14, 22].map((d) => (
              <line key={d} x1={x + d} y1="122" x2={x + d} y2="234" stroke="#d8c6a0" strokeWidth="1.2" />
            ))}
            <rect x={x - 6} y="106" width="44" height="14" rx="3" fill="#dccaa5" />
          </g>
        ))}
        <path d="M168 92 h110 l-6 14 h-98 Z" fill="#d6c39d" />
        <path d="M168 92 l20 -8 h80 l10 8 Z" fill="#e7d8b8" />
      </g>

      {/* Jordanian flag: black / white / green stripes, red chevron with a white seven-pointed star */}
      <g>
        <rect x="336" y="66" width="4" height="200" rx="2" fill="#8a96ad" />
        <g transform="translate(340 70)">
          <rect width="96" height="20" fill="#111111" />
          <rect y="20" width="96" height="20" fill="#ffffff" />
          <rect y="40" width="96" height="20" fill="#007a3d" />
          <path d="M0 0 L46 30 L0 60 Z" fill="#ce1126" />
          <path
            d="M15 24.2 l1.7 3.9 4.1-1.1 -1.9 3.8 3.7 2.1 -4.2 0.8 0.1 4.3 -3.5-2.6 -3.5 2.6 0.1-4.3 -4.2-0.8 3.7-2.1 -1.9-3.8 4.1 1.1Z"
            fill="#ffffff"
          />
        </g>
      </g>

      {/* Floating exam result card (the platform) */}
      <g filter="url(#hero-shadow)" transform="translate(300 230)">
        <rect width="230" height="150" rx="20" fill="url(#hero-card)" />
        <rect x="18" y="18" width="92" height="10" rx="5" fill="#0b2a6f" opacity="0.85" />
        <rect x="18" y="36" width="64" height="8" rx="4" fill="#9fb4d8" />
        {/* Score ring */}
        <circle cx="178" cy="52" r="30" fill="none" stroke="#e3ebfa" strokeWidth="9" />
        <circle
          cx="178" cy="52" r="30" fill="none" stroke="#1d63d8" strokeWidth="9" strokeLinecap="round"
          strokeDasharray="188.5" strokeDashoffset="26" transform="rotate(-90 178 52)"
        />
        <text x="178" y="58" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0b2a6f" fontFamily="Cairo, sans-serif">
          86%
        </text>
        {/* Answer rows */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(18 ${82 + i * 20})`}>
            <circle cx="7" cy="6" r="7" fill={i === 1 ? '#fde2e2' : '#dcf5e7'} />
            <path
              d={i === 1 ? 'M4 3 l6 6 M10 3 l-6 6' : 'M3.5 6.2 l2.4 2.4 l4.6-5'}
              stroke={i === 1 ? '#e04848' : '#1c9a5b'} strokeWidth="1.8" fill="none" strokeLinecap="round"
            />
            <rect x="22" y="2" width={[120, 96, 132][i]} height="8" rx="4" fill="#d6e1f3" />
          </g>
        ))}
      </g>

      {/* Small floating badge: stopwatch for timed exams */}
      <g filter="url(#hero-shadow)" transform="translate(470 170)">
        <circle r="30" fill="#ffffff" />
        <circle r="14" fill="none" stroke="#1d63d8" strokeWidth="3" />
        <path d="M0 -6 V0 L5 4" stroke="#1d63d8" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="-4" y="-21" width="8" height="5" rx="2" fill="#1d63d8" />
      </g>
    </svg>
  );
}
