import { useEffect, useRef } from "react";
import type { DictamenContent } from "../../lib/autoevaluador";

type Props = {
  dictamen: DictamenContent;
  onContinuar: () => void;
  onVolver: () => void;
};

export function PantallaDictamen({ dictamen, onContinuar, onVolver }: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <span
          className="h-px w-8"
          style={{ backgroundColor: dictamen.color }}
          aria-hidden="true"
        />
        <span
          className="text-xs font-body font-medium tracking-[0.2em] uppercase"
          style={{ color: dictamen.color }}
        >
          Tu situación
        </span>
      </div>

      <h2
        ref={tituloRef}
        tabIndex={-1}
        className="font-heading text-[clamp(2rem,5vw,4rem)] leading-[1.1] text-text-primary mb-4 outline-none"
        style={{ textWrap: "balance" }}
      >
        {dictamen.titulo}
      </h2>

      <p className="font-heading italic text-xl md:text-2xl text-text-secondary mb-10">
        {dictamen.subtitulo}
      </p>

      <div
        className="rounded-2xl border bg-bg-surface p-6 md:p-8 mb-10"
        style={{
          borderColor: `${dictamen.color}40`,
        }}
      >
        <ul className="space-y-4">
          {dictamen.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              {bullet.tipo === "ok" ? (
                <CheckIcon color={dictamen.color} />
              ) : (
                <WarningIcon color={dictamen.color} />
              )}
              <span className="text-text-primary leading-relaxed">
                {bullet.texto}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-border-hover bg-bg-elevated p-6 md:p-8">
        <h3 className="font-heading text-2xl md:text-3xl text-text-primary mb-3">
          ¿Te envío el dictamen detallado?
        </h3>
        <p className="text-text-secondary leading-relaxed mb-6">
          He preparado un PDF con análisis completo de tu situación:
        </p>
        <ul className="space-y-2 mb-8 text-text-secondary">
          <li className="flex gap-2">
            <span className="text-accent" aria-hidden="true">
              •
            </span>
            Marco legal con artículos del BOE
          </li>
          <li className="flex gap-2">
            <span className="text-accent" aria-hidden="true">
              •
            </span>
            Obligaciones concretas que te aplican
          </li>
          <li className="flex gap-2">
            <span className="text-accent" aria-hidden="true">
              •
            </span>
            Plan de acción de 30 días
          </li>
          <li className="flex gap-2">
            <span className="text-accent" aria-hidden="true">
              •
            </span>
            Sanciones que arriesgas si no cumples
          </li>
        </ul>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={onContinuar}
            className="cursor-pointer inline-flex items-center gap-2 bg-accent text-bg-primary px-7 py-3.5 rounded-full text-base font-medium hover:bg-accent-hover transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent min-h-[44px]"
          >
            Recibir el PDF
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            onClick={onVolver}
            className="cursor-pointer inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200 px-4 py-3 rounded-full focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent min-h-[44px]"
          >
            <span aria-hidden="true">←</span>
            Revisar respuestas
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      className="w-5 h-5 flex-shrink-0 mt-0.5"
      style={{ color }}
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

function WarningIcon({ color }: { color: string }) {
  return (
    <svg
      className="w-5 h-5 flex-shrink-0 mt-0.5"
      style={{ color }}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 2.5L18.5 17.5H1.5L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M10 8V12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14.75" r="0.9" fill="currentColor" />
    </svg>
  );
}
