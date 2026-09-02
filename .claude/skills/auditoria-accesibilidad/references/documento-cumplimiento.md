# Documento de cumplimiento — plantillas por régimen

> Archivo de REFERENCIA para el agente. Se consulta al generar el entregable
> «documento de cumplimiento listo para publicar». No es para lectura humana
> directa. Base legal verificada contra el BOE y el DOUE el 2026-09-02
> (`marco-legal-es.md` §3-§5 y §8).

## 0. Cómo usar este archivo

- Se invoca **después** de tener el dictamen del cliente (A-G,
  `marco-legal-es.md` §2) y el veredicto de la auditoría (regla mecánica de
  `protocolo-auditoria.md` §7).
- Es un entregable **aparte del informe**. El estado que declara es el del
  veredicto; la versión privada **no** vuelca el catálogo de hallazgos (§4).
- Regla de oro: es **información de transparencia, no certificación de
  conformidad legal**. Acredita el requisito documental (art. 13.2 Ley
  11/2023, art. 14.3 RD 193/2023, art. 15 RD 1112/2018), no el sustantivo.
- Coletilla obligatoria: el auditor es especialista en accesibilidad, **no
  abogado**; el grado de exposición del documento privado puede merecer
  revisión jurídica del cliente.

## 1. Principio: una osamenta, dos tripas

- **Sector público** → modelo **cerrado**: la Decisión de Ejecución (UE)
  2018/1523 fija apartados y literalidad (sección 1 obligatoria, sección 2
  opcional). No se inventa; se rellena. Lo ejecuta la skill
  `declaracion-accesibilidad`.
- **Sector privado** → **no existe modelo europeo**. Se reutiliza la
  estructura del público (es el estándar de referencia y da seriedad),
  cambiando la base legal, el canal de recurso y el grado de divulgación.

## 2. Plantilla PÚBLICA — Decisión (UE) 2018/1523 (texto oficial en `.claude/sources/decision-2018-1523.txt`)

Aplica a: dictamen **A**; **E** en su vertiente pública; **F** cuando la
Administración financiadora exija declaración.

Sección 1, contenido obligatorio (art. 4.1 de la Decisión), en este orden:

1. **Compromiso y alcance.** «[Organismo] se ha comprometido a hacer
   accesible su sitio web de conformidad con el Real Decreto 1112/2018, de 7
   de septiembre [...]. La presente declaración de accesibilidad se aplica a
   [alcance].» (La adaptación española sustituye «la legislación nacional por
   la que se traspone la Directiva (UE) 2016/2102» por el RD 1112/2018.)
2. **Situación de cumplimiento.** Una de tres, excluyentes:
   - a) «plenamente conforme con el RD 1112/2018» — solo si se cumplen
     **todos** los requisitos sin excepción (nota iii del modelo).
   - b) «parcialmente conforme con el RD 1112/2018 debido a las excepciones
     y/o a la falta de conformidad de los aspectos que se indican a
     continuación» — si se cumple **la mayoría** (nota v).
   - c) «aún no es conforme con el RD 1112/2018. A continuación se indican las
     excepciones y/o los aspectos no conformes» — si **no** se cumple la
     mayoría (nota viii).
   La opción la fija el veredicto de la auditoría con la misma aritmética.
3. **Contenido no accesible.** «El contenido que se recoge a continuación no
   es accesible por lo siguiente:»
   - a) *falta de conformidad con el RD 1112/2018*: cada aspecto descrito
     **sin tecnicismos** y con **la referencia del requisito incumplido**
     (nota xi; ejemplo del propio modelo: «El formulario de inicio de sesión
     [...] no está totalmente adaptado para su uso con teclado [requisito
     9.2.1.1 de UNE-EN 301 549]»). Sale de los No conforme de la tabla, uno
     por criterio, redactado desde el impacto.
   - b) *carga desproporcionada*: solo con la evaluación documentada del art.
     7 del RD 1112/2018; la falta de prioridad, tiempo o conocimientos no vale.
   - c) *contenido no incluido en el ámbito*: según art. 3.2 del RD 1112/2018
     (ofimática anterior a 2018-09-20, multimedia pregrabado anterior a
     2020-09-23, mapas, contenido de terceros, archivos, etc.).
   - Alternativas accesibles, si las hay.
