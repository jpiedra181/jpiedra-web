# Marco legal de accesibilidad web en España

> Archivo de REFERENCIA para el agente. Se consulta al determinar el régimen
> legal aplicable a un sujeto y al citar la base normativa en un informe.
> No es para lectura humana directa.
>
> **Verificado contra las fuentes primarias el 2026-09-02.** Todo lo que aquí
> se afirma está cotejado con el texto consolidado del BOE o del DOUE cacheado
> en `.claude/sources/` (ver §10). Lo que no se pudo verificar lleva `[VERIFICAR]`.

## 0. Cómo usar este archivo

- Léelo cuando haya que **determinar qué norma obliga** al cliente o **citar el
  marco legal** en un hallazgo o informe.
- Regla de oro: **no afirmes ningún dato legal que no esté aquí.** Si falta o
  está marcado `[VERIFICAR]`, dilo explícitamente («conviene confirmarlo con
  asesoramiento legal») en vez de rellenarlo de memoria.
- Cita siempre **norma + artículo + apartado** («Ley 11/2023, art. 13.2»), nunca
  «según la ley».
- Coletilla obligatoria en cualquier salida con contenido legal: el auditor es
  especialista en accesibilidad, **no abogado**; la aplicación a un caso
  concreto puede tener matices que requieran asesoramiento jurídico.
- Este archivo dice **quién está obligado y a qué**. El listón técnico (qué
  criterios se evalúan) es siempre el mismo: EN 301 549 V3.2.1, capítulo 9
  (= WCAG 2.1 A/AA). Está en `criterios-wcag.md`.

## 1. Jerarquía normativa

`WCAG 2.1 A/AA` (W3C, criterios técnicos) → `EN 301 549 V3.2.1` (norma europea
armonizada; su capítulo 9 «Web» incorpora WCAG 2.1 A/AA cláusula a cláusula;
adoptada en España como UNE-EN 301 549) → **derecho español** (la norma que
obliga según el sujeto).

Por qué EN 301 549 y no WCAG directamente:

- RD 1112/2018, **art. 6.1**: se presume conforme a los requisitos del art. 5 el
  contenido que cumpla las **normas armonizadas cuyas referencias se hayan
  publicado en el DOUE**. Esa norma es EN 301 549 V3.2.1 (referencia publicada
  en 2021).
- Ley 11/2023, **art. 17** (presunción de conformidad) y **art. 13.3**: los
  prestadores pueden aplicar las normas armonizadas publicadas en el DOUE para
  cumplir los requisitos.

Por tanto la conformidad técnica **siempre se mide contra EN 301 549**, y cada
hallazgo cita el criterio WCAG **y** la cláusula EN (regla: `9.` + nº de
criterio WCAG; WCAG 2.4.7 → EN 9.2.4.7).

`[Fuente: RD 1112/2018 arts. 5-6; Ley 11/2023 arts. 13.3 y 17; EN 301 549 V3.2.1 · VERIFICADO]`

**Estado de WCAG 2.2 / EN 301 549 V4.1.1 (a 2026-09-02):** la V4.1.1, que
incorpora WCAG 2.2, **todavía no está referenciada en el DOUE**. La referencia
se espera entre octubre y noviembre de 2026. Hasta que se publique, el listón
legal es 2.1 AA. Ver §7.

## 2. Determinación del régimen aplicable

Árbol de decisión (7 dictámenes). Evaluar en este orden de prioridad. Los
datos de entrada (forma jurídica, tamaño, sector, financiación) vienen del
intake, nunca se infieren de la web.

1. **Sector público** (RD 1112/2018, art. 2: AGE, CCAA, entidades locales,
   sector público institucional del art. 2.2 de la Ley 39/2015, asociaciones de
   Administraciones; también la Administración de Justicia; órganos
   constitucionales y legislativos autonómicos vía DA 2ª) → **Dictamen A** ·
   RD 1112/2018, régimen completo (§3).
