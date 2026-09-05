import { create } from 'zustand';
import { projectService } from '@/services';
import type { Project } from '@/types';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetch: (params?: { search?: string; status?: string }) => Promise<void>;
  create: (data: { name: string; description?: string; status?: string; members?: string[]; startDate?: string; deadline?: string }) => Promise<Project>;
  update: (id: string, data: Partial<{ name: string; description: string | null; status: string; deadline: string | null }>) => Promise<Project>;
  remove: (id: string) => Promise<void>;
  addMember: (id: string, userId: string) => Promise<Project>;
  removeMember: (id: string, userId: string) => Promise<Project>;
}

function applyProject(list: Project[], updated: Project): Project[] {
  return list.map((p) => (p._id === updated._id ? updated : p));
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,
  error: null,

  fetch: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await projectService.list({ page: 1, limit: 100, ...params });
      set({ projects: result.items, loading: false });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  create: async (data) => {
    const project = await projectService.create(data);
    set((state) => ({ projects: [project, ...state.projects] }));
    return project;
  },

  update: async (id, data) => {
    const project = await projectService.update(id, data);
    set((state) => ({ projects: applyProject(state.projects, project) }));
    return project;
  },

  remove: async (id) => {
    await projectService.remove(id);
    set((state) => ({ projects: state.projects.filter((p) => p._id !== id) }));
  },

  addMember: async (id, userId) => {
    const project = await projectService.addMember(id, userId);
    set((state) => ({ projects: applyProject(state.projects, project) }));
    return project;
  },

  removeMember: async (id, userId) => {
    const project = await projectService.removeMember(id, userId);
    set((state) => ({ projects: applyProject(state.projects, project) }));
    return project;
  },
}));