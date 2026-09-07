// @ts-check
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

export default defineConfig({
  site: 'https://jpiedra.com',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    shikiConfig: {
      theme: githubDarkAccesible,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap({
    filter: (page) => !page.includes('/404'),
  }), mdx(), react()],
});