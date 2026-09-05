import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export interface ApiErrorPayload {
  success: false;
  message: string;
  details?: { field: string; message: string }[];
}

const TOKEN_KEY = 'taskflow_access_token';
const REFRESH_KEY = 'taskflow_refresh_token';

export const tokenStorage = {
  getAccess(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string): void {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) {
    tokenStorage.clear();
    window.location.href = '/login';
    return;
  }

  const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
  const { accessToken, refreshToken: newRefresh } = res.data.data;
  tokenStorage.set(accessToken, newRefresh);
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        refreshing ??= refreshAccessToken().finally(() => {
          refreshing = null;
        });
        await refreshing;
        original.headers.Authorization = `Bearer ${tokenStorage.getAccess()}`;
        return api(original);
      } catch {
        tokenStorage.clear();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : 'Erreur inconnue';
}