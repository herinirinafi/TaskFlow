import { KeyRound, ShieldCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthShell } from '@/pages/Login';
import { authService } from '@/services';
import { getErrorMessage } from '@/services/api';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const msg = await authService.resetPassword(token, password);
      setMessage(msg);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell subtitle="Lien invalide ou manquant.">
        <div className="card p-8 text-center">
          <p className="text-sm text-red-600">Le lien de réinitialisation est invalide ou manquant.</p>
          <Link to="/forgot-password" className="mt-4 inline-block font-medium text-primary-600 hover:text-primary-700">
            Demander un nouveau lien
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell subtitle="Définissez un nouveau mot de passe sécurisé.">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Nouveau mot de passe</h1>

        {message ? (
          <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            <ShieldCheck size={16} className="mr-2 inline-block" />
            {message}
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nouveau mot de passe</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères min. — lettre et chiffre"
                required
                minLength={8}
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirmation</label>
              <input
                type="password"
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <KeyRound size={15} /> {loading ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}