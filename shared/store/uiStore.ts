/**
 * shared/store/uiStore.ts
 * Estado global de UI: sidebar de tarea, modales, toasts.
 */

import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UiState {
  /** ID de la tarea abierta en el sidebar lateral */
  activeSidebarTaskId: string | null
  /** Si el formulario de nueva tarea está abierto */
  isNewTaskOpen: boolean
  /** Toast notifications activos */
  toasts: Toast[]

  // Actions
  openTaskSidebar: (taskId: string) => void
  closeTaskSidebar: () => void
  openNewTask: () => void
  closeNewTask: () => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useUiStore = create<UiState>((set, get) => ({
  activeSidebarTaskId: null,
  isNewTaskOpen: false,
  toasts: [],

  openTaskSidebar: (taskId) =>
    set({ activeSidebarTaskId: taskId, isNewTaskOpen: false }),

  closeTaskSidebar: () => set({ activeSidebarTaskId: null }),

  openNewTask: () =>
    set({ isNewTaskOpen: true, activeSidebarTaskId: null }),

  closeNewTask: () => set({ isNewTaskOpen: false }),

  addToast: (message, type = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    // Auto-dismiss tras 4s
    setTimeout(() => get().removeToast(id), 4000)
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
