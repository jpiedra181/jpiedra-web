import { useEffect, useRef } from "react";
import type { Dictamen } from "../../lib/autoevaluador";

type Props = {
  email: string;
  dictamen: Dictamen;
};

export function PantallaConfirmacion({ email, dictamen }: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent-subtle border border-accent mb-8 mx-auto">
        <svg
          className="w-10 h-10 text-accent"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2
        ref={tituloRef}
        tabIndex={-1}
        className="font-heading text-[clamp(2.25rem,5vw,4rem)] leading-[1.1] text-text-primary mb-6 outline-none"
        style={{ textWrap: "balance" }}
      >
        Hecho
      </h2>

      <p className="text-lg text-text-secondary leading-relaxed mb-3">
        Te he enviado el dictamen a{" "}
        <span className="text-text-primary font-medium">{email}</span>.
      </p>
      <p className="text-sm text-text-muted mb-12">
        Si no lo ves en bandeja en 5 minutos, revisa la carpeta de spam.
      </p>

      {dictamen !== "G" && (
        <div className="rounded-2xl border border-border bg-bg-surface p-6 md:p-8 mb-10 text-left">
          <h3 className="font-heading text-2xl md:text-3xl text-text-primary mb-3">
            ¿Necesitas ayuda para cumplir?
          </h3>
          <p className="text-text-secondary mb-6 leading-relaxed">
            Hago auditorías de accesibilidad según WCAG 2.1 AA y la Ley
            11/2023. Sin humo, sin mensualidades atadas.
          </p>
          <a
            href="/auditoria-accesibilidad"
            className="inline-flex items-center gap-2 bg-accent text-bg-primary px-7 py-3.5 rounded-full text-base font-medium hover:bg-accent-hover transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent min-h-[44px]"
          >
            Conocer mi servicio de auditoría
            <span aria-hidden="true">→</span>
          </a>
        </div>
      )}

      <div className="text-left rounded-2xl border border-border bg-bg-surface p-6 md:p-8">
        <p className="text-sm font-medium text-text-primary uppercase tracking-wider mb-4">
          Mientras tanto, puedes leer:
        </p>
        <ul className="space-y-3">
          <li>
            <a
              href="/blog/ley-11-2023-empresas-espanolas"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
            >
              <span className="text-accent" aria-hidden="true">
                →
              </span>
              Cómo afecta la Ley 11/2023 a las empresas españolas
            </a>
          </li>
          <li>
            <a
              href="/blog/sanciones-ley-11-2023"
              className="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors duration-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
            >
              <span className="text-accent" aria-hidden="true">
                →
              </span>
              Régimen sancionador de la Ley 11/2023
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
