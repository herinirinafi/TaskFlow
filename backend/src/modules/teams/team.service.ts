import { AppError } from '../../middleware/error.middleware';
import { getPagination, PaginationOptions, PaginationResult } from '../../utils/pagination';
import UserModel, { UserRole } from '../users/user.model';
import TeamModel, { TeamDocument } from './team.model';

export async function createTeam(
  ownerId: string,
  dto: { name: string; description?: string; members?: string[] }
): Promise<TeamDocument> {
  const members = dto.members ?? [];
  if (members.length) {
    const count = await UserModel.countDocuments({ _id: { $in: members } });
    if (count !== members.length) throw new AppError(400, 'Certains membres sont introuvables');
  }

  const team = await TeamModel.create({
    name: dto.name,
    description: dto.description,
    owner: ownerId,
    members: [...new Set([ownerId, ...members])],
    status: 'ACTIVE',
  });
  return team;
}

export async function getTeam(teamId: string, requesterId: string, role: UserRole): Promise<TeamDocument> {
  const team = await TeamModel.findById(teamId)
    .populate('owner', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar');
  if (!team) throw new AppError(404, 'Team introuvable');

  const memberIds = (team.members as unknown as { _id: { toString(): string } }[]).map((m) =>
    m._id.toString()
  );
  const isMember = memberIds.includes(requesterId);
  const isOwner = team.owner._id.toString() === requesterId;

  if (!isMember && !isOwner && role !== UserRole.ADMIN) {
    throw new AppError(403, 'Accès refusé');
  }
  return team;
}

export async function listTeams(
  requesterId: string,
  role: UserRole,
  options: PaginationOptions & { search?: string }
): Promise<PaginationResult<TeamDocument>> {
  const filter: Record<string, unknown> = {};
  if (role !== UserRole.ADMIN) filter.$or = [{ owner: requesterId }, { members: requesterId }];
  if (options.search) filter.name = new RegExp(options.search, 'i');

  const { page, limit, skip } = getPagination(options);
  const query = TeamModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('owner', 'firstName lastName email avatar')
    .populate('members', 'firstName lastName email avatar');

  const [items, total] = await Promise.all([query.exec(), TeamModel.countDocuments(filter)]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    items,
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}

async function getManageableTeam(teamId: string, actorId: string, role: UserRole): Promise<TeamDocument> {
  const team = await TeamModel.findById(teamId);
  if (!team) throw new AppError(404, 'Team introuvable');
  if (role !== UserRole.ADMIN && team.owner.toString() !== actorId) {
    throw new AppError(403, "Seul le propriétaire gère la team");
  }
  return team;
}

export async function updateTeam(
  teamId: string,
  actorId: string,
  role: UserRole,
  patch: { name?: string; description?: string | null; status?: string }
): Promise<TeamDocument> {
  const team = await getManageableTeam(teamId, actorId, role);
  if (patch.name !== undefined) team.name = patch.name;
  if (patch.description !== undefined) team.description = patch.description ?? undefined;
  if (patch.status !== undefined) team.status = patch.status as never;
  await team.save();
  return team;
}

export async function deleteTeam(teamId: string, actorId: string, role: UserRole): Promise<void> {
  const team = await getManageableTeam(teamId, actorId, role);
  await team.deleteOne();
}

export async function addTeamMember(
  teamId: string,
  actorId: string,
  role: UserRole,
  userId: string
): Promise<TeamDocument> {
  const team = await getManageableTeam(teamId, actorId, role);
  const user = await UserModel.findById(userId);
  if (!user) throw new AppError(404, 'Utilisateur introuvable');

  if (!team.members.map((m) => m.toString()).includes(userId)) {
    team.members.push(user._id);
    await team.save();
  }
  await team.populate('owner', 'firstName lastName email avatar');
  await team.populate('members', 'firstName lastName email avatar');
  return team;
}

export async function removeTeamMember(
  teamId: string,
  actorId: string,
  role: UserRole,
  userId: string
): Promise<TeamDocument> {
  const team = await getManageableTeam(teamId, actorId, role);
  if (team.owner.toString() === userId) {
    throw new AppError(400, "Impossible de retirer le propriétaire de la team");
  }
  team.members = team.members.filter((m) => m.toString() !== userId);
  await team.save();
  await team.populate('owner', 'firstName lastName email avatar');
  await team.populate('members', 'firstName lastName email avatar');
  return team;
}