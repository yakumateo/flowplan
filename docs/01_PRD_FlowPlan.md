# PRD — FlowPlan
**Product Requirements Document v1.0**
Last updated: 2026-05-24 | Status: Draft

---

## 1. Resumen ejecutivo

FlowPlan es una aplicación web de planificación de tareas con IA integrada, diseñada para personas que experimentan parálisis por análisis o perfeccionismo al organizar su día. El diferenciador central es una IA conversacional (Spotlight) que reorganiza el calendario en tiempo real con animaciones visuales fluidas, eliminando la fricción de "todo tiene que estar perfecto para empezar".

**Plataforma inicial:** Web (Next.js). Mobile en fases posteriores.
**Modelo de negocio:** Freemium (funcionalidades base gratis, IA avanzada en plan Pro).

---

## 2. Problema

### 2.1 El problema central
Muchas personas no comienzan sus tareas porque el proceso de planificarlas se siente igual de agotador que hacerlas. Reorganizar manualmente un calendario cuando algo cambia durante el día genera ansiedad adicional.

### 2.2 Problemas específicos
- Pasar horas reorganizando tareas en lugar de ejecutarlas.
- No saber cuánto tiempo tomará algo antes de agendarlo.
- Cuando algo cambia (una reunión que se extiende, llegar tarde), todo el día "se rompe".
- Las apps actuales (Google Calendar, Notion) tratan al usuario como administrador de su agenda, no como alguien que necesita ayuda para decidir.

### 2.3 Usuarios objetivo
**Primario:** Adultos 22-40 años, trabajadores independientes o en equipos pequeños, con tendencia a la procrastinación por sobreplanificación. Familiarizados con tecnología.
**Secundario:** Personas con TDAH o rasgos neurodivergentes que necesitan estructura visual flexible.
**Excluido (v1):** Equipos corporativos, gestión de proyectos multi-persona.

---

## 3. Propuesta de valor

| Para quién | Propuesta |
|---|---|
| Persona que sobreplanifica | "Deja de planear, empieza a hacer. La IA organiza por ti." |
| Persona que no sabe priorizar | "Dile a FlowPlan qué tienes que hacer. Él decide cuándo." |
| Persona que pierde el día cuando algo cambia | "¿Vas tarde? Díselo. FlowPlan reorganiza todo en segundos." |

---

## 4. Features — MVP (Fase 1 y 2)

### 4.1 Calendario visual
- Vista de **día** con timeline hora por hora (6am–11pm).
- Vista de **semana** con bloques de tareas.
- Cambio de vista sin recargar, transición animada.
- Bloques arrastrables con drag & drop (Framer Motion).
- Colores por categoría de tarea (trabajo, personal, salud, etc.).
- Indicador visual de "huecos libres" en el día.

### 4.2 Spotlight — barra de comando con IA (Feature estrella)
- Activación: `Cmd+K` / `Ctrl+K` o botón flotante.
- Overlay oscuro con input centrado (estilo Raycast/Linear).
- El usuario escribe o habla en lenguaje natural.
- La IA interpreta la intención y muestra un **preview** de cómo quedaría el calendario **antes de confirmar**.
- El usuario aprueba o descarta con un clic.
- Comandos soportados en MVP:
  - Mover una tarea ("mueve la reunión 30 minutos")
  - Reorganizar el día ("voy tarde, reorganiza todo")
  - Crear tarea ("agrega reunión con Juan mañana a las 3pm, 1 hora")
  - Sugerir horario ("¿cuándo puedo hacer el reporte hoy?")
  - Estimar duración ("¿cuánto tarda revisar el contrato?")

### 4.3 Reorganización animada
- Cuando la IA mueve tareas, los bloques se deslizan físicamente al nuevo slot.
- Animación spring (Framer Motion `layoutId`) — no teleportación instantánea.
- Duración de animación: 400–600ms, perceptible pero no lenta.
- Si múltiples tareas se mueven, se animan en cascada (no simultáneas).

