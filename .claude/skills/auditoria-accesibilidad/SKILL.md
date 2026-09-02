---
name: auditoria-accesibilidad
description: >-
  Audita la accesibilidad de un sitio web contra WCAG 2.1 AA, mapeado a
  EN 301 549 V3.2.1 y al marco legal español (RD 1112/2018 sector público,
  Ley 11/2023 sector privado, RD 193/2023 resto de bienes y servicios). Usa
  esta skill SIEMPRE que el usuario pida auditar, revisar o evaluar la
  accesibilidad de una web, mencione WCAG, EN 301 549, Ley 11/2023,
  conformidad, "te aplica la ley", lectores de pantalla, navegación por
  teclado o accesibilidad en general, aunque no diga explícitamente
  "auditoría". NO es para el diagnóstico exprés (la pasada rápida de pago de
  48 h con top-10 de hallazgos): para eso usa la skill diagnostico-expres.
  Requiere Playwright MCP para inspeccionar el sitio en un navegador real.
---

# Auditoría de accesibilidad (JPiedra)

Convierte una URL en un veredicto de conformidad defendible ante un equipo
técnico: hallazgos clasificados, atados a la norma y a la ley, con evidencia
repetible, una tabla de los 50 criterios que prueba que se miró todo, y un
documento de cumplimiento listo para publicar. NO es un escáner: combina
detección automática con verificación manual de lo que la máquina no puede
juzgar, que es la mayor parte.

**Referencias (léelas cuando el paso lo indique):**

| Archivo | Para qué |
|---|---|
| `references/protocolo-auditoria.md` | Expediente, línea base, muestra por tramo, pasadas, matriz de cobertura, estados, veredicto, ficha, severidad, evidencia |
| `references/criterios-wcag.md` | Los 50 criterios con su cláusula EN, **procedimiento de verificación**, reglas axe y evidencia |
| `references/lectores-pantalla.md` | Protocolo de lector virtual y NVDA; lo que se promete y lo que no |
| `references/apg-patterns.md` | Patrones de componentes interactivos (para 4.1.2, 2.1.1, 2.4.3, 1.4.13) |
| `references/marco-legal-es.md` | Régimen aplicable, artículos verificados, fechas, cómo citar |
| `references/documento-cumplimiento.md` | Documento de cumplimiento privado y modelo público |

## Principio rector

Las herramientas automáticas detectan de forma fiable una parte pequeña de
los problemas WCAG. Lo mecánico (contraste sobre fondo sólido, `lang`, alt
ausente) es automatizable; lo semántico y de interacción (orden del foco, si
un menú debe contener el foco, calidad de un alt, qué anuncia el lector)
exige criterio humano. **Nunca marques como Conforme un criterio Manual o
Parcial sin haber ejecutado su procedimiento y anotado el resultado en la
matriz de cobertura.** Si das un verde que no has comprobado, has fallado en
lo único por lo que el cliente paga a un humano. El RD 1112/2018, art. 17.3,
exige exactamente esto: revisión automática **y** manual experta, con informe.

## Qué se promete (línea base)

- **Norma objetivo**: WCAG 2.1 nivel AA vía EN 301 549 V3.2.1, capítulo 9: los
  50 criterios A+AA. WCAG 2.2 solo como add-on contratado (ver más abajo).
- **Soporte**: Chromium (Playwright) en escritorio 1280×900 y en emulación
  móvil 375×812; NVDA en Windows; lector virtual. **No** se promete VoiceOver,
  JAWS, TalkBack, Safari ni Firefox; si un cliente lo exige, se presupuesta
  aparte sobre dispositivo real en la nube (`lectores-pantalla.md` §1).
- **Muestra** documentada según WCAG-EM, con tamaño fijado por tramo
  (Esencial 8 páginas, Comercial 12 + proceso completo, Compleja ≥ 15 + todos
  los procesos) y componente aleatorio con método repetible.
