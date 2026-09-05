import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Flag,
  ListTodo,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { InlineLoader } from '@/components/ui/Spinner';
import { dashboardService } from '@/services';
import { useAuthStore } from '@/store/auth.store';
import type { DashboardSummary } from '@/types';
import { PRIORITY_LABELS, PRIORITY_STYLES, STATUS_LABELS } from '@/utils/constants';
import { formatDate, isOverdue } from '@/utils/format';

function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: typeof ListTodo; accent: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={22} />
      </span>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .summary()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <InlineLoader />;

  if (!data) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Impossible de charger le dashboard"
        message="Vérifiez que le backend est bien démarré."
      />
    );
  }

  const { kpis } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Bonjour, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">Voici l'activité de vos projets.</p>
      </div>

      {data.global && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Utilisateurs', value: data.global.totalUsers },
            { label: 'Comptes actifs', value: data.global.activeUsers },
            { label: 'Projets', value: data.global.totalProjects },
            { label: 'Teams', value: data.global.totalTeams },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-gradient-to-br from-primary-600 to-indigo-700 px-4 py-3 text-white">
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-primary-100">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total tâches" value={kpis.totalTasks} icon={ClipboardList} accent="bg-primary-50 text-primary-600" />
        <KpiCard label="À faire" value={kpis.todo} icon={ListTodo} accent="bg-slate-100 text-slate-600" />
        <KpiCard label="En cours" value={kpis.inProgress} icon={Clock} accent="bg-blue-50 text-blue-600" />
        <KpiCard label="Terminées" value={kpis.done} icon={CheckCircle2} accent="bg-green-50 text-green-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activité */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Activité (7 derniers jours)</h2>
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
              Complétion : {kpis.completionRate}%
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.activity}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={(v: string) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={28} />
                <Tooltip labelFormatter={(v) => new Date(String(v)).toLocaleDateString('fr-FR')} />
                <Area type="monotone" dataKey="count" name="Tâches créées" stroke="#4f46e5" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tâches urgentes */}
        <div className="card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
            <Flag size={15} className="text-red-500" /> Urgentes
          </h2>
          {data.urgentTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Aucune tâche urgente 🎉</p>
          ) : (
            <div className="space-y-2">
              {data.urgentTasks.map((task) => {
                const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';
                const assignee = task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo : null;
                return (
                  <Link key={task._id} to={`/tasks?task=${task._id}`} className="block rounded-lg border border-red-100 bg-red-50/50 p-3 transition hover:bg-red-50">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{task.title}</p>
                      <Badge className={PRIORITY_STYLES[task.priority]}>{PRIORITY_LABELS[task.priority]}</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className={overdue ? 'font-semibold text-red-600' : 'text-slate-500'}>
                        {overdue ? 'En retard — ' : ''}{formatDate(task.dueDate)}
                      </span>
                      {assignee && <Avatar firstName={assignee.firstName} lastName={assignee.lastName} size={20} />}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tâches récentes */}
        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-3 font-semibold text-slate-800">Tâches récentes</h2>
          {data.recentTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Aucune tâche</p>
          ) : (
            <div className="space-y-2">
              {data.recentTasks.map((task) => (
                <Link key={task._id} to={`/tasks?task=${task._id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${task.status === 'DONE' ? 'bg-green-500' : task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-700">{task.title}</p>
                    <p className="text-xs text-slate-400">{STATUS_LABELS[task.status]}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Membres actifs */}
        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-800">
            <Users size={15} className="text-slate-400" /> Membres les plus actifs
          </h2>
          {data.activeMembers.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Aucune donnée</p>
          ) : (
            <div className="space-y-3">
              {data.activeMembers.map((m) => (
                <div key={m.user.id} className="flex items-center gap-3">
                  <Avatar firstName={m.user.firstName} lastName={m.user.lastName} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {m.user.firstName} {m.user.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{m.completed + m.inProgress} tâche(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{m.completed} ✓</p>
                    <p className="text-xs text-blue-500">{m.inProgress} en cours</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progression projets */}
        <div className="card p-5 lg:col-span-1">
          <h2 className="mb-3 font-semibold text-slate-800">Progression des projets</h2>
          {data.projectProgress.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Aucun projet</p>
          ) : (
            <div className="space-y-4">
              {data.projectProgress.map((p) => {
                const projectName = typeof p.project === 'object' ? p.project.name : 'Projet';
                return (
                  <div key={typeof p.project === 'object' ? p.project._id : 'x'}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate font-medium text-slate-700">{projectName}</span>
                      <span className="text-slate-500">{p.rate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${p.rate}%`, backgroundColor: p.rate === 100 ? '#22c55e' : '#4f46e5' }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">{p.done}/{p.total} tâches terminées</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}