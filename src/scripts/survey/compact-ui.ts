// Home 3D en pantallas pequeñas: el menú hamburguesa y la hoja «Qué hago».
// No dependen de la escena: funcionan antes de que cargue el relieve y
// también si WebGL falla. Sin JavaScript, el CSS no esconde nada.

// Misma condición que el bloque "compacto" de SurveyHome.astro.
export const COMPACT_QUERY = '(max-width: 767px), (orientation: landscape) and (max-height: 560px)';

const MENU_OPEN_CLASS = 'survey-menu-open';
const SHEET_OPEN_CLASS = 'survey-sheet-open';

// --- Menú ---------------------------------------------------------------------
// Como el menú móvil del resto de la web (Header.astro): panel a pantalla
// completa, el fondo queda inerte, Tab no sale del menú y Escape lo cierra
// devolviendo el foco al botón.

export function wireSurveyMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const nav = document.querySelector<HTMLElement>('.survey-nav');
  if (!button || !nav) return;

  const root = document.documentElement;
  const background = Array.from(document.querySelectorAll<HTMLElement>('.survey-logo, .survey-main'));
  const compact = window.matchMedia(COMPACT_QUERY);
  const isOpen = () => root.classList.contains(MENU_OPEN_CLASS);

  // La escena reencuadra la cámara al cambiar el tamaño midiendo la cabecera;
  // con el menú abierto mediría el panel a pantalla completa. Si se giró el
  // móvil con el menú abierto, al cerrarlo se le pide encuadrar de nuevo.
  let resizedWhileOpen = false;
  window.addEventListener('resize', () => {
    if (isOpen()) resizedWhileOpen = true;
  });

  const setOpen = (open: boolean) => {
    root.classList.toggle(MENU_OPEN_CLASS, open);
    button.setAttribute('aria-expanded', String(open));
    for (const element of background) element.inert = open;
    if (!open && resizedWhileOpen) {
      resizedWhileOpen = false;
      window.dispatchEvent(new Event('resize'));
    }
  };

  button.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      setOpen(false);
      button.focus();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [button, ...Array.from(nav.querySelectorAll<HTMLElement>('a'))];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Al pasar a pantalla grande (girar la tableta, agrandar la ventana) la
  // navegación vuelve a ser la cápsula: un menú abierto dejaría la página inerte.
  compact.addEventListener('change', () => {
    if (!compact.matches && isOpen()) setOpen(false);
  });

  // Al volver con "atrás" el navegador restaura la página con el menú abierto.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && isOpen()) setOpen(false);
  });
}

// --- Qué hago -----------------------------------------------------------------
// En móvil el titular va solo sobre la sierra; el subtítulo, la pista y la
// pregunta de cada cumbre suben en una hoja desde abajo. Desplegarlos en el
// sitio no cabía: para dejarles hueco la cámara se alejaba hasta que la
// sierra era una baldosa. Es un <dialog> nativo: Escape lo cierra, el resto
// de la página queda inerte y el foco vuelve al botón al cerrar.

export function wireSurveySheet(): void {
  const openButton = document.querySelector<HTMLButtonElement>('[data-sheet-open]');
  const sheet = document.querySelector<HTMLDialogElement>('.survey-sheet');
  if (!openButton || !sheet) return;

  const root = document.documentElement;
  const compact = window.matchMedia(COMPACT_QUERY);

  openButton.addEventListener('click', () => {
    sheet.showModal();
    root.classList.add(SHEET_OPEN_CLASS);
  });
  sheet.addEventListener('close', () => root.classList.remove(SHEET_OPEN_CLASS));
  sheet.querySelector('[data-sheet-close]')?.addEventListener('click', () => sheet.close());

  // Un toque fuera de la hoja (en el fondo oscurecido) la cierra.
  sheet.addEventListener('click', (event) => {
    if (event.target !== sheet) return;
    const box = sheet.getBoundingClientRect();
    const inside =
      event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) sheet.close();
  });

  // Cada apartado de la hoja hace lo mismo que su cumbre en el mapa: con la
  // escena cargada, la cámara vuela hasta ella antes de cambiar de página.
  for (const link of sheet.querySelectorAll<HTMLAnchorElement>('[data-sheet-link]')) {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const summit = document.querySelector<HTMLAnchorElement>(`[data-vertex][href="${link.getAttribute('href')}"]`);
      if (!summit) return;
      event.preventDefault();
      sheet.close();
      summit.click();
    });
  }

  compact.addEventListener('change', () => {
    if (!compact.matches && sheet.open) sheet.close();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && sheet.open) sheet.close();
  });
}
