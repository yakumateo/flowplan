# Plan de Implementación — FlowPlan
**Sprints y milestones v1.0**
Last updated: 2026-05-24

---

## Resumen de fases

| Fase | Objetivo | Duración estimada |
|---|---|---|
| 0 | Setup + diseño en Figma | 1 semana |
| 1 | Calendario base funcional | 2 semanas |
| 2 | CRUD completo + Auth | 1 semana |
| 3 | Spotlight + IA (MVP) | 2 semanas |
| 4 | Animaciones + pulido UX | 1 semana |
| 5 | Testing + Deploy | 1 semana |

**Total estimado MVP:** 8 semanas

---

## Fase 0 — Setup y diseño (Semana 1)

### Tareas de setup
- [ ] Crear repo en GitHub (nombre: `flowplan`)
- [ ] Inicializar Next.js 15 con TypeScript: `npx create-next-app@latest flowplan --typescript --tailwind --app`
- [ ] Configurar Tailwind v4 + design tokens (colores, tipografía)
- [ ] Configurar Prisma + Supabase (crear proyecto en supabase.com)
- [ ] Configurar NextAuth v5 con Google OAuth
- [ ] Configurar variables de entorno en `.env.local`
- [ ] Crear `AGENTS.md` en la raíz del repo (ver archivo adjunto)
- [ ] Setup de GitHub Actions: lint + `npm audit` en cada PR
- [ ] Deploy inicial en Vercel (staging vacío)

### Tareas de diseño
- [ ] Crear archivo en Figma con design tokens
- [ ] Wireframe vista de día
- [ ] Wireframe vista de semana
- [ ] Diseño del Spotlight (4 estados: idle, procesando, preview, error)
- [ ] Diseño del panel lateral de edición
- [ ] Exportar a código con Figma Make / Stitch (CSS/React base)

### Herramientas requeridas
- Figma (diseño)
- Figma Make o Stitch (design-to-code)
- Supabase (crear proyecto y obtener DATABASE_URL)
- Google Cloud Console (crear OAuth credentials)
- Vercel (conectar repo)

---

## Fase 1 — Calendario base (Semanas 2–3)

**Objetivo:** Un calendario funcional sin IA. El usuario puede ver y navegar su día/semana.

### Sprint 1A — Estructura y layout (3–4 días)
- [ ] Layout del dashboard: topbar + sidebar + área de calendario
- [ ] Componente `CalendarDay`: timeline de 6am a 11pm
- [ ] Componente `CalendarWeek`: grid de 7 días
- [ ] Navegación entre días y semanas (sin reload)
- [ ] Línea de hora actual (actualización cada minuto)
- [ ] Transición animada entre vistas (Framer Motion)

### Sprint 1B — Bloques de tarea (3–4 días)
- [ ] Componente `TaskBlock`: altura proporcional a duración, color por categoría
- [ ] Render de tareas en el timeline (posicionamiento CSS absoluto)
- [ ] Hover state + botón de editar
- [ ] Detección de conflictos de horario (overlay visual)
- [ ] Drag & Drop básico con `@dnd-kit` (mover entre slots)
- [ ] Animación spring al soltar (Framer Motion)

### Modelo de datos de Agente para esta fase
```
Construye el componente CalendarDay.
- Timeline de 6am a 11pm.
- Cada hora es una fila de 60px de alto.
- Las tareas se posicionan con CSS absolute dentro del contenedor del día.
- Una tarea de 1h = 60px. Una de 30min = 30px. Etc.
- Usa Framer Motion layoutId="task-{id}" en cada TaskBlock.
- No hay IA en esta fase, solo render estático de datos mockeados.
```

---

## Fase 2 — CRUD + Auth (Semana 4)

**Objetivo:** El usuario puede crear, editar y eliminar tareas reales, con cuenta propia.

### Tasks
- [ ] API: `GET /api/tasks` con filtros por fecha
- [ ] API: `POST /api/tasks` con validación Zod
- [ ] API: `PATCH /api/tasks/:id`
- [ ] API: `DELETE /api/tasks/:id` (solo autenticado, solo tareas propias)
- [ ] Formulario de creación en panel lateral
- [ ] Autoguardado en edición (debounce 1s)
- [ ] Confirmación antes de eliminar (modal)
- [ ] Tareas flotantes (sidebar izquierda, drag al calendario)

### Auth
- [ ] Páginas `/login` y `/register`
- [ ] Google OAuth configurado
- [ ] Email + password (opcional para MVP)
- [ ] Protección de rutas con middleware
- [ ] Onboarding de 3 pasos (primera vez que entra)
- [ ] UserSettings iniciales al crear cuenta

### Seguridad — checklist de fase
- [ ] Verificar que ningún endpoint devuelve tareas de otro usuario
- [ ] Validación Zod en todos los inputs
- [ ] No hay secrets en el código (solo en .env)
- [ ] `npm audit` pasa sin high/critical

