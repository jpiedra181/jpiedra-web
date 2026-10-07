// Textos que genera la escena de la home 3D (cielo, tiempo, coordenadas y la
// lupa "lo que no se ve"), en los dos idiomas de la web. La página elige el
// idioma al crear la escena (setSceneLanguage) y los módulos leen de aquí.
import type { Lang } from '../../types';

export interface SceneStrings {
  locale: string;
  compass: string[];
  west: string;
  moon: { new: string; full: string; phase: (waxing: boolean, percent: number) => string };
  sky: {
    night: (moon: string, moonUp: boolean) => string;
    dawn: string;
    dusk: string;
    day: string;
    sun: (moment: string, altitude: number, direction: string) => string;
  };
  conditions: Record<string, string>;
  variable: string;
  calm: string;
  wind: (direction: string, speed: number) => string;
  simulation: string;
  noLiveData: string;
  reader: {
    text: string;
    heading: (level: string) => string;
    link: string;
    toggle: string;
    togglePressed: string;
    note: string;
    quote: (name: string) => string;
  };
}

// Códigos WMO del tiempo agrupados (weather.ts los traduce a estas claves).
const STRINGS: Record<Lang, SceneStrings> = {
  es: {
    locale: 'es-ES',
    compass: ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'],
    west: 'O',
    moon: {
      new: 'luna nueva',
      full: 'luna llena',
      phase: (waxing, percent) => `luna ${waxing ? 'creciente' : 'menguante'} ${percent} %`,
    },
    sky: {
      night: (moon, moonUp) => `Noche · ${moon}${moonUp ? '' : ', bajo el horizonte'}`,
      dawn: 'Amanecer',
      dusk: 'Atardecer',
      day: 'Día',
      sun: (moment, altitude, direction) => `${moment} · sol a ${altitude}° al ${direction}`,
    },
    conditions: {
      clear: 'despejado',
      mostlyClear: 'poco nuboso',
      partlyCloudy: 'nubes y claros',
      overcast: 'cubierto',
      fog: 'niebla',
      drizzle: 'llovizna',
      rain: 'lluvia',
      snow: 'nieve',
      showers: 'chubascos',
      snowShowers: 'chubascos de nieve',
      storm: 'tormenta',
    },
    variable: 'tiempo variable',
    calm: 'en calma',
    wind: (direction, speed) => `viento del ${direction} a ${speed} km/h`,
    simulation: 'Simulación',
    noLiveData: 'Sin datos del tiempo en directo',
    reader: {
      text: 'texto',
      heading: (level) => `encabezado, nivel ${level}`,
      link: 'enlace',
      toggle: 'botón de alternar',
      togglePressed: 'botón de alternar, pulsado',
      note: 'nota',
      quote: (name) => `«${name}»`,
    },
  },
  en: {
    locale: 'en-GB',
    compass: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    west: 'W',
    moon: {
      new: 'new moon',
      full: 'full moon',
      phase: (waxing, percent) => `${waxing ? 'waxing' : 'waning'} moon ${percent}%`,
    },
    sky: {
      night: (moon, moonUp) => `Night · ${moon}${moonUp ? '' : ', below the horizon'}`,
      dawn: 'Sunrise',
      dusk: 'Sunset',
      day: 'Day',
      sun: (moment, altitude, direction) => `${moment} · sun ${altitude}° ${direction}`,
    },
    conditions: {
      clear: 'clear',
      mostlyClear: 'mostly clear',
      partlyCloudy: 'partly cloudy',
      overcast: 'overcast',
      fog: 'fog',
      drizzle: 'drizzle',
      rain: 'rain',
      snow: 'snow',
      showers: 'showers',
      snowShowers: 'snow showers',
      storm: 'thunderstorm',
    },
    variable: 'changeable',
    calm: 'calm',
    wind: (direction, speed) => `${direction} wind at ${speed} km/h`,
    simulation: 'Simulation',
    noLiveData: 'No live weather data',
    reader: {
      text: 'text',
      heading: (level) => `heading, level ${level}`,
      link: 'link',
      toggle: 'toggle button',
      togglePressed: 'toggle button, pressed',
      note: 'note',
      quote: (name) => `“${name}”`,
    },
  },
};

let active: SceneStrings = STRINGS.es;

export function setSceneLanguage(lang: Lang): void {
  active = STRINGS[lang] ?? STRINGS.es;
}

export const sceneStrings = (): SceneStrings => active;
