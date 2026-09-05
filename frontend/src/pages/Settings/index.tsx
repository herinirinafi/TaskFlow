import { KeyRound, Save, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { getErrorMessage } from '@/services/api';
import { userService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import { ROLE_LABELS } from '@/utils/constants';

export function Settings() {
  const { user, loadUser } = useAuthStore();
  const toast = useUiStore((s) => s.toast);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await userService.updateMe({ firstName, lastName });
      await loadUser();
      toast('success', 'Profil mis à jour');
    } catch (err) {
      toast('error', getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('error', 'Les mots de passe ne correspondent pas');
      return;
    }
    setSavingPassword(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      toast('success', 'Mot de passe modifié');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast('error', getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-500">Gérez votre profil et votre sécurité.</p>
      </div>

      {/* Profil */}
      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-800">
          <UserRound size={17} className="text-slate-400" /> Profil
        </h2>

        <div className="mt-5 flex items-center gap-4">
          <Avatar firstName={firstName} lastName={lastName} size={56} />
          <div>
            <p className="font-medium text-slate-800">{firstName} {lastName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            {user && (
              <span className="mt-1 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                {ROLE_LABELS[user.role]}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={(e) => void saveProfile(e)} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input className="input" value={user?.email ?? ''} disabled />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" className="btn-primary" disabled={savingProfile}>
              <Save size={15} /> {savingProfile ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
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
            <button type="submit" className="btn-primary" disabled={savingPassword}>
              {savingPassword ? 'Modification…' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}