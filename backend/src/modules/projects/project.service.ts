import mongoose from 'mongoose';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, PaginationOptions, PaginationResult } from '../../utils/pagination';
import { sendNotification, NotificationType } from '../notifications/notification.service';
import TaskModel, { TaskStatus } from '../tasks/task.model';
import UserModel, { UserRole } from '../users/user.model';
import ProjectModel, { ProjectDocument, ProjectStatus } from './project.model';

export interface ProjectWithTasks extends ProjectDocument {
  taskCount?: number;
  completedCount?: number;
}

export async function createProject(
  ownerId: string,
  dto: {
    name: string;
    description?: string;
    team?: string;
    members?: string[];
    startDate?: Date;
    deadline?: Date;
    status?: ProjectStatus;
  }
): Promise<ProjectDocument> {
  const members = dto.members ?? [];
  const uniqueMembers = [...new Set([ownerId, ...members])];

  if (dto.team) {
    const team = await import('../teams/team.model').then((m) => m.default.findById(dto.team));
    if (!team) throw new AppError(404, 'Team introuvable');
    const teamMembers = team.members.map((m) => m.toString());
    for (const member of uniqueMembers) {
      if (!teamMembers.includes(member) && member !== team.owner.toString()) {
        throw new AppError(400, `L'utilisateur ${member} n'appartient pas à la team`);
      }
    }
  }

  const project = await ProjectModel.create({
    name: dto.name,
    description: dto.description,
    owner: ownerId,
    team: dto.team,
    members: uniqueMembers,
    startDate: dto.startDate,
    deadline: dto.deadline,
    status: dto.status,
  });

  return project;
}

export async function getProjectForUser(
  projectId: string,
  userId: string,
  role: UserRole
): Promise<ProjectDocument> {
  const project = await ProjectModel.findById(projectId).populate('owner', 'firstName lastName email avatar');
  if (!project) throw new AppError(404, 'Projet introuvable');

  const isMember = project.members.map((m) => m.toString()).includes(userId);
  const isOwner = project.owner._id.toString() === userId;
  if (!isMember && !isOwner && role !== UserRole.ADMIN) {
    throw new AppError(403, 'Accès refusé au projet');
  }
  return project;
}

export async function listProjectsForUser(
  userId: string,
  role: UserRole,
  options: PaginationOptions & { status?: ProjectStatus; search?: string }
): Promise<PaginationResult<ProjectWithTasks>> {
  const filter: Record<string, unknown> = {};
  if (role !== UserRole.ADMIN) {
    filter.$or = [{ owner: userId }, { members: userId }];
  }
  if (options.status) filter.status = options.status;
  if (options.search) filter.name = new RegExp(options.search, 'i');

  const { page, limit, skip } = getPagination(options);
  const [raw, total] = await Promise.all([
    ProjectModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'firstName lastName email avatar')
      .populate('members', 'firstName lastName email avatar')
      .exec(),
    ProjectModel.countDocuments(filter),
  ]);

  const items: ProjectWithTasks[] = [];
  for (const project of raw) {
    const [taskCount, completedCount] = await Promise.all([
      TaskModel.countDocuments({ project: project._id }),
      TaskModel.countDocuments({ project: project._id, status: TaskStatus.DONE }),
    ]);
    const withStats = project.toObject() as ProjectWithTasks;
    withStats.taskCount = taskCount;
    withStats.completedCount = completedCount;
    items.push(withStats);
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}

export async function updateProject(
  projectId: string,
  actorId: string,
  role: UserRole,
  patch: {
    name?: string;
    description?: string | null;
    team?: string | null;
    startDate?: Date | null;
    deadline?: Date | null;
    status?: ProjectStatus;
  }
): Promise<ProjectDocument> {
  const project = await getProjectForUser(projectId, actorId, role);

  if (role !== UserRole.ADMIN && project.owner.toString() !== actorId) {
    throw new AppError(403, "Seul le propriétaire peut modifier le projet");
  }

  if (patch.team !== undefined) project.team = (patch.team as unknown as mongoose.Types.ObjectId) ?? null;
  if (patch.name !== undefined) project.name = patch.name;
  if (patch.description !== undefined) project.description = patch.description ?? undefined;
  if (patch.startDate !== undefined) project.startDate = patch.startDate ?? undefined;
  if (patch.deadline !== undefined) project.deadline = patch.deadline ?? undefined;
  if (patch.status !== undefined) project.status = patch.status;

  await project.save();
  return project;
}

export async function deleteProject(
  projectId: string,
  actorId: string,
  role: UserRole
): Promise<void> {
  const project = await getProjectForUser(projectId, actorId, role);
  if (role !== UserRole.ADMIN && project.owner.toString() !== actorId) {
    throw new AppError(403, "Seul le propriétaire peut supprimer le projet");
  }
  await TaskModel.deleteMany({ project: projectId });
  await project.deleteOne();
}

export async function addProjectMember(
  projectId: string,
  actorId: string,
  role: UserRole,
  userId: string
): Promise<ProjectDocument> {
  const project = await getProjectForUser(projectId, actorId, role);
  if (role !== UserRole.ADMIN && project.owner.toString() !== actorId) {
    throw new AppError(403, "Seul le propriétaire peut inviter des membres");
  }

  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'Utilisateur introuvable');

  if (project.members.includes(user._id)) {
    return project;
  }

  project.members.push(user._id);
  await project.save();

  await sendNotification({
    recipient: userId,
    actor: new mongoose.Types.ObjectId(actorId),
    type: NotificationType.PROJECT_INVITE,
    title: 'Invitation projet',
    message: `Vous avez été ajouté au projet "${project.name}"`,
    project: project._id,
  });

  return project;
}

export async function removeProjectMember(
  projectId: string,
  actorId: string,
  role: UserRole,
  userId: string
): Promise<ProjectDocument> {
  const project = await getProjectForUser(projectId, actorId, role);
  if (role !== UserRole.ADMIN && project.owner.toString() !== actorId) {
    throw new AppError(403, "Seul le propriétaire peut retirer des membres");
  }
  if (project.owner.toString() === userId) {
    throw new AppError(400, "Impossible de retirer le propriétaire du projet");
  }

  project.members = project.members.filter((m) => m.toString() !== userId);
  await project.save();

  await TaskModel.updateMany(
    { project: projectId, assignedTo: userId },
    { $unset: { assignedTo: 1 } }
  );

  return project;
}

export interface ProjectStats {
  totalTasks: number;
  todo: number;
  inProgress: number;
  done: number;
  completionRate: number;
  overdue: number;
}

export async function getProjectStats(projectId: string): Promise<ProjectStats> {
  const tasks = await TaskModel.find({ project: projectId }).select('status dueDate');
  const totalTasks = tasks.length;
  const todo = tasks.filter((t) => t.status === TaskStatus.TODO).length;
  const inProgress = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const done = tasks.filter((t) => t.status === TaskStatus.DONE).length;
  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < new Date() && t.status !== TaskStatus.DONE).length;

  return {
    totalTasks,
    todo,
    inProgress,
    done,
    completionRate: totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100),
    overdue,
  };
}