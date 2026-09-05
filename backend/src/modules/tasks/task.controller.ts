import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  addChecklistItem,
  assignTask,
  createTask,
  deleteTask,
  getTask,
  listTasks,
  moveTask,
  removeChecklistItem,
  updateChecklistItem,
  updateTask,
  updateTaskStatus,
} from './task.service';

export async function createTaskHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await createTask(userId, userRole, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listTasksHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const q = req.query as Record<string, string | undefined>;
    const result = await listTasks(userId, userRole, {
      page: q.page ? Number(q.page) : undefined,
      limit: q.limit ? Number(q.limit) : undefined,
      project: q.project,
      status: q.status,
      priority: q.priority,
      assignedTo: q.assignedTo,
      dueBefore: q.dueBefore ? new Date(q.dueBefore) : undefined,
      search: q.search,
      sort: q.sort,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getTaskHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await getTask(req.params.id, userId, userRole);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await updateTask(req.params.id, userId, userRole, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatusHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await updateTaskStatus(req.params.id, userId, userRole, req.body.status);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function assignTaskHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await assignTask(req.params.id, userId, userRole, req.body.assignedTo);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteTaskHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    await deleteTask(req.params.id, userId, userRole);
    res.status(200).json({ success: true, message: 'Tâche supprimée' });
  } catch (err) {
    next(err);
  }
}

export async function moveTaskHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await moveTask(req.params.id, userId, userRole, req.body.status, req.body.order);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function addChecklistItemHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await addChecklistItem(req.params.id, userId, userRole, req.body.text);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateChecklistItemHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await updateChecklistItem(
      req.params.id,
      req.params.itemId,
      userId,
      userRole,
      req.body
    );
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function removeChecklistItemHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await removeChecklistItem(req.params.id, req.params.itemId, userId, userRole);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}