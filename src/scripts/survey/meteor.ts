import {
  AdditiveBlending,
  BufferAttribute,
  DoubleSide,
  BufferGeometry,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector3,
  type Camera,
  type Scene,
} from 'three';

// El meteorito del "Fin del mundo": una cabeza incandescente, su estela (una
// cinta que siempre mira a la cámara) y la lluvia de escombros del impacto.
// Todo en shaders con mezcla aditiva: sin luces, sin texturas que descargar.

const HEAD_SIZE_KM = 1.7;
const TRAIL_WIDTH_KM = 0.85;
const DEBRIS_COUNT = 900;
const DEBRIS_COUNT_MOBILE = 420;
// Gravedad exagerada como la altura del relieve: a escala real, los escombros
// tardarían un minuto en caer.
const DEBRIS_GRAVITY_KM = 5.5;

const headVertex = /* glsl */ `
  uniform float uSize;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 view = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    view.xy += position.xy * uSize;
    gl_Position = projectionMatrix * view;
  }
`;

const headFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.0, 0.32, d);
    float glow = exp(-d * d * 5.0);
    vec3 color = mix(vec3(1.0, 0.42, 0.1), vec3(1.0, 0.96, 0.86), core);
    float alpha = clamp(glow * 0.85 + core, 0.0, 1.0) * uOpacity;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

const trailVertex = /* glsl */ `
  attribute float aAlong;
  attribute float aAcross;
  varying float vAlong;
  varying float vAcross;
  void main() {
    vAlong = aAlong;
    vAcross = aAcross;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const trailFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vAlong;
  varying float vAcross;
  void main() {
    float body = pow(1.0 - vAlong, 1.6);
    float edge = 1.0 - abs(vAcross * 2.0 - 1.0);
    float intensity = body * edge * edge;
    vec3 color = mix(vec3(1.0, 0.9, 0.7), vec3(0.95, 0.3, 0.08), smoothstep(0.0, 0.7, vAlong));
    float alpha = intensity * uOpacity;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

const debrisVertex = /* glsl */ `
  attribute vec3 aVelocity;
  attribute float aSeed;
  uniform vec3 uOrigin;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uGravity;
  varying float vLife;
  void main() {
    float t = max(uTime - aSeed * 0.18, 0.0);
    vec3 p = uOrigin + aVelocity * t;
    p.y -= 0.5 * uGravity * t * t;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    vLife = clamp(1.0 - t / (1.1 + aSeed * 1.4), 0.0, 1.0) * step(0.0001, t);
    gl_PointSize = (1.5 + aSeed * 4.5) * uPixelRatio * (14.0 / -view.z) * (0.35 + vLife * 0.65);
  }
`;

const debrisFragment = /* glsl */ `
  varying float vLife;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float spark = 1.0 - smoothstep(0.2, 1.0, d);
    vec3 color = mix(vec3(0.9, 0.25, 0.05), vec3(1.0, 0.85, 0.55), vLife * vLife);
    float alpha = spark * vLife;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

export interface Meteor {
  // Coloca la cabeza y la estela: la estela va hacia atrás, en sentido
  // contrario al vuelo, y se estrecha hacia la cola.
  setFlight(head: Vector3, direction: Vector3, trailLength: number, camera: Camera): void;
  setVisible(visible: boolean): void;
  // Segundos desde el impacto (negativo: aún no ha caído).
  setDebrisTime(seconds: number): void;
  setPixelRatio(ratio: number): void;
  dispose(): void;
}