4. **Preparación de la presente declaración de accesibilidad.** «La presente
   declaración fue preparada el [fecha].» + método (art. 3.1 de la Decisión):
   «evaluación llevada a cabo por un tercero» (la auditoría) o
   «autoevaluación». + «Última revisión de la declaración: [fecha].»
   Revisión al menos anual (nota xiii).
5. **Observaciones y datos de contacto.** Mecanismo de comunicación del art.
   10 del RD 1112/2018 (comunicaciones sobre requisitos; solicitudes de
   información accesible y quejas, art. 12, con respuesta en 20 días
   hábiles), con enlace; datos de la Unidad responsable de accesibilidad
   (art. 16).
6. **Procedimiento de aplicación.** Reclamación del art. 13 del RD 1112/2018
   ante la Unidad responsable (o su superior), con enlace; y datos del
   organismo de ejecución.

Sección 2, opcional: compromiso más allá de lo exigido; medidas correctoras
con calendario (recomendado: sale del plan de remediación); respaldo
oficial; fecha de publicación del sitio y de última actualización sustancial;
enlace al informe de evaluación; asistencia telefónica; otra información.

Ubicación: enlace destacado en la portada o accesible desde todas las
páginas (instrucciones del anexo). Formato accesible (art. 2 de la Decisión).

`[Fuente: DOUE L 256 de 12.10.2018, pp. 103-107; RD 1112/2018 arts. 3, 7, 10-13, 15-16 · VERIFICADO 2026-09-02]`

## 3. Plantilla PRIVADA — misma osamenta, adaptada

Aplica a: dictamen **B** (servicios cubiertos por la Ley 11/2023), **D**
(microempresa: no está obligada por la Ley 11/2023, pero sí alcanzada por el
RD 193/2023 con calendario 2029/2030; se le ofrece como transparencia
voluntaria y preparación) y **G** (RD 193/2023, art. 14.2 y, si supera el
umbral de la Ley 56/2007, art. 14.3).

Dónde va cada cosa, según la base legal:

| Base | Obligación documental | Dónde se publica |
|---|---|---|
| Ley 11/2023, art. 13.2 (dictamen B) | Información que evalúe de qué manera el servicio cumple los requisitos del art. 3: requisitos aplicables, diseño y funcionamiento; con descripción general del servicio en formatos accesibles, explicaciones de funcionamiento, y cómo el proceso de prestación garantiza la conformidad (13.2.a-c). Mantenida mientras dure el servicio (13.5) | **Condiciones generales o documento equivalente** (con enlace desde el pie) |
| RD 193/2023, art. 14.3 (empresas de especial trascendencia económica) | «Consignar en [la web] el grado de accesibilidad de sus bienes y servicios» e indicar líneas de atención a personas con discapacidad | **En la propia web**, página de accesibilidad enlazada desde todas |
| RD 193/2023, art. 14.2 (resto de webs privadas) | Sin obligación documental expresa; el deber es técnico (criterios del RD 1112/2018) con calendario DF 6ª | Página de accesibilidad voluntaria, recomendada |

Cambios respecto al modelo público:

- **NO citar el RD 1112/2018 como norma que obliga** (salvo la remisión
  técnica del art. 14.2 del RD 193/2023 en el dictamen G, que se cita como
  «criterios de accesibilidad del RD 1112/2018 por remisión del art. 14.2 del
  RD 193/2023»). Norma técnica: UNE-EN 301 549 (WCAG 2.1 AA).
- **Eliminar** Unidad responsable de accesibilidad y procedimiento de
  reclamación del art. 13 del RD 1112/2018: no existen para un privado. El
  recurso externo del consumidor son las autoridades de vigilancia de la Ley
  11/2023 (art. 27, designadas por las CCAA) y los canales de consumo; no se
  redacta como «procedimiento administrativo», se menciona el canal propio y
  el derecho a reclamar.
