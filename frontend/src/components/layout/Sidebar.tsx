import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  Trello,
  UserRound,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { ROLE_LABELS } from '@/utils/constants';
import { useAuthStore } from '@/store/auth.store';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tâches', icon: ClipboardList, end: false },
  { to: '/kanban', label: 'Kanban', icon: Trello, end: false },
  { to: '/calendar', label: 'Calendrier', icon: CalendarDays, end: false },
  { to: '/projects', label: 'Projets', icon: Users, end: false },
  { to: '/team', label: 'Équipe', icon: Users, end: false },
  { to: '/notifications', label: 'Notifications', icon: Bell, end: false },
  { to: '/profile', label: 'Mon profil', icon: UserRound, end: false },
  { to: '/settings', label: 'Paramètres', icon: Settings, end: false },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
          <LayoutDashboard size={18} />
        </span>
        <div>
          <p className="text-base font-bold leading-tight text-slate-900">TaskFlow</p>
          <p className="text-[11px] text-slate-400">Organize. Collaborate.</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <Avatar firstName={user?.firstName} lastName={user?.lastName} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-xs text-slate-400">{user ? ROLE_LABELS[user.role] : ''}</p>
          </div>
          <button
            onClick={() => void logout()}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            title="Déconnexion"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}