import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  PerspectiveCamera,
  Ray,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { sceneStrings, setSceneLanguage } from './survey/strings';
import { computeAtmosphere, type Atmosphere } from './survey/atmosphere';
import { createSky } from './survey/sky';
import { createPrecipitation } from './survey/precipitation';
import { createSoundscape } from './survey/soundscape';
import { ease, tween, type Tween, type TweenOptions } from './survey/tween';
import {
  computeStage,
  fitCameraToStage,
  presetFramingWorks,
  obstacleRects,
  placeCards,
  type CardSlot,
  type LayoutElements,
} from './survey/layout';
import {
  fetchLiveWeather,
  simulatedWeather,
  weatherVisuals,
  WEATHER_STATION,
  type Weather,
  type WeatherKind,
  type WeatherVisuals,
} from './survey/weather';

// El terreno se dibuja en kilómetros: x hacia el este, z hacia el sur (el norte
// queda en -z) e y es la altura sobre la cota mínima, exagerada para que la
// sierra se lea a la escala de una pantalla.
const VERTICAL_EXAGGERATION = 2.1;
const MINOR_CONTOUR_M = 20;
const MAJOR_CONTOUR_M = 100;

const BACKGROUND = new Color(0x0b0f14);
const WIRE = new Color(0xdbe4ee);

// El sol avanza un cuarto de grado por minuto: refrescar la luz cada minuto
// basta para que el atardecer se vea pasar sin recalcular en cada fotograma.
const ATMOSPHERE_REFRESH_MS = 60_000;
const HORIZON_STEP_KM = 0.25;
const WATER_PICK_THRESHOLD = 0.4;
const WATER_NAME_RADIUS_KM = 1.5;

const WEATHER_REFRESH_MS = 15 * 60_000;
const NO_SNOW_LINE = 99_999;
const OVERCAST = new Color(0x3a4250);
// Cuánto apagan las nubes la luz del sol o de la luna con el cielo cubierto.
const CLOUD_DIMMING = 0.35;
const RAIN_SLANT_FACTOR = 0.45;
const MAX_FRAME_SECONDS = 0.1;

// Rendimiento. Con el movimiento en pausa solo se pinta mientras algo cambia
// (cursor, lupa, vuelo, cambio de momento); en reposo la GPU no trabaja.
const INITIAL_RENDER_MS = 4500;
const INTERACTION_RENDER_MS = 1200;
// Resolución adaptativa: si los fotogramas superan ~24 ms (menos de 40 fps)
// se baja la densidad de píxeles por pasos; si sobra margen, se recupera.
const MIN_PIXEL_RATIO = 1;
const PIXEL_RATIO_STEP = 0.25;
const SLOW_FRAME_MS = 24;
const FAST_FRAME_MS = 13;
const RESOLUTION_SAMPLE_FRAMES = 90;
// En pantallas de alta densidad el antialiasing por hardware apenas se nota y
// cuesta caro; las curvas ya se suavizan en el shader.
const HARDWARE_AA_MAX_PIXEL_RATIO = 2;

// Luces de los pueblos: se encienden entre +4° y −8° de altura del sol, y a lo
// largo de la noche cambia cuántas quedan encendidas (hora local → fracción).
const NIGHT_START_DEGREES = 4;
const NIGHT_FULL_DEGREES = -8;
const LIGHTS_BY_HOUR: Array<[number, number]> = [
  [0, 0.6], [1.5, 0.35], [5.5, 0.35], [7, 0.8], [18, 1], [23, 1], [24, 0.6],
];
const VILLAGE_NAME_RADIUS_KM = 1;
// La textura de pueblos tiene 4 texels por celda del MDT (ver build_villages).
const VILLAGE_TEXTURE_SCALE = 4;
const VILLAGE_HALO_LOD_BIAS = 3.5;
const VILLAGE_HALO_GAIN = 5;

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

function lightsActivity(date: Date): number {
  const hour = date.getHours() + date.getMinutes() / 60;
  const index = LIGHTS_BY_HOUR.findIndex(([h]) => h > hour);
  const [h0, v0] = LIGHTS_BY_HOUR[index - 1];
  const [h1, v1] = LIGHTS_BY_HOUR[index];
  return v0 + ((hour - h0) / (h1 - h0)) * (v1 - v0);
}

const RISE_SECONDS = 2.2;
const REVEAL_SECONDS = 2.8;
const FLIGHT_SECONDS = 1.6;

const LENS_RADIUS_PX = 170;
const LENS_RADIUS_COARSE_RATIO = 0.34;
const POINTER_GLOW_KM = 1.8;
const FOCUS_GLOW_KM = 2.2;
const PICK_STEP_KM = 0.05;
const PICK_MAX_KM = 90;

const MOBILE_BREAKPOINT = 1024;
const MAX_PIXEL_RATIO = 1.75;
const MOBILE_MESH_STEP = 2;

// Vista desde Segovia: la cámara está al noroeste de la sierra, mirando al
// sureste, como se ve La Mujer Muerta desde la ciudad.
const CAMERA_POSITION = new Vector3(-9, 13, -15.3);
const CAMERA_TARGET = new Vector3(2.5, 0.2, 3.2);
// En vertical, desde Segovia las cuatro cumbres (12 km de oeste a este) no
// caben a lo ancho. Se mira desde el oeste y más en picado: la sierra queda
// "de pie" y las cumbres, en la mitad de arriba, por encima del titular.
const CAMERA_POSITION_PORTRAIT = new Vector3(-26, 36.2, 2.1);
const CAMERA_TARGET_PORTRAIT = new Vector3(-0.6, 0.3, 2.1);
// Largo del tallo entre el pilar y su tarjeta (móvil / resto).
const CARD_LIFT_MOBILE_PX = 30;
const CARD_LIFT_PX = 52;
const MOBILE_LAYOUT_MAX_WIDTH = 767;
// La niebla de distancia se ajusta a lo lejos que quede la cámara tras el
// encuadre automático: sin esto, la bruma taparía la sierra en móvil.
const FOG_NEAR_FACTOR = 0.9;
const FOG_FAR_FACTOR = 1.82;

// Preajustes de orientación de la cámara. La distancia y el desplazamiento
// finales los decide el encuadre automático (survey/layout.ts).
interface CameraFraming {
  position: Vector3;
  target: Vector3;
}

const LANDSCAPE_FRAMING: CameraFraming = { position: CAMERA_POSITION, target: CAMERA_TARGET };
const PORTRAIT_FRAMING: CameraFraming = { position: CAMERA_POSITION_PORTRAIT, target: CAMERA_TARGET_PORTRAIT };

const framingFor = (width: number, height: number): CameraFraming =>
  height > width ? PORTRAIT_FRAMING : LANDSCAPE_FRAMING;
const CAMERA_FOV = 34;
const DRIFT_KM = 0.7;
const DRIFT_SPEED = 0.07;
const PARALLAX_KM = 0.8;
const CAMERA_EASING = 0.035;
const VERTEX_LIFT_KM = 0.06;

export interface TerrainMeta {
  cols: number;
  rows: number;
  lonMin: number;
  lonMax: number;
  latMin: number;
  latMax: number;
  widthKm: number;
  depthKm: number;
  minHeight: number;
  maxHeight: number;
}

