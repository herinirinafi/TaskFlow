interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function Badge({ children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge className="border-transparent">{status}</Badge>;
}

interface DotBadgeProps {
  label: string;
  dotClassName: string;
  className?: string;
}

export function DotBadge({ label, dotClassName, className = '' }: DotBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-xs font-medium ring-1 ring-slate-200 ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dotClassName}`} />
      {label}
    </span>
  );
}