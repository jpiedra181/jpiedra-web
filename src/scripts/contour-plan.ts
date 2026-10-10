// El plano del hero de la versión clásica. En escritorio se inclina con el
// ratón como una maqueta sobre la mesa, se tumba más al hacer scroll y una
// retícula de topógrafo da la cota y las coordenadas reales del punto bajo el
// cursor, con la curva de esa cota encendida. La misma lectura se hace con
// teclado desde .hero-explorer (flechas). En móvil solo baja con un parallax.
// El plano es decorativo (aria-hidden): el titular y el texto cuentan lo mismo
// sin él; la lectura de cotas se anuncia desde el explorador.
//
// Solo se mueven capas enteras (transform de .hero-map-tilt): el SVG no se
// vuelve a pintar. Mover las cotas una a una costaba más de lo que aguanta
// una GPU de escritorio a 60 fps (medido), y en un móvil, mucho más.

// Inclinación extra con el ratón, en grados, a cada lado del reposo.
const POINTER_TILT_X_DEG = 5;
const POINTER_TILT_Y_DEG = 6;
// Al salir del hero el plano se tumba más y baja más despacio que la página.
const SCROLL_TILT_DEG = 22;
const SCROLL_PARALLAX = 0.22;
// Fracción del camino que se recorre en cada fotograma a 60 fps.
const SMOOTHING = 0.09;
const SETTLE_EPSILON = 0.005;
// Iteraciones para saber qué punto del terreno está bajo el cursor: cada cota
// está dibujada más arriba cuanto más alta es.
const RELIEF_ITERATIONS = 4;
// Cerca del borde derecho, la lectura va a la izquierda del cursor.
const READOUT_FLIP_PX = 240;
// Teclado: lo que avanza la retícula con cada flecha (con Mayúsculas, más), y
// la espera antes de anunciar la lectura, para no leer cada paso intermedio.
const KEY_STEP_PX = 16;
const KEY_STEP_LONG_PX = 64;
const ANNOUNCE_DELAY_MS = 450;

interface Tilt {
  rotateX: number;
  rotateY: number;
  shiftY: number;
}

