import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { AuthShell } from '@/pages/Login';

export function Register() {
  const { isAuthenticated, register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell subtitle="Rejoignez votre équipe et passez à l'action, dès aujourd'hui.">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Créer un compte</h1>
        <p className="mt-1 text-sm text-slate-500">Quelques secondes suffisent pour commencer.</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Prénom</label>
              <input className="input" value={form.firstName} onChange={set('firstName')} placeholder="Fi'tia" required autoFocus />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nom</label>
              <input className="input" value={form.lastName} onChange={set('lastName')} placeholder="HERINIRINA" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="vous@exemple.com" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={set('password')}
              placeholder="8 caractères min. — lettre et chiffre"
              required
              minLength={8}
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Création…' : 'S’inscrire'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Se connecter
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}