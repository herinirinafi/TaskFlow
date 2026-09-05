export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' };
  return (
    <div
      className={`inline-block animate-spin rounded-full border-primary-500 border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function InlineLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}