# Prompt para Claude Code — jpiedra.com

## Contexto del proyecto

Vamos a crear desde cero la web personal/portfolio de **Javier Piedra** en `jpiedra.com`. No es un portfolio típico de developer. Javier es un **arquitecto digital**: alguien que entiende problemas de negocio, diseña la solución técnica eligiendo y conectando las herramientas adecuadas, y además la construye él mismo. No es un "diseñador web" ni un "consultor". Es ambas cosas y más.

La web tiene que transmitir eso: **personalidad, movimiento, nivel técnico alto, y un posicionamiento claro y diferenciador**.

No se menciona "ZeroSugar Studio" ni ningún producto/marca concreta. Esto es la marca personal de Javier Piedra.

---

## Stack técnico

- **Framework**: Astro (última versión estable)
- **Estilos**: Tailwind CSS 4
- **Animaciones**: GSAP (ScrollTrigger para animaciones on-scroll, timeline para secuencias)
- **3D**: Three.js (solo en el hero)
- **i18n**: Bilingüe ES/EN. Español como idioma principal (ruta raíz `/`), inglés bajo `/en/`. Usar el sistema de rutas de Astro con carpetas `[lang]` y archivos de traducción JSON/TS.
- **Despliegue**: Preparado para Netlify (output estático)

---

## Principios de código — MUY IMPORTANTE

### Arquitectura y escalabilidad
- **Componentes Astro atómicos**: cada sección es su propio componente (`Hero.astro`, `Approach.astro`, `Projects.astro`, etc.)
- **Separación clara**: lógica, estilos y markup bien separados dentro de cada componente
- **Nombrado semántico**: clases y variables con nombres que expliquen su propósito, no su apariencia
- **Archivo de configuración central** (`src/config/site.ts`) con metadatos, links sociales, etc.
- **Tipos TypeScript** para los datos de proyectos, traducciones, y configuración

### Organización de carpetas
```
src/
├── components/
│   ├── layout/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── BaseLayout.astro
│   ├── sections/
│   │   ├── Hero.astro
│   │   ├── Approach.astro
│   │   ├── Projects.astro
│   │   ├── About.astro
│   │   └── Contact.astro
│   ├── ui/
│   │   ├── Button.astro
│   │   ├── ProjectCard.astro
│   │   ├── SectionLabel.astro
│   │   └── LanguageSwitcher.astro
│   └── three/
│       └── HeroScene.astro  (wrapper del canvas Three.js)
├── scripts/
│   ├── gsap-animations.ts    (toda la lógica GSAP centralizada)
│   └── three-scene.ts        (toda la lógica Three.js)
├── i18n/
│   ├── es.json
│   ├── en.json
│   ├── utils.ts               (helper getTranslation, getLangFromUrl, etc.)
│   └── types.ts               (tipado de las traducciones)
├── data/
│   ├── projects.ts            (array tipado de proyectos)
│   └── approach-steps.ts      (datos de la sección "cómo trabajo")
├── styles/
│   └── global.css             (fuentes, variables CSS custom, resets mínimos)
├── config/
│   └── site.ts                (metadatos, links, configuración general)
├── pages/
│   ├── index.astro            (ES - ruta raíz)
│   └── en/
│       └── index.astro        (EN)
└── types/
    └── index.ts               (tipos globales)
```

### Código legible
- **Comentarios solo cuando aportan**: no comentar lo obvio, sí explicar el "por qué" de decisiones no evidentes
- **Funciones pequeñas y con un solo propósito** en los scripts TS
- **Named exports** siempre, evitar default exports (excepto en páginas Astro)
- **Constantes con nombre** en lugar de magic numbers (ej: `SCROLL_TRIGGER_START = "top 80%"` en vez de un string suelto)

---

## Diseño visual — Dirección creativa

