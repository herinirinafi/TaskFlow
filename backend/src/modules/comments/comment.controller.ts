import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { createComment, deleteComment, listComments, updateComment } from './comment.service';

export async function createCommentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await createComment(req.params.taskId, userId, userRole, req.body.content);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listCommentsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const { page, limit } = req.query as Record<string, string | undefined>;
    const result = await listComments(req.params.taskId, userId, userRole, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateCommentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await updateComment(req.params.id, userId, userRole, req.body.content);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteCommentHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    await deleteComment(req.params.id, userId, userRole);
    res.status(200).json({ success: true, message: 'Commentaire supprimé' });
  } catch (err) {
    next(err);
  }
}