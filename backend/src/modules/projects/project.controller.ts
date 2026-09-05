import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import {
  addProjectMember,
  createProject,
  deleteProject,
  getProjectForUser,
  getProjectStats,
  listProjectsForUser,
  removeProjectMember,
  updateProject,
} from './project.service';

export async function createProjectHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const result = await createProject(userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function listProjectsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const { page, limit, status, search } = req.query as Record<string, string | undefined>;
    const result = await listProjectsForUser(userId, userRole, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status as never,
      search,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getProjectHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await getProjectForUser(req.params.id, userId, userRole);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function updateProjectHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await updateProject(req.params.id, userId, userRole, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function deleteProjectHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    await deleteProject(req.params.id, userId, userRole);
    res.status(200).json({ success: true, message: 'Projet supprimé' });
  } catch (err) {
    next(err);
  }
}

export async function addMemberHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await addProjectMember(req.params.id, userId, userRole, req.body.userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function removeMemberHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId, userRole } = req as AuthRequest;
    const result = await removeProjectMember(req.params.id, userId, userRole, req.params.userId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function projectStatsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getProjectStats(req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}