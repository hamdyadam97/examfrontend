import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ChevronRight, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { LocationContactSection, type AppInfo } from './LocationContactSection';

const emptyForm = { name: '', email: '', mobile: '', message: '' };

export function ContactPage() {
  const { t } = useTranslation();
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    api.get('/landing/index')
      .then((res) => setAppInfo(res.data?.data?.app_info || null))
      .catch(() => setAppInfo(null));
  }, []);

  const update = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setErrors({});
    try {
      await api.post('/contact', form);
      toast.success(t('contactPage.success', 'Your message has been sent. We will get back to you soon.'));
      setForm(emptyForm);
    } catch (error) {
      setErrors(isAxiosError<{ errors?: Record<string, string[]> }>(error) ? error.response?.data?.errors || {} : {});
      toast.error(t('contactPage.error', 'Could not send your message. Please check the fields and try again.'));
    } finally {
      setSending(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-secondary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

  const field = (name: keyof typeof emptyForm, label: string, type = 'text', required = true) => (
    <div>
      <label htmlFor={`contact-${name}`} className="mb-1.5 block text-sm font-semibold text-secondary">
        {label}
      </label>
      {name === 'message' ? (
        <textarea id={`contact-${name}`} rows={5} required value={form[name]} onChange={update(name)} className={inputClass} />
      ) : (
        <input id={`contact-${name}`} type={type} required={required} value={form[name]} onChange={update(name)} className={inputClass} />
      )}
      {errors[name]?.[0] && <p className="mt-1 text-xs text-rose-600">{errors[name][0]}</p>}
    </div>
  );

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
            <li className="text-white" aria-current="page">{t('contactPage.title', 'Contact Us')}</li>
          </ol>
        </nav>
        <h1 className="text-4xl font-extrabold sm:text-5xl">{t('contactPage.title', 'Contact Us')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-200">
          {t('contactPage.subtitle', 'Have a question about exams, packages, or your subscription? Send us a message.')}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <form onSubmit={submit} className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            {field('name', t('contactPage.name', 'Full Name'))}
            {field('mobile', t('contactPage.mobile', 'Mobile Number'), 'tel')}
          </div>
          {field('email', t('contactPage.email', 'Email'), 'email')}
          {field('message', t('contactPage.message', 'Message'))}
          <button
            type="submit"
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-60"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {t('contactPage.send', 'Send Message')}
          </button>
        </form>
      </section>

      <LocationContactSection appInfo={appInfo} />
    </div>
  );
}
