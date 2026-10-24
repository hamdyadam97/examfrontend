import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';
import { SectionCard } from './SectionCard';

interface Notification {
  id: number;
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
}

interface Props {
  notifications: Notification[];
}

export function NotificationsList({ notifications }: Props) {
  const { t } = useTranslation();

  const sample = notifications.slice(0, 4);

  return (
    <SectionCard title={t('dashboard.notifications.title')} className="lg:col-span-1">
      {sample.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 py-8 text-center dark:bg-slate-700/30">
          <Bell className="mx-auto mb-2 text-slate-400" size={32} />
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.notifications.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sample.map((note) => {
            return (
              <div
                key={note.id}
                className={`flex items-start gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${
                  note.is_read
                    ? 'border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-700/30'
                    : 'border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10'
                }`}
              >
                <div className="mt-0.5 text-primary">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary dark:text-white">{note.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{note.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
