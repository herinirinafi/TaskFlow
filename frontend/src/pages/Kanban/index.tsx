import { Plus, Trello } from 'lucide-react';
import { useEffect, useState } from 'react';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Spinner';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { TaskFormModal, TaskFormValues } from '@/components/tasks/TaskForm';
import { getErrorMessage } from '@/services/api';
import { useAuthStore } from '@/store/auth.store';
import { useProjectStore } from '@/store/project.store';
import { useTaskStore } from '@/store/task.store';
import { useUiStore } from '@/store/ui.store';
import type { Task, TaskStatus } from '@/types';

export function Kanban() {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const { tasks, loading, error, fetch, move, update, create, remove } = useTaskStore();
  const { projects, fetch: fetchProjects, loading: projectsLoading } = useProjectStore();
  const toast = useUiStore((s) => s.toast);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('TODO');
  const [detail, setDetail] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch({ page: 1, limit: 200 });
  }, [fetch]);

  useEffect(() => {
    if (projects.length === 0 && !projectsLoading) void fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length, projectsLoading]);

  const handleMove = async (taskId: string, status: TaskStatus, order: number) => {
    try {
      await move(taskId, status, order);
      await fetch({ page: 1, limit: 200 });
    } catch (err) {
      toast('error', getErrorMessage(err));
    }
  };

  const submitForm = async (values: TaskFormValues) => {
    setSaving(true);
    try {
      if (editing) {
        await update(editing._id, {
          title: values.title,
          description: values.description || null,
          priority: values.priority,
          assignedTo: values.assignedTo || null,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
          tags: values.tags,
        });
        toast('success', 'Tâche mise à jour');
      } else {
        await create({
          title: values.title,
          description: values.description || undefined,
          status: initialStatus,
          priority: values.priority,
          project: values.projectId,
          assignedTo: values.assignedTo || null,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
          tags: values.tags,
        });
        toast('success', 'Tâche créée');
      }
      setFormOpen(false);
      setEditing(null);
      await fetch({ page: 1, limit: 200 });
    } catch (err) {
      toast('error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (task: Task) => {
    useUiStore.getState().askConfirm({
      title: `Supprimer « ${task.title} » ?`,
      message: 'Cette action est irréversible.',
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try {
          await remove(task._id);
          toast('success', 'Tâche supprimée');
          if (detail?._id === task._id) setDetail(null);
        } catch (err) {
          toast('error', getErrorMessage(err));
        }
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Trello size={24} className="text-primary-600" /> Kanban
          </h1>
          <p className="mt-1 text-sm text-slate-500">Glissez-déposez vos tâches entre les colonnes.</p>
        </div>
        {canManage && (
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setInitialStatus('TODO');
              setFormOpen(true);
            }}
          >
            <Plus size={16} /> Nouvelle tâche
          </button>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <InlineLoader label="Chargement du tableau…" />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Trello}
          title="Aucune tâche sur le tableau"
          message={canManage ? 'Créez une tâche et déposez-la ici.' : 'Le tableau est vide pour le moment.'}
          action={
            canManage ? (
              <button className="btn-primary" onClick={() => { setEditing(null); setInitialStatus('TODO'); setFormOpen(true); }}>
                <Plus size={16} /> Créer une tâche
              </button>
            ) : undefined
          }
        />
      ) : (
        <KanbanBoard
          tasks={tasks}
          canManage={canManage}
          onMove={handleMove}
          onOpen={setDetail}
          onEdit={(t) => { setEditing(t); setFormOpen(true); }}
          onDelete={confirmDelete}
          onNewTask={(status) => {
            setEditing(null);
            setInitialStatus(status);
            setFormOpen(true);
          }}
        />
      )}

      <TaskFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={submitForm}
        projects={projects}
        saving={saving}
        initial={editing}
      />

      {detail && (
        <TaskDetailModal
          task={detail}
          onClose={() => setDetail(null)}
          canManage={canManage}
          onEdit={(t) => { setEditing(t); setFormOpen(true); }}
          onDelete={confirmDelete}
        />
      )}
    </div>
  );
}