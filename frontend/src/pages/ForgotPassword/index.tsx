import { KeyRound, MailCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '@/pages/Login';
import { authService } from '@/services';
import { getErrorMessage } from '@/services/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const msg = await authService.forgotPassword(email);
      setMessage(msg);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell subtitle="Sécurisez l'accès à votre compte TaskFlow.">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Mot de passe oublié</h1>
        <p className="mt-1 text-sm text-slate-500">
          Indiquez votre adresse email : nous vous enverrons un lien de réinitialisation.
        </p>

        {message ? (
          <div className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            <MailCheck size={16} className="mr-2 inline-block" />
            {message}
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                autoFocus
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              <KeyRound size={15} /> {loading ? 'Envoi…' : 'Envoyer le lien'}
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