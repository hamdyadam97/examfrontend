import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ChevronRight, Star, Quote, Loader2, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface Testimonial {
  id: number;
  name: string;
  content: string;
  rating?: number | null;
  specialty?: string | null;
  country?: string | null;
  profile_image?: string | null;
}

export function TestimonialsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    api.get('/testimonials')
      .then((res) => setTestimonials(res.data?.data?.testimonials || []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-secondary to-slate-900 px-4 py-16 text-center text-white sm:px-6 lg:py-20">
        <nav aria-label="Breadcrumb" className="mb-5">
          <ol className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <li>
              <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
                <Home size={14} /> {t('header.nav.home', 'Home')}
              </Link>
            </li>
            <li><ChevronRight size={14} /></li>
            <li className="text-white" aria-current="page">{t('testimonials.title', 'Students Testimonials')}</li>
          </ol>
        </nav>
        <h1 className="text-4xl font-extrabold sm:text-5xl">{t('testimonials.title', 'Students Testimonials')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-200">
          {t('testimonials.subtitle', 'Hear from medical professionals who advanced their careers with us.')}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
            <Users size={48} className="mb-4 text-slate-300" />
            <h2 className="text-lg font-bold text-secondary">{t('testimonials.emptyTitle', 'No testimonials yet')}</h2>
            <p className="mt-2 text-sm text-slate-500">{t('testimonials.emptySubtitle', 'Be the first to share your experience.')}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.id} className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <Quote className="absolute end-6 top-6 h-8 w-8 text-primary/20" />
                <div className="flex items-center gap-3">
                  {item.profile_image ? (
                    <img src={item.profile_image} alt={item.name} className="h-12 w-12 rounded-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-bold text-white">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-secondary">{item.name}</h3>
                    {(item.specialty || item.country) && (
                      <p className="text-xs text-slate-500">{[item.specialty, item.country].filter(Boolean).join(' · ')}</p>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{item.content}</p>
                {item.rating ? (
                  <div className="mt-4 flex gap-0.5" aria-label={`${item.rating}/5`}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className={i <= Number(item.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
