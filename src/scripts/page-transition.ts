// Transición entre páginas: "la marea y las islas". Al salir, una marea
// oscura se extiende desde donde has hecho clic, con su orilla dibujada en
// curvas de nivel doradas, hasta cubrir la página. Al llegar, la página nueva
// emerge como un archipiélago: primero los picos, luego las laderas, a medida
// que baja el nivel del agua. Es un shader a pantalla completa (WebGL 1, sin
// three.js) que solo existe durante la transición.
//
// La página nueva sabe que viene de una transición por sessionStorage: un
// script en línea en el <head> (SeoHead.astro) la tapa antes del primer
// pintado (clase pt-arriving) y este módulo la destapa. Con movimiento
// reducido, sin WebGL o con un clic con modificadores, se navega como siempre.

const STORAGE_KEY = 'jp:transition';
const COVER_SECONDS = 0.62;
const REVEAL_SECONDS = 1.05;
// Si la navegación no llega a producirse (descarga, error de red), la página
// no se queda tapada.
const STUCK_COVER_MS = 5000;
const MAX_PIXEL_RATIO = 1.5;
const INK = [11 / 255, 15 / 255, 20 / 255];
const GOLD = [232 / 255, 200 / 255, 114 / 255];

type Mode = 'cover' | 'reveal';

interface Arrival {
  at: number;
  // Fracciones de la pantalla (0-1) del punto de origen.
  x: number;
  y: number;
  seed: number;
}

