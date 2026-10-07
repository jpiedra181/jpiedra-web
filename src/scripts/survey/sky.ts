import { Color, Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three';
import type { Atmosphere } from './atmosphere';

// El cielo es un panorama dibujado en pantalla sobre la silueta de la sierra:
// la cámara mira hacia abajo y el horizonte real queda fuera de cuadro. El
// acimut se comprime (±90° ocupan el ancho de la pantalla) para que el sol y
// la luna entren en escena casi siempre que estén delante.
const AZIMUTH_SPREAD = 1;
// Altura que ocupa todo el cielo visible. El sol solo entra en cuadro cerca
// del horizonte (amanecer y atardecer, cuando luce); la luna, toda la noche.
const SUN_ALTITUDE_RANGE = (14 * Math.PI) / 180;
const MOON_ALTITUDE_RANGE = (70 * Math.PI) / 180;
// Techo del cielo en pantalla: por encima está el panel de datos.
const SKY_CEILING = 0.88;
const SUN_RADIUS_PX = 9;
const MOON_RADIUS_PX = 13;
const STAR_CELL_PX = 46;

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  uniform float uHorizon;
  uniform vec3 uZenith;
  uniform vec3 uHorizonColor;
  uniform vec3 uGlow;
  uniform float uGlowAmount;
  uniform float uGlowX;
  uniform vec2 uSun;
  uniform float uSunVisible;
  uniform vec2 uMoon;
  uniform float uMoonVisible;
  uniform float uMoonPhaseAngle;
  uniform vec2 uMoonLightDir;
  uniform float uStars;
  uniform float uTime;
  uniform float uTwinkle;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 frag = gl_FragCoord.xy / uPixelRatio;
    vec2 resolution = uResolution;
    float y = frag.y / resolution.y;
    float height = clamp((y - uHorizon) / max(1.0 - uHorizon, 0.001), 0.0, 1.0);

    vec3 color = mix(uHorizonColor, uZenith, smoothstep(0.0, 0.85, height));

    // Resplandor sobre el horizonte del lado del sol.
    float dx = (frag.x / resolution.x - uGlowX) * (resolution.x / resolution.y);
    float glowBand = exp(-dx * dx / 0.18) * (1.0 - smoothstep(0.0, 0.45, height));
    color += uGlow * glowBand * uGlowAmount * 0.6;
    color += uGlow * (1.0 - smoothstep(0.0, 0.12, height)) * uGlowAmount * 0.12;

    // Estrellas: una por celda, en posición y brillo pseudoaleatorios.
    vec2 cell = floor(frag / ${STAR_CELL_PX.toFixed(1)});
    vec2 starPos = (cell + vec2(hash(cell), hash(cell + 7.3))) * ${STAR_CELL_PX.toFixed(1)};
    float brightness = pow(hash(cell + 3.1), 6.0);
    float twinkle = mix(1.0, 0.6 + 0.4 * sin(uTime * (1.0 + hash(cell) * 3.0) + hash(cell) * 6.28), uTwinkle);
    float star = (1.0 - smoothstep(0.0, 1.3, distance(frag, starPos))) * brightness * twinkle;
    color += vec3(0.85, 0.88, 0.95) * star * uStars * smoothstep(0.02, 0.2, height);

    // Sol: disco y halo.
    float sunDistance = distance(frag, uSun);
    color += uGlow * exp(-sunDistance / 60.0) * 0.35 * uSunVisible;
    color = mix(color, vec3(1.0, 0.93, 0.78), (1.0 - smoothstep(${SUN_RADIUS_PX.toFixed(1)} - 1.0, ${SUN_RADIUS_PX.toFixed(1)} + 1.0, sunDistance)) * uSunVisible);

    // Luna: esfera iluminada desde el sol según su fase real.
    vec2 p = (frag - uMoon) / ${MOON_RADIUS_PX.toFixed(1)};
    float r2 = dot(p, p);
    if (r2 < 1.0) {
      vec3 normal = vec3(p, sqrt(1.0 - r2));
      vec3 light = vec3(uMoonLightDir * sin(uMoonPhaseAngle), cos(uMoonPhaseAngle));
      float lit = smoothstep(-0.06, 0.06, dot(normal, light));
      vec3 moonColor = mix(color + vec3(0.025), vec3(0.94, 0.91, 0.84), lit);
      color = mix(color, moonColor, uMoonVisible * (1.0 - smoothstep(0.9, 1.0, r2)));
    }
    color += vec3(0.55, 0.6, 0.72) * exp(-distance(frag, uMoon) / 90.0) * 0.08 * uMoonVisible;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface SkyScreenPosition {
  x: number;
  y: number;
  visible: boolean;
}

export interface Sky {
  mesh: Mesh;
  update(atmosphere: Atmosphere, viewAzimuth: number, horizon: number, time: number): void;
  resize(width: number, height: number, pixelRatio: number): void;
  dispose(): void;
}

function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function projectToSky(
  azimuth: number,
  altitude: number,
  altitudeRange: number,
  viewAzimuth: number,
  horizon: number,
  width: number,
  height: number,
): SkyScreenPosition {
  const delta = wrapAngle(azimuth - viewAzimuth);
  const x = (0.5 + (delta / Math.PI) * AZIMUTH_SPREAD) * width;
  const ceiling = Math.max(SKY_CEILING, horizon + 0.02);
  const y = (horizon + (altitude / altitudeRange) * (ceiling - horizon)) * height;
  const visible = Math.abs(delta) < Math.PI / 2 && altitude > -0.02 && altitude < altitudeRange;
  return { x, y, visible };
}

export function createSky(twinkle: boolean): Sky {
  const uniforms = {
    uResolution: { value: new Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uHorizon: { value: 0.75 },
    uZenith: { value: new Color() },
    uHorizonColor: { value: new Color() },
    uGlow: { value: new Color() },
    uGlowAmount: { value: 0 },
    uGlowX: { value: 0.5 },
    uSun: { value: new Vector2(-1000, -1000) },
    uSunVisible: { value: 0 },
    uMoon: { value: new Vector2(-1000, -1000) },
    uMoonVisible: { value: 0 },
    uMoonPhaseAngle: { value: 0 },
    uMoonLightDir: { value: new Vector2(1, 0) },
    uStars: { value: 0 },
    uTime: { value: 0 },
    uTwinkle: { value: twinkle ? 1 : 0 },
  };

  const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthTest: false, depthWrite: false });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;

  return {
    mesh,
    resize(width, height, pixelRatio) {
      uniforms.uResolution.value.set(width, height);
      uniforms.uPixelRatio.value = pixelRatio;
    },
    update(atmosphere, viewAzimuth, horizon, time) {
      const { x: width, y: height } = uniforms.uResolution.value;
      const sun = projectToSky(atmosphere.sun.azimuth, atmosphere.sun.altitude, SUN_ALTITUDE_RANGE, viewAzimuth, horizon, width, height);
      const moon = projectToSky(atmosphere.moon.azimuth, atmosphere.moon.altitude, MOON_ALTITUDE_RANGE, viewAzimuth, horizon, width, height);

      uniforms.uHorizon.value = horizon;
      uniforms.uZenith.value.copy(atmosphere.zenith);
      uniforms.uHorizonColor.value.copy(atmosphere.horizon);
      uniforms.uGlow.value.copy(atmosphere.glow);
      uniforms.uGlowAmount.value = atmosphere.glowAmount;
      uniforms.uGlowX.value = Math.min(Math.max(sun.x / width, -0.2), 1.2);
      uniforms.uSun.value.set(sun.x, sun.y);
      uniforms.uSunVisible.value = sun.visible ? 1 - atmosphere.veil : 0;
      uniforms.uMoon.value.set(moon.x, moon.y);
      uniforms.uMoonVisible.value = moon.visible ? 1 - atmosphere.veil * 0.9 : 0;
      // Ángulo de fase a partir de la fracción iluminada: 0 = llena, π = nueva.
      uniforms.uMoonPhaseAngle.value = Math.acos(Math.min(Math.max(2 * atmosphere.moon.illumination - 1, -1), 1));
      uniforms.uMoonLightDir.value.set(sun.x - moon.x, sun.y - moon.y).normalize();
      uniforms.uStars.value = atmosphere.stars;
      uniforms.uTime.value = time;
    },
    dispose() {
      mesh.geometry.dispose();
      material.dispose();
    },
  };
}
