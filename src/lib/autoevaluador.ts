export type Respuestas = {
  p1: boolean | null;
  p2: boolean | null;
  p3: "concesion" | "centro_educativo" | "empresa_publica" | "ninguno" | null;
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

function tieneServicioCubierto(r: Respuestas): boolean {
  return r.p5.length > 0 && !r.p5.includes("ninguna");
}

function tieneProductoCubierto(r: Respuestas): boolean {
  return r.p6.length > 0 && !r.p6.includes("ninguno");
}

function esRegimenHibrido(r: Respuestas): boolean {
  return (
    r.p3 === "concesion" ||
    r.p3 === "centro_educativo" ||
    r.p3 === "empresa_publica"
  );
}

export function calcularDictamen(r: Respuestas): Dictamen {
  const esMicroempresa = r.p4 === "micro";

  if (r.p1) return "A";
  if (esRegimenHibrido(r)) return "E";
  if (tieneProductoCubierto(r)) return "C";
  if (tieneServicioCubierto(r) && !esMicroempresa) return "B";
  // Micro con servicios cubiertos: exenta de la Ley 11/2023, pero si su web se
  // pagó con ayudas públicas la DA 1ª del RD 1112/2018 le obliga igualmente.
  // El dictamen operativo es F, no "estás exenta".
  if (tieneServicioCubierto(r) && esMicroempresa) return r.p2 ? "F" : "D";
  if (r.p2) return "F";
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

// El orden del array ES el orden del flujo: quién eres → qué haces → qué
// tamaño tienes. El tamaño va al final porque solo se pregunta cuando decide
// algo (servicios cubiertos sin productos).
export const PREGUNTAS: Pregunta[] = [
  {
    id: "p1",
    tipo: "single",
    texto: "¿Tu organización es una administración o un organismo público?",
    opciones: [
      {
        valor: "si",
        label: "Sí",
        ejemplos:
          "Ayuntamiento, diputación, ministerio, organismo autónomo, universidad pública",
      },
      {
        valor: "no",
        label: "No",
        ejemplos:
          "Empresa privada o autónomo. Las empresas públicas que venden al público también responden No: su caso sale en la pregunta 3",
      },
    ],
  },
  {
    id: "p2",
    tipo: "single",
    texto: "¿Has recibido ayudas públicas para crear o mantener tu web?",
    opciones: [
      {
        valor: "si",
        label: "Sí",
        ejemplos:
          "Kit Digital, fondos NextGenerationEU, subvenciones autonómicas o locales para la web o la tienda online",
      },
      {
        valor: "no",
        label: "No",
        ejemplos:
          "Ninguna ayuda pública ha pagado esta web, ni entera ni en parte",
      },
    ],
  },
  {
    id: "p3",
    tipo: "single",
    texto: "¿Alguna de estas situaciones es la tuya?",
    opciones: [
      {
        valor: "concesion",
        label: "Presto un servicio público en nombre de una administración",
        ejemplos:
          "Por concesión, convenio o contrato: clínica con concierto sanitario, residencia con plazas públicas, piscina municipal gestionada por empresa",
      },
      {
        valor: "centro_educativo",
        label: "Soy un centro educativo o de formación con financiación pública",
        ejemplos:
          "Colegio concertado, universidad privada con fondos públicos, academia con cursos subvencionados por el SEPE o la comunidad autónoma",
      },
      {
        valor: "empresa_publica",
        label: "Somos una empresa pública",
        ejemplos:
          "Sociedad mercantil de capital público que vende servicios al público: transporte, hostelería, ocio, servicios urbanos",
      },
      {
        valor: "ninguno",
        label: "Ninguna de las anteriores",
      },
    ],
  },
  {
    id: "p5",
    tipo: "multi",
    texto: "¿Ofreces alguno de estos servicios? Puedes marcar varios.",
    opciones: [
      {
        valor: "comercio_electronico",
        label: "Se puede comprar o contratar en mi web",
        ejemplos:
          "Tienda online, reservas o citas que se pagan por la web, contratación online de servicios — a particulares",
      },
      {
        valor: "banca",
        label: "Servicios bancarios o financieros para particulares",
        ejemplos: "Banca, crédito al consumo, servicios de pago, inversión",
      },
      {
        valor: "telco",
        label: "Doy servicio de telefonía o internet",
        ejemplos: "Operador de telecomunicaciones, ISP, operador móvil virtual",
      },
      {
        valor: "audiovisuales",
        label: "Doy acceso a contenidos audiovisuales",
        ejemplos: "Plataforma de streaming o vídeo bajo demanda, y sus apps",
      },
      {
        valor: "transporte",
        label: "Transporte de viajeros",
        ejemplos:
          "Aéreo, tren, barco o autobús: sus webs, apps y venta de billetes online",
      },
      {
        valor: "libro_electronico",
        label: "Vendo o edito libros electrónicos",
        ejemplos: "Ebooks o el software para leerlos",
      },
      {
        valor: "emergencias",
        label: "Atiendo comunicaciones de emergencia",
        ejemplos: "Servicios del número 112",
      },
      { valor: "ninguna", label: "Nada de esto" },
    ],
    exclusivo: "ninguna",
  },
  {
    id: "p6",
    tipo: "multi",
    texto:
      "¿Fabricas, importas o vendes alguno de estos productos? Puedes marcar varios.",
    opciones: [
      {
        valor: "terminales",
        label: "Ordenadores, móviles o tablets",
        ejemplos: "Equipos de consumo con los que el usuario interactúa",
      },
      {
        valor: "autoservicio",
        label: "Máquinas de autoservicio",
        ejemplos:
          "Cajeros, máquinas de billetes o de turnos, terminales de facturación, tótems interactivos",
      },
      { valor: "lectores", label: "Lectores de libro electrónico" },
      { valor: "terminales_pago", label: "Datáfonos y terminales de pago" },
      { valor: "ninguno", label: "Ninguno de estos" },
    ],
    exclusivo: "ninguno",
  },
  {
    id: "p7",
    tipo: "single",
    texto:
      "Con esos productos, ¿qué papel tienes? Si haces varias cosas, marca la primera que te encaje.",
    opciones: [
      {
        valor: "fabricante",
        label: "Los fabrico, o los vendo con mi marca",
      },
      {
        valor: "importador",
        label: "Los traigo de fuera de la UE para venderlos aquí",
      },
      {
        valor: "distribuidor",
        label: "Los compro a fabricantes o mayoristas de la UE y los vendo",
      },
    ],
  },
  {
    id: "p4",
    tipo: "single",
    texto: "¿Qué tamaño tiene tu empresa?",
    opciones: [
      {
        valor: "micro",
        label:
          "Somos menos de 10 personas y facturamos 2 millones de euros o menos al año",
        ejemplos: "Cuenta también si eres autónomo sin empleados",
      },
      {
        valor: "no_micro",
        label: "Somos 10 o más personas, o facturamos más de 2 millones",
      },
    ],
  },
];

const PREGUNTA_POR_ID = new Map(PREGUNTAS.map((p) => [p.id, p]));

function porIds(ids: Array<Pregunta["id"]>): Pregunta[] {
  return ids.map((id) => PREGUNTA_POR_ID.get(id)!);
}

/**
 * Preguntas que se muestran, en orden, según lo ya respondido.
 *
 * El flujo corta en cuanto el dictamen está decidido: a un ayuntamiento no se
 * le pregunta cuánto factura, y el tamaño solo aparece cuando de verdad decide
 * el dictamen (servicios cubiertos sin productos). La lista crece o se acorta
 * al responder; la barra de progreso lo refleja.
 */
export function preguntasVisibles(r: Respuestas): Pregunta[] {
  if (r.p1 === true) return porIds(["p1"]);

  const ids: Array<Pregunta["id"]> = ["p1", "p2", "p3"];
  if (esRegimenHibrido(r)) return porIds(ids);

  ids.push("p5", "p6");
  if (tieneProductoCubierto(r)) ids.push("p7");
  else if (tieneServicioCubierto(r)) ids.push("p4");

  return porIds(ids);
}

export function totalPreguntas(r: Respuestas): number {
  return preguntasVisibles(r).length;
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
  /** Lo que promete el PDF de este dictamen en PantallaDictamen. */
  pdfIncluye: string[];
  /** Qué servicio se ofrece tras la captura, en PantallaConfirmacion. */
  cta: "auditoria" | "diagnostico";
};

export const DICTAMENES: Record<Dictamen, DictamenContent> = {
  A: {
    id: "A",
    titulo: "Te aplica el RD 1112/2018",
    subtitulo: "Sector público",
    color: "#3B82F6",
    bullets: [
      {
        tipo: "ok",
        texto:
          "Tu web y tus apps deben cumplir WCAG 2.1 AA (norma UNE-EN 301 549)",
      },
      {
        tipo: "ok",
        texto:
          "Declaración de accesibilidad publicada, con el modelo oficial europeo",
      },
      {
        tipo: "ok",
        texto: "Canal para que cualquier persona comunique problemas y reclame",
      },
      {
        tipo: "ok",
        texto: "Revisiones periódicas documentadas de la accesibilidad",
      },
      {
        tipo: "warning",
        texto:
          "Plenamente en vigor desde 2020 (web) y 2021 (apps): no hay plazo pendiente",
      },
    ],
    pdfIncluye: [
      "Tus obligaciones del RD 1112/2018, artículo a artículo",
      "Cómo son la declaración de accesibilidad y el canal de quejas",
      "Qué revisa el Observatorio de Accesibilidad Web y cómo",
      "Qué hacer ahora, paso a paso y con tiempos reales",
    ],
    cta: "auditoria",
  },
  B: {
    id: "B",
    titulo: "Te aplica la Ley 11/2023",
    subtitulo: "Empresa con servicios cubiertos",
    color: "#F97316",
    bullets: [
      {
        tipo: "ok",
        texto:
          "Tu web y tu servicio digital deben cumplir WCAG 2.1 AA (UNE-EN 301 549)",
      },
      {
        tipo: "ok",
        texto:
          "Debes explicar en tus condiciones generales cómo cumples (art. 13.2)",
      },
      {
        tipo: "ok",
        texto: "Esa información se mantiene mientras prestes el servicio",
      },
      {
        tipo: "warning",
        texto: "Obligatorio desde el 28 de junio de 2025 — ya está en vigor",
      },
      {
        tipo: "warning",
        texto:
          "Multas de hasta 90.000 € por infracción grave; hasta 1.000.000 € las muy graves",
      },
    ],
    pdfIncluye: [
      "Tus dos obligaciones (arts. 3 y 13.2), explicadas en claro",
      "Sanciones reales: las cifras del régimen vigente, sin inflar",
      "Tu propia cuenta de lo que las barreras te cuestan en pedidos, con los datos de origen",
      "Qué hacer ahora, paso a paso y con tiempos reales",
    ],
    cta: "auditoria",
  },
  C: {
    id: "C",
    titulo: "Te aplica la Ley 11/2023 por productos",
    subtitulo: "Fabricante, importador o distribuidor",
    color: "#F97316",
    bullets: [
      {
        tipo: "ok",
        texto:
          "Tus productos deben cumplir los requisitos de accesibilidad de la Ley 11/2023",
      },
      {
        tipo: "ok",
        texto:
          "Las obligaciones concretas dependen de tu papel: fabricante, importador o distribuidor",
      },
      {
        tipo: "ok",
        texto:
          "Si además se compra en tu web, esa parte cuenta como comercio electrónico",
      },
      {
        tipo: "warning",
        texto:
          "En vigor desde el 28 de junio de 2025 para productos que salgan al mercado",
      },
      {
        tipo: "warning",
        texto:
          "Multas de hasta 90.000 € por infracción grave; hasta 1.000.000 € las muy graves",
      },
    ],
    pdfIncluye: [
      "Qué exige la ley a tus productos, según tu papel en la cadena",
      "Qué pasa con tu web si además vendes online",
      "Sanciones reales: las cifras del régimen vigente",
      "Qué hacer ahora, paso a paso y con tiempos reales",
    ],
    cta: "auditoria",
  },
  D: {
    id: "D",
    titulo: "Hoy la Ley 11/2023 no te obliga",
    subtitulo: "Microempresa de servicios, exenta por el art. 3.3",
    color: "#22C55E",
    bullets: [
      {
        tipo: "ok",
        texto:
          "Estás exenta: la ley no se aplica a microempresas que prestan servicios (art. 3.3)",
      },
      {
        tipo: "warning",
        texto:
          "La exención se pierde el día que llegues a 10 personas o superes los 2 millones",
      },
      {
        tipo: "warning",
        texto:
          "Solo cubre servicios: si mañana vendes productos cubiertos, esa parte sí obliga",
      },
      {
        tipo: "warning",
        texto:
          "Si pides ayudas públicas para la web (Kit Digital, etc.), entra la obligación del RD 1112/2018",
      },
      {
        tipo: "warning",
        texto:
          "La exención es solo de la Ley 11/2023: el RD 193/2023 (art. 14.2) te alcanza igualmente, con plazo 2029 para webs nuevas y 2030 para las existentes",
      },
      {
        tipo: "warning",
        texto:
          "Mientras tanto, cada barrera de tu web te sigue costando clientes — y eso no lo decide ninguna ley",
      },
    ],
    pdfIncluye: [
      "Por qué estás exenta hoy (art. 3.3), sin letra pequeña",
      "Las tres puertas por las que se pierde la exención, y la fecha del RD 193/2023",
      "Tu propia cuenta de lo que las barreras te cuestan, con los datos de origen",
      "Qué hacer ahora, a coste mínimo, y tu propia cuenta de lo que te cuesta cada barrera",
    ],
    cta: "diagnostico",
  },
  E: {
    id: "E",
    titulo: "Estás en régimen híbrido",
    subtitulo:
      "Servicio público gestionado en privado, o entidad con fondos públicos",
    color: "#8B5CF6",
    bullets: [
      {
        tipo: "ok",
        texto:
          "Tu web debe cumplir WCAG 2.1 AA (UNE-EN 301 549): te lo exige la vía pública",
      },
      {
        tipo: "ok",
        texto:
          "La exigencia concreta llega por tus pliegos, tu convenio o tus bases reguladoras",
      },
      {
        tipo: "warning",
        texto:
          "Declaración formal de accesibilidad solo si tus pliegos o bases la piden",
      },
      {
        tipo: "warning",
        texto:
          "Si además vendes servicios cubiertos al público, se te suma la Ley 11/2023",
      },
    ],
    pdfIncluye: [
      "Por qué te obliga la vía pública y qué te exige exactamente",
      "Qué buscar en tus pliegos, convenio o bases reguladoras",
      "Cuándo se te suma también la Ley 11/2023",
      "Qué hacer ahora, paso a paso y con tiempos reales",
    ],
    cta: "auditoria",
  },
  F: {
    id: "F",
    titulo: "Tu web debe cumplir: es condición de tu ayuda",
    subtitulo: "Financiación pública para la web — DA 1ª del RD 1112/2018",
    color: "#EAB308",
    bullets: [
      {
        tipo: "ok",
        texto:
          "La web que se pagó con ayuda pública debe cumplir WCAG 2.1 AA (UNE-EN 301 549)",
      },
      {
        tipo: "warning",
        texto: "El incumplimiento puede suponer el reintegro de la ayuda",
      },
      {
        tipo: "warning",
        texto: "Y dejarte fuera de próximas convocatorias",
      },
      {
        tipo: "ok",
        texto:
          "No necesitas la declaración formal del sector público, salvo que tu convocatoria la pida",
      },
    ],
    pdfIncluye: [
      "Qué exige exactamente la condición de tu ayuda",
      "Reintegro e inhabilitación: qué arriesgas de verdad",
      "Cómo dejarlo cerrado antes de una comprobación",
      "Qué hacer ahora, paso a paso y con tiempos reales",
    ],
    cta: "auditoria",
  },
  G: {
    id: "G",
    titulo: "Hoy no tienes obligación inmediata",
    subtitulo: "Ninguna norma te obliga ya. El RD 193/2023 te alcanza en 2029",
    color: "#10B981",
    bullets: [
      {
        tipo: "ok",
        texto: "No tienes obligación legal inmediata de accesibilidad web hoy",
      },
      {
        tipo: "warning",
        texto:
          "El RD 193/2023 (art. 14.2) sí te alcanzará: webs nuevas desde el 1 de enero de 2029; las existentes, con ajustes razonables antes del 1 de enero de 2030",
      },
      {
        tipo: "warning",
        texto:
          "Crecer, cambiar de actividad o pedir ayudas públicas puede adelantarlo",
      },
      {
        tipo: "warning",
        texto:
          "Clientes grandes y pliegos públicos la exigen por contrato aunque la ley no obligue",
      },
      {
        tipo: "warning",
        texto:
          "Y las barreras de tu web ya te cuestan clientes hoy: eso no depende de ninguna ley",
      },
    ],
    pdfIncluye: [
      "Por qué no te aplica hoy, respuesta a respuesta",
      "Qué te exige el RD 193/2023 y en qué fecha",
      "Las tres situaciones que te meterían en la ley antes",
      "Tu propia cuenta de lo que las barreras te cuestan, con los datos de origen",
      "Qué hacer ahora, con margen, y tu propia cuenta de lo que te cuesta cada barrera",
    ],
    cta: "diagnostico",
  },
};

export const WEBHOOK_URL =
  "https://n8n.zerosugar.studio/webhook/autoevaluador-ley";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}
