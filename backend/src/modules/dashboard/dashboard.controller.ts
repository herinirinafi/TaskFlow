import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { getDashboardSummary } from './dashboard.service';

export async function getDashboardHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await getDashboardSummary(userId, userRole);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}