2. **Asimilados por la DA 1ª del RD 1112/2018**: webs y apps que reciban
   **financiación pública para su diseño o mantenimiento** (letra a); webs de
   entidades que **gestionen servicios públicos** por concesión u otra vía
   contractual, en especial educativos, sanitarios, culturales, deportivos y de
   servicios sociales (letra b); **centros privados educativos, de formación y
   universitarios sostenidos total o parcialmente con fondos públicos** (letra
   c) → **Dictamen E** · régimen híbrido: arts. 5 y 6 del RD 1112/2018 (el
   deber técnico, exigido a través de la Administración que financia o
   contrata) y, si además presta servicios cubiertos por la Ley 11/2023, art.
   13 de esta. Las sociedades mercantiles estatales (Paradores y similares) son
   dictamen E, no A.
3. **Comercializa productos cubiertos** (Ley 11/2023, art. 2.1: equipos
   informáticos de consumo y sus sistemas operativos; terminales de pago;
   cajeros, expendedoras de billetes, máquinas de facturación, terminales
   interactivos de información, gestores de turno; terminales de consumo para
   comunicaciones electrónicas y para acceso a comunicación audiovisual;
   lectores electrónicos) → **Dictamen C** · Ley 11/2023 (productos: requisitos
   del Anexo I secciones I y II, art. 3.1; obligaciones de fabricantes,
   representantes, importadores y distribuidores, arts. 7-10; declaración UE de
   conformidad y marcado CE, arts. 18-20). El rol del agente modula las
   obligaciones. La exención de microempresa **no** cubre productos (art. 3.3
   solo habla de servicios).
4. **Presta servicios cubiertos a consumidores** (Ley 11/2023, art. 2.2) **y NO
   es microempresa** → **Dictamen B** · Ley 11/2023 (servicios: Anexo I
   secciones III y IV, art. 3.1; información de cumplimiento en las
   condiciones generales, art. 13.2). Servicios cubiertos, literal:
   - a) comunicaciones electrónicas (salvo transmisión máquina a máquina);
   - b) acceso a servicios de comunicación audiovisual;
   - c) transporte aéreo, autobús regular, ferrocarril y marítimo de viajeros:
     sitios web, apps, billetes electrónicos, información de viaje en tiempo
     real, terminales interactivos (el urbano, suburbano y regional solo
     terminales);
   - d) servicios bancarios para consumidores;
   - e) libros electrónicos y sus programas especializados;
   - f) **servicios de comercio electrónico**;
   - g) suministro eléctrico, de agua y de gas a consumidores: sitios web y apps;
   - h) agencias de viajes y turoperadores: sitios web y apps;
   - i) redes sociales.
   Además, art. 2.3: respuesta a comunicaciones de emergencia al 112.
5. **Presta servicios cubiertos Y es microempresa** → **Dictamen D** · exenta
   de los requisitos de accesibilidad de los servicios y de «cualquier
   obligación relativa al cumplimiento de dichos requisitos» (art. 3.3).
   **Microempresa** (Ley 11/2023, Anexo VII «Definiciones», apartado 16): «una empresa que emplea a
   menos de 10 personas y cuyo volumen de negocios anual no supera los 2
   millones de euros **o** cuyo balance anual total no supera los 2 millones de
   euros». Pierde la exención si crece. Ojo: la exención es de la Ley 11/2023;
   el RD 193/2023 (§5) no exime a microempresas.
6. **Sin servicios/productos cubiertos, pero la web tiene financiación pública**
   (Kit Digital, Next Generation, subvenciones al diseño o mantenimiento) →
   **Dictamen F** · DA 1ª.a) del RD 1112/2018: cumplimiento técnico de los
   arts. 5 y 6 (= EN 301 549 / WCAG 2.1 AA), exigido por la Administración
   financiadora. Incumplir es incumplir las condiciones de la ayuda (reintegro
   según las bases de la convocatoria; comprobar cada convocatoria).
