# TRD — FlowPlan
**Technical Requirements Document v1.0**
Last updated: 2026-05-24 | Status: Draft

---

## 1. Stack tecnológico

### Frontend
| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, RSC, routing, API routes en un solo repo |
| Lenguaje | TypeScript 5+ | Tipado fuerte, crítico para el schema de function calling |
| Estilos | Tailwind CSS v4 | Utilidades, consistencia, sin runtime CSS |
| Animaciones | Framer Motion 11 | `layoutId` para animaciones de reordenamiento, spring physics |
| Drag & Drop | `@dnd-kit/core` | Accesible, compatible con Framer Motion, ligero |
| Estado global | Zustand | Simple, sin boilerplate, compatible con SSR |
| Fetching | TanStack Query v5 | Cache, optimistic updates, revalidación automática |
| Formularios | React Hook Form + Zod | Validación en cliente y compartida con backend |

### Backend
| Capa | Tecnología | Justificación |
|---|---|---|
| API | Next.js Route Handlers | Co-ubicados con el frontend, streaming SSE nativo |
| ORM | Prisma 5 | Schema declarativo, migraciones, type safety end-to-end |
| Base de datos | PostgreSQL 15 | Supabase free tier (proyectos personales) |
| Auth | NextAuth v5 (Auth.js) | Google OAuth + email/password, session con JWT |
| Validación API | Zod | Schema compartido frontend/backend |

### IA
| Capa | Tecnología | Justificación |
|---|---|---|
| Modelo del usuario | Gemini 2.0 Flash | Rápido, barato, Google AI Pro del usuario |
| SDK | `@google/generative-ai` | Oficial Google, soporte nativo function calling |
| Streaming | Server-Sent Events (SSE) | Respuesta progresiva del Spotlight |
| Fallback | Gemini 2.0 Flash-Lite | Si Flash tiene latencia alta |

### Infraestructura
| Capa | Tecnología |
|---|---|
| Deploy | Vercel (Hobby plan) |
| DB hosting | Supabase (free tier) |
| CI/CD | GitHub Actions |
| Dominio | A definir |
| Variables de entorno | Vercel Environment Variables |

---

## 2. Arquitectura del sistema

```
┌─────────────────────────────────────────┐
│              CLIENTE (Browser)           │
│  Next.js App Router + React              │
│  Zustand (state) + TanStack Query        │
│  Framer Motion (animations)              │
│  dnd-kit (drag & drop)                   │
└──────────────┬──────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────┐
│           NEXT.JS API ROUTES             │
│  /api/tasks    → CRUD de tareas          │
│  /api/ai       → Spotlight IA (SSE)      │
│  /api/auth     → NextAuth handlers       │
└──────────┬──────────────┬───────────────┘
           │              │
┌──────────▼──┐    ┌──────▼─────────────┐
│  PostgreSQL  │    │   Gemini API       │
│  (Supabase)  │    │   (Google AI Pro)  │
│  via Prisma  │    │   Function Calling │
└─────────────┘    └────────────────────┘
```

---

## 3. Esquema de base de datos

### Users
```sql
User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  image       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  tasks       Task[]
  settings    UserSettings?
}
```

### Tasks
```sql
Task {
  id           String    @id @default(cuid())
  userId       String
  title        String
  description  String?
  startTime    DateTime?
  endTime      DateTime?
  duration     Int       -- minutos
  priority     Priority  -- HIGH | MEDIUM | LOW
  category     String    -- trabajo | personal | salud | otro
  status       Status    -- PENDING | IN_PROGRESS | DONE | CANCELLED
  isRecurring  Boolean   @default(false)
  recurrence   Json?     -- { type: 'daily'|'weekly', days: [1,3,5] }
  color        String?   -- hex override
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  user         User      @relation(...)
}
```

### AIInteractions (auditoría y mejora)
```sql
AIInteraction {
  id           String   @id @default(cuid())
  userId       String
  userInput    String   -- texto del usuario sanitizado
  functionCalled String -- nombre de la función ejecutada
  params       Json     -- parámetros que devolvió la IA
  confirmed    Boolean  -- ¿el usuario confirmó el cambio?
  createdAt    DateTime @default(now())
}
```

