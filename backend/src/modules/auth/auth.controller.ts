import { NextFunction, Request, Response } from 'express';
import {
  forgotPassword,
  loginUser,
  logout,
  refreshTokens,
  registerUser,
  resetPassword,
} from './auth.service';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await refreshTokens(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await logout(req.body.refreshToken);
    res.status(200).json({ success: true, message: 'Déconnecté' });
  } catch (err) {
    next(err);
  }
}

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await forgotPassword(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await resetPassword(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}