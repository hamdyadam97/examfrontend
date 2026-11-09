import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChartNoAxesColumnIncreasing, Headphones, ShieldCheck, type LucideIcon } from 'lucide-react';
import { JordanLandmarks } from '@/components/JordanLandmarks';

// Exams the platform prepares for, shown as word marks (no third-party logos).
const EXAMS = [
  { name: 'DHA', sub: 'Dubai Health Authority' },
  { name: 'PROMETRIC', sub: '' },
  { name: 'NCLEX', sub: '' },
  { name: 'DCPD', sub: 'Dubai Council for Dentistry' },
];

/** Page frame shared by login and signup: the form card plus the platform welcome side. */
export function AuthShowcase({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const features: { icon: LucideIcon; title: string }[] = [
    { icon: ShieldCheck, title: t('auth.page.secure', 'A safe and trusted environment') },
    { icon: ChartNoAxesColumnIncreasing, title: t('auth.page.reports', 'Detailed reports on your performance') },
    { icon: Headphones, title: t('auth.page.support', 'Technical support around the clock') },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-soft via-white to-sky-soft">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 15%, rgba(29,99,216,0.10), transparent 40%), radial-gradient(circle at 90% 90%, rgba(11,42,111,0.08), transparent 40%)',
        }}
      />
      <svg aria-hidden="true" viewBox="0 0 1440 160" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full text-primary/10">
        <path d="M0 90 C 300 20, 600 160, 900 80 S 1300 40, 1440 100 V160 H0 Z" fill="currentColor" />
      </svg>

      <div className="relative mx-auto grid max-w-7xl items-start gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-14">
        {/* Form first so it sits on the start side (right in Arabic), as in the design. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-2xl shadow-secondary/10 backdrop-blur sm:p-10 lg:col-span-5"
        >
          {children}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col lg:sticky lg:top-28 lg:col-span-7">
          <div className="grid items-center gap-6 md:grid-cols-5">
            <div className="md:col-span-3">
              <p className="text-3xl font-extrabold text-secondary sm:text-4xl">{t('auth.page.welcome', 'Welcome to')}</p>
              <p className="mt-1 text-5xl font-black tracking-tight text-secondary sm:text-6xl" dir="ltr">RootsExams</p>
              <p className="mt-4 inline-block rounded-full bg-primary/10 px-5 py-2 text-lg font-extrabold text-secondary">
                {t('auth.page.badge', 'The leading medical exams platform')}
              </p>
              <p className="mt-4 text-lg font-semibold text-secondary/80">
                {t('home.hero.subtitle', 'Prepare with confidence and achieve your best result in your medical exams.')}
              </p>
            </div>
            <div className="md:col-span-2">
              <JordanLandmarks start="petra" aspect="aspect-[4/3] md:aspect-[4/5]" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon, title }) => (
              <div key={title} className="flex flex-col items-center gap-3 rounded-3xl border border-white bg-white/80 p-5 text-center shadow-lg shadow-secondary/5">
                <Icon size={40} className="text-primary" />
                <p className="font-extrabold leading-snug text-secondary">{title}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-2xl font-extrabold text-secondary">{t('auth.page.tagline', 'Together toward a better professional future')}</p>
            <svg aria-hidden="true" viewBox="0 0 200 12" className="mx-auto mt-1 h-3 w-48 text-primary">
              <path d="M2 10 Q 100 -4 198 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4" dir="ltr">
            {EXAMS.map((exam) => (
              <li key={exam.name} className="flex h-24 flex-col items-center justify-center rounded-2xl border border-white bg-white px-3 text-center shadow-lg shadow-secondary/5">
                <span className={`font-black tracking-tight text-secondary ${exam.name.length > 6 ? 'text-lg tracking-widest' : 'text-3xl'}`}>{exam.name}</span>
                {exam.sub && <span className="mt-1 text-[10px] font-semibold text-slate-500">{exam.sub}</span>}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
