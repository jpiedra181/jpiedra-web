// Prueba en vivo de «Tus dudas» (/experiencias-3d): el ajuste de movimiento
// del sistema de quien la lee, que cambia en cuanto lo cambia.

function watchVisibility(element: Element, onChange: (visible: boolean) => void): IntersectionObserver {
  const observer = new IntersectionObserver(([entry]) => onChange(entry.isIntersecting));
  observer.observe(element);
  return observer;
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
  const motion = find('motion');
  if (motion) cleanups.push(initMotion(motion));
  return () => cleanups.forEach((cleanup) => cleanup());
}
