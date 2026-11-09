import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import type { LandingFaq } from './types';

// General questions about the platform, shown until FAQs are added in the admin panel.
const DEFAULT_KEYS = ['what', 'modes', 'timer', 'review', 'payment'] as const;

export function FaqSection({ faqs: given }: { faqs: LandingFaq[] }) {
  const { t } = useTranslation();
  const faqs: LandingFaq[] = given.length
    ? given
    : DEFAULT_KEYS.map((key, i) => ({ id: -(i + 1), question: t(`home.faq.default.${key}.q`), answer: t(`home.faq.default.${key}.a`) }));
  const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);

  return (
    <section className="bg-sky-soft/60 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading title={t('home.faq.title', 'Frequently asked questions')} />
        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = open === faq.id;
            return (
              <div key={faq.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 text-start font-bold text-secondary"
                >
                  {faq.question}
                  <ChevronDown size={20} className={`shrink-0 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <p className="border-t border-slate-100 px-5 pb-5 pt-4 leading-relaxed text-slate-600">{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
