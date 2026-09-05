import mongoose from 'mongoose';
import { AppError } from '../../middleware/error.middleware';
import { getPagination, PaginationOptions, PaginationResult } from '../../utils/pagination';
import { sendTaskCommentedNotification } from '../notifications/notification.service';
import ProjectModel from '../projects/project.model';
import TaskModel from '../tasks/task.model';
import UserModel, { UserRole } from '../users/user.model';
import CommentModel, { CommentDocument } from './comment.model';

async function assertTaskAccess(taskId: string, requesterId: string, role: UserRole): Promise<void> {
  const task = await TaskModel.findById(taskId).populate('project');
  if (!task) throw new AppError(404, 'Tâche introuvable');
  const project = task.project as unknown as { _id: mongoose.Types.ObjectId; owner: mongoose.Types.ObjectId; members: mongoose.Types.ObjectId[] };
  const isMember = (project.members ?? []).map((m) => m.toString()).includes(requesterId);
  const isOwner = project.owner.toString() === requesterId;
  if (!isMember && !isOwner && role !== UserRole.ADMIN) {
    throw new AppError(403, 'Accès refusé à la tâche');
  }
}

export async function createComment(
  taskId: string,
  authorId: string,
  role: UserRole,
  content: string
): Promise<CommentDocument> {
  await assertTaskAccess(taskId, authorId, role);
  const task = await TaskModel.findById(taskId);
  if (!task) throw new AppError(404, 'Tâche introuvable');

  const comment = await CommentModel.create({
    content,
    task: taskId,
    author: authorId,
  });

  const author = await UserModel.findById(authorId);
  const assigneeId = task.assignedTo?.toString();

  if (assigneeId && assigneeId !== authorId) {
    const project = await ProjectModel.findById(task.project);
    await sendTaskCommentedNotification(
      assigneeId,
      task.title,
      author ? `${author.firstName} ${author.lastName}` : 'Un membre',
      task._id,
      (project?._id as mongoose.Types.ObjectId) ?? task.project
    );
  }

  return (await CommentModel.findById(comment._id).populate('author', 'firstName lastName email avatar')) as CommentDocument;
}

export async function listComments(
  taskId: string,
  requesterId: string,
  role: UserRole,
  options: PaginationOptions
): Promise<PaginationResult<CommentDocument>> {
  await assertTaskAccess(taskId, requesterId, role);
  const { page, limit, skip } = getPagination(options);
  const filter = { task: taskId };

  const query = CommentModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'firstName lastName email avatar');

  const [items, total] = await Promise.all([query.exec(), CommentModel.countDocuments(filter)]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}

export async function updateComment(
  commentId: string,
  actorId: string,
  role: UserRole,
  content: string
): Promise<CommentDocument> {
  const comment = await CommentModel.findById(commentId);
  if (!comment) throw new AppError(404, 'Commentaire introuvable');

  if (comment.author.toString() !== actorId && role !== UserRole.ADMIN) {
    throw new AppError(403, "Vous ne pouvez modifier que vos propres commentaires");
  }

  comment.content = content;
  await comment.save();
  return (await CommentModel.findById(comment._id).populate('author', 'firstName lastName email avatar')) as CommentDocument;
}

export async function deleteComment(commentId: string, actorId: string, role: UserRole): Promise<void> {
  const comment = await CommentModel.findById(commentId);
  if (!comment) throw new AppError(404, 'Commentaire introuvable');

  if (comment.author.toString() !== actorId && role !== UserRole.ADMIN) {
    throw new AppError(403, "Vous ne pouvez supprimer que vos propres commentaires");
  }

  await comment.deleteOne();
}