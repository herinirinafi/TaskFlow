import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';

export function useBootstrap(): boolean {
  const loadUser = useAuthStore((s) => s.loadUser);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loadNotifications = useNotificationStore((s) => s.fetch);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (isAuthenticated) {
      void loadNotifications();
    }
  }, [isAuthenticated, loadNotifications]);

  return isLoading;
}