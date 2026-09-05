export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ChecklistItem {
  _id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: string | { _id: string; name: string };
  assignedTo?: User | string | null;
  createdBy?: User | string;
  dueDate?: string | null;
  tags: string[];
  checklist: ChecklistItem[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | 'PLANNING'
  | 'ACTIVE'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'ARCHIVED';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  members: User[] | string[];
  team?: string;
  status: ProjectStatus;
  startDate?: string | null;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  completedCount?: number;
}

export interface Comment {
  _id: string;
  content: string;
  task: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_COMMENTED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_DEADLINE'
  | 'PROJECT_INVITE'
  | 'SYSTEM';

export interface AppNotification {
  _id: string;
  recipient: string;
  actor?: User | null;
  type: NotificationType;
  title: string;
  message: string;
  task?: { _id: string; title: string; status: string } | null;
  project?: { _id: string; name: string } | null;
  read: boolean;
  createdAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  owner: User | string;
  members: User[] | string[];
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: ApiPagination;
}

export interface ProjectStats {
  totalTasks: number;
  todo: number;
  inProgress: number;
  done: number;
  completionRate: number;
  overdue: number;
}

export interface DashboardSummary {
  kpis: {
    totalTasks: number;
    todo: number;
    inProgress: number;
    done: number;
    completionRate: number;
    overdue: number;
    urgent: number;
  };
  activity: { date: string; count: number }[];
  recentTasks: Task[];
  urgentTasks: Task[];
  activeMembers: { user: User; completed: number; inProgress: number }[];
  projectProgress: { project: Project; done: number; total: number; rate: number }[];
  global?: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    activeProjects: number;
    totalTeams: number;
  };
}