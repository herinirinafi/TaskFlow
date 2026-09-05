import { initials } from '@/utils/format';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  name?: string;
  size?: number;
  className?: string;
}

const PALETTE = [
  'bg-primary-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function Avatar({ firstName, lastName, name, size = 32, className = '' }: AvatarProps) {
  const label = name ? name : `${firstName ?? ''} ${lastName ?? ''}`.trim();
  const color = colorFromName(label || '?');
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${color} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      title={label}
    >
      {initials(firstName ?? '', lastName) || '?'}
    </span>
  );
}