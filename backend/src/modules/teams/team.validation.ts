import { z } from 'zod';
import { TeamStatus } from './team.model';

const objectId = z.string().refine((v) => /^[a-f\d]{24}$/i.test(v), 'Format ObjectId invalide');

export const createTeamSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Le nom de la team doit contenir au moins 2 caractères').max(80),
      description: z.string().trim().max(500).optional(),
      members: z.array(objectId).max(200).optional(),
    })
    .strict(),
});

export const updateTeamSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      description: z.string().trim().max(500).nullable().optional(),
      status: z.enum(Object.values(TeamStatus) as [string, ...string[]]).optional(),
    })
    .strict(),
});

export const teamIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const addTeamMemberSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      userId: objectId,
    })
    .strict(),
});

export const removeTeamMemberSchema = z.object({
  params: z.object({ id: objectId, userId: objectId }),
});

export const listTeamsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().trim().optional(),
  }),
});