- **Procesos** transaccionales enteros, con estados de error, por una vía de
  prueba acordada en el intake. Nunca una transacción real con medios propios.

Todo esto se escribe en la sección de alcance del informe con versiones y
fechas. Lo que no está en la línea base no se busca y no se afirma.

## Definiciones que sostienen la tabla y el veredicto

- **Página** = URL distinta. Modales, cajones y menús son estados de una
  página. Los pasos de un proceso se listan como pasos, aparte de la muestra.
- **Hallazgo** = una causa sobre un patrón de componente, con N instancias,
  atado a **un** criterio principal (y secundarios si procede). Cuarenta y
  ocho enlaces vacíos del mismo bloque son un hallazgo con 48 instancias; el
  foco invisible en la cabecera de doce páginas es un hallazgo. Id estable
  `H##` en ficha, matriz, evidencias e informe.
- **Observación** = lo que no incumple 2.1 AA (best practice, AAA, 2.2 sin
  add-on). Nunca cuenta como No conforme ni entra en la tabla.
- **Estados de un criterio** (solo estos cuatro): **Conforme** / **No
  conforme** / **No aplica** / **No evaluable** (con causa documentada: sin
  credenciales, sin vía de prueba del pago, contenido inexistente). «No
  evaluado» y «Pendiente» no existen: una tabla con huecos es una auditoría
  sin terminar.
- **Veredicto** (derivación mecánica, `protocolo-auditoria.md` §7):
  Plenamente conforme = 0 No conforme y 0 No evaluable · Parcialmente
  conforme = No conforme en menos de la mitad de los evaluables ·
  No conforme = en la mitad o más. Con algún No evaluable no puede haber
  plena conformidad. La barrera más grave se dice en la primera frase del
  resumen ejecutivo aunque el veredicto sea «parcialmente».

## Flujo de auditoría

> **Antes del Paso 0:** abre el expediente. Pregunta el nombre del cliente (y
> la web si no se ha dado), deriva el slug y crea
> `../jpiedra-clientes/<slug>/auditorias/AAAA-MM-DD/` con `evidencias/` y
> `datos/`. Si es cliente nuevo, crea `cliente.md`. Si existe
> `<slug>/diagnosticos/`, léelo: es el punto de partida (relevo en
> `protocolo-auditoria.md` §1). Todo lo que generes va al expediente.

**Paso 0 — Régimen legal (input, no inferencia).** Forma jurídica, tamaño,
sector, servicios, financiación pública: vienen del intake
(`_plantillas/intake-auditoria.md`, bloque A). NO lo infieras de la web. Con
esos datos, dictamen A-G según `marco-legal-es.md` §2 (skill
`determinar-obligacion` si hay dudas). Si falta un dato, pídelo o márcalo
como supuesto declarado en el informe; nunca lo inventes. El régimen no
cambia el listón técnico (EN 301 549 en todos los casos); cambia el gancho
legal, el documento de cumplimiento y las fechas.

**Paso 1 — Alcance, línea base y muestra (WCAG-EM pasos 1-3).** Rellena
`datos/muestra.md`: alcance (dominios, idiomas, área privada), línea base de
soporte con versiones, exploración del sitio (sitemap, plantillas,
funcionalidades, terceros), muestra estructurada según prioridad y cupo del
tramo, muestra aleatoria con el método de `protocolo-auditoria.md` §3.4,
procesos y su vía de prueba. Es una parada legítima si el tramo contratado no
cuadra con lo que ves (un «Esencial» con carrito): avisa antes de seguir.

**Paso 2 — Pasada automática.** axe-core 4.11.4, reglas WCAG 2.1 A/AA, dos
estados por página (con modales y sin ellos) y estado de error en procesos;
pasada móvil en portada y primer paso de cada proceso. Volcados en
`datos/axe/`, resumen en `datos/axe-resumen.md`. Candidatos, no veredictos;
`incomplete` es lista de comprobación manual, nunca hallazgo.

