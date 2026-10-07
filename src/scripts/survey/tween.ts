// Interpolador mínimo para la home: la escena solo necesita una docena de
// transiciones numéricas, y GSAP añadía 27 KB comprimidos a la página de
// entrada. Mismas curvas que se usaban (power1/2/3).

export type Easing = (t: number) => number;

export const ease = {
  linear: (t: number) => t,
  power1In: (t: number) => t * t,
  power2Out: (t: number) => 1 - (1 - t) ** 3,
  power2InOut: (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2),
  power3Out: (t: number) => 1 - (1 - t) ** 4,
  power3InOut: (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2),
} satisfies Record<string, Easing>;

export interface TweenOptions {
  duration: number;
  delay?: number;
  ease?: Easing;
  onUpdate?: () => void;
  onComplete?: () => void;
}

export interface Tween {
  cancel(): void;
}

export function tween<T extends object>(target: T, to: Partial<Record<keyof T, number>>, options: TweenOptions): Tween {
  const keys = Object.keys(to) as Array<keyof T>;
  const from = keys.map((key) => target[key] as unknown as number);
  const easing = options.ease ?? ease.power2Out;
  const durationMs = options.duration * 1000;
  const start = performance.now() + (options.delay ?? 0) * 1000;
  let frame = 0;
  let cancelled = false;

  const apply = (progress: number) => {
    const eased = easing(progress);
    keys.forEach((key, i) => {
      (target[key] as unknown as number) = from[i] + ((to[key] as number) - from[i]) * eased;
    });
    options.onUpdate?.();
  };

  if (durationMs <= 0 && !options.delay) {
    apply(1);
    options.onComplete?.();
    return { cancel() {} };
  }

  const step = (now: number) => {
    if (cancelled) return;
    if (now < start) {
      frame = requestAnimationFrame(step);
      return;
    }
    const progress = Math.min((now - start) / Math.max(durationMs, 1), 1);
    apply(progress);
    if (progress < 1) frame = requestAnimationFrame(step);
    else options.onComplete?.();
  };
  frame = requestAnimationFrame(step);

  return {
    cancel() {
      cancelled = true;
      cancelAnimationFrame(frame);
    },
  };
}
