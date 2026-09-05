import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-14 text-center">
      <span className="rounded-full bg-white p-4 text-slate-400 shadow-sm ring-1 ring-slate-200">
        <Icon size={28} />
      </span>
      <div>
        <h3 className="font-medium text-slate-800">{title}</h3>
        {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
      </div>
      {action}
    </div>
  );
}