7. **Ninguno de los anteriores** → **Dictamen G** · sin obligación directa hoy
   por RD 1112/2018 ni Ley 11/2023. **Pero no «sin obligación»:** ver §5, RD
   193/2023 art. 14.2, que alcanza a cualquier web privada cuyo contenido se
   refiera a bienes y servicios a disposición del público, con calendario
   2029/2030. Y los pliegos públicos y clientes B2B grandes suelen exigirla
   contractualmente.

`[Fuente: RD 1112/2018 arts. 2-3, DA 1ª, DA 2ª; Ley 11/2023 arts. 2, 3, 13 y Anexo VII.16 · VERIFICADO 2026-09-02]`

### Exclusiones de contenido (aplican a los dictámenes B/C/D y, por analogía, al modelo de declaración)

Ley 11/2023, **art. 2.4**: quedan fuera del título I estos contenidos de webs y apps:

- a) multimedia pregrabado de base temporal publicado antes del 28-06-2025;
- b) formatos de archivo de ofimática publicados antes del 28-06-2025;
- c) mapas y cartografía en línea, si la información esencial se da de forma
  accesible cuando son mapas de navegación;
- d) contenidos de terceros no financiados, desarrollados ni controlados por el
  agente económico;
- e) contenidos de archivo: solo contenidos que no se actualizan ni editan
  después del 28-06-2025.

Se usan para clasificar hallazgos como «fuera del ámbito» en el documento de
cumplimiento; **no** para dejar de evaluarlos en la auditoría (se evalúan y se
etiquetan).

## 3. RD 1112/2018 — sector público y asimilados

- Transpone la Directiva (UE) 2016/2102.
- **Ámbito**: subjetivo art. 2; objetivo art. 3 (sitios web con independencia del
  dispositivo, y apps móviles).
- **Requisitos técnicos, art. 5**: contenidos perceptibles, operables,
  comprensibles y robustos; accesibilidad integrada en diseño, gestión,
  mantenimiento y actualización (5.2). **Presunción de conformidad, art. 6**:
  cumplir las normas armonizadas publicadas en el DOUE (EN 301 549).
- **Carga desproporcionada, art. 7**: excepción justificada; la falta de
  prioridad, tiempo o conocimientos no son motivos legítimos (exposición de
  motivos y art. 7).
- **Mecanismo de comunicación, art. 10**: dos modalidades: a) comunicaciones
  sobre requisitos de accesibilidad; b) solicitudes de información accesible y
  quejas (art. 12: se registran conforme a la Ley 39/2015; **respuesta en 20
  días hábiles**).
- **Procedimiento de reclamación, art. 13**: si la solicitud o queja se
  desestima, no se está de acuerdo o no hay respuesta en 20 días hábiles;
  dirigida a la Unidad responsable de accesibilidad (o a su superior).
- **Declaración de accesibilidad, art. 15**; modelo: DT única → el de la
  Comisión Europea, es decir, la Decisión de Ejecución (UE) 2018/1523 (§8).
- **Unidad responsable de accesibilidad, art. 16.**
- **Revisión de la accesibilidad, art. 17**: en diseño, antes de la puesta en
  funcionamiento y periódica (17.1-17.2); **debe abarcar todos los requisitos
  y combinar revisión automática y revisión manual experta, con informe de
  revisión** (17.3). Esto es lo que legitima una auditoría manual completa
  frente a un escáner.
- **Seguimiento e informes, arts. 18-19**: el Observatorio de Accesibilidad Web
  (skill `revision-oaw`).
- **Vigencia (DF 5ª)**: en vigor el 20-09-2018. Para sitios web, los arts.
  10.2.b), 12 y 13 aplican desde el 20-09-2019 y, para las webs ya publicadas,
  desde el 20-09-2020. Apps móviles: desde el 23-06-2021.
