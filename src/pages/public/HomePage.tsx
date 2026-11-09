import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

      {packages.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title={t('home.packages.title', 'Featured packages')}
              subtitle={t('home.packages.subtitle', 'Packages selected to help you prepare')}
              link={{ to: '/packages', label: t('home.packages.viewAll', 'All packages') }}
            />
            <div className="grid gap-6 md:grid-cols-3">
              {packages.map((pkg, idx) => (
                <PackageCard key={pkg.id} pkg={pkg} index={idx} showPreview={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      <PartnersStrip partners={data.partners || []} />
      <NewsAndTestimonials blogs={data.blogs || []} testimonials={data.testimonials || []} />
      {/* Mounted only once loaded so the first question starts open. */}
      {(data.faqs?.length ?? 0) > 0 && <FaqSection faqs={data.faqs!} />}
    </div>
  );
}
