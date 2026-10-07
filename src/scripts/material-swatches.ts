// Muestrario del hero de /experiencias-3d: la misma piedra con tres acabados
// (pulido, mate y estructurado) bajo una luz que mueve la persona. Es lo que
// una foto no puede enseñar: cómo responde cada acabado a la luz.
//
// Un solo shader de WebGL 2 sobre un rectángulo que ocupa el lienzo; la piedra
// es procedural (ruido), así que no se descarga ninguna textura. Solo se dibuja
// cuando la luz cambia: quieto, no gasta nada.

const MAX_PIXEL_RATIO = 2;
const MAX_PIXEL_RATIO_COARSE = 1.5;
// La luz se queda a esta altura sobre la piedra, en fracciones del alto.
const LIGHT_HEIGHT = 0.42;
// Fracción del camino que recorre la luz en cada fotograma a 60 fps.
const SMOOTHING = 0.14;
const SETTLE_PX = 0.4;
// Barrido de presentación al entrar en pantalla (menos de 5 s: WCAG 2.2.2).
const INTRO_SECONDS = 2.6;
const REST_POSITION = { x: 0.3, y: 0.28 };

const VERTEX_SHADER = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec2 uResolution;
uniform vec4 uSlabs[3];
uniform vec3 uLight;
uniform float uRadius;
uniform float uScale;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + 17.1;
    amplitude *= 0.5;
  }
  return value;
}

// Vetas de mármol: senos deformados por ruido, una familia principal y otra
// más fina. Devuelve 1 en el centro de la veta y 0 lejos de ella.
float veins(vec2 p) {
  vec2 warp = vec2(fbm(p * 0.7), fbm(p * 0.7 + 5.2));
  float t = p.x * 0.45 + p.y * 0.35 + 2.2 * fbm(p * 0.8 + 1.6 * warp);
  float ridge = 1.0 - abs(sin(t * 3.14159));
  // Núcleo fino con un halo difuso, como una veta real que tiñe la piedra.
  float main = pow(ridge, 22.0) + pow(ridge, 5.0) * 0.22;
  float fine = pow(1.0 - abs(sin(t * 7.3 + warp.x * 4.0)), 40.0) * 0.4;
  return clamp(main + fine, 0.0, 1.0);
}

// Relieve de cada acabado (0 pulido, 1 mate, 2 estructurado): el mate tiene
// un grano casi imperceptible; el estructurado, el picado de una piedra
// abujardada sobre una ondulación suave.
float surfaceHeight(vec2 p, int finish) {
  if (finish == 0) return 0.0;
  if (finish == 1) return noise(p * 18.0) * 0.03;
  return noise(p * 16.0) * 0.32 + noise(p * 31.0) * 0.12 + fbm(p * 2.2) * 0.3;
}

