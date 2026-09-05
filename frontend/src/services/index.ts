import { api } from './api';
import type { AppNotification, Comment, DashboardSummary, Paginated, Project, ProjectStats, Task, Team, User } from '@/types';

interface AuthResponse {
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar' | 'role'>;
  accessToken: string;
  refreshToken: string;
}

// ————— Auth —————
export const authService = {
  async register(data: { firstName: string; lastName: string; email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<{ data: AuthResponse }>('/auth/register', data);
    return res.data.data;
  },
  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<{ data: AuthResponse }>('/auth/login', data);
    return res.data.data;
  },
  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken });
  },
  async me(): Promise<User> {
    const res = await api.get<{ data: User }>('/users/me');
    return res.data.data;
  },
  async forgotPassword(email: string): Promise<string> {
    const res = await api.post<{ data: { message: string } }>('/auth/forgot-password', { email });
    return res.data.data.message;
  },
  async resetPassword(token: string, password: string): Promise<string> {
    const res = await api.post<{ data: { message: string } }>('/auth/reset-password', { token, password });
    return res.data.data.message;
  },
};

// ————— Users —————
export const userService = {
  async list(params: { page?: number; limit?: number; search?: string; role?: string } = {}): Promise<Paginated<User>> {
    const res = await api.get<{ data: Paginated<User> }>('/users', { params });
    return res.data.data;
  },
  async update(id: string, data: { firstName?: string; lastName?: string; role?: string; isActive?: boolean }): Promise<User> {
    const res = await api.patch<{ data: User }>(`/users/${id}`, data);
    return res.data.data;
  },
  async updateMe(data: { firstName?: string; lastName?: string; avatar?: string | null }): Promise<User> {
    const res = await api.patch<{ data: User }>('/users/me', data);
    return res.data.data;
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/users/me/password', { currentPassword, newPassword });
  },
};