- **DA 1ª**: extiende arts. 5 y 6 a webs con financiación pública, gestores de
  servicios públicos y centros educativos concertados (ver §2, dictámenes E y F).
- **Sanciones**: el RD no fija multas propias; la responsabilidad es
  administrativa y disciplinaria, y para los asimilados de la DA 1ª opera vía
  las condiciones de la financiación o del contrato.

`[Fuente: texto consolidado BOE-A-2018-12699 · VERIFICADO 2026-09-02]`

## 4. Ley 11/2023 — sector privado (European Accessibility Act)

- Ley 11/2023, de 8 de mayo (BOE-A-2023-11022); su **título I** transpone la
  Directiva (UE) 2019/882.
- **Vigencia**: el título I entra en vigor el **28 de junio de 2025** (DF 18ª.2).
- **Ámbito**: productos (art. 2.1) y servicios a consumidores (art. 2.2), ver
  §2. Exclusiones de contenido: art. 2.4.
- **Requisitos, art. 3**: Anexo I (secciones I-II productos; III-IV servicios).
  **Microempresas de servicios exentas, art. 3.3.**
- **Obligaciones de los prestadores de servicios, art. 13**: diseñar y prestar
  conforme a los requisitos (13.1); **incluir en las condiciones generales o
  documento equivalente la información que evalúe de qué manera el servicio
  cumple los requisitos del art. 3**, describiendo requisitos aplicables,
  diseño y funcionamiento (13.2), con al menos: descripción general del
  servicio en formatos accesibles, explicaciones de funcionamiento, y
  descripción de cómo el proceso de prestación garantiza la conformidad
  (13.2.a-c). Pueden usar normas armonizadas para cumplirlo (13.3). Deben
  mantener la conformidad en el tiempo y tener procedimientos para ello (13.5).
- **Modificación sustancial y carga desproporcionada, art. 16**: excepción
  documentada según criterios del Anexo V; lo no exceptuado se cumple «en la
  medida en que no suponga carga desproporcionada» (16.1); evaluación
  documentada (16.2-16.3).
- **Presunción de conformidad, art. 17**: normas armonizadas del DOUE.
- **Conformidad de los servicios, art. 24**: las autoridades de vigilancia
  comprueban la conformidad, siguen quejas y verifican medidas correctoras.
  **Autoridades de vigilancia, art. 27**: las designan las CCAA (27.3).
- **Régimen sancionador, art. 30**: **no fija cuantías propias**. Remite a la
  legislación sectorial y, supletoriamente, al **título III del RDL 1/2013**
  (Ley General de derechos de las personas con discapacidad). Cuantías del RDL
  1/2013: leves hasta 30.000 €, graves hasta 90.000 €, muy graves hasta
  1.000.000 € (art. 83); el incumplimiento de exigencias de accesibilidad es
  infracción grave (art. 81.3.b). Detalle de tramos, graduación, accesorias y
  prescripción en `.claude/stats.md` (verificado contra el BOE el 15-05-2026).
- **Disposición transitoria única** (§6).

`[Fuente: texto consolidado BOE-A-2023-11022 · VERIFICADO 2026-09-02]`

## 5. RD 193/2023 — condiciones básicas de bienes y servicios a disposición del público

RD 193/2023, de 21 de marzo (BOE-A-2023-7417). Desarrolla el RDL 1/2013. **Aplica
a cualquier persona física o jurídica, pública o privada, que provea bienes o
preste servicios disponibles para el público** (art. 3), sin umbral de tamaño.

Lo que dice de las webs, **art. 14 «Información y comunicación»**:

