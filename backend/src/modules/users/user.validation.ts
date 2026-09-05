import { z } from 'zod';
import { UserRole } from './user.model';

export const updateMeSchema = z.object({
  body: z
    .object({
      firstName: z.string().trim().min(2).max(50).optional(),
      lastName: z.string().trim().min(2).max(50).optional(),
      avatar: z.string().url('Avatar invalide').nullable().optional(),
    })
    .strict(),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
      newPassword: z
        .string()
        .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
        .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Le mot de passe doit contenir une lettre et un chiffre'),
    })
    .strict(),
});

export const updateUserParamsSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

export const updateUserBodySchema = z.object({
  body: z
    .object({
      firstName: z.string().trim().min(2).max(50).optional(),
      lastName: z.string().trim().min(2).max(50).optional(),
      avatar: z.string().url().nullable().optional(),
      role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().trim().optional(),
    role: z.enum(Object.values(UserRole) as [string, ...string[]]).optional(),
  }),
});