import { PerspectiveCamera, Vector3 } from 'three';

// Composición de la home en cualquier pantalla: la cámara se encuadra para que
// las cumbres caigan en el "escenario" libre (lo que no tapan la cabecera, el
// titular y los controles) y cada tarjeta de vértice busca un sitio donde no
// pise nada.

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface LayoutElements {
  header: HTMLElement[];
  intro: HTMLElement;
  controls: HTMLElement;
  // Todo lo que una tarjeta no debe tapar.
  obstacles: HTMLElement[];
}

export interface CardSlot {
  element: HTMLElement;
  x: number;
  y: number;
  // Medidas leídas antes de escribir ningún estilo: leer el tamaño después de
  // mover otra tarjeta obligaría al navegador a recalcular la maquetación.
  cardWidth: number;
  cardHeight: number;
  placement: number;
}

const STAGE_MARGIN_PX = 20;
// La deriva y el paralaje mueven las cumbres unos píxeles: se dejan de margen.
const DRIFT_MARGIN_PX = 24;
// Con tarjetas que pueden ir por encima o por debajo del pilar, basta con
// reservar media tarjeta en el borde superior del escenario.
const CARD_ALLOWANCE_PX = 40;
// Las cuatro cumbres ocupan una caja unas dos veces más ancha que alta.
const SUMMITS_ASPECT = 2.2;
// El escenario a la derecha del titular solo se usa si gana claramente al de
// encima del titular: así el encuadre de escritorio no cambia sin motivo.
const SIDE_STAGE_ADVANTAGE = 1 / 0.75;
const FIT_ITERATIONS = 14;
const FIT_MAX_STEP = 1.35;
const SCREEN_MARGIN_PX = 8;
const PIN_GAP_PX = 12;
const CARD_GAP_PX = 6;

const rectOf = (element: Element): Rect => {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return { left, top, right, bottom };
};

const isShown = (element: HTMLElement) => {
  if (element.hidden) return false;
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
};

const intersects = (a: Rect, b: Rect) =>
  Math.min(a.right, b.right) - Math.max(a.left, b.left) > 0 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0;

export function computeStage(layout: LayoutElements, width: number, height: number): Rect {
  const headerBottom = Math.max(0, ...layout.header.filter(isShown).map((element) => rectOf(element).bottom));
  const intro = rectOf(layout.intro);
  const controls = rectOf(layout.controls);
  const top = headerBottom + CARD_ALLOWANCE_PX + DRIFT_MARGIN_PX;
  const inset = STAGE_MARGIN_PX + DRIFT_MARGIN_PX;
  // Dos escenarios posibles: la franja encima del titular o la columna a su
  // derecha. Se elige el que deja las cumbres más grandes.
  const above: Rect = { left: inset, right: width - inset, top, bottom: Math.min(intro.top, controls.top) - inset };
  const beside: Rect = { left: intro.right + inset, right: width - inset, top, bottom: controls.top - inset };
  const score = (rect: Rect) =>
    Math.max(0, Math.min((rect.right - rect.left) / SUMMITS_ASPECT, rect.bottom - rect.top));
  return score(beside) > score(above) * SIDE_STAGE_ADVANTAGE ? beside : above;
}

// ¿Funciona el encuadre de partida tal cual? Lo hace si ninguna cumbre cae
// fuera de la pantalla ni debajo de la cabecera, el titular o los controles.
// En ese caso no se toca: el encuadre a mano enseña también el primer plano
// (embalses y pueblos), que el ajuste automático puede sacar de cuadro.
export function presetFramingWorks(
  camera: PerspectiveCamera,
  position: Vector3,
  target: Vector3,
  summits: Vector3[],
  layout: LayoutElements,
  width: number,
  height: number,
): boolean {
  camera.position.copy(position);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  const reserved = [...layout.header, layout.intro, layout.controls].filter(isShown).map(rectOf);
  const margin = DRIFT_MARGIN_PX;
  const projected = new Vector3();
  return summits.every((summit) => {
    projected.copy(summit).project(camera);
    const x = (projected.x + 1) * 0.5 * width;
    const y = (1 - projected.y) * 0.5 * height;
    const onScreen = x > margin && x < width - margin && y > margin + CARD_ALLOWANCE_PX && y < height - margin;
    const pin: Rect = { left: x - margin, top: y - margin, right: x + margin, bottom: y + margin };
    return onScreen && !reserved.some((rect) => intersects(pin, rect));
  });
}

// Ajusta distancia y desplazamiento de la cámara (sin cambiar su orientación)
// hasta que la caja de las cumbres proyectadas quepa centrada en el escenario.
export function fitCameraToStage(
  camera: PerspectiveCamera,
  presetPosition: Vector3,
  presetTarget: Vector3,
  summits: Vector3[],
  stage: Rect,
  width: number,
  height: number,
): { position: Vector3; target: Vector3 } {
  const direction = presetPosition.clone().sub(presetTarget).normalize();
  let distance = presetPosition.distanceTo(presetTarget);
  const target = presetTarget.clone();
  const right = new Vector3();
  const up = new Vector3();
  const projected = new Vector3();
  const stageWidth = Math.max(stage.right - stage.left, 40);
  const stageHeight = Math.max(stage.bottom - stage.top, 40);

  for (let i = 0; i < FIT_ITERATIONS; i++) {
    camera.position.copy(target).addScaledVector(direction, distance);
    camera.lookAt(target);
    camera.updateMatrixWorld();

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const summit of summits) {
      projected.copy(summit).project(camera);
      const x = (projected.x + 1) * 0.5 * width;
      const y = (1 - projected.y) * 0.5 * height;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }

    const scale = Math.max((maxX - minX) / stageWidth, (maxY - minY) / stageHeight);
    distance *= Math.min(Math.max(scale, 1 / FIT_MAX_STEP), FIT_MAX_STEP);

    // Metros de mundo por píxel a la distancia del objetivo.
    const worldPerPixel = (2 * distance * Math.tan((camera.fov * Math.PI) / 360)) / height;
    right.setFromMatrixColumn(camera.matrixWorld, 0);
    up.setFromMatrixColumn(camera.matrixWorld, 1);
    const offsetX = (minX + maxX) / 2 - (stage.left + stage.right) / 2;
    const offsetY = (minY + maxY) / 2 - (stage.top + stage.bottom) / 2;
    target.addScaledVector(right, offsetX * worldPerPixel).addScaledVector(up, -offsetY * worldPerPixel);
  }

  return { position: target.clone().addScaledVector(direction, distance), target };
}

