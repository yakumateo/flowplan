/**
 * features/auth/application/register-user.use-case.ts
 * Use case: registro de nuevo usuario.
 * Capa: application — lógica de negocio del dominio auth.
 *
 * Responsabilidades:
 * 1. Verificar que el email no esté ya registrado.
 * 2. Hashear la contraseña con bcryptjs.
 * 3. Crear usuario + UserSettings en transacción (via repository).
 * 4. Retornar el usuario creado (sin datos sensibles).
 */

import bcrypt from 'bcryptjs'
import { userRepository } from '../infrastructure/user.repository'
import type { RegisterUserInput } from '../domain/user.entity'

const BCRYPT_ROUNDS = 12

export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`El email ${email} ya está registrado`)
    this.name = 'UserAlreadyExistsError'
  }
}

export async function registerUserUseCase(input: RegisterUserInput) {
  // 1. Verificar que el email no exista
  const existing = await userRepository.findByEmail(input.email)
  if (existing) {
    throw new UserAlreadyExistsError(input.email)
  }

  // 2. Hashear contraseña
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)

  // 3. Crear usuario con settings y hash almacenado
  const user = await userRepository.createWithSettings({
    ...input,
    passwordHash,
  })

  // 4. Retornar solo datos seguros (sin hash)
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  }
}