- **14.2** — «Las personas titulares de sitios web o aplicaciones móviles **no
  financiadas con fondos públicos** cuyo contenido se refiera a bienes y
  servicios a disposición del público incorporarán los criterios de
  accesibilidad establecidos en el RD 1112/2018 [...]. En particular, deberán
  cumplir los requisitos de prioridad A y AA de la norma UNE 139803 en la fecha
  en que las condiciones básicas [...] sean exigibles a los bienes y servicios
  que se ofrezcan en sus sitios web o aplicaciones.» Nota técnica: la UNE
  139803 citada es la norma española anterior (equivalente a WCAG 2.0); hoy la
  referencia vigente por remisión al RD 1112/2018 y a su art. 6 es UNE-EN 301
  549 (WCAG 2.1 AA). En el informe se dice así, sin dramatizar la referencia.
- **14.3** — Las Administraciones públicas y las **empresas que presten
  servicios al público en general de especial trascendencia económica** que
  dispongan de sitios de Internet abiertos al público «deberán garantizar su
  accesibilidad universal y **consignar en ellos el grado de accesibilidad** de
  sus bienes y servicios», e indicar si tienen líneas de atención a personas
  con discapacidad.
- **14.4** — «Especial trascendencia económica» = las del **art. 2.2 de la Ley
  56/2007**: más de 100 trabajadores **o** volumen anual de operaciones superior
  a 6.010.121,04 €, **y** que operen en: comunicaciones electrónicas a
  consumidores; servicios financieros a consumidores (banca, crédito, pago,
  inversión, seguros, pensiones, mediación de seguros); suministro de agua;
  gas al por menor; electricidad a consumidores finales; agencias de viajes;
  transporte de viajeros; y actividades de comercio al por menor (art. 1.2 de la
  Ley 7/1996; a estas solo les aplican las letras c) y d) del art. 2.1 de la Ley
  56/2007, pero el umbral de tamaño y sector es el que importa aquí).
- **Art. 15** — régimen sancionador: remite al título III del RDL 1/2013 (las
  mismas cuantías de §4).

**Calendario de exigibilidad (DF 6ª):**

| Bienes y servicios | Nuevos | Ya existentes (ajustes razonables antes de) |
|---|---|---|
| Titularidad pública, o privada concertada/suministrada a AAPP | 01-01-2025 | 01-01-2026 |
| Resto de titularidad privada | **01-01-2029** | **01-01-2030** |

**Cómo se usa en un dictamen G** (web privada fuera de la Ley 11/2023): el
cliente **sí** tiene una obligación de accesibilidad web por el RD 193/2023,
art. 14.2, exigible el 01-01-2029 para webs nuevas y con ajustes antes del
01-01-2030 para las existentes; si además supera el umbral de la Ley 56/2007
en uno de sus sectores, art. 14.3 le obliga a consignar el grado de
accesibilidad en su web. Se dice con esas fechas, no como «pronto será
obligatorio». Relación con la Ley 11/2023: son normas concurrentes; para los
servicios cubiertos por la Ley 11/2023 manda esta (desde 28-06-2025); el RD
193/2023 cubre el resto de bienes y servicios al público con su propio
calendario. La microexención del art. 3.3 de la Ley 11/2023 **no** se traslada
al RD 193/2023.

`[Fuente: texto consolidado BOE-A-2023-7417 arts. 3, 5, 14, 15 y DF 6ª; Ley 56/2007 art. 2.2 · VERIFICADO 2026-09-02]`

## 6. Disposición transitoria única de la Ley 11/2023 — el «mito de 2030»

REGLA OPERATIVA: una web de un servicio cubierto **no tiene prórroga hasta
2030**. Si el sujeto está obligado por la Ley 11/2023, su web debe cumplir
desde el 28-06-2025.

Lo que cubre la transitoria, literal:

1. Hasta el 28-06-2030, los prestadores pueden seguir prestando servicios
   **mediante los productos** que usaban legalmente antes; los **contratos de
   servicios** celebrados antes del 28-06-2025 continúan hasta expirar, máximo
   cinco años desde esa fecha.