export function obstacleRects(layout: LayoutElements): Rect[] {
  return layout.obstacles.filter(isShown).map(rectOf);
}

// Posiciones posibles de una tarjeta respecto a su pilar, por preferencia.
// Arriba a la derecha es la natural; el resto son alternativas para cuando
// dos cumbres se proyectan muy juntas o la tarjeta pisaría la interfaz.
interface Placement {
  side: 'right' | 'left' | 'center';
  above: boolean;
  // Escalones extra de tallo (en alturas de tarjeta).
  extra: number;
}

const PLACEMENTS: Placement[] = [
  { side: 'right', above: true, extra: 0 },
  { side: 'left', above: true, extra: 0 },
  { side: 'right', above: false, extra: 0 },
  { side: 'left', above: false, extra: 0 },
  { side: 'center', above: true, extra: 0 },
  { side: 'center', above: false, extra: 0 },
  { side: 'right', above: true, extra: 1 },
  { side: 'left', above: true, extra: 1 },
  { side: 'right', above: false, extra: 1 },
  { side: 'left', above: false, extra: 1 },
];

function candidateRect(slot: CardSlot, index: number, lift: number): Rect {
  const { cardWidth, cardHeight } = slot;
  const placement = PLACEMENTS[index];
  const reach = lift + placement.extra * (cardHeight + CARD_GAP_PX);
  const leftEdge =
    placement.side === 'left'
      ? slot.x + PIN_GAP_PX - cardWidth
      : placement.side === 'center'
        ? slot.x - cardWidth / 2
        : slot.x - PIN_GAP_PX;
  const top = placement.above ? slot.y - reach - cardHeight : slot.y + reach;
  return { left: leftEdge, top, right: leftEdge + cardWidth, bottom: top + cardHeight };
}

const PLACEMENT_COUNT = PLACEMENTS.length;
// Penalización por salirse de la pantalla, en píxeles cuadrados por píxel.
const OFFSCREEN_PENALTY = 400;

const overlapArea = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
  Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

export function placeCards(slots: CardSlot[], obstacles: Rect[], width: number, height: number, lift: number): void {
  const placed: Rect[] = [];
  // De arriba abajo en pantalla: las tarjetas de las cumbres más lejanas se
  // colocan primero y las demás se apartan de ellas.
  const ordered = [...slots].sort((a, b) => a.y - b.y);
  for (const slot of ordered) {
    const fits = (rect: Rect) =>
      rect.left >= SCREEN_MARGIN_PX &&
      rect.right <= width - SCREEN_MARGIN_PX &&
      rect.top >= SCREEN_MARGIN_PX &&
      rect.bottom <= height - SCREEN_MARGIN_PX &&
      !obstacles.some((obstacle) => intersects(rect, obstacle)) &&
      !placed.some((other) => intersects(rect, other));

    // Se mantiene la posición anterior mientras siga valiendo: así la tarjeta
    // no salta de lado con la deriva de la cámara.
    const order = [slot.placement, ...Array.from({ length: PLACEMENT_COUNT }, (_, i) => i).filter((i) => i !== slot.placement)];
    let chosen = order.find((placement) => fits(candidateRect(slot, placement, lift)));
    if (chosen === undefined) {
      const cost = (rect: Rect) =>
        obstacles.reduce((sum, obstacle) => sum + overlapArea(rect, obstacle), 0) +
        placed.reduce((sum, other) => sum + overlapArea(rect, other), 0) +
        OFFSCREEN_PENALTY *
          (Math.max(0, SCREEN_MARGIN_PX - rect.top) + Math.max(0, rect.bottom - (height - SCREEN_MARGIN_PX)));
      chosen = order.reduce((best, placement) =>
        cost(candidateRect(slot, placement, lift)) < cost(candidateRect(slot, best, lift)) ? placement : best,
      );
    }
    slot.placement = chosen;

    const rect = candidateRect(slot, chosen, lift);
    // Si ninguna posición cabe del todo, al menos no se sale de la pantalla.
    const shiftX = Math.max(SCREEN_MARGIN_PX - rect.left, Math.min(0, width - SCREEN_MARGIN_PX - rect.right));
    const finalRect = { ...rect, left: rect.left + shiftX, right: rect.right + shiftX };
    placed.push(finalRect);

    const above = finalRect.bottom <= slot.y;
    const stemTop = above ? finalRect.bottom - slot.y : PIN_GAP_PX / 3;
    const stemHeight = above ? slot.y - PIN_GAP_PX - finalRect.bottom : finalRect.top - slot.y - PIN_GAP_PX / 3;
    const style = slot.element.style;
    style.setProperty('--card-x', `${(finalRect.left - slot.x).toFixed(1)}px`);
    style.setProperty('--card-y', `${(finalRect.top - slot.y).toFixed(1)}px`);
    style.setProperty('--stem-top', `${stemTop.toFixed(1)}px`);
    style.setProperty('--stem-height', `${Math.max(stemHeight, 0).toFixed(1)}px`);
  }
}