export interface SurveyVertexTarget {
  element: HTMLElement;
  lat: number;
  lon: number;
  href?: string;
}

export interface SurveySceneOptions {
  canvas: HTMLCanvasElement;
  // Idioma de los textos que genera la escena (cielo, tiempo, lupa).
  lang?: 'es' | 'en';
  heightsUrl: string;
  waterMaskUrl: string;
  meta: TerrainMeta;
  vertices: SurveyVertexTarget[];
  readout: {
    latitude: HTMLElement;
    longitude: HTMLElement;
    elevation: HTMLElement;
    // El cielo y el tiempo se muestran en más de un sitio (panel de escritorio
    // y línea de estado en móvil).
    sky: HTMLElement[];
    weather: HTMLElement[];
    place: HTMLElement;
  };
  waterNames: Array<{ name: string; lat: number; lon: number }>;
  villagesUrl: string;
  villageNames: Array<{ name: string; lat: number; lon: number }>;
  // Momento fijo (viaje en el tiempo) o null para la hora real.
  initialMoment: Date | null;
  initialWeather: WeatherKind;
  reticle: HTMLElement;
  lensToggle: HTMLButtonElement;
  lensLayer: HTMLElement;
  lensCaption: HTMLElement;
  fade: HTMLElement;
  layout: LayoutElements;
}

export interface SurveyScene {
  setMoment(moment: Date | null): void;
  setWeather(kind: WeatherKind): void;
  setPaused(paused: boolean): void;
  isPaused(): boolean;
  setSound(enabled: boolean): Promise<void>;
  isSoundOn(): boolean;
  destroy(): void;
}

interface VertexState {
  target: SurveyVertexTarget;
  world: Vector3;
  card: HTMLElement | null;
  placement: number;
}

interface Annotation {
  source: HTMLElement;
  box: HTMLElement;
  description: string;
}