### Estética general
- **Dark mode by default** (fondo oscuro `#0B0F14`, superficie `#141A23`)
- **Acento dorado** `#E8C872` — usado con intención, no por todas partes
- **Grid de fondo tipo blueprint/plano** en el hero — refuerza la metáfora de "arquitecto"
- **Mucho espacio en blanco** (bueno, espacio negro). Respirar.
- **Tipografía con carácter**:
  - Títulos: `Instrument Serif` (de Google Fonts) — elegante, con personalidad
  - Cuerpo: `DM Sans` — limpia, profesional, muy legible
- **Imágenes reales**: usar imágenes de alta calidad. Placeholder con Unsplash como src temporal. Temas: tecnología, arquitectura, conexiones, código, workspaces. Estilo moody/dark que encaje con la paleta.

### Paleta completa
```css
--color-bg-primary: #0B0F14;
--color-bg-surface: #141A23;
--color-bg-elevated: #1C2433;
--color-accent: #E8C872;
--color-accent-hover: #F0D68A;
--color-accent-subtle: rgba(232, 200, 114, 0.08);
--color-accent-line: rgba(232, 200, 114, 0.15);
--color-text-primary: #E2E4E7;
--color-text-secondary: #9CA3AF;
--color-text-muted: #6B7280;
--color-border: rgba(232, 200, 114, 0.08);
--color-border-hover: rgba(232, 200, 114, 0.25);
```

---

## Estructura de secciones (contenido)

### 1. Header (fijo, transparente, con blur al scroll)
- Logo: "JP" en Instrument Serif, con el punto dorado animado
- Navegación: links a las secciones (smooth scroll)
- Language switcher ES/EN (discreto)
- Menú hamburguesa en mobile con animación de apertura

### 2. Hero
**Layout**: Dos columnas en desktop. Izquierda: texto. Derecha: canvas Three.js.
En mobile: texto arriba, canvas debajo (más pequeño).

**Contenido texto (ES)**:
- Label superior: "ARQUITECTO DIGITAL"
- Título: "Diseño, conecto y *construyo* soluciones digitales" (el "construyo" en cursiva y dorado)
- Subtítulo: "No hago webs bonitas. Entiendo tu problema, elijo las herramientas correctas y las conecto para que tu negocio funcione mejor."
- CTA: Botón "Hablemos →"
- Nodos/tags de capacidades: Automatización, Web moderna, IA aplicada, Integraciones, APIs, Consultoría técnica

**Elemento Three.js** (columna derecha):
Crear una **esfera wireframe con partículas en los vértices** que:
- Rota suavemente de forma automática (autorotación lenta)
- **Reacciona al cursor del ratón**: la esfera se deforma sutilmente en la dirección del cursor (como si el cursor tuviera gravedad), y las partículas cercanas al cursor se iluminan/agrandan
- Las partículas están conectadas por líneas finas doradas semitransparentes (como una red/network)
- De vez en cuando, una partícula "pulsa" con un brillo dorado que se propaga por las conexiones cercanas (como un impulso eléctrico)
- El color base de las líneas es blanco/gris muy tenue, el highlight/pulse en dorado `#E8C872`
- Performance: geometry de la esfera con segmentos limitados (~20x20) para mantener el framerate. Usar `requestAnimationFrame`. Destruir la escena al desmontar el componente.
- En mobile: simplificar (menos partículas, desactivar interacción con cursor, solo autorotación)

### 3. Sobre mí / About
**Enfoque**: No un CV. Un texto en primera persona que explique tu filosofía.

**Layout**: Imagen grande a un lado (o de fondo con overlay), texto al otro.

**Contenido placeholder (ES)**:
> "Llevo años en el desarrollo web, pero lo que realmente me motiva no es escribir código — es resolver problemas. Cada negocio es un sistema con piezas que pueden funcionar mejor. Mi trabajo es entender esas piezas, elegir la tecnología adecuada para cada una, y construir las conexiones que las hacen funcionar juntas."

