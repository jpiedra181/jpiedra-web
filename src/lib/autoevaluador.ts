export type Respuestas = {
  p1: boolean | null;
  p2: boolean | null;
  p3: "concesion" | "centro_educativo" | "ninguno" | null;
  p4: "micro" | "no_micro" | "no_seguro" | null;
  p5: string[];
  p6: string[];
  p7: "fabricante" | "importador" | "distribuidor" | null;
};

export const RESPUESTAS_INICIALES: Respuestas = {
  p1: null,
  p2: null,
  p3: null,
  p4: null,
  p5: [],
  p6: [],
  p7: null,
};

export type Dictamen = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export function calcularDictamen(r: Respuestas): Dictamen {
  const tieneServicioCubierto =
    r.p5.length > 0 && !r.p5.includes("ninguna");
  const tieneProductoCubierto =
    r.p6.length > 0 && !r.p6.includes("ninguno");
  const esConcesionario =
    r.p3 === "concesion" || r.p3 === "centro_educativo";
  const esMicroempresa = r.p4 === "micro";

  if (r.p1) return "A";
  if (esConcesionario) return "E";
  if (tieneProductoCubierto) return "C";
  if (tieneServicioCubierto && !esMicroempresa) return "B";
  if (tieneServicioCubierto && esMicroempresa) return "D";
  if (!tieneServicioCubierto && !tieneProductoCubierto && r.p2) return "F";
  return "G";
}

export type OpcionPregunta = {
  valor: string;
  label: string;
  ejemplos?: string;
};

export type PreguntaSingle = {
  id: "p1" | "p2" | "p3" | "p4" | "p7";
  tipo: "single";
  texto: string;
  opciones: OpcionPregunta[];
  tooltips?: Record<string, string>;
};

export type PreguntaMulti = {
  id: "p5" | "p6";
  tipo: "multi";
  texto: string;
  opciones: OpcionPregunta[];
  exclusivo: string;
};

export type Pregunta = PreguntaSingle | PreguntaMulti;