const vertexShader = /* glsl */ `
  attribute float aHeight;
  uniform float uRise;
  uniform float uMinHeight;
  uniform float uExaggeration;
  varying float vHeight;
  varying vec3 vWorld;
  varying vec2 vUv;

  void main() {
    vHeight = aHeight;
    vUv = uv;
    vec3 displaced = position;
    displaced.y = (aHeight - uMinHeight) / 1000.0 * uExaggeration * uRise;
    vec4 world = modelMatrix * vec4(displaced, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uLine;
  uniform vec3 uGround;
  uniform vec3 uFog;
  uniform vec3 uZenith;
  uniform vec3 uWater;
  uniform vec3 uLightDir;
  uniform float uLightStrength;
  uniform sampler2D uWaterMask;
  uniform float uTime;
  uniform float uRipple;
  uniform float uSnowLine;
  uniform float uSnowCover;
  uniform float uFogBank;
  uniform float uFogLevel;
  uniform vec3 uFogTint;
  uniform vec2 uWindDir;
  uniform float uWind;
  uniform float uRain;
  uniform sampler2D uVillages;
  uniform vec2 uVillageSize;
  uniform float uNight;
  uniform float uLightsOn;
  uniform vec3 uWire;
  uniform float uMinHeight;
  uniform float uMaxHeight;
  uniform float uReveal;
  uniform float uRevealDone;
  uniform vec3 uPointer;
  uniform float uPointerAmount;
  uniform vec3 uFocus;
  uniform float uFocusAmount;
  uniform vec2 uLensCenter;
  uniform float uLensRadius;
  uniform float uLensAmount;
  uniform vec2 uGrid;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vHeight;
  varying vec3 vWorld;
  varying vec2 vUv;

  // Distancia a la isolínea más cercana medida en píxeles: así el grosor es
  // constante en pantalla, esté la ladera cerca o lejos de la cámara.
  float isoline(float value, float interval, float thickness) {
    float scaled = value / interval;
    float distancePx = abs(fract(scaled - 0.5) - 0.5) / max(fwidth(scaled), 1e-4);
    return 1.0 - smoothstep(thickness - 0.5, thickness + 0.5, distancePx);
  }

  float gridline(float value) {
    float distancePx = abs(fract(value - 0.5) - 0.5) / max(fwidth(value), 1e-4);
    return 1.0 - smoothstep(0.4, 1.2, distancePx);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 normal = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
    if (normal.y < 0.0) normal = -normal;
    vec3 lightDir = normalize(uLightDir);
    float facing = clamp(dot(normal, lightDir), 0.0, 1.0);
    // Luz real: las laderas que dan la cara al sol (o a la luna) avivan sus
    // curvas y las que quedan en sombra se apagan.
    float lightGain = mix(1.0, mix(0.45, 1.4, facing), uLightStrength);

    float minor = isoline(vHeight, ${MINOR_CONTOUR_M.toFixed(1)}, 0.55);
    float major = isoline(vHeight, ${MAJOR_CONTOUR_M.toFixed(1)}, 1.0);

    float pointerGlow = (1.0 - smoothstep(0.0, ${POINTER_GLOW_KM.toFixed(2)}, distance(vWorld.xz, uPointer.xz))) * uPointerAmount;
    float focusGlow = (1.0 - smoothstep(0.0, ${FOCUS_GLOW_KM.toFixed(2)}, distance(vWorld.xz, uFocus.xz))) * uFocusAmount;
    float glow = max(pointerGlow, focusGlow);

    // Las curvas se dibujan de la cota más baja a la más alta, y la que se
    // está trazando en ese momento brilla como la línea de un plotter.
    float revealed = step(vHeight, uReveal);
    float drawingFront = (1.0 - smoothstep(0.0, 14.0, abs(vHeight - uReveal))) * (1.0 - uRevealDone);

    // Jerarquía por altitud: las cumbres brillan y el llano se apaga, para que
    // la vista vaya sola a las cimas (que es donde están los apartados).
    float altitude = clamp((vHeight - uMinHeight) / (uMaxHeight - uMinHeight), 0.0, 1.0);
    float altitudeWeight = mix(0.28, 1.0, smoothstep(0.1, 0.85, altitude));

    // Lagunas y embalses: en el MDT son planos, así que no llevan curvas.
    float water = texture2D(uWaterMask, vUv).r;
    float waterBody = smoothstep(0.35, 0.65, water);

    // De día el mapa gana claridad: curvas más vivas y laderas al sol más claras.
    float daylight = 1.0 - uNight;
    float lines = (minor * 0.16 + major * 0.5) * altitudeWeight * lightGain * mix(1.0, 1.3, daylight) + (minor * 0.85 + major * 0.6) * glow;
    lines *= revealed * (1.0 - waterBody);

    // Nieve: por encima de la cota de nieve las curvas pasan de oro a plata y
    // la ladera se aclara. Las paredes casi verticales no retienen nieve.
    float snowy = smoothstep(uSnowLine - 40.0, uSnowLine + 90.0, vHeight) * smoothstep(0.35, 0.75, normal.y) * uSnowCover;
    vec3 lineColor = mix(uLine, vec3(0.93, 0.95, 0.98), snowy * 0.85);

    vec3 color = uGround + uLine * facing * mix(0.04, 0.13, daylight) * uLightStrength * revealed;
    color += vec3(0.75, 0.8, 0.88) * snowy * (0.05 + 0.1 * facing) * revealed;
    color = mix(color, lineColor, clamp(lines, 0.0, 1.0));
    color += uLine * drawingFront * 0.9;

    // Agua: lámina fría y clara que refleja el cielo, con el rayado horizontal
    // de los mapas grabados y doble orilla. Las derivadas van fuera del if:
    // dentro de una rama no uniforme, fwidth no está definido.
    float waterEdge = max(fwidth(water), 1e-4);
    float shore = 1.0 - smoothstep(0.0, 1.3, abs(water - 0.45) / waterEdge);
    float innerShore = 1.0 - smoothstep(0.0, 1.0, abs(water - 0.85) / waterEdge);
    float hatchCoord = vWorld.z * 22.0 + sin(vWorld.x * 9.0 + uTime * 0.6 * uRipple) * 0.25;
    float hatchWidth = max(fwidth(hatchCoord), 1e-4);
    float hatch = (1.0 - smoothstep(0.0, 1.0, abs(fract(hatchCoord) - 0.5) / hatchWidth)) * (1.0 - smoothstep(0.3, 0.6, hatchWidth));

    if (water > 0.01) {
      vec3 viewDir = normalize(vWorld - cameraPosition);
      float ripple = sin(vWorld.x * 70.0 + uTime * 1.4 * uRipple) * 0.5 + sin(vWorld.z * 90.0 - uTime * 1.1 * uRipple) * 0.5;
      vec3 surfaceNormal = normalize(vec3(ripple * 0.06, 1.0, ripple * 0.04));
      vec3 reflected = reflect(viewDir, surfaceNormal);
      vec3 skyReflection = mix(uFog, uZenith, sqrt(clamp(reflected.y, 0.0, 1.0)));
      vec3 waterColor = mix(uWater, skyReflection, 0.3);
      waterColor = mix(waterColor, waterColor * 1.8 + 0.03, hatch * 0.8);
      waterColor += uLine * pow(max(dot(reflected, lightDir), 0.0), 60.0) * 1.6 * uLightStrength;

      // Lluvia sobre el agua: anillos que se abren y se apagan.
      if (uRain > 0.001) {
        vec2 rainCell = floor(vWorld.xz * 28.0);
        vec2 rainLocal = fract(vWorld.xz * 28.0);
        float rainSeed = hash(rainCell);
        float rainPhase = fract(uTime * 0.8 + rainSeed);
        vec2 rainCenter = vec2(hash(rainCell + 1.7), hash(rainCell + 3.1)) * 0.6 + 0.2;
        float rainRing = (1.0 - smoothstep(0.0, 0.07, abs(length(rainLocal - rainCenter) - rainPhase * 0.4))) * (1.0 - rainPhase);
        waterColor += vec3(0.8, 0.86, 0.92) * rainRing * step(1.0 - uRain, rainSeed) * 0.7;
      }

      color = mix(color, waterColor, waterBody * revealed);
    }
    color = mix(color, uLine, shore * 0.85 * revealed);
    color = mix(color, uLine * 0.8, innerShore * 0.35 * revealed * waterBody);

    // Pueblos: de día, un punteado discreto; de noche, cada edificio enciende
    // su luz cuando la fracción de luces encendidas supera su umbral, y el
    // núcleo entero se envuelve en un halo cálido (canal G). El umbral sale de
    // un hash por texel: guardarlo en la textura la hacía pesar el triple.
    // El halo es la misma planta leída en un mipmap más basto (sesgo de LOD):
    // la GPU ya la tiene promediada y no hace falta guardarla aparte.
    float footprint = texture2D(uVillages, vUv).r;
    float halo = min(texture2D(uVillages, vUv, ${VILLAGE_HALO_LOD_BIAS.toFixed(1)}).r * ${VILLAGE_HALO_GAIN.toFixed(1)}, 1.0);
    color = mix(color, uGround + uLine * 0.5, footprint * 0.4 * daylight * revealed);
    float windowSeed = hash(floor(vUv * uVillageSize));
    float windowLit = step(windowSeed, uLightsOn);
    float flicker = 0.88 + 0.12 * sin(uTime * (1.5 + windowSeed * 4.0) + windowSeed * 40.0);
    vec3 warmLight = vec3(1.0, 0.72, 0.38);
    color += warmLight * footprint * windowLit * flicker * uNight * 1.3 * revealed;
    color += warmLight * halo * 0.35 * uNight * uLightsOn * revealed;

    // Viento: trazos que avanzan en la dirección real, como en un mapa del
    // tiempo. Cada carril lleva su propio desfase para que no marchen en fila.
    // Ramas con condición uniforme (igual para todos los píxeles): sin viento
    // ni niebla no se paga su coste, y las derivadas siguen siendo válidas.
    if (uWind > 0.001) {
      vec2 across = vec2(-uWindDir.y, uWindDir.x);
      float alongCoord = dot(vWorld.xz, uWindDir);
      float laneCoord = dot(vWorld.xz, across) * 2.6 + sin(alongCoord * 0.9) * 0.35;
      float laneSeed = hash(vec2(floor(laneCoord), 7.0));
      float dash = fract(alongCoord * 0.35 - uTime * (0.25 + 0.6 * uWind) + laneSeed * 13.0);
      float dashShape = smoothstep(0.0, 0.05, dash) * (1.0 - smoothstep(0.18, 0.32, dash));
      float laneWidth = max(fwidth(laneCoord), 1e-4);
      float laneLine = 1.0 - smoothstep(0.15, 0.8, abs(fract(laneCoord) - 0.5) / laneWidth);
      float windStroke = laneLine * dashShape * step(0.5, laneSeed) * uWind * (1.0 - smoothstep(0.25, 0.5, laneWidth));
      color = mix(color, vec3(0.86, 0.9, 0.95), windStroke * 0.34 * revealed);
    }

    // Niebla: bancos que se arrastran con el viento por los valles; lo que
    // queda por encima de la nube asoma, como el mar de nubes de Segovia.
    if (uFogBank > 0.001) {
      float fogNoise = fbm(vWorld.xz * 0.28 + uWindDir * uTime * 0.04);
      float fogTop = uFogLevel + (fogNoise - 0.5) * 260.0;
      float fogBank = (1.0 - smoothstep(fogTop - 120.0, fogTop + 60.0, vHeight)) * uFogBank * smoothstep(0.25, 0.65, fogNoise + 0.2);
      color = mix(color, uFogTint, clamp(fogBank, 0.0, 0.92) * revealed);
    }

    float fog = smoothstep(uFogNear, uFogFar, distance(cameraPosition, vWorld));
    float edge = smoothstep(0.0, 0.07, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
    color = mix(uFog, color, (1.0 - fog) * edge);

    // La lente enseña lo que hay debajo de las curvas: la malla del terreno.
    float lensDistance = distance(gl_FragCoord.xy, uLensCenter);
    float insideLens = (1.0 - smoothstep(uLensRadius - 1.5, uLensRadius + 1.5, lensDistance)) * uLensAmount;
    if (insideLens > 0.0) {
      vec2 cell = vUv * uGrid / 3.0;
      float wire = max(max(gridline(cell.x), gridline(cell.y)), gridline(cell.x + cell.y) * 0.6);
      vec3 lensColor = uGround * 1.35 + uWire * wire * 0.5 * edge * (1.0 - fog * 0.7);
      lensColor = mix(lensColor, uLine, major * 0.35 * revealed);
      color = mix(color, lensColor, insideLens);
    }
    float ring = (1.0 - smoothstep(0.0, 1.6, abs(lensDistance - uLensRadius))) * uLensAmount;
    color = mix(color, uLine, ring * 0.85);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Cede el hilo principal entre pasos pesados del arranque: así el navegador
// puede pintar y atender al usuario en vez de bloquearse en una tarea larga.
const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

// Trabajo que no corre prisa (solo sirve para el nombre bajo el cursor): se
// hace cuando el navegador está ocioso.
const whenIdle = (work: () => void) =>
  'requestIdleCallback' in window ? window.requestIdleCallback(work, { timeout: 3000 }) : window.setTimeout(work, 1500);

async function loadHeights(url: string): Promise<Float32Array> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`No se pudo cargar el terreno: ${response.status}`);
  const decimetres = new Uint16Array(await response.arrayBuffer());
  const metres = new Float32Array(decimetres.length);
  for (let i = 0; i < decimetres.length; i++) metres[i] = decimetres[i] / 10;
  return metres;
}

function createTerrainGeometry(heights: Float32Array, meta: TerrainMeta, step: number): BufferGeometry {
  const cols = Math.floor((meta.cols - 1) / step) + 1;
  const rows = Math.floor((meta.rows - 1) / step) + 1;
  const positions = new Float32Array(cols * rows * 3);
  const uvs = new Float32Array(cols * rows * 2);
  const elevations = new Float32Array(cols * rows);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const i = row * cols + col;
      const u = col / (cols - 1);
      const v = row / (rows - 1);
      positions[i * 3] = (u - 0.5) * meta.widthKm;
      positions[i * 3 + 2] = (v - 0.5) * meta.depthKm;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
      elevations[i] = heights[row * step * meta.cols + col * step];
    }
  }

  const indices = new Uint32Array((cols - 1) * (rows - 1) * 6);
  let k = 0;
  for (let row = 0; row < rows - 1; row++) {
    for (let col = 0; col < cols - 1; col++) {
      const a = row * cols + col;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.set([a, c, b, b, c, d], k);
      k += 6;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
  geometry.setAttribute('aHeight', new BufferAttribute(elevations, 1));
  geometry.setIndex(new BufferAttribute(indices, 1));
  return geometry;
}

function formatDms(value: number, positive: string, negative: string): string {
  const hemisphere = value >= 0 ? positive : negative;
  const absolute = Math.abs(value);
  const degrees = Math.floor(absolute);
  const minutesFull = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFull);
  const seconds = Math.floor((minutesFull - minutes) * 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${degrees}°${pad(minutes)}′${pad(seconds)}″ ${hemisphere}`;
}