### UserSettings
```sql
UserSettings {
  id              String  @id @default(cuid())
  userId          String  @unique
  dayStartHour    Int     @default(7)
  dayEndHour      Int     @default(22)
  defaultDuration Int     @default(60)  -- minutos
  theme           String  @default("system")
  aiCallsToday    Int     @default(0)
  aiCallsLimit    Int     @default(20)  -- free tier
  lastAIReset     DateTime @default(now())
}
```

---

## 4. Sistema de Function Calling — diseño técnico

### 4.1 Flujo completo

```
Usuario escribe en Spotlight
        │
        ▼
Sanitizar input (strip HTML, limitar 500 chars)
        │
        ▼
POST /api/ai con { input, calendarState }
        │
        ▼
Gemini recibe: system prompt + tools schema + calendar context
        │
        ▼
Gemini devuelve: { functionCall: { name, args } }
        │
        ▼
Backend valida con Zod el resultado
        │
        ▼
SSE stream → Frontend recibe preview
        │
        ▼
Usuario confirma → Backend ejecuta en DB
        │
        ▼
Frontend anima cambios (Framer Motion layoutId)
```

### 4.2 Tools schema (enviado a Gemini)

```typescript
const tools = [
  {
    name: "moverTarea",
    description: "Mueve una tarea existente a un nuevo horario",
    parameters: {
      type: "object",
      properties: {
        taskId: { type: "string", description: "ID de la tarea a mover" },
        newStartTime: { type: "string", description: "Nueva hora inicio ISO 8601" },
        newEndTime: { type: "string", description: "Nueva hora fin ISO 8601" }
      },
      required: ["taskId", "newStartTime", "newEndTime"]
    }
  },
  {
    name: "reorganizarDia",
    description: "Reorganiza todas las tareas pendientes del día. Usar cuando el usuario va tarde o pide reorganizar.",
    parameters: {
      type: "object",
      properties: {
        fecha: { type: "string", description: "Fecha en formato YYYY-MM-DD" },
        minutosDeRetraso: { type: "number", description: "Cuántos minutos de retraso tiene el usuario" },
        motivo: { type: "string", description: "Razón de la reorganización" }
      },
      required: ["fecha"]
    }
  },
  {
    name: "crearTarea",
    description: "Crea una nueva tarea en el calendario",
    parameters: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        startTime: { type: "string", description: "ISO 8601" },
        duracionMinutos: { type: "number" },
        prioridad: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
        categoria: { type: "string", enum: ["trabajo", "personal", "salud", "otro"] }
      },
      required: ["titulo", "duracionMinutos"]
    }
  },
  {
    name: "sugerirHorario",
    description: "Sugiere 2-3 horarios libres para agendar una tarea nueva",
    parameters: {
      type: "object",
      properties: {
        duracionMinutos: { type: "number" },
        fecha: { type: "string" },
        preferencia: { type: "string", description: "mañana | tarde | noche | cualquiera" }
      },
      required: ["duracionMinutos"]
    }
  },
  {
    name: "estimarDuracion",
    description: "Estima cuántos minutos tomará una tarea basada en su título y tipo",
    parameters: {
      type: "object",
      properties: {
        titulo: { type: "string" },
        categoria: { type: "string" }
      },
      required: ["titulo"]
    }
  }
]
```

### 4.3 System prompt de la IA

```
Eres el asistente de planificación de FlowPlan. Tu trabajo es ayudar al usuario
a gestionar su calendario usando las herramientas disponibles.

Reglas estrictas:
- NUNCA ejecutes acciones destructivas sin que estén en las herramientas definidas.
- Si el usuario pide borrar algo, responde que eso requiere confirmación manual.
- Si no entiendes el comando, pide clarificación en lugar de asumir.
- Siempre responde con UNA sola herramienta. No encadenes múltiples.
- Los horarios deben estar dentro del rango de trabajo del usuario: {dayStartHour}:00 - {dayEndHour}:00.
- La fecha actual es {currentDate}. El timezone del usuario es {timezone}.

Contexto del calendario actual:
{calendarJSON}
```

