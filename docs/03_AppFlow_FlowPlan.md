# App Flow — FlowPlan
**Flujo de usuario v1.0**
Last updated: 2026-05-24

---

## 1. Flujo de onboarding

```
Visita la web
     │
     ▼
Landing page → CTA "Empieza gratis"
     │
     ▼
Registro (Google OAuth o email/password)
     │
     ▼
Onboarding rápido (3 pasos):
  1. "¿A qué hora empieza tu día?" (selector 6am–10am)
  2. "¿Cuántas horas trabajas?" (slider)
  3. "¿Qué categorías usas?" (trabajo, personal, salud, otro)
     │
     ▼
Dashboard vacío con tour guiado
  → Tooltip 1: "Aquí ves tus tareas del día"
  → Tooltip 2: "Presiona Cmd+K para hablarle a la IA"
  → Tooltip 3: "O crea tu primera tarea aquí →"
     │
     ▼
Usuario crea primera tarea → fin de onboarding
```

---

## 2. Flujo principal — día a día

```
Abrir FlowPlan
     │
     ▼
Vista de día (default) o última vista usada
     │
     ├─→ [Ver semana] → cambio de vista animado
     │
     ├─→ [Crear tarea manualmente]
     │       │
     │       ▼
     │   Panel lateral desliza desde la derecha
     │   Campos: título, fecha/hora, duración, categoría, prioridad
     │   Botón "Estimar duración con IA" (opcional)
     │   → Guardar → bloque aparece en el calendario animado
     │
     ├─→ [Drag & Drop]
     │       │
     │       ▼
     │   Arrastrar bloque a nuevo slot
     │   Confirmación visual (bloque se "asienta" con spring)
     │   Toast: "¿Reorganizo el resto del día?" → Sí / No
     │
     └─→ [Abrir Spotlight → Cmd+K]
             │
             ▼
         (ver Flujo Spotlight)
```

---

## 3. Flujo Spotlight (IA) — detalle completo

```
Cmd+K presionado
     │
     ▼
Overlay oscuro fade-in (200ms)
Barra de búsqueda centrada aparece con spring (300ms)
Input enfocado automáticamente
     │
     ▼
Usuario escribe o habla (micrófono opcional)
Ejemplos de comandos sugeridos aparecen como chips:
  "Mueve todo 30 min"
  "¿Cuándo puedo ir al gym?"
  "Reorganiza mi tarde"
     │
     ▼
Usuario presiona Enter / hace clic en sugerencia
     │
     ▼
Estado: PROCESANDO
  - Input se bloquea
  - Skeleton animado aparece en el panel de preview
  - Spinner sutil en el input
     │
     ▼
Gemini responde (target: <2s)
     │
     ├─→ [IA entendió → devuelve función + parámetros]
     │       │
     │       ▼
     │   Estado: PREVIEW
     │   Panel derecho muestra:
     │     - Descripción en texto: "Moveré tu reunión a las 4:30pm"
     │     - Vista previa del calendario con cambios destacados
     │     - Tareas afectadas marcadas con color
     │     - Botones: [Confirmar ✓] [Descartar ✗]
     │       │
     │       ├─→ [Confirmar]
     │       │       │
     │       │       ▼
     │       │   POST a /api/tasks (mutación en DB)
     │       │   Spotlight se cierra (300ms fade-out)
     │       │   Bloques del calendario se animan a nuevas posiciones
     │       │   Toast: "Listo. [Deshacer]"
     │       │
     │       └─→ [Descartar]
     │               │
     │               ▼
     │           Estado vuelve a IDLE
     │           Input se limpia, listo para nuevo comando
     │
     └─→ [IA no entendió → pide clarificación]
             │
             ▼
         Mensaje de la IA: "No entendí bien. ¿Qué reunión quieres mover?"
         Input activo para responder
         (conversación de máximo 2 turnos, luego reset)
```

---

## 4. Flujo de edición de tarea

```
Clic en bloque de tarea en el calendario
     │
     ▼
Panel lateral desliza desde la derecha (Framer Motion)
Muestra:
  - Título (editable inline)
  - Hora inicio / fin (time pickers)
  - Duración (con botón re-estimar con IA)
  - Categoría y prioridad
  - Descripción (textarea)
  - Botón "Eliminar tarea" (rojo, al fondo)
     │
     ├─→ [Editar campo] → autoguardado con debounce 1s
     │
     ├─→ [Eliminar tarea]
     │       │
     │       ▼
     │   Modal de confirmación:
     │   "¿Eliminar [nombre]? Esta acción no se puede deshacer."
     │   [Cancelar] [Eliminar]
     │       │
     │       └─→ [Confirmar] → animación de salida del bloque → borrado en DB
     │
     └─→ [Clic fuera del panel] → panel se cierra, cambios guardados
```

---

## 5. Flujo de navegación del calendario

```
Vista de día:
  ← [día anterior]  [Hoy]  [día siguiente] →
  Timeline 6am–11pm
  Línea roja = hora actual (se mueve en tiempo real)

Vista de semana:
  ← [semana anterior]  [esta semana] →
  7 columnas, tareas como bloques
  Clic en día → zoom a vista de día

Transición entre vistas:
  - Fade + scale (200ms)
  - La fecha seleccionada se mantiene como "ancla"
```

---

## 6. Flujo de autenticación

```
/login
  → Google OAuth (recomendado)
  → Email + contraseña
     │
     ▼
NextAuth crea sesión JWT
     │
     ▼
Redirect a /dashboard/day (vista de hoy)
     │
     ▼
Si sesión expirada → redirect silencioso a /login
  (con mensaje: "Tu sesión expiró. Inicia sesión de nuevo.")
```

---

## 7. Estados de error y edge cases

| Situación | Comportamiento |
|---|---|
| IA no responde en 10s | Toast: "La IA tardó demasiado. Inténtalo de nuevo." Spotlight permanece abierto. |
| Sin conexión a internet | Banner superior: "Sin conexión. Los cambios se guardarán cuando vuelvas." |
| Límite de IA alcanzado (plan Free) | Spotlight muestra: "Usaste tus 20 consultas de hoy. [Ver plan Pro]" |
| Conflicto de horario | La IA detecta el conflicto y lo menciona en el preview: "Ojo: tienes otra tarea en ese slot." |
| Tarea sin hora (floating) | Se muestra en panel lateral izquierdo "Sin agendar", se puede arrastrar al calendario |
```
