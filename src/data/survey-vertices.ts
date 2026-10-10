import type { Lang } from "../types"
import { routesFor, type SiteRoutes } from "../config/site"

// Cada apartado de la web cuelga de una cumbre real de la Sierra de
// Guadarrama. Coordenadas y altitudes de OpenStreetMap (natural=peak).
export interface SurveyVertex {
    id: string
    code: string
    peak: string
    elevation: number
    lat: number
    lon: number
    label: Record<Lang, string>
    // Una línea bajo el nombre del apartado: la pregunta del cliente que
    // responde, no lo que hago yo.
    summary: Record<Lang, string>
    // Página a la que lleva, como clave de las rutas de cada idioma.
    route?: keyof SiteRoutes
    status?: Record<Lang, string>
}

export const surveyVertices: SurveyVertex[] = [
    {
        id: "immersive",
        code: "V·01",
        peak: "Peñalara",
        elevation: 2428,
        lat: 40.85004,
        lon: -3.95607,
        label: { es: "Experiencias 3D", en: "3D experiences" },
        summary: { es: "¿Tu producto no luce en una foto?", en: "Does your product fall flat in photos?" },
        route: "immersive",
    },
    {
        id: "accessibility",
        code: "V·02",
        peak: "Siete Picos",
        elevation: 2138,
        lat: 40.78163,
        lon: -4.03236,
        label: { es: "Accesibilidad", en: "Accessibility" },
        summary: { es: "¿Te obliga la ley? ¿Pierdes clientes?", en: "Does the law apply? Losing customers?" },
        route: "accessibility",
    },
    {
        id: "questions",
        code: "V·03",
        peak: "La Mujer Muerta",
        elevation: 2197,
        lat: 40.81017,
        lon: -4.09417,
        label: { es: "Tus dudas", en: "Your questions" },
        summary: { es: "¿Irá rápida? ¿Saldrá en Google?", en: "Fast? Easy to find on Google?" },
        route: "questions",
    },
]

// Los vértices con su texto y su enlace en un idioma.
export function surveyVerticesFor(lang: Lang) {
    const routes = routesFor(lang)
    return surveyVertices.map((vertex) => ({
        ...vertex,
        label: vertex.label[lang],
        summary: vertex.summary[lang],
        href: vertex.route ? routes[vertex.route] : undefined,
        status: vertex.status?.[lang],
    }))
}