float roundedBox(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  int finish = -1;
  vec4 slab = vec4(0.0);
  for (int i = 0; i < 3; i++) {
    vec4 s = uSlabs[i];
    if (frag.x >= s.x - 1.0 && frag.x <= s.z + 1.0 && frag.y >= s.y - 1.0 && frag.y <= s.w + 1.0) {
      finish = i;
      slab = s;
    }
  }
  if (finish < 0) {
    outColor = vec4(0.0);
    return;
  }

  vec2 center = (slab.xy + slab.zw) * 0.5;
  float edge = roundedBox(frag - center, (slab.zw - slab.xy) * 0.5, uRadius);
  float coverage = clamp(0.5 - edge, 0.0, 1.0);
  if (coverage <= 0.0) {
    outColor = vec4(0.0);
    return;
  }

  // Las tres piezas comparten la misma piedra: se cortan del mismo bloque.
  vec2 p = (frag - vec2(0.0, slab.y)) / uScale + vec2(1.7, 0.4);

  float cloud = fbm(p * 0.7);
  float vein = veins(p);
  vec3 cream = vec3(0.88, 0.85, 0.79);
  vec3 shade = vec3(0.77, 0.72, 0.64);
  vec3 veinColor = vec3(0.55, 0.48, 0.39);
  vec3 base = mix(cream, shade, smoothstep(0.3, 0.8, cloud) * 0.7);
  base = mix(base, veinColor, vein * 0.7);

  float eps = 0.012;
  float h = surfaceHeight(p, finish);
  float hx = surfaceHeight(p + vec2(eps, 0.0), finish);
  float hy = surfaceHeight(p + vec2(0.0, eps), finish);
  vec3 normal = normalize(vec3(-(hx - h) / eps * 0.09, -(hy - h) / eps * 0.09, 1.0));

  vec3 position = vec3(frag, 0.0);
  vec3 toLight = uLight - position;
  float distance = length(toLight);
  vec3 lightDir = toLight / distance;
  vec3 halfway = normalize(lightDir + vec3(0.0, 0.0, 1.0));
  float falloff = 1.0 / (1.0 + pow(distance / (uResolution.y * 0.85), 2.0));

  float diffuse = max(dot(normal, lightDir), 0.0);
  float facing = max(dot(normal, halfway), 0.0);
  vec3 lightColor = vec3(1.0, 0.95, 0.86);
  vec3 color;

  if (finish == 0) {
    // Pulido: la piedra se ve más profunda y el brillo es un punto nítido.
    vec3 deep = base * vec3(0.9, 0.88, 0.86);
    float spec = pow(facing, 320.0) * 1.8 + pow(facing, 50.0) * 0.16;
    // Reflejo tenue de una ventana del estudio: el pulido brilla aunque la
    // luz no le dé de lleno.
    vec2 uv = (frag - slab.xy) / (slab.zw - slab.xy);
    float sheen = smoothstep(0.16, 0.0, abs(uv.x * 0.7 - uv.y * 0.55 + 0.05)) * 0.07;
    color = deep * (0.26 + diffuse * falloff * 0.8) + lightColor * (spec * falloff + sheen);
  } else if (finish == 1) {
    // Mate: luz envolvente y casi sin brillo.
    float wrap = (dot(normal, lightDir) + 0.4) / 1.4;
    color = base * (0.3 + max(wrap, 0.0) * falloff * 0.8) + lightColor * pow(facing, 6.0) * 0.04 * falloff;
  } else {
    // Estructurado: cada relieve hace su sombra; los huecos se oscurecen.
    float cavity = smoothstep(0.1, 0.6, h);
    float spec = pow(facing, 18.0) * 0.12;
    color = base * (0.2 + diffuse * falloff * 1.25) * mix(0.72, 1.0, cavity) + lightColor * spec * falloff;
  }

  // Bisel: una línea de luz en el canto superior de cada pieza.
  float bevel = smoothstep(-3.0, 0.0, edge) * (1.0 - smoothstep(0.0, 1.0, edge));
  color += bevel * 0.12 * falloff;

  // Las luces altas se comprimen en vez de quemarse en blanco.
  color = vec3(1.0) - exp(-color * 1.7);
  outColor = vec4(color * coverage, coverage);
}`;

interface SwatchesOptions {
  stage: HTMLElement;
  canvas: HTMLCanvasElement;
  slots: HTMLElement[];
  slider: HTMLInputElement;
  // Zona donde el cursor mueve la luz (el hero entero).
  area: HTMLElement;
  // Resplandor de la luz sobre la página, opcional.
  glow?: HTMLElement;
}

// Se compila sin preguntar el resultado: consultar el estado obliga al hilo
// principal a esperar a que termine la compilación (cientos de milisegundos
// con este shader). Con KHR_parallel_shader_compile se pregunta fotograma a
// fotograma si ya está y la página sigue respondiendo mientras tanto.
function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const whenIdle = (callback: () => void) => {
  if ('requestIdleCallback' in window) window.requestIdleCallback(callback, { timeout: 700 });
  else window.setTimeout(callback, 200);
};

export function initMaterialSwatches(options: SwatchesOptions): () => void {
  let destroyed = false;
  let teardown = () => {};
  // Primero se pinta el titular; el muestrario arranca cuando el navegador
  // tiene un hueco (mientras, se ven las piezas con su degradado fijo).
  whenIdle(() => {
    if (!destroyed) teardown = startSwatches(options);
  });
  return () => {
    destroyed = true;
    teardown();
  };
}

function startSwatches(options: SwatchesOptions): () => void {
  const { stage, canvas } = options;
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false });
  if (!gl) {
    stage.classList.add('is-fallback');
    return () => {};
  }

  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);

  let stopped = false;
  let teardown = () => {};
  let pollFrame = 0;
  const poll = () => {
    pollFrame = 0;
    if (stopped) return;
    if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
      pollFrame = requestAnimationFrame(poll);
      return;
    }
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      stage.classList.add('is-fallback');
      return;
    }
    teardown = runSwatches(gl, program, options);
  };
  poll();

  return () => {
    stopped = true;
    cancelAnimationFrame(pollFrame);
    teardown();
  };
}

function runSwatches(gl: WebGL2RenderingContext, program: WebGLProgram, options: SwatchesOptions): () => void {
  const { stage, canvas, slots, slider, area, glow } = options;
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    resolution: gl.getUniformLocation(program, 'uResolution'),
    slabs: gl.getUniformLocation(program, 'uSlabs'),
    light: gl.getUniformLocation(program, 'uLight'),
    radius: gl.getUniformLocation(program, 'uRadius'),
    scale: gl.getUniformLocation(program, 'uScale'),
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');

  // Posición de la luz en fracciones del escenario (0–1, y hacia abajo).
  const current = { ...REST_POSITION };
  const target = { ...REST_POSITION };
  let pixelRatio = 1;
  let frame = 0;
  let lastTime = 0;
  let introStart = 0;
  let introPlayed = false;
  let visible = false;

  const resize = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, coarse.matches ? MAX_PIXEL_RATIO_COARSE : MAX_PIXEL_RATIO);
    const bounds = stage.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Las piezas las coloca el CSS; el shader recibe sus rectángulos.
    const rects = new Float32Array(12);
    slots.forEach((slot, index) => {
      const rect = slot.getBoundingClientRect();
      const left = (rect.left - bounds.left) * pixelRatio;
      const right = (rect.right - bounds.left) * pixelRatio;
      const top = canvas.height - (rect.top - bounds.top) * pixelRatio;
      const bottom = canvas.height - (rect.bottom - bounds.top) * pixelRatio;
      rects.set([left, bottom, right, top], index * 4);
    });
    gl.uniform4fv(uniforms.slabs, rects);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.radius, 10 * pixelRatio);
    // La veta mantiene su tamaño aparente en cualquier pantalla.
    gl.uniform1f(uniforms.scale, canvas.height / 3.2);
    draw();
  };

  const draw = () => {
    gl.uniform3f(
      uniforms.light,
      current.x * canvas.width,
      (1 - current.y) * canvas.height,
      LIGHT_HEIGHT * canvas.height,
    );
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (glow) {
      glow.style.transform = `translate3d(${(current.x * 100).toFixed(2)}%, ${(current.y * 100).toFixed(2)}%, 0)`;
    }
  };

  const step = (time: number) => {
    frame = 0;
    const elapsed = lastTime ? Math.min(time - lastTime, 100) : 16.7;
    lastTime = time;

    if (introStart) {
      // Presentación: la luz cruza las tres piezas y vuelve al reposo.
      const progress = Math.min(Math.max((time - introStart) / (INTRO_SECONDS * 1000), 0), 1);
      const eased = 0.5 - Math.cos(progress * Math.PI) * 0.5;
      target.x = 0.05 + eased * 0.9;
      target.y = REST_POSITION.y + Math.sin(progress * Math.PI) * 0.12;
      if (progress >= 1) {
        introStart = 0;
        target.x = REST_POSITION.x;
        target.y = REST_POSITION.y;
      }
      slider.value = String(Math.round(target.x * 100));
    }

    const amount = reducedMotion.matches ? 1 : 1 - Math.pow(1 - SMOOTHING, elapsed / 16.7);
    current.x += (target.x - current.x) * amount;
    current.y += (target.y - current.y) * amount;
    const settled =
      !introStart &&
      Math.abs(target.x - current.x) * canvas.width < SETTLE_PX &&
      Math.abs(target.y - current.y) * canvas.height < SETTLE_PX;
    if (settled) {
      current.x = target.x;
      current.y = target.y;
    }
    draw();
    if (!settled) schedule();
    else lastTime = 0;
  };

  function schedule() {
    if (!frame && visible) frame = requestAnimationFrame(step);
  }

  const moveLightTo = (clientX: number, clientY: number) => {
    const bounds = stage.getBoundingClientRect();
    target.x = Math.min(Math.max((clientX - bounds.left) / bounds.width, -0.2), 1.2);
    target.y = Math.min(Math.max((clientY - bounds.top) / bounds.height, -0.3), 1.1);
    slider.value = String(Math.round(Math.min(Math.max(target.x, 0), 1) * 100));
    introStart = 0;
    schedule();
  };

  const onPointerMove = (event: PointerEvent) => {
    // Con el dedo, la luz solo se mueve arrastrando sobre las piezas: así
    // tocar el texto o hacer scroll no la desplaza.
    if (event.pointerType === 'touch' && !stage.contains(event.target as Node)) return;
    moveLightTo(event.clientX, event.clientY);
  };

  const onSlider = () => {
    target.x = Number(slider.value) / 100;
    target.y = REST_POSITION.y;
    introStart = 0;
    schedule();
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (!visible) return;
    if (!introPlayed && !reducedMotion.matches) {
      introPlayed = true;
      introStart = performance.now();
    }
    schedule();
  });

  const resizeObserver = new ResizeObserver(resize);
  const onContextLost = (event: Event) => {
    event.preventDefault();
    stage.classList.add('is-fallback');
  };

  resize();
  resizeObserver.observe(stage);
  observer.observe(stage);
  area.addEventListener('pointermove', onPointerMove);
  slider.addEventListener('input', onSlider);
  canvas.addEventListener('webglcontextlost', onContextLost);
  stage.classList.add('is-live');

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    area.removeEventListener('pointermove', onPointerMove);
    slider.removeEventListener('input', onSlider);
    canvas.removeEventListener('webglcontextlost', onContextLost);
  };
}
