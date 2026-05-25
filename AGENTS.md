# AGENTS.md — FlowPlan

## Proyecto
FlowPlan es una app web de planificación de tareas con IA conversacional.
Stack: Next.js 15, TypeScript, Prisma, PostgreSQL (Supabase), Framer Motion, TanStack Query, Zustand, Gemini API.
Arquitectura: Domain-Driven Design (DDD) con separación por bounded contexts.

## Comandos útiles
- `npm run dev` — servidor de desarrollo (puerto 3000)
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npx prisma migrate dev` — aplicar migraciones en desarrollo
- `npx prisma migrate deploy` — aplicar en producción
- `npx prisma studio` — explorar DB visualmente
- `npm audit` — auditoría de seguridad de dependencias

## Arquitectura DDD — Estructura del proyecto

### Principio fundamental
El código se organiza por **dominio de negocio** (features), no por capa técnica.
Cada feature contiene sus propias capas internas: `domain → application → infrastructure → view`.

### Flujo de dependencias (regla estricta)
```
view/ (componentes, hooks) → application/ (use cases, services) → domain/ (entidades, value objects)
                                                                 ↗ infrastructure/ (repositories, providers)
```
Las capas internas (`domain/`) NUNCA importan de capas externas (`infrastructure/`, `view/`).

### Estructura de carpetas
```
/app                                    ← Next.js routing (capa DELGADA, solo delega)
  /(auth)/login, /register              ← Páginas de autenticación
  /(dashboard)/layout, /day, /week      ← Layout principal con calendario
  /api/tasks                            ← Route handlers (delegan a application layer)
  /api/ai                               ← Spotlight endpoint (SSE)
  /api/auth                             ← NextAuth handlers
  /api/settings                         ← Configuración del usuario

/features                               ← Módulos DDD por bounded context
  /tasks
    /domain                             ← Entidades, value objects, schemas Zod
      task.entity.ts                    ← TaskSchema, NewTaskSchema + tipos
      value-objects.ts                  ← Priority, Category, TaskStatus
    /application                        ← Use cases y servicios de negocio
      create-task.use-case.ts
      update-task.use-case.ts
      delete-task.use-case.ts
      bulk-update.use-case.ts
      task.service.ts                   ← Lógica de negocio (preparar, validar)
    /infrastructure                     ← Repositorios (queries Prisma)
      task.repository.ts
    /view                               ← Componentes React y hooks
      /components
        TaskBlock.tsx, TaskCard.tsx, TaskForm.tsx, TaskSidebar.tsx
      /hooks
        useTasks.ts, useCreateTask.ts

  /calendar
    /domain
      calendar.entity.ts                ← TimeSlot, DaySchedule tipos
      value-objects.ts                  ← TimeRange validación
    /application
      get-day-schedule.use-case.ts
      get-week-schedule.use-case.ts
      calendar.service.ts               ← Cálculo de slots, detección de conflictos
    /view
      /components
        CalendarDay.tsx, CalendarWeek.tsx, TimeSlot.tsx, CurrentTimeLine.tsx
      /hooks
        useCalendar.ts

  /spotlight
    /domain
      ai-command.entity.ts              ← AICommand, AIPreview schemas
      value-objects.ts                  ← SanitizedInput
    /application
      process-command.use-case.ts
      estimate-duration.use-case.ts
      spotlight.service.ts              ← sanitizeInput, reorganizeDay
      rate-limiter.service.ts
    /infrastructure
      gemini.provider.ts                ← Wrapper del cliente Gemini
      tools-schema.ts                   ← Definición de tools para function calling
      system-prompt.ts                  ← Template del system prompt
      ai-interaction.repository.ts      ← Logging en tabla AIInteraction
    /view
      /components
        SpotlightModal.tsx, SpotlightInput.tsx, PreviewPanel.tsx
      /hooks
        useSpotlight.ts

  /auth
    /domain
      user.entity.ts                    ← User entity schema + tipos
    /infrastructure
      auth.config.ts                    ← Configuración NextAuth + providers
    /view
      /components
        LoginForm.tsx, RegisterForm.tsx
      /hooks
        useAuth.ts

  /settings
    /domain
      settings.entity.ts               ← UserSettings schema + tipos
    /application
      update-settings.use-case.ts
    /infrastructure
      settings.repository.ts
    /view
      /components
        SettingsForm.tsx
      /hooks
        useSettings.ts

