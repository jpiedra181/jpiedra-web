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
import { setSceneLanguage } from './survey/strings';
import { computeAtmosphere, type Atmosphere } from './survey/atmosphere';
import { createSky } from './survey/sky';
import { createPrecipitation } from './survey/precipitation';
import { createSoundscape } from './survey/soundscape';
import { createMeteor } from './survey/meteor';
import { markArrival } from './page-transition';
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

// El sol avanza un cuarto de grado por minuto: refrescar la luz cada minuto
// basta para que el atardecer se vea pasar sin recalcular en cada fotograma.
const ATMOSPHERE_REFRESH_MS = 60_000;
const HORIZON_STEP_KM = 0.25;

const WEATHER_REFRESH_MS = 15 * 60_000;
const NO_SNOW_LINE = 99_999;
const OVERCAST = new Color(0x3a4250);
// Cuánto apagan las nubes la luz del sol o de la luna con el cielo cubierto.
const CLOUD_DIMMING = 0.35;
const RAIN_SLANT_FACTOR = 0.45;
const MAX_FRAME_SECONDS = 0.1;

// Rendimiento. Con el movimiento en pausa solo se pinta mientras algo cambia
// (cursor, vuelo, fin del mundo); en reposo la GPU no trabaja.
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

// Fin del mundo (menos de 4 s en total; lo pide la persona con un botón).
// El meteorito entra por arriba a la derecha, cae acelerando, y la onda del
// impacto barre la sierra mientras el terreno se desmorona detrás de ella.
const METEOR_APPROACH_SECONDS = 1.4;
const SHOCK_SECONDS = 2.1;
const SHOCK_RADIUS_KM = 24;
const SHOCK_LIFT_KM = 0.9;
const CRATER_DEPTH_KM = 1.3;
const COLLAPSE_DELAY_SECONDS = 0.45;
const COLLAPSE_SECONDS = 1.6;
const DOOM_FADE_DELAY_SECONDS = 1.55;
const DOOM_FADE_SECONDS = 0.8;
const METEOR_TRAIL_KM = 5;
// Dónde cae: el punto del terreno bajo esta posición de la pantalla (NDC),
// algo por encima del centro para que el cráter quede entre las cumbres.
const IMPACT_SCREEN = new Vector2(0.08, 0.12);
// De dónde viene, respecto al impacto: derecha de la cámara, arriba y fondo.
const METEOR_FROM_RIGHT_KM = 8;
const METEOR_FROM_UP_KM = 10;
const METEOR_FROM_BACK_KM = 7;
const SHAKE_APPROACH_KM = 0.05;
const SHAKE_IMPACT_KM = 0.42;
const SHAKE_DECAY_SECONDS = 1.6;

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
  // Idioma de los textos que genera la escena (nombres bajo el cursor).
  lang?: 'es' | 'en';
  heightsUrl: string;
  waterMaskUrl: string;
  meta: TerrainMeta;
  vertices: SurveyVertexTarget[];
  villagesUrl: string;
  // Momento fijo (?momento=…) o null para la hora real.
  initialMoment: Date | null;
  initialWeather: WeatherKind;
  reticle: HTMLElement;
  fade: HTMLElement;
  layout: LayoutElements;
}

// Avisos del fin del mundo para lo que no es WebGL (fogonazo, cielo rojo y
// los textos de la página que salen volando).
export interface DoomHooks {
  onLaunch?(approachSeconds: number): void;
  onImpact?(): void;
}

export interface SurveyScene {
  setMoment(moment: Date | null): void;
  setWeather(kind: WeatherKind): void;
  setPaused(paused: boolean): void;
  isPaused(): boolean;
  setSound(enabled: boolean): Promise<void>;
  isSoundOn(): boolean;
  // Lanza el meteorito; se resuelve con la pantalla ya a oscuras.
  destroyWorld(hooks?: DoomHooks): Promise<void>;
  destroy(): void;
}

interface VertexState {
  target: SurveyVertexTarget;
  world: Vector3;
  card: HTMLElement | null;
  placement: number;
}

