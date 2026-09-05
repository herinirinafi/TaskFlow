import { Home, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="card max-w-md p-10 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <SearchX size={30} />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-sm text-slate-500">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link to="/dashboard" className="btn-primary mt-6">
          <Home size={16} /> Retour au dashboard
        </Link>
      </div>
    </div>
  );
}