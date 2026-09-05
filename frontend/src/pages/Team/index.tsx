import { ShieldCheck, Trash2, UserPlus, Users, UserX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { getErrorMessage } from '@/services/api';
import { teamService, userService } from '@/services';
import { useUsers } from '@/hooks/useUsers';
import { useAuthStore } from '@/store/auth.store';
import { useUiStore } from '@/store/ui.store';
import type { Team, User, UserRole } from '@/types';
import { ROLE_LABELS, USER_ROLES } from '@/utils/constants';
import { formatDate } from '@/utils/format';

export function Team() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const toast = useUiStore((s) => s.toast);
  const [tab, setTab] = useState<'teams' | 'users'>('teams');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Users size={24} className="text-primary-600" /> Équipe
          </h1>
          <p className="mt-1 text-sm text-slate-500">Gérez vos teams et vos collaborateurs.</p>
        </div>
      </div>

      {isAdmin && (
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            onClick={() => setTab('teams')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${tab === 'teams' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Teams
          </button>
          <button
            onClick={() => setTab('users')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${tab === 'users' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Utilisateurs
          </button>
        </div>
      )}

      {tab === 'teams' ? (
        <TeamsPanel canCreate={canCreate} toast={toast} />
      ) : (
        <UsersPanel toast={toast} />
      )}
    </div>
  );
}

function TeamsPanel({ canCreate, toast }: { canCreate: boolean; toast: (t: 'success' | 'error' | 'info', m: string) => void }) {
  const { user } = useAuthStore();
  const { users } = useUsers();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    teamService
      .list({ page: 1, limit: 100 })
      .then((r) => setTeams(r.items))
      .catch((err) => toast('error', getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (name: string, description: string, members: string[]) => {
    setSaving(true);
    try {
      await teamService.create({ name, description, members });
      toast('success', 'Team créée');
      setCreateOpen(false);
      load();
    } catch (err) {
      toast('error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (team: Team) => {
    useUiStore.getState().askConfirm({
      title: `Supprimer « ${team.name} » ?`,
      message: 'Les membres détenus ne seront pas supprimés.',
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try {
          await teamService.remove(team._id);
          toast('success', 'Team supprimée');
          load();
        } catch (err) {
          toast('error', getErrorMessage(err));
        }
      },
    });
  };

  if (loading) return <InlineLoader label="Chargement des teams…" />;

  if (teams.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Aucune team"
        message={canCreate ? 'Créez une team pour regrouper vos collaborateurs.' : 'Aucune team disponible.'}
        action={
          canCreate ? (
            <button className="btn-primary" onClick={() => setCreateOpen(true)}>Créer une team</button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          <UserPlus size={16} /> Créer une team
        </button>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => {
          const members = team.members ?? [];
          const owner = typeof team.owner === 'object' ? team.owner : null;
          const isOwner = user?.role === 'ADMIN' || (owner && owner.id === user?.id);
          return (
            <div key={team._id} className="card p-5">
              <div className="flex items-start justify-between">
                <Badge className="bg-primary-50 text-primary-700 border-primary-100">{team.name}</Badge>
                {isOwner && (
                  <button onClick={() => confirmDelete(team)} className="rounded p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500" aria-label="Supprimer">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              {team.description && <p className="mt-2 text-sm text-slate-500">{team.description}</p>}
              <div className="mt-4 flex -space-x-2">
                {members.slice(0, 6).map((m) => {
                  const member = typeof m === 'object' ? m : null;
                  return member ? (
                    <Avatar key={member.id} firstName={member.firstName} lastName={member.lastName} size={30} className="ring-2 ring-white" />
                  ) : null;
                })}
                {members.length > 6 && (
                  <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-600 ring-2 ring-white">
                    +{members.length - 6}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                {members.length} membre(s){owner ? ` · Menée par ${owner.firstName} ${owner.lastName}` : ''} · Créée le {formatDate(team.createdAt)}
              </p>
            </div>
          );
        })}
      </div>

      <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} users={users} onSubmit={handleCreate} saving={saving} />
    </div>
  );
}

function CreateTeamModal({ open, onClose, users, onSubmit, saving }: { open: boolean; onClose: () => void; users: User[]; onSubmit: (name: string, description: string, members: string[]) => Promise<void>; saving: boolean }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [wasOpen, setWasOpen] = useState(false);

  if (open && !wasOpen) {
    setWasOpen(true);
    setName('');
    setDescription('');
    setMembers([]);
  }
  if (!open && wasOpen) setWasOpen(false);

  const toggle = (id: string) =>
    setMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle team">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit(name, description, members);
        }}
        className="space-y-4"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nom *</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Équipe Produit" required autoFocus />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea className="input min-h-16 resize-y" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Membres</label>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {users.length === 0 && <p className="px-2 py-1 text-xs text-slate-400">Aucun utilisateur disponible.</p>}
            {users.map((u) => (
              <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-slate-50">
                <input type="checkbox" checked={members.includes(u.id)} onChange={() => toggle(u.id)} className="h-4 w-4 rounded border-slate-300 text-primary-600" />
                <Avatar firstName={u.firstName} lastName={u.lastName} size={24} />
                <span className="text-sm text-slate-700">{u.firstName} {u.lastName}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
          <button type="submit" className="btn-primary" disabled={saving || !name.trim()}>
            {saving ? 'Création…' : 'Créer la team'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UsersPanel({ toast }: { toast: (t: 'success' | 'error' | 'info', m: string) => void }) {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    userService
      .list({ page: 1, limit: 100 })
      .then((r) => setUsers(r.items))
      .catch((err) => toast('error', getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q));
  }, [users, search]);

  const changeRole = async (id: string, role: UserRole) => {
    try {
      await userService.update(id, { role });
      toast('success', 'Rôle mis à jour');
      load();
    } catch (err) {
      toast('error', getErrorMessage(err));
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await userService.update(id, { isActive });
      toast('success', isActive ? 'Utilisateur désactivé' : 'Utilisateur réactivé');
      load();
    } catch (err) {
      toast('error', getErrorMessage(err));
    }
  };

  if (loading) return <InlineLoader label="Chargement des utilisateurs…" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input type="search" className="input max-w-sm" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <span className="text-sm text-slate-500">{filtered.length} utilisateur(s)</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((u) => (
              <tr key={u.id} className={`transition hover:bg-slate-50 ${u.id === me?.id ? 'bg-primary-50/40' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar firstName={u.firstName} lastName={u.lastName} size={34} />
                    <div>
                      <p className="font-medium text-slate-800">
                        {u.firstName} {u.lastName}
                        {u.id === me?.id && <span className="ml-1 text-xs text-slate-400">(vous)</span>}
                      </p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {u.isActive ? (
                    <Badge className="border-green-200 bg-green-50 text-green-700">Actif</Badge>
                  ) : (
                    <Badge className="border-red-200 bg-red-50 text-red-700">Désactivé</Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="input w-auto px-2 py-1 text-xs"
                    value={u.role}
                    disabled={u.id === me?.id}
                    onChange={(e) => void changeRole(u.id, e.target.value as UserRole)}
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id !== me?.id && (
                    <button
                      onClick={() => void toggleActive(u.id, !u.isActive)}
                      className={`rounded-lg p-2 transition ${
                        u.isActive
                          ? 'text-slate-400 hover:bg-red-50 hover:text-red-500'
                          : 'text-green-500 hover:bg-green-50'
                      }`}
                      title={u.isActive ? 'Désactiver' : 'Réactiver'}
                    >
                      {u.isActive ? <UserX size={16} /> : <ShieldCheck size={16} />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-slate-400">Aucun utilisateur trouvé.</p>}
      </div>
    </div>
  );
}