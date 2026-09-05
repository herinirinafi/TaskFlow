import { CalendarClock, KeyRound, ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { userService } from '@/services';
import { getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { ROLE_LABELS } from '@/utils/constants';
import { formatDate } from '@/utils/format';

export function Profile() {
  const { user } = useAuthStore();
  const toast = useUiStore((s) => s.toast);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('error', 'Les mots de passe ne correspondent pas');
      return;
    }
    setSaving(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      toast('success', 'Mot de passe modifié');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast('error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mon profil</h1>
        <p className="mt-1 text-sm text-slate-500">Vos informations et votre sécurité.</p>
      </div>

      {/* Présentation */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar firstName={user?.firstName} lastName={user?.lastName} size={64} />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                <ShieldCheck size={12} /> {user ? ROLE_LABELS[user.role] : ''}
              </span>
              {user?.createdAt && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  <CalendarClock size={12} /> Membre depuis le {formatDate(user.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <KeyRound size={17} className="text-slate-400" /> Mot de passe
        </h2>

        <form onSubmit={(e) => void changePassword(e)} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe actuel</label>
            <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
            <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirmation</label>
            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Modification…' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}