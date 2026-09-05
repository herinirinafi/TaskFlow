import jwt from 'jsonwebtoken';
import { env } from '../config/environment';

export interface AccessTokenPayload {
  sub: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  type: 'refresh';
}

export function signAccessToken(userId: string, role: string): string {
  const payload: AccessTokenPayload = { sub: userId, role, type: 'access' };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(userId: string, sessionId: string): string {
  const payload: RefreshTokenPayload = { sub: userId, sessionId, type: 'refresh' };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}