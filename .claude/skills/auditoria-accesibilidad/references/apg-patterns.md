# Patrones ARIA (WAI-ARIA APG) — versión auditoría

> Archivo de REFERENCIA para el agente. Se consulta al auditar o chequear
> componentes interactivos, o al revisar un componente suelto. No es para
> lectura humana directa.

## 0. Cómo usar este archivo

- Léelo al evaluar cualquier componente interactivo o widget, y al chequear un
  componente individual ("revisa este acordeón").
- Apoya sobre todo 4.1.2 (nombre/rol/valor), 1.3.1, 2.1.1, 2.1.2, 2.4.3, 1.4.13
  y 2.2.2 — los Manual/Parcial de la tabla de criterios.
- **Caveat normativo:** la APG son *prácticas de autoría recomendadas*, no WCAG.
  No reportes "incumple la APG" como si fuera la ley. Reporta: "no sigue el patrón
  APG y por ello probablemente falla [SC WCAG]". La APG dice DÓNDE mirar; WCAG es
  el estándar de conformidad.
- **Principio native-first:** la mejor implementación de muchos patrones es el
  elemento HTML nativo (`<button>`, `<a href>`, `<input>`, `<select>`, `<dialog>`).
  Recrear con ARIA un control que ya existe en HTML es un antipatrón: marca como
  hallazgo cualquier `div`/`span` con `role` que pudiera ser un elemento nativo.

`[Fuente: W3C WAI-ARIA APG, redactado por el agente desde conocimiento del modelo · COTEJAR con la biblioteca de 21 PDF de Javier — especialmente los patrones menos comunes]`

## Índice
Fundamentos · Controles básicos · Revelado y navegación · Selección y entrada
compuesta · Superposiciones y avisos · Estructuras de datos y rango

---

## FUNDAMENTOS

### Landmarks / regiones
- Roles: `banner`, `navigation`, `main` (uno solo), `contentinfo`, `complementary`,
  `search`, `region`, `form`.
- Landmarks repetidos del mismo tipo → nombre distintivo (`aria-label`/`-labelledby`).
- Fallos: web de `div` sin landmarks; varias `nav` sin nombre; contenido fuera de
  todo landmark; `role` redundante sobre elemento semántico.

### Nombre y descripción accesibles
- Cálculo del nombre (simplificado): `aria-labelledby` > `aria-label` > contenido
  nativo (texto, `<label>`, `alt`) > `title`. Descripción: `aria-describedby`.
- Fallos: botones de solo icono sin nombre; `aria-label` que no contiene el texto
  visible (rompe 2.5.3); `placeholder` como única etiqueta; `alt` mal usado.

---

## CONTROLES BÁSICOS (native-first)

### Button
- Nativo `<button>`. Si es `div`/`span`: necesita `role="button"`, `tabindex="0"`
  y manejar Enter/Espacio. Fallos: botón-div no enfocable; botón sin nombre.

### Link
- Nativo `<a href>`. Fallos: `<a>` sin `href` usado como botón; enlace sin texto
  (solo icono); "leer más" sin contexto (2.4.4).

### Checkbox
- Nativo `<input type="checkbox">`. Custom: `role="checkbox"` + `aria-checked`
  (true/false/mixed) + Espacio alterna. Fallos: estado solo visual, sin `aria-checked`.

### Radio Group
- Nativo `<input type="radio">` con `name`. Custom: `role="radiogroup"` con
  `radio` + `aria-checked`; flechas mueven y seleccionan; una sola parada de tab.
- Fallos: radios sin agrupar; sin operatividad por flechas en custom.

### Switch
- `role="switch"` + `aria-checked`; Espacio/Enter alterna. Nombre claro del estado.
- Fallos: usar checkbox cuando el estado es on/off semántico (o al revés sin razón);
  sin `aria-checked`.

### Slider
- `role="slider"` + `aria-valuenow` / `aria-valuemin` / `aria-valuemax` (y
  `aria-valuetext` si el número no basta); flechas ajustan, Inicio/Fin a extremos.