const vertexShader = /* glsl */ `
  attribute float aHeight;
  uniform float uRise;
  uniform float uMinHeight;
  uniform float uExaggeration;
  uniform vec3 uImpact;
  uniform float uShock;
  uniform float uShockLift;
  uniform float uCrater;
  uniform float uCollapse;
  varying float vHeight;
  varying vec3 vWorld;
  varying vec2 vUv;

  void main() {
    vHeight = aHeight;
    vUv = uv;
    vec3 displaced = position;
    displaced.y = (aHeight - uMinHeight) / 1000.0 * uExaggeration * uRise;

    // Fin del mundo: la onda levanta el terreno a su paso, el impacto abre un
    // cráter y, detrás de la onda, el suelo se parte en bloques de ~0,7 km que
    // se hunden cada uno a su ritmo (un hash por bloque).
    if (uShockLift > 0.0 || uCrater > 0.0 || uCollapse > 0.0) {
      float impactDistance = distance(position.xz, uImpact.xz);
      float wave = exp(-pow((impactDistance - uShock) / 0.8, 2.0)) * uShockLift;
      float crater = (1.0 - smoothstep(0.0, 2.8, impactDistance)) * uCrater;
      float shard = fract(sin(dot(floor(position.xz / 0.7), vec2(12.9898, 78.233))) * 43758.5453);
      float collapsed = 1.0 - smoothstep(uCollapse - 3.0, uCollapse, impactDistance);
      displaced.y += wave - crater - collapsed * (0.5 + shard * 1.4);
    }

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
  uniform float uMinHeight;
  uniform float uMaxHeight;
  uniform float uReveal;
  uniform float uRevealDone;
  uniform vec3 uPointer;
  uniform float uPointerAmount;
  uniform vec3 uFocus;
  uniform float uFocusAmount;
  uniform vec3 uImpact;
  uniform float uShock;
  uniform float uShockGlow;
  uniform float uHeat;
  uniform float uDoom;
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

    // Fin del mundo: por donde ha pasado la onda, las curvas arden en brasa
    // (con su parpadeo), el cráter queda al rojo blanco y el frente de la onda
    // es un anillo de luz. Al final todo se apaga hacia el fondo.
    if (uHeat > 0.0 || uShockGlow > 0.0 || uDoom > 0.0) {
      float impactDistance = distance(vWorld.xz, uImpact.xz);
      float scorched = (1.0 - smoothstep(uShock - 0.6, uShock + 0.15, impactDistance)) * uHeat;
      float flicker = 0.75 + 0.25 * sin(uTime * 23.0 + vWorld.x * 31.0 + vWorld.z * 17.0);
      vec3 ember = vec3(1.0, 0.36, 0.07);
      vec3 burnt = uGround * 0.4 + ember * (0.06 + clamp(lines, 0.0, 1.0) * 1.7 * flicker);
      color = mix(color, burnt, scorched);
      color += vec3(1.0, 0.62, 0.26) * (1.0 - smoothstep(0.0, 2.2, impactDistance)) * uHeat * 1.4;
      float shockRing = exp(-pow((impactDistance - uShock) / 0.22, 2.0)) * uShockGlow;
      color += vec3(1.0, 0.82, 0.55) * shockRing * 1.6;
      color = mix(color, uGround, uDoom);
    }

    float fog = smoothstep(uFogNear, uFogFar, distance(cameraPosition, vWorld));
    float edge = smoothstep(0.0, 0.07, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
    color = mix(uFog, color, (1.0 - fog) * edge);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// Cede el hilo principal entre pasos pesados del arranque: así el navegador
// puede pintar y atender al usuario en vez de bloquearse en una tarea larga.
const yieldToBrowser = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

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

export async function initSurveyScene(options: SurveySceneOptions): Promise<SurveyScene> {
  const { canvas, meta } = options;
  setSceneLanguage(options.lang ?? 'es');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  // La máscara se muestrea con las mismas UV del terreno, fila 0 = norte.
  const waterMask = new TextureLoader().load(options.waterMaskUrl);
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
    uImpact: { value: new Vector3() },
    uShock: { value: 0 },
    uShockLift: { value: 0 },
    uShockGlow: { value: 0 },
    uCrater: { value: 0 },
    uCollapse: { value: 0 },
    uHeat: { value: 0 },
    uDoom: { value: 0 },
    uFogNear: { value: 22 },
    uFogFar: { value: 46 },
  };

  const state = {
    flying: false,
    destroying: false,
    // Temblor de cámara del fin del mundo, en km.
    shake: 0,
    pointer: new Vector2(window.innerWidth / 2, window.innerHeight / 2),
    pointerInside: false,
    parallax: new Vector2(),
    // Con movimiento reducido la escena arranca en pausa: el tiempo se ve,
    // pero no se mueve hasta que la persona lo pida.
    paused: reduceMotion,
    moment: options.initialMoment,
    weatherKind: options.initialWeather,
    liveWeather: null as Weather | null,
    animationTime: 0,
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

  // El tiempo y la luz ya no se escriben en pantalla (la home se aligeró de
  // datos): se ven en la propia sierra.
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
  // Con duración 0 (movimiento reducido) la transición termina dentro de la
  // propia llamada a tween(), antes de que exista su handle: por eso se mira
  // si ya acabó en vez de usar el handle dentro de onComplete.
  const animate = <T extends object>(target: T, to: Partial<Record<keyof T, number>>, options: TweenOptions) => {
    let finished = false;
    let handle: Tween | undefined;
    handle = tween(target, to, {
      ...options,
      onComplete: () => {
        finished = true;
        if (handle) activeTweens.delete(handle);
        options.onComplete?.();
      },
    });
    if (!finished) activeTweens.add(handle);
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
        // El vuelo tapa la página con su propio fundido; la siguiente llega
        // destapándose con la transición de siempre (page-transition.ts).
        flyTo(vertex, () => {
          markArrival();
          window.location.assign(href);
        });
      });
    }
  }

  // Al volver con el botón "atrás", el navegador restaura la página tal como
  // la dejamos: en la cumbre y con el fundido a negro.
  listen(window, 'pageshow', (event: PageTransitionEvent) => {
    if (!event.persisted) return;
    // Tras el fin del mundo no queda sierra que restaurar: se carga de nuevo.
    if (state.destroying) {
      window.location.reload();
      return;
    }
    state.flying = false;
    camera.position.copy(basePosition);
    lookTarget.copy(homeTarget);
    fadeState.opacity = 0;
    applyFade();
    keepRendering();
  });

  // --- Puntero y retícula ----------------------------------------------------
  // La retícula es solo el cursor del mapa: no da datos (lo que solo da el
  // ratón tendría que darlo también el teclado, WCAG 2.1.1). Se esconde sobre
  // textos y controles para no tapar lo que se lee, y con Escape hasta el
  // siguiente movimiento (WCAG 1.4.13).

  const interfaceBlocks = [...options.layout.obstacles, ...vertexStates.flatMap((vertex) => (vertex.card ? [vertex.card] : []))];
  const overInterface = (x: number, y: number) =>
    interfaceBlocks.some((block) => {
      const r = block.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });

  listen(window, 'pointermove', (event: PointerEvent) => {
    keepRendering();
    state.pointer.set(event.clientX, event.clientY);
    state.pointerInside = true;
    document.documentElement.classList.add('pointer-active');
    document.documentElement.classList.toggle('reticle-off', overInterface(event.clientX, event.clientY));
    state.parallax.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * 2 - 1,
    );
    options.reticle.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  });
  listen(window, 'keydown', (event: KeyboardEvent) => {
    if (event.key === 'Escape') document.documentElement.classList.add('reticle-off');
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
    if (hit) uniforms.uPointer.value.copy(hit.point);
  };

  // --- Bucle ---------------------------------------------------------------

  const desiredPosition = new Vector3();
  const right = new Vector3();

  // El temblor del fin del mundo va encima de la posición suavizada y se
  // retira antes de calcular la siguiente: así no se acumula fotograma a
  // fotograma ni descoloca la cámara cuando termina.
  const shakeOffset = new Vector3();
  const shakenTarget = new Vector3();
  const jitter = () => Math.random() * 2 - 1;

  const updateCamera = () => {
    camera.position.sub(shakeOffset);
    shakeOffset.set(0, 0, 0);
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
    if (state.shake <= 0) {
      camera.lookAt(lookTarget);
      return;
    }
    shakeOffset.set(jitter(), jitter() * 0.6, jitter()).multiplyScalar(state.shake);
    camera.position.add(shakeOffset);
    camera.lookAt(shakenTarget.copy(lookTarget).addScaledVector(shakeOffset, 0.5));
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

  // --- Fin del mundo ---------------------------------------------------------

  const impactPoint = (): Vector3 => {
    ray.origin.copy(camera.position);
    ray.direction.set(IMPACT_SCREEN.x, IMPACT_SCREEN.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const hit = pickTerrain(ray);
    if (hit) return hit.point;
    const metres = heightAt(homeTarget.x, homeTarget.z) ?? meta.minHeight;
    return new Vector3(homeTarget.x, groundY(metres), homeTarget.z);
  };

  let doom: Promise<void> | null = null;
  const destroyWorld = (hooks: DoomHooks = {}): Promise<void> => {
    if (doom) return doom;
    state.destroying = true;
    setFocus(null);
    doom = new Promise<void>((resolve) => {
      // Con movimiento reducido no hay meteorito: la sierra se apaga y ya.
      if (reduceMotion) {
        animate(fadeState, { opacity: 1 }, { duration: 0.35, onUpdate: applyFade, onComplete: resolve });
        return;
      }
      keepRendering((METEOR_APPROACH_SECONDS + DOOM_FADE_DELAY_SECONDS + DOOM_FADE_SECONDS) * 1000 + 500);

      const impact = impactPoint();
      uniforms.uImpact.value.copy(impact);
      const forward = new Vector3().subVectors(lookTarget, camera.position).setY(0).normalize();
      const rightward = new Vector3().crossVectors(forward, camera.up).normalize();
      const start = impact
        .clone()
        .addScaledVector(rightward, METEOR_FROM_RIGHT_KM)
        .addScaledVector(forward, METEOR_FROM_BACK_KM);
      start.y += METEOR_FROM_UP_KM;
      const direction = new Vector3().subVectors(impact, start).normalize();

      const meteor = createMeteor(scene, impact, isMobile);
      cleanups.push(() => meteor.dispose());
      meteor.setPixelRatio(renderer.getPixelRatio());
      const flight = { progress: 0 };
      const head = new Vector3();
      const placeMeteor = () => {
        head.lerpVectors(start, impact, flight.progress);
        // La estela crece al arrancar: así no aparece entera de golpe.
        meteor.setFlight(head, direction, METEOR_TRAIL_KM * Math.min(1, 0.2 + flight.progress * 3), camera);
      };

      const strike = () => {
        meteor.setVisible(false);
        hooks.onImpact?.();
        soundscape.impact();
        state.shake = SHAKE_IMPACT_KM;
        animate(state, { shake: 0 }, { duration: SHAKE_DECAY_SECONDS, ease: ease.power2Out });

        const debrisClock = { seconds: 0 };
        animate(debrisClock, { seconds: 3 }, {
          duration: 3,
          ease: ease.linear,
          onUpdate: () => meteor.setDebrisTime(debrisClock.seconds),
        });

        uniforms.uHeat.value = 1;
        uniforms.uShockGlow.value = 1;
        uniforms.uShockLift.value = SHOCK_LIFT_KM;
        animate(uniforms.uShock, { value: SHOCK_RADIUS_KM }, { duration: SHOCK_SECONDS, ease: ease.power2Out });
        animate(uniforms.uShockLift, { value: 0 }, { duration: SHOCK_SECONDS, ease: ease.power1In });
        animate(uniforms.uShockGlow, { value: 0 }, { duration: SHOCK_SECONDS, ease: ease.power1In });
        animate(uniforms.uCrater, { value: CRATER_DEPTH_KM }, { duration: 0.5, ease: ease.power3Out });
        animate(uniforms.uCollapse, { value: SHOCK_RADIUS_KM }, {
          duration: COLLAPSE_SECONDS,
          delay: COLLAPSE_DELAY_SECONDS,
          ease: ease.power2InOut,
        });
        animate(uniforms.uDoom, { value: 1 }, {
          duration: DOOM_FADE_SECONDS,
          delay: DOOM_FADE_DELAY_SECONDS - 0.3,
          ease: ease.power1In,
        });
        animate(fadeState, { opacity: 1 }, {
          duration: DOOM_FADE_SECONDS,
          delay: DOOM_FADE_DELAY_SECONDS,
          ease: ease.power1In,
          onUpdate: applyFade,
          onComplete: resolve,
        });
      };

      placeMeteor();
      hooks.onLaunch?.(METEOR_APPROACH_SECONDS);
      soundscape.meteor(METEOR_APPROACH_SECONDS);
      animate(state, { shake: SHAKE_APPROACH_KM }, { duration: METEOR_APPROACH_SECONDS, ease: ease.power1In });
      animate(flight, { progress: 1 }, {
        duration: METEOR_APPROACH_SECONDS,
        ease: ease.power1In,
        onUpdate: placeMeteor,
        onComplete: strike,
      });
    });
    return doom;
  };

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
    destroyWorld,
    destroy() {
      cancelAnimationFrame(frame);
      window.clearInterval(atmosphereTimer);
      window.clearInterval(weatherTimer);
      precipitation.dispose();
      soundscape.dispose();
      cleanups.forEach((cleanup) => cleanup());
      activeTweens.forEach((handle) => handle.cancel());
      geometry.dispose();
      material.dispose();
      waterMask.dispose();
      villageLights.dispose();
      sky.dispose();
      renderer.dispose();
    },
  };
}
