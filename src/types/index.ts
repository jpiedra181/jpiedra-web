export type Lang = 'es' | 'en';

export interface Project {
  slug: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  link: string;
}

export interface ApproachStep {
  number: string;
  title: string;
  description: string;
}

export interface NavItem {
  href: string;
  label: string;
}

// Planos de curvas de nivel generados a partir del MDT25 del IGN
// (src/data/terrain/clasica). Coordenadas en unidades del viewBox.
export interface ContourLevel {
  z: number;
  major: boolean;
  // Curvas de la cota (líneas abiertas o anillos).
  d: string[];
  // Polígono del terreno por encima de la cota, cerrado por el borde del plano.
  area: string;
}

export interface ContourPeak {
  name: string;
  elevation: number;
  lat: number;
  lon: number;
  x: number;
  y: number;
}

export interface ContourMapData {
  viewBox: [number, number];
  bounds: { lat0: number; lat1: number; lon0: number; lon1: number };
  kmPx: number;
  interval: number;
  minZ: number;
  maxZ: number;
  levels: ContourLevel[];
  water: { z: number; d: string }[];
  peaks: ContourPeak[];
  heightGrid?: { cols: number; rows: number; step: number };
}

export interface ElevationProfileData {
  from: { name: string; lat: number; lon: number };
  to: { name: string; elevation: number; lat: number; lon: number };
  distanceKm: number;
  heights: number[];
}
