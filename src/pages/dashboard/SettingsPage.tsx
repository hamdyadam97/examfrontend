import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { getProfileData, updateProfile, updatePassword } from '@/store/authSlice';
import type { AppDispatch, RootState } from '@/store';
import { apiErrorMessage } from '@/lib/api';
import { GOVERNORATES, optionLabel, SPECIALIZATIONS, type ProfileOption } from '@/config/profileOptions';

const SELECT_OPTIONS: Record<string, ProfileOption[]> = { specialization: SPECIALIZATIONS, governorate: GOVERNORATES };

const profileFields =['first_name', 'last_name', 'email', 'specialization', 'governorate', 'birth_date'] as const;

function profileFrom(user: Record<string, unknown>) {
  return Object.fromEntries(profileFields.map((field) => [field, String(user[field] ?? '')]));
}

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [profile, setProfile] = useState<Record<string, string>>(() => profileFrom(user));
  const [passwords, setPasswords] = useState({ current_password: '', password: '', password_confirmation: '' });
  // Refill the form when the profile arrives from the server (adjusted during render, not in an effect).
  const [formUser, setFormUser] = useState(user);
  if (formUser !== user) {
    setFormUser(user);
    setProfile(profileFrom(user));
  }

  useEffect(() => {
    dispatch(getProfileData());
  }, [dispatch]);


  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(profile)).unwrap();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(apiErrorMessage(err) || 'Update failed');
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updatePassword(passwords)).unwrap();
      toast.success('Password updated');
      setPasswords({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      toast.error(apiErrorMessage(err) || 'Update failed');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-secondary">{t('common.settings')}</h1>

      <form onSubmit={handleProfile} className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-secondary">{t('settings.profile')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(profile).map(([key, value]) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium capitalize">{key.replace('_', ' ')}</label>
              {key in SELECT_OPTIONS ? (
                <select
                  value={value}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  className="w-full rounded-lg border bg-white px-3 py-2"
                >
                  <option value="" disabled>—</option>
                  {/* Keep an older free-text value visible until the student picks a listed one. */}
                  {value && !SELECT_OPTIONS[key].some((o) => o.value === value) && <option value={value}>{value}</option>}
                  {SELECT_OPTIONS[key].map((o) => (
                    <option key={o.value} value={o.value}>{optionLabel(o, i18n.language)}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={key === 'birth_date' ? 'date' : 'text'}
                  value={value}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2"
                />
              )}
            </div>
          ))}
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-primary px-6 py-2 text-white hover:bg-primary/90">{t('common.save')}</button>
      </form>

      <form onSubmit={handlePassword} className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-secondary">{t('settings.changePassword')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('settings.currentPassword')}</label>
            <input type="password" required value={passwords.current_password} onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('settings.newPassword')}</label>
            <input type="password" required minLength={8} value={passwords.password} onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('auth.confirmPassword')}</label>
            <input type="password" required minLength={8} value={passwords.password_confirmation} onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })} className="w-full rounded-lg border px-3 py-2" />
          </div>
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-secondary px-6 py-2 text-white hover:bg-secondary/90">{t('common.save')}</button>
      </form>
    </div>
  );
}
