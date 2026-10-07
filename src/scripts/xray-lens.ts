// Lupa de "lo que oye un lector de pantalla" en el hero de /accesibilidad-web
// (XRayProduct.astro). Con ratón la lupa sigue al cursor; con el dedo, se
// coloca donde se toca o se arrastra; el botón enseña la capa entera.
// Solo se mueven dos variables CSS y un anillo (transform).

// Recorrido de presentación al entrar en pantalla (menos de 5 s: WCAG 2.2.2).
const INTRO_SECONDS = 3.2;
const INTRO_PATH = [
  { x: 0.24, y: 0.42 },
  { x: 0.72, y: 0.62 },
  { x: 0.7, y: 0.86 },
];

export function initXRayLens(figure: HTMLElement): () => void {
  const stage = figure.querySelector<HTMLElement>('.xray-stage');
  const ring = figure.querySelector<HTMLElement>('.xray-ring');
  const toggle = figure.querySelector<HTMLButtonElement>('.xray-toggle');
  if (!stage || !ring || !toggle) return () => {};

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let pending: { x: number; y: number } | null = null;
  let introFrame = 0;
  let introPlayed = false;
  let userTouched = false;

  const place = (x: number, y: number) => {
    stage.style.setProperty('--lens-x', `${x.toFixed(1)}px`);
    stage.style.setProperty('--lens-y', `${y.toFixed(1)}px`);
    ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  };

  const flush = () => {
    frame = 0;
    if (pending) place(pending.x, pending.y);
    pending = null;
  };

  const queue = (event: PointerEvent) => {
    const bounds = stage.getBoundingClientRect();
    pending = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    if (!frame) frame = requestAnimationFrame(flush);
  };

  const stopIntro = () => {
    cancelAnimationFrame(introFrame);
    introFrame = 0;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch' && event.buttons === 0) return;
    userTouched = true;
    stopIntro();
    stage.classList.add('is-lens');
    queue(event);
  };

  const onPointerDown = (event: PointerEvent) => {
    userTouched = true;
    stopIntro();
    stage.classList.add('is-lens');
    queue(event);
  };

  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    stage.classList.remove('is-lens');
  };

  const onToggle = () => {
    const pressed = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(pressed));
    stage.classList.toggle('is-full', pressed);
    stopIntro();
  };

  // Presentación: la lupa recorre la ficha una vez y se retira.
  const playIntro = () => {
    const start = performance.now();
    stage.classList.add('is-lens');
    const tick = (time: number) => {
      // El tiempo de rAF es el del inicio del fotograma y puede quedar unos
      // milisegundos por detrás de performance.now(): se acota a 0.
      const progress = Math.min(Math.max((time - start) / (INTRO_SECONDS * 1000), 0), 1);
      const segment = Math.min(Math.floor(progress * (INTRO_PATH.length - 1)), INTRO_PATH.length - 2);
      const local = progress * (INTRO_PATH.length - 1) - segment;
      const eased = 0.5 - Math.cos(local * Math.PI) * 0.5;
      const from = INTRO_PATH[segment];
      const to = INTRO_PATH[segment + 1];
      const bounds = stage.getBoundingClientRect();
      place((from.x + (to.x - from.x) * eased) * bounds.width, (from.y + (to.y - from.y) * eased) * bounds.height);
      if (progress < 1) {
        introFrame = requestAnimationFrame(tick);
      } else {
        introFrame = 0;
        if (!userTouched) stage.classList.remove('is-lens');
      }
    };
    introFrame = requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || introPlayed) return;
      introPlayed = true;
      observer.disconnect();
      if (!reducedMotion.matches && !userTouched) playIntro();
    },
    { threshold: 0.6 },
  );

  const bounds = stage.getBoundingClientRect();
  place(bounds.width * INTRO_PATH[0].x, bounds.height * INTRO_PATH[0].y);
  observer.observe(stage);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('pointerleave', onPointerLeave);
  toggle.addEventListener('click', onToggle);

  return () => {
    cancelAnimationFrame(frame);
    stopIntro();
    observer.disconnect();
    stage.removeEventListener('pointermove', onPointerMove);
    stage.removeEventListener('pointerdown', onPointerDown);
    stage.removeEventListener('pointerleave', onPointerLeave);
    toggle.removeEventListener('click', onToggle);
  };
}
