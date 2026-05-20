type Props = {
  paso: number;
  total: number;
};

export function BarraProgreso({ paso, total }: Props) {
  const porcentaje = Math.min(100, Math.round((paso / total) * 100));

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-xs font-medium tracking-[0.2em] uppercase text-accent">
          Pregunta {paso} de {total}
        </span>
        <span className="text-xs font-body text-text-muted tabular-nums">
          {porcentaje}%
        </span>
      </div>
      <div
        className="h-1 w-full bg-bg-elevated rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
        aria-label={`Progreso: pregunta ${paso} de ${total}`}
      >
        <div
          className="h-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}
