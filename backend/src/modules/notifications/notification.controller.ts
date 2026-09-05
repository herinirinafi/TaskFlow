import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  deleteNotification,
  getUnreadCount,
  listNotificationsForUser,
  markAllAsRead,
  markAsRead,
} from './notification.service';

export async function listNotificationsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { page, limit, unreadOnly } = req.query as Record<string, string | undefined>;
    const result = await listNotificationsForUser(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      unreadOnly: unreadOnly === 'true',
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function unreadCountHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const count = await getUnreadCount(userId);
    res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
}

export async function markAsReadHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const result = await markAsRead(userId, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsReadHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const count = await markAllAsRead(userId);
    res.status(200).json({ success: true, data: { updated: count } });
  } catch (err) {
    next(err);
  }
}

export async function deleteNotificationHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    await deleteNotification(userId, req.params.id);
    res.status(200).json({ success: true, message: 'Notification supprimée' });
  } catch (err) {
    next(err);
  }
}