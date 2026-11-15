import type { ImageMetadata } from "astro"
import type { Lang } from "../types"
import { routesFor } from "../config/site"
import vetaImage from "../assets/projects/veta.jpg"
import insideTheFrameImage from "../assets/projects/inside-the-frame.jpg"
import auditReportImage from "../assets/projects/auditoria-informe.png"
import configuratorImageEs from "../assets/projects/configurador-es.jpg"
import configuratorImageEn from "../assets/projects/configurador-en.jpg"

export type ProjectSlug = "kitchenConfigurator" | "veta" | "insideTheFrame" | "auditCase"

export interface ProjectEntry {
    slug: ProjectSlug
    // Externo, o la página del caso en cada idioma.
    href: string | ((lang: Lang) => string)
    // Una por idioma cuando la captura enseña la interfaz con texto.
    image: ImageMetadata | Record<Lang, ImageMetadata>
    // "contain" para imágenes que no son una pantalla (la portada vertical de un
    // informe): recortarla a 16:10 dejaría solo el margen en blanco.
    imageFit: "cover" | "contain"
    // Ficha de accesibilidad publicada en la web (solo en castellano).
    accessibilitySheet?: string
    // Página del caso en esta web, con el vídeo y cómo está hecho.
    casePage?: (lang: Lang) => string
}

export const projects: Record<ProjectSlug, ProjectEntry> = {
    kitchenConfigurator: {
        slug: "kitchenConfigurator",
        // Sin ?lang el configurador elige por el idioma del navegador, que no
        // tiene por qué coincidir con el de la página desde la que se abre.
        href: (lang) => `https://3d.jpiedra.com/?lang=${lang}`,
        image: { es: configuratorImageEs, en: configuratorImageEn },
        imageFit: "cover",
        casePage: (lang) => routesFor(lang).configuratorCase,
    },
    veta: {
        slug: "veta",
        href: "https://vetaatlas.com/",
        image: vetaImage,
        imageFit: "cover",
        accessibilitySheet: "/fichas-accesibilidad/veta/",
    },
    insideTheFrame: {
        slug: "insideTheFrame",
        href: "https://artgallery360.art/",
        image: insideTheFrameImage,
        imageFit: "cover",
        accessibilitySheet: "/fichas-accesibilidad/inside-the-frame/",
    },
    auditCase: {
        slug: "auditCase",
        href: (lang) => routesFor(lang).caseStudy,
        image: auditReportImage,
        imageFit: "contain",
    },
}

export const projectHref = (project: ProjectEntry, lang: Lang) =>
    typeof project.href === "function" ? project.href(lang) : project.href

export const projectImage = (project: ProjectEntry, lang: Lang): ImageMetadata =>
    "src" in project.image ? project.image : project.image[lang]