2. **Terminales de autoservicio** en uso antes del 28-06-2025: hasta el fin de
   su vida útil económica, máximo diez años desde su puesta en funcionamiento.
3. Contratación pública: art. 25.1 aplica a licitaciones publicadas tras la
   entrada en vigor.

Una web no es un producto ni un contrato: es el servicio. No encaja en ningún
supuesto. Las únicas «fechas» que protegen contenido web son las exclusiones
del art. 2.4 (multimedia y ofimática anteriores al 28-06-2025, archivos).

Distinto es el **RD 193/2023** (§5), cuyo calendario sí llega a 2029/2030,
pero para bienes y servicios **no** cubiertos por la Ley 11/2023. Mezclar los
dos calendarios es el origen del mito.

`[Fuente: Ley 11/2023 DT única y art. 2.4; RD 193/2023 DF 6ª · VERIFICADO 2026-09-02]`

## 7. Transición WCAG 2.1 → 2.2

- Listón legal hoy: WCAG 2.1 AA vía EN 301 549 V3.2.1 (referencia DOUE 2021).
- EN 301 549 V4.1.1 (mandato M/587) incorpora WCAG 2.2 AA; borrador V4.1.0 de
  noviembre de 2025; **referencia en el DOUE prevista entre octubre y noviembre
  de 2026, aún no publicada a 2026-09-02**. Comprobar antes de cada auditoría:
  buscar «EN 301 549 V4.1.1 Official Journal» y anotar la fecha de comprobación
  en el informe.
- Publicarse ≠ obligar: hasta la referencia en el DOUE, 2.2 es mejora voluntaria.
- WCAG 2.2 = 2.1 + 6 criterios A/AA nuevos y **retira 4.1.1**; es
  retrocompatible. Detalle en `criterios-wcag.md`.
- Comercial: 2.1 AA es lo que se audita y sostiene el veredicto; 2.2 AA es el
  add-on de anticipación, en sección aparte y sin efecto en el veredicto.

`[Fuente: ETSI work programme, W3C · VERIFICADO web 2026-09-02]`

## 8. Decisión de Ejecución (UE) 2018/1523 — modelo de declaración (sector público)

Texto oficial en `.claude/sources/decision-2018-1523-eurlex.pdf` (DOUE L 256 de
12.10.2018, p. 103) y su extracción en `decision-2018-1523.txt`. Lo relevante:

- **Art. 3.1**: las afirmaciones de la declaración deben basarse en una
  evaluación efectiva: autoevaluación del organismo **o evaluación por un
  tercero** (la auditoría). **Art. 3.2**: la declaración indica el método.
- **Art. 4.1**: contenido obligatorio = sección 1 del anexo; **4.2**: opcional =
  sección 2.
- **Anexo, sección 1** (literal): compromiso y alcance; **situación de
  cumplimiento** con tres opciones excluyentes: a) «plenamente conforme» (solo
  si se cumplen **todos** los requisitos sin excepción, nota iii); b)
  «parcialmente conforme [...] debido a las excepciones y/o a la falta de
  conformidad de los aspectos que se indican a continuación» (si se cumple la
  **mayoría**, nota v); c) «aún no es conforme» (si **no** se cumple la
  mayoría, nota viii). **Contenido no accesible** en tres categorías: a) falta
  de conformidad con la legislación nacional; b) carga desproporcionada; c)
  contenido fuera del ámbito; más alternativas accesibles si las hay. La nota
  xi pide describir sin tecnicismos y **citar la referencia del requisito
  incumplido** (ejemplo del propio modelo: «El formulario de inicio de sesión
  [...] no está totalmente adaptado para su uso con teclado [requisito número
  XXX]»). **Preparación**: fecha y método (art. 3.1); última revisión (al
  menos anual, nota xiii). **Observaciones y datos de contacto**: mecanismo de
  comunicación con enlace. **Procedimiento de aplicación**: con enlace y datos
  del organismo de ejecución.
