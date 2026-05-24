# AGENTS.md — FlowPlan

## Proyecto
FlowPlan es una app web de planificación de tareas con IA conversacional.
Stack: Next.js 15, TypeScript, Prisma, PostgreSQL (Supabase), Framer Motion, TanStack Query, Zustand, Gemini API.

## Comandos útiles
- `npm run dev` — servidor de desarrollo (puerto 3000)
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npx prisma migrate dev` — aplicar migraciones en desarrollo
- `npx prisma migrate deploy` — aplicar en producción
- `npx prisma studio` — explorar DB visualmente
- `npm audit` — auditoría de seguridad de dependencias

## Estructura del proyecto
```
/app
  /(auth)           → páginas de login/registro
  /(dashboard)      → layout principal con calendario
    /day            → vista de día
    /week           → vista de semana
  /api
    /tasks          → CRUD de tareas
    /ai             → Spotlight endpoint (SSE)
    /auth           → NextAuth handlers
    /settings       → Configuración del usuario
/components
  /calendar         → CalendarDay, CalendarWeek, TaskBlock, TimeSlot
  /spotlight        → SpotlightModal, SpotlightInput, PreviewPanel
  /tasks            → TaskForm, TaskCard, TaskSidebar
  /ui               → componentes base (Button, Input, Badge, Modal)
/lib
  /ai               → tools schema, system prompt, gemini client
  /db               → prisma client singleton
  /validations      → schemas Zod compartidos frontend/backend
  /utils            → funciones de utilidad (fechas, slots, etc.)
/store              → Zustand stores (calendarStore, uiStore)
/hooks              → useCalendar, useSpotlight, useTasks
/types              → TypeScript interfaces globales
```

## Reglas de código — NO NEGOCIABLES

### Seguridad (CRÍTICO)
- NUNCA hardcodees API keys, passwords o secrets en el código. Siempre `process.env.NOMBRE`.
- `NEXT_PUBLIC_` solo para variables que el cliente necesita ver. La API key de Gemini NUNCA lleva ese prefijo.
- Todos los inputs del usuario DEBEN pasar por validación Zod antes de llegar a Prisma o Gemini.
- Funciones destructivas (delete) SIEMPRE requieren confirmación explícita del usuario.
- No dejes catch vacíos. Manejo explícito de errores en cada bloque try/catch.
- Rate limit en /api/ai/command: verificar `aiCallsToday < aiCallsLimit` antes de llamar a Gemini.
- Sanitizar input del usuario: strip HTML, límite 500 caracteres, antes de enviar a Gemini.
- Cada query a Prisma que devuelve datos de usuario DEBE incluir `where: { userId }`.

### TypeScript
- `"strict": true` en tsconfig — sin excepciones.
- No usar `any`. Usar `unknown` + type guards cuando el tipo no es conocido.
- Las respuestas de Gemini siempre se validan con Zod antes de usar sus datos.
- Interfaces en `/types/index.ts`, schemas Zod en `/lib/validations/`.

### Base de datos
- Usar `prisma.$transaction([...])` para updates de múltiples registros (reorganización de tareas).
- No crear queries sin índice en tablas grandes. Índices definidos en schema.prisma.
- No exponer IDs internos (cuid) directamente en URLs públicas sin validación.

### Animaciones
- Cada TaskBlock: `layoutId="task-{id}"` para animaciones automáticas de reordenamiento.
- Delays escalonados en reorganización en cascada: `index * 80ms` de delay.
- Wrap animaciones con `@media (prefers-reduced-motion: no-preference)`.
- Duración máxima de cualquier animación visible: 500ms.
- Usar `type: "spring"` para movimientos de bloques, `ease-out` para entradas.

### API de IA
- Llamadas a Gemini SOLO desde el servidor (/api/ai). Nunca desde el cliente.
- El endpoint /api/ai/command devuelve un PREVIEW — no ejecuta mutaciones en DB.
- Las mutaciones en DB solo ocurren cuando el usuario confirma explícitamente.
- Timeout de 10 segundos en llamadas a Gemini con fallback de error amigable.
- Loggear cada interacción en tabla `AIInteraction` (userId, input sanitizado, función llamada, si fue confirmada).

## Convenciones de nombres
- Componentes React: PascalCase (`TaskBlock.tsx`, `SpotlightModal.tsx`)
- Hooks: camelCase con prefijo use (`useCalendar.ts`, `useSpotlight.ts`)
- Constantes: SCREAMING_SNAKE_CASE (`MAX_AI_CALLS_PER_DAY`)
- Funciones de utilidad: camelCase (`calculateSlots`, `sanitizeInput`)
- Archivos de ruta API Next.js: `route.ts`
- Stores Zustand: `calendarStore.ts`, `uiStore.ts`

## Dependencias aprobadas
```json
{
  "framework": "next@15",
  "language": "typescript@5",
  "styles": "tailwindcss@4",
  "animations": "framer-motion@11",
  "dnd": "@dnd-kit/core",
  "state": "zustand",
  "fetching": "@tanstack/react-query@5",
  "forms": "react-hook-form + zod",
  "orm": "prisma@5",
  "auth": "next-auth@5",
  "ai": "@google/generative-ai",
  "testing": "vitest"
}
```

### Antes de instalar cualquier paquete nuevo
1. Verificar que existe en npmjs.com.
2. Confirmar >100k descargas semanales.
3. Preferir dependencias ya en el proyecto.
4. No instalar paquetes de nombres similares a los sugeridos sin verificar manualmente.

## Lo que NO debes hacer
- No crear archivos fuera de la estructura definida arriba sin consultar.
- No modificar schema.prisma sin crear la migración correspondiente con `prisma migrate dev`.
- No agregar lógica de negocio dentro de componentes — va en `/lib/` o hooks.
- No llamar a Gemini directamente desde componentes de React.
- No usar `console.log` — eliminarlo o usar `console.error` solo para errores reales.
- No hacer fetch desde el cliente a APIs externas — siempre a través de nuestras API routes.
- No usar `any` en TypeScript.
- No commitear archivos `.env` o `.env.local`.

## Contexto de negocio (para decisiones de diseño)
- Usuario objetivo: personas con tendencia a sobreplanificar, rango 22-40 años.
- La IA es un asistente, no un ejecutor autónomo. SIEMPRE muestra preview antes de confirmar.
- El calendario debe funcionar perfectamente SIN IA — la IA es una mejora, no un requisito.
- Optimistic updates: mostrar el cambio visualmente antes de que la DB confirme.
- Si algo falla en DB, revertir el estado con mensaje amigable (no técnico).
