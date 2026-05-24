# UI/UX Brief — FlowPlan
**Diseño e interacción v1.0**
Last updated: 2026-05-24

---

## 1. Personalidad visual

FlowPlan debe sentirse como una herramienta de productividad **seria pero cálida**. No debe parecer otra app corporativa fría (como Outlook) ni demasiado casual (como una app de notas).

**Palabras que definen la estética:**
- Limpio, no vacío
- Fluido, no plano
- Estructurado, no rígido
- Moderno, no trendy

**Referencias visuales:**
- Linear (densidad de información, paleta oscura elegante)
- Morgen.so (layout de calendario, claridad temporal)
- Raycast (Spotlight, comando palette)
- Tiimo (calidez, animaciones suaves)

---

## 2. Sistema de diseño

### 2.1 Paleta de colores

```
Fondo principal:     #0F0F10  (casi negro, no puro negro)
Fondo superficie:    #1A1A1E  (cards, paneles)
Fondo elevado:       #242428  (modales, dropdowns)
Borde sutil:         #2E2E34
Borde visible:       #3E3E46

Texto primario:      #F2F2F3
Texto secundario:    #9898A6
Texto deshabilitado: #5A5A6A

Acento principal:    #7C6FF7  (púrpura — acciones primarias, CTA)
Acento hover:        #6B5EE6
Acento suave:        #2A2748  (backgrounds de acento)

Éxito:    #34D399
Alerta:   #FBBF24
Error:    #F87171
Info:     #60A5FA
```

**Modo claro (opcional, post-MVP):**
```
Fondo:           #FAFAFA
Superficie:      #FFFFFF
Acento:          #6B5EE6
Texto primario:  #111118
```

### 2.2 Categorías de tareas — colores
```
Trabajo:   #7C6FF7  (púrpura)
Personal:  #34D399  (verde)
Salud:     #F87171  (rojo suave)
Otro:      #FBBF24  (ámbar)
```
Cada bloque de tarea tiene borde izquierdo de 3px del color de su categoría + fondo semi-transparente del mismo color al 15%.

### 2.3 Tipografía

- **Fuente:** Inter (Google Fonts) — fallback a system-ui
- Escala:
  - `xs`: 11px / 1.4 — metadatos, timestamps
  - `sm`: 13px / 1.5 — labels, subtítulos
  - `base`: 15px / 1.6 — texto de cuerpo
  - `lg`: 17px / 1.5 — títulos de sección
  - `xl`: 22px / 1.3 — encabezados principales
  - `2xl`: 28px / 1.2 — headlines

- Pesos usados: 400 (regular), 500 (medium), 600 (semibold)
- No usar 700 (bold) excepto para números de hora en el timeline.

### 2.4 Espaciado
Sistema base 4px: 4, 8, 12, 16, 24, 32, 48, 64.

### 2.5 Border radius
- Componentes pequeños (badges, chips): 4px
- Bloques de tarea, inputs: 8px
- Cards, paneles: 12px
- Modales: 16px
- Spotlight: 16px

### 2.6 Sombras
Solo para elementos elevados (modales, dropdowns):
```css
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.06);
```
No usar sombras en cards ni bloques de tarea — la elevación se comunica con el color de fondo.

---

## 3. Layout principal

### 3.1 Dashboard
```
┌────────────────────────────────────────────────────┐
│  TOPBAR                                             │
│  [Logo]  [Hoy]  [← Día →]    [Día | Semana]  [+]  │
├──────────┬─────────────────────────────────────────┤
│ SIDEBAR  │  CALENDARIO (área principal)            │
│ (240px)  │                                         │
│          │  6:00 ─────────────────────────         │
│ Sin      │  7:00 ── [Ejercicio 45min]               │
│ agendar  │  8:00 ──                                 │
│          │  9:00 ── [Reunión equipo 1h]              │
│ [Tarea]  │  ...                                    │
│ [Tarea]  │                                         │
│          │  Línea roja = ahora                     │
│ [+ Add]  │                                         │
└──────────┴─────────────────────────────────────────┘
         Cmd+K → Spotlight superpuesto
```

### 3.2 Sidebar izquierda
- Tareas sin hora asignada ("floating tasks").
- Se pueden arrastrar al timeline para asignarles horario.
- Se puede colapsar para más espacio.

### 3.3 Vista de semana
```
        LUN    MAR    MIÉ    JUE    VIE    SÁB    DOM
 8:00 │       │ [R]  │       │       │       │      │      │
 9:00 │ [T1]  │ [R]  │       │ [T2]  │       │      │      │
10:00 │ [T1]  │       │ [T3]  │ [T2]  │       │      │      │
```
- Clic en un bloque → zoom a vista de día de ese día.
- Los días de fin de semana tienen background ligeramente diferente.

---

## 4. Componentes clave

### 4.1 Bloque de tarea (TaskBlock)
```
┌─│─────────────────────────────────┐
│ │  Reunión con equipo              │  ← 3px borde izquierdo (color categoría)
│ │  9:00 – 10:00 · Trabajo          │
└─│─────────────────────────────────┘
```
- Altura proporcional a la duración (1px = ~0.5 min).
- Al hacer hover: ligero brighten + mostrar botón editar (ícono lápiz, top-right).
- Al arrastrar: sombra más prominente + cursor `grabbing`.
- Estado "en progreso": borde izquierdo animado (shimmer sutil).

