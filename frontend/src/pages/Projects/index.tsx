import {
  Calendar,
  FolderKanban,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { getErrorMessage } from '@/services/api';
import { useUsers } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/auth.store';
import { useProjectStore } from '@/store/project.store';
import { useUiStore } from '@/store/ui.store';
import type { Project } from '@/types';
import { PROJECT_STATUSES, STATUS_LABELS, STATUS_STYLES } from '@/utils/constants';
import { formatDate } from '@/utils/format';

export function Projects() {
  const { user } = useAuthStore();
  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const { projects, loading, error, fetch, create, update, remove, addMember, removeMember } = useProjectStore();
  const toast = useUiStore((s) => s.toast);

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const filtered = useMemo(() => {
    if (!search) return projects;
    const q = search.toLowerCase();
    return projects.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  }, [projects, search]);

  const handleCreate = async (values: { name: string; description: string; deadline: string }) => {
    setSaving(true);
    try {
      await create({
        name: values.name,
        description: values.description || undefined,
        deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
      });
      setCreateOpen(false);
      toast('success', 'Projet créé');
    } catch (err) {
      toast('error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (project: Project) => {
    useUiStore.getState().askConfirm({
      title: `Supprimer « ${project.name} » ?`,
      message: 'Toutes les tâches associées seront supprimées.',
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try {
          await remove(project._id);
          toast('success', 'Projet supprimé');
          setDetail(null);
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
          <h1 className="text-2xl font-bold text-slate-900">Projets</h1>
          <p className="mt-1 text-sm text-slate-500">Organisez vos projets et suivez leur avancement.</p>
        </div>
        {canCreate && (
          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Nouveau projet
          </button>
        )}
      </div>

      <input
        type="search"
        className="input max-w-sm"
        placeholder="Rechercher un projet…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      {loading ? (
        <InlineLoader label="Chargement des projets…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={search ? 'Aucun résultat' : 'Aucun projet'}
          message={canCreate ? 'Créez votre premier projet.' : 'Vous ne participez à aucun projet pour le moment.'}
          action={
            canCreate ? (
              <button className="btn-primary" onClick={() => setCreateOpen(true)}>
                <Plus size={16} /> Créer un projet
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} onOpen={() => setDetail(project)} onDelete={confirmDelete} isOwner={user?.role === 'ADMIN' || (typeof project.owner === 'object' && project.owner.id === user?.id)} />
          ))}
        </div>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} saving={saving} />

      {detail && (
        <ProjectDetail
          project={detail}
          onClose={() => setDetail(null)}
          onUpdate={async (patch) => {
            try {
              const updated = await update(detail._id, patch);
              setDetail(updated);
              toast('success', 'Projet mis à jour');
            } catch (err) {
              toast('error', getErrorMessage(err));
            }
          }}
          onAddMember={async (userId) => {
            try {
              const updated = await addMember(detail._id, userId);
              setDetail(updated);
              toast('success', 'Membre ajouté');
            } catch (err) {
              toast('error', getErrorMessage(err));
            }
          }}
          onRemoveMember={async (userId) => {
            try {
              const updated = await removeMember(detail._id, userId);
              setDetail(updated);
              toast('success', 'Membre retiré');
            } catch (err) {
              toast('error', getErrorMessage(err));
            }
          }}
          onDelete={confirmDelete}
          canManage={canCreate}
        />
      )}
    </div>
  );
}

function ProjectCard({ project, onOpen, onDelete, isOwner }: { project: Project; onOpen: () => void; onDelete: (p: Project) => void; isOwner: boolean }) {
  const members = project.members ?? [];
  const rate = project.taskCount === undefined || project.taskCount === 0
    ? 0
    : Math.round(((project.completedCount ?? 0) / project.taskCount) * 100);
  const owner = typeof project.owner === 'object' ? project.owner : null;

  return (
    <div className="card group cursor-pointer p-5 transition hover:border-primary-300 hover:shadow-md" onClick={onOpen}>
      <div className="flex items-start justify-between">
        <Badge className={STATUS_STYLES[project.status]}>{STATUS_LABELS[project.status]}</Badge>
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
            className="rounded p-1 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
            aria-label="Supprimer"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-slate-900">{project.name}</h3>
      {project.description && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description}</p>
      )}

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Progression</span>
          <span>{project.taskCount ?? 0} tâche(s)</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-primary-500" style={{ width: `${rate}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {members.slice(0, 4).map((m) => {
            const user = typeof m === 'object' ? m : null;
            return user ? (
              <Avatar key={user.id} firstName={user.firstName} lastName={user.lastName} size={26} className="ring-2 ring-white" />
            ) : null;
          })}
          {members.length > 4 && (
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-slate-200 text-[10px] font-medium text-slate-600 ring-2 ring-white">
              +{members.length - 4}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs text-slate-400">
          {project.deadline && (<><Calendar size={12} />{formatDate(project.deadline)}</>)}
        </span>
      </div>
      {owner && <p className="mt-3 truncate text-xs text-slate-400">Par {owner.firstName} {owner.lastName}</p>}
    </div>
  );
}