export const PREGUNTAS: Pregunta[] = [
  {
    id: "p1",
    tipo: "single",
    texto: "¿Tu organización es del sector público o asimilado?",
    opciones: [
      {
        valor: "si",
        label: "Sí",
        ejemplos:
          "Administración pública, organismo autónomo, universidad pública, ente del sector público institucional",
      },
      {
        valor: "no",
        label: "No",
        ejemplos: "Soy empresa privada o autónomo",
      },
    ],
  },
  {
    id: "p2",
    tipo: "single",
    texto: "¿Recibes o has recibido financiación pública para tu web?",
    opciones: [
      {
        valor: "si",
        label: "Sí",
        ejemplos:
          "Kit Digital, NextGenerationEU, subvenciones autonómicas o similares para diseño o mantenimiento web",
      },
      { valor: "no", label: "No" },
    ],
  },
  {
    id: "p3",
    tipo: "single",
    texto: "¿Tu organización presta alguno de estos servicios?",
    opciones: [
      {
        valor: "concesion",
        label:
          "Gestiono servicios públicos por concesión, convenio o contrato",
        ejemplos: "Educación, sanidad, cultura, deporte, servicios sociales",
      },
      {
        valor: "centro_educativo",
        label:
          "Soy centro educativo, de formación o universitario privado sostenido total o parcialmente con fondos públicos",
      },
      {
        valor: "ninguno",
        label: "Ninguno de los anteriores",
      },
    ],
  },
  {
    id: "p4",
    tipo: "single",
    texto: "¿Cuál de estos describe tu empresa?",
    opciones: [
      {
        valor: "micro",
        label:
          "Soy autónomo o tengo menos de 10 empleados, y mi facturación anual es 2 millones de euros o menos",
      },
      {
        valor: "no_micro",
        label: "Tengo 10 o más empleados, o facturación superior a 2 millones de euros",
      },
      { valor: "no_seguro", label: "No estoy seguro" },
    ],
    tooltips: {
      no_seguro:
        "Si no estás seguro, asumimos que no eres microempresa para que el dictamen sea conservador.",
    },
  },
  {
    id: "p5",
    tipo: "multi",
    texto: "¿Tu actividad principal está cubierta? (puedes marcar varias)",
    opciones: [
      { valor: "comercio_electronico", label: "Comercio electrónico (venta online B2C)" },
      { valor: "banca", label: "Servicios bancarios para consumidores" },
      { valor: "telco", label: "Comunicaciones electrónicas (operador telco, ISP)" },
      { valor: "audiovisuales", label: "Servicios audiovisuales (streaming, plataformas vídeo)" },
      {
        valor: "transporte",
        label:
          "Transporte de pasajeros (aéreo, ferroviario, marítimo, autobús)",
      },
      { valor: "libro_electronico", label: "Libro electrónico o software para libro electrónico" },
      { valor: "emergencias", label: "Servicios de emergencia 112" },
      { valor: "ninguna", label: "Ninguna de las anteriores" },
    ],
    exclusivo: "ninguna",
  },
  {
    id: "p6",
    tipo: "multi",
    texto: "¿Vendes o distribuyes productos físicos cubiertos? (puedes marcar varias)",
    opciones: [
      {
        valor: "terminales",
        label:
          "Equipos terminales con interactividad (smartphones, tablets, ordenadores)",
      },
      {
        valor: "autoservicio",
        label: "Terminales de autoservicio (cajeros, máquinas de billetes, tótems)",
      },
      { valor: "lectores", label: "Lectores electrónicos" },
      { valor: "terminales_pago", label: "Terminales de pago" },
      { valor: "ninguno", label: "Ninguno" },
    ],
    exclusivo: "ninguno",
  },
  {
    id: "p7",
    tipo: "single",
    texto: "¿Cuál es tu rol respecto a esos productos?",
    opciones: [
      { valor: "fabricante", label: "Fabrico esos productos" },
      { valor: "importador", label: "Importo de fuera de la UE" },
      { valor: "distribuidor", label: "Distribuyo dentro de la UE sin alterarlos" },
    ],
  },
];

export function debeMostrarP7(r: Respuestas): boolean {
  return r.p6.length > 0 && !r.p6.includes("ninguno");
}

export function totalPreguntas(r: Respuestas): number {
  return debeMostrarP7(r) ? 7 : 6;
}

export type BulletDictamen = {
  tipo: "ok" | "warning";
  texto: string;
};

export type DictamenContent = {
  id: Dictamen;
  titulo: string;
  subtitulo: string;
  color: string;
  bullets: BulletDictamen[];
};

