import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  KanbanSquare,
  LayoutDashboard,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

const FEATURES = [
  { icon: ClipboardList, title: 'Task Management', description: 'Priorités, échéances, checklists et tags pour ne rien oublier.' },
  { icon: KanbanSquare, title: 'Kanban', description: 'Glissez-déposez vos tâches d’une colonne à l’autre pour suivre l’avancement.' },
  { icon: Users, title: 'Team Collaboration', description: 'Projets partagés, commentaires et rôle claire pour toute l’équipe.' },
  { icon: BarChart3, title: 'Analytics', description: 'KPIs, progression des projets et liste des tâches urgentes.' },
  { icon: CalendarDays, title: 'Calendar', description: 'Visualisez vos échéances dans une vue mensuelle claire.' },
  { icon: Bell, title: 'Notifications', description: 'Soyez alerté à chaque assignation, commentaire et échéance proche.' },
];

const TECH = ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind CSS'];

export function Landing() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <LayoutDashboard size={18} />
            </span>
            <span className="text-lg font-bold text-slate-900">TaskFlow</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
            <a href="#features" className="hover:text-primary-600">Fonctionnalités</a>
            <a href="#tech" className="hover:text-primary-600">Technologies</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost">Se connecter</Link>
            <Link to="/register" className="btn-primary">Commencer gratuitement</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-900 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-primary-100 ring-1 ring-white/20">
            <Sparkles size={13} /> Mini plateforme SaaS de gestion de tâches
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            Organize.
            <br />
            Collaborate.
            <br />
            <span className="text-primary-200">Achieve.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-primary-100">
            Gérez vos projets et tâches plus efficacement avec votre équipe : Kanban, priorités,
            échéances, commentaires et statistiques au même endroit.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-white">
              Commencer gratuitement <ArrowRight size={16} />
            </Link>
            <a href="#features" className="btn-white-ghost">Voir la démo</a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Une boîte à outils complète</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Tout ce qu’il faut pour planifier, suivre et livrer vos projets en équipe.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                <f.icon size={22} />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section id="tech" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Technologie</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Un monorepo moderne, typé et testé de bout en bout.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {TECH.map((t) => (
              <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2 text-sm font-semibold text-slate-700">
                {t}
              </span>
            ))}
            {['JWT', 'Zod', 'Zustand', 'Swagger', 'Jest', 'Docker'].map((t) => (
              <span key={t} className="rounded-full border border-primary-200 bg-primary-50 px-5 py-2 text-sm font-semibold text-primary-700">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-2xl bg-gradient-to-br from-primary-700 to-indigo-900 px-6 py-16 text-center text-white">
          <CheckCircle2 size={40} className="mx-auto text-primary-200" />
          <h2 className="mt-4 text-3xl font-bold">Prêt à organiser votre travail ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-100">
            Créez votre compte gratuitement et branchez votre équipe en quelques minutes.
          </p>
          <Link to="/register" className="btn-white mt-8">
            Créer mon compte <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8">
        <p className="text-center text-sm text-slate-400">
          © {new Date().getFullYear()} TaskFlow — Mini plateforme SaaS collaborative de gestion de tâches.
        </p>
      </footer>
    </div>
  );
}