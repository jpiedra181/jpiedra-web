import { AdditiveBlending, Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three';

// Lluvia y nieve dibujadas en pantalla, por encima del terreno, con el mismo
// lenguaje del mapa: rayas finas y puntos, nada de gotas fotorrealistas. Todo
// es procedural (sin partículas), así que el coste no depende de la cantidad.
const RAIN_ALPHA = 0.32;
const SNOW_ALPHA = 0.85;

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec2 uResolution;
  uniform float uPixelRatio;
  uniform float uTime;
  uniform float uRain;
  uniform float uSnow;
  uniform float uSlant;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Una capa de lluvia: columnas con trazos que caen. Varias capas con
  // distinta escala y velocidad dan sensación de profundidad.
  float rainLayer(vec2 frag, float column, float period, float length, float speed, float seed) {
    vec2 p = frag;
    p.x += p.y * uSlant;
    float col = floor(p.x / column);
    float rnd = hash(vec2(col, seed));
    float y = p.y + uTime * speed * (0.8 + 0.4 * rnd) + rnd * period;
    float drop = floor(y / period);
    float visible = step(1.0 - uRain * 0.85, hash(vec2(col, drop + seed)));
    float local = mod(y, period);
    float streak = (1.0 - smoothstep(length * 0.6, length, local)) * smoothstep(0.0, length * 0.15, local);
    float x = abs(fract(p.x / column) - 0.5) * column;
    float line = 1.0 - smoothstep(0.35, 0.9, x);
    return streak * line * visible;
  }

  float snowLayer(vec2 frag, float cell, float radius, float speed, float seed) {
    vec2 p = frag;
    p.y += uTime * speed;
    p.x += sin(uTime * 0.6 + p.y / 90.0 + seed) * 12.0 + p.y * uSlant * 0.6;
    vec2 index = floor(p / cell);
    vec2 center = (index + vec2(hash(index + seed), hash(index + seed + 4.7))) * cell;
    float present = step(1.0 - uSnow * 0.9, hash(index + seed + 9.1));
    float distanceToFlake = length(p - center);
    return (1.0 - smoothstep(radius * 0.4, radius, distanceToFlake)) * present;
  }

  void main() {
    vec2 frag = gl_FragCoord.xy / uPixelRatio;
    float rain = 0.0;
    if (uRain > 0.0) {
      rain += rainLayer(frag, 11.0, 210.0, 34.0, 900.0, 1.0) * 0.55;
      rain += rainLayer(frag, 17.0, 260.0, 52.0, 1250.0, 2.0) * 0.8;
      rain += rainLayer(frag, 29.0, 340.0, 80.0, 1700.0, 3.0);
    }
    float snow = 0.0;
    if (uSnow > 0.0) {
      snow += snowLayer(frag, 34.0, 1.6, 22.0, 1.0) * 0.5;
      snow += snowLayer(frag, 58.0, 2.4, 38.0, 2.0) * 0.75;
      snow += snowLayer(frag, 96.0, 3.6, 60.0, 3.0);
    }
    vec3 color = vec3(0.72, 0.8, 0.88) * rain * ${RAIN_ALPHA.toFixed(2)} + vec3(0.93, 0.95, 0.98) * snow * ${SNOW_ALPHA.toFixed(2)};
    gl_FragColor = vec4(color, 1.0);
  }
`;

export interface Precipitation {
  mesh: Mesh;
  update(rain: number, snow: number, slant: number, time: number): void;
  resize(width: number, height: number, pixelRatio: number): void;
  dispose(): void;
}

export function createPrecipitation(): Precipitation {
  const uniforms = {
    uResolution: { value: new Vector2(1, 1) },
    uPixelRatio: { value: 1 },
    uTime: { value: 0 },
    uRain: { value: 0 },
    uSnow: { value: 0 },
    uSlant: { value: 0 },
  };
  // Mezcla aditiva: la lluvia y la nieve solo aclaran, nunca tapan el mapa.
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    blending: AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new Mesh(new PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 10;

  return {
    mesh,
    update(rain, snow, slant, time) {
      uniforms.uRain.value = rain;
      uniforms.uSnow.value = snow;
      uniforms.uSlant.value = slant;
      uniforms.uTime.value = time;
      mesh.visible = rain > 0 || snow > 0;
    },
    resize(width, height, pixelRatio) {
      uniforms.uResolution.value.set(width, height);
      uniforms.uPixelRatio.value = pixelRatio;
    },
    dispose() {
      mesh.geometry.dispose();
      material.dispose();
    },
  };
}
