---
name: buscador-hooks
description: >-
  Encuentra UN hallazgo de accesibilidad irrefutable en la web de un prospecto y
  redacta un email frío de outreach alrededor de él. Es para captación, NO una
  auditoría. Usa esta skill SIEMPRE que el usuario hable de outreach, captación,
  email frío, prospectos, "buscar un gancho/hook", o pida revisar rápido una web
  para escribirle a un cliente potencial. NO confundir con la skill
  auditoria-accesibilidad (esa es el entregable de pago para clientes reales).
  Requiere Playwright MCP.
---

# Buscador de hooks (outreach en frío)

Convierte la URL de un prospecto en **un** hallazgo afilado e irrefutable y un
email frío listo para enviar. El hallazgo es la excusa para iniciar
conversación, no consultoría gratis. Entra después de `clasificador-prospectos`:
llega con dictamen probable, tamaño estimado y prioridad.

## Reglas de oro

- **Un solo hallazgo.** El más claro **y** cien por cien verificable. No un
  informe, no una lista.
- **Irrefutable o nada.** Solo hallazgos de la clase de abajo, **confirmados a
  mano** con el mismo listón que la auditoría: reproducidos por ti, con al
  menos una fuente manual (DOM inspeccionado, teclado real o árbol de
  accesibilidad contrastado con el DOM) además de la automática, y descritos
  en pasos que el desarrollador del prospecto pueda repetir. Si hay que
  hedgear, no es hook.
- **Si no hay hook limpio, no hay email.** Se reporta y no se fuerza un gancho
  discutible. Una web bien construida en lo básico (formularios etiquetados,
  imágenes con alt, botones con nombre, `lang`) no recibe correo frío; si el
  prospecto vale por tamaño y dictamen, se propone acercamiento cálido
  (LinkedIn, presentación directa).
- **Los pequeños no se trabajan.** Si el clasificador los descartó por tamaño,
  aquí no se entra.
- **No es trabajo gratis.** Un hallazgo como gancho; cuántos más hay y qué
  cuesta resolverlo es el diagnóstico exprés o la auditoría.
- **Voz de Javier** (`.claude/voice.md`): honesto, directo, concreto, una idea
  por frase, sin humo, sin comparar con la competencia, sarcasmo cero en un
  correo a alguien que no te conoce.

## Alcance del escaneo (rápido)

- **Portada + página de contacto** (enlaces «contacto», rutas `/contacto`,
  `/contact`) y, si hay proceso (carrito, reserva, login), **su primer paso**.
  Los formularios son el mejor caladero: fallan a menudo y el fallo es binario.
- Playwright MCP, en Chromium de escritorio, con el aviso de cookies cerrado.
  axe-core 4.11.4 con reglas WCAG 2.1 A/AA (el snippet está en
  `../diagnostico-expres/references/protocolo-pasada.md` §3) como **generador de
  candidatos**, más la comprobación manual de abajo. **Sin muestreo, sin
  pasadas profundas.** Es un sondeo de diez minutos, no el diagnóstico.

## Hallazgos válidos para hook y cómo se confirma cada uno

Elige **uno**, en este orden de preferencia (impacto humano y facilidad de
entender para un dueño de negocio): formulario de contacto o de proceso →
acceso a cuenta / login → botones e imágenes-enlace sin nombre → alt → lang.

| Hook | Cómo se confirma (todo, no una parte) | Descarta si |
|---|---|---|
| **Campo de formulario sin nombre accesible** | 1) Snapshot del árbol: el campo aparece como «textbox» sin nombre. 2) DOM: no hay `<label for>` que apunte a su `id`, ni `<label>` envolvente, ni `aria-label`, ni `aria-labelledby`, ni `title`. 3) El `placeholder` no cuenta como nombre para el hook aunque el árbol lo use: se dice «solo tiene texto de ejemplo, que desaparece al escribir». | Hay una `<label>` asociada aunque esté oculta con `display:none` (NVDA no la lee, pero el desarrollador la verá y lo discutirá: para outreach no sirve) |
| **Botón o imagen-enlace sin nombre** | 1) Árbol: «button» o «link» sin nombre. 2) DOM: el elemento solo contiene un icono (`<img alt="">`, `<svg>` sin `<title>`, fuente de iconos) y no tiene `aria-label` ni `title`. 3) Confirma que es un control real (está en el orden de tabulación o es `<a href>` / `<button>`). | El nombre existe pero es malo («imagen», «leer más»): eso es juicio, no hook |
| **Control no operable por teclado** | 1) `div` o `span` con `onclick` (o listener) sin `tabindex` y sin rol, o `role="button"` sin `tabindex`. 2) Tabula desde el inicio de la página y confirma que el foco nunca llega. 3) Confirma que hace algo con ratón (abre menú, envía, añade a cesta). | Un elemento padre sí es enfocable y hace lo mismo |
| **Imagen informativa sin `alt`** | 1) `<img>` sin atributo `alt` (no `alt=""`). 2) Es informativa: logotipo, producto, infografía, imagen dentro de enlace. 3) No hay texto adyacente que la describa y esté asociado. | Es decorativa o tiene `alt=""` deliberado |
| **`<html>` sin `lang`** | 1) `document.documentElement.lang` vacío en portada. 2) Comprueba una segunda página: si solo falta en una plantilla, se dice «en la portada». | Tiene `lang` válido aunque abreviado (`es`) |

