# CLAUDE.md — Instrucciones del proyecto jpiedra.com

## Contexto del proyecto

Este es el blog de **jpiedra.com**, marca personal de un consultor freelance especializado en **accesibilidad web** para PYMEs españolas y europeas obligadas a cumplir:

- Ley 11/2023 (transposición de la Directiva UE 2019/882, "European Accessibility Act")
- Real Decreto 193/2023 (sobre accesibilidad de productos y servicios)
- Real Decreto 1112/2018 (sector público)
- UNE-EN 301 549 (norma técnica de referencia)
- WCAG 2.1 / 2.2 niveles A y AA

El stack es **Astro + Tailwind + SSG (Static Site Generation)**. Cada post se genera en build time. Las URLs siguen el patrón `/blog/[slug]`, sin fechas.

## Objetivo del blog

Captar tráfico orgánico cualificado (PYMEs y responsables técnicos que buscan información sobre cumplimiento de accesibilidad) y convertirlo en leads para servicios de auditoría y consultoría.

**No es** el canal principal de captación. Se trata como un activo a medio-largo plazo. Esto significa: pocos posts, bien hechos, antes que muchos posts mediocres.

## Workflow al crear un post

Antes de escribir, Claude debe **siempre**:

1. Leer `voice.md`, `humor.md`, `stats.md` y `stories.md` y aplicarlos.
2. Si el usuario proporciona una keyword, buscar los 3 primeros resultados en Google España (sin contar Reddit/Quora/foros) y analizar:
   - Longitud media en palabras
   - Estructura de H2/H3
   - Temas que cubren (y especialmente, temas que **no** cubren — son oportunidades)
   - Tono de los competidores
3. Proponer una estructura de post **antes** de escribir el borrador completo. El usuario validará la estructura.
4. Solo entonces, generar el borrador.

## Reglas estructurales innegociables

- **Cluster de keywords, no keyword única.** Cada post debe rankear para una keyword principal + 5-10 secundarias relacionadas. Estas se identifican antes de escribir, no después.
- **Article schema JSON-LD** en cada post (autor: Javier Piedra, organización: jpiedra.com).
- **Meta description** de 150-160 caracteres, escrita manualmente, no "AI obvia".
- **H1 único** que contiene la keyword principal. Sin keyword stuffing.
- **Primer párrafo** (lead) debe enganchar en menos de 50 palabras. Si no lo hace, reescribir. Ver `voice.md`.
- **Longitud objetivo**: la media del top 3 ±10%. Si el top 3 ronda 1800 palabras, escribir 1700-2000. No más por inflar, no menos por pereza.
- **Enlaces internos**: cada post enlaza al menos a 2 posts existentes del blog y a 1 página de servicio relevante.
- **Enlaces externos**: solo a fuentes primarias (BOE, W3C, EU, organismos oficiales). Nunca a competidores. Nunca a contenido caduco.
- **Imágenes**: máximo 3 por post. Capturas reales anonimizadas > stock photos. Si se usa Pexels, evitar las típicas "team meeting con post-its".
- **CTA final**: una sola, sobria, contextual al post. Nada de "¡Contrátame ya!". Ver `voice.md` sección "Cierres".

## Lo que NUNCA hace este blog

- Lenguaje inclusivo forzado ("todes", "lxs"). Distrae del mensaje.
- Promesas de resultados con cifras ("tu web 100% accesible en 7 días").
- Comparativas nominales con competidores ("a diferencia de XYZ Studio…").
- Emojis decorativos. Excepción: ✅ y ❌ en listas comparativas.
- Cierres mendigos: "Espero que te haya servido", "Déjame tu comentario abajo".
- Frases motivacionales vacías: "La accesibilidad es el futuro", "Hagamos un mundo mejor".
- Inventar datos. Si no hay estadística pública, decirlo explícitamente.
- Hablar en futuro vago: "pronto será obligatorio". Si ya es obligatorio, decir desde cuándo. Si no, no mencionarlo.

## Tipos de post

1. **Pilar** (2500-3500 palabras): cubre un tema completo. Ej: "Guía completa de la Ley 11/2023 para PYMEs".
2. **Satélite** (1200-1800 palabras): profundiza en un subtema del pilar. Ej: "Sanciones por incumplimiento de la Ley 11/2023".
3. **Tutorial técnico** (1500-2500 palabras): cómo arreglar un problema concreto. Ej: "Cómo hacer un formulario accesible en HTML".
4. **Opinión / desmontaje** (1000-1500 palabras): postura fuerte sobre un tema del sector. Ej: "Por qué los overlays de accesibilidad son humo".

## Archivos de referencia

- `voice.md` — Cómo escribe esta persona
- `humor.md` — Qué tono de humor usa, qué referencias culturales
- `stats.md` — Datos y normativa que cita habitualmente
- `stories.md` — Anécdotas y ejemplos genéricos reutilizables
- `keywords.csv` — (Cuando exista) Lista de keywords trabajadas

Si alguno de estos archivos no se ha aplicado claramente en el borrador generado, **reescribir el borrador**. No son sugerencias, son requisitos.
