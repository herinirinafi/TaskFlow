import { z } from 'zod';

const objectId = z.string().refine((v) => /^[a-f\d]{24}$/i.test(v), 'Format ObjectId invalide');

export const createCommentSchema = z.object({
  params: z.object({ taskId: objectId }),
  body: z
    .object({
      content: z.string().trim().min(1, 'Le commentaire ne peut pas être vide').max(2000),
    })
    .strict(),
});

export const commentIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const updateCommentSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      content: z.string().trim().min(1, 'Le commentaire ne peut pas être vide').max(2000),
    })
    .strict(),
});

export const listCommentsSchema = z.object({
  params: z.object({ taskId: objectId }),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});