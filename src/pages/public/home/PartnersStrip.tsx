import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Partner } from '../PartnersSection';

interface Props {
  partners: Partner[];
}

/** One row of partner logos (or names, when there is no logo) with scroll arrows. */
export function PartnersStrip({ partners }: Props) {
  const { t, i18n } = useTranslation();
  const rowRef = useRef<HTMLDivElement>(null);
  if (partners.length === 0) return null;

  const isRtl = i18n.language === 'ar';
  const scroll = (direction: 1 | -1) => {
    // In RTL, scrolling toward the "next" item means a negative scrollLeft.
    rowRef.current?.scrollBy({ left: direction * (isRtl ? -1 : 1) * 260, behavior: 'smooth' });
  };

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-extrabold text-secondary sm:text-3xl">
          {t('home.partners.title', 'Our partners and accredited bodies')}
        </h2>
        <div className="flex items-center gap-3 rounded-3xl border border-slate-100 bg-sky-soft/60 p-4">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={t('home.partners.previous', 'Previous')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-secondary hover:border-primary hover:text-primary"
          >
            {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div ref={rowRef} className="flex flex-1 snap-x gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none]">
            {partners.map((partner) => {
              const content = partner.logo ? (
                <img src={partner.logo} alt={partner.name} className="max-h-14 max-w-full object-contain" loading="lazy" />
              ) : (
                <span className="text-xl font-extrabold tracking-tight text-secondary" dir="auto">{partner.name}</span>
              );
              const className =
                'flex h-24 min-w-44 flex-1 snap-start items-center justify-center rounded-2xl bg-white px-6 grayscale transition hover:grayscale-0 hover:shadow-md';
              return partner.website_url ? (
                <a key={partner.id} href={partner.website_url} target="_blank" rel="noopener noreferrer" className={className} title={partner.name}>
                  {content}
                </a>
              ) : (
                <div key={partner.id} className={className} title={partner.name}>{content}</div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={t('home.partners.next', 'Next')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-secondary hover:border-primary hover:text-primary"
          >
            {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </div>
    </section>
  );
}