/shared                                 ← Cross-cutting concerns
  /ui                                   ← Design system primitives (Button, Input, Badge, Modal)
  /infrastructure
    db.ts                               ← Prisma client singleton
  /store                                ← Zustand stores (calendarStore, uiStore)
  /types                                ← TypeScript interfaces globales compartidas
  /utils                                ← Funciones de utilidad (fechas, formatters)
```

## Reglas de código — NO NEGOCIABLES

### Arquitectura DDD
- Los route handlers de `/app/api/` son DELGADOS: validan input con Zod, delegan al use case, devuelven respuesta.
- La lógica de negocio vive en `/features/{dominio}/application/`, NUNCA en route handlers ni componentes.
- Las entidades y schemas Zod viven en `/features/{dominio}/domain/`.
- Los queries a Prisma viven en `/features/{dominio}/infrastructure/`, NUNCA en use cases directamente.
- Los componentes React son "tontos": reciben datos via hooks, no contienen lógica de negocio.
- Los hooks de cada feature viven en `/features/{dominio}/view/hooks/`.
- Imports entre features: un feature puede importar del `domain/` de otro feature, NUNCA de su `infrastructure/` o `view/`.

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
- Interfaces compartidas en `/shared/types/index.ts`.
- Schemas Zod de cada dominio en `/features/{dominio}/domain/`.

### Base de datos
- Usar `prisma.$transaction([...])` para updates de múltiples registros (reorganización de tareas).
- No crear queries sin índice en tablas grandes. Índices definidos en schema.prisma.
- No exponer IDs internos (cuid) directamente en URLs públicas sin validación.
- Los repositorios (`*.repository.ts`) son la ÚNICA capa que toca Prisma.

### Animaciones
- Cada TaskBlock: `layoutId="task-{id}"` para animaciones automáticas de reordenamiento.
- Delays escalonados en reorganización en cascada: `index * 80ms` de delay.
- Wrap animaciones con `@media (prefers-reduced-motion: no-preference)`.
- Duración máxima de cualquier animación visible: 500ms.
- Usar `type: "spring"` para movimientos de bloques, `ease-out` para entradas.

### API de IA
- Llamadas a Gemini SOLO desde el servidor (`/features/spotlight/infrastructure/`). Nunca desde el cliente.
- El endpoint /api/ai/command devuelve un PREVIEW — no ejecuta mutaciones en DB.
- Las mutaciones en DB solo ocurren cuando el usuario confirma explícitamente.
- Timeout de 10 segundos en llamadas a Gemini con fallback de error amigable.
- Loggear cada interacción en tabla `AIInteraction` (userId, input sanitizado, función llamada, si fue confirmada).

## Convenciones de nombres
- Componentes React: PascalCase (`TaskBlock.tsx`, `SpotlightModal.tsx`)
- Entidades de dominio: kebab-case (`task.entity.ts`, `value-objects.ts`)
- Use cases: kebab-case (`create-task.use-case.ts`)
- Servicios: kebab-case (`task.service.ts`, `rate-limiter.service.ts`)
- Repositorios: kebab-case (`task.repository.ts`)
- Providers: kebab-case (`gemini.provider.ts`)
- Hooks: camelCase con prefijo use (`useTasks.ts`, `useSpotlight.ts`)
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
- No agregar lógica de negocio dentro de componentes React — va en `/features/{dominio}/application/`.
- No agregar lógica de negocio en route handlers de `/app/api/` — delegan a use cases.
- No llamar a Gemini directamente desde componentes de React.
- No llamar a Prisma fuera de archivos `*.repository.ts`.
- No importar `infrastructure/` o `view/` de un feature desde otro feature.
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