- Fallos: sin valores ARIA; no operable por teclado; sin nombre.

### Spinbutton
- Nativo `<input type="number">` o `role="spinbutton"` + valores ARIA; flechas
  arriba/abajo ajustan. Fallos: botones +/- sin teclado; sin nombre.

### Meter
- `role="meter"` + `aria-valuenow/min/max` para medidas estáticas (no progreso →
  eso es `progressbar`). Fallos: barra puramente visual sin semántica.

---

## REVELADO Y NAVEGACIÓN

### Disclosure (mostrar/ocultar — FAQs, "leer más")
- Rol `button`; `aria-expanded` (true/false); `aria-controls` → región.
- Teclado: Enter/Espacio alternan.
- Fallos: disparador `div` con onclick; falta `aria-expanded`; estado visible y
  `aria-expanded` no coinciden.

### Acordeón (grupo de disclosures)
- Cada cabecera: `button` dentro de un encabezado real (`h2`/`h3` del nivel
  correcto) con `aria-expanded` y `aria-controls` → panel; panel `role="region"` +
  `aria-labelledby` → cabecera.
- Teclado: Enter/Espacio; opcional flechas/Inicio/Fin entre cabeceras.
- Fallos: cabeceras que no son botones; sin `aria-expanded`; paneles sin asociar;
  jerarquía de encabezados rota.

### Menú desplegable de NAVEGACIÓN  ⚠️ TRAMPA COMÚN
- El patrón `menu`/`menubar` de la APG es para menús de APLICACIÓN, **no** para
  navegación de sitio. La nav con desplegables = `button` con `aria-expanded` que
  controla una lista de enlaces, NO `role="menu"`.
- Fallos: `role="menu"` sobre enlaces de nav; desplegable solo con hover (sin
  teclado); sin `aria-expanded`; sin Escape.

### Menu / Menubar (aplicación)
- `role="menu"`/`menubar` con `menuitem` (y `menuitemcheckbox`/`menuitemradio`);
  flechas navegan, Escape cierra, gestión de foco; una sola parada de tab.
- Fallos: usarlo para navegación normal (ver arriba); sin operatividad por flechas.

### Menu Button
- `button` con `aria-haspopup` y `aria-expanded` que abre un `menu`. Abajo/Enter
  abre y enfoca el primer item; Escape cierra y devuelve foco.
- Fallos: sin `aria-haspopup`/`aria-expanded`; foco no gestionado.

### Breadcrumb
- `nav` con `aria-label="Breadcrumb"`; lista de enlaces; el actual con
  `aria-current="page"`. Fallos: sin `aria-current`; separadores como texto leído.

### Toolbar
- `role="toolbar"` con nombre; flechas navegan entre controles; una sola parada de
  tab (roving tabindex). Fallos: cada control en el orden de tabulación; sin flechas.

---

## SELECCIÓN Y ENTRADA COMPUESTA

### Combobox / búsqueda con sugerencias
- `combobox` en el input + `aria-expanded` + `aria-controls` → `listbox` con
  `option`; `aria-activedescendant` marca la opción resaltada.
- Teclado: Abajo abre/navega, flechas, Enter selecciona, Escape cierra.
- Fallos: input + `div` de resultados sin roles; sin `aria-expanded`; teclado no
  alcanza sugerencias; no se anuncia el nº de resultados.

### Listbox
- `role="listbox"` con `option`; selección única o múltiple (`aria-selected`,
  `aria-multiselectable`); flechas/Inicio/Fin; una sola parada de tab.
- Fallos: lista de `div` clicables sin roles; selección solo visual.

### Tabs
- `tablist` > `tab` + `tabpanel`; pestaña activa `aria-selected="true"`,
  `aria-controls` → panel; panel `aria-labelledby` → pestaña.
- Teclado: flechas mueven entre pestañas, Inicio/Fin; una parada de tab en el
  `tablist` (roving tabindex); Tab pasa al panel.
