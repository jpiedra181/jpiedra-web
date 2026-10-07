import type { Lang } from '../types';
import { siteConfig, canonicalPath } from '../config/site';

// Datos estructurados (schema.org) que comparten las páginas de servicio. La
// persona se declara entera en la home (SurveyHome.astro) y aquí se enlaza por
// su @id.
const PERSON_ID = `${siteConfig.url}/#javier-piedra`;

const provider = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: siteConfig.name,
  url: siteConfig.url,
};

const absolute = (path: string) => `${siteConfig.url}${canonicalPath(path)}`;

interface ServiceOptions {
  lang: Lang;
  path: string;
  name: string;
  description: string;
  serviceType: string;
}

export function serviceSchema({ lang, path, name, description, serviceType }: ServiceOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType,
    url: absolute(path),
    inLanguage: lang,
    provider,
    areaServed: [
      { '@type': 'Country', name: lang === 'es' ? 'España' : 'Spain' },
      { '@type': 'Place', name: lang === 'es' ? 'Unión Europea' : 'European Union' },
    ],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

// Imagen para compartir de cada página: public/og/<página>-<idioma>.jpg.
export const ogImageFor = (page: string, lang: Lang) => `${siteConfig.url}/og/${page}-${lang}.jpg`;
