import { useMemo, useState } from "react";
import {
  PREGUNTAS,
  RESPUESTAS_INICIALES,
  calcularDictamen,
  DICTAMENES,
  debeMostrarP7,
  totalPreguntas,
  type Respuestas,
} from "../../lib/autoevaluador";
import { PantallaEntrada } from "./PantallaEntrada";
import { PantallaPregunta } from "./PantallaPregunta";
import { PantallaDictamen } from "./PantallaDictamen";
import { PantallaCaptura } from "./PantallaCaptura";
import { PantallaConfirmacion } from "./PantallaConfirmacion";

type Fase = "entrada" | "preguntas" | "dictamen" | "captura" | "confirmacion";

export function Autoevaluador() {
  const [fase, setFase] = useState<Fase>("entrada");
  const [indicePregunta, setIndicePregunta] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>(RESPUESTAS_INICIALES);
  const [emailEnviado, setEmailEnviado] = useState("");

  const preguntasOrdenadas = useMemo(() => {
    return debeMostrarP7(respuestas)
      ? PREGUNTAS
      : PREGUNTAS.filter((p) => p.id !== "p7");
  }, [respuestas]);

  const pregunta = preguntasOrdenadas[indicePregunta];
  const total = totalPreguntas(respuestas);
  const dictamenId = useMemo(() => calcularDictamen(respuestas), [respuestas]);

  function obtenerValor(): string | string[] {
    if (!pregunta) return "";
    switch (pregunta.id) {
      case "p1":
        return respuestas.p1 === true
          ? "si"
          : respuestas.p1 === false
            ? "no"
            : "";
      case "p2":
        return respuestas.p2 === true
          ? "si"
          : respuestas.p2 === false
            ? "no"
            : "";
      case "p3":
        return respuestas.p3 ?? "";
      case "p4":
        return respuestas.p4 ?? "";
      case "p5":
        return respuestas.p5;
      case "p6":
        return respuestas.p6;
      case "p7":
        return respuestas.p7 ?? "";
    }
  }

  function aplicarSingle(valor: string) {
    if (!pregunta) return;
    const id = pregunta.id;
    setRespuestas((prev) => {
      const next = { ...prev };
      switch (id) {
        case "p1":
          next.p1 = valor === "si";
          break;
        case "p2":
          next.p2 = valor === "si";
          break;
        case "p3":
          next.p3 = valor as Respuestas["p3"];
          break;
        case "p4":
          next.p4 = valor as Respuestas["p4"];
          break;
        case "p7":
          next.p7 = valor as Respuestas["p7"];
          break;
      }
      return next;
    });
  }

  function aplicarMulti(valores: string[]) {
    if (!pregunta) return;
    const id = pregunta.id;
    setRespuestas((prev) => {
      const next = { ...prev };
      if (id === "p5") next.p5 = valores;
      if (id === "p6") {
        next.p6 = valores;
        if (valores.includes("ninguno") || valores.length === 0) {
          next.p7 = null;
        }
      }
      return next;
    });
  }

  function avanzar() {
    setIndicePregunta((idx) => {
      const siguiente = idx + 1;
      if (siguiente >= preguntasOrdenadas.length) {
        setFase("dictamen");
        return idx;
      }
      return siguiente;
    });
  }

  function retroceder() {
    setIndicePregunta((idx) => Math.max(0, idx - 1));
  }

  function reiniciarADictamenDesdeCaptura() {
    setFase("dictamen");
  }

  function reiniciarDesdeDictamenAUltimaPregunta() {
    const lista = debeMostrarP7(respuestas)
      ? PREGUNTAS
      : PREGUNTAS.filter((p) => p.id !== "p7");
    setIndicePregunta(lista.length - 1);
    setFase("preguntas");
  }

  return (
    <section
      className="relative py-20 md:py-28 lg:py-32 min-h-[80vh]"
      aria-labelledby="autoevaluador-region"
    >
      <h1 id="autoevaluador-region" className="sr-only">
        Autoevaluador de la Ley 11/2023
      </h1>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full">
        {fase === "entrada" && (
          <PantallaEntrada
            onEmpezar={() => {
              setIndicePregunta(0);
              setFase("preguntas");
            }}
          />
        )}

        {fase === "preguntas" && pregunta && (
          <PantallaPregunta
            key={pregunta.id}
            pregunta={pregunta}
            paso={indicePregunta + 1}
            total={total}
            valor={obtenerValor()}
            onSingle={aplicarSingle}
            onMulti={aplicarMulti}
            onSiguiente={avanzar}
            onAnterior={retroceder}
            mostrarAnterior={indicePregunta > 0}
          />
        )}

        {fase === "dictamen" && (
          <PantallaDictamen
            dictamen={DICTAMENES[dictamenId]}
            onContinuar={() => setFase("captura")}
            onVolver={reiniciarDesdeDictamenAUltimaPregunta}
          />
        )}

        {fase === "captura" && (
          <PantallaCaptura
            respuestas={respuestas}
            dictamen={dictamenId}
            onExito={(email) => {
              setEmailEnviado(email);
              setFase("confirmacion");
            }}
            onVolver={reiniciarADictamenDesdeCaptura}
          />
        )}

        {fase === "confirmacion" && (
          <PantallaConfirmacion email={emailEnviado} dictamen={dictamenId} />
        )}
      </div>
    </section>
  );
}