(El usuario editará este texto más adelante)

### 4. Cómo trabajo / Approach
**3 pasos** en cards con número grande y decorativo:

1. **Escucho y diagnostico** — "Entiendo tu negocio, tus cuellos de botella, dónde pierdes tiempo y dinero. Sin jerga técnica."
2. **Diseño la arquitectura** — "Elijo las piezas correctas del ecosistema digital y diseño cómo conectarlas. Cada herramienta tiene un propósito."
3. **Lo construyo yo mismo** — "No delego. Escribo el código, configuro las automatizaciones y hago que todo funcione junto."

**Layout**: Cards horizontales en desktop (3 columnas), stacked en mobile. El número grande (`01`, `02`, `03`) en dorado semitransparente como elemento decorativo.

### 5. Proyectos / Projects
**3-4 proyectos** presentados como caso de estudio visual:

Cada proyecto tiene:
- Imagen/visual grande (placeholder Unsplash por ahora)
- Categoría (ej: "Automatización + IA")
- Nombre del proyecto
- Descripción corta orientada al problema que resuelve
- Tags de tecnologías usadas
- Link "Ver caso →" (puede ser `#` por ahora)

**Layout**: Cards grandes, una debajo de otra, con efecto parallax sutil en las imágenes al hacer scroll. Alternar la posición imagen/texto (izquierda-derecha) en desktop.

**Proyectos placeholder**:
1. Asistente fiscal inteligente — RAG + chatbot que responde consultas sobre el IRPF
2. Generador de Design Systems — herramienta que genera sistemas de diseño completos con IA
3. Auditoría web automatizada — sistema que analiza webs y genera reportes en lenguaje de negocio
4. Plataforma de estudio con IA — asistente personalizado para preparación de oposiciones

### 6. Contacto / Contact (CTA final)
- Título: "¿Tienes un problema que la tecnología puede resolver?"
- Subtítulo: "Cuéntamelo. Sin compromiso, sin PowerPoints, sin humo."
- Botón: "Hablemos →" (link a email o formulario)
- Links sociales: GitHub, LinkedIn (iconos simples)

### 7. Footer
- Indicador "Disponible para proyectos" con dot pulsante verde
- Copyright
- Links de navegación repetidos (discretos)

---

## Animaciones GSAP — Detalle

### Filosofía de animación
- Las animaciones deben sentirse **fluidas y naturales**, no llamativas ni molestas
- Todo es **scroll-triggered** (excepto el hero que anima al cargar)
- **Stagger** entre elementos hermanos para crear ritmo
- **Performance**: usar `will-change: transform` solo donde sea necesario, y limpiarlo después

### Animaciones específicas

**Hero (al cargar la página, timeline secuencial)**:
1. El label "ARQUITECTO DIGITAL" aparece con `clipPath` de izquierda a derecha (wipe) — 0.6s
2. El título aparece por líneas, de abajo arriba, con ligero fade — stagger 0.15s
3. El subtítulo fade in + translateY(20px → 0) — 0.8s
4. Los nodos/tags aparecen uno a uno con stagger — 0.05s cada uno
5. El canvas Three.js fade in simultáneo con el título

**Header**:
- Al hacer scroll down: background se vuelve sólido con `backdrop-filter: blur(12px)` + border bottom sutil. Transición suave.
- Al volver arriba: vuelve a transparente

**Secciones (ScrollTrigger, cada sección independiente)**:
- Los `SectionLabel` (ej: "CÓMO TRABAJO") aparecen con wipe horizontal
- Los títulos de sección: fade + translateY desde abajo
- Las cards: stagger fade + translateY desde abajo, 0.12s entre cada una
- Las imágenes de proyectos: parallax sutil (translateY al scroll, velocidad diferente al texto)

**Elementos decorativos**:
- Las líneas conectoras entre proyectos se "dibujan" al llegar al viewport (animación de `strokeDashoffset`)
- Los tags de tecnología aparecen con micro-stagger

