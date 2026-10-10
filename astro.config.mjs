// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

import mdx from '@astrojs/mdx';
import githubDark from 'shiki/themes/github-dark.mjs';

// El color de comentario de github-dark (#6a737d sobre #24292e) da 3,04:1, por
// debajo del 4,5:1 que exige WCAG 1.4.3 para texto normal. Y los comentarios de
// los ejemplos son justo la parte que explica por qué el código está bien o mal.
// #8b949e sobre el mismo fondo da 4,77:1 y sigue leyéndose como secundario.
const githubDarkAccesible = {
  ...githubDark,
  name: 'github-dark-accesible',
  colorReplacements: {
    ...githubDark.colorReplacements,
    '#6a737d': '#8b949e',
  },
};

// Pares de páginas equivalentes en castellano e inglés (los mismos que usan
// las etiquetas hreflang de cada página): el sitemap los declara también.
const SITE = 'https://jpiedra.com';
const pagePairs = JSON.parse(readFileSync(new URL('./src/config/page-pairs.json', import.meta.url), 'utf8'));
const trimSlash = (/** @type {string} */ path) => (path.length > 1 ? path.replace(/\/+$/, '') : path);
const withSlash = (/** @type {string} */ path) => (trimSlash(path) === '/' ? '/' : `${trimSlash(path)}/`);

// Los enlaces internos de los artículos (/blog/otro-post) van a la URL
// canónica, con barra final: sin ella, Netlify responde a cada clic con una
// redirección 301. Así se puede seguir escribiendo el enlace sin barra.
const internalHref = /^(\/(?!\/)[^?#]*)([?#].*)?$/;
const withCanonicalSlash = (/** @type {string} */ href) => {
  const match = href.match(internalHref);
  if (!match || /\.[a-z0-9]+$/i.test(match[1])) return href;
  return `${withSlash(match[1])}${match[2] ?? ''}`;
};

function rehypeCanonicalLinks() {
  /** @param {any} node */
  const visit = (node) => {
    if (node.type === 'element' && node.tagName === 'a' && typeof node.properties?.href === 'string') {
      node.properties.href = withCanonicalSlash(node.properties.href);
    }
    // Enlaces escritos como JSX dentro del MDX (<a href="…"> o componentes).
    for (const attribute of node.type?.startsWith('mdxJsx') ? node.attributes ?? [] : []) {
      if (attribute.name === 'href' && typeof attribute.value === 'string') {
        attribute.value = withCanonicalSlash(attribute.value);
      }
    }
    node.children?.forEach(visit);
  };
  return (/** @type {any} */ tree) => visit(tree);
}

/** @param {any} node @returns {string} */
const textOf = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''));

// Las tablas de las fichas de accesibilidad (hasta seis columnas) no caben en
// un móvil. Cada una va en una región desplazable que recibe el foco, para que
// también se pueda desplazar con el teclado, y que se llama como el encabezado
// bajo el que está. Solo en las fichas: el blog tiene sus propias tablas.
function rehypeScrollableTables() {
  return (/** @type {any} */ tree, /** @type {any} */ file) => {
    const path = String(file.path ?? file.history?.[0] ?? '').replace(/\\/g, '/');
    if (!path.includes('/src/content/fichas/')) return;
    let heading = '';
    const tablesPerHeading = new Map();
    tree.children = tree.children.map((/** @type {any} */ node) => {
      if (node.type === 'element' && /^h[2-4]$/.test(node.tagName)) heading = textOf(node).trim();
      if (node.type !== 'element' || node.tagName !== 'table') return node;
      const count = (tablesPerHeading.get(heading) ?? 0) + 1;
      tablesPerHeading.set(heading, count);
      const name = heading ? `Tabla: ${heading}${count > 1 ? ` (${count})` : ''}` : 'Tabla';
      return {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'], role: 'region', tabIndex: 0, ariaLabel: name },
        children: [node],
      };
    });
  };
}

export default defineConfig({
  site: 'https://jpiedra.com',
  // Al pasar el ratón (o el foco) por un enlace interno, la página se descarga
  // por adelantado: al hacer clic aparece al instante.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    rehypePlugins: [rehypeCanonicalLinks, rehypeScrollableTables],
    shikiConfig: {
      theme: githubDarkAccesible,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap({
    filter: (page) => !page.includes('/404'),
    serialize(item) {
      const path = trimSlash(new URL(item.url).pathname);
      const pair = pagePairs.find(
        (/** @type {{ es: string, en: string }} */ entry) => trimSlash(entry.es) === path || trimSlash(entry.en) === path,
      );
      if (pair) {
        item.links = [
          { lang: 'es', url: `${SITE}${withSlash(pair.es)}` },
          { lang: 'en', url: `${SITE}${withSlash(pair.en)}` },
        ];
      }
      return item;
    },
  }), mdx(), react()],
});