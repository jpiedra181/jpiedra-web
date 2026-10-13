// Tarjetas que se inclinan hacia el cursor, con una luz que lo sigue
// (data-tilt). Solo escribe variables CSS en la tarjeta que tiene el ratón
// encima: el giro, la sombra y el brillo los pinta el CSS de cada componente
// (--tilt-x y --tilt-y de -1 a 1; --glare-x y --glare-y en porcentaje).
// Con pantalla táctil o con movimiento reducido no se mueve nada.

const TILTING_CLASS = 'is-tilting';

export function initTiltCards(root: ParentNode = document): () => void {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...root.querySelectorAll<HTMLElement>('[data-tilt]')];
  if (!cards.length || !fine.matches || calm.matches) return () => {};

  let frame = 0;
  let pending: { card: HTMLElement; x: number; y: number } | null = null;

  const flush = () => {
    frame = 0;
    if (!pending) return;
    const { card, x, y } = pending;
    pending = null;
    card.style.setProperty('--tilt-x', (x * 2 - 1).toFixed(3));
    card.style.setProperty('--tilt-y', (y * 2 - 1).toFixed(3));
    card.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`);
    card.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`);
  };

  // La posición se mide sobre el contenedor, que no gira: la caja de la
  // tarjeta inclinada cambia a cada paso y la hacía temblar en los bordes.
  const onMove = (event: PointerEvent) => {
    const card = event.currentTarget as HTMLElement;
    const bounds = (card.parentElement ?? card).getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - bounds.top) / bounds.height, 0), 1);
    card.classList.add(TILTING_CLASS);
    pending = { card, x, y };
    if (!frame) frame = requestAnimationFrame(flush);
  };

  const onLeave = (event: PointerEvent) => {
    const card = event.currentTarget as HTMLElement;
    if (pending?.card === card) pending = null;
    card.classList.remove(TILTING_CLASS);
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
    card.style.removeProperty('--glare-x');
    card.style.removeProperty('--glare-y');
  };

  cards.forEach((card) => {
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
  });

  return () => {
    cancelAnimationFrame(frame);
    cards.forEach((card) => {
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    });
  };
}
