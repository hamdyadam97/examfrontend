import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Mail, Phone, Send, Loader2 } from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { site } from '@/config/site';
import { Logo } from './Logo';

const socialIcons: Record<keyof typeof site.social, React.ReactNode> = {
  youtube: <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.5 15.6V8.4l6.3 3.6-6.3 3.6z" />,
  linkedin: <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.4V9h3.4v1.6c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.3zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zm1.8 13.1H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z" />,
  x: <path d="M18.2 2.3h3.3l-7.2 8.3 8.5 11.1h-6.7l-5.2-6.8-6 6.8H1.7l7.7-8.8L1.3 2.3h6.8l4.7 6.2 5.4-6.2zm-1.2 17.5h1.8L7.1 4.1H5.1l11.9 15.7z" />,
  telegram: <path d="M23.9 3.3 20.3 20.5c-.3 1.2-1 1.5-2 .9l-5.5-4-2.6 2.5c-.3.3-.6.6-1.2.6l.4-5.6 10.3-9.3c.4-.4-.1-.6-.7-.2L6.3 13.4.9 11.7c-1.2-.4-1.2-1.2.2-1.7L22.4 1.8c1-.4 1.9.2 1.5 1.5z" />,
};

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Subscriptions are stored as contact messages, so they show up in the admin panel.
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error(t('footer.newsletter.invalid', 'Please enter a valid email address.'));
      return;
    }
    setSending(true);
    try {
      await api.post('/contact', { name: 'Newsletter', email: email.trim(), message: 'Newsletter subscription request' });
      toast.success(t('footer.newsletter.success', 'Thank you for subscribing!'));
      setEmail('');
    } catch (err) {
      toast.error(apiErrorMessage(err) || t('footer.newsletter.failed', 'Could not subscribe. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  const quickLinks = [
    { to: '/', label: t('header.nav.home', 'Home') },
    { to: '/exams', label: t('common.exams', 'Exams') },
    { to: '/packages', label: t('header.nav.packages', 'Packages') },
    { to: '/blogs', label: t('header.nav.news', 'News') },
    { to: '/about', label: t('header.nav.about', 'About Us') },
    { to: '/contact', label: t('header.nav.contact', 'Contact Us') },
  ];

  return (
    <footer className="relative overflow-hidden bg-secondary text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 end-0 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo inverted />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              {t('footer.description', 'RootsExams provides timed mock exams, comprehensive question banks, and detailed performance reports to help healthcare professionals pass their exams.')}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-white/80">
              <li>
                <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 hover:text-white" dir="ltr">
                  <Phone size={15} /> {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 hover:text-white">
                  <Mail size={15} /> {site.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="mb-5 text-lg font-bold">{t('footer.quickLinks', 'Quick Links')}</h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/75 transition hover:text-white">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h3 className="mb-2 text-lg font-bold">{t('footer.newsletter.title', 'Subscribe to our newsletter')}</h3>
            <p className="mb-5 text-sm text-white/70">
              {t('footer.newsletter.subtitle', 'Get new exams, exam tips, and updates delivered to your inbox.')}
            </p>
            <form onSubmit={handleSubscribe} className="flex overflow-hidden rounded-full bg-white p-1.5">
              <label htmlFor="newsletter-email" className="sr-only">{t('footer.newsletter.placeholder', 'Enter your email')}</label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('footer.newsletter.placeholder', 'Enter your email')}
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-secondary outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="rtl:-scale-x-100" />}
                {t('footer.newsletter.button', 'Subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
          <div className="flex items-center gap-3">
            {(Object.keys(site.social) as (keyof typeof site.social)[]).map((name) => (
              <a
                key={name}
                href={site.social[name]}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">{socialIcons[name]}</svg>
              </a>
            ))}
          </div>
          <p className="text-center text-xs text-white/60">
            © {new Date().getFullYear()} RootsExams · {t('footer.rights', 'All rights reserved')} ·{' '}
            <Link to="/privacy" className="hover:text-white">{t('footer.bottom.privacy', 'Privacy Policy')}</Link> ·{' '}
            <Link to="/terms" className="hover:text-white">{t('footer.bottom.terms', 'Terms & Conditions')}</Link>
          </p>
          <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
            {t('footer.tagline2', 'Together toward a better medical future')}
            <svg viewBox="0 0 120 24" className="h-6 w-24 text-primary" aria-hidden="true">
              <path d="M0 12 H40 L46 4 L52 20 L58 8 L62 12 H120" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
