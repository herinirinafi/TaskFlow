import { z } from 'zod';
import { ProjectStatus } from './project.model';

const objectId = z.string().refine((v) => /^[a-f\d]{24}$/i.test(v), 'Format ObjectId invalide');

export const createProjectSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Le nom du projet doit contenir au moins 2 caractères').max(120),
      description: z.string().trim().max(1000).optional(),
      team: objectId.optional(),
      members: z.array(objectId).optional(),
      startDate: z.coerce.date().optional(),
      deadline: z.coerce.date().optional(),
      status: z.enum(Object.values(ProjectStatus) as [string, ...string[]]).optional(),
    })
    .strict(),
});

export const updateProjectSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: z.string().trim().min(2).max(120).optional(),
      description: z.string().trim().max(1000).nullable().optional(),
      team: objectId.nullable().optional(),
      startDate: z.coerce.date().nullable().optional(),
      deadline: z.coerce.date().nullable().optional(),
      status: z.enum(Object.values(ProjectStatus) as [string, ...string[]]).optional(),
    })
    .strict(),
});

export const projectIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const addMemberSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      userId: objectId,
    })
    .strict(),
});

export const removeMemberSchema = z.object({
  params: z.object({ id: objectId, userId: objectId }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    status: z.enum(Object.values(ProjectStatus) as [string, ...string[]]).optional(),
    search: z.string().trim().optional(),
  }),
});