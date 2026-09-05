import { AlertCircle, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/notification.store';
import { formatDateTime } from '@/utils/format';

const TYPE_ICONS = {
  TASK_ASSIGNED: 'bg-blue-100 text-blue-600',
  TASK_COMMENTED: 'bg-violet-100 text-violet-600',
  TASK_UPDATED: 'bg-sky-100 text-sky-600',
  TASK_COMPLETED: 'bg-green-100 text-green-600',
  TASK_DEADLINE: 'bg-red-100 text-red-600',
  PROJECT_INVITE: 'bg-amber-100 text-amber-600',
  SYSTEM: 'bg-slate-100 text-slate-600',
} as const;

export { TYPE_ICONS };

export function NotificationsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const refreshUnread = useNotificationStore((s) => s.refreshUnread);
  const fetch = useNotificationStore((s) => s.fetch);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const remove = useNotificationStore((s) => s.remove);

  useEffect(() => {
    if (open) void fetch();
  }, [open, fetch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    void refreshUnread();
  };

  const handleOpenNotification = async (n: (typeof notifications)[number]) => {
    if (!n.read) await handleMarkRead(n._id);
    setOpen(false);
    if (n.task) navigate(`/tasks?task=${n.task._id}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
            <button
              onClick={() => void markAllAsRead().then(() => refreshUnread())}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              <CheckCheck size={14} /> Tout marquer lu
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                <Bell size={24} />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => void handleOpenNotification(n)}
                  className={`flex cursor-pointer gap-3 border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50 ${
                    n.read ? 'opacity-60' : ''
                  }`}
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TYPE_ICONS[n.type] ?? TYPE_ICONS.SYSTEM}`}>
                    <AlertCircle size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{n.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void remove(n._id);
                    }}
                    className="self-start rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function NotificationBell() {
  const refreshUnread = useNotificationStore((s) => s.refreshUnread);
  useEffect(() => {
    void refreshUnread();
    const interval = setInterval(() => void refreshUnread(), 45000);
    return () => clearInterval(interval);
  }, [refreshUnread]);
  return <NotificationsButton />;
}