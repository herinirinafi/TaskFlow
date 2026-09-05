import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  changePassword,
  getMe,
  getUserById,
  listUsers,
  updateMe,
  updateUser,
} from './user.service';

export async function getMeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const result = await getMe(userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateMeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    const result = await updateMe(userId, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function changePasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthRequest).userId;
    await changePassword(userId, req.body.currentPassword, req.body.newPassword);
    res.status(200).json({ success: true, message: 'Mot de passe modifié' });
  } catch (err) {
    next(err);
  }
}

export async function listUsersHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, limit, search, role } = req.query as Record<string, string | undefined>;
    const result = await listUsers({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      role: role as never,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getUserByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await getUserById(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateUserHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await updateUser(req.params.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}