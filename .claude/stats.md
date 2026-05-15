# stats.md — Datos, normativa y referencias del sector

> **Reglas de uso:**
> - Cita siempre la fuente cuando uses un dato.
> - Si la fuente está desactualizada, no uses el dato.
> - Si no tienes una fuente, di "no hay estudios públicos sobre esto, pero por experiencia…".
> - Antes de publicar, **verificar que todos los datos siguen vigentes**. Las leyes y plazos cambian.

---

## Marco normativo español (a fecha del archivo, abril 2025)

### Sector privado

**Directiva (UE) 2019/882 — European Accessibility Act (EAA)**
- Aprobada en 2019, transpuesta a normativa nacional en cada Estado miembro.
- Aplicable desde el **28 de junio de 2025**.
- Afecta a productos y servicios comercializados en la UE: comercio electrónico, banca, e-readers, transporte, smartphones, ordenadores, cajeros, sistemas de venta de billetes, telefonía, etc.
- Excepciones: microempresas (<10 empleados Y <2M€ facturación) prestando solo servicios.

**Ley 11/2023, de 8 de mayo**
- Transposición española de la EAA.
- Publicada en BOE núm. 110, de 9 de mayo de 2023.
- Regula los requisitos de accesibilidad para productos y servicios.

**Real Decreto 193/2023, de 21 de marzo**
- Reglamento de las condiciones básicas de accesibilidad universal.
- Aplicable a productos, bienes y servicios a disposición del público.
- Importante: artículo 17 (sobre accesibilidad de servicios prestados por medios electrónicos).

### Sector público

**Real Decreto 1112/2018, de 7 de septiembre**
- Aplica a sitios web y aplicaciones móviles del sector público.
- Vigente desde 2018, plenamente aplicable desde 2021 para apps móviles.
- Obliga a publicar "Declaración de Accesibilidad" en cada web pública.

**Directiva (UE) 2016/2102** (origen del RD 1112/2018)

### Norma técnica de referencia

**UNE-EN 301 549** (versión vigente: V3.2.1, 2021)
- Norma armonizada europea de accesibilidad TIC.
- Equivalente técnico a WCAG 2.1 nivel AA + criterios adicionales para hardware/software.
- Es la norma a la que remiten ambos Reales Decretos.

**WCAG 2.1** (W3C, 2018) y **WCAG 2.2** (W3C, octubre 2023)
- Niveles A, AA, AAA.
- Para cumplimiento legal en España: **nivel AA**.
- AAA no es realista para webs comerciales completas. Se aplica a contenido crítico, no a toda la web.

## Régimen sancionador

### Ley 11/2023 (privado)

- Infracciones leves: hasta 10.000 €.
- Infracciones graves: 10.001 € a 600.000 €.
- Infracciones muy graves: 600.001 € a 1.000.000 €.
- Reincidencia y agravantes pueden duplicar la cuantía.

### RD 1112/2018 (público)

- Régimen sancionador remitido a normativa autonómica/local.
- No hay multas fijas estatales, pero sí responsabilidad administrativa.

## Datos del sector verificables

### WebAIM Million (estudio anual de referencia)

**Edición 2024** (análisis automatizado del millón de páginas de inicio más visitadas del mundo, marzo 2024):
- **95,9%** de páginas analizadas tenían fallos detectables de WCAG.
- Promedio de **56,8 errores** por página de inicio.
- Categorías de error más comunes:
  1. Texto con contraste insuficiente: 81% de páginas
  2. Imágenes sin texto alternativo: 54,5%
  3. Enlaces vacíos: 48,9%
  4. Campos de formulario sin etiqueta: 48,6%
  5. Enlaces con texto genérico ("clic aquí", "más info"): 44,6%

> Fuente: WebAIM Million 2024 — https://webaim.org/projects/million/
>
> Importante: son fallos detectables **automáticamente**. Los problemas reales (los que afectan a usuarios reales) son siempre más, porque muchos solo se detectan con pruebas manuales.

### Población afectada (España)

- **Personas con discapacidad reconocida en España**: 4,38 millones (INE, EDAD 2020 actualizada).
- **Mayores de 65 años**: 9,55 millones (INE, padrón 2024) — colectivo con alta prevalencia de limitaciones visuales, motoras y cognitivas relacionadas con edad.
- **Total potencial con beneficio directo de accesibilidad**: aproximadamente 15% de la población.

> Antes de citar estos datos, verificar fechas en INE y CERMI.

### Coste y ROI

Aquí hay menos datos públicos sólidos. Patrones reutilizables:
- "No hay estudios públicos rigurosos en España sobre el ROI de la accesibilidad, pero en mi experiencia auditando webs…"
- Evitar inventar cifras tipo "el 30% más de conversión". Si no hay fuente, no se cita.

## Herramientas técnicas mencionadas con frecuencia

### Automatizadas (detectan ~30% de problemas reales)
- **axe DevTools** (Deque Systems) — referencia del sector
- **WAVE** (WebAIM)
- **Lighthouse** (Google) — el más conocido, NO suficiente por sí solo
- **Pa11y** — CLI, útil para integración CI/CD
- **HTML_CodeSniffer**

### Lectores de pantalla (para pruebas manuales)
- **NVDA** (Windows, gratis) — el más usado en auditorías profesionales
- **JAWS** (Windows, de pago) — referencia comercial histórica
- **VoiceOver** (macOS / iOS, integrado)
- **TalkBack** (Android, integrado)

### Análisis de contraste
- **Colour Contrast Analyser** (TPGi)
- **WebAIM Contrast Checker**

## Cifras que NUNCA se inventan

Si un post necesita un dato y no se tiene, ponerlo así literalmente:

> [PENDIENTE DE VERIFICAR — buscar fuente antes de publicar]

Es preferible publicar sin el dato a publicar con un dato inventado. Una cifra falsa detectada hunde la credibilidad del blog entero.

## Conceptos que se confunden y conviene distinguir

| Confusión | Aclaración |
|---|---|
| WCAG vs UNE-EN 301 549 | WCAG es la norma técnica web (W3C). UNE-EN 301 549 es la norma europea que incluye WCAG AA + criterios extra para TIC en general (apps, hardware, documentos). |
| Accesibilidad vs Usabilidad | Accesibilidad: que puedan usarla **todos**, incluidas personas con discapacidad. Usabilidad: que sea fácil de usar para el usuario tipo. Se solapan, no son lo mismo. |
| Accesibilidad vs RGPD | Son dos normas distintas. Cumplir una no implica cumplir la otra. Errores frecuentes: cookie banners que cumplen RGPD pero no son accesibles. |
| Ley 11/2023 vs RD 193/2023 | La Ley es el marco general (transpone la EAA). El RD es el reglamento de desarrollo de la accesibilidad universal. Se complementan. |
| Declaración de Accesibilidad vs Aviso Legal | Distintos documentos. La Declaración de Accesibilidad solo es obligatoria para sector público (RD 1112/2018). En privado no es obligatoria, pero recomendable como elemento de transparencia. |
