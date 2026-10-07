// Posición del sol y de la luna para un lugar y un instante. Fórmulas de
// Astronomy Answers (las mismas que usa SunCalc): precisión de décimas de
// grado, de sobra para decidir la luz de una escena.

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2_440_588;
const J2000 = 2_451_545;
const OBLIQUITY = RAD * 23.4397;
const SUN_DISTANCE_KM = 149_598_000;

export interface SkyPosition {
  // Azimut desde el norte, en sentido horario (radianes).
  azimuth: number;
  // Altura sobre el horizonte (radianes).
  altitude: number;
}

export interface MoonState extends SkyPosition {
  // Fracción iluminada del disco, de 0 (luna nueva) a 1 (llena).
  illumination: number;
  // Creciente si la parte iluminada aumenta.
  waxing: boolean;
}

const toDays = (date: Date) => date.valueOf() / DAY_MS - 0.5 + J1970 - J2000;

const rightAscension = (l: number, b: number) =>
  Math.atan2(Math.sin(l) * Math.cos(OBLIQUITY) - Math.tan(b) * Math.sin(OBLIQUITY), Math.cos(l));

const declination = (l: number, b: number) =>
  Math.asin(Math.sin(b) * Math.cos(OBLIQUITY) + Math.cos(b) * Math.sin(OBLIQUITY) * Math.sin(l));

const siderealTime = (days: number, westLongitude: number) => RAD * (280.16 + 360.9856235 * days) - westLongitude;

const altitudeOf = (hourAngle: number, latitude: number, dec: number) =>
  Math.asin(Math.sin(latitude) * Math.sin(dec) + Math.cos(latitude) * Math.cos(dec) * Math.cos(hourAngle));

// Azimut medido desde el sur; se pasa a "desde el norte" sumando 180°.
const azimuthOf = (hourAngle: number, latitude: number, dec: number) =>
  Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(latitude) - Math.tan(dec) * Math.cos(latitude)) +
  Math.PI;

function sunCoordinates(days: number) {
  const meanAnomaly = RAD * (357.5291 + 0.98560028 * days);
  const center = RAD * (1.9148 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly) + 0.0003 * Math.sin(3 * meanAnomaly));
  const eclipticLongitude = meanAnomaly + center + RAD * 102.9372 + Math.PI;
  return { dec: declination(eclipticLongitude, 0), ra: rightAscension(eclipticLongitude, 0) };
}

function moonCoordinates(days: number) {
  const meanLongitude = RAD * (218.316 + 13.176396 * days);
  const meanAnomaly = RAD * (134.963 + 13.064993 * days);
  const meanDistance = RAD * (93.272 + 13.22935 * days);
  const longitude = meanLongitude + RAD * 6.289 * Math.sin(meanAnomaly);
  const latitude = RAD * 5.128 * Math.sin(meanDistance);
  return {
    ra: rightAscension(longitude, latitude),
    dec: declination(longitude, latitude),
    distanceKm: 385_001 - 20_905 * Math.cos(meanAnomaly),
  };
}

export function sunPosition(date: Date, lat: number, lon: number): SkyPosition {
  const days = toDays(date);
  const west = RAD * -lon;
  const phi = RAD * lat;
  const sun = sunCoordinates(days);
  const hourAngle = siderealTime(days, west) - sun.ra;
  return { azimuth: azimuthOf(hourAngle, phi, sun.dec), altitude: altitudeOf(hourAngle, phi, sun.dec) };
}

export function moonState(date: Date, lat: number, lon: number): MoonState {
  const days = toDays(date);
  const west = RAD * -lon;
  const phi = RAD * lat;
  const moon = moonCoordinates(days);
  const hourAngle = siderealTime(days, west) - moon.ra;

  const sun = sunCoordinates(days);
  const elongation = Math.acos(
    Math.sin(sun.dec) * Math.sin(moon.dec) + Math.cos(sun.dec) * Math.cos(moon.dec) * Math.cos(sun.ra - moon.ra),
  );
  const phaseAngle = Math.atan2(SUN_DISTANCE_KM * Math.sin(elongation), moon.distanceKm - SUN_DISTANCE_KM * Math.cos(elongation));
  const brightLimb = Math.atan2(
    Math.cos(sun.dec) * Math.sin(sun.ra - moon.ra),
    Math.sin(sun.dec) * Math.cos(moon.dec) - Math.cos(sun.dec) * Math.sin(moon.dec) * Math.cos(sun.ra - moon.ra),
  );

  return {
    azimuth: azimuthOf(hourAngle, phi, moon.dec),
    altitude: altitudeOf(hourAngle, phi, moon.dec),
    illumination: (1 + Math.cos(phaseAngle)) / 2,
    waxing: brightLimb < 0,
  };
}

export function radiansToDegrees(value: number): number {
  return value / RAD;
}
