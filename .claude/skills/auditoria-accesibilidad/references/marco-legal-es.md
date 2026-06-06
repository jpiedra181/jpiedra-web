# Marco legal de accesibilidad web en España

> Archivo de REFERENCIA para el agente. Se consulta al determinar el régimen
> legal aplicable a un sujeto y al citar la base normativa en un informe.
> No es para lectura humana directa.

## 0. Cómo usar este archivo

- Léelo cuando haya que **determinar qué norma obliga** al cliente o **citar el
  marco legal** en un hallazgo o informe.
- Regla de oro: **no afirmes ningún dato legal que no esté aquí.** Si falta o
  está marcado `[VERIFICAR]`, dilo explícitamente ("conviene confirmarlo con
  asesoramiento legal") en vez de rellenarlo de memoria.
- Coletilla obligatoria en cualquier salida con contenido legal: el auditor es
  especialista en accesibilidad, **no abogado**; la aplicación a un caso
  concreto puede tener matices que requieran asesoramiento jurídico.

## 1. Jerarquía normativa

`WCAG 2.1 AA` (criterios técnicos) → `UNE-EN 301 549` (norma europea armonizada;
el capítulo 9 "Web" refleja WCAG 2.1 A/AA) → **derecho español** (la norma que
obliga según el sujeto). La conformidad técnica se mide siempre contra EN 301 549.
`[Fuente: EN 301 549 + sesión · VERIFICADO]`

## 2. Determinación del régimen aplicable

Árbol de decisión (7 dictámenes). Evaluar en este orden de prioridad:

1. **Sector público o asimilado** → **Dictamen A** · RD 1112/2018 (régimen completo).
2. **Concesionario / centro educativo con fondos públicos** → **Dictamen E** ·
   régimen híbrido (DA 1ª RD 1112/2018; si además presta servicios cubiertos,
   también art. 13 Ley 11/2023).
3. **Comercializa productos cubiertos** (terminales interactivos, autoservicio,
   lectores electrónicos, terminales de pago) → **Dictamen C** · Ley 11/2023
   (productos: Anexo I, marcado CE, declaración UE de conformidad, conservación
   documental 5 años). El rol (fabricante/importador/distribuidor) modula las
   obligaciones.
4. **Presta servicios cubiertos** (comercio electrónico B2C, banca a consumidores,
   comunicaciones electrónicas, audiovisuales, transporte de pasajeros, libro
   electrónico, emergencias 112) **y NO es microempresa** → **Dictamen B** ·
   Ley 11/2023 (servicios: art. 3 técnico, art. 13.2 información en condiciones
   generales).
5. **Presta servicios cubiertos Y es microempresa** (autónomo o <10 empleados y
   ≤2 M€ de facturación) → **Dictamen D** · exenta del Título I en servicios
   (art. 3.3). Pierde la exención si crece; la exención NO cubre productos.
6. **Sin servicios/productos cubiertos pero con financiación pública para la web**
   (Kit Digital, NextGen, subvenciones) → **Dictamen F** · DA 1ª RD 1112/2018
   (cumplimiento técnico arts. 5 y 6, equivalente a WCAG 2.1 AA; obligación vía
   la Administración financiadora; incumplir = reintegro + inhabilitación).
7. **Ninguno de los anteriores** → **Dictamen G** · sin obligación legal directa
   hoy (pero pliegos públicos y clientes B2B grandes suelen exigirla igual).

`[Fuente: autoevaluador BOE-verificado de Javier · arts. CONTRASTAR contra BOE]`
`[NOTA: este árbol no modela el RD 193/2023 — ver §5, es un posible hueco]`

## 3. RD 1112/2018 — sector público y asimilados

- Transpone la Directiva (UE) 2016/2102 (Web Accessibility Directive).
- Obligaciones núcleo: cumplimiento técnico WCAG 2.1 AA / UNE-EN 301 549;
  **declaración de accesibilidad** (modelo de la Decisión de Ejecución (UE)
  2018/1523); mecanismo de comunicación y canal de quejas; revisión periódica
  documentada (anual simplificada, trienal en profundidad).
- Vigencia: plenamente en vigor desde 2020 (web) y 2021 (apps móviles).
- **DA 1ª**: extiende el deber técnico a entidades privadas con financiación
  pública para la web y a concesionarios/educativos con fondos públicos.

`[Fuente: autoevaluador + sesión · arts. y fechas CONTRASTAR contra BOE]`

## 4. Ley 11/2023 — sector privado / EAA

- Ley 11/2023, de 8 de mayo; transpone la Directiva (UE) 2019/882 (European
  Accessibility Act).
- **Servicios cubiertos** (art. 3): cumplimiento técnico WCAG 2.1 AA / UNE-EN
  301 549; información de cumplimiento en las condiciones generales (art. 13.2);
  mantenimiento de esa información durante toda la vigencia del servicio.
- **Microempresas de servicios**: exentas del Título I (art. 3.3). La exención
  NO aplica a productos.
- **Productos cubiertos**: requisitos del Anexo I; marcado CE de accesibilidad
  antes de comercializar; declaración UE de conformidad y documentación técnica;
  conservación documental 5 años.
- **Vigencia**: 28 de junio de 2025.
- **Sanciones**: hasta 1.000.000 € para infracciones muy graves.

`[Fuente: autoevaluador + sesión · arts., umbrales y régimen sancionador CONTRASTAR contra BOE]`

## 5. RD 193/2023 — condiciones básicas de bienes y servicios  ⚠️ ZONA A CERRAR

RD 193/2023, de 21 de marzo: regula las condiciones básicas de accesibilidad y
no discriminación para el acceso y utilización de **bienes y servicios a
disposición del público**. Desarrolla la Ley General de derechos de las personas
con discapacidad (RDL 1/2013) y cita la Directiva (UE) 2019/882. Referencia
UNE-EN 301 549 y WCAG 2.1, e incluye accesibilidad de **portales web y apps
móviles del sector privado**.

**Por qué es zona a cerrar (importante):** la Ley 11/2023 derogó la DA 5ª de la
Ley 34/2002 (que obligaba a la accesibilidad de portales de sectores de especial
trascendencia económica y redes sociales). Según fuentes especializadas (p. ej.
Olga Carreras), la obligación de accesibilidad web del sector privado pasa a
operar "vía RD 193/2023 o Ley 11/2023, según corresponda". Esto sugiere que
**RD 193/2023 podría extender obligaciones de accesibilidad web a sujetos
privados más allá de los sectores cubiertos por la EAA/Ley 11/2023**, con sus
propios plazos.

`[Fuente: BOE BOE-A-2023-7417 + Olga Carreras + resúmenes sectoriales · VERIFICADO que existe y su objeto; INTERPLAY Y PLAZOS web = VERIFICAR]`
`[ACCIÓN: el autoevaluador actual no contempla RD 193/2023. Decidir con criterio legal si procede añadir una rama, y con qué plazos.]`

## 6. Disposición transitoria única — el "mito de 2030"

REGLA OPERATIVA: una web corporativa NO tiene prórroga hasta 2030. Si el sujeto
está obligado por la Ley 11/2023, su web debe cumplir desde el 28-jun-2025. No
hay periodo de gracia general.

Qué cubre realmente la transitoria (titulada "Medidas transitorias en materia de
accesibilidad de determinados productos y servicios"):
- Seguir prestando servicios mediante los PRODUCTOS (hardware/equipos) ya usados
  legalmente antes del 28-jun-2025.
- CONTRATOS de servicios firmados antes del 28-jun-2025: continúan hasta expirar,
  máximo 5 años desde esa fecha.
- Terminales de autoservicio en uso antes del 28-jun-2025: hasta fin de vida
  útil, máximo 10 años desde su puesta en funcionamiento.

Por qué una web no entra: en esta normativa el sitio web es el SERVICIO en sí, no
un "producto" ni un "contrato". No encaja en ningún supuesto que la transitoria
prorrogue.

Excepciones acotadas (interpretaciones del sector, NO lista literal del
articulado — tratar con cautela, revisión específica): multimedia pregrabado
publicado antes de la fecha, ofimática antigua, contenido de terceros fuera de
control, siempre que no se actualicen tras el 28-jun-2025.

`[Fuente: texto de la disposición transitoria única de la Ley 11/2023 (BOE),
verificado por Javier (artículo 27-may-2026) + aclaración pública de la
Subdirección General de Coordinación y Ordenación (Mº Derechos Sociales) ·
VERIFICADO]`

## 7. Transición WCAG 2.1 → 2.2 (próximo estándar)

- Hoy el suelo legal es WCAG 2.1 AA, vía EN 301 549 V3.2.1 (harmonizada en 2021).
- EN 301 549 V4.1.1, desarrollada bajo el mandato M/587, incorporará WCAG 2.2 AA.
  Borrador V4.1.0 publicado en nov-2025; referencia en el Diario Oficial de la UE
  prevista para **octubre de 2026**.
- Publicarse ≠ obligar: una versión nueva no cambia las obligaciones hasta que se
  referencia en el Diario Oficial, y suele haber periodo de solape. 2.1 sigue
  siendo el listón vinculante durante la transición.
- WCAG 2.2 es retrocompatible: lo que cumple 2.2 cumple 2.1. 2.2 = 2.1 + 6
  criterios A/AA nuevos (objetivo táctil mínimo, arrastre, autenticación
  accesible, foco no oscurecido, ayuda consistente, entrada redundante).
- Uso comercial: 2.1 AA = lo que se audita y se cobra; 2.2 AA = servicio premium
  "adelántate al estándar de oct-2026".

`[Fuente: EN 301 549 V4.1.1 / W3C / sesión · VERIFICADO web jun-2026]`

## 8. Cómo citar en el informe

- Cada hallazgo cita **el criterio WCAG + la cláusula EN 301 549** (regla: EN =
  "9." + nº de criterio WCAG).
- El **régimen legal** (qué norma obliga) va en el apartado de marco legal del
  informe, determinado según §2. NO asignar artículos legales a criterios WCAG
  individuales: la obligación opera a nivel de norma, no criterio a criterio.
- Adaptar el documento de cumplimiento al dictamen del cliente (A–G de §2).

## 9. Pendiente de verificar (checklist viva — cerrar contra BOE antes de usar en entregable de pago)

- [ ] Artículos exactos citados en §3 y §4 (RD 1112/2018: arts. 5, 6, DA 1ª;
      Ley 11/2023: arts. 3, 3.3, 13.2, Anexo I, régimen sancionador).
- [ ] Umbrales de microempresa y su artículo exacto en la Ley 11/2023.
- [ ] §5 RD 193/2023: alcance real para web privada, su relación con la
      Ley 11/2023, y sus plazos. ¿Procede añadir rama al autoevaluador?
- [ ] Fechas de vigencia de RD 1112/2018 (web 2020 / apps 2021) y referencia
      de la Decisión (UE) 2018/1523.