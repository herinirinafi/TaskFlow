import { z } from 'zod';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  body: z
    .object({
      firstName: z.string().trim().min(2, 'Le prénom doit contenir au moins 2 caractères').max(50),
      lastName: z.string().trim().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
      email: z.string().trim().email('Email invalide'),
      password: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(passwordRegex, 'Le mot de passe doit contenir au moins une lettre et un chiffre'),
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().trim().email('Email invalide'),
      password: z.string().min(1, 'Le mot de passe est requis'),
    })
    .strict(),
});

export const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1, 'refreshToken requis'),
    })
    .strict(),
});

export const logoutSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1, 'refreshToken requis'),
    })
    .strict(),
});

export const forgotPasswordSchema = z.object({
  body: z
    .object({
      email: z.string().trim().email('Email invalide'),
    })
    .strict(),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1, 'token requis'),
      password: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(passwordRegex, 'Le mot de passe doit contenir au moins une lettre et un chiffre'),
    })
    .strict(),
});