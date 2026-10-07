import type { ImageMetadata } from "astro"
import type { Lang } from "../types"
import { routesFor } from "../config/site"
import vetaImage from "../assets/projects/veta.jpg"
import insideTheFrameImage from "../assets/projects/inside-the-frame.jpg"
import auditReportImage from "../assets/projects/auditoria-informe.png"

export type ProjectSlug = "veta" | "insideTheFrame" | "auditCase"

export interface ProjectEntry {
    slug: ProjectSlug
    // Externo, o la página del caso en cada idioma.
    href: string | ((lang: Lang) => string)
    image: ImageMetadata
    // "contain" para imágenes que no son una pantalla (la portada vertical de un
    // informe): recortarla a 16:10 dejaría solo el margen en blanco.
    imageFit: "cover" | "contain"
}

export const projects: Record<ProjectSlug, ProjectEntry> = {
    veta: {
        slug: "veta",
        href: "https://vetaatlas.com/",
        image: vetaImage,
        imageFit: "cover",
    },
    insideTheFrame: {
        slug: "insideTheFrame",
        href: "https://artgallery360.art/",
        image: insideTheFrameImage,
        imageFit: "cover",
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
