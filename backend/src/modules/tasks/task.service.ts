import mongoose from 'mongoose';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, PaginationOptions, PaginationResult } from '../../utils/pagination';
import ProjectModel from '../projects/project.model';
import UserModel, { UserRole } from '../users/user.model';
import {
  sendTaskAssignedNotification,
  sendTaskCompletedNotification,
} from '../notifications/notification.service';
import TaskModel, { ChecklistItem, TaskDocument, TaskPriority, TaskStatus } from './task.model';

export interface TaskQueryOptions extends PaginationOptions {
  project?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dueBefore?: Date;
  search?: string;
  sort?: string;
}

function taskQueryToSort(sort?: string): Record<string, 1 | -1> {
  switch (sort) {
    case 'dueDate':
      return { dueDate: 1 };
    case 'priority':
      return { priority: 1 };
    case 'updatedAt':
      return { updatedAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

const priorityWeight: Record<TaskPriority, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  URGENT: 3,
};

async function assertProjectAccess(projectId: string, userId: string, role: UserRole): Promise<void> {
  const project = await ProjectModel.findById(projectId);
  if (!project) throw new AppError(404, 'Projet introuvable');
  const isMember = project.members.map((m) => m.toString()).includes(userId);
  const isOwner = project.owner.toString() === userId;
  if (!isMember && !isOwner && role !== UserRole.ADMIN) {
    throw new AppError(403, 'Accès refusé au projet');
  }
}

export async function createTask(
  actorId: string,
  role: UserRole,
  dto: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    project: string;
    assignedTo?: string | null;
    dueDate?: Date | null;
    tags?: string[];
    checklist?: { text: string; completed?: boolean }[];
  }
): Promise<TaskDocument> {
  await assertProjectAccess(dto.project, actorId, role);

  const maxOrder = await TaskModel.findOne({ project: dto.project, status: dto.status ?? TaskStatus.TODO })
    .sort({ order: -1 })
    .select('order');
  const order = maxOrder ? maxOrder.order + 1 : 0;

  if (dto.assignedTo) {
    const assignee = await UserModel.findById(dto.assignedTo);
    if (!assignee) throw new AppError(404, 'Utilisateur assigné introuvable');
  }

  const task = await TaskModel.create({
    title: dto.title,
    description: dto.description,
    status: dto.status ?? TaskStatus.TODO,
    priority: dto.priority ?? TaskPriority.MEDIUM,
    project: dto.project,
    assignedTo: dto.assignedTo ?? null,
    createdBy: actorId,
    dueDate: dto.dueDate ?? null,
    tags: dto.tags ?? [],
    checklist: dto.checklist ?? [],
    order,
  });

  if (task.assignedTo && task.assignedTo.toString() !== actorId) {
    await sendTaskAssignedNotification(
      task,
      task.assignedTo.toString(),
      new mongoose.Types.ObjectId(actorId)
    );
  }

  return task;
}

export async function listTasks(
  requesterId: string,
  role: UserRole,
  options: TaskQueryOptions
): Promise<PaginationResult<TaskDocument>> {
  const filter: Record<string, unknown> = {};

  if (options.project) {
    await assertProjectAccess(options.project, requesterId, role);
    filter.project = options.project;
  } else if (role !== UserRole.ADMIN) {
    const projectDocs = await ProjectModel.find({
      $or: [{ owner: requesterId }, { members: requesterId }],
    }).select('_id');
    const projectIds = projectDocs.map((p) => p._id);
    filter.project = { $in: projectIds };
  }

  if (options.status) filter.status = options.status;
  if (options.priority) filter.priority = options.priority;
  if (options.assignedTo) {
    await UserModel.findById(options.assignedTo); // vérifie l'existence
    filter.assignedTo = options.assignedTo;
  }
  if (options.dueBefore) filter.dueDate = { $lte: options.dueBefore };
  if (options.search) {
    filter.$or = [{ title: new RegExp(options.search, 'i') }, { description: new RegExp(options.search, 'i') }];
  }

  const { page, limit, skip } = getPagination(options);
  const sort = taskQueryToSort(options.sort);
  const query = TaskModel.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('assignedTo', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar');

  const [items, total] = await Promise.all([
    query.exec(),
    TaskModel.countDocuments(filter),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}

async function getTaskWithAccess(taskId: string, requesterId: string, role: UserRole): Promise<TaskDocument> {
  const task = await TaskModel.findById(taskId)
    .populate('assignedTo', 'firstName lastName email avatar')
    .populate('createdBy', 'firstName lastName email avatar');
  if (!task) throw new AppError(404, 'Tâche introuvable');
  await assertProjectAccess(task.project.toString(), requesterId, role);
  return task;
}

export async function getTask(taskId: string, requesterId: string, role: UserRole): Promise<TaskDocument> {
  return getTaskWithAccess(taskId, requesterId, role);
}

export async function updateTask(
  taskId: string,
  actorId: string,
  role: UserRole,
  patch: {
    title?: string;
    description?: string | null;
    priority?: TaskPriority;
    assignedTo?: string | null;
    dueDate?: Date | null;
    tags?: string[];
  }
): Promise<TaskDocument> {
  const task = await getTaskWithAccess(taskId, actorId, role);

  let previousAssignee = task.assignedTo?.toString();
  if (patch.assignedTo !== undefined) {
    if (patch.assignedTo) {
      const assignee = await UserModel.findById(patch.assignedTo);
      if (!assignee) throw new AppError(404, 'Utilisateur assigné introuvable');
    }
    task.assignedTo = (patch.assignedTo as unknown as mongoose.Types.ObjectId) ?? null;
  }
  if (patch.title !== undefined) task.title = patch.title;
  if (patch.description !== undefined) task.description = patch.description ?? undefined;
  if (patch.priority !== undefined) task.priority = patch.priority;
  if (patch.dueDate !== undefined) task.dueDate = patch.dueDate ?? undefined;
  if (patch.tags !== undefined) task.tags = patch.tags;

  const currentAssignee = task.assignedTo;
  const assigned: boolean =
    currentAssignee !== null &&
    currentAssignee !== undefined &&
    previousAssignee !== currentAssignee.toString() &&
    currentAssignee.toString() !== actorId;

  await task.save();

  if (assigned) {
    await sendTaskAssignedNotification(task, task.assignedTo!.toString(), new mongoose.Types.ObjectId(actorId));
  }

  return task;
}

export async function assignTask(
  taskId: string,
  actorId: string,
  role: UserRole,
  assignedTo: string | null
): Promise<TaskDocument> {
  return updateTask(taskId, actorId, role, { assignedTo });
}

export async function updateTaskStatus(
  taskId: string,
  actorId: string,
  role: UserRole,
  status: TaskStatus
): Promise<TaskDocument> {
  const task = await getTaskWithAccess(taskId, actorId, role);

  const completed = status === TaskStatus.DONE && task.status !== TaskStatus.DONE;
  task.status = status;
  await task.save();

  if (completed && task.assignedTo && task.assignedTo.toString() !== actorId) {
    await sendTaskCompletedNotification(
      task.assignedTo.toString(),
      task.title,
      new mongoose.Types.ObjectId(actorId),
      task._id,
      task.project
    );
  }

  return task;
}

export async function deleteTask(taskId: string, actorId: string, role: UserRole): Promise<void> {
  const task = await getTaskWithAccess(taskId, actorId, role);
  await task.deleteOne();
}

export async function moveTask(
  taskId: string,
  actorId: string,
  role: UserRole,
  targetStatus: TaskStatus,
  targetOrder: number
): Promise<TaskDocument> {
  const task = await getTaskWithAccess(taskId, actorId, role);
  const oldStatus = task.status;

  if (task.status !== targetStatus) {
    task.status = targetStatus;
    task.order = targetOrder;

    await TaskModel.updateMany(
      {
        project: task.project,
        status: targetStatus,
        _id: { $ne: task._id },
        order: { $gte: targetOrder },
      },
      { $inc: { order: 1 } }
    );

    const shrink = TaskModel.updateMany(
      {
        project: task.project,
        status: oldStatus,
        _id: { $ne: task._id },
        order: { $gt: targetOrder },
      },
      { $inc: { order: -1 } }
    );
    await shrink;
  } else if (task.order !== targetOrder) {
    if (targetOrder > task.order) {
      await TaskModel.updateMany(
        {
          project: task.project,
          status: targetStatus,
          _id: { $ne: task._id },
          order: { $gt: task.order, $lte: targetOrder },
        },
        { $inc: { order: -1 } }
      );
    } else {
      await TaskModel.updateMany(
        {
          project: task.project,
          status: targetStatus,
          _id: { $ne: task._id },
          order: { $gte: targetOrder, $lt: task.order },
        },
        { $inc: { order: 1 } }
      );
    }
    task.order = targetOrder;
  }

  await task.save();
  return task;
}

export async function addChecklistItem(taskId: string, actorId: string, role: UserRole, text: string): Promise<TaskDocument> {
  const task = await getTaskWithAccess(taskId, actorId, role);
  task.checklist.push({ text } as ChecklistItem);
  await task.save();
  return task;
}

export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  actorId: string,
  role: UserRole,
  patch: { text?: string; completed?: boolean }
): Promise<TaskDocument> {
  const task = await getTaskWithAccess(taskId, actorId, role);
  const item = task.checklist.find((c) => c._id.toString() === itemId);
  if (!item) throw new AppError(404, 'Élément de checklist introuvable');
  if (patch.text !== undefined) item.text = patch.text;
  if (patch.completed !== undefined) item.completed = patch.completed;
  await task.save();
  return task;
}

export async function removeChecklistItem(taskId: string, itemId: string, actorId: string, role: UserRole): Promise<TaskDocument> {
  const task = await getTaskWithAccess(taskId, actorId, role);
  const exists = task.checklist.some((c) => c._id.toString() === itemId);
  if (!exists) throw new AppError(404, 'Élément de checklist introuvable');
  task.checklist = task.checklist.filter((c) => c._id.toString() !== itemId);
  await task.save();
  return task;
}

export function sortByPriority(tasks: TaskDocument[]): TaskDocument[] {
  return [...tasks].sort(
    (a, b) => priorityWeight[b.priority] - priorityWeight[a.priority] || a.dueDate!.getTime() - b.dueDate!.getTime()
  );
}