import { useEffect, useRef, useState } from "react";
import type { Dictamen, Respuestas } from "../../lib/autoevaluador";
import { WEBHOOK_URL, emailValido } from "../../lib/autoevaluador";

type Props = {
  respuestas: Respuestas;
  dictamen: Dictamen;
  onExito: (email: string) => void;
  onVolver: () => void;
};

type EstadoEnvio = "idle" | "enviando" | "error";

export function PantallaCaptura({
  respuestas,
  dictamen,
  onExito,
  onVolver,
}: Props) {
  const [email, setEmail] = useState("");
  const [errorInline, setErrorInline] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoEnvio>("idle");
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorInline(null);
    setMensajeError(null);

    const emailLimpio = email.trim();
    if (!emailLimpio) {
      setErrorInline("Necesito tu email para enviarte el PDF");
      return;
    }
    if (!emailValido(emailLimpio)) {
      setErrorInline("El formato del email no es válido");
      return;
    }

    setEstado("enviando");

    const payload = {
      email: emailLimpio,
      respuestas: {
        p1: respuestas.p1 === true,
        p2: respuestas.p2 === true,
        p3: respuestas.p3 ?? "ninguno",
        p4: respuestas.p4 ?? "no_seguro",
        p5: respuestas.p5,
        p6: respuestas.p6,
        p7: respuestas.p7,
      },
      dictamen,
      meta: {
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent : "",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Hay un problema con los datos. Revisa el email.");
        }
        if (response.status >= 500) {
          throw new Error(
            "Hubo un problema enviando el dictamen. Por favor, vuelve a intentarlo en un momento."
          );
        }
        throw new Error(`Error ${response.status}`);
      }

      onExito(emailLimpio);
    } catch (err) {
      const e = err as Error;
      let mensaje: string;
      if (e.name === "AbortError") {
        mensaje =
          "Hubo un problema enviando el dictamen. Por favor, vuelve a intentarlo en un momento.";
      } else if (
        typeof navigator !== "undefined" &&
        !navigator.onLine
      ) {
        mensaje = "Comprueba tu conexión a internet";
      } else if (e.message && !e.message.startsWith("Error ")) {
        mensaje = e.message;
      } else {
        mensaje =
          "Hubo un problema enviando el dictamen. Por favor, vuelve a intentarlo en un momento.";
      }
      setMensajeError(mensaje);
      setEstado("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <span className="h-px w-8 bg-accent" aria-hidden="true" />
        <span className="text-xs font-body font-medium tracking-[0.2em] text-accent uppercase">
          Último paso
        </span>
      </div>

      <h2
        className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.15] text-text-primary mb-6"
        style={{ textWrap: "balance" }}
      >
        ¿A qué email te envío el PDF?
      </h2>

      <p className="text-text-secondary leading-relaxed mb-10">
        Te llegará en menos de 2 minutos. Sin newsletter, sin spam: solo el
        dictamen detallado.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col gap-3">
          <label
            htmlFor="autoeval-email"
            className="text-sm font-medium text-text-primary"
          >
            Tu email
          </label>
          <input
            ref={inputRef}
            id="autoeval-email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorInline) setErrorInline(null);
            }}
            autoComplete="email"
            inputMode="email"
            disabled={estado === "enviando"}
            aria-invalid={errorInline ? "true" : "false"}
            aria-describedby={errorInline ? "autoeval-email-error" : undefined}
            placeholder="tunombre@empresa.com"
            className="w-full bg-transparent border-0 border-b-2 border-border px-0 py-3 text-base text-text-primary placeholder:text-text-muted focus:outline-none focus-visible:border-accent transition-colors duration-200 aria-[invalid=true]:border-red-400 disabled:opacity-60"
          />
          {errorInline && (
            <p
              id="autoeval-email-error"
              className="text-sm text-red-400"
              role="alert"
            >
              {errorInline}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <button
            type="submit"
            disabled={estado === "enviando"}
            className="cursor-pointer inline-flex items-center gap-2 bg-accent text-bg-primary px-7 py-3.5 rounded-full text-base font-medium hover:bg-accent-hover transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
          >
            {estado === "enviando" ? (
              <>
                <Spinner />
                Enviando…
              </>
            ) : (
              <>
                Recibir el PDF
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onVolver}
            disabled={estado === "enviando"}
            className="cursor-pointer inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200 px-4 py-3 rounded-full focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60 min-h-[44px]"
          >
            <span aria-hidden="true">←</span>
            Volver al dictamen
          </button>
        </div>

        {mensajeError && (
          <p
            role="alert"
            aria-live="assertive"
            className="text-sm text-red-400 mt-2"
          >
            {mensajeError}
          </p>
        )}
      </form>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M22 12C22 6.477 17.523 2 12 2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
