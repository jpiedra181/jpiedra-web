import { Color, Vector3 } from 'three';
import { sceneStrings } from './strings';
import { moonState, radiansToDegrees, sunPosition } from '../sky-ephemeris';

// Paletas según la altura del sol, en grados. Entre dos paradas se interpola,
// así que el paso de la tarde a la noche es continuo, minuto a minuto.
interface PaletteStop {
  altitude: number;
  zenith: string;
  horizon: string;
  glow: string;
  line: string;
  ground: string;
  water: string;
  stars: number;
  glowAmount: number;
  light: number;
}

const PALETTE_STOPS: PaletteStop[] = [
  { altitude: -14, zenith: '#03050a', horizon: '#0b1322', glow: '#1a2440', line: '#d6cdb0', ground: '#06080c', water: '#26405a', stars: 1, glowAmount: 0, light: 0 },
  { altitude: -7, zenith: '#050914', horizon: '#1b2843', glow: '#54406a', line: '#dfc78f', ground: '#080b11', water: '#3a4a78', stars: 0.7, glowAmount: 0.55, light: 0.12 },
  { altitude: -1, zenith: '#0a1222', horizon: '#3b2f45', glow: '#e57c44', line: '#f2b865', ground: '#0a0d13', water: '#8a5a6e', stars: 0.15, glowAmount: 1, light: 0.75 },
  { altitude: 6, zenith: '#16243a', horizon: '#3b3d4a', glow: '#dc9d5f', line: '#efc376', ground: '#0f141c', water: '#76788f', stars: 0, glowAmount: 0.7, light: 0.95 },
  { altitude: 18, zenith: '#1a2f4a', horizon: '#3e5571', glow: '#5f7189', line: '#f0d07e', ground: '#111923', water: '#5d8db0', stars: 0, glowAmount: 0.3, light: 1 },
  { altitude: 40, zenith: '#21395a', horizon: '#4a6585', glow: '#6c7f98', line: '#f3d486', ground: '#141d29', water: '#6898bb', stars: 0, glowAmount: 0.25, light: 1 },
];

const TWILIGHT_DEGREES = 6;
const SUN_LIGHT_MIN_ALTITUDE = -3;
const MOON_LIGHT_STRENGTH = 0.5;
const NEW_MOON_THRESHOLD = 0.03;
const FULL_MOON_THRESHOLD = 0.97;

export interface Atmosphere {
  zenith: Color;
  horizon: Color;
  glow: Color;
  line: Color;
  ground: Color;
  water: Color;
  stars: number;
  glowAmount: number;
  lightDirection: Vector3;
  lightStrength: number;
  // Fracción de cielo tapada por nubes (0 despejado, 1 cubierto).
  veil: number;
  sun: { azimuth: number; altitude: number; direction: Vector3 };
  moon: { azimuth: number; altitude: number; direction: Vector3; illumination: number };
  label: string;
}

export function directionFromSky(azimuth: number, altitude: number): Vector3 {
  // Mundo: x hacia el este, z hacia el sur, y hacia arriba.
  return new Vector3(
    Math.sin(azimuth) * Math.cos(altitude),
    Math.sin(altitude),
    -Math.cos(azimuth) * Math.cos(altitude),
  ).normalize();
}

function interpolatePalette(altitudeDegrees: number) {
  const first = PALETTE_STOPS[0];
  const last = PALETTE_STOPS[PALETTE_STOPS.length - 1];
  let from = first;
  let to = first;
  if (altitudeDegrees >= last.altitude) {
    from = to = last;
  } else if (altitudeDegrees > first.altitude) {
    const index = PALETTE_STOPS.findIndex((stop) => stop.altitude > altitudeDegrees);
    from = PALETTE_STOPS[index - 1];
    to = PALETTE_STOPS[index];
  }
  const t = from === to ? 0 : (altitudeDegrees - from.altitude) / (to.altitude - from.altitude);
  const mixColor = (a: string, b: string) => new Color(a).lerp(new Color(b), t);
  const mixNumber = (a: number, b: number) => a + (b - a) * t;
  return {
    zenith: mixColor(from.zenith, to.zenith),
    horizon: mixColor(from.horizon, to.horizon),
    glow: mixColor(from.glow, to.glow),
    line: mixColor(from.line, to.line),
    ground: mixColor(from.ground, to.ground),
    water: mixColor(from.water, to.water),
    stars: mixNumber(from.stars, to.stars),
    glowAmount: mixNumber(from.glowAmount, to.glowAmount),
    light: mixNumber(from.light, to.light),
  };
}

const compass = (azimuth: number) => sceneStrings().compass[Math.round(radiansToDegrees(azimuth) / 45) % 8];

function describeMoon(illumination: number, waxing: boolean): string {
  const { moon } = sceneStrings();
  if (illumination < NEW_MOON_THRESHOLD) return moon.new;
  if (illumination > FULL_MOON_THRESHOLD) return moon.full;
  return moon.phase(waxing, Math.round(illumination * 100));
}

function describeSky(sunAltitude: number, sunAzimuth: number, moonText: string, moonUp: boolean): string {
  const { sky } = sceneStrings();
  const altitude = Math.round(radiansToDegrees(sunAltitude));
  if (altitude < -TWILIGHT_DEGREES) return sky.night(moonText, moonUp);
  const moment = altitude < TWILIGHT_DEGREES ? (radiansToDegrees(sunAzimuth) < 180 ? sky.dawn : sky.dusk) : sky.day;
  return sky.sun(moment, altitude, compass(sunAzimuth));
}

export function computeAtmosphere(date: Date, lat: number, lon: number): Atmosphere {
  const sun = sunPosition(date, lat, lon);
  const moon = moonState(date, lat, lon);
  const palette = interpolatePalette(radiansToDegrees(sun.altitude));
  const sunDirection = directionFromSky(sun.azimuth, sun.altitude);
  const moonDirection = directionFromSky(moon.azimuth, moon.altitude);

  // De día ilumina el sol; de noche, la luna si está por encima del horizonte;
  // sin ninguno de los dos queda una luz cenital muy tenue.
  let lightDirection = new Vector3(0, 1, 0);
  let lightStrength = palette.light;
  if (radiansToDegrees(sun.altitude) > SUN_LIGHT_MIN_ALTITUDE) {
    lightDirection = sunDirection.clone();
  } else if (moon.altitude > 0) {
    lightDirection = moonDirection.clone();
    lightStrength = Math.max(lightStrength, MOON_LIGHT_STRENGTH * moon.illumination);
  }

  return {
    ...palette,
    lightDirection,
    lightStrength,
    veil: 0,
    sun: { azimuth: sun.azimuth, altitude: sun.altitude, direction: sunDirection },
    moon: { azimuth: moon.azimuth, altitude: moon.altitude, direction: moonDirection, illumination: moon.illumination },
    label: describeSky(sun.altitude, sun.azimuth, describeMoon(moon.illumination, moon.waxing), moon.altitude > 0),
  };
}
