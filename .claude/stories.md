# stories.md — Anécdotas y ejemplos reutilizables

> **Regla**: ninguna anécdota identifica clientes reales. Todas son patrones genéricos del sector que se repiten lo bastante como para ser ilustrativos sin necesidad de nombrar a nadie. Si en algún momento se añade una anécdota real, ofuscar empresa, sector y geografía.

---

## Patrones recurrentes que ilustran problemas técnicos

### El botón que no es un botón

Entras a un ecommerce. El botón "Añadir al carrito" se ve perfectamente: fondo azul, texto blanco, contrastado. Inspeccionas el código: es un `<div onclick="addToCart()">`. Para tu vista funciona. Para un lector de pantalla, ese elemento literalmente no existe como botón. El usuario que navega con teclado no llega a él. El usuario con NVDA escucha un texto sin contexto y no entiende qué hacer.

**Uso**: ilustrar que la accesibilidad no se ve en el render, se ve en el HTML.

### El placeholder como etiqueta

Formulario de contacto. Tres campos: Nombre, Email, Mensaje. No hay `<label>`. La identificación de cada campo está solo en el `placeholder` gris claro. Pasa dos cosas:
1. En cuanto el usuario empieza a escribir, desaparece el placeholder y ya no recuerda qué campo era.
2. El contraste del placeholder gris claro suele estar por debajo del mínimo WCAG.

**Uso**: ejemplo de fallo de accesibilidad y usabilidad a la vez. Un clásico de PYMEs.

### La cookie banner caníbal

El banner de cookies ocupa el 70% de la pantalla en móvil. No tiene foco accesible al cargar. Para llegar al botón "Aceptar" con teclado hay que tabular doce veces a través de elementos que no se ven. Para un usuario de lector de pantalla, el contenido de la web está bloqueado hasta que adivine cómo cerrar el banner. **Cumple RGPD. Incumple accesibilidad.** Combinación frecuente.

**Uso**: mostrar cómo el cumplimiento normativo aislado puede generar incumplimiento de otra normativa.

### El carrusel del horror

Página de inicio con un carrusel de tres slides que rota cada 4 segundos. Sin botones de pausa. Sin control de teclado. Cada slide tiene un texto sobreimpreso con contraste cuestionable. El usuario con dislexia no termina de leer el slide antes de que cambie. El usuario con epilepsia fotosensible puede tener problemas con la transición. **Es el patrón de diseño que más estresa a los usuarios con discapacidad cognitiva** y sigue presente en miles de webs corporativas.

**Uso**: pieza recurrente del paisaje, fácil de visualizar para el lector.

### El PDF sin estructura

La empresa publica su informe anual en PDF. 80 páginas. Sin etiquetas estructurales, sin orden lógico de lectura, con tablas que el lector de pantalla interpreta como tres mil celdas inconexas. **Y eso, en sector público, ya es una infracción del RD 1112/2018.** En privado, desde junio de 2025, también puede serlo.

**Uso**: recordatorio de que la accesibilidad no es solo HTML. PDF, vídeo, documentos: todo cuenta.

---

## Patrones humanos / de negocio

### El email del viernes a las 18:47

Departamento legal de una PYME descubre la Ley 11/2023 dos semanas antes de una inspección o de una solicitud de cumplimiento de un cliente grande. Manda email al equipo técnico: "¿Nuestra web cumple accesibilidad?". Empieza el correr. Suele ser viernes a las 18:47. Suele coincidir con el puente.

**Uso**: situación inicial reconocible para abrir un post sobre cumplimiento urgente.

### El plugin mágico de WordPress

Reunión con un cliente que ha contratado un overlay de accesibilidad (UserWay, AccessiBe o similar) por 49 €/mes. El equipo legal de la empresa cliente del cliente pide una auditoría real. El overlay falla en todas las pruebas manuales. El cliente descubre que no solo no le protege legalmente, sino que **en EE.UU. hay sentencias condenatorias contra empresas que usaron exactamente ese tipo de herramienta como única medida**.

**Uso**: piedra angular del post sobre overlays. Caso reutilizable porque le pasa a casi todos.

### El "esto ya lo hicimos accesible"

Reunión inicial. Cliente: "Sí, sí, esto ya nos lo revisaron hace dos años, está accesible". Abres Lighthouse: 47/100. Abres axe: 89 errores únicos repetidos por toda la web. Pasas tres horas con NVDA. La página de contacto, la única vía para captar leads, es directamente inutilizable con teclado. **El cliente no miente, le mintieron.**

**Uso**: ilustrar que "haberlo revisado" no significa nada si no hay metodología.

### La compra impulsiva de la accesibilidad

Empresa decide que va a ser accesible. Contrata curso de un día para el equipo. Compra un plugin. Pone una declaración tipo en el footer. Cierra el proyecto en una semana. Dos meses después, vuelve a tener exactamente los mismos problemas que antes, porque ningún proceso interno ha cambiado. **La accesibilidad no es un proyecto, es un proceso.**

**Uso**: cierre de posts sobre por qué los procesos de auditoría continuada importan más que las auditorías puntuales.

---

## Frases-anécdota cortas (one-liners reutilizables)

> "He auditado webs donde el botón principal de conversión era un `<span>`. Funcionaba con ratón. Para nadie más."

> "El cliente más caro que me ha contratado una auditoría había gastado antes el triple en un overlay que no funcionaba."

> "En el 70% de las auditorías que he hecho, el problema más grave estaba en el formulario de contacto. Es decir, justo en la página que genera leads."

> "He visto manuales de marca con 47 páginas sobre el logo y cero menciones a contraste de color."

---

## Sectores recurrentes y sus tics

Estos perfiles aparecen mucho en auditorías. Útil para ilustrar:

- **Sector turístico / hoteles**: galerías de imágenes preciosas sin alt text, mapas embebidos sin alternativa textual, formularios de reserva con calendarios inaccesibles por teclado.
- **Sector legal / abogados**: PDFs sin estructurar, formularios de contacto con campos obligatorios mal indicados, textos largos sin jerarquía de cabeceras.
- **Sector inmobiliario**: filtros de búsqueda complejos que no funcionan con teclado, tours virtuales 360º sin alternativa textual.
- **Sector educativo (privado)**: vídeos sin subtítulos, materiales descargables en formatos no accesibles, plataformas LMS con problemas estructurales.
- **Sector retail / ecommerce**: el patrón "botón que no es botón" omnipresente, configuradores de producto inaccesibles, procesos de checkout sin etiquetas correctas.

---

## Cómo introducir una anécdota en un post

Patrón recomendado:

> [Frase de contexto técnico o normativo]. Te pongo un ejemplo concreto que veo constantemente: [anécdota]. [Conclusión que ata anécdota con punto principal].

Ejemplo:

> El error de no etiquetar formularios no es solo un problema técnico, es directamente un fallo de captación. Te pongo un caso típico: una PYME del sector turístico tenía su formulario de reserva con todos los campos identificados solo por el `placeholder`. En cuanto el usuario empezaba a escribir su nombre, ya no veía qué pedía cada campo. El equipo de marketing no entendía por qué la tasa de abandono del formulario era del 73%. Ese es el coste real de ignorar la accesibilidad: no es teórico, está en el embudo de conversión.

---

## Lo que NO va aquí

- Datos concretos de clientes reales.
- Nombres de empresas (ni siquiera para criticarlas).
- Anécdotas tan específicas que sean identificables.
- Cualquier cosa contada con suficiente detalle como para que alguien del sector pudiera adivinar a quién corresponde.

Cuando aparezcan anécdotas reales nuevas, añadirlas aquí en formato genérico antes de usarlas.