### 4.4 CRUD de tareas
- Crear tarea: título, duración estimada, categoría, prioridad (alta/media/baja), fecha/hora.
- Editar tarea: clic en bloque → panel lateral deslizable.
- Eliminar tarea: requiere confirmación visual (no se borra con un solo clic).
- Tarea recurrente: diaria, semanal, personalizada.

### 4.5 Estimación de duración con IA
- Al crear una tarea, botón "Estimar con IA".
- La IA sugiere duración basada en título y categoría.
- El usuario puede aceptar o modificar la sugerencia.

---

## 5. Features — Post-MVP (Fases 3–5)

- Sugerencias proactivas: la IA detecta huecos libres y sugiere qué mover ahí.
- Historial de reorganizaciones: "deshacer" cambios de la IA.
- Sincronización con Google Calendar.
- Modo "Focus": oculta todo excepto la tarea actual.
- Vista mensual.
- Notificaciones push (PWA).
- Mobile (iOS/Android).
- Plan Pro: IA ilimitada, sync, historial.

---

## 6. User stories — MVP

### Calendario
- Como usuario, quiero ver mis tareas del día en un timeline por horas para tener contexto visual de cómo está distribuido mi tiempo.
- Como usuario, quiero arrastrar una tarea a otro horario y que el calendario actualice visualmente de forma fluida.
- Como usuario, quiero cambiar entre vista día y semana sin perder mi posición actual.

### Spotlight IA
- Como usuario, quiero abrir el Spotlight con Cmd+K y escribir "mueve la reunión de las 3pm a las 4pm" para que la IA lo haga sin que yo tenga que arrastrarlo manualmente.
- Como usuario, quiero ver una **preview animada** de cómo quedaría mi día antes de confirmar un cambio de la IA, para poder rechazarlo si no me convence.
- Como usuario, quiero escribir "voy tarde 20 minutos" y que la IA desplace todas mis tareas pendientes del día automáticamente.
- Como usuario, quiero preguntarle a la IA "¿cuándo tengo tiempo para ir al gym hoy?" y recibir 2–3 sugerencias de horario.

### Gestión de tareas
- Como usuario, quiero crear una tarea escribiendo solo el título y que la IA sugiera la duración estimada.
- Como usuario, quiero que al eliminar una tarea se me pida confirmación antes de borrarla.

---

## 7. No incluido en v1 (explícitamente fuera de scope)

- Colaboración multi-usuario o equipos.
- Gestión de proyectos (subtareas anidadas, dependencias).
- Integración con herramientas de terceros (Jira, Slack, Asana) — excepto Google Calendar en fase posterior.
- IA que actúe de forma autónoma sin confirmación del usuario.
- Aplicación móvil nativa.

---

## 8. Métricas de éxito (MVP)

| Métrica | Objetivo a 3 meses |
|---|---|
| Usuarios activos semanales | 500+ |
| Tareas creadas vía Spotlight (IA) vs manual | >40% vía IA |
| Tasa de confirmación de sugerencias IA | >60% (la IA sugiere bien) |
| Tiempo promedio para crear y agendar una tarea | <30 segundos |
| Retención semana 2 | >30% |

---

## 9. Riesgos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| La IA malinterpreta comandos del usuario | Media | Preview antes de ejecutar + botón "deshacer" |
| Latencia de Gemini >2s interrumpe la UX | Media | Skeleton animado + streaming de respuesta |
| Costo de API de IA escala con usuarios | Media | Rate limiting por usuario, caché de estimaciones comunes |
| Complejidad de animaciones afecta performance | Baja | Framer Motion con `will-change`, lazy loading de vistas |

---

## 10. Preguntas abiertas

1. ¿El plan Free tiene límite de llamadas a IA por día, o es ilimitado?
2. ¿El Spotlight soporta voz desde el MVP o es solo texto?
3. ¿Las tareas sin hora fija ("floating tasks") se muestran en el calendario o en una lista separada?
4. ¿Autenticación con Google desde el día 1, o email/password primero?