// ————— Projects —————
export const projectService = {
  async create(data: { name: string; description?: string; status?: string; members?: string[]; startDate?: string; deadline?: string }): Promise<Project> {
    const res = await api.post<{ data: Project }>('/projects', data);
    return res.data.data;
  },
  async list(params: { page?: number; limit?: number; search?: string; status?: string } = {}): Promise<Paginated<Project>> {
    const res = await api.get<{ data: Paginated<Project> }>('/projects', { params });
    return res.data.data;
  },
  async get(id: string): Promise<Project> {
    const res = await api.get<{ data: Project }>(`/projects/${id}`);
    return res.data.data;
  },
  async update(id: string, data: { name?: string; description?: string | null; status?: string; deadline?: string | null }): Promise<Project> {
    const res = await api.patch<{ data: Project }>(`/projects/${id}`, data);
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
  async addMember(id: string, userId: string): Promise<Project> {
    const res = await api.post<{ data: Project }>(`/projects/${id}/members`, { userId });
    return res.data.data;
  },
  async removeMember(id: string, userId: string): Promise<Project> {
    const res = await api.delete<{ data: Project }>(`/projects/${id}/members/${userId}`);
    return res.data.data;
  },
  async stats(id: string): Promise<ProjectStats> {
    const res = await api.get<{ data: ProjectStats }>(`/projects/${id}/stats`);
    return res.data.data;
  },
};

// ————— Tasks —————
export interface TaskQuery {
  page?: number;
  limit?: number;
  project?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  sort?: string;
}

export const taskService = {
  async create(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    project: string;
    assignedTo?: string | null;
    dueDate?: string | null;
    tags?: string[];
  }): Promise<Task> {
    const res = await api.post<{ data: Task }>('/tasks', data);
    return res.data.data;
  },
  async list(params: TaskQuery = {}): Promise<Paginated<Task>> {
    const res = await api.get<{ data: Paginated<Task> }>('/tasks', { params });
    return res.data.data;
  },
  async get(id: string): Promise<Task> {
    const res = await api.get<{ data: Task }>(`/tasks/${id}`);
    return res.data.data;
  },
  async update(id: string, data: Partial<{ title: string; description: string | null; priority: string; assignedTo: string | null; dueDate: string | null; tags: string[] }>): Promise<Task> {
    const res = await api.patch<{ data: Task }>(`/tasks/${id}`, data);
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
  async updateStatus(id: string, status: string): Promise<Task> {
    const res = await api.patch<{ data: Task }>(`/tasks/${id}/status`, { status });
    return res.data.data;
  },
  async move(id: string, status: string, order: number): Promise<Task> {
    const res = await api.patch<{ data: Task }>(`/tasks/${id}/move`, { status, order });
    return res.data.data;
  },
  async addChecklistItem(id: string, text: string): Promise<Task> {
    const res = await api.post<{ data: Task }>(`/tasks/${id}/checklist`, { text });
    return res.data.data;
  },
  async updateChecklistItem(id: string, itemId: string, data: { text?: string; completed?: boolean }): Promise<Task> {
    const res = await api.patch<{ data: Task }>(`/tasks/${id}/checklist/${itemId}`, data);
    return res.data.data;
  },
  async removeChecklistItem(id: string, itemId: string): Promise<Task> {
    const res = await api.delete<{ data: Task }>(`/tasks/${id}/checklist/${itemId}`);
    return res.data.data;
  },
};

// ————— Comments —————
export const commentService = {
  async list(taskId: string): Promise<Paginated<Comment>> {
    const res = await api.get<{ data: Paginated<Comment> }>(`/tasks/${taskId}/comments`, { params: { limit: 100 } });
    return res.data.data;
  },
  async create(taskId: string, content: string): Promise<Comment> {
    const res = await api.post<{ data: Comment }>(`/tasks/${taskId}/comments`, { content });
    return res.data.data;
  },
  async update(id: string, content: string): Promise<Comment> {
    const res = await api.patch<{ data: Comment }>(`/comments/${id}`, { content });
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/comments/${id}`);
  },
};

// ————— Notifications —————
export const notificationService = {
  async list(params: { page?: number; limit?: number; unreadOnly?: boolean } = {}): Promise<Paginated<AppNotification>> {
    const res = await api.get<{ data: Paginated<AppNotification> }>('/notifications', { params });
    return res.data.data;
  },
  async unreadCount(): Promise<number> {
    const res = await api.get<{ data: { count: number } }>('/notifications/unread-count');
    return res.data.data.count;
  },
  async markAsRead(id: string): Promise<AppNotification> {
    const res = await api.patch<{ data: AppNotification }>(`/notifications/${id}`);
    return res.data.data;
  },
  async markAllAsRead(): Promise<number> {
    const res = await api.patch<{ data: { updated: number } }>('/notifications/read-all');
    return res.data.data.updated;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};

// ————— Teams —————
export const teamService = {
  async create(data: { name: string; description?: string; members?: string[] }): Promise<Team> {
    const res = await api.post<{ data: Team }>('/teams', data);
    return res.data.data;
  },
  async list(params: { page?: number; limit?: number; search?: string } = {}): Promise<Paginated<Team>> {
    const res = await api.get<{ data: Paginated<Team> }>('/teams', { params });
    return res.data.data;
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  },
  async addMember(id: string, userId: string): Promise<Team> {
    const res = await api.post<{ data: Team }>(`/teams/${id}/members`, { userId });
    return res.data.data;
  },
  async removeMember(id: string, userId: string): Promise<Team> {
    const res = await api.delete<{ data: Team }>(`/teams/${id}/members/${userId}`);
    return res.data.data;
  },
};

// ————— Dashboard —————
export const dashboardService = {
  async summary(): Promise<DashboardSummary> {
    const res = await api.get<{ data: DashboardSummary }>('/dashboard/summary');
    return res.data.data;
  },
};