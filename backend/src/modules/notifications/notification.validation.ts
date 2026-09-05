import { z } from 'zod';

const objectId = z.string().refine((v) => /^[a-f\d]{24}$/i.test(v), 'Format ObjectId invalide');

export const listNotificationsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    unreadOnly: z.enum(['true', 'false']).optional(),
  }),
});

export const notificationIdSchema = z.object({
  params: z.object({ id: objectId }),
});