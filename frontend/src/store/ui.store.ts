import { create } from 'zustand';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  toasts: Toast[];
  confirm: {
    open: boolean;
    title: string;
    message?: string;
    confirmLabel?: string;
    onConfirm?: () => void;
  };
  toast: (type: Toast['type'], message: string) => void;
  dismissToast: (id: number) => void;
  askConfirm: (payload: { title: string; message?: string; confirmLabel?: string; onConfirm: () => void }) => void;
  closeConfirm: () => void;
}

let toastId = 0;

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  confirm: { open: false, title: '' },

  toast: (type, message) => {
    const id = ++toastId;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  askConfirm: (payload) => set({ confirm: { open: true, ...payload } }),

  closeConfirm: () => set({ confirm: { open: false, title: '' } }),
}));