import { X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/utils/constants';
import { useUsers } from '@/hooks/useUsers';
import type { Project, Task, TaskPriority, TaskStatus } from '@/types';

export interface TaskFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
  dueDate: string;
  tags: string[];
  projectId: string;
}

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  projects: Project[];
  saving?: boolean;
  canChangeStatus?: boolean;
  initial?: Task | null;
}

export function TaskFormModal({ open, onClose, onSubmit, projects, saving, canChangeStatus = true, initial }: TaskFormProps) {
  const { users } = useUsers();

  const empty = useMemo<TaskFormValues>(
    () => ({
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'TODO',
      assignedTo: '',
      dueDate: '',
      tags: [],
      projectId: projects[0]?._id ?? '',
    }),
    [projects]
  );

  const [values, setValues] = useState<TaskFormValues>(empty);
  const [tagInput, setTagInput] = useState('');

  // Réinitialisation à l'ouverture
  const [wasOpen, setWasOpen] = useState(false);
  if (open && !wasOpen) {
    setWasOpen(true);
    setValues(
      initial
        ? {
            title: initial.title,
            description: initial.description ?? '',
            priority: initial.priority,
            status: initial.status,
            assignedTo:
              initial.assignedTo && typeof initial.assignedTo === 'object'
                ? initial.assignedTo.id
                : (initial.assignedTo as string) ?? '',
            dueDate: initial.dueDate ? initial.dueDate.slice(0, 10) : '',
            tags: initial.tags ?? [],
            projectId:
              initial.project && typeof initial.project === 'object' ? initial.project._id : (initial.project as string),
          }
        : empty
    );
    setTagInput('');
  }
  if (!open && wasOpen) setWasOpen(false);

  const set = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload: TaskFormValues = { ...values, tags: [...values.tags, ...(tagInput ? tagInput.split(',').map((t) => t.trim()).filter(Boolean) : [])] };
    await onSubmit(payload);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !values.tags.includes(t)) {
      set('tags', [...values.tags, t]);
      setTagInput('');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier la tâche' : 'Nouvelle tâche'} size="lg">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Titre *</label>
          <input
            className="input"
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Ex : Implémenter le tableau Kanban"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="input min-h-24 resize-y"
            value={values.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Décrivez la tâche…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Priorité</label>
            <select
              className="input"
              value={values.priority}
              onChange={(e) => set('priority', e.target.value as TaskPriority)}
            >
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          {canChangeStatus && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Statut</label>
              <select
                className="input"
                value={values.status}
                onChange={(e) => set('status', e.target.value as TaskStatus)}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Projet *</label>
            <select
              className="input"
              value={values.projectId}
              onChange={(e) => set('projectId', e.target.value)}
              disabled={Boolean(initial)}
              required={!initial}
            >
              {!initial && <option value="">— Choisir un projet —</option>}
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Assigné à</label>
            <select
              className="input"
              value={values.assignedTo}
              onChange={(e) => set('assignedTo', e.target.value)}
            >
              <option value="">— Non assigné —</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Échéance</label>
            <input
              type="date"
              className="input"
              value={values.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
            <div className="flex gap-2">
              <input
                className="input"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="séparés par ,"
              />
              <button type="button" onClick={addTag} className="btn-secondary shrink-0 px-3">
                +
              </button>
            </div>
            {values.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {values.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-md bg-primary-50 px-2 py-0.5 text-xs text-primary-700">
                    {tag}
                    <button type="button" onClick={() => set('tags', values.tags.filter((t) => t !== tag))}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn-primary" disabled={saving || !values.title.trim()}>
            {saving ? 'Enregistrement…' : initial ? 'Enregistrer' : 'Créer la tâche'}
          </button>
        </div>
      </form>
    </Modal>
  );
}