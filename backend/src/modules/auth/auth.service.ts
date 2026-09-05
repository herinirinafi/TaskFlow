import crypto from 'crypto';
import { env } from '../../config/environment';
import { AppError } from '../../middleware/error.middleware';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { comparePassword } from '../../utils/password';
import UserModel, { UserDocument } from '../users/user.model';
import RefreshTokenModel from './refresh-token.model';
import {
  AuthResponse,
  ForgotPasswordDto,
  LoginDto,
  RefreshDto,
  RegisterDto,
  ResetPasswordDto,
} from './auth.types';

function toAuthResponse(user: UserDocument, accessToken: string, refreshToken: string): AuthResponse {
  return {
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar ?? null,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

async function issueTokens(user: UserDocument): Promise<{ accessToken: string; refreshToken: string }> {
  const sessionId = crypto.randomUUID();
  const accessToken = signAccessToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString(), sessionId);
  await RefreshTokenModel.create({
    token: refreshToken,
    user: user._id,
    sessionId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  return { accessToken, refreshToken };
}

export async function registerUser(dto: RegisterDto): Promise<AuthResponse> {
  const existing = await UserModel.findOne({ email: dto.email.toLowerCase() });
  if (existing) {
    throw new AppError(409, 'Un compte existe déjà avec cet email');
  }

  const count = await UserModel.countDocuments();
  const user = await UserModel.create({
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email.toLowerCase(),
    password: dto.password,
    role: count === 0 ? 'ADMIN' : 'MEMBER',
    isActive: true,
  });

  const tokens = await issueTokens(user);
  return toAuthResponse(user, tokens.accessToken, tokens.refreshToken);
}

export async function loginUser(dto: LoginDto): Promise<AuthResponse> {
  const user = await UserModel.findOne({ email: dto.email.toLowerCase() }).select('+password');
  if (!user || !user.isActive) {
    throw new AppError(401, 'Identifiants invalides');
  }

  const valid = await comparePassword(dto.password, user.password);
  if (!valid) {
    throw new AppError(401, 'Identifiants invalides');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueTokens(user);
  return toAuthResponse(user, tokens.accessToken, tokens.refreshToken);
}

export async function refreshTokens(dto: RefreshDto): Promise<AuthResponse> {
  let payload;
  try {
    payload = verifyRefreshToken(dto.refreshToken);
  } catch {
    throw new AppError(401, 'Refresh token invalide ou expiré');
  }

  const stored = await RefreshTokenModel.findOne({ token: dto.refreshToken, revoked: false });
  if (!stored || stored.sessionId !== payload.sessionId) {
    throw new AppError(401, 'Refresh token révoqué');
  }

  const user = await UserModel.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new AppError(401, 'Compte indisponible');
  }

  await stored.deleteOne();

  const tokens = await issueTokens(user);
  return toAuthResponse(user, tokens.accessToken, tokens.refreshToken);
}

export async function logout(refreshToken: string): Promise<void> {
  await RefreshTokenModel.findOneAndUpdate(
    { token: refreshToken },
    { revoked: true }
  );
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await RefreshTokenModel.updateMany({ user: userId, revoked: false }, { revoked: true });
}

export async function forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
  const user = await UserModel.findOne({ email: dto.email.toLowerCase() });
  if (!user) {
    // Réponse identique pour éviter l'énumération des emails
    return { message: "Si cet email existe, un lien de réinitialisation a été envoyé." };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.set('passwordResetToken', resetTokenHash);
  user.set('passwordResetExpires', new Date(Date.now() + 60 * 60 * 1000));
  await user.save();

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
  // Intégration email réelle via SMTP possible dans production
  // eslint-disable-next-line no-console
  console.log(`[auth] Password reset link for ${user.email}: ${resetUrl}`);

  return { message: "Si cet email existe, un lien de réinitialisation a été envoyé." };
}

export async function resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
  const resetTokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
  const user = await UserModel.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError(400, 'Token invalide ou expiré');
  }

  user.password = dto.password;
  user.set('passwordResetToken', undefined);
  user.set('passwordResetExpires', undefined);
  await user.save();
  await revokeAllUserSessions(user._id.toString());

  return { message: 'Mot de passe réinitialisé avec succès.' };
}