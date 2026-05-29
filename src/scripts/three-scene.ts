import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  LineSegments,
  LineBasicMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  Color,
  Raycaster,
} from 'three';

const ACCENT_COLOR = new Color(0xe8c872);
const BASE_COLOR = new Color(0x4a5568);
const SPHERE_RADIUS = 2.8;
const SPHERE_SEGMENTS = 20;
const PARTICLE_SIZE = 0.04;
const PARTICLE_SIZE_MOBILE = 0.05;
const ROTATION_SPEED = 0.001;
const MOUSE_INFLUENCE = 0.3;
const PULSE_INTERVAL = 2000;
const PULSE_DURATION = 1500;
const CONNECTION_DISTANCE = 0.85;

interface Pulse {
  origin: number;
  startTime: number;
  maxRadius: number;
}

export function initHeroScene(canvas: HTMLCanvasElement): void {
  const container = canvas.parentElement!;
  const isMobile = window.innerWidth < 1024;
  // WCAG 2.3.3: con movimiento reducido, la escena se renderiza estática (sin
  // autorotación, pulsos ni deformación), pero permanece visible en su estado
  // de reposo — nunca en negro ni oculta.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.z = 7;

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isMobile,
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Build sphere geometry to extract vertex positions
  const segments = isMobile ? 14 : SPHERE_SEGMENTS;
  const sphereGeo = new SphereGeometry(SPHERE_RADIUS, segments, segments);
  const posArray = sphereGeo.attributes.position.array as Float32Array;
  const vertexCount = posArray.length / 3;

  // Deduplicate vertices (sphere geometry has duplicates at poles/seams)
  const uniquePositions: number[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < vertexCount; i++) {
    const x = posArray[i * 3];
    const y = posArray[i * 3 + 1];
    const z = posArray[i * 3 + 2];
    const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePositions.push(x, y, z);
    }
  }
  sphereGeo.dispose();

  const numParticles = uniquePositions.length / 3;
  const originalPositions = new Float32Array(uniquePositions);
  const currentPositions = new Float32Array(uniquePositions);

  // Particles
  const particleGeo = new BufferGeometry();
  particleGeo.setAttribute('position', new Float32BufferAttribute(currentPositions, 3));

  const particleColors = new Float32Array(numParticles * 3);
  for (let i = 0; i < numParticles; i++) {
    particleColors[i * 3] = BASE_COLOR.r;
    particleColors[i * 3 + 1] = BASE_COLOR.g;
    particleColors[i * 3 + 2] = BASE_COLOR.b;
  }
  particleGeo.setAttribute('color', new Float32BufferAttribute(particleColors, 3));

  const particleSizes = new Float32Array(numParticles).fill(isMobile ? PARTICLE_SIZE_MOBILE : PARTICLE_SIZE);
  particleGeo.setAttribute('size', new Float32BufferAttribute(particleSizes, 1));

  const particleMat = new PointsMaterial({
    size: isMobile ? PARTICLE_SIZE_MOBILE : PARTICLE_SIZE,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  const particles = new Points(particleGeo, particleMat);
  scene.add(particles);

  // Lines (connections between nearby particles)
  const lineIndices: number[] = [];
  const linePositions: number[] = [];
  const tempVec = new Vector3();
  const tempVec2 = new Vector3();

  for (let i = 0; i < numParticles; i++) {
    tempVec.set(originalPositions[i * 3], originalPositions[i * 3 + 1], originalPositions[i * 3 + 2]);
    for (let j = i + 1; j < numParticles; j++) {
      tempVec2.set(originalPositions[j * 3], originalPositions[j * 3 + 1], originalPositions[j * 3 + 2]);
      if (tempVec.distanceTo(tempVec2) < CONNECTION_DISTANCE) {
        lineIndices.push(i, j);
        linePositions.push(
          tempVec.x, tempVec.y, tempVec.z,
          tempVec2.x, tempVec2.y, tempVec2.z
        );
      }
    }
  }

  const lineGeo = new BufferGeometry();
  const linePositionArray = new Float32Array(linePositions);
  lineGeo.setAttribute('position', new Float32BufferAttribute(linePositionArray, 3));

  const lineColors = new Float32Array(linePositionArray.length);
  const lineBaseColor = new Color(0x2a3040);
  for (let i = 0; i < lineColors.length / 3; i++) {
    lineColors[i * 3] = lineBaseColor.r;
    lineColors[i * 3 + 1] = lineBaseColor.g;
    lineColors[i * 3 + 2] = lineBaseColor.b;
  }
  lineGeo.setAttribute('color', new Float32BufferAttribute(lineColors, 3));

  const lineMat = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
  });

  const lines = new LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // Mouse interaction
  const mouse = new Vector2(9999, 9999);
  const mouseWorld = new Vector3();

  if (!isMobile && !prefersReducedMotion) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });
    canvas.addEventListener('mouseleave', () => {
      mouse.set(9999, 9999);
    });
  }

  // Pulse system
  const activePulses: Pulse[] = [];
  let lastPulseTime = 0;

  function triggerPulse(time: number) {
    const origin = Math.floor(Math.random() * numParticles);
    activePulses.push({
      origin,
      startTime: time,
      maxRadius: 2.5,
    });
  }

  // Animation
  let animationId: number;
  const rotationAxis = new Vector3(0.3, 1, 0.1).normalize();

  function animate(time: number) {
    animationId = requestAnimationFrame(animate);

    // Auto-rotation
    particles.rotateOnAxis(rotationAxis, ROTATION_SPEED);
    lines.rotation.copy(particles.rotation);

    // Pulse triggering
    if (time - lastPulseTime > PULSE_INTERVAL) {
      triggerPulse(time);
      lastPulseTime = time;
    }

    // Remove expired pulses
    for (let i = activePulses.length - 1; i >= 0; i--) {
      if (time - activePulses[i].startTime > PULSE_DURATION) {
        activePulses.splice(i, 1);
      }
    }

    // Update particle colors based on pulses
    const colors = particleGeo.attributes.color.array as Float32Array;
    for (let i = 0; i < numParticles; i++) {
      let r = BASE_COLOR.r, g = BASE_COLOR.g, b = BASE_COLOR.b;

      for (const pulse of activePulses) {
        const elapsed = time - pulse.startTime;
        const progress = elapsed / PULSE_DURATION;
        const pulseRadius = progress * pulse.maxRadius;
        const ox = originalPositions[pulse.origin * 3];
        const oy = originalPositions[pulse.origin * 3 + 1];
        const oz = originalPositions[pulse.origin * 3 + 2];
        const px = originalPositions[i * 3];
        const py = originalPositions[i * 3 + 1];
        const pz = originalPositions[i * 3 + 2];
        const dist = Math.sqrt((px - ox) ** 2 + (py - oy) ** 2 + (pz - oz) ** 2);

        const distFromWave = Math.abs(dist - pulseRadius);
        if (distFromWave < 0.5) {
          const intensity = (1 - distFromWave / 0.5) * (1 - progress);
          r = r + (ACCENT_COLOR.r - r) * intensity;
          g = g + (ACCENT_COLOR.g - g) * intensity;
          b = b + (ACCENT_COLOR.b - b) * intensity;
        }
      }

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }
    particleGeo.attributes.color.needsUpdate = true;

    // Mouse deformation (desktop only)
    if (!isMobile && mouse.x !== 9999) {
      const raycaster = new Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const dir = raycaster.ray.direction.clone().multiplyScalar(7);
      mouseWorld.copy(camera.position).add(dir);

      // Apply to world-space positions
      const worldPos = new Vector3();
      for (let i = 0; i < numParticles; i++) {
        worldPos.set(
          currentPositions[i * 3],
          currentPositions[i * 3 + 1],
          currentPositions[i * 3 + 2]
        );
        particles.localToWorld(worldPos);

        const dist = worldPos.distanceTo(mouseWorld);
        if (dist < 2) {
          const factor = (1 - dist / 2) * MOUSE_INFLUENCE;
          const pushDir = worldPos.clone().sub(mouseWorld).normalize().multiplyScalar(factor);
          worldPos.add(pushDir);
          particles.worldToLocal(worldPos);
          currentPositions[i * 3] = worldPos.x;
          currentPositions[i * 3 + 1] = worldPos.y;
          currentPositions[i * 3 + 2] = worldPos.z;

          // Highlight nearby particles
          const intensity = 1 - dist / 2;
          colors[i * 3] = colors[i * 3] + (ACCENT_COLOR.r - colors[i * 3]) * intensity * 0.5;
          colors[i * 3 + 1] = colors[i * 3 + 1] + (ACCENT_COLOR.g - colors[i * 3 + 1]) * intensity * 0.5;
          colors[i * 3 + 2] = colors[i * 3 + 2] + (ACCENT_COLOR.b - colors[i * 3 + 2]) * intensity * 0.5;
        } else {
          // Lerp back to original
          currentPositions[i * 3] += (originalPositions[i * 3] - currentPositions[i * 3]) * 0.05;
          currentPositions[i * 3 + 1] += (originalPositions[i * 3 + 1] - currentPositions[i * 3 + 1]) * 0.05;
          currentPositions[i * 3 + 2] += (originalPositions[i * 3 + 2] - currentPositions[i * 3 + 2]) * 0.05;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleGeo.attributes.color.needsUpdate = true;
    }

    // Update line positions to match particles
    const linePos = lineGeo.attributes.position.array as Float32Array;
    const lColors = lineGeo.attributes.color.array as Float32Array;
    for (let l = 0; l < lineIndices.length; l += 2) {
      const i = lineIndices[l];
      const j = lineIndices[l + 1];
      const idx = l * 3;
      linePos[idx] = currentPositions[i * 3];
      linePos[idx + 1] = currentPositions[i * 3 + 1];
      linePos[idx + 2] = currentPositions[i * 3 + 2];
      linePos[idx + 3] = currentPositions[j * 3];
      linePos[idx + 4] = currentPositions[j * 3 + 1];
      linePos[idx + 5] = currentPositions[j * 3 + 2];

      // Color lines based on particle colors
      const ci = colors[i * 3], cig = colors[i * 3 + 1], cib = colors[i * 3 + 2];
      const cj = colors[j * 3], cjg = colors[j * 3 + 1], cjb = colors[j * 3 + 2];
      lColors[idx] = ci; lColors[idx + 1] = cig; lColors[idx + 2] = cib;
      lColors[idx + 3] = cj; lColors[idx + 4] = cjg; lColors[idx + 5] = cjb;
    }
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  }

  if (prefersReducedMotion) {
    // Render único del estado de reposo: la red queda visible pero inmóvil.
    renderer.render(scene, camera);
  } else {
    animate(0);
  }

  // Resize handler
  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    // Sin loop de animación, el resize debe re-renderizar para no quedar en negro.
    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    }
  });
  resizeObserver.observe(container);

  // Cleanup on page navigation
  document.addEventListener('astro:before-swap', () => {
    cancelAnimationFrame(animationId);
    resizeObserver.disconnect();
    renderer.dispose();
    particleGeo.dispose();
    particleMat.dispose();
    lineGeo.dispose();
    lineMat.dispose();
  }, { once: true });
}
