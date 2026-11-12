import { Baby, Bone, BrainCircuit, HeartPulse, Microscope, Scissors, Smile, Stethoscope, Syringe, type LucideIcon } from 'lucide-react';

export interface ExamTheme {
  /** Tailwind gradient classes for the card cover. */
  gradient: string;
  icon: LucideIcon;
  /** Cover photo (public/images/packages, CC0 photos from StockSnap and Rawpixel). */
  image: string;
}

// Most specific first: the specialty decides, then the exam.
const IMAGES: [RegExp, string][] = [
  [/dent|أسنان|اسنان/i, 'dental'],
  [/SMLE - Nursing/i, 'nursing-smle'],
  [/nurs|تمريض/i, 'nursing'],
  [/anesth|تخدير/i, 'anesthesia'],
  [/pediat|أطفال|اطفال/i, 'pediatrics'],
  [/obstet|gyn|نسائية/i, 'obgyn'],
  [/urolog/i, 'urology'],
  [/surg|جراح/i, 'surgery'],
  [/internal|باطن/i, 'internal'],
  [/Residency Entrance|إقامة/i, 'residency'],
  [/JMC|SMLE|Prometric|امتياز|بروميترك/i, 'exam'],
];

const GRADIENTS = [
  'from-sky-500 via-blue-600 to-indigo-700',
  'from-emerald-500 via-teal-600 to-cyan-700',
  'from-violet-500 via-purple-600 to-fuchsia-700',
  'from-amber-500 via-orange-500 to-rose-600',
  'from-rose-500 via-pink-600 to-purple-700',
  'from-cyan-500 via-sky-600 to-blue-800',
  'from-lime-500 via-green-600 to-emerald-700',
  'from-indigo-500 via-blue-700 to-slate-800',
];

const ICONS: [RegExp, LucideIcon][] = [
  [/dent|أسنان|اسنان/i, Smile],
  [/nurs|تمريض/i, HeartPulse],
  [/anesth|تخدير/i, Syringe],
  [/pediat|أطفال|اطفال/i, Baby],
  [/surg|جراح/i, Scissors],
  [/ortho|عظام/i, Bone],
  [/neuro|psych|أعصاب|نفس/i, BrainCircuit],
  [/patho|lab|micro|مختبر/i, Microscope],
];

function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/** Same exam -> same colour and icon on every card. */
export function examTheme(path: string[] = []): ExamTheme {
  const key = path.slice(0, 2).join(' / ');
  const words = path.join(' ');
  return {
    gradient: GRADIENTS[hash(key) % GRADIENTS.length],
    icon: ICONS.find(([re]) => re.test(words))?.[1] ?? Stethoscope,
    image: `/images/packages/${IMAGES.find(([re]) => re.test(words))?.[1] ?? 'doctor'}.jpg`,
  };
}
