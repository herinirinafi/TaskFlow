import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../modules/users/user.model';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
  userId: string;
  userRole: UserRole;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required');
    }

    const token = header.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError(401, 'Token expired');
      }
      throw new AppError(401, 'Invalid token');
    }

    if (payload.type !== 'access') {
      throw new AppError(401, 'Invalid token type');
    }

    const user = await User.findById(payload.sub).select('_id role isActive');
    if (!user || !user.isActive) {
      throw new AppError(401, 'Account no longer available');
    }

    (req as AuthRequest).userId = user._id.toString();
    (req as AuthRequest).userRole = user.role;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthRequest;
    if (!roles.includes(authReq.userRole)) {
      next(new AppError(403, 'Forbidden: insufficient permissions'));
      return;
    }
    next();
  };
}