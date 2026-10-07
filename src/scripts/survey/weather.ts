import { sceneStrings } from './strings';
// El tiempo que hace en la sierra y cómo se traduce a la escena. Los datos en
// directo son del puerto de Navacerrada (1858 m), en el centro del encuadre.

export const WEATHER_STATION = { name: 'Puerto de Navacerrada', lat: 40.7889, lon: -4.0036, elevation: 1858 };

// En producción el dato viene de AEMET a través de la función de Netlify
// (netlify/functions/tiempo-sierra.mts), que guarda la clave y cachea. En
// desarrollo esa función no existe, así que se usa Open-Meteo, cuyo uso
// gratuito solo cubre fines no comerciales.
const USE_AEMET = import.meta.env.PROD;
const AEMET_PROXY_URL = '/api/tiempo-sierra';
const OPEN_METEO_URL =
  'https://api.open-meteo.com/v1/forecast' +
  `?latitude=${WEATHER_STATION.lat}&longitude=${WEATHER_STATION.lon}&elevation=${WEATHER_STATION.elevation}` +
  '&current=temperature_2m,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,rain,snowfall,snow_depth' +
  '&timezone=Europe%2FMadrid';

export type WeatherKind = 'live' | 'clear' | 'rain' | 'snow' | 'fog' | 'wind';

export interface Weather {
  code: number;
  temperature: number;
  cloudCover: number;
  windSpeed: number;
  // Dirección meteorológica: de dónde viene el viento, en grados.
  windFrom: number;
  snowDepth: number;
  source: 'directo' | 'simulado';
}

export interface WeatherVisuals {
  rain: number;
  snow: number;
  fog: number;
  fogLevel: number;
  wind: number;
  // Hacia dónde sopla, en radianes desde el norte (sentido horario).
  windToward: number;
  snowLine: number;
  cloudCover: number;
  label: string;
}

const RAIN_BY_CODE: Record<number, number> = {
  51: 0.25, 53: 0.35, 55: 0.5, 56: 0.3, 57: 0.45, 61: 0.45, 63: 0.7, 65: 1, 66: 0.5, 67: 0.8,
  80: 0.45, 81: 0.7, 82: 1, 95: 0.9, 96: 1, 99: 1,
};
const SNOW_BY_CODE: Record<number, number> = { 71: 0.35, 73: 0.65, 75: 1, 77: 0.3, 85: 0.5, 86: 0.9 };
const FOG_BY_CODE: Record<number, number> = { 45: 0.85, 48: 0.95 };

// Claves de strings.ts para cada grupo de códigos WMO.
const CONDITION_BY_CODE: Array<[number[], string]> = [
  [[0], 'clear'],
  [[1], 'mostlyClear'],
  [[2], 'partlyCloudy'],
  [[3], 'overcast'],
  [[45, 48], 'fog'],
  [[51, 53, 55, 56, 57], 'drizzle'],
  [[61, 63, 65, 66, 67], 'rain'],
  [[71, 73, 75, 77], 'snow'],
  [[80, 81, 82], 'showers'],
  [[85, 86], 'snowShowers'],
  [[95, 96, 99], 'storm'],
];
const WIND_CALM_KMH = 6;
const WIND_FULL_KMH = 50;
// Gradiente térmico medio: un grado menos cada 154 m de subida.
const METRES_PER_DEGREE = 154;
const SNOW_BELOW_FREEZING_M = 300;
const NO_SNOW = 99_999;

// Cota de nieve típica por mes en Guadarrama (para viajar en el tiempo).
const SEASONAL_SNOW_LINE: Record<number, number> = { 11: 1950, 0: 1650, 1: 1650, 2: 1800, 3: 2050 };
const DECEMBER = 11;

async function fetchFromAemet(signal?: AbortSignal): Promise<Weather> {
  const response = await fetch(AEMET_PROXY_URL, { signal });
  if (!response.ok) throw new Error(`El tiempo de AEMET respondió ${response.status}`);
  // 204: la función no tiene dato (sin clave o AEMET caído) y dice por qué.
  if (response.status === 204) {
    throw new Error(`AEMET sin datos: ${decodeURIComponent(response.headers.get('X-Tiempo-Error') ?? '')}`);
  }
  const data = await response.json();
  return {
    code: data.code,
    temperature: data.temperature,
    cloudCover: data.cloudCover,
    windSpeed: data.windSpeed,
    windFrom: data.windFrom,
    snowDepth: data.snowDepth ?? 0,
    source: 'directo',
  };
}

