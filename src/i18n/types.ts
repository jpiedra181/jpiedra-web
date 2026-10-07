import type es from './es.json';

// El castellano es el idioma de referencia: en.json repite su forma, salvo lo
// que solo existe en castellano (el autoevaluador de la Ley 11/2023).
export type Translations = typeof es;