### Configuración GSAP centralizada
Toda la lógica GSAP debe estar en `src/scripts/gsap-animations.ts` con funciones exportadas por sección:

```ts
// Ejemplo de estructura esperada
export function initHeroAnimations(): void { ... }
export function initScrollAnimations(): void { ... }
export function initHeaderScroll(): void { ... }
export function destroyAnimations(): void { ... } // cleanup
```

Cada componente Astro importa y llama la función correspondiente en un `<script>` tag.

---

## Responsive — Breakpoints

Usar los breakpoints de Tailwind:
- **Mobile first**: diseñar para mobile primero
- `sm` (640px): ajustes menores
- `md` (768px): layouts de 2 columnas empiezan aquí
- `lg` (1024px): layout completo desktop
- `xl` (1280px): max-width del contenido, centrado

**Reglas específicas**:
- Hero: stack vertical en mobile, 2 columnas en `lg`
- Approach cards: 1 columna mobile, 3 columnas en `md`
- Project cards: full width en mobile, layout alternado imagen/texto en `lg`
- Tipografía fluida: usar `clamp()` para títulos principales
- El canvas Three.js en mobile: 300px de alto máximo, sin interacción con cursor, partículas reducidas
- Menú: hamburguesa en mobile, inline en `lg`

---

## i18n — Sistema bilingüe

### Estructura de rutas
```
/                → español (idioma principal)
/en/             → inglés
```

### Archivos de traducción
`src/i18n/es.json` y `src/i18n/en.json` con estructura anidada por sección:
```json
{
  "nav": {
    "about": "Sobre mí",
    "approach": "Cómo trabajo",
    "projects": "Proyectos",
    "contact": "Contacto"
  },
  "hero": {
    "label": "Arquitecto digital",
    "title": "Diseño, conecto y <em>construyo</em> soluciones digitales",
    "subtitle": "No hago webs bonitas. Entiendo tu problema...",
    "cta": "Hablemos"
  },
  ...
}
```

### Helper de traducción
```ts
// src/i18n/utils.ts
export function getLangFromUrl(url: URL): "es" | "en" { ... }
export function useTranslations(lang: "es" | "en") { ... }
```

### Language Switcher
Componente que muestra la bandera/código del idioma alternativo y enlaza a la misma página en el otro idioma.

---

## SEO y Performance

- **Meta tags completos**: title, description, og:image, twitter:card por idioma
- **Canonical URLs** correctas para cada idioma
- **`<html lang="es">` / `<html lang="en">`** dinámico
- **Sitemap** automático con el integration de Astro
- **Fuentes**: preload de Instrument Serif y DM Sans, `font-display: swap`
- **Imágenes**: usar el componente `<Image>` de Astro para optimización automática
- **Three.js**: importar solo los módulos necesarios, no todo el paquete. Lazy load del canvas (solo cuando el hero entra en viewport o directamente al cargar pero con import dinámico)
- **GSAP**: import dinámico, tree-shakeable

---

## Instrucciones de ejecución

1. Crear el proyecto Astro desde cero con `npm create astro@latest`
2. Instalar dependencias: `tailwindcss`, `gsap`, `three`, `@astrojs/sitemap`
3. Configurar Tailwind con los colores custom de la paleta
4. Montar la estructura de carpetas como se indica arriba
5. Implementar el sistema i18n primero (es la base de todo)
6. Construir componentes de layout (BaseLayout, Header, Footer)
7. Implementar secciones una a una, empezando por Hero
8. Integrar Three.js en el hero
9. Añadir animaciones GSAP (primero hero, luego scroll)
10. Responsive polish
11. SEO meta tags
12. Testing final

**IMPORTANTE**: Construye toda la web completa. No dejes secciones sin implementar ni con "TODO". Cada sección debe tener su contenido, estilos, animaciones y responsive terminados.
