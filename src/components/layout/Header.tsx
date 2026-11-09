import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  UserPlus,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Mail,
  Phone,
  Headphones,
  Globe,
} from 'lucide-react';
import type { RootState, AppDispatch } from '@/store';
import { logoutUser } from '@/store/authSlice';
import { openLoginModal, openSignupModal } from '@/store/uiSlice';
import { site } from '@/config/site';
import { Logo } from './Logo';

interface NavItem {
  label: string;
  to: string;
}

/** Thin navy strip above the header with contact details and the language switch. */
function TopBar({ onToggleLang }: { onToggleLang: () => void }) {
  const { t, i18n } = useTranslation();
  return (
    <div className="hidden bg-secondary text-xs text-white/85 md:block">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <a href={`tel:${site.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-white" dir="ltr">
            <Phone size={13} /> {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 hover:text-white">
            <Mail size={13} /> {site.email}
          </a>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/contact" className="flex items-center gap-1.5 hover:text-white">
            <Headphones size={13} /> {t('header.support', 'Technical Support')}
          </Link>
          <button type="button" onClick={onToggleLang} className="flex items-center gap-1.5 hover:text-white">
            <Globe size={13} /> {i18n.language === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/exams?q=${encodeURIComponent(q)}`);
  };

  // Close the mobile drawer when the route changes (state adjusted during render, not in an effect).
  const [menuPath, setMenuPath] = useState(location.pathname);
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleLang = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  const navLinks: NavItem[] = [
    { label: t('header.nav.home', 'Home'), to: '/' },
    { label: t('common.exams', 'Exams'), to: '/exams' },
    { label: t('header.nav.packages', 'Packages'), to: '/packages' },
    { label: t('header.nav.about', 'About Us'), to: '/about' },
    { label: t('header.nav.news', 'News'), to: '/blogs' },
    { label: t('header.nav.contact', 'Contact Us'), to: '/contact' },
  ];

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-sm font-semibold transition-colors ${
      isActive
        ? 'text-primary after:absolute after:inset-x-3 after:-bottom-[22px] after:h-0.5 after:rounded-full after:bg-primary'
        : 'text-secondary hover:text-primary'
    }`;

  return (
    <header className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <TopBar onToggleLang={toggleLang} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex" aria-label={t('header.mainNav', 'Main navigation')}>
            {navLinks.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label={t('header.search', 'Search')}
              className="rounded-full p-2.5 text-secondary transition-colors hover:bg-sky-soft hover:text-primary"
            >
              <Search size={20} />
            </button>

            {auth.authenticated ? (
              <>
                <Link
                  to="/user/dashboard"
                  className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-secondary/90"
                >
                  <LayoutDashboard size={16} /> {t('common.dashboard', 'Dashboard')}
                </Link>
                <button
                  type="button"
                  onClick={() => dispatch(logoutUser())}
                  aria-label={t('common.logout', 'Logout')}
                  className="rounded-full border border-red-100 p-2.5 text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => dispatch(openSignupModal())}
                  className="flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-secondary transition hover:border-primary hover:text-primary"
                >
                  <UserPlus size={16} /> {t('header.createAccount', 'Create Account')}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(openLoginModal())}
                  className="flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-secondary/90"
                >
                  <User size={16} /> {t('common.login', 'Login')}
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-secondary hover:bg-sky-soft lg:hidden"
            aria-label={t('header.menu', 'Open menu')}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white"
          >
            <div className="mx-auto max-w-3xl px-4 py-3">
              <form role="search" onSubmit={submitSearch} className="flex items-center gap-3 rounded-xl bg-sky-soft px-4 py-2.5">
                <Search size={18} className="text-slate-400" />
                <input
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label={t('header.search', 'Search')}
                  placeholder={t('header.searchPlaceholder', 'Search exams, specialties...')}
                  className="w-full bg-transparent text-sm text-secondary outline-none placeholder:text-slate-400"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-slate-400 hover:text-secondary" aria-label={t('common.cancel', 'Cancel')}>
                  <X size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: i18n.language === 'ar' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.language === 'ar' ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 end-0 z-50 w-80 max-w-full bg-white shadow-2xl"
            >
              <div className="flex h-full flex-col p-6">
                <div className="mb-8 flex items-center justify-between">
                  <Logo onClick={() => setMobileOpen(false)} />
                  <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-secondary hover:bg-sky-soft" aria-label={t('common.close', 'Close')}>
                    <X size={22} />
                  </button>
                </div>

                <nav className="flex-1 space-y-1">
                  {navLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `block rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                          isActive ? 'bg-sky-soft text-primary' : 'text-secondary hover:bg-sky-soft hover:text-primary'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <button type="button" onClick={toggleLang} className="w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-secondary hover:border-primary hover:text-primary">
                    {i18n.language === 'ar' ? 'English' : 'العربية'}
                  </button>
                  {auth.authenticated ? (
                    <>
                      <Link to="/user/dashboard" className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-bold text-white">
                        <LayoutDashboard size={18} /> {t('common.dashboard', 'Dashboard')}
                      </Link>
                      <button type="button" onClick={() => dispatch(logoutUser())} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 py-3 text-sm font-bold text-red-600 hover:bg-red-50">
                        <LogOut size={18} /> {t('common.logout', 'Logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => { setMobileOpen(false); dispatch(openSignupModal()); }} className="w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-secondary hover:bg-sky-soft">
                        {t('header.createAccount', 'Create Account')}
                      </button>
                      <button type="button" onClick={() => { setMobileOpen(false); dispatch(openLoginModal()); }} className="w-full rounded-xl bg-secondary py-3 text-sm font-bold text-white shadow hover:bg-secondary/90">
                        {t('common.login', 'Login')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
