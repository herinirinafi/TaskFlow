import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useUiStore } from '@/store/ui.store';

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  const styles = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  const icons = {
    success: <CheckCircle2 size={18} className="text-green-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-2 rounded-lg border px-3 py-2.5 shadow-lg animate-fade-in ${styles[toast.type]}`}
        >
          <span className="mt-0.5">{icons[toast.type]}</span>
          <p className="flex-1 text-sm">{toast.message}</p>
          <button onClick={() => dismiss(toast.id)} className="rounded p-0.5 opacity-60 hover:opacity-100" aria-label="Fermer">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

export function GlobalConfirm() {
  const confirm = useUiStore((s) => s.confirm);
  const close = useUiStore((s) => s.closeConfirm);

  return (
    <ConfirmDialogInner
      open={confirm.open}
      title={confirm.title}
      message={confirm.message}
      confirmLabel={confirm.confirmLabel}
      onConfirm={() => {
        confirm.onConfirm?.();
        close();
      }}
      onCancel={close}
    />
  );
}

import { ConfirmDialog, ConfirmDialogProps } from './Modal';

function ConfirmDialogInner(props: ConfirmDialogProps) {
  return <ConfirmDialog {...props} />;
}