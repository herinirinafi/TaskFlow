import { create } from 'zustand';
import { notificationService } from '@/services';
import type { AppNotification } from '@/types';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  fetch: () => Promise<void>;
  refreshUnread: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const result = await notificationService.list({ page: 1, limit: 50 });
      set({ notifications: result.items, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  refreshUnread: async () => {
    try {
      const count = await notificationService.unreadCount();
      set({ unreadCount: count });
    } catch {
      // silencieux
    }
  },

  markAsRead: async (id) => {
    await notificationService.markAsRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    await notificationService.markAllAsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  remove: async (id) => {
    const target = get().notifications.find((n) => n._id === id);
    await notificationService.remove(id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
      unreadCount: target && !target.read ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }));
  },
}));