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

Convierte la URL de un prospecto en UN hallazgo afilado e irrefutable + un email
frío listo para enviar. El hallazgo es la excusa para iniciar conversación, no
consultoría gratis.

## Reglas de oro

- **Un solo hallazgo.** El más demoledor Y 100% verificable. No un informe.
- **Irrefutable o nada.** Solo hallazgos binarios y comprobables (ver lista
  abajo), nunca juicios de severidad ni nada discutible. Si el prospecto o su
  desarrollador lo comprueba, debe ser innegablemente cierto. Confirma el
  hallazgo a mano (no te fíes solo de la bandera de axe) antes de usarlo.
- **Si no hay hook limpio, dilo.** Si una pasada rápida no da un hallazgo 100%
  irrefutable, repórtalo y no envíes nada. Mejor sin email que con un gancho
  rebatible — protege la credibilidad de Javier.
- **No es trabajo gratis.** Das UN hallazgo como gancho; el resto (cuántos más
  hay y qué cuesta resolverlo) es la auditoría de pago.
- **Voz ZeroSugar / Isra Bravo:** honesto, directo, concreto, sin humo, sin
  comparaciones con la competencia, una idea por frase.

## Alcance del escaneo (rápido)

- **Portada + página de contacto** (si existe: busca enlaces "contacto"/"contact"
  o rutas comunes `/contacto`, `/contact`). Los formularios son el mejor caladero:
  casi siempre fallan y el fallo es binario.
- Playwright + axe + checks rápidos de teclado y estructura. **Sin muestreo, sin
  pasadas profundas.** Esto es un sondeo, no la auditoría.

## Hallazgos válidos para hook (clase irrefutable)

Elige UNO solo de esta lista, tras confirmarlo:

- Campo(s) de formulario sin nombre accesible (sin `<label>` ni `aria-label`).
- Imagen-enlace o botón sin texto / nombre accesible.
- Control interactivo no operable por teclado (`span`/`div` con onclick sin
  `tabindex`; o `role="button"` sin `tabindex`).
- Imagen informativa sin `alt`.
- `<html>` sin atributo `lang`.

Prioriza por impacto humano y por lo fácil que es de entender para un dueño de
negocio: **formulario de contacto > acceso a cuenta/login > imágenes-enlace sin
texto > alt/lang.**

## Salida: el email frío

Genera **asunto + cuerpo personalizado**.

**Asunto** — específico y de curiosidad, NUNCA "Auditoría de accesibilidad" (huele
a venta). Ejemplos: "Un detalle en la web de [empresa]", "Algo en vuestra web que
quizá no habéis visto". Concreto, sin amenazar.

**Saludo** — "Hola [Nombre]," si encuentras el nombre (web, aviso legal, LinkedIn);
si no, "Hola,".

**Cuerpo** (estructura probada, una idea por frase):

1. Hook concreto: "Estuve mirando la web de [empresa] y me fijé en algo concreto
   en [la página de inicio / la de contacto]: [hallazgo en lenguaje llano]."
2. Impacto humano con metáfora relatable, sin jerga: qué le pasa a una persona
   real (p. ej. quien usa lector de pantalla). Modelo: las "puertas sin letrero".
3. Stakes legales en suave, como un "también": "[sector] entra en el ámbito de la
   Ley 11/2023, que desde junio de 2025 aplica al sector privado, y este es justo
   el tipo de detalle que se revisa." (Ajusta el sector; solo afírmalo si encaja.)
4. Quita presión: "No te adjunto ningún informe ni te propongo nada todavía. Solo
   quería que lo supieras."
5. CTA suave: "Si te interesa saber cuántas cosas más hay y qué costaría
   resolverlo, con gusto te preparo una auditoría completa."
6. Firma: Javier Piedra — jpiedra.com

Tono: cálido, directo, escaneable en segundos. Que el hallazgo sea verdad y el
correo no prometa nada gratis más allá de ese gancho.
