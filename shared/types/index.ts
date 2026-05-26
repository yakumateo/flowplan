/**
 * shared/types/index.ts
 * Interfaces TypeScript globales compartidas entre todos los features.
 * Los schemas Zod específicos de cada dominio viven en features/{dominio}/domain/
 */

// ---------------------------------------------------------------------------
// API Responses
// ---------------------------------------------------------------------------

export interface ApiSuccessResponse<T> {
  data: T
  message?: string
}

export interface ApiErrorResponse {
  error: string
  details?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

// ---------------------------------------------------------------------------
// Session (usada por todos los route handlers para extraer userId)
// ---------------------------------------------------------------------------

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
}
