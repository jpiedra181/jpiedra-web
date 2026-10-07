// Foco de luz que sigue al cursor dentro de las tarjetas con data-spotlight.
// Solo escribe dos variables CSS en la tarjeta que tiene el ratón encima: el
// degradado lo pinta el CSS de cada componente (--spot-x, --spot-y).

export function initSpotlights(root: ParentNode = document): () => void {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const cards = [...root.querySelectorAll<HTMLElement>('[data-spotlight]')];
  if (!cards.length || !fine.matches) return () => {};

  let frame = 0;
  let pending: { card: HTMLElement; x: number; y: number } | null = null;

  const flush = () => {
    frame = 0;
    if (!pending) return;
    pending.card.style.setProperty('--spot-x', `${pending.x.toFixed(0)}px`);
    pending.card.style.setProperty('--spot-y', `${pending.y.toFixed(0)}px`);
    pending = null;
  };

  const onMove = (event: PointerEvent) => {
    const card = event.currentTarget as HTMLElement;
    const bounds = card.getBoundingClientRect();
    pending = { card, x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    if (!frame) frame = requestAnimationFrame(flush);
  };

  cards.forEach((card) => card.addEventListener('pointermove', onMove));
  return () => {
    cancelAnimationFrame(frame);
    cards.forEach((card) => card.removeEventListener('pointermove', onMove));
  };
}