export function createMeteor(scene: Scene, impact: Vector3, mobile: boolean): Meteor {
  const additive = { transparent: true, depthWrite: false, blending: AdditiveBlending, premultipliedAlpha: true };

  const headMaterial = new ShaderMaterial({
    vertexShader: headVertex,
    fragmentShader: headFragment,
    uniforms: { uSize: { value: HEAD_SIZE_KM }, uOpacity: { value: 1 } },
    ...additive,
  });
  const head = new Mesh(new PlaneGeometry(1, 1), headMaterial);
  head.frustumCulled = false;
  head.renderOrder = 3;

  // Cinta de 2 × 6 vértices: la anchura y el brillo bajan de la cabeza a la cola.
  const TRAIL_SEGMENTS = 6;
  const trailGeometry = new BufferGeometry();
  const trailPositions = new Float32Array((TRAIL_SEGMENTS + 1) * 2 * 3);
  const along = new Float32Array((TRAIL_SEGMENTS + 1) * 2);
  const across = new Float32Array((TRAIL_SEGMENTS + 1) * 2);
  const trailIndex: number[] = [];
  for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
    along[i * 2] = along[i * 2 + 1] = i / TRAIL_SEGMENTS;
    across[i * 2] = 0;
    across[i * 2 + 1] = 1;
    if (i < TRAIL_SEGMENTS) {
      const a = i * 2;
      trailIndex.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  trailGeometry.setAttribute('position', new BufferAttribute(trailPositions, 3));
  trailGeometry.setAttribute('aAlong', new BufferAttribute(along, 1));
  trailGeometry.setAttribute('aAcross', new BufferAttribute(across, 1));
  trailGeometry.setIndex(trailIndex);
  const trailMaterial = new ShaderMaterial({
    vertexShader: trailVertex,
    fragmentShader: trailFragment,
    uniforms: { uOpacity: { value: 1 } },
    // La cinta gira según el ángulo de vuelo: sin doble cara, a veces la
    // cámara la ve por detrás y desaparece.
    side: DoubleSide,
    ...additive,
  });
  const trail = new Mesh(trailGeometry, trailMaterial);
  trail.frustumCulled = false;
  trail.renderOrder = 2;

  // Escombros: salen del cráter en un cono abierto hacia arriba.
  const count = mobile ? DEBRIS_COUNT_MOBILE : DEBRIS_COUNT;
  const velocities = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spread = Math.pow(Math.random(), 0.6);
    const speed = 2 + Math.random() * 6.5;
    velocities[i * 3] = Math.cos(angle) * spread * speed;
    velocities[i * 3 + 1] = (0.6 + Math.random() * 1.4) * speed * 0.75;
    velocities[i * 3 + 2] = Math.sin(angle) * spread * speed;
    seeds[i] = Math.random();
  }
  const debrisGeometry = new BufferGeometry();
  // La posición real sale del shader; three.js solo necesita saber cuántos hay.
  debrisGeometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3));
  debrisGeometry.setAttribute('aVelocity', new BufferAttribute(velocities, 3));
  debrisGeometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  const debrisMaterial = new ShaderMaterial({
    vertexShader: debrisVertex,
    fragmentShader: debrisFragment,
    uniforms: {
      uOrigin: { value: impact.clone() },
      uTime: { value: -1 },
      uPixelRatio: { value: 1 },
      uGravity: { value: DEBRIS_GRAVITY_KM },
    },
    ...additive,
  });
  const debris = new Points(debrisGeometry, debrisMaterial);
  debris.frustumCulled = false;
  debris.renderOrder = 4;
  debris.visible = false;

  scene.add(trail, head, debris);

  const side = new Vector3();
  const toCamera = new Vector3();
  const point = new Vector3();

  return {
    setFlight(headPosition, direction, trailLength, camera) {
      head.position.copy(headPosition);
      toCamera.subVectors(camera.position, headPosition).normalize();
      side.crossVectors(direction, toCamera).normalize();
      for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
        const t = i / TRAIL_SEGMENTS;
        point.copy(headPosition).addScaledVector(direction, -t * trailLength);
        const halfWidth = TRAIL_WIDTH_KM * (1 - t * 0.85) * 0.5;
        trailPositions.set([point.x - side.x * halfWidth, point.y - side.y * halfWidth, point.z - side.z * halfWidth], i * 6);
        trailPositions.set([point.x + side.x * halfWidth, point.y + side.y * halfWidth, point.z + side.z * halfWidth], i * 6 + 3);
      }
      trailGeometry.attributes.position.needsUpdate = true;
    },
    setVisible(visible) {
      head.visible = visible;
      trail.visible = visible;
    },
    setDebrisTime(seconds) {
      debris.visible = seconds >= 0;
      debrisMaterial.uniforms.uTime.value = seconds;
    },
    setPixelRatio(ratio) {
      debrisMaterial.uniforms.uPixelRatio.value = ratio;
    },
    dispose() {
      scene.remove(trail, head, debris);
      head.geometry.dispose();
      headMaterial.dispose();
      trailGeometry.dispose();
      trailMaterial.dispose();
      debrisGeometry.dispose();
      debrisMaterial.dispose();
    },
  };
}