---

## Fase 3 — Spotlight + IA (Semanas 5–6)

**Objetivo:** El usuario puede hablarle a la app y la IA reorganiza su calendario.

### Sprint 3A — UI del Spotlight (3 días)
- [ ] Componente `SpotlightModal`: overlay + input centrado
- [ ] Activación con `Cmd+K` / `Ctrl+K` (hook global)
- [ ] Chips de sugerencias rápidas
- [ ] Estado de carga animado (skeleton)
- [ ] Estado de error con mensaje amigable
- [ ] Botón de micrófono (web speech API, opcional)

### Sprint 3B — Backend IA (4 días)
- [ ] Gemini client configurado con tools schema completo (9 tools: moverTarea, reorganizarDia, crearTarea, sugerirHorario, estimarDuracion, cancelarTarea, editarTarea, asignarHorarioFlotante, resumenDelDia)
- [ ] System prompt con contexto del calendario, reglas de desambiguación y encadenamiento controlado
- [ ] `POST /api/ai/command` con SSE streaming
- [ ] Sanitización de input (Zod + strip HTML)
- [ ] Mapeo server-side de IDs cortos efímeros (`task_1` → cuid real)
- [ ] Validación Zod del output de Gemini con `GeminiOutputSchema` antes del preview
- [ ] Whitelist de `functionName` (rechazar cualquier nombre no en los 9 tools)
- [ ] Rate limiting (20 calls/day plan Free)
- [ ] Timeout de Gemini: **8 segundos** (margen antes del límite de 10s de Vercel)
- [ ] `POST /api/ai/estimate` para duración con caché por `(titulo, categoria)`
- [ ] Logging en tabla `AIInteraction`

### Sprint 3C — Preview + confirmación (3 días)
- [ ] Panel de preview dentro del Spotlight
- [ ] Diff visual: tareas originales vs nuevas posiciones
- [ ] UX diferenciada para tools de solo lectura (`sugerirHorario`, `resumenDelDia`) vs mutaciones
- [ ] Botones Confirmar / Descartar (mutaciones) | Cerrar (solo lectura)
- [ ] `PATCH /api/tasks/bulk` (bulk update atómico en transacción Prisma)
- [ ] `PATCH /api/tasks/:id/cancel` para cancelarTarea
- [ ] Optimistic updates con TanStack Query
- [ ] Toast de confirmación con "Deshacer" (5 segundos, revertido con snapshot de TanStack Query)

### Prompt de Agente para /api/ai/command
```
Crea el route handler /api/ai/command en Next.js 15.
- Usa Server-Sent Events (SSE) para streaming.
- El body recibe { input: string, date: string }.
- Sanitiza el input con Zod antes de enviarlo a Gemini.
- Verifica el rate limit del usuario antes de llamar a Gemini.
- Construye el calendarContext obteniendo las tareas del día desde Prisma.
- Llama a Gemini con el tools schema de tools.ts.
- Hace stream del resultado con eventos SSE: "thinking", "result", "error".
- El resultado incluye: functionName, params, y un objeto preview generado server-side.
- Nunca ejecuta la mutación en DB aquí — solo devuelve el preview.
- Timeout de 10 segundos en la llamada a Gemini.
- Manejo explícito de errores: no catch vacíos.
```

---

## Fase 4 — Animaciones + pulido UX (Semana 7)

**Objetivo:** La app se siente fluida, responsiva y profesional.

### Animaciones
- [ ] Reorganización en cascada (delays escalonados 80ms)
- [ ] Auditar todas las transiciones — ninguna >500ms
- [ ] `prefers-reduced-motion` — desactivar animaciones de movimiento
- [ ] Animación de creación de tarea (scale + fade)
- [ ] Animación de eliminación (slide-out izquierda)

### Pulido
- [ ] Toast notifications (Sonner o similar)
- [ ] Empty states: calendario vacío con CTA
- [ ] Loading states en todas las acciones async
- [ ] Error states con mensajes claros
- [ ] Responsive: mobile y tablet
- [ ] Tour guiado para nuevos usuarios (Shepherd.js o custom)
- [ ] Favicon, meta tags, OG image

### Performance
- [ ] Lighthouse audit — objetivo >85
- [ ] Lazy loading de componentes pesados
- [ ] Infinite scroll / virtualización si hay muchas tareas
- [ ] `React.memo` en TaskBlock (se renderiza muchas veces)

---

## Fase 5 — Testing + Deploy (Semana 8)

### Testing
- [ ] Unit tests: `reorganizarDia()`, `sanitizeAIInput()`, cálculos de slots
- [ ] Integration tests: `/api/tasks` (CRUD), `/api/ai/command` (mock Gemini)
- [ ] Smoke test manual: crear tarea → Spotlight → confirmar cambio → deshacer
- [ ] Test en Chrome, Firefox, Safari
- [ ] Test mobile (iOS Safari, Android Chrome)