function describeForScreenReader(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const name = (element.getAttribute('aria-label') ?? element.textContent ?? '').replace(/\s+/g, ' ').trim();
  const { reader } = sceneStrings();
  let role = reader.text;
  if (/^h[1-6]$/.test(tag)) role = reader.heading(tag[1]);
  else if (tag === 'a') role = reader.link;
  else if (tag === 'button') role = element.getAttribute('aria-pressed') === 'true' ? reader.togglePressed : reader.toggle;
  else if (element.getAttribute('role') === 'note') role = reader.note;
  return `${role} · ${reader.quote(name)}`;
}

export async function initSurveyScene(options: SurveySceneOptions): Promise<SurveyScene> {
  const { canvas, meta } = options;
  setSceneLanguage(options.lang ?? 'es');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;

  const heights = await loadHeights(options.heightsUrl);
  await yieldToBrowser();

  const maxPixelRatio = Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO);
  let pixelRatio = maxPixelRatio;
  const renderer = new WebGLRenderer({
    canvas,
    antialias: window.devicePixelRatio < HARDWARE_AA_MAX_PIXEL_RATIO,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(BACKGROUND, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 200);
  let framing = framingFor(window.innerWidth, window.innerHeight);
  const basePosition = framing.position.clone();
  const lookTarget = framing.target.clone();
  camera.position.copy(basePosition);
  camera.lookAt(lookTarget);

  await yieldToBrowser();
  const geometry = createTerrainGeometry(heights, meta, isMobile ? MOBILE_MESH_STEP : 1);
  await yieldToBrowser();
  const meshCols = Math.floor((meta.cols - 1) / (isMobile ? MOBILE_MESH_STEP : 1)) + 1;
  const meshRows = Math.floor((meta.rows - 1) / (isMobile ? MOBILE_MESH_STEP : 1)) + 1;

  // La máscara se muestrea con las mismas UV del terreno, fila 0 = norte. Una
  // copia en memoria permite saber si el cursor está sobre agua.
  let waterPixels: Uint8ClampedArray | null = null;
  let waterWidth = 0;
  let waterHeight = 0;
  const waterMask = new TextureLoader().load(options.waterMaskUrl, (texture) =>
    whenIdle(() => {
      const image = texture.image as HTMLImageElement;
      const reader = document.createElement('canvas');
      reader.width = image.width;
      reader.height = image.height;
      const context = reader.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.drawImage(image, 0, 0);
      waterPixels = context.getImageData(0, 0, image.width, image.height).data;
      waterWidth = image.width;
      waterHeight = image.height;
    }),
  );
  waterMask.flipY = false;

  const villageLights = new TextureLoader().load(options.villagesUrl);
  villageLights.flipY = false;

  const uniforms = {
    uLine: { value: new Color(0xe8c872) },
    uGround: { value: BACKGROUND.clone() },
    uFog: { value: BACKGROUND.clone() },
    uZenith: { value: BACKGROUND.clone() },
    uWater: { value: BACKGROUND.clone() },
    uLightDir: { value: new Vector3(0, 1, 0) },
    uLightStrength: { value: 0 },
    uWaterMask: { value: waterMask },
    uTime: { value: 0 },
    uRipple: { value: 1 },
    uSnowLine: { value: NO_SNOW_LINE },
    uSnowCover: { value: 0 },
    uFogBank: { value: 0 },
    uFogLevel: { value: 1350 },
    uFogTint: { value: new Color(0x2a3240) },
    uWindDir: { value: new Vector2(1, 0) },
    uWind: { value: 0 },
    uRain: { value: 0 },
    uVillages: { value: villageLights },
    uVillageSize: { value: new Vector2(meta.cols * VILLAGE_TEXTURE_SCALE, meta.rows * VILLAGE_TEXTURE_SCALE) },
    uNight: { value: 0 },
    uLightsOn: { value: 0 },
    uWire: { value: WIRE },
    uRise: { value: reduceMotion ? 1 : 0 },
    uMinHeight: { value: meta.minHeight },
    uMaxHeight: { value: meta.maxHeight },
    uExaggeration: { value: VERTICAL_EXAGGERATION },
    uReveal: { value: reduceMotion ? meta.maxHeight + 50 : meta.minHeight - 20 },
    uRevealDone: { value: reduceMotion ? 1 : 0 },
    uPointer: { value: new Vector3() },
    uPointerAmount: { value: 0 },
    uFocus: { value: new Vector3() },
    uFocusAmount: { value: 0 },
    uLensCenter: { value: new Vector2() },
    uLensRadius: { value: 0 },
    uLensAmount: { value: 0 },
    uGrid: { value: new Vector2(meshCols - 1, meshRows - 1) },
    uFogNear: { value: 22 },
    uFogFar: { value: 46 },
  };

  const state = {
    flying: false,
    pointer: new Vector2(window.innerWidth / 2, window.innerHeight / 2),
    pointerInside: false,
    parallax: new Vector2(),
    lensActive: false,
    // Con movimiento reducido la escena arranca en pausa: el tiempo se ve,
    // pero no se mueve hasta que la persona lo pida.
    paused: reduceMotion,
    moment: options.initialMoment,
    weatherKind: options.initialWeather,
    liveWeather: null as Weather | null,
    animationTime: 0,
    // En táctil la lupa se queda donde se levantó el dedo (null: al centro).
    lensAnchor: null as Vector2 | null,
    renderUntil: performance.now() + INITIAL_RENDER_MS,
  };

  const keepRendering = (milliseconds = INTERACTION_RENDER_MS) => {
    state.renderUntil = Math.max(state.renderUntil, performance.now() + milliseconds);
  };

  const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms });
  const terrain = new Mesh(geometry, material);
  scene.add(terrain);

  const sky = createSky(true);
  sky.resize(window.innerWidth, window.innerHeight, renderer.getPixelRatio());
  scene.add(sky.mesh);

  const soundscape = createSoundscape();
  const precipitation = createPrecipitation();
  precipitation.resize(window.innerWidth, window.innerHeight, renderer.getPixelRatio());
  scene.add(precipitation.mesh);

  // --- Cielo, luz y tiempo reales -------------------------------------------

  const centerLat = (meta.latMin + meta.latMax) / 2;
  const centerLon = (meta.lonMin + meta.lonMax) / 2;
  const now = () => state.moment ?? new Date();
  let atmosphere: Atmosphere = computeAtmosphere(now(), centerLat, centerLon);
  let visuals: WeatherVisuals = weatherVisuals(simulatedWeather('clear', now()), now(), true);

  const currentWeather = (): Weather => {
    if (state.weatherKind !== 'live') return simulatedWeather(state.weatherKind, now());
    return state.liveWeather ?? simulatedWeather('clear', now());
  };

  const describeWeatherSource = (weather: Weather) => {
    const strings = sceneStrings();
    if (state.weatherKind !== 'live') return `${strings.simulation} · ${visuals.label}`;
    if (weather.source === 'simulado') return strings.noLiveData;
    return `${WEATHER_STATION.name} · ${visuals.label}`;
  };

  const applyConditions = () => {
    const date = now();
    const weather = currentWeather();
    atmosphere = computeAtmosphere(date, centerLat, centerLon);
    visuals = weatherVisuals(weather, date, state.moment !== null);

    // Las nubes apagan la luz, agrisan el cielo y tapan sol, luna y estrellas.
    const overcast = visuals.cloudCover;
    atmosphere = {
      ...atmosphere,
      zenith: atmosphere.zenith.clone().lerp(OVERCAST, overcast * 0.3),
      horizon: atmosphere.horizon.clone().lerp(OVERCAST, overcast * 0.35),
      glowAmount: atmosphere.glowAmount * (1 - 0.6 * overcast),
      stars: atmosphere.stars * (1 - overcast),
      veil: overcast,
    };

    uniforms.uLine.value.copy(atmosphere.line);
    uniforms.uGround.value.copy(atmosphere.ground);
    uniforms.uFog.value.copy(atmosphere.horizon);
    uniforms.uZenith.value.copy(atmosphere.zenith);
    uniforms.uWater.value.copy(atmosphere.water);
    uniforms.uLightDir.value.copy(atmosphere.lightDirection);
    uniforms.uLightStrength.value = atmosphere.lightStrength * (1 - CLOUD_DIMMING * overcast);

    uniforms.uSnowLine.value = visuals.snowLine;
    uniforms.uSnowCover.value = visuals.snowLine < NO_SNOW_LINE ? 1 : 0;
    uniforms.uFogBank.value = visuals.fog;
    uniforms.uFogLevel.value = visuals.fogLevel;
    uniforms.uFogTint.value.copy(atmosphere.horizon).lerp(new Color(0xaab4c0), 0.2 + 0.45 * uniforms.uLightStrength.value);
    uniforms.uWindDir.value.set(Math.sin(visuals.windToward), -Math.cos(visuals.windToward));
    uniforms.uWind.value = visuals.wind;
    uniforms.uRain.value = visuals.rain;

    const sunDegrees = (atmosphere.sun.altitude * 180) / Math.PI;
    const night = smoothstep(NIGHT_START_DEGREES, NIGHT_FULL_DEGREES, sunDegrees);
    uniforms.uNight.value = night;
    uniforms.uLightsOn.value = night * lightsActivity(date);

    const weatherText = describeWeatherSource(weather);
    options.readout.sky.forEach((element) => (element.textContent = atmosphere.label));
    options.readout.weather.forEach((element) => (element.textContent = weatherText));

    soundscape.update({
      wind: visuals.wind,
      rain: visuals.rain,
      snow: visuals.snow,
      night: uniforms.uNight.value,
      temperature: weather.temperature,
    });
    keepRendering();
  };

  const refreshLiveWeather = async () => {
    try {
      state.liveWeather = await fetchLiveWeather();
    } catch (error) {
      console.warn('Sin tiempo en directo:', error);
    }
    applyConditions();
  };

  applyConditions();
  refreshLiveWeather();
  const atmosphereTimer = window.setInterval(applyConditions, ATMOSPHERE_REFRESH_MS);
  const weatherTimer = window.setInterval(refreshLiveWeather, WEATHER_REFRESH_MS);

  // --- Geografía -----------------------------------------------------------

  const heightAt = (x: number, z: number): number | null => {
    const u = x / meta.widthKm + 0.5;
    const v = z / meta.depthKm + 0.5;
    if (u < 0 || u > 1 || v < 0 || v > 1) return null;
    const fx = u * (meta.cols - 1);
    const fy = v * (meta.rows - 1);
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const x1 = Math.min(x0 + 1, meta.cols - 1);
    const y1 = Math.min(y0 + 1, meta.rows - 1);
    const tx = fx - x0;
    const ty = fy - y0;
    const top = heights[y0 * meta.cols + x0] * (1 - tx) + heights[y0 * meta.cols + x1] * tx;
    const bottom = heights[y1 * meta.cols + x0] * (1 - tx) + heights[y1 * meta.cols + x1] * tx;
    return top * (1 - ty) + bottom * ty;
  };

  const groundY = (metres: number) =>
    ((metres - meta.minHeight) / 1000) * VERTICAL_EXAGGERATION * uniforms.uRise.value;

  const lonLatToWorld = (lon: number, lat: number): Vector3 => {
    const x = ((lon - meta.lonMin) / (meta.lonMax - meta.lonMin) - 0.5) * meta.widthKm;
    const z = ((meta.latMax - lat) / (meta.latMax - meta.latMin) - 0.5) * meta.depthKm;
    return new Vector3(x, 0, z);
  };

  const worldToLonLat = (x: number, z: number) => ({
    lon: meta.lonMin + (x / meta.widthKm + 0.5) * (meta.lonMax - meta.lonMin),
    lat: meta.latMax - (z / meta.depthKm + 0.5) * (meta.latMax - meta.latMin),
  });

  const waterAt = (x: number, z: number): number => {
    if (!waterPixels) return 0;
    const u = x / meta.widthKm + 0.5;
    const v = z / meta.depthKm + 0.5;
    if (u < 0 || u > 1 || v < 0 || v > 1) return 0;
    const px = Math.min(waterWidth - 1, Math.floor(u * waterWidth));
    const py = Math.min(waterHeight - 1, Math.floor(v * waterHeight));
    return waterPixels[(py * waterWidth + px) * 4] / 255;
  };

  const toNamedPlaces = (entries: Array<{ name: string; lat: number; lon: number }>) =>
    entries.map((entry) => ({ name: entry.name, world: lonLatToWorld(entry.lon, entry.lat) }));
  const namedWater = toNamedPlaces(options.waterNames);
  const namedVillages = toNamedPlaces(options.villageNames);

  const nearestName = (places: ReturnType<typeof toNamedPlaces>, x: number, z: number, radius: number): string => {
    let best = '';
    let bestDistance = radius;
    for (const place of places) {
      const distance = Math.hypot(place.world.x - x, place.world.z - z);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = place.name;
      }
    }
    return best;
  };

  // Sobre el agua manda el nombre de la lámina; si no, el del pueblo cercano.
  const placeNameAt = (x: number, z: number): string => {
    if (waterAt(x, z) > WATER_PICK_THRESHOLD) return nearestName(namedWater, x, z, WATER_NAME_RADIUS_KM);
    return nearestName(namedVillages, x, z, VILLAGE_NAME_RADIUS_KM);
  };

  // Ray marching sobre la rejilla de alturas: mucho más barato que lanzar un
  // Raycaster contra 240.000 triángulos en cada movimiento del ratón.
  const probe = new Vector3();
  const pickTerrain = (ray: Ray): { point: Vector3; metres: number } | null => {
    for (let t = 0; t < PICK_MAX_KM; t += PICK_STEP_KM) {
      ray.at(t, probe);
      const metres = heightAt(probe.x, probe.z);
      if (metres === null || probe.y > groundY(metres)) continue;
      let low = t - PICK_STEP_KM;
      let high = t;
      for (let i = 0; i < 12; i++) {
        const mid = (low + high) / 2;
        ray.at(mid, probe);
        const m = heightAt(probe.x, probe.z);
        if (m !== null && probe.y <= groundY(m)) high = mid;
        else low = mid;
      }
      ray.at(high, probe);
      return { point: probe.clone(), metres: heightAt(probe.x, probe.z) ?? metres };
    }
    return null;
  };

  // --- Vértices geodésicos ------------------------------------------------

  const vertexStates: VertexState[] = options.vertices.map((target) => {
    const world = lonLatToWorld(target.lon, target.lat);
    return { target, world, card: target.element.querySelector<HTMLElement>('.vertex-card'), placement: 0 };
  });

  const projected = new Vector3();
  // Primero se leen todas las medidas (obstáculos y tarjetas) y después se
  // escriben los estilos: alternar lecturas y escrituras forzaría a recalcular
  // la maquetación varias veces por fotograma.
  const updateVertexPositions = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const obstacles = obstacleRects(options.layout);
    const slots: Array<CardSlot & { vertex: VertexState }> = vertexStates.map((vertex) => {
      const metres = heightAt(vertex.world.x, vertex.world.z) ?? meta.minHeight;
      projected.set(vertex.world.x, groundY(metres) + VERTEX_LIFT_KM, vertex.world.z).project(camera);
      return {
        vertex,
        element: vertex.target.element,
        x: (projected.x + 1) * 0.5 * width,
        y: (1 - projected.y) * 0.5 * height,
        cardWidth: vertex.card?.offsetWidth ?? 0,
        cardHeight: vertex.card?.offsetHeight ?? 0,
        placement: vertex.placement,
      };
    });
    for (const slot of slots) {
      slot.element.style.transform = `translate3d(${slot.x.toFixed(1)}px, ${slot.y.toFixed(1)}px, 0)`;
    }
    const lift = width <= MOBILE_LAYOUT_MAX_WIDTH ? CARD_LIFT_MOBILE_PX : CARD_LIFT_PX;
    placeCards(slots, obstacles, width, height, lift);
    for (const slot of slots) slot.vertex.placement = slot.placement;
  };

  // Encuadre automático: misma orientación que el preajuste, pero distancia y
  // desplazamiento calculados para que las cumbres queden en el escenario libre.
  const homeTarget = framing.target.clone();
  const refit = () => {
    if (state.flying) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const summits = vertexStates.map((vertex) => {
      const metres = heightAt(vertex.world.x, vertex.world.z) ?? meta.minHeight;
      const fullHeight = ((metres - meta.minHeight) / 1000) * VERTICAL_EXAGGERATION;
      return new Vector3(vertex.world.x, fullHeight + VERTEX_LIFT_KM, vertex.world.z);
    });
    // El encuadre hecho a mano manda; el automático solo entra si no cabe.
    const fitted = presetFramingWorks(camera, framing.position, framing.target, summits, options.layout, width, height)
      ? { position: framing.position.clone(), target: framing.target.clone() }
      : fitCameraToStage(camera, framing.position, framing.target, summits, computeStage(options.layout, width, height), width, height);
    basePosition.copy(fitted.position);
    homeTarget.copy(fitted.target);
    lookTarget.copy(fitted.target);
    camera.position.copy(fitted.position);
    camera.lookAt(lookTarget);
    const distance = fitted.position.distanceTo(fitted.target);
    uniforms.uFogNear.value = distance * FOG_NEAR_FACTOR;
    uniforms.uFogFar.value = distance * FOG_FAR_FACTOR;
    keepRendering();
  };
  refit();
  // Las fuentes cambian la altura del titular: al cargar, se vuelve a encuadrar.
  document.fonts?.ready.then(refit);

  // Todas las transiciones activas, para poder cancelarlas al desmontar.
  const activeTweens = new Set<Tween>();
  const animate = <T extends object>(target: T, to: Partial<Record<keyof T, number>>, options: TweenOptions) => {
    const handle = tween(target, to, {
      ...options,
      onComplete: () => {
        activeTweens.delete(handle);
        options.onComplete?.();
      },
    });
    activeTweens.add(handle);
    return handle;
  };

  // El fundido a negro del vuelo se anima sobre este objeto y se vuelca al CSS.
  const fadeState = { opacity: 0 };
  const applyFade = () => {
    options.fade.style.opacity = String(fadeState.opacity);
  };

  let focusTween: Tween | null = null;
  const setFocus = (vertex: VertexState | null) => {
    focusTween?.cancel();
    if (vertex) {
      const metres = heightAt(vertex.world.x, vertex.world.z) ?? meta.minHeight;
      uniforms.uFocus.value.set(vertex.world.x, groundY(metres), vertex.world.z);
      soundscape.ping(metres);
    }
    keepRendering();
    focusTween = animate(uniforms.uFocusAmount, { value: vertex ? 1 : 0 }, {
      duration: reduceMotion ? 0 : 0.6,
      ease: ease.power2Out,
    });
  };

  const flyTo = (vertex: VertexState, onArrive: () => void) => {
    if (reduceMotion) {
      onArrive();
      return;
    }
    state.flying = true;
    soundscape.whoosh(FLIGHT_SECONDS);
    keepRendering(FLIGHT_SECONDS * 1000 + INTERACTION_RENDER_MS);
    const metres = heightAt(vertex.world.x, vertex.world.z) ?? meta.minHeight;
    const summit = new Vector3(vertex.world.x, groundY(metres), vertex.world.z);
    const approach = summit.clone().sub(camera.position).setY(0).normalize();
    const destination = summit.clone().addScaledVector(approach, -2.4).add(new Vector3(0, 0.9, 0));
    animate(camera.position, { x: destination.x, y: destination.y, z: destination.z }, {
      duration: FLIGHT_SECONDS,
      ease: ease.power3InOut,
    });
    animate(lookTarget, { x: summit.x, y: summit.y, z: summit.z }, { duration: FLIGHT_SECONDS, ease: ease.power3InOut });
    animate(fadeState, { opacity: 1 }, {
      duration: 0.5,
      delay: FLIGHT_SECONDS - 0.45,
      ease: ease.power1In,
      onUpdate: applyFade,
      onComplete: onArrive,
    });
  };

  const cleanups: Array<() => void> = [];
  const listen = <K extends keyof WindowEventMap>(
    target: Window | HTMLElement,
    type: K | string,
    handler: (event: any) => void,
  ) => {
    target.addEventListener(type, handler);
    cleanups.push(() => target.removeEventListener(type, handler));
  };

  for (const vertex of vertexStates) {
    const element = vertex.target.element;
    listen(element, 'pointerenter', () => setFocus(vertex));
    listen(element, 'pointerleave', () => setFocus(null));
    listen(element, 'focus', () => setFocus(vertex));
    listen(element, 'blur', () => setFocus(null));
    if (vertex.target.href) {
      const href = vertex.target.href;
      listen(element, 'click', (event: MouseEvent) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        flyTo(vertex, () => window.location.assign(href));
      });
    }
  }

  // Al volver con el botón "atrás", el navegador restaura la página tal como
  // la dejamos: en la cumbre y con el fundido a negro.
  listen(window, 'pageshow', (event: PageTransitionEvent) => {
    if (!event.persisted) return;
    state.flying = false;
    camera.position.copy(basePosition);
    lookTarget.copy(homeTarget);
    fadeState.opacity = 0;
    applyFade();
    keepRendering();
  });

  // --- Puntero, retícula y lectura de coordenadas --------------------------

  listen(window, 'pointermove', (event: PointerEvent) => {
    keepRendering();
    if (event.pointerType === 'touch') {
      state.lensAnchor = (state.lensAnchor ?? new Vector2()).set(event.clientX, event.clientY);
    }
    state.pointer.set(event.clientX, event.clientY);
    state.pointerInside = true;
    document.documentElement.classList.add('pointer-active');
    state.parallax.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * 2 - 1,
    );
    options.reticle.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  });
  listen(document.documentElement, 'pointerleave', () => {
    state.pointerInside = false;
    document.documentElement.classList.remove('pointer-active');
  });

  const ndc = new Vector2();
  const ray = new Ray();
  const updatePointerProbe = () => {
    if (!state.pointerInside) {
      uniforms.uPointerAmount.value += (0 - uniforms.uPointerAmount.value) * 0.08;
      return;
    }
    ndc.set((state.pointer.x / window.innerWidth) * 2 - 1, -(state.pointer.y / window.innerHeight) * 2 + 1);
    ray.origin.copy(camera.position);
    ray.direction.set(ndc.x, ndc.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const hit = pickTerrain(ray);
    const target = hit ? 1 : 0;
    uniforms.uPointerAmount.value += (target - uniforms.uPointerAmount.value) * 0.12;
    const place = hit ? placeNameAt(hit.point.x, hit.point.z) : '';
    if (options.readout.place.textContent !== place) options.readout.place.textContent = place;
    if (!hit) return;
    uniforms.uPointer.value.copy(hit.point);
    const { lon, lat } = worldToLonLat(hit.point.x, hit.point.z);
    options.readout.latitude.textContent = formatDms(lat, 'N', 'S');
    options.readout.longitude.textContent = formatDms(lon, 'E', sceneStrings().west);
    options.readout.elevation.textContent = `${Math.round(hit.metres).toLocaleString(sceneStrings().locale)} m`;
  };

  // --- Lente "Ver lo que no se ve" -----------------------------------------

  const annotations: Annotation[] = Array.from(document.querySelectorAll<HTMLElement>('[data-annotate]')).map(
    (source) => {
      const box = document.createElement('div');
      box.className = 'annotation';
      options.lensLayer.append(box);
      return { source, box, description: '' };
    },
  );

  const refreshAnnotationText = () => {
    for (const annotation of annotations) annotation.description = describeForScreenReader(annotation.source);
  };

  const lensRadiusPx = () =>
    finePointer ? LENS_RADIUS_PX : Math.min(window.innerWidth, window.innerHeight) * LENS_RADIUS_COARSE_RATIO;

  const lensCenter = new Vector2();

  // Los recuadros van dentro de la capa enmascarada (solo se ven dentro de la
  // lente); lo que dice el lector de pantalla va en una leyenda bajo la lente,
  // para que no la recorte la máscara.
  const updateAnnotations = () => {
    const radius = lensRadiusPx();
    const inside: string[] = [];
    for (const annotation of annotations) {
      const rect = annotation.source.getBoundingClientRect();
      annotation.box.style.transform = `translate3d(${rect.left - 6}px, ${rect.top - 6}px, 0)`;
      annotation.box.style.width = `${rect.width + 12}px`;
      annotation.box.style.height = `${rect.height + 12}px`;
      const nearestX = Math.max(rect.left, Math.min(lensCenter.x, rect.right));
      const nearestY = Math.max(rect.top, Math.min(lensCenter.y, rect.bottom));
      if (Math.hypot(nearestX - lensCenter.x, nearestY - lensCenter.y) < radius) inside.push(annotation.description);
    }
    const caption = inside.join('\n');
    if (options.lensCaption.textContent !== caption) options.lensCaption.textContent = caption;
    options.lensCaption.hidden = inside.length === 0;
    const below = lensCenter.y + radius + 14;
    const fitsBelow = below + 80 < window.innerHeight;
    options.lensCaption.style.transform = fitsBelow
      ? `translate3d(${lensCenter.x}px, ${below}px, 0) translateX(-50%)`
      : `translate3d(${lensCenter.x}px, ${lensCenter.y - radius - 14}px, 0) translate(-50%, -100%)`;
  };

  const updateLens = () => {
    const pixelRatio = renderer.getPixelRatio();
    if (finePointer && state.pointerInside) lensCenter.copy(state.pointer);
    else if (!finePointer && state.lensAnchor) lensCenter.copy(state.lensAnchor);
    else lensCenter.set(window.innerWidth / 2, window.innerHeight / 2);
    uniforms.uLensCenter.value.set(lensCenter.x * pixelRatio, (window.innerHeight - lensCenter.y) * pixelRatio);
    uniforms.uLensRadius.value = lensRadiusPx() * pixelRatio;
    options.lensLayer.style.setProperty('--lens-x', `${lensCenter.x}px`);
    options.lensLayer.style.setProperty('--lens-y', `${lensCenter.y}px`);
    options.lensLayer.style.setProperty('--lens-r', `${lensRadiusPx()}px`);
  };

  const setLens = (active: boolean) => {
    keepRendering();
    state.lensActive = active;
    options.lensToggle.setAttribute('aria-pressed', String(active));
    document.documentElement.classList.toggle('lens-on', active);
    options.lensLayer.hidden = !active;
    if (!active) options.lensCaption.hidden = true;
    refreshAnnotationText();
    animate(uniforms.uLensAmount, { value: active ? 1 : 0 }, { duration: reduceMotion ? 0 : 0.35, ease: ease.power2Out });
  };
  listen(options.lensToggle, 'click', () => setLens(!state.lensActive));

  // --- Bucle ---------------------------------------------------------------

  const desiredPosition = new Vector3();
  const right = new Vector3();

  const updateCamera = () => {
    if (state.flying) {
      camera.lookAt(lookTarget);
      return;
    }
    // La deriva va con el reloj de animación: al pausar, la cámara se queda.
    const drift = reduceMotion ? 0 : Math.sin(state.animationTime * DRIFT_SPEED) * DRIFT_KM;
    const parallaxX = reduceMotion ? 0 : state.parallax.x * PARALLAX_KM;
    const parallaxY = reduceMotion ? 0 : state.parallax.y * PARALLAX_KM * 0.4;
    right.subVectors(lookTarget, basePosition).cross(camera.up).normalize();
    desiredPosition.copy(basePosition).addScaledVector(right, drift + parallaxX);
    desiredPosition.y += parallaxY;
    camera.position.lerp(desiredPosition, reduceMotion ? 1 : CAMERA_EASING);
    camera.lookAt(lookTarget);
  };

  // El cielo se apoya en la silueta del terreno en la dirección de la mirada:
  // el punto más alto en pantalla a lo largo de esa línea hace de horizonte.
  const viewForward = new Vector3();
  const horizonProbe = new Vector3();
  const updateSky = (seconds: number) => {
    viewForward.subVectors(lookTarget, camera.position).setY(0).normalize();
    const viewAzimuth = Math.atan2(viewForward.x, -viewForward.z);
    let horizon = 0;
    for (let t = 0; t < PICK_MAX_KM; t += HORIZON_STEP_KM) {
      horizonProbe.copy(lookTarget).addScaledVector(viewForward, t);
      const metres = heightAt(horizonProbe.x, horizonProbe.z);
      if (metres === null) break;
      horizonProbe.y = groundY(metres);
      horizon = Math.max(horizon, (horizonProbe.project(camera).y + 1) / 2);
    }
    sky.update(atmosphere, viewAzimuth, Math.min(Math.max(horizon, 0.4), 0.95), seconds);

    // La lluvia y la nieve se inclinan según el viento visto desde la cámara.
    const windX = Math.sin(visuals.windToward);
    const windZ = -Math.cos(visuals.windToward);
    const slant = (windX * -viewForward.z + windZ * viewForward.x) * visuals.wind * RAIN_SLANT_FACTOR;
    precipitation.update(visuals.rain, visuals.snow, slant, seconds);
  };

  let resolutionSampleMs = 0;
  let resolutionSampleFrames = 0;
  const adaptResolution = (frameMs: number) => {
    resolutionSampleMs += frameMs;
    resolutionSampleFrames += 1;
    if (resolutionSampleFrames < RESOLUTION_SAMPLE_FRAMES) return;
    const average = resolutionSampleMs / resolutionSampleFrames;
    resolutionSampleMs = 0;
    resolutionSampleFrames = 0;
    let next = pixelRatio;
    if (average > SLOW_FRAME_MS) next = Math.max(MIN_PIXEL_RATIO, pixelRatio - PIXEL_RATIO_STEP);
    else if (average < FAST_FRAME_MS) next = Math.min(maxPixelRatio, pixelRatio + PIXEL_RATIO_STEP);
    if (next === pixelRatio) return;
    pixelRatio = next;
    renderer.setPixelRatio(pixelRatio);
    resize();
  };

  let frame = 0;
  let lastFrame = performance.now();
  let lastRenderedFrame = 0;
  const tick = () => {
    frame = requestAnimationFrame(tick);
    const frameTime = performance.now();
    if (!state.paused) state.animationTime += Math.min((frameTime - lastFrame) / 1000, MAX_FRAME_SECONDS);
    lastFrame = frameTime;
    const animating = !state.paused || state.flying || frameTime < state.renderUntil;
    if (!animating) {
      lastRenderedFrame = 0;
      return;
    }
    // Solo se mide el rendimiento cuando se pinta fotograma a fotograma.
    if (lastRenderedFrame && !document.hidden) adaptResolution(frameTime - lastRenderedFrame);
    lastRenderedFrame = frameTime;
    uniforms.uTime.value = state.animationTime;
    updateCamera();
    updateSky(state.animationTime);
    updatePointerProbe();
    updateVertexPositions();
    if (state.lensActive) {
      updateLens();
      updateAnnotations();
    }
    renderer.render(scene, camera);
  };

  const resize = () => {
    keepRendering();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    sky.resize(window.innerWidth, window.innerHeight, renderer.getPixelRatio());
    precipitation.resize(window.innerWidth, window.innerHeight, renderer.getPixelRatio());
    // Al girar el móvil o cambiar el tamaño, se vuelve a encuadrar.
    framing = framingFor(window.innerWidth, window.innerHeight);
    refit();
  };
  listen(window, 'resize', resize);

  // --- Entrada: el mapa se levanta mientras se dibujan las curvas ----------

  if (!reduceMotion) {
    animate(uniforms.uRise, { value: 1 }, { duration: RISE_SECONDS, ease: ease.power3Out });
    animate(uniforms.uReveal, { value: meta.maxHeight + 50 }, {
      duration: REVEAL_SECONDS,
      ease: ease.power2InOut,
      onComplete: () => {
        uniforms.uRevealDone.value = 1;
      },
    });
  }

  camera.updateMatrixWorld();
  await renderer.compileAsync(scene, camera);

  document.documentElement.classList.add('survey-ready');
  tick();

  return {
    setMoment(moment) {
      state.moment = moment;
      applyConditions();
    },
    setWeather(kind) {
      state.weatherKind = kind;
      applyConditions();
    },
    setPaused(paused) {
      state.paused = paused;
      keepRendering();
    },
    isPaused() {
      return state.paused;
    },
    async setSound(enabled) {
      await soundscape.setEnabled(enabled);
    },
    isSoundOn() {
      return soundscape.isEnabled();
    },
    destroy() {
      cancelAnimationFrame(frame);
      window.clearInterval(atmosphereTimer);
      window.clearInterval(weatherTimer);
      precipitation.dispose();
      soundscape.dispose();
      cleanups.forEach((cleanup) => cleanup());
      activeTweens.forEach((handle) => handle.cancel());
      annotations.forEach(({ box }) => box.remove());
      geometry.dispose();
      material.dispose();
      waterMask.dispose();
      villageLights.dispose();
      sky.dispose();
      renderer.dispose();
    },
  };
}
