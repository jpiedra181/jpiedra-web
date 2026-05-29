import { useEffect, useRef, useState } from "react";
import type { Pregunta } from "../../lib/autoevaluador";
import { BarraProgreso } from "./BarraProgreso";

type Props = {
  pregunta: Pregunta;
  paso: number;
  total: number;
  valor: string | string[];
  onSingle: (valor: string) => void;
  onMulti: (valores: string[]) => void;
  onSiguiente: () => void;
  onAnterior: () => void;
  mostrarAnterior: boolean;
};

export function PantallaPregunta({
  pregunta,
  paso,
  total,
  valor,
  onSingle,
  onMulti,
  onSiguiente,
  onAnterior,
  mostrarAnterior,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setError(null);
    tituloRef.current?.focus();
  }, [pregunta.id]);

  const valoresMulti = Array.isArray(valor) ? valor : [];
  const valorSingle = typeof valor === "string" ? valor : "";

  function handleMultiToggle(opcion: string) {
    if (pregunta.tipo !== "multi") return;
    setError(null);
    const exclusivo = pregunta.exclusivo;
    let nuevos: string[];

    if (opcion === exclusivo) {
      nuevos = valoresMulti.includes(exclusivo) ? [] : [exclusivo];
    } else {
      const sinExclusivo = valoresMulti.filter((v) => v !== exclusivo);
      nuevos = sinExclusivo.includes(opcion)
        ? sinExclusivo.filter((v) => v !== opcion)
        : [...sinExclusivo, opcion];
    }
    onMulti(nuevos);
  }

  function handleSiguienteClick() {
    if (pregunta.tipo === "multi" && valoresMulti.length === 0) {
      setError("Selecciona al menos una opción");
      return;
    }
    onSiguiente();
  }

  return (
    <div className="max-w-3xl mx-auto">
      <BarraProgreso paso={paso} total={total} />

      <div
        className="mt-12 md:mt-16"
        aria-live="polite"
        aria-atomic="true"
      >
        <h2
          ref={tituloRef}
          tabIndex={-1}
          className="font-heading text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.2] text-text-primary mb-10 outline-none"
          style={{ textWrap: "balance" }}
        >
          {pregunta.texto}
        </h2>

        <fieldset className="border-0 p-0 m-0">
          <legend className="sr-only">{pregunta.texto}</legend>
          <div className="flex flex-col gap-3 md:gap-4">
            {pregunta.opciones.map((opcion) => {
              const seleccionado =
                pregunta.tipo === "single"
                  ? valorSingle === opcion.valor
                  : valoresMulti.includes(opcion.valor);
              const tooltip =
                pregunta.tipo === "single"
                  ? pregunta.tooltips?.[opcion.valor]
                  : undefined;

              return (
                <OpcionBloque
                  key={opcion.valor}
                  tipo={pregunta.tipo}
                  preguntaId={pregunta.id}
                  valor={opcion.valor}
                  label={opcion.label}
                  ejemplos={opcion.ejemplos}
                  tooltip={tooltip}
                  seleccionado={seleccionado}
                  onSeleccionar={() => {
                    if (pregunta.tipo === "single") onSingle(opcion.valor);
                    else handleMultiToggle(opcion.valor);
                  }}
                />
              );
            })}
          </div>
        </fieldset>

        {error && (
          <p
            className="mt-4 text-sm text-red-400 font-body"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <div className="mt-10 md:mt-12 flex flex-wrap items-center gap-4">
        {mostrarAnterior && (
          <button
            type="button"
            onClick={onAnterior}
            className="cursor-pointer inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors duration-200 px-4 py-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-h-[44px]"
          >
            <span aria-hidden="true">←</span>
            Anterior
          </button>
        )}

        {pregunta.tipo === "multi" && (
          <button
            type="button"
            onClick={handleSiguienteClick}
            className="cursor-pointer ml-auto inline-flex items-center gap-2 bg-accent text-bg-primary px-7 py-3.5 rounded-full text-base font-medium hover:bg-accent-hover transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white min-h-[44px]"
          >
            Siguiente
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

type OpcionBloqueProps = {
  tipo: "single" | "multi";
  preguntaId: string;
  valor: string;
  label: string;
  ejemplos?: string;
  tooltip?: string;
  seleccionado: boolean;
  onSeleccionar: () => void;
};

function OpcionBloque({
  tipo,
  preguntaId,
  valor,
  label,
  ejemplos,
  tooltip,
  seleccionado,
  onSeleccionar,
}: OpcionBloqueProps) {
  const inputId = `${preguntaId}-${valor}`;
  const [tooltipAbierto, setTooltipAbierto] = useState(false);

  const baseClasses =
    "group relative flex items-start gap-4 w-full text-left rounded-xl border p-5 md:p-6 cursor-pointer transition-all duration-200 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent";
  const stateClasses = seleccionado
    ? "border-accent bg-accent-subtle"
    : "border-border bg-bg-surface hover:border-border-hover hover:bg-bg-elevated";

  return (
    <label
      htmlFor={inputId}
      className={`${baseClasses} ${stateClasses}`}
    >
      <input
        id={inputId}
        type={tipo === "single" ? "radio" : "checkbox"}
        name={preguntaId}
        value={valor}
        checked={seleccionado}
        onChange={onSeleccionar}
        className="sr-only peer"
      />

      <span
        className={`flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors duration-200 ${
          tipo === "single"
            ? "w-5 h-5 rounded-full border-2"
            : "w-5 h-5 rounded-md border-2"
        } ${
          seleccionado
            ? "border-accent bg-accent"
            : "border-text-muted group-hover:border-text-secondary"
        }`}
        aria-hidden="true"
      >
        {seleccionado && tipo === "single" && (
          <span className="w-2 h-2 rounded-full bg-bg-primary" />
        )}
        {seleccionado && tipo === "multi" && (
          <svg className="w-3.5 h-3.5 text-bg-primary" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10.5L8 14.5L16 6.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      <span className="flex-1 min-w-0">
        <span className="flex items-start gap-2 flex-wrap">
          <span className="text-base md:text-lg text-text-primary font-medium leading-snug">
            {label}
          </span>
          {tooltip && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTooltipAbierto((v) => !v);
              }}
              onMouseEnter={() => setTooltipAbierto(true)}
              onMouseLeave={() => setTooltipAbierto(false)}
              onFocus={() => setTooltipAbierto(true)}
              onBlur={() => setTooltipAbierto(false)}
              aria-label="Más información"
              aria-expanded={tooltipAbierto}
              className="cursor-help inline-flex items-center justify-center w-5 h-5 rounded-full border border-text-muted text-text-muted text-xs font-bold hover:border-accent hover:text-accent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              ?
            </button>
          )}
        </span>
        {ejemplos && (
          <span className="block mt-2 text-sm text-text-muted leading-relaxed">
            {ejemplos}
          </span>
        )}
        {tooltip && tooltipAbierto && (
          <span
            role="tooltip"
            className="block mt-3 p-3 rounded-lg bg-bg-elevated border border-border-hover text-xs text-text-secondary leading-relaxed"
          >
            {tooltip}
          </span>
        )}
      </span>
    </label>
  );
}
