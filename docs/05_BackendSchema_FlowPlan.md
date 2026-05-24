# Backend Schema — FlowPlan
**Arquitectura de backend, APIs y base de datos v1.0**
Last updated: 2026-05-24

---

## 1. Prisma Schema completo

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  DONE
  CANCELLED
}

enum Category {
  TRABAJO
  PERSONAL
  SALUD
  OTRO
}

model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  tasks         Task[]
  settings      UserSettings?
  accounts      Account[]
  sessions      Session[]
  aiInteractions AIInteraction[]
}

model Task {
  id           String     @id @default(cuid())
  userId       String
  title        String
  description  String?
  startTime    DateTime?
  endTime      DateTime?
  duration     Int        // minutos
  priority     Priority   @default(MEDIUM)
  category     Category   @default(TRABAJO)
  status       TaskStatus @default(PENDING)
  color        String?    // hex override opcional
  isRecurring  Boolean    @default(false)
  recurrence   Json?      // { type: 'daily'|'weekly', days: [0-6], endDate?: string }
  isFloating   Boolean    @default(false) // tarea sin hora asignada
  position     Int?       // orden en sidebar de floating tasks
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, startTime])
  @@index([userId, status])
}

model UserSettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  dayStartHour    Int      @default(7)
  dayEndHour      Int      @default(22)
  defaultDuration Int      @default(60)
  theme           String   @default("dark")
  timezone        String   @default("America/Lima")
  aiCallsToday    Int      @default(0)
  aiCallsLimit    Int      @default(20)
  lastAIReset     DateTime @default(now())
  isPro           Boolean  @default(false)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model AIInteraction {
  id             String   @id @default(cuid())
  userId         String
  userInput      String   // sanitizado, máx 500 chars
  functionCalled String
  params         Json
  confirmed      Boolean  @default(false)
  responseTimeMs Int?     // para métricas de latencia
  createdAt      DateTime @default(now())
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

// NextAuth tables
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

---

## 2. API Routes — especificación completa

### 2.1 Autenticación
```
POST   /api/auth/[...nextauth]   → NextAuth handler (login, callback, signout)
GET    /api/auth/session         → Sesión actual del usuario
```

### 2.2 Tasks
```
GET    /api/tasks                → Listar tareas (con filtros)
POST   /api/tasks                → Crear tarea
GET    /api/tasks/:id            → Obtener tarea por ID
PATCH  /api/tasks/:id            → Actualizar tarea (parcial)
DELETE /api/tasks/:id            → Eliminar tarea (requiere confirmación)
PATCH  /api/tasks/reorder        → Reordenar múltiples tareas (bulk update)
```

#### GET /api/tasks — Query params
```typescript
{
  date?: string        // YYYY-MM-DD — tareas del día
  startDate?: string   // rango de semana
  endDate?: string
  status?: TaskStatus
  category?: Category
  floating?: boolean   // solo floating tasks
}
```

#### POST /api/tasks — Body
```typescript
{
  title: string            // required, 1-200 chars
  startTime?: string       // ISO 8601
  endTime?: string         // ISO 8601
  duration: number         // required, 5-480 minutos
  priority?: Priority      // default: MEDIUM
  category?: Category      // default: TRABAJO
  description?: string     // max 1000 chars
  isRecurring?: boolean
  recurrence?: {
    type: 'daily' | 'weekly'
    days?: number[]        // [0-6] para weekly
    endDate?: string
  }
  isFloating?: boolean
}
```

#### PATCH /api/tasks/reorder — Body (para bulk update después de IA)
```typescript
{
  updates: Array<{
    id: string
    startTime: string
    endTime: string
  }>
}
```
Ejecuta una transacción Prisma para actualizar todas las tareas atomicamente.

### 2.3 IA — Spotlight
```
POST   /api/ai/command           → Procesar comando de lenguaje natural (SSE stream)
POST   /api/ai/estimate          → Estimar duración de una tarea
```

#### POST /api/ai/command — Body
```typescript
{
  input: string           // texto del usuario, max 500 chars
  date: string            // YYYY-MM-DD, contexto del día activo
}
```

#### POST /api/ai/command — Response (SSE)
```
event: thinking
data: {}

event: result
data: {
  type: "function_call",
  functionName: "moverTarea",
  params: { taskId: "...", newStartTime: "...", newEndTime: "..." },
  preview: {
    description: "Moveré tu reunión de las 9:00 a las 9:30",
    affectedTasks: [ { id, title, oldStart, newStart } ]
  }
}

event: error
data: { message: "No pude entender ese comando. ¿Puedes reformularlo?" }
```

#### POST /api/ai/estimate — Body
```typescript
{
  title: string
  category?: Category
}
```
#### POST /api/ai/estimate — Response
```typescript
{
  estimatedMinutes: number    // 15, 30, 45, 60, 90, 120...
  confidence: "high" | "medium" | "low"
  reasoning: string           // "Reuniones típicas duran 60 min"
}
```

### 2.4 Settings
```
GET    /api/settings            → Obtener settings del usuario
PATCH  /api/settings            → Actualizar settings
```

---

## 3. Middleware de seguridad

### 3.1 Autenticación global
```typescript
// middleware.ts
export const config = {
  matcher: ['/dashboard/:path*', '/api/tasks/:path*', '/api/ai/:path*', '/api/settings']
}
```
Todas las rutas de API y dashboard requieren sesión válida de NextAuth.

### 3.2 Rate limiting — /api/ai/command
```typescript
// lib/rateLimit.ts
async function checkAIRateLimit(userId: string): Promise<boolean> {
  const settings = await prisma.userSettings.findUnique({ where: { userId } })
  
  // Reset diario
  const now = new Date()
  const lastReset = settings.lastAIReset
  if (daysDiff(now, lastReset) >= 1) {
    await prisma.userSettings.update({
      where: { userId },
      data: { aiCallsToday: 0, lastAIReset: now }
    })
    return true
  }
  
  if (!settings.isPro && settings.aiCallsToday >= settings.aiCallsLimit) {
    return false // Límite alcanzado
  }
  
  await prisma.userSettings.update({
    where: { userId },
    data: { aiCallsToday: { increment: 1 } }
  })
  return true
}
```

### 3.3 Sanitización de input
```typescript
// lib/sanitize.ts
import { z } from 'zod'
import { JSDOM } from 'jsdom'

export const sanitizeAIInput = (input: string): string => {
  // Strip HTML tags
  const dom = new JSDOM(input)
  const text = dom.window.document.body.textContent || ''
  // Limitar longitud
  return text.slice(0, 500).trim()
}

export const AICommandSchema = z.object({
  input: z.string().min(1).max(500).transform(sanitizeAIInput),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})
```

---

## 4. Lógica de reorganización del día

```typescript
// lib/ai/reorganize.ts

interface ReorganizeParams {
  tasks: Task[]
  minutosDeRetraso?: number
  dayStartHour: number
  dayEndHour: number
}

export function reorganizarDia({ tasks, minutosDeRetraso = 0, dayStartHour, dayEndHour }: ReorganizeParams) {
  // 1. Filtrar solo tareas PENDING del día
  const pendingTasks = tasks
    .filter(t => t.status === 'PENDING' && t.startTime)
    .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime())

  // 2. Encontrar la primera tarea futura
  const now = new Date()
  const futureTasks = pendingTasks.filter(t => new Date(t.startTime!) > now)
  
  // 3. Desplazar todas por los minutos de retraso
  let cursor = addMinutes(now, minutosDeRetraso)
  
  return futureTasks.map(task => {
    const newStart = new Date(Math.max(cursor.getTime(), new Date(task.startTime!).getTime()))
    const newEnd = addMinutes(newStart, task.duration)
    cursor = newEnd
    
    return { ...task, startTime: newStart, endTime: newEnd }
  })
}
```

---

## 5. Flujo de datos — Diagrama

```
Cliente                    Next.js API             Gemini         PostgreSQL
  │                            │                      │                │
  │── POST /api/ai/command ──→ │                      │                │
  │   { input, date }          │                      │                │
  │                            │── GET tasks del día ──────────────→  │
  │                            │← tasks[] ─────────────────────────── │
  │                            │                      │                │
  │                            │── generateContent() →│                │
  │                            │   (tools + context)  │                │
  │                            │                      │ [procesa 1-2s] │
  │                            │← functionCall result ─│                │
  │                            │                      │                │
  │← SSE event: result ─────── │                      │                │
  │   (preview de cambios)     │                      │                │
  │                            │                      │                │
  │── POST /api/tasks/reorder ─│                      │                │
  │   (usuario confirmó)       │── prisma.$transaction ───────────→   │
  │                            │← success ─────────────────────────── │
  │← 200 OK ────────────────── │                      │                │
  │                            │                      │                │
  [Framer Motion anima cambios]
```

---

## 6. Optimistic Updates — patrón

```typescript
// hooks/useTasks.ts (con TanStack Query)

const updateTaskMutation = useMutation({
  mutationFn: (updates) => fetch('/api/tasks/reorder', { method: 'PATCH', body: JSON.stringify(updates) }),
  
  onMutate: async (updates) => {
    // 1. Cancelar queries en vuelo
    await queryClient.cancelQueries({ queryKey: ['tasks', date] })
    
    // 2. Snapshot del estado anterior
    const previousTasks = queryClient.getQueryData(['tasks', date])
    
    // 3. Actualizar optimistamente
    queryClient.setQueryData(['tasks', date], (old) =>
      applyUpdates(old, updates)
    )
    
    return { previousTasks }
  },
  
  onError: (err, updates, context) => {
    // Revertir si falla
    queryClient.setQueryData(['tasks', date], context.previousTasks)
    toast.error('No se pudo guardar el cambio. Intenta de nuevo.')
  },
  
  onSettled: () => {
    // Revalidar desde servidor
    queryClient.invalidateQueries({ queryKey: ['tasks', date] })
  }
})
```
