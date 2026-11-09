import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Timer, Database, BarChart3, BookOpenCheck, Bookmark, ShieldCheck, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

// Every item here is a feature the platform actually has.
const features: { key: string; icon: LucideIcon; title: string; text: string }[] = [
  { key: 'timed', icon: Timer, title: 'Real exam conditions', text: 'Timed mock exams that submit automatically when the time is up.' },
  { key: 'bank', icon: Database, title: 'Comprehensive question bank', text: 'Choose by specialty, section, topic and difficulty.' },
  { key: 'study', icon: BookOpenCheck, title: 'Study mode with explanations', text: 'See the correct answer and its explanation right after each question.' },
  { key: 'analytics', icon: BarChart3, title: 'Detailed performance reports', text: 'Your strong and weak topics, score progress and daily activity.' },
  { key: 'review', icon: Bookmark, title: 'Review what matters', text: 'Save, flag and re-practice the questions you got wrong.' },
  { key: 'secure', icon: ShieldCheck, title: 'Secure payment', text: 'Card payments go through HyperPay; card details never reach our servers.' },
];

export function FeaturesSection() {
  const { t } = useTranslation();
  return (
    <section className="bg-sky-soft/60 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t('home.features.title', 'Why RootsExams?')}
          subtitle={t('home.features.subtitle', 'Everything you need to prepare for your exam in one place.')}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ key, icon: Icon, title, text }, idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
              className="flex gap-4 rounded-3xl border border-white bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-md">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-secondary">{t(`home.features.${key}.title`, title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t(`home.features.${key}.text`, text)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
