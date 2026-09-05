import { Menu } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { NotificationsButton } from '@/components/layout/Notifications';

const MOBILE_NAV = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tâches' },
  { to: '/kanban', label: 'Kanban' },
  { to: '/calendar', label: 'Calendrier' },
  { to: '/projects', label: 'Projets' },
  { to: '/team', label: 'Équipe' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/settings', label: 'Paramètres' },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>
        <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>

      <div className="flex items-center gap-2">
        <NotificationsButton />
      </div>
    </header>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div className="fixed inset-0 top-16 z-20 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <nav
        className={`fixed left-0 top-16 z-30 flex h-fit w-64 flex-col gap-1 border-r border-slate-200 bg-white p-3 shadow-xl transition-transform lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2.5 text-sm font-medium ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}