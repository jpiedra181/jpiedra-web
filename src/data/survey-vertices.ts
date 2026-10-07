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
        route: "accessibility",
    },
    {
        id: "about",
        code: "V·03",
        peak: "La Mujer Muerta",
        elevation: 2197,
        lat: 40.81017,
        lon: -4.09417,
        label: { es: "Sobre mí", en: "About me" },
        route: "about",
    },
    {
        id: "ai",
        code: "V·04",
        peak: "Bola del Mundo",
        elevation: 2265,
        lat: 40.78469,
        lon: -3.97975,
        label: { es: "Agentes de IA", en: "AI agents" },
        route: "ai",
    },
]

// Los vértices con su texto y su enlace en un idioma.
export function surveyVerticesFor(lang: Lang) {
    const routes = routesFor(lang)
    return surveyVertices.map((vertex) => ({
        ...vertex,
        label: vertex.label[lang],
        href: vertex.route ? routes[vertex.route] : undefined,
        status: vertex.status?.[lang],
    }))
}
