---
name: auditoria-accesibilidad
description: >-
  Audita la accesibilidad de un sitio web contra WCAG 2.1 AA, mapeado a
  EN 301 549 V3.2.1 y al marco legal español (RD 1112/2018 sector público,
  Ley 11/2023 sector privado). Usa esta skill SIEMPRE que el usuario pida
  auditar, revisar o evaluar la accesibilidad de una web, mencione WCAG,
  EN 301 549, Ley 11/2023, conformidad, "te aplica la ley", lectores de
  pantalla, navegación por teclado o accesibilidad en general, aunque no
  diga explícitamente "auditoría". Requiere Playwright MCP para inspeccionar
  el sitio en un navegador real.
---

# Auditoría de accesibilidad (JPiedra)

Esta skill convierte una URL en hallazgos clasificados, atados a la norma
y a la ley, y redactados para un informe vendible. NO es un escáner ciego:
combina detección automática con verificación manual de lo que la máquina
no puede juzgar.

## Principio rector

Las herramientas automáticas (axe, wave, etc.) detectan de forma fiable solo una
parte de los problemas WCAG. Lo mecánico (contraste, `lang`, alt ausente)
es automatizable; lo semántico y de interacción (orden del foco, si un menú
*debe* contener el foco, calidad de un texto alternativo) exige criterio
humano. **Nunca marques como "conforme" un criterio de detección Manual sin
haberlo verificado paso a paso.** Si das un verde que no has comprobado, has
fallado en lo único por lo que el cliente paga a un humano.

## Flujo de auditoría

> **Antes del Paso 0:** abre el expediente del cliente — pregunta su nombre (y la web
> si no se ha dado) y crea su carpeta fechada **fuera del repo**. Ver
> «Dónde se guardan los entregables» al final. Todo lo que generes va ahí.

**Paso 0 — Determinar el régimen legal.** La situación del cliente (forma jurídica, tamaño, sector, servicios/productos)
es INPUT que aporta el auditor desde la reunión de intake. NO la infieras a
partir de la web. Con esos datos, determina el régimen consultando
references/marco-legal-es.md. Si falta algún dato, pídelo o márcalo como
pendiente — nunca lo inventes. Esto no cambia el listón técnico (EN 301 549 en
ambos casos) pero sí el gancho legal y la severidad. Si no está claro, decláralo
como supuesto en el informe. Para determinar el régimen legal aplicable o citar la base normativa, lee references/marco-legal-es.md.

**Paso 1 — Seleccionar la muestra (estilo WCAG-EM).** No se audita "la web",
se audita una muestra representativa: portada, una página de proceso clave
(formulario / checkout / contacto), una página de contenido típica, y una
página de plantilla común (legal, listado). Anota las URLs muestreadas.

**Paso 2 — Pasada automática.** Con Playwright MCP, recorre cada página de la
muestra, inyecta axe-core y recoge las violaciones automáticas. Estos son
candidatos, no veredictos.

**Paso 3 — Pasada manual de teclado.** En cada página: tabula de principio a
fin y registra el orden del foco; comprueba que todo lo interactivo es
operable solo con teclado (2.1.1); que no hay trampas (2.1.2); que el foco es
visible siempre (2.4.7); que existe y funciona el salto de bloques (2.4.1).
Para menús overlay y modales, verifica el patrón de diálogo APG: ¿el foco se
contiene dentro mientras está abierto?, ¿Escape cierra y devuelve el foco al
disparador? (esto es juicio de interacción, no un check automático). Al auditar o chequear componentes interactivos, consulta references/apg-patterns.md.

**Paso 4 — Pasada manual de criterio.** Calidad real de los textos
alternativos (no solo su presencia), semántica de encabezados y landmarks,
claridad de etiquetas de formulario, reflow a 320px / zoom 400%, y contraste
en casos límite (texto sobre imagen, estados hover/focus).

**Paso 5 — Clasificar y redactar** según la tabla, la escala de severidad y
la estructura de informe de abajo.

