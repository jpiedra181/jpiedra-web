import type { Lang } from '../types';

const NUMBER_LOCALE: Record<Lang, string> = { es: 'es-ES', en: 'en-GB' };

// «2428 m» en castellano, «2,428 m» en inglés.
export const formatElevation = (metres: number, lang: Lang) =>
  `${Math.round(metres).toLocaleString(NUMBER_LOCALE[lang])} m`;
