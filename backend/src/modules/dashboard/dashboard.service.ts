import mongoose from 'mongoose';
import { AppError } from '../../middleware/error.middleware';
import ProjectModel, { ProjectStatus } from '../projects/project.model';
import TaskModel, { TaskPriority, TaskStatus } from '../tasks/task.model';
import UserModel, { UserRole } from '../users/user.model';

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
  recentTasks: unknown[];
  urgentTasks: unknown[];
  activeMembers: { user: unknown; completed: number; inProgress: number }[];
  projectProgress: { project: unknown; done: number; total: number; rate: number }[];
  global?: {
    totalUsers: number;
    activeUsers: number;
    totalProjects: number;
    activeProjects: number;
    totalTeams: number;
  };
}

export async function getDashboardSummary(
  userId: string,
  role: UserRole
): Promise<DashboardSummary> {
  const projectFilter: Record<string, unknown> = {};
  if (role !== UserRole.ADMIN) projectFilter.$or = [{ owner: userId }, { members: userId }];

  const projects = await ProjectModel.find(projectFilter).select('_id name status');
  const projectIds = projects.map((p) => p._id);

  const taskFilter: Record<string, unknown> =
    projectIds.length > 0 ? { project: { $in: projectIds } } : { project: null };

  const now = new Date();
  const [totalTasks, todo, inProgress, done, overdue, urgent] = await Promise.all([
    TaskModel.countDocuments(taskFilter),
    TaskModel.countDocuments({ ...taskFilter, status: TaskStatus.TODO }),
    TaskModel.countDocuments({ ...taskFilter, status: TaskStatus.IN_PROGRESS }),
    TaskModel.countDocuments({ ...taskFilter, status: TaskStatus.DONE }),
    TaskModel.countDocuments({
      ...taskFilter,
      dueDate: { $lt: now },
      status: { $ne: TaskStatus.DONE },
    }),
    TaskModel.countDocuments({
      ...taskFilter,
      priority: { $in: [TaskPriority.HIGH, TaskPriority.URGENT] },
      status: { $ne: TaskStatus.DONE },
    }),
  ]);

  // Activité : tâches créées par jour (7 derniers jours)
  const days = 7;
  const activity: { date: string; count: number }[] = [];
  const createdTasks = await TaskModel.aggregate<{ _id: string; count: number }>([
    {
      $match: {
        ...(projectIds.length > 0 ? { project: { $in: projectIds } } : {}),
        createdAt: { $gte: new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' },
        },
        count: { $sum: 1 },
      },
    },
  ]);
  const countByDay = new Map(createdTasks.map((r) => [r._id, r.count]));
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    activity.push({ date: key, count: countByDay.get(key) ?? 0 });
  }

  const [recentTasks, urgentTasks] = await Promise.all([
    TaskModel.find(taskFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('project', 'name'),
    TaskModel.find({
      ...taskFilter,
      priority: { $in: [TaskPriority.HIGH, TaskPriority.URGENT] },
      status: { $ne: TaskStatus.DONE },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('assignedTo', 'firstName lastName email avatar')
      .populate('project', 'name'),
  ]);

  // Membres actifs : top par tâches terminées
  const topMembers = await TaskModel.aggregate<{
    _id: mongoose.Types.ObjectId;
    done: number;
    inProgress: number;
  }>([
    { $match: taskFilter },
    {
      $group: {
        _id: '$assignedTo',
        done: { $sum: { $cond: [{ $eq: ['$status', TaskStatus.DONE] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', TaskStatus.IN_PROGRESS] }, 1, 0] } },
      },
    },
    { $sort: { done: -1 } },
    { $limit: 5 },
    { $match: { _id: { $ne: null } } },
  ]);
  const memberIds = topMembers.map((m) => m._id);
  const memberDocs = memberIds.length
    ? await UserModel.find({ _id: { $in: memberIds } }).select('firstName lastName email avatar')
    : [];
  const memberMap = new Map(memberDocs.map((u) => [u._id.toString(), u]));
  const activeMembers = topMembers
    .filter((m) => memberMap.has(m._id.toString()))
    .map((m) => ({
      user: memberMap.get(m._id.toString()),
      completed: m.done,
      inProgress: m.inProgress,
    }));

  // Progression des projets
  const projectTasks = await TaskModel.aggregate<{
    _id: mongoose.Types.ObjectId;
    done: number;
    total: number;
  }>([
    { $match: taskFilter },
    {
      $group: {
        _id: '$project',
        done: { $sum: { $cond: [{ $eq: ['$status', TaskStatus.DONE] }, 1, 0] } },
        total: { $sum: 1 },
      },
    },
  ]);
  const projectById = new Map(projects.map((p) => [p._id.toString(), p]));
  const projectProgress = projectTasks
    .filter((t) => projectById.has(t._id.toString()))
    .map((t) => {
      const project = projectById.get(t._id.toString())!;
      return {
        project,
        done: t.done,
        total: t.total,
        rate: t.total === 0 ? 0 : Math.round((t.done / t.total) * 100),
      };
    })
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  const summary: DashboardSummary = {
    kpis: {
      totalTasks,
      todo,
      inProgress,
      done,
      completionRate: totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100),
      overdue,
      urgent,
    },
    activity,
    recentTasks,
    urgentTasks,
    activeMembers,
    projectProgress,
  };

  if (role === UserRole.ADMIN) {
    const [totalUsers, activeUsers, totalProjects, activeProjects, totalTeams] = await Promise.all([
      UserModel.countDocuments(),
      UserModel.countDocuments({ isActive: true }),
      ProjectModel.countDocuments(),
      ProjectModel.countDocuments({ status: { $in: [ProjectStatus.ACTIVE, ProjectStatus.PLANNING] } }),
      import('../teams/team.model').then((m) => m.default.countDocuments()),
    ]);
    summary.global = { totalUsers, activeUsers, totalProjects, activeProjects, totalTeams };
  }

  return summary;
}

export async function assertObjectId(id: string, label: string): Promise<void> {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw new AppError(400, `${label} invalide`);
  }
}