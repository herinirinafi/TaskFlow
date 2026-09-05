import { CalendarCheck2, LayoutDashboard } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';

interface LocationState {
  from?: { pathname: string };
}

export function AuthShell({ children, subtitle }: { children: React.ReactNode; subtitle: string }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-900 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <LayoutDashboard size={22} />
          </span>
          <p className="text-xl font-bold">TaskFlow</p>
        </div>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight">Organize. Collaborate. Achieve.</h2>
          <p className="mt-4 text-primary-100">{subtitle}</p>
          <div className="mt-10 space-y-4">
            {[
              'Tableau Kanban et suivi visuel du projet',
              'Priorités, échéances et checklists',
              'Commentaires et notifications en équipe',
              'KPIs et statistiques de performance',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CalendarCheck2 size={18} className="text-primary-200" />
                <span className="text-sm text-primary-50">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-primary-200">© {new Date().getFullYear()} TaskFlow — Mini plateforme SaaS</p>
      </div>
      <div className="flex flex-1 items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function Login() {
  const { isAuthenticated, login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      const from = (location.state as LocationState)?.from?.pathname ?? '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthShell subtitle="Centralisez vos projets, tâches et performances au sein d'une équipe.">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Bon retour 👋</h1>
        <p className="mt-1 text-sm text-slate-500">Connectez-vous pour accéder à votre espace de travail.</p>

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
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Mot de passe</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
            Créer un compte
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}