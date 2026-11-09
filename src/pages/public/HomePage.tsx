import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package as PackageIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { PackageCard } from '@/components/packages/PackageCard';
import { HowItWorksSection } from './HowItWorksSection';
import { HomeHero } from './home/HomeHero';
import { PopularExams } from './home/PopularExams';
import { AboutAndMap } from './home/AboutAndMap';
import { FeaturesSection } from './home/FeaturesSection';
import { PartnersStrip } from './home/PartnersStrip';
import { NewsAndTestimonials } from './home/NewsAndTestimonials';
import { FaqSection } from './home/FaqSection';
import { SectionHeading } from './home/SectionHeading';
import type { LandingData } from './home/types';

export function HomePage() {
  const { t } = useTranslation();
  const [data, setData] = useState<LandingData>({});

  useEffect(() => {
    api.get('/landing/index').then((res) => setData(res.data?.data || {}));
  }, []);

  const packages = (data.packages || []).slice(0, 3);

  return (
    <div className="overflow-hidden">
      <HomeHero stats={data.stats} />
      <PopularExams categories={data.categories || []} />
      <AboutAndMap cities={data.map_cities} />
      <FeaturesSection />
      <HowItWorksSection />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={t('home.packages.title', 'Featured packages')}
            subtitle={t('home.packages.subtitle', 'Packages selected to help you prepare')}
            link={{ to: '/packages', label: t('home.packages.viewAll', 'All packages') }}
          />
          {packages.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {packages.map((pkg, idx) => (
                <PackageCard key={pkg.id} pkg={pkg} index={idx} showPreview={false} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-primary/30 bg-sky-soft/50 px-6 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-md">
                <PackageIcon size={30} />
              </div>
              <p className="text-lg font-extrabold text-secondary">{t('home.packages.emptyTitle', 'Packages are on the way')}</p>
              <p className="max-w-md text-slate-600">
                {t('home.packages.emptyText', 'We are preparing training packages for each exam. Contact us to know the details and prices.')}
              </p>
              <Link to="/contact" className="inline-flex items-center rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-primary">
                {t('home.packages.emptyCta', 'Contact us')}
              </Link>
            </div>
          )}
        </div>
      </section>

      <PartnersStrip partners={data.partners || []} />
      <NewsAndTestimonials blogs={data.blogs || []} testimonials={data.testimonials || []} />
      {/* Remounts when real FAQs arrive so their first question starts open. */}
      <FaqSection key={data.faqs?.length ? 'loaded' : 'default'} faqs={data.faqs || []} />
    </div>
  );
}
