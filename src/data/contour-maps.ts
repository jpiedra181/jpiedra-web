import type { ContourMapData, ElevationProfileData } from "../types"
import heroMap from "./terrain/clasica/mapa-hero.json"
import penalaraMap from "./terrain/clasica/mapa-penalara.json"
import sietePicosMap from "./terrain/clasica/mapa-siete-picos.json"
import bolaMap from "./terrain/clasica/mapa-bola-del-mundo.json"
import navacerradaBolaProfile from "./terrain/clasica/perfil-navacerrada-bola.json"
import granjaPenalaraProfile from "./terrain/clasica/perfil-granja-penalara.json"

// Los JSON salen de build_classic_maps.py (MDT25 del IGN y agua de
// OpenStreetMap). TypeScript los infiere con arrays sueltos: aquí se tipan.
export const penalaraMassif = heroMap as ContourMapData
export const penalaraSummit = penalaraMap as ContourMapData
export const sietePicosSummit = sietePicosMap as ContourMapData
export const bolaDelMundoSummit = bolaMap as ContourMapData
export const navacerradaToBola = navacerradaBolaProfile as ElevationProfileData
export const laGranjaToPenalara = granjaPenalaraProfile as ElevationProfileData

// Rejilla de cotas del plano del hero (enteros de 16 bits, little-endian),
// para leer la altitud bajo el cursor. Solo se descarga si hay ratón.
export const penalaraHeightGridUrl = "/levantamiento/penalara-cotas.bin"