### 4.4 Seguridad del endpoint /api/ai

- Rate limiting: máximo 20 llamadas/día en plan Free (Redis o contador en DB).
- Sanitización de input: strip tags HTML, límite 500 caracteres, validación Zod.
- El `calendarJSON` enviado a Gemini solo incluye tareas del día actual (no historial).
- Los IDs internos no se exponen al cliente — se usa un mapeo server-side.
- Timeout de 10 segundos en la llamada a Gemini, con fallback de error amigable.

---

## 5. Sistema de animaciones — especificación técnica

### 5.1 Principio central: `layoutId`
Cada bloque de tarea tiene un `layoutId` único (`task-{id}`). Framer Motion trackea automáticamente el movimiento entre posiciones cuando el estado cambia.

```typescript
// TaskBlock.tsx
<motion.div
  layoutId={`task-${task.id}`}
  layout
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  {/* contenido */}
</motion.div>
```

### 5.2 Flujo de animación de reorganización
1. IA devuelve el nuevo estado del calendario (array de tareas con nuevos horarios).
2. El store de Zustand actualiza el estado optimistamente.
3. Framer Motion detecta que los `layoutId` cambiaron de posición y los anima.
4. Si el usuario cancela, se revierte el estado → animación inversa automática.

### 5.3 Animación en cascada
Cuando múltiples tareas se mueven, se agregan delays escalonados:
- Tarea 1: delay 0ms
- Tarea 2: delay 80ms
- Tarea 3: delay 160ms
- Máximo 5 tareas animadas simultáneamente para no abrumar.

---

## 6. Convenciones de código

### Estructura de carpetas
```
/app
  /(auth)          → páginas de login/registro
  /(dashboard)     → layout principal con calendario
    /day           → vista de día
    /week          → vista de semana
  /api
    /tasks         → CRUD
    /ai            → Spotlight endpoint
    /auth          → NextAuth
/components
  /calendar        → CalendarDay, CalendarWeek, TaskBlock, TimeSlot
  /spotlight       → SpotlightModal, SpotlightInput, PreviewPanel
  /tasks           → TaskForm, TaskCard, TaskSidebar
  /ui              → Button, Input, Badge, Modal (componentes base)
/lib
  /ai              → tools schema, system prompt, gemini client
  /db              → prisma client
  /validations     → schemas Zod compartidos
/store             → Zustand stores
/hooks             → useCalendar, useSpotlight, useTasks
/types             → TypeScript interfaces globales
```

### Reglas de código (para AGENTS.md)
- TypeScript estricto: `"strict": true` en tsconfig.
- No `any` — usar `unknown` + type guards.
- Todos los inputs de usuario pasan por Zod antes de llegar a la DB.
- Variables de entorno: nunca hardcodeadas, siempre `process.env.NOMBRE`.
- API keys solo en el servidor (prefijo `NEXT_PUBLIC_` solo para config pública).
- Manejo explícito de errores: no `try/catch` vacíos.
- Confirmar antes de ejecutar cualquier mutación destructiva.

---

## 7. Variables de entorno requeridas

```env
# Base de datos
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# IA
GOOGLE_AI_API_KEY="..."
GEMINI_MODEL="gemini-2.0-flash"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 8. Performance targets

| Métrica | Objetivo |
|---|---|
| First Contentful Paint | <1.5s |
| Time to Interactive | <3s |
| Respuesta del Spotlight (IA) | <2s p50, <4s p95 |
| Animación de reorganización | 60fps en Chrome/Safari |
| Lighthouse Performance | >85 |

---

## 9. Testing (mínimo viable)

- Unit tests: funciones de utilidad de calendario (cálculo de slots, detección de conflictos) con Vitest.
- Integration tests: endpoints `/api/tasks` y `/api/ai` con validaciones Zod.
- E2E (post-MVP): Playwright para flujo crear tarea → Spotlight → confirmar cambio.
- Auditoría de seguridad: `npm audit` en cada PR vía GitHub Actions.