### Security final
- [ ] `npm audit` — 0 vulnerabilidades high/critical
- [ ] Headers de seguridad en `next.config.js` (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting verificado manualmente
- [ ] Verificar que no hay leaks de datos entre usuarios
- [ ] Variables de entorno en Vercel — todas configuradas correctamente

### Deploy
- [ ] Dominio configurado en Vercel
- [ ] Variables de entorno de producción
- [ ] Prisma migrations en producción (`prisma migrate deploy`)
- [ ] Monitoreo básico (Vercel Analytics)
- [ ] Backup de DB en Supabase activado

---

## Herramientas por etapa

| Etapa | Herramienta | Rol |
|---|---|---|
| Diseño | Figma | Wireframes, design system |
| Design-to-code | Figma Make / Stitch | Generar CSS/React base |
| Planificación y docs | Claude Opus 4.6 | PRD, TRD, arquitectura |
| Features complejas | Claude Sonnet 4.6 | Componentes, lógica IA |
| Tareas en background | Gemini 3.5 Flash (Antigravity 2.0) | Scaffolding, tests, boilerplate |
| Auditoría de código | Sesión separada Claude | Buscar vulnerabilidades |
| IDE / edición directa | Antigravity IDE | Revisión y edición fina |
| Orquestación de agentes | Antigravity 2.0 | Subagentes paralelos por feature |

---

---

# AGENTS.md — FlowPlan
**Instrucciones para agentes de IA — raíz del repositorio**

```markdown
# AGENTS.md — FlowPlan

## Proyecto
FlowPlan es una app web de planificación de tareas con IA. Stack: Next.js 15,
TypeScript, Prisma, PostgreSQL (Supabase), Framer Motion, TanStack Query, Zustand.

## Comandos
- `npm run dev` — servidor de desarrollo (puerto 3000)
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm test` — Vitest unit tests
- `npx prisma migrate dev` — aplicar migraciones
- `npx prisma studio` — explorar DB

## Reglas de código — NO NEGOCIABLES

### Seguridad
- NUNCA hardcodees API keys, passwords o secrets en el código.
  Siempre usa `process.env.NOMBRE_VARIABLE`.
- Todos los inputs de usuario DEBEN pasar por validación Zod antes de
  llegar a Prisma o a la API de Gemini.
- El prefijo `NEXT_PUBLIC_` solo para variables que el cliente necesita.
  La API key de Gemini NUNCA lleva ese prefijo.
- Funciones destructivas (delete, borrar) SIEMPRE requieren confirmación
  explícita del usuario — nunca se ejecutan silenciosamente.
- No dejes catch vacíos. Manejo explícito de errores en cada bloque try/catch.
- Rate limit en /api/ai/command: verificar antes de llamar a Gemini.

### TypeScript
- `"strict": true` en tsconfig — sin excepciones.
- No usar `any`. Usar `unknown` + type guards si el tipo no es conocido.
- Las respuestas de la API de Gemini siempre se validan con Zod antes de usar.

### Estructura de archivos
- Componentes en `/components/{dominio}/NombreComponente.tsx`
- Lógica de negocio en `/lib/` — nunca en componentes
- Tipos globales en `/types/index.ts`
- Schemas Zod en `/lib/validations/` — compartidos entre frontend y backend
- Stores Zustand en `/store/`

### Animaciones
- Cada TaskBlock tiene `layoutId="task-{id}"` para animaciones automáticas.
- Delays escalonados en reorganización: `index * 80ms`.
- Respetar `prefers-reduced-motion` — wrap animaciones en el media query.
- Duración máxima de cualquier animación: 500ms.

### Base de datos
- Usar transacciones Prisma (`prisma.$transaction`) para updates múltiples.
- Los queries deben incluir `where: { userId }` para aislar datos por usuario.
- Índices ya definidos en schema.prisma — no crear queries sin índice.

## Convenciones de nombres
- Componentes: PascalCase (`TaskBlock.tsx`)
- Hooks: camelCase con prefijo use (`useCalendar.ts`)
- Constantes: SCREAMING_SNAKE_CASE
- Funciones de utilidad: camelCase
- Archivos de ruta API: `route.ts` (Next.js App Router convention)

## Dependencias aprobadas
Al agregar dependencias nuevas:
1. Verificar que existen en npmjs.com con >100k descargas/semana.
2. No instalar paquetes de nombres similares a los sugeridos sin verificar.
3. Preferir dependencias que ya están en el proyecto.

## Lo que NO debes hacer
- No crear archivos fuera de la estructura definida arriba.
- No modificar schema.prisma sin crear la migración correspondiente.
- No exponer IDs internos de la DB directamente al cliente (usar cuid, no auto-increment).
- No llamar a Gemini directamente desde el cliente — siempre a través de /api/ai.
- No usar `console.log` en producción — usar el logger de Next.js o eliminarlo.
```
