import { AppError } from '../../middleware/error.middleware';
import { getPagination, PaginationOptions, PaginationResult } from '../../utils/pagination';
import { comparePassword, hashPassword } from '../../utils/password';
import UserModel, { UserDocument, UserRole } from './user.model';

interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    avatar: user.avatar ?? null,
    role: user.role,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
  };
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'Utilisateur introuvable');
  return toPublicUser(user);
}

export async function updateMe(
  userId: string,
  patch: { firstName?: string; lastName?: string; avatar?: string | null }
): Promise<PublicUser> {
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'Utilisateur introuvable');

  if (patch.firstName !== undefined) user.firstName = patch.firstName;
  if (patch.lastName !== undefined) user.lastName = patch.lastName;
  if (patch.avatar !== undefined) user.set('avatar', patch.avatar);
  await user.save();

  return toPublicUser(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await UserModel.findById(userId).select('+password');
  if (!user) throw new AppError(404, 'Utilisateur introuvable');

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) throw new AppError(400, 'Mot de passe actuel incorrect');

  user.password = newPassword;
  await user.save();
}

export async function listUsers(
  options: PaginationOptions & { search?: string; role?: UserRole }
): Promise<PaginationResult<PublicUser>> {
  const filter: Record<string, unknown> = {};
  if (options.search) {
    const regex = new RegExp(options.search, 'i');
    filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
  }
  if (options.role) filter.role = options.role;

  const query = UserModel.find(filter).sort({ createdAt: -1 });
  const { page, limit, skip } = getPagination(options);
  const [users, total] = await Promise.all([query.skip(skip).limit(limit).exec(), UserModel.countDocuments(filter)]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: users.map(toPublicUser),
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}

export async function getUserById(id: string): Promise<PublicUser> {
  const user = await UserModel.findById(id);
  if (!user) throw new AppError(404, 'Utilisateur introuvable');
  return toPublicUser(user);
}

export async function updateUser(
  id: string,
  patch: {
    firstName?: string;
    lastName?: string;
    role?: UserRole;
    isActive?: boolean;
  }
): Promise<PublicUser> {
  const user = await UserModel.findById(id);
  if (!user) throw new AppError(404, 'Utilisateur introuvable');

  if (patch.firstName !== undefined) user.firstName = patch.firstName;
  if (patch.lastName !== undefined) user.lastName = patch.lastName;
  if (patch.role !== undefined) user.role = patch.role;
  if (patch.isActive !== undefined) user.isActive = patch.isActive;
  await user.save();

  return toPublicUser(user);
}

export { hashPassword };