### 4.2 Spotlight
```
┌─────────────────── Overlay oscuro ───────────────────────┐
│                                                           │
│   ┌─────────────────────────────────────────────────┐    │
│   │  ⌘ Mueve la reunión 30 minutos...           🎤  │    │
│   ├─────────────────────────────────────────────────┤    │
│   │  Sugerencias rápidas:                           │    │
│   │  [Mueve todo 30min]  [Reorganiza mi tarde]      │    │
│   │  [¿Cuándo puedo ir al gym?]                     │    │
│   └─────────────────────────────────────────────────┘    │
│                                                           │
│         ← aparece panel de preview aquí →                │
│                                                           │
└───────────────────────────────────────────────────────────┘
```
- Ancho máximo: 640px.
- Siempre centrado (vertical y horizontal).
- Click fuera del panel → cierra (sin confirmar cambios).
- `Escape` → cierra.

### 4.3 Preview panel (dentro del Spotlight)
```
┌─────────────────────────────────────────────────────┐
│  La IA movería:                                      │
│                                                      │
│  Reunión equipo:   9:00 → 9:30 ──────────           │
│  Almuerzo:         1:00 → 1:30                      │
│                                                      │
│  Mini-calendario mostrando los cambios (diff)       │
│  Cambios en azul, originales en gris tachado        │
│                                                      │
│  [Descartar ✗]              [Confirmar ✓]           │
└─────────────────────────────────────────────────────┘
```

### 4.4 Panel lateral de edición
- Desliza desde la derecha (width: 320px).
- No tapa el calendario en pantallas >1200px.
- En pantallas pequeñas: modal full-width desde abajo.

---

## 5. Animaciones — especificación completa

### 5.1 Principios
- Toda animación tiene propósito: comunica cambio de estado, no decora.
- Duración máxima visible: 500ms. Microinteracciones: 150–200ms.
- Preferir `spring` sobre `ease` para movimientos físicos (bloques de tarea).
- Preferir `ease-out` para entradas, `ease-in` para salidas.
- Respetar `prefers-reduced-motion`: todas las animaciones deben poder desactivarse.

### 5.2 Catálogo de animaciones

| Componente | Animación | Specs |
|---|---|---|
| Bloque de tarea (crear) | Scale 0.8→1 + fade | spring, stiffness:400, damping:25 |
| Bloque de tarea (mover por IA) | `layoutId` spring | stiffness:300, damping:30 |
| Bloque de tarea (mover por drag) | Follow cursor + spring snap | dnd-kit built-in |
| Bloque de tarea (eliminar) | Scale 1→0 + fade-out izquierda | 200ms ease-in |
| Spotlight (abrir) | Scale 0.95→1 + fade overlay | 300ms spring |
| Spotlight (cerrar) | Scale 1→0.95 + fade | 200ms ease-in |
| Preview panel (aparecer) | Slide desde abajo + fade | 250ms spring |
| Panel lateral (abrir) | Slide desde derecha | 300ms spring |
| Toast notification | Slide desde arriba | 250ms spring |
| Línea de hora actual | Move continuo | 60s linear, cada minuto |
| Cascada de reorganización | Delays escalonados 80ms | cada bloque secuencial |

### 5.3 Código de referencia — reorganización en cascada

```typescript
// useReorganizationAnimation.ts
const animateTasks = (updatedTasks: Task[]) => {
  updatedTasks.forEach((task, index) => {
    setTimeout(() => {
      updateTaskInStore(task)
    }, index * 80) // 80ms entre cada tarea
  })
}
```

---

## 6. UX — principios de diseño

### 6.1 Zero ambiguity
Cada acción tiene un resultado visible y predecible. La IA siempre muestra preview antes de ejecutar. Nunca se ejecutan cambios silenciosamente.

### 6.2 Escapability
El usuario puede salir de cualquier estado con `Escape` o clickeando fuera. No hay callejones sin salida.

### 6.3 Undo siempre disponible
Todo cambio generado por la IA muestra un toast con opción "Deshacer" por 5 segundos.

### 6.4 Progressive disclosure
La app funciona sin IA — es un calendario funcional por sí mismo. La IA es una mejora, no un requisito.

### 6.5 Feedback inmediato
- Optimistic updates: el cambio se ve en pantalla ANTES de que la DB confirme.
- Si la DB falla, se revierte con mensaje de error amigable.

---

## 7. Responsive

### Breakpoints
- Mobile (<768px): layout de 1 columna, Spotlight como modal desde abajo, sidebar colapsada.
- Tablet (768–1199px): sidebar colapsable, Spotlight centrado, panel lateral como modal.
- Desktop (≥1200px): layout completo, panel lateral no interfiere con calendario.

### Mobile-first considerations
- Bloques de tarea mínimo 44px de altura para tap targets.
- El Spotlight en mobile se abre desde el botón flotante (+) en bottom-right.
- Vista de semana en mobile muestra solo 3 días (ayer, hoy, mañana).

---

## 8. Accesibilidad

- Contraste mínimo: 4.5:1 para texto sobre fondos.
- Todos los elementos interactivos: focus ring visible.
- Spotlight: ARIA roles `dialog`, `searchbox`, anuncio de resultados con `aria-live`.
- Animaciones: respetar `prefers-reduced-motion` (desactivar todas las animaciones de movimiento, mantener fades).
- Bloques de tarea: navegables con teclado, `Enter` para editar.

---

## 9. Entregables de diseño esperados (para Figma)

1. Design tokens (colores, tipografía, espaciado) como variables de Figma.
2. Componentes: TaskBlock (3 estados), Spotlight (4 estados), Panel lateral.
3. Vista de día completa (desktop).
4. Vista de semana completa (desktop).
5. Flow del Spotlight con preview.
6. Responsive: mobile viewport de las 3 vistas principales.
7. Prototype interactivo del flujo Spotlight en Figma.
