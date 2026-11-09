import type { Specialty } from '@/components/SpecialtyCard';
import type { Package } from '@/types/package';
import type { Testimonial } from '../TestimonialsSection';
import type { Partner } from '../PartnersSection';
import type { AppInfo } from '../LocationContactSection';

export interface LandingBlog {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image?: string | null;
  created_at: string;
}

export interface LandingStats {
  students: number;
  attempts: number;
  pass_rate: number;
  partners: number;
}

export interface LandingFaq {
  id: number;
  question: string;
  answer: string;
}

/** Response of GET /landing/index. */
export interface LandingData {
  categories?: Specialty[];
  testimonials?: Testimonial[];
  blogs?: LandingBlog[];
  packages?: Package[];
  partners?: Partner[];
  app_info?: AppInfo | null;
  stats?: LandingStats;
  faqs?: LandingFaq[];
  map_cities?: string[];
}
