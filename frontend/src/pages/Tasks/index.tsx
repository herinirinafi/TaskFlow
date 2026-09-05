import { ClipboardList, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Spinner';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { TaskFormModal, TaskFormValues } from '@/components/tasks/TaskForm';
import { useProjectStore } from '@/store/project.store';
import { useTaskStore } from '@/store/task.store';
import { useUiStore } from '@/store/ui.store';
import { useAuthStore } from '@/store/auth.store';
import type { Task } from '@/types';
import { getErrorMessage } from '@/services/api';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/utils/constants';

export function Tasks() {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const { tasks, loading, error, fetch, create, update, remove } = useTaskStore();
  const { projects, fetch: fetchProjects } = useProjectStore();
  const toast = useUiStore((s) => s.toast);

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [project, setProject] = useState('');
  const [mineOnly, setMineOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [detail, setDetail] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  const urlTaskId = searchParams.get('task');

  useEffect(() => {
    void fetchProjects();
    if (urlTaskId) {
      taskServiceGet(urlTaskId).then(setDetail).catch(() => {
        // tâche introuvable : on ignore
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetch({
      search: search || undefined,
      status: status || undefined,
      priority: priority || undefined,
      project: project || undefined,
      assignedTo: mineOnly ? user?.id : undefined,
    });
  }, [fetch, search, status, priority, project, mineOnly, user?.id]);

  useEffect(() => {
    if (urlTaskId && detail === null) {
      setSearchParams({}, { replace: true });
    }
  }, [detail, setSearchParams, urlTaskId]);

  const filtered = useMemo(() => {
    let list = tasks;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [tasks, search]);

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
          status: values.status,
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
          <h1 className="text-2xl font-bold text-slate-900">Tâches</h1>
          <p className="mt-1 text-sm text-slate-500">Toutes vos tâches en un coup d'œil.</p>
        </div>
        {canManage && (
          <button
            className="btn-primary"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus size={16} /> Nouvelle tâche
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="card flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Rechercher une tâche…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <SlidersHorizontal size={18} className="hidden text-slate-400 md:block" />
          <button
            onClick={() => setMineOnly((v) => !v)}
            className={`btn btn-sm ${mineOnly ? 'bg-primary-600 text-white hover:bg-primary-700' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
            title="Afficher uniquement les tâches qui me sont assignées"
          >
            Mes tâches
          </button>
          <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous statuts</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select className="input w-auto" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Toutes priorités</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select className="input w-auto" value={project} onChange={(e) => setProject(e.target.value)}>
            <option value="">Tous projets</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <InlineLoader label="Chargement des tâches…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={search ? 'Aucun résultat' : 'Aucune tâche'}
          message={
            canManage
              ? 'Créez votre première tâche pour démarrer.'
              : 'Aucune tâche ne vous est affectée pour le moment.'
          }
          action={
            canManage ? (
              <button className="btn-primary" onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus size={16} /> Créer une tâche
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              canManage={canManage}
              onOpen={setDetail}
              onEdit={(t) => {
                setEditing(t);
                setFormOpen(true);
              }}
              onDelete={confirmDelete}
            />
          ))}
        </div>
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
          onEdit={(t) => {
            setEditing(t);
            setFormOpen(true);
          }}
          onDelete={confirmDelete}
        />
      )}
    </div>
  );
}

async function taskServiceGet(id: string): Promise<Task> {
  const { taskService } = await import('@/services');
  return taskService.get(id);
}