## Mapeo WCAG ↔ EN 301 549 ↔ detección

La lista completa de criterios A+AA —con su mapeo a EN 301 549 (regla: "9." + nº
de criterio WCAG), el "qué comprobar" de cada uno y su clasificación de detección
(Auto / Parcial / Manual)— está en `references/criterios-wcag.md`. Consúltala al
clasificar cada hallazgo y al componer el resumen de conformidad por principio.

## Marco legal (cómo citarlo)

La obligación legal opera **a través de la norma**, no criterio por criterio:
ni RD 1112/2018 ni Ley 11/2023 asignan un artículo a cada SC. El listón técnico
es EN 301 549 (que incorpora WCAG 2.1 AA). Por tanto, en el informe cada hallazgo
cita **el SC de WCAG + la cláusula de EN 301 549**, y el apartado de marco legal
indica el régimen aplicable (público RD 1112/2018 / privado Ley 11/2023) y que la
conformidad se mide contra EN 301 549. No inventes artículos por criterio.

## Add-on opcional: WCAG 2.2 AA (por encima del mínimo legal)

**Por defecto NO se evalúa 2.2.** El listón legal y el veredicto son SIEMPRE
WCAG 2.1 AA. Evalúa los criterios 2.2 solo si el intake indica expresamente que
el cliente ha contratado el add-on de 2.2 (es un input, no un supuesto: si no
consta, no se toca).

Si está contratado, evalúa estos 6 criterios A/AA nuevos (detalle, cláusula EN y
detección en `references/criterios-wcag.md`, sección "WCAG 2.2"):
2.4.11 Foco no oscurecido · 2.5.7 Movimientos de arrastre · 2.5.8 Tamaño del
objetivo mínimo · 3.2.6 Ayuda consistente · 3.3.7 Entrada redundante ·
3.3.8 Autenticación accesible mínima.

Reglas duras del add-on:
- Los hallazgos de 2.2 van en una **sección aparte** del informe, titulada "Por
  encima del mínimo legal: WCAG 2.2 (aún no exigible)". NUNCA se mezclan con el
  catálogo 2.1 ni con el apartado de conformidad.
- El **veredicto de conformidad no cambia**: se calcula solo contra 2.1 AA. Un
  fallo de 2.2 jamás convierte a nadie en "no conforme".
- Enmárcalo como anticipación, no como obligación: EN 301 549 V4.1.1 (que
  incorpora 2.2) tiene referencia en el DOUE prevista ~oct-2026. Hasta entonces,
  2.2 es mejora voluntaria. Es retrocompatible: corregir para 2.2 no rompe 2.1.

**Caducidad:** cuando 2.2 pase a ser el mínimo legal (referencia en el DOUE de la
V4.1.1, ~oct-2026), estos 6 criterios entran en el núcleo y dejan de venderse como
add-on de anticipación. Revisar esta sección entonces.

## Escala de severidad

- **Crítico** — bloquea por completo a un grupo de usuarios (función inoperable
  por teclado, formulario sin labels, contenido inaccesible a lector de pantalla).
  Máxima exposición legal. Prioridad inmediata.
- **Grave** — dificulta seriamente el uso aunque exista un rodeo parcial.
- **Moderado** — fricción notable, no bloqueante.
- **Menor** — pulido y buenas prácticas por encima del mínimo.

**Modulación por alcance.** La severidad no depende solo de cuán grave es la
barrera, sino de a cuánta gente y dónde afecta. Un fallo que TODO usuario topa
al entrar sube de nivel: en particular, un modal que aparece al cargar y bloquea
la interacción (cookies, gate de edad, muro de login) con foco no gestionado o
sin cierre por Escape se trata como Grave, no Moderado. A la inversa, el mismo
fallo en una página remota y poco visitada puede bajar.

## Estructura del informe

1. **Resumen ejecutivo** — veredicto de conformidad, nº de hallazgos por
   severidad, las 3 acciones de mayor impacto.
