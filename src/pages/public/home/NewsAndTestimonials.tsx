import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, MessageSquareQuote, Newspaper, Quote, Star, type LucideIcon } from 'lucide-react';
import type { Testimonial } from '../TestimonialsSection';
import type { LandingBlog } from './types';

function NewsList({ blogs }: { blogs: LandingBlog[] }) {
  const { t, i18n } = useTranslation();
  const Arrow = i18n.language === 'ar' ? ArrowLeft : ArrowRight;
  const locale = i18n.language === 'ar' ? 'ar' : 'en';

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-secondary">{t('home.news.title', 'Latest news and updates')}</h2>
        <Link to="/blogs" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          {t('home.news.viewAll', 'View all')} <Arrow size={14} />
        </Link>
      </div>
      <ul className="divide-y divide-slate-100">
        {blogs.slice(0, 3).map((blog) => {
          const date = new Date(blog.created_at);
          const summary = blog.subtitle || (blog.description || '').replace(/<[^>]+>/g, '').slice(0, 110);
          return (
            <li key={blog.id}>
              <Link to={`/blogs/${blog.id}`} className="group flex items-center gap-4 py-4">
                <div className="flex w-16 shrink-0 flex-col items-center rounded-2xl bg-sky-soft py-2 text-secondary">
                  <span className="text-xl font-extrabold leading-none">{date.getDate().toString().padStart(2, '0')}</span>
                  <span className="mt-1 text-[11px] font-semibold">{date.toLocaleDateString(locale, { month: 'long' })}</span>
                  <span className="text-[11px] text-slate-500">{date.getFullYear()}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-secondary transition group-hover:text-primary">{blog.title}</h3>
                  {summary && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{summary}</p>}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TestimonialCard({ testimonials }: { testimonials: Testimonial[] }) {
  const { t, i18n } = useTranslation();
  const [index, setIndex] = useState(0);
  const isRtl = i18n.language === 'ar';
  const current = testimonials[index % testimonials.length];
  const step = (delta: number) => setIndex((i) => (i + delta + testimonials.length) % testimonials.length);

  return (
    <div className="flex flex-col rounded-3xl border border-slate-100 bg-gradient-to-br from-sky-soft to-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-extrabold text-secondary">{t('home.testimonials.title', 'What our students say')}</h2>
      <div className="flex flex-1 items-center gap-4">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label={t('home.partners.previous', 'Previous')}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-secondary hover:border-primary hover:text-primary sm:flex"
        >
          {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <figure className="flex flex-1 flex-col items-center gap-5 sm:flex-row" aria-live="polite">
          {current.profile_image ? (
            <img src={current.profile_image} alt={current.name} className="h-28 w-28 shrink-0 rounded-full border-4 border-white object-cover shadow-lg" loading="lazy" />
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary to-secondary text-4xl font-extrabold text-white shadow-lg">
              {current.name.charAt(0)}
            </div>
          )}
          <div className="text-center sm:text-start">
            <Quote className="mb-2 inline text-primary" size={28} />
            <blockquote className="leading-relaxed text-slate-700">{current.content}</blockquote>
            <figcaption className="mt-4">
              <p className="font-extrabold text-secondary">{current.name}</p>
              {(current.specialty || current.country) && (
                <p className="text-sm text-primary">{[current.specialty, current.country].filter(Boolean).join(' · ')}</p>
              )}
              {current.rating ? (
                <div className="mt-1 flex justify-center gap-0.5 sm:justify-start" aria-label={`${current.rating}/5`}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={14} className={i <= Number(current.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                  ))}
                </div>
              ) : null}
            </figcaption>
          </div>
        </figure>
      </div>
      {testimonials.length > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {testimonials.slice(0, 8).map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}`}
              aria-current={i === index % testimonials.length}
              className={`h-2.5 rounded-full transition-all ${i === index % testimonials.length ? 'w-7 bg-primary' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  blogs: LandingBlog[];
  testimonials: Testimonial[];
}

/** Placeholder card used while a column has no content yet. */
function EmptyCard({ icon: Icon, title, text, cta, to }: { icon: LucideIcon; title: string; text: string; cta: string; to: string }) {
  return (
    <div className="flex flex-col rounded-3xl border border-slate-100 bg-gradient-to-br from-sky-soft to-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-extrabold text-secondary">{title}</h2>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-md">
          <Icon size={30} />
        </div>
        <p className="max-w-sm leading-relaxed text-slate-600">{text}</p>
        <Link to={to} className="inline-flex items-center rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary">
          {cta}
        </Link>
      </div>
    </div>
  );
}

export function NewsAndTestimonials({ blogs, testimonials }: Props) {
  const { t } = useTranslation();
  const reviews = testimonials.filter((item) => item.content);

  return (
    <section className="pb-16 sm:pb-20">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {reviews.length > 0 ? (
          <TestimonialCard testimonials={reviews} />
        ) : (
          <EmptyCard
            icon={MessageSquareQuote}
            title={t('home.testimonials.title', 'What our students say')}
            text={t('home.testimonials.emptyText', 'Practiced with us? Tell us about your experience and help other candidates prepare.')}
            cta={t('home.testimonials.emptyCta', 'Share your experience')}
            to="/contact"
          />
        )}
        {blogs.length > 0 ? (
          <NewsList blogs={blogs} />
        ) : (
          <EmptyCard
            icon={Newspaper}
            title={t('home.news.title', 'Latest news and updates')}
            text={t('home.news.emptyText', 'Exam news, dates and preparation tips will be published here soon.')}
            cta={t('home.news.emptyCta', 'Visit the news page')}
            to="/blogs"
          />
        )}
      </div>
    </section>
  );
}
