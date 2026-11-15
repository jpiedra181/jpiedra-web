import type { ImageMetadata } from "astro"
import type { Lang } from "../types"
import posterEs from "../assets/casos/configurador/es/poster.jpg"
import posterEn from "../assets/casos/configurador/en/poster.jpg"
import finishesEs from "../assets/casos/configurador/es/acabados.jpg"
import finishesEn from "../assets/casos/configurador/en/acabados.jpg"
import stylesEs from "../assets/casos/configurador/es/estilos.jpg"
import stylesEn from "../assets/casos/configurador/en/estilos.jpg"
import compareEs from "../assets/casos/configurador/es/comparador.jpg"
import compareEn from "../assets/casos/configurador/en/comparador.jpg"
import nightEs from "../assets/casos/configurador/es/noche.jpg"
import nightEn from "../assets/casos/configurador/en/noche.jpg"
import emptyEs from "../assets/casos/configurador/es/vacia.jpg"
import emptyEn from "../assets/casos/configurador/en/vacia.jpg"
import dimensionsEs from "../assets/casos/configurador/es/medidas.jpg"
import dimensionsEn from "../assets/casos/configurador/en/medidas.jpg"
import summaryEs from "../assets/casos/configurador/es/resumen.jpg"
import summaryEn from "../assets/casos/configurador/en/resumen.jpg"
import mobileEs from "../assets/casos/configurador/es/movil.jpg"
import mobileEn from "../assets/casos/configurador/en/movil.jpg"
import whiteLabelEs from "../assets/casos/configurador/es/marca-blanca.jpg"
import whiteLabelEn from "../assets/casos/configurador/en/marca-blanca.jpg"
import lighthouseReport from "../assets/casos/configurador/lighthouse.jpg"

// Imágenes y vídeo de la página del caso del configurador de cocina. Las
// capturas enseñan la interfaz con texto, así que van una por idioma; salen de
// docs/portfolio/ del proyecto del configurador.

// Mismo orden e identificadores que configuratorCase.features.items en es.json.
export type ConfiguratorFeatureId =
    | "acabados"
    | "estilos"
    | "comparador"
    | "noche"
    | "vacia"
    | "medidas"
    | "resumen"
    | "movil"

interface ConfiguratorCaseMedia {
    // En public/: el vídeo no pasa por el optimizador de imágenes.
    video: string
    poster: ImageMetadata
    features: Record<ConfiguratorFeatureId, ImageMetadata>
    whiteLabel: ImageMetadata
}

export const configuratorCaseMedia: Record<Lang, ConfiguratorCaseMedia> = {
    es: {
        video: "/casos/configurador-cocina-3d/recorrido-es.mp4",
        poster: posterEs,
        features: {
            acabados: finishesEs,
            estilos: stylesEs,
            comparador: compareEs,
            noche: nightEs,
            vacia: emptyEs,
            medidas: dimensionsEs,
            resumen: summaryEs,
            movil: mobileEs,
        },
        whiteLabel: whiteLabelEs,
    },
    en: {
        video: "/casos/configurador-cocina-3d/recorrido-en.mp4",
        poster: posterEn,
        features: {
            acabados: finishesEn,
            estilos: stylesEn,
            comparador: compareEn,
            noche: nightEn,
            vacia: emptyEn,
            medidas: dimensionsEn,
            resumen: summaryEn,
            movil: mobileEn,
        },
        whiteLabel: whiteLabelEn,
    },
}

export { lighthouseReport }

// Datos del vídeo para schema.org (VideoObject).
export const VIDEO_DURATION_ISO = "PT1M11S"
export const VIDEO_UPLOAD_DATE = "2026-11-15"

// La misma cocina con la marca de una promotora inventada
// (web/public/marcas/residencial.json en el proyecto del configurador).
export const whiteLabelDemoHref = (lang: Lang) => `https://3d.jpiedra.com/?lang=${lang}&marca=residencial`
