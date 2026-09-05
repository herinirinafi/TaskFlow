import mongoose from 'mongoose';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, PaginationOptions, PaginationResult } from '../../utils/pagination';
import NotificationModel, { NotificationDocument, NotificationType } from './notification.model';

export { NotificationType };

// ————— Création / émission de notifications —————

export interface CreateNotificationInput {
  recipient: string;
  actor?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  task?: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
}

export async function sendNotification(input: CreateNotificationInput): Promise<NotificationDocument> {
  return NotificationModel.create({
    recipient: input.recipient,
    actor: input.actor,
    type: input.type,
    title: input.title,
    message: input.message,
    task: input.task,
    project: input.project,
    read: false,
  });
}

export async function sendTaskAssignedNotification(
  task: { _id: mongoose.Types.ObjectId; title: string; project: mongoose.Types.ObjectId },
  assigneeId: string,
  actorId: mongoose.Types.ObjectId
): Promise<void> {
  await sendNotification({
    recipient: assigneeId,
    actor: actorId,
    type: NotificationType.TASK_ASSIGNED,
    title: 'Nouvelle tâche assignée',
    message: `Vous avez été assigné à la tâche "${task.title}"`,
    task: task._id,
    project: task.project,
  });
}

export async function sendTaskCommentedNotification(
  recipientId: string,
  taskTitle: string,
  actorName: string,
  taskId: mongoose.Types.ObjectId,
  projectId: mongoose.Types.ObjectId
): Promise<void> {
  await sendNotification({
    recipient: recipientId,
    type: NotificationType.TASK_COMMENTED,
    title: 'Nouveau commentaire',
    message: `${actorName} a commenté votre tâche "${taskTitle}"`,
    task: taskId,
    project: projectId,
  });
}

export async function sendTaskCompletedNotification(
  recipientId: string,
  taskTitle: string,
  actorId: mongoose.Types.ObjectId,
  taskId: mongoose.Types.ObjectId,
  projectId: mongoose.Types.ObjectId
): Promise<void> {
  await sendNotification({
    recipient: recipientId,
    actor: actorId,
    type: NotificationType.TASK_COMPLETED,
    title: 'Tâche terminée',
    message: `La tâche "${taskTitle}" est terminée`,
    task: taskId,
    project: projectId,
  });
}

export async function sendTaskDeadlineNotifications(
  tasks: {
    _id: mongoose.Types.ObjectId;
    title: string;
    assignedTo?: mongoose.Types.ObjectId | null;
    dueDate: Date;
    project: mongoose.Types.ObjectId;
  }[]
): Promise<void> {
  for (const task of tasks) {
    const dueIn = (task.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (dueIn > 0 && dueIn <= 1 && task.assignedTo) {
      await sendNotification({
        recipient: task.assignedTo.toString(),
        type: NotificationType.TASK_DEADLINE,
        title: 'Échéance proche',
        message: `La tâche "${task.title}" arrive à échéance demain`,
        task: task._id,
        project: task.project,
      });
    }
  }
}

// ————— Lecture / gestion pour un utilisateur —————

export async function listNotificationsForUser(
  userId: string,
  options: PaginationOptions & { unreadOnly?: boolean }
): Promise<PaginationResult<NotificationDocument>> {
  const filter: Record<string, unknown> = { recipient: userId };
  if (options.unreadOnly) filter.read = false;

  const { page, limit, skip } = getPagination(options);
  const query = NotificationModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('actor', 'firstName lastName email avatar')
    .populate('task', 'title status')
    .populate('project', 'name');

  const [items, total] = await Promise.all([query.exec(), NotificationModel.countDocuments(filter)]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return NotificationModel.countDocuments({ recipient: userId, read: false });
}

export async function markAsRead(userId: string, notificationId: string): Promise<NotificationDocument> {
  const notification = await NotificationModel.findOne({ _id: notificationId, recipient: userId });
  if (!notification) throw new AppError(404, 'Notification introuvable');
  notification.read = true;
  notification.readAt = new Date();
  await notification.save();
  return notification;
}

export async function markAllAsRead(userId: string): Promise<number> {
  const result = await NotificationModel.updateMany(
    { recipient: userId, read: false },
    { read: true, readAt: new Date() }
  );
  return result.modifiedCount;
}

export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  const notification = await NotificationModel.findOne({ _id: notificationId, recipient: userId });
  if (!notification) throw new AppError(404, 'Notification introuvable');
  await notification.deleteOne();
}