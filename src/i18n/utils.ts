//@ts-nocheck
import type { Lang } from '../types';
import type { Translations } from './types';
import es from './es.json';
import en from './en.json';

const translations: Record<Lang, Translations> = { es, en };

export function getLangFromUrl(url: URL): Lang {
  const path = url.pathname;
  if (path === '/en' || path.startsWith('/en/')) return 'en';
  return 'es';
}

export function useTranslations(lang: Lang): Translations {
  return translations[lang];
}