- Fallos: faltan roles; todas las pestañas tabulables; flechas sin funcionar;
  `aria-selected` estático.

---

## SUPERPOSICIONES Y AVISOS

### Diálogo modal (cookies, popups, lightbox)
- `role="dialog"` + `aria-modal="true"` + nombre (`aria-labelledby` al título).
- Foco: entra al abrir; CONTENIDO dentro mientras está abierto; Escape cierra; al
  cerrar vuelve al disparador. Resto de la página inerte.
- Fallos: foco no entra; se escapa al fondo; Escape no cierra; foco no vuelve; `aria-modal` ausente;
  fondo no inerte. (Territorio de tu finding del menú móvil.)

### Alert Dialog
- Como el modal pero `role="alertdialog"` para confirmaciones/errores que exigen
  respuesta; el mensaje se referencia con `aria-describedby`. Foco inicial al botón
  menos destructivo. Fallos: usar `alert` (no interrumpe foco) cuando hace falta acción.

### Tooltip
- `role="tooltip"`; se dispara con hover Y con foco; referenciado por
  `aria-describedby` del disparador.
- 1.4.13: descartable (Escape), apuntable y persistente.
- Fallos: solo hover; no descartable; desaparece al ir hacia él; abuso de `title`.

### Alertas y mensajes de estado
- `role="alert"`/`aria-live="assertive"` para lo urgente; `role="status"`/
  `aria-live="polite"` para lo no urgente.
- Fallos: errores de formulario visibles pero no anunciados (sin live region);
  `alert` para todo; la live region se inserta junto al contenido (no anuncia: debe
  existir antes y rellenarse después).

---

## ESTRUCTURAS DE DATOS Y RANGO

### Carousel / slider de contenido
- Controles (anterior/siguiente, pausa) = botones reales con nombre.
- Si auto-rota: debe poder pausarse (2.2.2); pausa al enfocar/hover.
- Fallos: auto-rotación sin pausa (falla 2.2.2); flechas sin teclado; orden DOM ≠
  visual; controles sin nombre.

### Table (datos)
- `<table>` nativa con `<th scope>` y `<caption>`. Solo para datos tabulares, nunca
  para maquetar. Fallos: tabla de maquetación; cabeceras sin `scope`; datos en `div`.

### Grid (data grid interactivo)
- `role="grid"` con `row`/`gridcell`/`columnheader`; navegación bidimensional con
  flechas, Inicio/Fin, RePág/AvPág; una parada de tab. Fallos: tabla interactiva sin
  roles grid; navegación por celdas inexistente.

### Treegrid
- Combina grid + jerarquía expandible (`aria-expanded` en filas, `aria-level`).
  Flechas navegan y expanden/colapsan. Fallos: jerarquía solo visual.

### Tree View
- `role="tree"` con `treeitem` (+ `group`); `aria-expanded` en nodos con hijos,
  `aria-selected`, `aria-level`; flechas navegan/expanden, una parada de tab.
- Fallos: árbol de `div` sin roles ni `aria-expanded`.

### Feed
- `role="feed"` con artículos `role="article"` + `aria-posinset`/`aria-setsize`
  para scroll infinito accesible. Fallos: scroll infinito sin semántica de feed.

### Slider multi-thumb (rango)
- Dos `slider` (mín y máx) cada uno con sus valores ARIA y nombre propio;
  `aria-valuemin/max` se acotan mutuamente. Fallos: un solo control para dos valores;
  pulgares sin nombre diferenciado.

### Window Splitter
- `role="separator"` enfocable con `aria-valuenow/min/max` y `aria-controls`;
  flechas mueven el divisor, Enter/Inicio restaura. Fallos: divisor solo arrastrable
  con ratón, sin teclado.

---

## Nota de ampliación
La amplitud (patrones) está completa con el set de la APG. La profundidad de los
"fallos típicos" es lo que se enriquece con auditorías reales: cuando una web saque
un fallo recurrente no listado, se añade aquí.
