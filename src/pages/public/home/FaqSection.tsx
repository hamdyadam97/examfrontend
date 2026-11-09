import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import type { LandingFaq } from './types';

export function FaqSection({ faqs }: { faqs: LandingFaq[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);
  if (faqs.length === 0) return null;

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