function CreateProjectModal({ open, onClose, onSubmit, saving }: { open: boolean; onClose: () => void; onSubmit: (v: { name: string; description: string; deadline: string }) => Promise<void>; saving: boolean }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name, description, deadline });
    setName('');
    setDescription('');
    setDeadline('');
  };

  return (
    <Modal open={open} onClose={onClose} title="Nouveau projet">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nom *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Refonte du site" required autoFocus />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea className="input min-h-20 resize-y" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Objectifs, périmètre…" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Date limite</label>
          <input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn-primary" disabled={saving || !name.trim()}>
            {saving ? 'Création…' : 'Créer le projet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onUpdate: (patch: { name?: string; status?: string; deadline?: string | null }) => Promise<void>;
  onAddMember: (userId: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onDelete: (p: Project) => void;
  canManage: boolean;
}

function ProjectDetail({ project, onClose, onUpdate, onAddMember, onRemoveMember, onDelete, canManage }: ProjectDetailProps) {
  const { user } = useAuthStore();
  const { users } = useUsers();
  const [addMode, setAddMode] = useState(false);
  const isOwner = user?.role === 'ADMIN' || (typeof project.owner === 'object' && project.owner.id === user?.id);
  const members = project.members ?? [];
  const membersIds = members.map((m) => (typeof m === 'object' ? m.id : m));
  const availableToAdd = users.filter((u) => !membersIds.includes(u.id));

  const rate = project.taskCount === undefined || project.taskCount === 0
    ? 0
    : Math.round(((project.completedCount ?? 0) / project.taskCount) * 100);

  return (
    <Modal open onClose={onClose} title={project.name} size="lg">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="input w-auto"
            value={project.status}
            disabled={!isOwner}
            onChange={(e) => void onUpdate({ status: e.target.value })}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <span className="text-sm text-slate-500">
            Échéance : <b>{formatDate(project.deadline)}</b>
          </span>
          {isOwner && (
            <button className="btn-danger ml-auto" onClick={() => onDelete(project)}>
              <Trash2 size={14} /> Supprimer
            </button>
          )}
        </div>

        {project.description && (
          <p className="text-sm text-slate-600">{project.description}</p>
        )}

        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="font-medium text-slate-700">Progression</span>
            <span className="text-slate-500">{project.completedCount ?? 0}/{project.taskCount ?? 0} — {rate}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, backgroundColor: rate === 100 ? '#22c55e' : '#4f46e5' }} />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <Users size={15} className="text-slate-400" /> Membres ({members.length})
            </p>
            {isOwner && canManage && (
              <button className="btn-secondary px-3 py-1 text-xs" onClick={() => setAddMode((v) => !v)}>
                {addMode ? <><X size={13} /> Fermer</> : <><UserPlus size={13} /> Ajouter</>}
              </button>
            )}
          </div>

          {addMode && (
            <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
              <select className="input" defaultValue="" onChange={(e) => { if (e.target.value) void onAddMember(e.target.value).then(() => setAddMode(false)); }}>
                <option value="" disabled>Choisir un membre…</option>
                {availableToAdd.map((u) => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                ))}
              </select>
              {availableToAdd.length === 0 && <p className="mt-1 text-xs text-slate-400">Tous les utilisateurs sont déjà membres.</p>}
            </div>
          )}

          <div className="space-y-2">
            {members.map((m) => {
              const member = typeof m === 'object' ? m : null;
              if (member) {
                return (
                  <div key={member.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2">
                    <Avatar firstName={member.firstName} lastName={member.lastName} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{member.firstName} {member.lastName}</p>
                      <p className="truncate text-xs text-slate-400">{member.email}</p>
                    </div>
                    {isOwner && typeof project.owner !== 'string' && project.owner.id !== member.id && (
                      <button onClick={() => void onRemoveMember(member.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Retirer">
                        <X size={15} />
                      </button>
                    )}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {isOwner && canManage && (
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button className="btn-secondary" onClick={onClose}>Fermer</button>
          </div>
        )}
      </div>
    </Modal>
  );
}