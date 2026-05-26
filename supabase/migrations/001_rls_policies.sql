-- =============================================================================
-- supabase/migrations/001_rls_policies.sql
-- Row Level Security (RLS) para FlowPlan
--
-- IMPORTANTE: El backend usa Prisma con DATABASE_URL (service_role), 
-- por lo que NO está bloqueado por estas políticas. RLS solo aplica
-- a accesos directos via Supabase client (anon/authenticated roles).
-- =============================================================================

-- =============================================================================
-- 0. Índices complementarios (foreign keys sin índice automático)
-- =============================================================================

-- Account.userId — FK a User sin índice explícito
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account" ("userId");

-- Session.userId — FK a User sin índice explícito
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session" ("userId");

-- AIInteraction.userId — FK a User (ya tiene @@index en schema pero lo garantizamos)
CREATE INDEX IF NOT EXISTS "AIInteraction_userId_createdAt_idx" 
  ON "AIInteraction" ("userId", "createdAt");

-- =============================================================================
-- 1. Habilitar RLS en todas las tablas públicas
-- =============================================================================

ALTER TABLE "User"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserSettings"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIInteraction"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;

-- _prisma_migrations es gestionada por Prisma — service_role only, sin acceso público
-- No se altera aquí ya que es schema interno de Prisma.

-- =============================================================================
-- 2. Tabla: User
-- SELECT y UPDATE solo para el propio usuario (auth.uid()::text = id)
-- =============================================================================

CREATE POLICY "Users can view own profile"
  ON "User"
  FOR SELECT
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON "User"
  FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- =============================================================================
-- 3. Tabla: Task
-- CRUD completo solo para el propietario (auth.uid()::text = "userId")
-- =============================================================================

CREATE POLICY "Users can select own tasks"
  ON "Task"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own tasks"
  ON "Task"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own tasks"
  ON "Task"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own tasks"
  ON "Task"
  FOR DELETE
  USING (auth.uid()::text = "userId");

-- =============================================================================
-- 4. Tabla: UserSettings
-- SELECT y UPDATE solo para el propietario
-- =============================================================================

CREATE POLICY "Users can select own settings"
  ON "UserSettings"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update own settings"
  ON "UserSettings"
  FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- =============================================================================
-- 5. Tabla: AIInteraction
-- SELECT e INSERT solo para el propietario
-- No se permite UPDATE ni DELETE (immutable audit log)
-- =============================================================================

CREATE POLICY "Users can view own AI interactions"
  ON "AIInteraction"
  FOR SELECT
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own AI interactions"
  ON "AIInteraction"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- =============================================================================
-- 6. Tabla: Session — Sin acceso público directo
-- NextAuth la gestiona server-side con service_role.
-- Ningún usuario autenticado puede leer/escribir sessions directamente.
-- =============================================================================

-- Sin políticas = deny-all para anon y authenticated roles

-- =============================================================================
-- 7. Tabla: Account — Sin acceso público directo
-- NextAuth la gestiona server-side con service_role.
-- =============================================================================

-- Sin políticas = deny-all para anon y authenticated roles

-- =============================================================================
-- 8. Tabla: VerificationToken — Sin acceso público directo
-- NextAuth la gestiona server-side.
-- =============================================================================

-- Sin políticas = deny-all para anon y authenticated roles

-- =============================================================================
-- 9. Garantizar que service_role bypasea RLS (comportamiento por defecto en Supabase)
-- El DATABASE_URL de Prisma usa la service_role key, así que Prisma no está
-- bloqueado. Esto es solo documentación — no requiere SQL.
-- =============================================================================

-- service_role always bypasses RLS by default in Supabase.
-- Ensure your DATABASE_URL uses the service_role connection string, NOT the anon key.