2. **Alcance y metodología** — páginas muestreadas, navegadores, herramientas,
   fecha, y qué se verificó automática vs manualmente.
3. **Marco legal aplicable** — régimen (público/privado) y norma de referencia.
4. **Hallazgos** (ordenados por severidad). Cada uno:
   - Criterio WCAG + cláusula EN 301 549 + severidad.
   - Página y elemento afectado.
   - Evidencia (captura del estado del fallo).
   - Impacto en la persona usuaria (en lenguaje llano, no jerga).
   - Cómo reproducirlo.
   - Corrección recomendada, con el fragmento de código cuando aplique.
   - Etiqueta de cómo se detectó: [Auto] / [Confirmado manualmente].
5. **Resumen de conformidad por principio** (Perceptible, Operable,
   Comprensible, Robusto).
6. **Próximos pasos y prioridades.**

## Documento de cumplimiento (entregable aparte del informe)

Además del informe se entrega el documento de cumplimiento listo para publicar,
redactado según el régimen del cliente (dictamen de marco-legal §2). Genéralo con
`references/documento-cumplimiento.md`: plantilla pública cerrada (Decisión UE
2018/1523) o privada adaptada. Reglas:
- El estado que declara es coherente con el veredicto de la auditoría.
- La versión privada NO vuelca el catálogo de hallazgos (vive en el informe);
  declara grado de accesibilidad + compromiso + canal, con divulgación calibrada.
- Es información de transparencia, no certificación legal.
- El documento privado está PROVISIONAL hasta cerrar la §9 de marco-legal: no lo
  emitas como entregable de pago sin esa verificación.

## Dónde se guardan los entregables

El trabajo de cliente es privado y vive **fuera del repo de la web**, en la carpeta hermana
`../jpiedra-clientes/` (ruta absoluta `c:\Desarrollo\Javier\Work\jpiedra-clientes\`). **Nunca**
guardes informes, capturas ni datos de cliente dentro del repo de jpiedra.com.

Al iniciar la auditoría:

1. Pregunta el **nombre del cliente** (y la web, si no se ha dado).
2. Deriva un **slug** kebab-case (`Acme, S.L.` → `acme-sl`).
3. Crea `../jpiedra-clientes/<slug>/auditorias/AAAA-MM-DD/` con subcarpetas `evidencias/` y `datos/`.
4. Si es un cliente nuevo, crea también `../jpiedra-clientes/<slug>/cliente.md` (web, contacto,
   régimen legal aplicable).

Durante la auditoría guarda ahí, sin volver a preguntar la ruta:

- `informe.md` — informe final, partiendo de `../jpiedra-clientes/_plantillas/informe-base.md`.
- `evidencias/*.png` — capturas del estado del fallo, con nombre descriptivo del problema.
- `datos/` — `axe-*.json`, `urls-muestreadas.txt` y snapshots relevantes.

Las capturas de Playwright (parámetro `filename`) y cualquier volcado se dirigen directamente a
esas subcarpetas; no dejes evidencias sueltas en la raíz del repo ni en `.playwright-mcp/`.

## Reglas duras

- Los entregables se guardan en `../jpiedra-clientes/<slug>/auditorias/AAAA-MM-DD/`, **nunca**
  dentro del repo de la web.
- Cada hallazgo cita SC de WCAG **y** cláusula de EN 301 549.
- Marca cada hallazgo como detección automática o confirmación manual.
- Los criterios Manual de la tabla **nunca** se reportan como conformes sin
  haber ejecutado la verificación correspondiente.
- Las correcciones se redactan como acción concreta (idealmente con código),
  no como "mejorar la accesibilidad".
- El impacto se explica en términos de personas, no de criterios.
- Cita solo evidencia que exista: los archivos reales (axe-home-full.json,
  verificacion-manual.md, urls-muestreadas.txt) y, dentro de la verificación
  manual, la sección concreta. No inventes nombres de archivo de evidencia.