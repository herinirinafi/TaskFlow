export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const PROJECT_STATUSES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'] as const;
export const USER_ROLES = ['ADMIN', 'PROJECT_MANAGER', 'MEMBER'] as const;

export const STATUS_LABELS: Record<string, string> = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminée',
  PLANNING: 'Planification',
  ACTIVE: 'Actif',
  ON_HOLD: 'En pause',
  COMPLETED: 'Terminé',
  ARCHIVED: 'Archivé',
};

export const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
  URGENT: 'Urgente',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  PROJECT_MANAGER: 'Chef de projet',
  MEMBER: 'Membre',
};

export const STATUS_STYLES: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 border-blue-200',
  DONE: 'bg-green-100 text-green-700 border-green-200',
  PLANNING: 'bg-slate-100 text-slate-700 border-slate-200',
  ACTIVE: 'bg-blue-100 text-blue-700 border-blue-200',
  ON_HOLD: 'bg-amber-100 text-amber-700 border-amber-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600 border-slate-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  URGENT: 'bg-red-100 text-red-700 border-red-200',
};