- **Sección 2, opcional**: compromiso más allá de la ley, medidas correctoras
  con calendario, respaldo oficial, fecha de publicación y de última
  actualización sustancial, enlace al informe de evaluación, asistencia
  telefónica, otra información.
- Adaptación española: el RD 1112/2018 sustituye a «la legislación nacional»
  en las fórmulas (la skill `declaracion-accesibilidad` tiene la literalidad
  adaptada y la aplica).

Consecuencia para el veredicto de la auditoría: los tres estados de la
declaración se derivan **mecánicamente** de la tabla de los 50 criterios
(regla en `protocolo-auditoria.md` §7). El auditor no «elige» el estado.

`[Fuente: DOUE L 256/103-107 · VERIFICADO 2026-09-02 sobre el PDF oficial]`

## 9. Cómo citar en el informe

- Cada hallazgo cita **criterio WCAG + cláusula EN 301 549**. Nunca un artículo
  de ley por criterio: la obligación opera a nivel de norma.
- El **apartado de marco legal** del informe indica: dictamen (A-G), norma que
  obliga con sus artículos (§2-§5), desde cuándo (§3-§5), qué documento de
  cumplimiento le corresponde, y la coletilla de no asesoramiento jurídico.
- Si el dictamen tiene incertidumbre (por ejemplo, umbral de microempresa al
  límite, o sector dudoso), el informe lo declara como **supuesto** y dice qué
  cambiaría si el supuesto fuera otro.
- Cuantías sancionadoras: solo con la cadena completa («art. 30 de la Ley
  11/2023 remite al título III del RDL 1/2013; art. 83: graves hasta 90.000 €»).
  Nunca «multas de hasta un millón» a secas.

## 10. Fuentes cacheadas (`.claude/sources/`)

| Archivo | Qué es | Descargado |
|---|---|---|
| `ley11-2023.html` | Ley 11/2023, texto consolidado BOE | 2026-05-15 |
| `rd-1112-2018.html` | RD 1112/2018, texto consolidado BOE | 2026-05-15 |
| `rd-193-2023.html` | RD 193/2023, texto consolidado BOE | 2026-09-02 |
| `rdl1-2013.html` | RDL 1/2013, texto consolidado BOE | 2026-05-15 |
| `ley-56-2007.html` | Ley 56/2007 (umbral «especial trascendencia económica») | 2026-09-02 |
| `decision-2018-1523-eurlex.pdf` + `.txt` | Decisión (UE) 2018/1523, DOUE oficial | 2026-09-02 |
| `decision-2018-1523.html` | Nota interna con la adaptación española verificada (AEAT 2025) | 2026-06-25 |
| `en_301549v030201p.pdf` | EN 301 549 V3.2.1 | 2026-06-25 |
| `wcag21.html` | WCAG 2.1 Recommendation (W3C) | 2026-09-02 |
| `wcag-em.html` | WCAG-EM 1.0, metodología de evaluación | 2026-09-02 |
| `wcag21-understanding-4.1.1-parsing.html` | Understanding 4.1.1 con la nota «always satisfied» | 2026-09-02 |
| `Metodologia_OAW_*.pdf`, `Guia_Validacion_*.pdf` | Metodologías del Observatorio (skill `revision-oaw`) | 2026-05-16 |

Regla: las leyes se modifican. Antes de un entregable de pago, comprobar en el
BOE la fecha de la última actualización del texto consolidado y, si es
posterior a la de descarga, volver a descargar y re-verificar la sección
afectada. Los textos se consultan extrayendo el HTML con Python (los ficheros
del BOE están en ISO-8859-1; abrir con `errors='ignore'` o `latin-1`).

## 11. Pendiente de verificar

- [ ] Fecha exacta de publicación en el DOUE de la referencia de EN 301 549
      V3.2.1 (2021), por si un cliente la pide.
