import { z } from 'zod';
import { TaskPriority, TaskStatus } from './task.model';

const objectId = z.string().refine((v) => /^[a-f\d]{24}$/i.test(v), 'Format ObjectId invalide');

const checklistItemSchema = z.object({
  text: z.string().trim().min(1).max(200),
  completed: z.boolean().optional(),
});

export const createTaskSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2, 'Le titre doit contenir au moins 2 caractères').max(200),
      description: z.string().trim().max(5000).optional(),
      status: z.enum(Object.values(TaskStatus) as [string, ...string[]]).optional(),
      priority: z.enum(Object.values(TaskPriority) as [string, ...string[]]).optional(),
      project: objectId,
      assignedTo: objectId.nullable().optional(),
      dueDate: z.coerce.date().nullable().optional(),
      tags: z.array(z.string().trim().min(1).max(30)).max(15).optional(),
      checklist: z.array(checklistItemSchema).max(100).optional(),
    })
    .strict(),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      title: z.string().trim().min(2).max(200).optional(),
      description: z.string().trim().max(5000).nullable().optional(),
      priority: z.enum(Object.values(TaskPriority) as [string, ...string[]]).optional(),
      assignedTo: objectId.nullable().optional(),
      dueDate: z.coerce.date().nullable().optional(),
      tags: z.array(z.string().trim().min(1).max(30)).max(15).optional(),
    })
    .strict(),
});

export const taskIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const updateTaskStatusSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]),
    })
    .strict(),
});

export const moveTaskSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE]),
      order: z.number().int().min(0),
    })
    .strict(),
});

export const assignTaskSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      assignedTo: objectId.nullable(),
    })
    .strict(),
});

export const checklistSchema = z.object({
  params: z.object({ id: objectId, itemId: objectId }),
  body: z
    .object({
      text: z.string().trim().min(1).max(200).optional(),
      completed: z.boolean().optional(),
    })
    .strict(),
});

export const addChecklistItemSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      text: z.string().trim().min(1).max(200),
    })
    .strict(),
});

export const listTasksSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    project: objectId.optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
    priority: z.enum(Object.values(TaskPriority) as [string, ...string[]]).optional(),
    assignedTo: objectId.optional(),
    dueBefore: z.coerce.date().optional(),
    search: z.string().trim().optional(),
    sort: z.enum(['createdAt', 'dueDate', 'priority', 'updatedAt']).optional(),
  }),
});