- **Canal de contacto = el real de la empresa** (email o formulario de
  atención accesible), con compromiso de plazo de respuesta.

Apartados:

1. **Compromiso y alcance.** «[Entidad] trabaja para que [servicio/web] cumpla
   los requisitos de accesibilidad que le son exigibles conforme a [Ley
   11/2023, art. 13 / RD 193/2023, art. 14] y a la norma UNE-EN 301 549 (WCAG
   2.1 nivel AA). Esta información se aplica a [alcance].»
2. **Grado de accesibilidad.** Estado actual con las mismas tres fórmulas del
   veredicto (plenamente / parcialmente / aún no conforme con UNE-EN 301 549),
   porque son las que el mercado y la autoridad de vigilancia entienden, pero
   **sin inventario de fallos**: se nombran los ámbitos afectados en una frase
   («navegación por teclado en el proceso de compra», «alternativas textuales
   de imágenes»), con la referencia del requisito, y se remite al plan.
3. **Cómo se garantiza la conformidad (13.2.c).** Auditoría por tercero
   (fecha, método WCAG-EM, alcance evaluado), plan de remediación con
   calendario, revisión periódica (conformidad continua si se contrata),
   formación. Es el apartado que la Ley pide literalmente.
4. **Alternativas y atención.** Cómo obtener el servicio o la información por
   otra vía accesible mientras se corrige (teléfono, email, presencial);
   líneas de atención a personas con discapacidad (RD 193/2023, art. 14.3).
5. **Canal de contacto.** Vía real para comunicar barreras, con plazo de
   respuesta comprometido; mención al derecho a acudir a las autoridades de
   vigilancia o consumo.
6. **Fechas.** Preparación, método (evaluación por tercero) y última revisión;
   compromiso de revisión al menos anual.

`[Fuente: Ley 11/2023 arts. 13.2-13.5, 27; RD 193/2023 arts. 14.2-14.4, DF 6ª; Ley 56/2007 art. 2.2 · VERIFICADO 2026-09-02]`

## 4. Calibración de divulgación (privado) — el criterio que importa

- **Honesto, no auto-incriminatorio.** El modelo público obliga a listar cada
  aspecto no conforme porque la transparencia es su deber. En privado, la Ley
  11/2023 pide «información que evalúe de qué manera el servicio cumple» y el
  RD 193/2023 «consignar el grado de accesibilidad»: ninguno exige publicar
  un catálogo de incumplimientos. Por tanto: grado + ámbitos afectados +
  cómo se garantiza + canal. **El catálogo vive en el informe** (documento
  privado entre auditor y cliente).
- **Nunca afirmar conformidad que la auditoría no respalde.** El grado
  declarado es el veredicto; si el cliente quiere declarar otra cosa, no se
  firma y se le explica por qué (art. 13.2 exige que la información sea una
  evaluación real; declarar «plenamente conforme» con hallazgos abiertos es
  información engañosa ante la autoridad de vigilancia y ante el consumidor).
- El nivel de detalle es una decisión con implicaciones (cuantías del RDL
  1/2013 vía art. 30 de la Ley 11/2023). Se marca para revisión del cliente
  y, si procede, de su asesoría jurídica. Se entrega con esa nota.
- Coherencia: veredicto del informe = grado del documento = (si hay) revisión
  OAW o declaración.

## 5. Checklist antes de entregar

- [ ] Dictamen y base legal citados con artículo (§3 tabla).
- [ ] Grado = veredicto de la tabla de los 50 (regla §7 del protocolo).
- [ ] Ningún hallazgo `A CONFIRMAR` mencionado.
- [ ] Ámbitos afectados con referencia de requisito, sin catálogo.
- [ ] Canal real, plazo de respuesta, alternativas.
- [ ] Fechas de preparación, método «evaluación por tercero», próxima revisión.
- [ ] Coletilla de no asesoramiento jurídico y nota de revisión por el cliente.
- [ ] Visto bueno de Javier antes de `md2pdf.py` (sin `--confidencial`: se publica).
