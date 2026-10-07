// Tiempo en directo del puerto de Navacerrada (1858 m) desde AEMET OpenData,
// con el mismo formato que usa la escena de la home (src/scripts/survey/weather.ts).
//
// AEMET responde en dos pasos: la primera llamada devuelve la URL donde están
// los datos. La clave se configura en Netlify como variable de entorno
// AEMET_API_KEY y nunca llega al navegador.

const STATION_ID = '2462'; // Puerto de Navacerrada
const AEMET_URL = `https://opendata.aemet.es/opendata/api/observacion/convencional/datos/estacion/${STATION_ID}`;
// La estación publica una observación por hora: media hora de caché en la CDN
// basta y evita gastar la cuota de la API con cada visita.
const CDN_CACHE_SECONDS = 1800;
const BROWSER_CACHE_SECONDS = 600;
// Si AEMET falla, se vuelve a probar a los cinco minutos, no en cada visita.
const UNAVAILABLE_CACHE_SECONDS = 300;
const MS_TO_KMH = 3.6;

// Umbrales para traducir la observación a un código WMO (el que entiende la
// escena). AEMET da precipitación de la última hora, no un "estado del cielo".
const SNOW_MAX_TEMPERATURE = 1;
const FOG_VISIBILITY_KM = 1;
const FOG_HUMIDITY = 97;
const OVERCAST_HUMIDITY = 90;

interface AemetObservation {
  fint: string;
  ubi?: string;
  ta?: number;
  vv?: number;
  dv?: number;
  prec?: number;
  hr?: number;
  vis?: number;
  nieve?: number;
}

// Los ficheros de datos de AEMET vienen en ISO-8859-15, no en UTF-8.
async function readAemetJson(response: Response): Promise<any> {
  if (!response.ok) throw new Error(`AEMET respondió ${response.status}`);
  return JSON.parse(new TextDecoder('iso-8859-15').decode(await response.arrayBuffer()));
}

function weatherCodeFrom(observation: AemetObservation): number {
  const precipitation = observation.prec ?? 0;
  const humidity = observation.hr ?? 0;
  if (observation.vis !== undefined && observation.vis < FOG_VISIBILITY_KM) return 45;
  if (precipitation > 0) {
    if ((observation.ta ?? 5) <= SNOW_MAX_TEMPERATURE) return precipitation > 2 ? 75 : precipitation > 0.5 ? 73 : 71;
    return precipitation > 4 ? 65 : precipitation > 1 ? 63 : 61;
  }
  if (humidity >= FOG_HUMIDITY) return 45;
  if (humidity >= OVERCAST_HUMIDITY) return 3;
  return 1;
}

// La estación no mide la nubosidad: se estima con la humedad relativa.
function cloudCoverFrom(observation: AemetObservation, code: number): number {
  if (code >= 45) return 100;
  if (code === 3) return 90;
  return Math.min(80, Math.max(0, ((observation.hr ?? 50) - 50) * 2));
}

function json(body: unknown, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

// Sin datos se responde 204 y no un error: el navegador apunta cualquier 4xx o
// 5xx como error en la consola de cada visitante (y Lighthouse lo penaliza),
// cuando para la escena no tener el tiempo es un caso previsto. El motivo va
// en una cabecera para poder diagnosticarlo.
function unavailable(reason: string): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'X-Tiempo-Error': encodeURIComponent(reason),
      'Netlify-CDN-Cache-Control': `public, s-maxage=${UNAVAILABLE_CACHE_SECONDS}`,
    },
  });
}

export default async function handler(): Promise<Response> {
  const apiKey = process.env.AEMET_API_KEY;
  if (!apiKey) return unavailable('Falta la variable de entorno AEMET_API_KEY');

  try {
    const index = await readAemetJson(await fetch(AEMET_URL, { headers: { api_key: apiKey } }));
    if (!index.datos) throw new Error(index.descripcion ?? 'AEMET no devolvió la URL de datos');

    const observations: AemetObservation[] = await readAemetJson(await fetch(index.datos));
    const latest = observations.filter((observation) => typeof observation.ta === 'number').at(-1);
    if (!latest) throw new Error('La estación no tiene observaciones recientes');

    const code = weatherCodeFrom(latest);
    return json(
      {
        code,
        temperature: latest.ta,
        cloudCover: cloudCoverFrom(latest, code),
        windSpeed: (latest.vv ?? 0) * MS_TO_KMH,
        windFrom: latest.dv ?? 0,
        snowDepth: (latest.nieve ?? 0) / 100,
        observedAt: latest.fint,
        // Nombre de la estación según AEMET, para comprobar que es la del puerto.
        station: latest.ubi,
        source: 'directo',
      },
      {
        'Cache-Control': `public, max-age=${BROWSER_CACHE_SECONDS}`,
        'Netlify-CDN-Cache-Control': `public, s-maxage=${CDN_CACHE_SECONDS}, stale-while-revalidate=3600`,
      },
    );
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : String(error));
  }
}

export const config = { path: '/api/tiempo-sierra' };
