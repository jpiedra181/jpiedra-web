// Demo del agente de /agentes-ia (AgentDemo.astro): cambia entre la ficha tal
// como está y la arreglada, y repite la vuelta del agente. La primera vuelta
// arranca sola al llegar a la demo y dura unos 4 s (WCAG 2.2.2).

const HINT_AFTER_MS = 4400;

export function initAgentDemo(root: HTMLElement): () => void {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-version]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-for]')];
  const status = root.querySelector<HTMLElement>('[data-agent-status]');
  let hintTimer = 0;

  const play = () => {
    root.classList.remove('is-playing');
    // Fuerza a recalcular estilos para que la animación empiece de cero.
    void root.offsetWidth;
    root.classList.add('is-playing');
  };

  const show = (version: string, announce: boolean) => {
    root.dataset.state = version;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.version === version)));
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.for !== version;
    });
    root.classList.remove('is-hinting');
    play();
    if (announce && status) {
      const result = root.querySelector<HTMLElement>(`[data-for="${version}"] .agent-result`);
      status.textContent = result?.textContent?.trim() ?? '';
    }
  };

  const onClick = (event: Event) => {
    const version = (event.currentTarget as HTMLButtonElement).dataset.version;
    if (version) show(version, true);
  };

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      play();
      hintTimer = window.setTimeout(() => root.classList.add('is-hinting'), HINT_AFTER_MS);
    },
    { threshold: 0.5 },
  );

  buttons.forEach((button) => button.addEventListener('click', onClick));
  observer.observe(root);

  return () => {
    window.clearTimeout(hintTimer);
    observer.disconnect();
    buttons.forEach((button) => button.removeEventListener('click', onClick));
  };
}
