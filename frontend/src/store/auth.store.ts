import { create } from 'zustand';
import { authService } from '@/services';
import { tokenStorage } from '@/services/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: Boolean(tokenStorage.getAccess()),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login({ email, password });
      tokenStorage.set(result.accessToken, result.refreshToken);
      set({ user: result.user as User, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.register(data);
      tokenStorage.set(result.accessToken, result.refreshToken);
      set({ user: result.user as User, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
      throw err;
    }
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefresh();
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // on continue même si le serveur est injoignable
      }
    }
    tokenStorage.clear();
    set({ user: null, isAuthenticated: false, error: null });
  },

  loadUser: async () => {
    if (!tokenStorage.getAccess()) return;
    set({ isLoading: true });
    try {
      const user = await authService.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      tokenStorage.clear();
    }
  },

  clearError: () => set({ error: null }),
}));

export function useAuthActions() {
  return useAuthStore((s) => ({
    user: s.user,
    isAuthenticated: s.isAuthenticated,
    isLoading: s.isLoading,
    login: s.login,
    register: s.register,
    logout: s.logout,
  }));
}