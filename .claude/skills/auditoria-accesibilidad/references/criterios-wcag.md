# Criterios WCAG 2.1 A+AA — mapeo EN 301 549 y detección

> Archivo de REFERENCIA para el agente. Se consulta al clasificar hallazgos y al
> componer el resumen de conformidad. Es la lista completa de criterios; las
> pasadas (automática, teclado, criterio) y la severidad están en el SKILL.md.

## Cómo usar

- **Regla de mapeo EN:** la cláusula web de EN 301 549 V3.2.1 es `9.` + el nº de
  criterio WCAG. Ej.: WCAG 2.4.7 → EN 9.2.4.7. Mecánico para todos.
- **Detección:** `Auto` = axe lo detecta de forma fiable · `Parcial` = axe señala
  candidatos pero requiere confirmación humana · `Manual` = solo criterio humano.
  Nunca marques conforme un criterio `Manual`/`Parcial` sin haberlo verificado.
- El nivel (A/AA) importa para el veredicto: conformidad AA = cumplir todos los A
  **y** todos los AA.

---

## Principio 1 — Perceptible

| WCAG (nivel) | Qué comprobar | EN | Detección |
|---|---|---|---|
| 1.1.1 Contenido no textual (A) | Imágenes informativas con `alt` útil; decorativas con `alt=""`. Calidad del alt = manual. | 9.1.1.1 | Parcial |
| 1.2.1 Solo audio / solo vídeo pregrabado (A) | Alternativa textual (audio) o descripción/transcripción (vídeo). | 9.1.2.1 | Manual |
| 1.2.2 Subtítulos pregrabados (A) | Vídeo con audio lleva subtítulos sincronizados. | 9.1.2.2 | Manual |
| 1.2.3 Audiodescripción o alternativa (A) | Vídeo pregrabado con descripción o alternativa textual. | 9.1.2.3 | Manual |
| 1.2.4 Subtítulos en directo (AA) | Streaming con audio lleva subtítulos en vivo. | 9.1.2.4 | Manual |
| 1.2.5 Audiodescripción pregrabada (AA) | Vídeo pregrabado con audiodescripción. | 9.1.2.5 | Manual |
| 1.3.1 Información y relaciones (A) | Encabezados, listas, tablas, labels y landmarks reales (no solo visuales). | 9.1.3.1 | Parcial |
| 1.3.2 Secuencia con significado (A) | El orden de lectura del DOM conserva el sentido. | 9.1.3.2 | Manual |
| 1.3.3 Características sensoriales (A) | Las instrucciones no dependen solo de forma/color/posición ("el botón redondo de la derecha"). | 9.1.3.3 | Manual |
| 1.3.4 Orientación (AA) | No se bloquea a vertical u horizontal salvo que sea esencial. | 9.1.3.4 | Parcial |
| 1.3.5 Identificar propósito de entrada (AA) | Campos de datos del usuario con `autocomplete` adecuado. | 9.1.3.5 | Parcial |
| 1.4.1 Uso del color (A) | El color no es el único medio para transmitir información (p. ej. errores, enlaces). | 9.1.4.1 | Manual |
| 1.4.2 Control del audio (A) | Audio que suena solo >3 s se puede pausar/silenciar. | 9.1.4.2 | Manual |
| 1.4.3 Contraste mínimo (AA) | 4.5:1 texto normal, 3:1 texto grande. | 9.1.4.3 | Auto |
| 1.4.4 Redimensionar texto (AA) | Texto al 200% sin pérdida de contenido o función. | 9.1.4.4 | Parcial |
| 1.4.5 Imágenes de texto (AA) | No usar imágenes de texto salvo que sea esencial. | 9.1.4.5 | Manual |
| 1.4.10 Reflow (AA) | Sin scroll horizontal a 320 px / zoom 400%. | 9.1.4.10 | Parcial |
| 1.4.11 Contraste no textual (AA) | 3:1 en componentes de UI y en el indicador de foco. | 9.1.4.11 | Parcial |
| 1.4.12 Espaciado de texto (AA) | Sin pérdida al forzar interlineado/espaciado de párrafo, letra y palabra. | 9.1.4.12 | Parcial |
| 1.4.13 Contenido al hover/focus (AA) | Lo que aparece al pasar/enfocar es descartable, apuntable y persistente. | 9.1.4.13 | Manual |

## Principio 2 — Operable

