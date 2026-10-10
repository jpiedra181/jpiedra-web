// Pruebas en vivo de "Lo que no se ve" (/experiencias-3d): los fps reales de
// la pantalla, las teclas que se encienden al pulsarlas y el ajuste de
// movimiento del sistema. Solo trabajan mientras se ven.

const FPS_WINDOW_MS = 1000;
// Mide durante 3 s y se queda quieto: un número que cambia sin fin junto al
// texto incumple WCAG 2.2.2. El botón «Medir otra vez» repite la medida.
const FPS_MEASURE_MS = 3000;
const KEY_GLOW_MS = 260;

function watchVisibility(element: Element, onChange: (visible: boolean) => void): IntersectionObserver {
  const observer = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting));
  observer.observe(element);
  return observer;
}

function initFps(root: HTMLElement): () => void {
  const value = root.querySelector<HTMLElement>('[data-fps-value]');
  const again = root.querySelector<HTMLButtonElement>('[data-fps-again]');
  if (!value) return () => {};
  let frame = 0;
  let frames = 0;
  let windowStart = 0;
  let measureStart = 0;
  let measured = false;

  const tick = (time: number) => {
    if (!measureStart) measureStart = time;
    if (!windowStart) windowStart = time;
    frames++;
    if (time - windowStart >= FPS_WINDOW_MS) {
      value.textContent = String(Math.round((frames * 1000) / (time - windowStart)));
      frames = 0;
      windowStart = time;
    }
    frame = time - measureStart < FPS_MEASURE_MS ? requestAnimationFrame(tick) : 0;
  };

  const measure = () => {
    cancelAnimationFrame(frame);
    frames = 0;
    windowStart = 0;
    measureStart = 0;
    frame = requestAnimationFrame(tick);
  };

  // La primera medida, al llegar a la prueba; las siguientes, a petición.
  const observer = watchVisibility(root, (visible) => {
    if (!visible || measured) return;
    measured = true;
    measure();
  });
  again?.addEventListener('click', measure);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    again?.removeEventListener('click', measure);
  };
}

function initKeys(root: HTMLElement): () => void {
  let visible = false;
  const timers = new Map<string, number>();
  const observer = watchVisibility(root, (next) => (visible = next));

  // Solo se escucha: la tecla sigue haciendo lo suyo (las flechas, scroll).
  const onKey = (event: KeyboardEvent) => {
    if (!visible) return;
    const cap = root.querySelector<HTMLElement>(`[data-key="${event.key}"]`);
    if (!cap) return;
    cap.classList.add('is-pressed');
    window.clearTimeout(timers.get(event.key));
    timers.set(event.key, window.setTimeout(() => cap.classList.remove('is-pressed'), KEY_GLOW_MS));
  };

  window.addEventListener('keydown', onKey);
  return () => {
    observer.disconnect();
    window.removeEventListener('keydown', onKey);
    timers.forEach((timer) => window.clearTimeout(timer));
  };
}

function initMotion(root: HTMLElement): () => void {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const update = () => root.classList.toggle('is-reduced', query.matches);
  update();
  query.addEventListener('change', update);
  // La órbita de muestra gira al llegar a ella, no al cargar la página.
  const observer = watchVisibility(root, (visible) => {
    if (!visible) return;
    root.classList.add('is-orbiting');
    observer.disconnect();
  });
  return () => {
    query.removeEventListener('change', update);
    observer.disconnect();
  };
}

export function initLiveProofs(root: ParentNode = document): () => void {
  const cleanups: (() => void)[] = [];
  const find = (name: string) => root.querySelector<HTMLElement>(`[data-proof="${name}"]`);
  const fps = find('fps');
  const keys = find('keys');
  const motion = find('motion');
  if (fps) cleanups.push(initFps(fps));
  if (keys) cleanups.push(initKeys(keys));
  if (motion) cleanups.push(initMotion(motion));
  return () => cleanups.forEach((cleanup) => cleanup());
}