export async function fetchLiveWeather(signal?: AbortSignal): Promise<Weather> {
  if (USE_AEMET) return fetchFromAemet(signal);
  const response = await fetch(OPEN_METEO_URL, { signal });
  if (!response.ok) throw new Error(`Open-Meteo respondió ${response.status}`);
  const { current } = await response.json();
  return {
    code: current.weather_code,
    temperature: current.temperature_2m,
    cloudCover: current.cloud_cover,
    windSpeed: current.wind_speed_10m,
    windFrom: current.wind_direction_10m,
    snowDepth: current.snow_depth ?? 0,
    source: 'directo',
  };
}

// Tiempo forzado desde el panel o la URL. Valores plausibles para la sierra.
export function simulatedWeather(kind: Exclude<WeatherKind, 'live'>, date: Date): Weather {
  const winter = [DECEMBER, 0, 1, 2].includes(date.getMonth());
  const base: Weather = {
    code: 0, temperature: winter ? 1 : 14, cloudCover: 5, windSpeed: 8, windFrom: 300, snowDepth: 0, source: 'simulado',
  };
  switch (kind) {
    case 'rain':
      return { ...base, code: 63, temperature: Math.max(base.temperature, 6), cloudCover: 100, windSpeed: 22, windFrom: 240 };
    case 'snow':
      return { ...base, code: 73, temperature: -3, cloudCover: 100, windSpeed: 18, windFrom: 330, snowDepth: 0.4 };
    case 'fog':
      return { ...base, code: 45, temperature: Math.min(base.temperature, 7), cloudCover: 100, windSpeed: 5, windFrom: 200 };
    case 'wind':
      return { ...base, code: 2, cloudCover: 40, windSpeed: 55, windFrom: 300 };
    default:
      return base;
  }
}

function conditionOf(code: number): string {
  const strings = sceneStrings();
  const key = CONDITION_BY_CODE.find(([codes]) => codes.includes(code))?.[1];
  return key ? strings.conditions[key] : strings.variable;
}

function snowLineFor(weather: Weather, date: Date, frozenMoment: boolean): number {
  let line = NO_SNOW;
  if (weather.snowDepth > 0.02) {
    line = WEATHER_STATION.elevation - Math.min(weather.snowDepth, 1.2) * 500;
  } else if (frozenMoment) {
    line = SEASONAL_SNOW_LINE[date.getMonth()] ?? NO_SNOW;
  }
  if (SNOW_BY_CODE[weather.code]) {
    const freezingLevel = WEATHER_STATION.elevation + weather.temperature * METRES_PER_DEGREE;
    line = Math.min(line, freezingLevel - SNOW_BELOW_FREEZING_M);
  }
  return line;
}

export function describeWeather(weather: Weather): string {
  const strings = sceneStrings();
  const temperature = `${weather.temperature.toLocaleString(strings.locale, { maximumFractionDigits: 1 })} °C`;
  const wind =
    weather.windSpeed < WIND_CALM_KMH
      ? strings.calm
      : strings.wind(strings.compass[Math.round(weather.windFrom / 45) % 8], Math.round(weather.windSpeed));
  return `${temperature} · ${conditionOf(weather.code)} · ${wind}`;
}

export function weatherVisuals(weather: Weather, date: Date, frozenMoment: boolean): WeatherVisuals {
  const fog = FOG_BY_CODE[weather.code] ?? (weather.cloudCover > 90 ? 0.3 : 0);
  return {
    rain: RAIN_BY_CODE[weather.code] ?? 0,
    snow: SNOW_BY_CODE[weather.code] ?? 0,
    fog,
    // Con niebla en el puerto, la nube envuelve la sierra y solo asoman las
    // cumbres; con cielo cubierto se queda en los valles.
    fogLevel: FOG_BY_CODE[weather.code] ? 2050 : 1350,
    wind: Math.min(Math.max((weather.windSpeed - WIND_CALM_KMH) / (WIND_FULL_KMH - WIND_CALM_KMH), 0), 1),
    windToward: (((weather.windFrom + 180) % 360) * Math.PI) / 180,
    snowLine: snowLineFor(weather, date, frozenMoment),
    cloudCover: weather.cloudCover / 100,
    label: describeWeather(weather),
  };
}
