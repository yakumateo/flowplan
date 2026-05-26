/**
 * features/tasks/view/hooks/useTasks.ts
 * Hook para obtener las tareas de un día o rango (TanStack Query).
 * Capa: view — consume la API route, nunca importa repository directamente.
 */

'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUiStore } from '@/shared/store/uiStore'
import { NewTaskSchema, type Task, type UpdateTask } from '@/features/tasks/domain/task.entity'
import { z } from 'zod'

// Tipo de INPUT de Zod — campos opcionales antes de aplicar .default()
type NewTaskInput = z.input<typeof NewTaskSchema>

// ---------------------------------------------------------------------------
// Query keys — centralizados para invalidar correctamente
// ---------------------------------------------------------------------------

export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  byDate: (date: string) => ['tasks', 'date', date] as const,
  floating: () => ['tasks', 'floating'] as const,
  byId: (id: string) => ['tasks', id] as const,
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchTasksByDate(date: string): Promise<Task[]> {
  const res = await fetch(`/api/tasks?date=${date}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al cargar tareas')
  }
  const json = await res.json()
  return json.data
}

async function fetchFloatingTasks(): Promise<Task[]> {
  const res = await fetch(`/api/tasks?floating=true`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Error al cargar tareas flotantes')
  }
  const json = await res.json()
  return json.data
}

// ---------------------------------------------------------------------------
// useTasks — tareas de un día específico
// ---------------------------------------------------------------------------

export function useTasks(date: string) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.byDate(date),
    queryFn: () => fetchTasksByDate(date),
    staleTime: 1000 * 30, // 30s
  })
}

// ---------------------------------------------------------------------------
// useFloatingTasks — tareas sin horario
// ---------------------------------------------------------------------------

export function useFloatingTasks() {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.floating(),
    queryFn: fetchFloatingTasks,
    staleTime: 1000 * 30,
  })
}

// ---------------------------------------------------------------------------
// useCreateTask
// ---------------------------------------------------------------------------

export function useCreateTask() {
  const queryClient = useQueryClient()
  const addToast = useUiStore((s) => s.addToast)
  const closeNewTask = useUiStore((s) => s.closeNewTask)

  return useMutation({
    mutationFn: async (data: NewTaskInput) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Error al crear tarea')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all })
      addToast('Tarea creada', 'success')
      closeNewTask()
    },
    onError: (err: Error) => {
      addToast(err.message, 'error')
    },
  })
}

// ---------------------------------------------------------------------------
// useUpdateTask
// ---------------------------------------------------------------------------

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const addToast = useUiStore((s) => s.addToast)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTask }) => {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Error al actualizar tarea')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all })
    },
    onError: (err: Error) => {
      addToast(err.message, 'error')
    },
  })
}

// ---------------------------------------------------------------------------
// useDeleteTask
// ---------------------------------------------------------------------------

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const addToast = useUiStore((s) => s.addToast)
  const closeTaskSidebar = useUiStore((s) => s.closeTaskSidebar)

  return useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Error al eliminar tarea')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all })
      addToast('Tarea eliminada', 'success')
      closeTaskSidebar()
    },
    onError: (err: Error) => {
      addToast(err.message, 'error')
    },
  })
}
