/**
 * features/auth/domain/user.entity.ts
 * Entidades y schemas Zod del dominio de usuarios.
 * Capa: domain — sin imports de infrastructure o view.
 */

import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  emailVerified: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

/** Usuario seguro para exponer al cliente (sin datos sensibles) */
export const PublicUserSchema = UserSchema.pick({
  id: true,
  email: true,
  name: true,
  image: true,
})

/** Schema de input para registro */
export const RegisterUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export type User = z.infer<typeof UserSchema>
export type PublicUser = z.infer<typeof PublicUserSchema>
export type RegisterUserInput = z.infer<typeof RegisterUserSchema>
