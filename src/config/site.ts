import type { Lang } from '../types';
import pagePairsData from './page-pairs.json';

export const siteConfig = {
  name: 'Javier Piedra',
  url: 'https://jpiedra.com',
  email: 'contacto@jpiedra.com',
  socials: {
    github: 'https://github.com/javierpiedra',
    linkedin: 'https://linkedin.com/in/javierpiedra',
  },
  defaultLang: 'es' as const,
};

// Rutas en español. La home es el levantamiento en 3D; la versión clásica
// (mismo contenido sin WebGL) lleva los proyectos, "Sobre mí" y el contacto.
// Cada especialidad tiene su propia landing. Todas con barra final, que es la
// URL canónica: sin ella, Netlify responde con una redirección 301 a cada clic.
export const routes = {
  home: '/',
  classic: '/clasica/',
  immersive: '/experiencias-3d/',
  accessibility: '/accesibilidad-web/',
  ai: '/agentes-ia/',
  law: '/te-aplica-ley-11-2023/',
  blog: '/blog/',
  work: '/clasica/#proyectos',
  about: '/clasica/#about',
  contact: '/clasica/#contact',
  pricing: '/accesibilidad-web/#precios',
  caseStudy: '/caso-auditoria-accesibilidad/',
};

export type SiteRoutes = typeof routes;

// Las mismas páginas en inglés. El autoevaluador y el blog solo existen en
// español (tratan la ley española): en inglés enlazan a la versión española.
export const routesEn: SiteRoutes = {
  home: '/en/',
  classic: '/en/classic/',
  immersive: '/en/3d-experiences/',
  accessibility: '/en/web-accessibility/',
  ai: '/en/ai-agents/',
  law: '/te-aplica-ley-11-2023/',
  blog: '/blog/',
  work: '/en/classic/#proyectos',
  about: '/en/classic/#about',
  contact: '/en/classic/#contact',
  pricing: '/en/web-accessibility/#pricing',
  caseStudy: '/en/accessibility-audit-case/',
};

// Ancla de la sección de precios de accesibilidad en cada idioma.
export const pricingId = (lang: Lang) => (lang === 'en' ? 'pricing' : 'precios');

export const routesFor = (lang: Lang): SiteRoutes => (lang === 'en' ? routesEn : routes);

// Pares de páginas equivalentes en los dos idiomas (src/config/page-pairs.json,
// que también lee astro.config.mjs para el sitemap). Dan las etiquetas
// hreflang y el destino del selector de idioma.
export interface PagePair {
  es: string;
  en: string;
}

export const pagePairs: PagePair[] = pagePairsData;

// "/clasica/" y "/clasica" son la misma página.
export const normalizePath = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

export function pairFor(path: string): PagePair | undefined {
  const normalized = normalizePath(path);
  return pagePairs.find((pair) => normalizePath(pair.es) === normalized || normalizePath(pair.en) === normalized);
}

// Forma canónica de una ruta: con barra final, como la sirve el build
// (cada página es una carpeta con su index.html). Así coinciden canonical,
// hreflang y sitemap.
export const canonicalPath = (path: string) => {
  const normalized = normalizePath(path);
  return normalized === '/' ? '/' : `${normalized}/`;
};
