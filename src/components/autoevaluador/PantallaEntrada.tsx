type Props = {
  onEmpezar: () => void;
};

export function PantallaEntrada({ onEmpezar }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <span className="h-px w-8 bg-accent" aria-hidden="true" />
        <span className="text-xs font-body font-medium tracking-[0.2em] text-accent uppercase">
          Autoevaluador gratuito
        </span>
      </div>

      <h1
        className="font-heading text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] text-text-primary mb-6"
        style={{ textWrap: "balance" }}
      >
        ¿Te aplica la Ley 11/2023?{" "}
        <span className="text-accent italic">Averígualo en 2 minutos.</span>
      </h1>

      <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl mb-10">
        La nueva ley de accesibilidad ha cambiado las reglas para muchas
        empresas. Te hago 7 preguntas concretas y te digo exactamente qué te
        aplica, qué tienes que hacer y cuánto te puede costar no hacerlo.
      </p>

      <div className="rounded-2xl border border-border bg-bg-surface p-6 md:p-8 mb-10">
        <p className="text-sm font-medium text-text-primary mb-4 uppercase tracking-wider">
          Al final obtienes:
        </p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-text-secondary">
            <CheckIcon />
            <span>Dictamen claro de tu situación legal</span>
          </li>
          <li className="flex items-start gap-3 text-text-secondary">
            <CheckIcon />
            <span>PDF con análisis completo y plan de acción de 30 días</span>
          </li>
          <li className="flex items-start gap-3 text-text-secondary">
            <CheckIcon />
            <span>
              Referencias normativas concretas (artículos del BOE)
            </span>
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onEmpezar}
        className="cursor-pointer inline-flex items-center gap-3 bg-accent text-bg-primary px-8 py-4 rounded-full text-base font-medium hover:bg-accent-hover transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent min-h-[44px]"
      >
        Empezar el autoevaluador
        <span aria-hidden="true">→</span>
      </button>

      <p className="text-sm text-text-muted mt-6">
        2 minutos. Sin registro previo. El email solo te lo pido al final si
        quieres el PDF.
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10.5L8 14.5L16 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
