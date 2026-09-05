export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(value?: string | Date | null): string {
  if (!value) return '';
  const date = new Date(value).getTime();
  const seconds = Math.floor((Date.now() - date) / 1000);
  const intervals: [number, string][] = [
    [31536000, 'an'],
    [2592000, 'mois'],
    [86400, 'jour'],
    [3600, 'heure'],
    [60, 'minute'],
  ];
  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) {
      return `il y a ${count} ${label}${count > 1 && label !== 'mois' ? 's' : ''}`;
    }
  }
  return 'à l’instant';
}

export function isOverdue(dueDate?: string | Date | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate).getTime() < Date.now();
}

export function initials(firstName: string, lastName?: string): string {
  return `${firstName.charAt(0)}${(lastName ?? '').charAt(0)}`.toUpperCase();
}

export function getInitialsFromName(fullName?: string): string {
  if (!fullName) return '?';
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function toDateInputValue(date?: string | Date | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}