const formatCoordinate = (degrees: number, positive: string, negative: string) => {
  const absolute = Math.abs(degrees);
  const whole = Math.floor(absolute);
  const minutesTotal = (absolute - whole) * 60;
  const minutes = Math.floor(minutesTotal);
  const seconds = Math.min(59, Math.round((minutesTotal - minutes) * 60));
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${whole}°${pad(minutes)}′${pad(seconds)}″ ${degrees < 0 ? negative : positive}`;
};

const elevationLocale = () => (document.documentElement.lang === 'en' ? 'en-GB' : 'es-ES');
const formatElevation = (metres: number) => `${Math.round(metres).toLocaleString(elevationLocale())} m`;

const numbers = (value: string | undefined) => (value ?? '').split(' ').map(Number);

// Punto del plano (en px de su caja, sin transformar) que cae bajo un punto
// de la pantalla, deshaciendo una transformación 3D: se busca (u, v, 0) tal
// que, proyectado, coincida con (x, y).
function unproject(matrix: DOMMatrix, x: number, y: number): { u: number; v: number } | null {
  const a = matrix.m11 - x * matrix.m14;
  const b = matrix.m21 - x * matrix.m24;
  const c = matrix.m12 - y * matrix.m14;
  const d = matrix.m22 - y * matrix.m24;
  const e = x * matrix.m44 - matrix.m41;
  const f = y * matrix.m44 - matrix.m42;
  const determinant = a * d - b * c;
  if (Math.abs(determinant) < 1e-9) return null;
  return { u: (e * d - b * f) / determinant, v: (a * f - e * c) / determinant };
}

export function initContourPlan(section: HTMLElement): () => void {
  const svg = section.querySelector<SVGSVGElement>('.contour-map');
  const mapBox = section.querySelector<HTMLElement>('.hero-map');
  const tiltLayer = section.querySelector<HTMLElement>('.hero-map-tilt');
  const intro = section.querySelector<HTMLElement>('.hero-map-intro');
  const highlight = section.querySelector<SVGPathElement>('.hero-map-highlight path');
  if (!svg || !mapBox || !tiltLayer || !intro || !highlight) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  const [lat0, lat1, lon0, lon1] = numbers(section.dataset.planBounds);
  const west = section.dataset.planWest ?? 'O';
  const [gridCols, gridRows, gridStep] = numbers(section.dataset.planGridSize);
  const [reliefLow, reliefHigh] = numbers(svg.dataset.relief);
  const lift = Number(svg.dataset.lift) || 0;
  const interval = Number(svg.dataset.interval);
  const { width: mapWidth, height: mapHeight } = svg.viewBox.baseVal;

  const levels = new Map<number, SVGGElement>();
  svg.querySelectorAll<SVGGElement>('.contour-level').forEach((level) => {
    levels.set(Number(level.dataset.z), level);
  });

  const horizontal = section.querySelector<HTMLElement>('.hero-reticle-h')!;
  const vertical = section.querySelector<HTMLElement>('.hero-reticle-v')!;
  const mark = section.querySelector<HTMLElement>('.hero-reticle-mark')!;
  const readout = section.querySelector<HTMLElement>('.hero-readout')!;
  const readoutElevation = section.querySelector<HTMLElement>('.hero-readout-z')!;
  const readoutPosition = section.querySelector<HTMLElement>('.hero-readout-geo')!;
  const lamp = section.querySelector<HTMLElement>('.hero-lamp')!;
  const explorer = section.querySelector<HTMLElement>('.hero-explorer');
  const explorerReading = section.querySelector<HTMLElement>('.hero-explorer-reading');

  // Reposo de la inclinación, definido en el CSS (cambia en móvil).
  let threeD = false;
  let perspective = 1800;
  let restTilt = 0;
  let restScale = 1;
  const readRest = () => {
    const style = getComputedStyle(tiltLayer);
    threeD = style.getPropertyValue('--plan-3d').trim() === '1';
    perspective = parseFloat(style.getPropertyValue('--plan-perspective')) || 1800;
    restTilt = parseFloat(style.getPropertyValue('--plan-tilt')) || 0;
    restScale = parseFloat(style.getPropertyValue('--plan-scale')) || 1;
  };

  let heights: Uint16Array | null = null;
  let gridRequested = false;
  let introDone = reducedMotion.matches;
  let surveying = false;
  let visible = true;
  let frame = 0;
  let lastTime = 0;
  let pointer: { x: number; y: number } | null = null;
  let pointerTilt = { x: 0, y: 0 };
  let activeBand: number | null = null;
  let written = '';
  const current: Tilt = { rotateX: 0, rotateY: 0, shiftY: 0 };

  const target = (): Tilt => {
    const bounds = section.getBoundingClientRect();
    const progress = reducedMotion.matches ? 0 : Math.min(Math.max(-bounds.top / bounds.height, 0), 1);
    const tiltable = threeD && !reducedMotion.matches;
    return {
      rotateX: tiltable ? pointerTilt.x + progress * SCROLL_TILT_DEG : 0,
      rotateY: tiltable ? pointerTilt.y : 0,
      shiftY: progress * SCROLL_PARALLAX * bounds.height,
    };
  };

  const transformFor = (tilt: Tilt) =>
    threeD
      ? `translate3d(0, ${tilt.shiftY.toFixed(1)}px, 0) perspective(${perspective}px) ` +
        `rotateX(${(restTilt + tilt.rotateX).toFixed(3)}deg) rotateY(${tilt.rotateY.toFixed(3)}deg) scale(${restScale})`
      : `translate3d(0, ${tilt.shiftY.toFixed(1)}px, 0)`;

  const writeTilt = () => {
    const value = transformFor(current);
    if (value === written) return;
    written = value;
    tiltLayer.style.transform = value;
  };

  const ensureHeights = () => {
    if (gridRequested || !section.dataset.planGrid) return;
    gridRequested = true;
    fetch(section.dataset.planGrid)
      .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject(response.status)))
      .then((buffer) => {
        const values = new Uint16Array(buffer);
        if (values.length === gridCols * gridRows) heights = values;
        schedule();
      })
      .catch(() => {
        // Sin rejilla la retícula sigue dando coordenadas; solo falta la cota.
      });
  };

  const elevationAt = (x: number, y: number): number | null => {
    if (!heights || x < 0 || y < 0 || x > mapWidth || y > mapHeight) return null;
    const fx = Math.min(x / gridStep, gridCols - 1);
    const fy = Math.min(y / gridStep, gridRows - 1);
    const c0 = Math.floor(fx);
    const r0 = Math.floor(fy);
    const c1 = Math.min(c0 + 1, gridCols - 1);
    const r1 = Math.min(r0 + 1, gridRows - 1);
    const tx = fx - c0;
    const ty = fy - r0;
    const at = (r: number, c: number) => heights![r * gridCols + c];
    const top = at(r0, c0) * (1 - tx) + at(r0, c1) * tx;
    const bottom = at(r1, c0) * (1 - tx) + at(r1, c1) * tx;
    return top * (1 - ty) + bottom * ty;
  };

  // Desplazamiento con el que está dibujada cada cota (ContourMap.astro).
  const offsetFor = (elevation: number) =>
    Math.max(0, ((elevation - reliefLow) / (reliefHigh - reliefLow)) * lift);

  const setActiveBand = (elevation: number | null) => {
    const band = elevation === null ? null : Math.floor(elevation / interval) * interval;
    const level = band === null ? undefined : levels.get(band);
    const next = level ? band : null;
    if (next === activeBand) return;
    activeBand = next;
    if (!level) {
      highlight.removeAttribute('d');
      return;
    }
    const lines = [...level.querySelectorAll('.contour-line')].map((line) => line.getAttribute('d')).join(' ');
    highlight.setAttribute('d', lines);
    highlight.setAttribute('transform', level.getAttribute('transform') ?? '');
  };

  // Matriz de la capa inclinada respecto a la caja del plano, con su origen.
  const tiltMatrix = () => {
    const style = getComputedStyle(tiltLayer);
    const [originX, originY] = style.transformOrigin.split(' ').map(parseFloat);
    const own = style.transform === 'none' ? new DOMMatrix() : new DOMMatrix(style.transform);
    return new DOMMatrix().translate(originX, originY).multiply(own).translate(-originX, -originY);
  };

  const updateReticle = () => {
    if (!pointer || !surveying) return;
    const bounds = section.getBoundingClientRect();
    const localX = pointer.x - bounds.left;
    const localY = pointer.y - bounds.top;
    horizontal.style.transform = `translate3d(0, ${localY}px, 0)`;
    vertical.style.transform = `translate3d(${localX}px, 0, 0)`;
    mark.style.transform = `translate3d(${localX}px, ${localY}px, 0)`;
    lamp.style.transform = `translate3d(${localX}px, ${localY}px, 0)`;
    readout.classList.toggle('is-flipped', bounds.width - localX < READOUT_FLIP_PX);

    const box = mapBox.getBoundingClientRect();
    const point = unproject(tiltMatrix(), pointer.x - box.left, pointer.y - box.top);
    if (!point) return;
    const scale = mapWidth / box.width;
    const x = point.u * scale;
    const y = point.v * scale;

    // Las cotas altas están dibujadas más arriba: el terreno bajo el cursor
    // es el del punto de base que, al subir con su cota, cae ahí.
    let baseY = y;
    let elevation = elevationAt(x, baseY);
    for (let i = 0; i < RELIEF_ITERATIONS && elevation !== null; i++) {
      baseY = y + offsetFor(elevation);
      elevation = elevationAt(x, baseY) ?? elevation;
    }

    const lat = lat1 - (baseY / mapHeight) * (lat1 - lat0);
    const lon = lon0 + (x / mapWidth) * (lon1 - lon0);
    readoutElevation.textContent = elevation === null ? '' : formatElevation(elevation);
    readoutPosition.textContent = `${formatCoordinate(lat, 'N', 'S')} · ${formatCoordinate(lon, 'E', west)}`;
    setActiveBand(elevation);
  };

  const step = (time: number) => {
    frame = 0;
    const elapsed = lastTime ? Math.min(time - lastTime, 100) : 16.7;
    lastTime = time;
    const goal = target();
    const amount = reducedMotion.matches ? 1 : 1 - Math.pow(1 - SMOOTHING, elapsed / 16.7);
    current.rotateX += (goal.rotateX - current.rotateX) * amount;
    current.rotateY += (goal.rotateY - current.rotateY) * amount;
    // El parallax sigue al scroll sin suavizar: si no, el plano "flota".
    current.shiftY = goal.shiftY;
    const settled =
      Math.abs(goal.rotateX - current.rotateX) < SETTLE_EPSILON && Math.abs(goal.rotateY - current.rotateY) < SETTLE_EPSILON;
    if (settled) {
      current.rotateX = goal.rotateX;
      current.rotateY = goal.rotateY;
    }
    writeTilt();
    updateReticle();
    if (!settled && visible) schedule();
    else lastTime = 0;
  };

  function schedule() {
    if (!frame) frame = requestAnimationFrame(step);
  }

  const setSurveying = (next: boolean) => {
    if (surveying === next) return;
    surveying = next;
    section.classList.toggle('is-surveying', next);
    if (!next) setActiveBand(null);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !finePointer.matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    // Encima del texto o de la cartela la retícula estorba la lectura; y
    // mientras el plano entra, aún no hay nada que medir.
    const overCopy = (event.target as Element).closest('.hero-copy, .hero-cartouche, #site-header');
    setSurveying(introDone && !overCopy);
    if (introDone) ensureHeights();
    if (introDone && threeD && !reducedMotion.matches) {
      const bounds = section.getBoundingClientRect();
      const u = (event.clientX - bounds.left) / bounds.width;
      const v = (event.clientY - bounds.top) / bounds.height;
      // El cursor hace de cabeza del observador: el plano se inclina hacia él.
      pointerTilt = { x: (0.5 - v) * 2 * POINTER_TILT_X_DEG, y: (u - 0.5) * 2 * POINTER_TILT_Y_DEG };
    }
    schedule();
  };

  const onPointerLeave = () => {
    setSurveying(false);
    pointerTilt = { x: 0, y: 0 };
    schedule();
  };

  // --- Teclado (WCAG 2.1.1): la misma lectura que con el ratón -------------

  let announceTimer = 0;
  const announce = () => {
    window.clearTimeout(announceTimer);
    announceTimer = window.setTimeout(() => {
      if (!explorerReading) return;
      explorerReading.textContent = [readoutElevation.textContent, readoutPosition.textContent].filter(Boolean).join(', ');
    }, ANNOUNCE_DELAY_MS);
  };

  const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

  const onExplorerFocus = () => {
    if (!explorer) return;
    const area = explorer.getBoundingClientRect();
    pointer = { x: area.left + area.width / 2, y: area.top + area.height / 2 };
    introDone = true;
    ensureHeights();
    setSurveying(true);
    schedule();
    announce();
  };

  const onExplorerBlur = () => {
    window.clearTimeout(announceTimer);
    setSurveying(false);
    schedule();
  };

  const onExplorerKey = (event: KeyboardEvent) => {
    if (!explorer || !pointer) return;
    const step = event.shiftKey ? KEY_STEP_LONG_PX : KEY_STEP_PX;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const area = explorer.getBoundingClientRect();
    pointer = { x: clamp(pointer.x + move[0], area.left, area.right), y: clamp(pointer.y + move[1], area.top, area.bottom) };
    setSurveying(true);
    schedule();
    announce();
  };

  const onIntroEnd = (event: AnimationEvent) => {
    if (event.target !== intro) return;
    introDone = true;
  };

  const onScroll = () => {
    if (visible) schedule();
  };

  const onResize = () => {
    readRest();
    written = '';
    schedule();
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) setSurveying(false);
    else schedule();
  });
  observer.observe(section);

  readRest();
  // Si la animación de entrada no existe (movimiento reducido) o ya acabó.
  if (!intro.getAnimations().length) introDone = true;
  intro.addEventListener('animationend', onIntroEnd);
  section.addEventListener('pointermove', onPointerMove);
  section.addEventListener('pointerleave', onPointerLeave);
  explorer?.addEventListener('focus', onExplorerFocus);
  explorer?.addEventListener('blur', onExplorerBlur);
  explorer?.addEventListener('keydown', onExplorerKey);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  schedule();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    intro.removeEventListener('animationend', onIntroEnd);
    section.removeEventListener('pointermove', onPointerMove);
    section.removeEventListener('pointerleave', onPointerLeave);
    explorer?.removeEventListener('focus', onExplorerFocus);
    explorer?.removeEventListener('blur', onExplorerBlur);
    explorer?.removeEventListener('keydown', onExplorerKey);
    window.clearTimeout(announceTimer);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };
}