const vertexSource = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const fragmentSource = `
  #extension GL_OES_standard_derivatives : enable
  precision highp float;
  uniform vec2 uResolution;
  uniform vec2 uOrigin;
  uniform float uProgress;
  uniform float uReveal;
  uniform float uSeed;
  uniform vec3 uInk;
  uniform vec3 uGold;

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
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = p * 2.07 + 13.1;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = gl_FragCoord.xy;
    vec2 q = p / max(uResolution.x, uResolution.y);
    vec2 corner = max(uOrigin, uResolution - uOrigin);
    float radial = length(p - uOrigin) / length(corner);
    float terrain = fbm(q * 3.4 + uSeed);

    // Un mismo campo de alturas para las dos fases: cubierto donde el campo
    // queda por debajo del nivel del agua. Al salir, el campo crece con la
    // distancia al clic (la marea avanza desde ahí); al llegar, es un relieve
    // con sus picos cerca del clic (las islas asoman primero allí).
    float field;
    float level;
    if (uReveal < 0.5) {
      field = radial + (terrain - 0.5) * 0.42;
      level = mix(-0.25, 1.45, uProgress);
    } else {
      field = (1.0 - radial) * 0.55 + terrain * 0.8;
      level = mix(1.45, -0.05, uProgress);
    }

    float width = max(fwidth(field), 1e-5);
    float depth = level - field;
    float covered = clamp(depth / width + 0.5, 0.0, 1.0);

    // Curvas de nivel bajo el agua, más vivas cerca de la orilla.
    float spacing = 0.045;
    float isoDistance = abs(fract(field / spacing + 0.5) - 0.5) * spacing / width;
    float iso = 1.0 - smoothstep(0.4, 1.4, isoDistance);
    float nearShore = 1.0 - smoothstep(0.0, 0.2, depth);
    float shore = 1.0 - smoothstep(0.8, 2.2, abs(depth) / width);

    vec3 color = uInk;
    color = mix(color, uGold, iso * nearShore * 0.6 * covered);
    color += uGold * exp(-max(depth, 0.0) * 22.0) * 0.18 * covered;
    color = mix(color, uGold * 1.1, shore);
    float alpha = max(covered, shore);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
// Al llegar, curva suave: la fase de las islas es la que se tiene que ver.
const easeOut = (t: number) => 1 - (1 - t) ** 2;

// Marca la página siguiente para que llegue destapándose. La usan también
// los recorridos propios de la home (vuelo a una cumbre, fin del mundo), que
// tapan la página a su manera antes de navegar.
export function markArrival(origin?: { x: number; y: number }): void {
  const arrival: Arrival = {
    at: Date.now(),
    x: origin ? origin.x / window.innerWidth : 0.5,
    y: origin ? origin.y / window.innerHeight : 0.5,
    seed: Math.random() * 40,
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(arrival));
  } catch {
    // Sin sessionStorage (modo privado estricto) la página llega sin más.
  }
}

function readArrival(): Arrival | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Arrival) : null;
  } catch {
    return null;
  }
}

interface Overlay {
  element: HTMLCanvasElement;
  // Origen (píxeles CSS desde arriba a la izquierda) y semilla del relieve.
  prepare(origin: { x: number; y: number }, seed: number): void;
  play(mode: Mode, seconds: number): Promise<void>;
  drawFrame(mode: Mode, progress: number): void;
  remove(): void;
}

function createOverlay(): Overlay | null {
  const canvas = document.createElement('canvas');
  canvas.className = 'page-transition';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl || !gl.getExtension('OES_standard_derivatives')) return null;

  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  // Un triángulo que cubre toda la pantalla.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const uResolution = uniform('uResolution');
  const uOrigin = uniform('uOrigin');
  const uProgress = uniform('uProgress');
  const uReveal = uniform('uReveal');
  const uSeed = uniform('uSeed');
  gl.uniform3fv(uniform('uInk'), INK);
  gl.uniform3fv(uniform('uGold'), GOLD);

  const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  const resize = () => {
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
  };
  resize();
  document.body.append(canvas);

  let frame = 0;
  const drawFrame = (mode: Mode, progress: number) => {
    gl.uniform1f(uReveal, mode === 'reveal' ? 1 : 0);
    gl.uniform1f(uProgress, progress);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  return {
    element: canvas,
    drawFrame,
    prepare(origin, seed) {
      // WebGL cuenta las filas desde abajo.
      gl.uniform2f(uOrigin, origin.x * ratio, canvas.height - origin.y * ratio);
      gl.uniform1f(uSeed, seed);
    },
    play(mode, seconds) {
      const ease = mode === 'cover' ? easeInOut : easeOut;
      const start = performance.now();
      return new Promise((resolve) => {
        const step = (now: number) => {
          const progress = Math.min((now - start) / (seconds * 1000), 1);
          drawFrame(mode, ease(progress));
          if (progress < 1) frame = requestAnimationFrame(step);
          else resolve();
        };
        drawFrame(mode, 0);
        frame = requestAnimationFrame(step);
      });
    },
    remove() {
      cancelAnimationFrame(frame);
      canvas.remove();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}

// Solo enlaces que llevan a otra página de esta web, en esta pestaña.
function transitionTarget(event: MouseEvent): HTMLAnchorElement | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!link || link.hasAttribute('download') || link.dataset.transition === 'none') return null;
  if (link.target && link.target !== '_self') return null;
  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  // Archivos (PDF, imágenes): se descargan o se abren aparte.
  if (/\.[a-z0-9]{2,5}$/i.test(url.pathname) && !url.pathname.endsWith('.html')) return null;
  // Un ancla de la misma página es un desplazamiento, no un cambio de página.
  if (url.pathname === window.location.pathname && url.search === window.location.search) return null;
  return link;
}

let navigating = false;
let overlay: Overlay | null = null;

const clearOverlay = () => {
  overlay?.remove();
  overlay = null;
  navigating = false;
  document.documentElement.classList.remove('pt-arriving');
};

async function leave(event: MouseEvent): Promise<void> {
  const link = transitionTarget(event);
  if (!link || navigating) return;
  overlay = createOverlay();
  if (!overlay) return;
  event.preventDefault();
  navigating = true;
  // Con teclado (Intro) no hay coordenadas: la marea sale del propio enlace.
  const fromPointer = event.detail > 0;
  const rect = link.getBoundingClientRect();
  const origin = fromPointer
    ? { x: event.clientX, y: event.clientY }
    : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  overlay.prepare(origin, Math.random() * 40);
  await overlay.play('cover', COVER_SECONDS);
  markArrival(origin);
  window.location.assign(link.href);
  window.setTimeout(clearOverlay, STUCK_COVER_MS);
}

async function arrive(): Promise<void> {
  const root = document.documentElement;
  if (!root.classList.contains('pt-arriving')) return;
  const arrival = readArrival();
  overlay = arrival && !reducedMotion() ? createOverlay() : null;
  if (!overlay || !arrival) {
    root.classList.remove('pt-arriving');
    return;
  }
  // El lienzo pinta su primer fotograma (todo cubierto) antes de quitar la
  // tapa del CSS: los dos cambios llegan juntos a pantalla, sin parpadeo.
  overlay.prepare({ x: arrival.x * window.innerWidth, y: arrival.y * window.innerHeight }, arrival.seed);
  overlay.drawFrame('reveal', 0);
  // Mientras se destapa, los clics pasan a la página.
  overlay.element.style.pointerEvents = 'none';
  root.classList.remove('pt-arriving');
  await overlay.play('reveal', REVEAL_SECONDS);
  clearOverlay();
}

let initialised = false;

export function initPageTransitions(): void {
  if (initialised) return;
  initialised = true;
  arrive();
  if (reducedMotion()) return;
  document.addEventListener('click', (event) => {
    leave(event);
  });
  // Al volver con "atrás", el navegador restaura la página tal como se fue:
  // tapada por la marea. Se destapa.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) clearOverlay();
  });
}
