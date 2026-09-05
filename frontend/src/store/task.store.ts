import { create } from 'zustand';
import { taskService, TaskQuery } from '@/services';
import type { Task } from '@/types';

type LoadMode = 'overwrite' | 'append';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  query: TaskQuery;
  fetch: (query?: TaskQuery, mode?: LoadMode) => Promise<void>;
  create: (data: Parameters<typeof taskService.create>[0]) => Promise<Task>;
  update: (id: string, data: Parameters<typeof taskService.update>[1]) => Promise<Task>;
  updateStatus: (id: string, status: string) => Promise<Task>;
  move: (id: string, status: string, order: number) => Promise<Task>;
  remove: (id: string) => Promise<void>;
  addChecklistItem: (id: string, text: string) => Promise<Task>;
  updateChecklistItem: (id: string, itemId: string, data: { text?: string; completed?: boolean }) => Promise<Task>;
  removeChecklistItem: (id: string, itemId: string) => Promise<Task>;
  reset: () => void;
}

function applyTask(list: Task[], updated: Task): Task[] {
  return list.map((t) => (t._id === updated._id ? updated : t));
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  saving: false,
  error: null,
  query: { page: 1, limit: 100 },

  fetch: async (query, mode = 'overwrite') => {
    const merged = { ...get().query, ...(query ?? {}) };
    set({ loading: true, error: null, query: merged });
    try {
      const result = await taskService.list(merged);
      set((state) => ({
        tasks: mode === 'append' ? [...state.tasks, ...result.items] : result.items,
        loading: false,
      }));
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  create: async (data) => {
    set({ saving: true });
    try {
      const task = await taskService.create(data);
      set((state) => ({ tasks: [task, ...state.tasks], saving: false }));
      return task;
    } catch (err) {
      set({ saving: false });
      throw err;
    }
  },

  update: async (id, data) => {
    const task = await taskService.update(id, data);
    set((state) => ({ tasks: applyTask(state.tasks, task) }));
    return task;
  },

  updateStatus: async (id, status) => {
    const task = await taskService.updateStatus(id, status);
    set((state) => ({ tasks: applyTask(state.tasks, task) }));
    return task;
  },

  move: async (id, status, order) => {
    const task = await taskService.move(id, status, order);
    const noReorder = get().tasks.map((t) =>
      t._id === id ? task : t
    );
    set({ tasks: noReorder });
    return task;
  },

  remove: async (id) => {
    await taskService.remove(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
  },

  addChecklistItem: async (id, text) => {
    const task = await taskService.addChecklistItem(id, text);
    set((state) => ({ tasks: applyTask(state.tasks, task) }));
    return task;
  },

  updateChecklistItem: async (id, itemId, data) => {
    const task = await taskService.updateChecklistItem(id, itemId, data);
    set((state) => ({ tasks: applyTask(state.tasks, task) }));
    return task;
  },

  removeChecklistItem: async (id, itemId) => {
    const task = await taskService.removeChecklistItem(id, itemId);
    set((state) => ({ tasks: applyTask(state.tasks, task) }));
    return task;
  },

  reset: () => set({ tasks: [], error: null, query: { page: 1, limit: 100 } }),
}));