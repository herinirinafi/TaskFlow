import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  getTeam,
  listTeams,
  removeTeamMember,
  updateTeam,
} from './team.service';

export async function createTeamHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const result = await createTeam(userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listTeamsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const { page, limit, search } = req.query as Record<string, string | undefined>;
    const result = await listTeams(userId, userRole, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getTeamHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await getTeam(req.params.id, userId, userRole);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateTeamHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await updateTeam(req.params.id, userId, userRole, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteTeamHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    await deleteTeam(req.params.id, userId, userRole);
    res.status(200).json({ success: true, message: 'Team supprimée' });
  } catch (err) {
    next(err);
  }
}

export async function addTeamMemberHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await addTeamMember(req.params.id, userId, userRole, req.body.userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function removeTeamMemberHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await removeTeamMember(req.params.id, userId, userRole, req.params.userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}