export const DICTAMENES: Record<Dictamen, DictamenContent> = {
  A: {
    id: "A",
    titulo: "Te aplica el RD 1112/2018",
    subtitulo: "Sector público completo",
    color: "#3B82F6",
    bullets: [
      { tipo: "ok", texto: "Cumplimiento técnico WCAG 2.1 AA / UNE-EN 301 549" },
      { tipo: "ok", texto: "Declaración de accesibilidad según Decisión UE 2018/1523" },
      { tipo: "ok", texto: "Mecanismo de comunicación y canal de quejas" },
      {
        tipo: "ok",
        texto:
          "Revisión periódica documentada (anual simplificada, trienal en profundidad)",
      },
      {
        tipo: "warning",
        texto: "Plenamente en vigor desde 2020 (web) y 2021 (apps móviles)",
      },
    ],
  },
  B: {
    id: "B",
    titulo: "Te aplica la Ley 11/2023",
    subtitulo: "Empresa privada con servicios cubiertos",
    color: "#F97316",
    bullets: [
      {
        tipo: "ok",
        texto: "Cumplimiento técnico WCAG 2.1 AA / UNE-EN 301 549 (art. 3)",
      },
      {
        tipo: "ok",
        texto: "Información de cumplimiento en condiciones generales (art. 13.2)",
      },
      {
        tipo: "ok",
        texto: "Mantenimiento de la información durante toda la vigencia del servicio",
      },
      { tipo: "warning", texto: "En vigor desde el 28 de junio de 2025" },
      {
        tipo: "warning",
        texto: "Sanciones hasta 1.000.000 € para infracciones muy graves",
      },
    ],
  },
  C: {
    id: "C",
    titulo: "Te aplica la Ley 11/2023 para productos",
    subtitulo: "Operador económico de productos cubiertos",
    color: "#F97316",
    bullets: [
      { tipo: "ok", texto: "Requisitos de accesibilidad del Anexo I de la Ley 11/2023" },
      { tipo: "ok", texto: "Marcado CE de accesibilidad antes de comercializar" },
      { tipo: "ok", texto: "Declaración UE de conformidad y documentación técnica" },
      { tipo: "ok", texto: "Conservación documental durante 5 años" },
      {
        tipo: "warning",
        texto: "Sanciones hasta 1.000.000 € para infracciones muy graves",
      },
    ],
  },
  D: {
    id: "D",
    titulo: "La Ley 11/2023 no te aplica (todavía)",
    subtitulo: "Microempresa de servicios — exenta art. 3.3",
    color: "#22C55E",
    bullets: [
      { tipo: "ok", texto: "Estás exenta del Título I de la Ley 11/2023 en servicios" },
      {
        tipo: "warning",
        texto: "Pierdes la exención si superas 10 empleados o 2M€ de facturación",
      },
      {
        tipo: "warning",
        texto: "Si recibes financiación pública, te aplica la DA 1ª del RD 1112/2018",
      },
      {
        tipo: "warning",
        texto: "La exención NO cubre productos cubiertos si los comercializas",
      },
    ],
  },
  E: {
    id: "E",
    titulo: "Estás en régimen híbrido",
    subtitulo: "Concesionario o centro educativo con fondos públicos",
    color: "#8B5CF6",
    bullets: [
      {
        tipo: "ok",
        texto: "Cumplimiento técnico exigido por la DA 1ª del RD 1112/2018",
      },
      {
        tipo: "ok",
        texto: "La obligación se materializa en bases reguladoras o pliegos del contrato",
      },
      {
        tipo: "warning",
        texto:
          "NO se te exige declaración formal estilo sector público (salvo que las bases lo digan)",
      },
      {
        tipo: "warning",
        texto:
          "Si además prestas servicios cubiertos, te aplica también el art. 13 Ley 11/2023",
      },
    ],
  },
  F: {
    id: "F",
    titulo: "Te aplica la DA 1ª del RD 1112/2018",
    subtitulo: "Has recibido financiación pública para la web",
    color: "#EAB308",
    bullets: [
      { tipo: "ok", texto: "Cumplimiento técnico de los arts. 5 y 6 del RD 1112/2018" },
      { tipo: "ok", texto: "Equivalente a WCAG 2.1 nivel AA" },
      { tipo: "warning", texto: "La obligación opera vía la Administración financiadora" },
      {
        tipo: "warning",
        texto:
          "Sin cumplimiento: reintegro de la ayuda + inhabilitación para futuras convocatorias",
      },
    ],
  },
  G: {
    id: "G",
    titulo: "La Ley 11/2023 no te aplica (de momento)",
    subtitulo: "Sin obligación legal directa",
    color: "#10B981",
    bullets: [
      { tipo: "ok", texto: "No tienes obligación legal directa hoy" },
      {
        tipo: "warning",
        texto:
          "Si tu empresa crece, cambia de actividad o pide ayudas públicas, tu estado puede cambiar",
      },
      {
        tipo: "warning",
        texto:
          "Clientes B2B grandes y pliegos públicos suelen exigir accesibilidad aunque la ley no obligue",
      },
    ],
  },
};

export const WEBHOOK_URL =
  "https://n8n.zerosugar.studio/webhook/autoevaluador-ley";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}