Registro interno del hallazgo (se queda en el chat para el Sheet, no en el
repo): página, selector o texto visible literal, pasos de reproducción, y una
captura si Javier la quiere adjuntar al correo. Nombrar las cosas como en la
auditoría: **entrecomillado solo el texto visible copiado literal**; si el
bloque no tiene nombre en pantalla, se describe por posición y función.

## La frase legal, según el dictamen probable

Va en suave, como un «también», y **solo si el clasificador dio esa letra con
señales claras**. Nunca «estás obligado»: la heurística no lo sabe.

| Dictamen probable | Frase |
|---|---|
| B (comercio electrónico y demás servicios del art. 2.2) | «Las tiendas online [o el sector concreto] entran en la Ley 11/2023, que aplica desde el 28 de junio de 2025, y este es justo el tipo de detalle que se revisa.» |
| A (sector público) | «Para una administración esto lleva siendo exigible desde 2020 por el RD 1112/2018, y es lo primero que mira el Observatorio de Accesibilidad Web.» |
| E (concesión, concertado, sociedad pública) | «Como gestionáis un servicio público, la accesibilidad de la web os llega por el pliego y por el RD 1112/2018; suele ser de lo primero que pide el concedente.» |
| F (sello NextGen o Kit Digital visible) | «He visto el sello de la ayuda en el pie: la accesibilidad de la web es condición de esas ayudas, y en una comprobación es lo que se mira.» |
| C (productos cubiertos) | «Si además se compra en la web, esa parte cuenta como comercio electrónico para la Ley 11/2023, en vigor desde junio de 2025.» |
| G (sin obligación inmediata) | Sin frase legal, o solo si es grande: «No es algo que os obligue hoy; el RD 193/2023 lo hará para las webs nuevas desde 2029. Pero a la persona que no pudo escribiros le da igual la fecha.» |

Fuentes: `../auditoria-accesibilidad/references/marco-legal-es.md`. Si la letra
no está clara, la frase legal se omite entera; el hook se sostiene solo.

## Salida: el email frío

**Asunto**: específico y de curiosidad, nunca «Auditoría de accesibilidad».
«Un detalle en la web de [empresa]», «Algo en vuestro formulario de contacto».

**Saludo**: «Hola [Nombre],» si el nombre está en la web, el aviso legal o
LinkedIn; si no, «Hola,».

**Cuerpo**, una idea por frase, en este orden:

1. **Hook concreto**: «Estuve mirando la web de [empresa] y me fijé en algo en
   [la portada / el formulario de contacto]: [hallazgo en lenguaje llano, con
   el texto visible literal si lo hay].»
2. **Cómo comprobarlo**, en una línea que su desarrollador pueda repetir:
   «Pulsa Tab desde arriba: el botón de enviar nunca recibe el foco.» Es lo que
   convierte el correo en irrefutable.
3. **Impacto humano** sin jerga, una persona concreta: quien usa lector de
   pantalla oye «cuadro de texto» y no sabe qué escribir; quien no puede usar
   ratón no llega al botón. Sin cifras, salvo las verificadas de
   `.claude/stats.md` si encajan de forma natural.
4. **Frase legal** de la tabla, si procede.
5. **Quitar presión**: «No te adjunto ningún informe ni te propongo nada
   todavía. Solo quería que lo supieras.»
6. **Una sola CTA**, según tamaño: medio → «Si quieres saber qué más hay, en
   48 horas te digo los 10 fallos que más te están costando: es un diagnóstico
   de 290 € que se descuenta de la auditoría si sigues.» · grande o
   público → «Si te interesa saber cuántas cosas más hay y qué costaría
   resolverlo, te preparo una auditoría completa con precio cerrado.»
7. Firma: Javier Piedra — jpiedra.com.

Tono: cálido, directo, escaneable en segundos, sin mayúsculas ni urgencia. Que
el hallazgo sea verdad y el correo no prometa nada gratis más allá de ese
gancho.

## Qué se devuelve a Javier

1. **El hallazgo confirmado** con sus pasos de reproducción y el selector (para
   el Sheet y por si el prospecto responde «eso no es verdad»).
2. **El email** (asunto + cuerpo).
3. **Una línea de decisión**: enviar / no enviar (sin hook limpio) / acercamiento
   cálido (web bien construida y prospecto valioso).

Nada se guarda en el repo ni en `_prospeccion/`; el registro es el Sheet.

## Reglas duras

- Un solo hallazgo, de la clase irrefutable, confirmado con al menos una fuente
  manual y descrito en pasos repetibles. Lo que solo respalda axe o el árbol no
  se usa.
- Sin hook limpio, sin email. Nunca un gancho rebatible.
- Prospectos pequeños: no se trabajan.
- Texto visible entre comillas solo si es literal; nombres inventados, nunca.
- La frase legal sale de la tabla de dictámenes, en suave, y solo con señales
  claras. Jamás «estás obligado», jamás cuantías de multas en un primer correo.
- Una sola CTA. Sin adjuntos salvo que Javier pida la captura.
- Nada al repo: el registro vive en el Sheet de captación.
