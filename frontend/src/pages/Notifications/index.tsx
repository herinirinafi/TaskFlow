import { AlertCircle, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TYPE_ICONS } from '@/components/layout/Notifications';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Spinner';
import { useNotificationStore } from '@/store/notification.store';
import { formatDateTime } from '@/utils/format';

export function Notifications() {
  const navigate = useNavigate();
  const notifications = useNotificationStore((s) => s.notifications);
  const loading = useNotificationStore((s) => s.loading);
  const fetch = useNotificationStore((s) => s.fetch);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const remove = useNotificationStore((s) => s.remove);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const handleOpen = async (id: string) => {
    await markAsRead(id);
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Les événements importants de vos projets.</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <button className="btn-secondary" onClick={() => void markAllAsRead()}>
            <CheckCheck size={15} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <InlineLoader label="Chargement des notifications…" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          message="Vous serez averti dès qu'une action vous concernera."
        />
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {notifications.map((n) => (
            <div key={n._id} className={`flex gap-3 px-4 py-3 transition hover:bg-slate-50 ${n.read ? 'opacity-60' : ''}`}>
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${TYPE_ICONS[n.type] ?? TYPE_ICONS.SYSTEM}`}>
                <AlertCircle size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="shrink-0 text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                {n.task && (
                  <button
                    onClick={() => navigate(`/tasks?task=${n.task?._id}`)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
                  >
                    Voir la tâche
                  </button>
                )}
              </div>
              {!n.read && (
                <button
                  onClick={() => void handleOpen(n._id)}
                  className="self-center rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50"
                >
                  Marquer lu
                </button>
              )}
              <button
                onClick={() => void remove(n._id)}
                className="self-center rounded-lg p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"
                aria-label="Supprimer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}