**Paso 3 — Pasada de teclado.** Barrido registrado parada a parada en cada
página y en cada paso de proceso (`datos/barrido-teclado.md`), operando los
controles, no solo tabulando; modales según patrón de diálogo APG (foco entra,
queda, Escape cierra, vuelve). Alimenta 2.1.1, 2.1.2, 2.4.3, 2.4.7, 3.2.1,
3.2.2, 1.4.13.

**Paso 4 — Pasada de criterio y lectores.** Para cada página y proceso, los
50 criterios con el procedimiento de `criterios-wcag.md`, registrando cada
celda en `datos/matriz-cobertura.md` (C / NC:H## / NA / NE:motivo + método).
Incluye: calidad de alternativas textuales, estructura, formularios, reflow a
320 px, zoom 200 %, espaciado de texto, orientación, contraste en casos
límite, contenido al hover/foco, multimedia. Lector virtual en toda la
muestra acotado por componente y **NVDA en cada proceso crítico** con el guion
de `lectores-pantalla.md` §4. Los criterios de ámbito sitio (2.4.1, 2.4.5,
3.2.3, 3.2.4, 2.1.4, 1.2.4) se evalúan una vez sobre el conjunto.

**Paso 5 — Procesos con estados de error.** Cada proceso entero por la vía
acordada; estados mínimos: obligatorio vacío, formato inválido, sesión
expirada, pago rechazado si la vía lo permite. Registro en `datos/procesos.md`.
Sin vía de prueba: hasta el formulario de pago relleno y enfocado, sin
enviar; lo no recorrido queda No evaluable con causa, nunca Conforme.

**Paso 6 — Consolidar y confirmar (ficha obligatoria).** Agrupa candidatos
por causa y patrón, asigna ids `H##` y verifica cada uno a mano. Registro en
`datos/confirmacion-hallazgos.md` con la plantilla de `protocolo-auditoria.md`
§8: criterio y cláusula EN, páginas e instancias, pasos repetibles, fuentes,
confianza, bloqueo, alcance, severidad, evidencia.

- `CONFIRMADO` = reproducido con al menos una fuente manual (teclado real,
  DOM, NVDA, medición visual), descrito en pasos que el equipo del cliente
  puede repetir, con evidencia propia.
- `A CONFIRMAR` = solo axe, árbol, lector virtual o inferencia.

**Regla dura: un hallazgo `A CONFIRMAR` no se reporta como no conformidad ni
cuenta en la tabla.** O se confirma, o baja a observación declarando que no
está verificada. Nunca se salva con vaguedad («tres o cuatro elementos»,
«parece que…»): si hay que hedgear, no está confirmado. La ficha es la cara
simétrica de la matriz: la matriz prueba que se miró todo; la ficha, que lo
reportado se comprobó. De estos hallazgos cuelgan un veredicto y un documento
que se publica.

**Paso 7 — Severidad.** Bloqueo × Alcance según la matriz de
`protocolo-auditoria.md` §8.2. Se escribe en la ficha; si se altera a mano, se
anota por qué. Un modal de carga con foco no gestionado o sin Escape es
Global (Grave como mínimo). Los componentes de terceros se puntúan igual y la
corrección dice quién los toca.

**Paso 8 — Tabla de los 50 y veredicto.** Se derivan mecánicamente de la
matriz (§6-§7 del protocolo). Se rellenan las cuatro subtablas del informe,
el recuento (Conforme / No conforme / No aplica / No evaluable) y el
veredicto. Comprueba la coherencia: cada NC de la tabla apunta a un `H##`
confirmado; cada `H##` aparece en la tabla.

**Paso 9 — Redactar.** `informe.md` desde `_plantillas/informe-base.md`;
documento de cumplimiento según dictamen (`references/documento-cumplimiento.md`
para privado; skill `declaracion-accesibilidad` para público); `revision-oaw`
si el cliente público lo pide. Corrección recomendada con código, siguiendo
`protocolo-auditoria.md` §11. Y `datos/descartes-y-limitaciones.md`.

**Paso 10 — PARADA. Visto bueno de Javier.** Presenta la ficha de
confirmación, la tabla de los 50 con el recuento y el veredicto, el
`informe.md` y el documento de cumplimiento, y **espera aprobación
explícita**. **No ejecutes `md2pdf.py` hasta tenerla, para ningún
entregable.** Si Javier tumba un hallazgo, se rehacen la matriz, la tabla, el
resumen por principio y el veredicto: todo cuelga de ahí.

**Paso 11 — Generar los PDF, entregar y relevar.** `informe.pdf`
(`--confidencial`), documento de cumplimiento o declaración (sin
confidencial: se publica), `revision-oaw.pdf` si aplica. Al entregar:
recuerda a Javier anotar en el Sheet de vencimientos el fin de la garantía
(entrega + 60 días); si se contrata conformidad continua, `muestra.md` y la
ficha son la línea base.

## Mapeo WCAG ↔ EN 301 549 ↔ detección

Los 50 criterios A+AA, con su cláusula EN (`9.` + nº de criterio), el
procedimiento de verificación repetible, las reglas axe que aportan
candidatos y la evidencia mínima están en `references/criterios-wcag.md`.
Consúltalo en el Paso 4 y al redactar cada hallazgo. Nota fija sobre
**4.1.1**: se mantiene en la tabla porque EN 301 549 V3.2.1 lo incluye, y se
marca Conforme con la nota del W3C de que se considera siempre satisfecho en
HTML; los IDs duplicados con efecto real se reportan bajo 4.1.2 o 1.3.1.

## Marco legal (cómo citarlo)

La obligación legal opera **a través de la norma**, no criterio a criterio:
cada hallazgo cita el SC de WCAG + la cláusula EN 301 549; el apartado de
marco legal del informe indica dictamen, norma que obliga con artículos,
desde cuándo, y qué documento de cumplimiento corresponde. Artículos, fechas
y calendario (incluido el del RD 193/2023, 2029/2030, para el dictamen G) en
`references/marco-legal-es.md`, verificado contra el BOE. Coletilla
obligatoria: el auditor no es abogado. Antes de cada auditoría, comprueba
que EN 301 549 V4.1.1 sigue sin referencia en el DOUE y anota la fecha de
comprobación.

## Add-on opcional: WCAG 2.2 AA (por encima del mínimo legal)

**Por defecto NO se evalúa 2.2.** Solo si el intake indica que el cliente lo
contrató. Si está contratado: los 6 criterios A/AA nuevos (2.4.11, 2.5.7,
2.5.8, 3.2.6, 3.3.7, 3.3.8; procedimientos en `criterios-wcag.md`), en una
**sección aparte** del informe titulada «Por encima del mínimo legal: WCAG 2.2
(aún no exigible)», sin mezclarse con el catálogo 2.1 ni con la tabla, y **sin
efecto en el veredicto**. Enmarcado como anticipación: EN 301 549 V4.1.1 se
espera en el DOUE entre octubre y noviembre de 2026; hasta entonces es mejora
voluntaria y retrocompatible. **Caducidad:** cuando se publique la referencia,
estos criterios entran en el núcleo y esta sección se revisa.

## Escala de severidad

- **Crítico** — impide completar la tarea a un grupo de usuarios en un
  componente global o en un proceso crítico. Máxima exposición legal.
- **Grave** — impide en un punto concreto, o dificulta seriamente en algo
  global o de proceso.
- **Moderado** — dificulta en un punto concreto, o molesta en algo global.
- **Menor** — fricción puntual. Sigue siendo No conforme si el criterio es
  A/AA; lo que no incumple 2.1 AA es observación, no hallazgo.

La asignación sale de la matriz Bloqueo × Alcance (`protocolo-auditoria.md`
§8.2), juzgando el bloqueo para el grupo más afectado.

## Estructura del informe

1. **Resumen ejecutivo** — la barrera más grave en la primera frase; veredicto
   de conformidad; nº de hallazgos por severidad **con cualificador de
   alcance** («en las N páginas y M procesos evaluados»); las 3 acciones de
   mayor impacto.
2. **Alcance y metodología** — línea base de soporte con versiones; número
   exacto de páginas y procesos evaluados **y** número total de URLs del
   sitemap; lista de páginas de la muestra con su papel (estructurada /
   aleatoria); procesos y vía de prueba usada; qué quedó No evaluable y por
   qué; qué se verificó automática y manualmente; fecha. Explica en una frase
   llana qué significa muestrear según WCAG-EM y qué se infiere y qué no.
3. **Marco legal aplicable** — dictamen, norma con artículos, desde cuándo,
   documento de cumplimiento que corresponde, supuestos del intake, coletilla.
4. **Hallazgos** (ordenados por severidad; id `H##`). Cada uno:
   - Criterio WCAG + cláusula EN 301 549 + severidad (y su razón: bloqueo ×
     alcance).
   - Páginas y elemento afectado (selector o texto visible literal), nº de
     instancias.
   - Evidencia (archivo real).
   - Impacto en la persona usuaria, en lenguaje llano.
   - Cómo reproducirlo (pasos de la ficha, copiados, no reescritos).
   - Corrección recomendada, con código cuando aplique, y cómo verificar el
     arreglo.
   - Etiqueta de detección: `[Auto + confirmado]` / `[Confirmado manualmente]`
     / `[NVDA real]`.
5. **Resumen de conformidad por principio** (Perceptible, Operable,
   Comprensible, Robusto): criterios conformes / no conformes / no aplica /
   no evaluables por principio.
6. **Tabla de conformidad por criterio** — los 50, en cuatro subtablas, con
   `Criterio | Nivel | Estado | Nota (H## o causa)`. Recuento y veredicto.
   Es la prueba de cobertura y alimenta la declaración y la revisión OAW.
7. **Observaciones fuera del mínimo legal** — best practice, 2.2 (si add-on),
   `A CONFIRMAR` declarados como no verificados. Nunca mezclados con el
   catálogo.
8. **Próximos pasos y prioridades** — por severidad y por esfuerzo; qué entra
   en cada tramo de remediación.

## Cómo se nombran las cosas en el informe

El informe lo lee el dueño del negocio **y su equipo técnico**. Si citas un
bloque con un nombre que no existe, el equipo lo busca, no lo encuentra, y el
hallazgo entero pierde credibilidad.

**Entrecomillado angular «» solo el texto visible en pantalla, copiado
literal**, o el selector/atributo exacto del DOM cuando el hallazgo es
técnico. Si el nombre no está en la página y no tienes el selector delante,
**describe el bloque por posición y función, sin comillas y sin inventarle
nombre**.

- ✅ «Añadir al carrito», «Motivo de tu consulta» — están en la página.
- ❌ «el localizador de tiendas», «el área de clientes» — nombres inventados.
- ✅ «el bloque de la portada donde se listan las tiendas por provincia».

Describir nunca resta; inventar sí. Registro único (tú o vosotros) en todo el
informe, anotado en `cliente.md`.

## Entrega: Markdown de trabajo → PDF de cliente

Se **redacta y versiona en Markdown** (fuente de verdad), pero al cliente se
le entrega el **PDF** con marca, generado con
`../jpiedra-clientes/_herramientas/pdf-entregables/md2pdf.py`. **Nunca
entregues el `.md`.** Entregables: `informe.pdf` (con `--confidencial`),
`documento-cumplimiento.pdf` o `declaracion-accesibilidad.pdf` (sin
confidencial: se publican) y, si aplica, `revision-oaw.pdf`. El Markdown de
origen se estructura para que el PDF se lea con lector de pantalla: un H1,
H2 por sección, H3 por hallazgo, tablas con fila de cabecera, nada que
dependa solo del color, toda imagen descrita en el texto.

## Documento de cumplimiento (entregable aparte del informe)

Se genera según el dictamen (`marco-legal-es.md` §2) con
`references/documento-cumplimiento.md`: **público** (dictamen A, y E/F cuando
la Administración lo exija) → skill `declaracion-accesibilidad`, modelo
oficial de la Decisión (UE) 2018/1523; **privado** (B, D con cautela, G vía RD
193/2023) → documento de cumplimiento para las condiciones generales (Ley
11/2023, art. 13.2) y/o el grado de accesibilidad en la web (RD 193/2023, art.
14.3). Reglas: el estado que declara sale del veredicto (§7 del protocolo); la
versión privada no vuelca el catálogo de hallazgos; es información de
transparencia, no certificación; coletilla de no asesoramiento jurídico.

> **Sector público:** si el cliente quiere saber cómo saldría en el seguimiento
> oficial, skill `revision-oaw`. La situación de cumplimiento debe ser la misma
> en auditoría, revisión OAW y declaración.

## Dónde se guardan los entregables

Fuera del repo de la web, en `../jpiedra-clientes/<slug>/auditorias/AAAA-MM-DD/`
(ruta absoluta `c:\Desarrollo\Javier\Work\jpiedra-clientes\`). Lista completa
de archivos y su función en `protocolo-auditoria.md` §1. Las capturas de
Playwright se dirigen directamente a `evidencias/` con el nombre
`H##-<SC>-<slug>.png`; nada queda en la raíz del repo ni en `.playwright-mcp/`.

## Reglas duras

- Los entregables viven en `../jpiedra-clientes/<slug>/auditorias/AAAA-MM-DD/`,
  **nunca** dentro del repo de la web.
- El régimen legal es input del intake; nunca se infiere de la web ni se
  inventa un artículo. Todo dato legal sale de `marco-legal-es.md`.
- La muestra se documenta según WCAG-EM con el tamaño del tramo, el método
  de la aleatoria y el total de URLs del sitio.
- La línea base de soporte (navegadores, viewports, AT, versión de axe) se
  declara en el informe. No se afirma nada sobre tecnologías fuera de ella.
- Cada hallazgo cita SC de WCAG **y** cláusula de EN 301 549, tiene id `H##`,
  al menos una fuente manual, pasos repetibles y evidencia propia.
- `A CONFIRMAR` no se reporta como no conformidad ni cuenta en la tabla.
- Los criterios Manual y Parcial **nunca** se marcan Conforme sin su
  procedimiento ejecutado y su celda en `matriz-cobertura.md`.
- Solo cuatro estados: Conforme / No conforme / No aplica / No evaluable (con
  causa). Sin «No evaluado», sin «Pendiente», sin huecos.
- El veredicto se deriva de la tabla con la regla del protocolo; con algún
  No evaluable no hay plena conformidad.
- La severidad sale de la matriz Bloqueo × Alcance; los ajustes manuales se
  anotan con motivo.
- Ningún PDF se genera sin aprobación explícita de Javier (Paso 10). Aplica
  a `informe.pdf`, al documento de cumplimiento y a `revision-oaw.pdf`.
- Ningún recuento de hallazgos sin cualificador de alcance («en las páginas y
  procesos evaluados»). El informe explica qué significa y qué no significa
  auditar por muestra.
- Entrecomillado solo el texto visible literal o el selector exacto; si el
  nombre no está en pantalla, se describe el bloque.
- Las correcciones se redactan como acción concreta con código cuando aplica
  y con la prueba para verificar el arreglo; nunca «mejorar la accesibilidad».
- El impacto se explica en términos de personas, no de criterios.
- Nunca se completa una compra o reserva real con medios propios. Sin vía de
  prueba, el proceso queda parcialmente evaluado y se declara.
- Ningún dato personal real en formularios; envíos solo con autorización del
  intake y con datos de prueba marcados.
- Cita solo evidencia que exista (archivos reales del expediente). No
  inventes nombres de archivo.
