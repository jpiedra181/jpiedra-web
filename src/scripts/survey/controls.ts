import type { SurveyScene } from '../survey-scene';
import { markArrival } from '../page-transition';

// Controles de la home 3D: pausa del movimiento, sonido y el "Fin del mundo".
// Todo con controles nativos, que ya funcionan con teclado y lector de pantalla.

// La clásica lo lee para avisar de que la sierra ya no está (ClassicPage.astro).
const METEOR_FLAG = 'jp:meteor';
// Cuánto se dispersan las piezas de la interfaz al salir volando.
const DEBRIS_SPREAD_PX = 260;
const DEBRIS_SPIN_DEG = 80;
const DEBRIS_MAX_DELAY_S = 0.25;
const DEBRIS_SELECTOR = [
  '.survey-logo',
  '.survey-nav',
  '.survey-eyebrow',
  '.survey-subtitle',
  '.survey-hint',
  '.survey-caption',
  '.vertex-card',
  '.vertex-stem',
  '.vertex-pin',
  '.survey-controls > *',
].join(', ');

// Parte el titular en palabras para que cada una caiga por su lado.
function splitIntoWords(element: HTMLElement): HTMLElement[] {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  const words: HTMLElement[] = [];
  for (const text of texts) {
    const fragment = document.createDocumentFragment();
    for (const part of (text.textContent ?? '').split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        fragment.append(part);
        continue;
      }
      const word = document.createElement('span');
      word.className = 'debris-word';
      word.textContent = part;
      fragment.append(word);
      words.push(word);
    }
    text.replaceWith(fragment);
  }
  return words;
}

function shatterInterface(): void {
  const title = document.querySelector<HTMLElement>('.survey-title');
  const pieces = [
    ...Array.from(document.querySelectorAll<HTMLElement>(DEBRIS_SELECTOR)),
    ...(title ? splitIntoWords(title) : []),
  ];
  for (const piece of pieces) {
    piece.style.setProperty('--debris-x', `${((Math.random() - 0.5) * DEBRIS_SPREAD_PX).toFixed(0)}px`);
    piece.style.setProperty('--debris-rot', `${((Math.random() - 0.5) * DEBRIS_SPIN_DEG).toFixed(0)}deg`);
    piece.style.setProperty('--debris-delay', `${(Math.random() * DEBRIS_MAX_DELAY_S).toFixed(2)}s`);
    piece.classList.add('is-debris');
  }
}

export function wireSurveyControls(scene: SurveyScene): void {
  const pauseButton = document.querySelector<HTMLButtonElement>('[data-pause]');
  const soundButton = document.querySelector<HTMLButtonElement>('[data-sound]');
  const destroyLink = document.querySelector<HTMLAnchorElement>('[data-destroy]');
  const doomSky = document.querySelector<HTMLElement>('[data-doom-sky]');
  if (!pauseButton || !soundButton || !destroyLink || !doomSky) return;

  // --- Sonido --------------------------------------------------------------
  // Apagado por defecto: el navegador solo deja sonar audio tras un gesto, y
  // nadie debería encontrarse una web que suena sin haberlo pedido.

  soundButton.addEventListener('click', async () => {
    await scene.setSound(!scene.isSoundOn());
    soundButton.setAttribute('aria-pressed', String(scene.isSoundOn()));
  });

  // --- Pausa ---------------------------------------------------------------

  const showPaused = () => pauseButton.setAttribute('aria-pressed', String(scene.isPaused()));
  pauseButton.addEventListener('click', () => {
    scene.setPaused(!scene.isPaused());
    showPaused();
  });
  showPaused();

  // --- Fin del mundo -------------------------------------------------------
  // Lo pide la persona y dura menos de 4 s; con movimiento reducido la sierra
  // solo se apaga. Al terminar lleva a la versión clásica, que avisa de que
  // la sierra se puede reconstruir.

  const root = document.documentElement;
  destroyLink.addEventListener('click', async (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (root.classList.contains('is-doomed')) return;
    root.classList.add('is-doomed');
    await scene.destroyWorld({
      onLaunch: (approachSeconds) => {
        doomSky.style.setProperty('--doom-approach', `${approachSeconds}s`);
        root.classList.add('doom-launch');
      },
      onImpact: () => {
        root.classList.add('doom-impact');
        shatterInterface();
      },
    });
    try {
      sessionStorage.setItem(METEOR_FLAG, '1');
    } catch {
      // Sin sessionStorage, la clásica llega sin el aviso.
    }
    markArrival();
    window.location.assign(destroyLink.href);
  });
}