| WCAG (nivel) | Qué comprobar | EN | Detección |
|---|---|---|---|
| 2.1.1 Teclado (A) | Toda funcionalidad operable solo con teclado. | 9.2.1.1 | Manual |
| 2.1.2 Sin trampa de teclado (A) | Se puede entrar y SALIR de todo con teclado. | 9.2.1.2 | Manual |
| 2.1.4 Atajos de una tecla (A) | Atajos de un solo carácter se pueden desactivar/remapear. | 9.2.1.4 | Manual |
| 2.2.1 Tiempo ajustable (A) | Límites de tiempo se pueden apagar, ajustar o ampliar. | 9.2.2.1 | Manual |
| 2.2.2 Pausar, detener, ocultar (A) | Movimiento/parpadeo/auto-actualización >5 s se puede pausar (carruseles). | 9.2.2.2 | Manual |
| 2.3.1 Tres destellos o menos (A) | Nada parpadea más de 3 veces por segundo. | 9.2.3.1 | Manual |
| 2.4.1 Evitar bloques (A) | Enlace de salto operativo / landmarks para saltar al contenido. | 9.2.4.1 | Parcial |
| 2.4.2 Página titulada (A) | `<title>` presente y descriptivo. | 9.2.4.2 | Parcial |
| 2.4.3 Orden del foco (A) | El orden de tabulación preserva el significado y la operabilidad. | 9.2.4.3 | Manual |
| 2.4.4 Propósito del enlace en contexto (A) | El destino se entiende por el texto del enlace (o su contexto). | 9.2.4.4 | Parcial |
| 2.4.5 Múltiples vías (AA) | Más de una forma de llegar a una página (menú + buscador/mapa). | 9.2.4.5 | Manual |
| 2.4.6 Encabezados y etiquetas (AA) | Encabezados y labels describen su tema o propósito. | 9.2.4.6 | Parcial |
| 2.4.7 Foco visible (AA) | Indicador de foco visible en todo lo interactivo. | 9.2.4.7 | Parcial |
| 2.5.1 Gestos del puntero (A) | Funciones con gestos multipunto/trayectoria tienen alternativa simple. | 9.2.5.1 | Manual |
| 2.5.2 Cancelación del puntero (A) | La acción se dispara al soltar, con opción de abortar. | 9.2.5.2 | Manual |
| 2.5.3 Etiqueta en el nombre (A) | El nombre accesible incluye el texto visible del control. | 9.2.5.3 | Parcial |
| 2.5.4 Actuación por movimiento (A) | Funciones por agitar/inclinar tienen alternativa y se pueden desactivar. | 9.2.5.4 | Manual |

## Principio 3 — Comprensible

| WCAG (nivel) | Qué comprobar | EN | Detección |
|---|---|---|---|
| 3.1.1 Idioma de la página (A) | `lang` correcto en `<html>`. | 9.3.1.1 | Auto |
| 3.1.2 Idioma de las partes (AA) | `lang` en fragmentos en otro idioma. | 9.3.1.2 | Parcial |
| 3.2.1 Al recibir el foco (A) | Enfocar un elemento no provoca un cambio de contexto. | 9.3.2.1 | Manual |
| 3.2.2 Al introducir datos (A) | Cambiar un campo no provoca cambio de contexto inesperado. | 9.3.2.2 | Manual |
| 3.2.3 Navegación consistente (AA) | La navegación repetida aparece en el mismo orden entre páginas. | 9.3.2.3 | Manual |
| 3.2.4 Identificación consistente (AA) | Componentes con la misma función se identifican igual entre páginas. | 9.3.2.4 | Manual |
| 3.3.1 Identificación de errores (A) | Los errores de formulario se describen en texto. | 9.3.3.1 | Manual |
| 3.3.2 Etiquetas o instrucciones (A) | Todo campo tiene label o instrucción clara. | 9.3.3.2 | Parcial |
| 3.3.3 Sugerencia ante errores (AA) | Si se conoce la corrección, se sugiere. | 9.3.3.3 | Manual |
| 3.3.4 Prevención de errores legales/financieros (AA) | Envíos sensibles son reversibles, verificables o confirmables. | 9.3.3.4 | Manual |

## Principio 4 — Robusto

| WCAG (nivel) | Qué comprobar | EN | Detección |
|---|---|---|---|
| 4.1.1 Análisis sintáctico (A) | Marcado sin errores que afecten a la AT. *(Retirado en WCAG 2.2; sigue en 2.1.)* | 9.4.1.1 | Auto |
| 4.1.2 Nombre, función, valor (A) | Controles exponen nombre, rol y estado (ARIA correcto). | 9.4.1.2 | Parcial |
| 4.1.3 Mensajes de estado (AA) | Avisos dinámicos se anuncian sin mover el foco (`role=status`/`alert`/live). | 9.4.1.3 | Manual |

---

## WCAG 2.2 — próximo estándar (NO obligatorio aún)

Estos criterios A/AA entran con EN 301 549 V4.1.1 (referencia en el DOUE prevista
oct-2026). **Hoy no son exigibles**: úsalos solo como servicio premium "adelántate",
nunca como incumplimiento legal. (2.2 es retrocompatible: cumplir 2.2 cumple 2.1.)

| WCAG (nivel) | Qué comprobar | EN | Detección |
|---|---|---|---|
| 2.4.11 Foco no oscurecido mínimo (AA) | El elemento enfocado no queda totalmente tapado por otro contenido. | 9.2.4.11 | Manual |
| 2.5.7 Movimientos de arrastre (AA) | Lo que se hace arrastrando tiene alternativa de un solo toque/clic. | 9.2.5.7 | Manual |
| 2.5.8 Tamaño del objetivo mínimo (AA) | Objetivos táctiles de al menos 24×24 px (con excepciones). | 9.2.5.8 | Parcial |
| 3.2.6 Ayuda consistente (A) | Los mecanismos de ayuda aparecen en el mismo orden relativo entre páginas. | 9.3.2.6 | Manual |
| 3.3.7 Entrada redundante (A) | No volver a pedir info ya facilitada en el mismo proceso. | 9.3.3.7 | Manual |
| 3.3.8 Autenticación accesible mínima (AA) | El login no exige una prueba cognitiva sin alternativa (recordar, transcribir). | 9.3.3.8 | Manual |

---

## Nota de verificación
Las columnas "Qué comprobar" y "Detección" están redactadas desde conocimiento
del modelo (fiable en WCAG, contenido técnico). Cotéjalas con tu estudio de
WCAG 2.1 y ajústalas si tu criterio difiere — sobre todo las clasificaciones
Auto/Parcial/Manual, que dependen de la versión de axe y de tu metodología.
