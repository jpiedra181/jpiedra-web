import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Único contexto matchMedia para toda la web: las animaciones solo se registran
// cuando el usuario NO ha pedido movimiento reducido (WCAG 2.3.3). Bajo
// `prefers-reduced-motion: reduce` no se ejecuta ningún tween, así que el
// contenido queda en su estado natural del DOM (visible, sin desplazamiento).
const mm = gsap.matchMedia();
const NO_REDUCED_MOTION = '(prefers-reduced-motion: no-preference)';

const SCROLL_TRIGGER_START = 'top 85%';
const STAGGER_FAST = 0.05;
const STAGGER_MEDIUM = 0.12;
const EASE_OUT = 'power3.out';
const EASE_IN_OUT = 'power2.inOut';
const EASE_REVEAL = 'power4.out';
const CONTOUR_DRAW_START = 'top 80%';
// Perfil de "Sobre mí": se dibuja mientras su gráfica cruza la pantalla.
const PROFILE_SCROLL_START = 'top 75%';
const PROFILE_SCROLL_END = 'bottom 40%';
const PROFILE_SCRUB = 0.6;
// Cumbre del contacto: inclinación final de la maqueta al llegar.
const SUMMIT_TILT_DEG = 38;
const ALTIMETER_MEDIA = '(prefers-reduced-motion: no-preference) and (min-width: 95rem)';

function scrollReveal(
  targets: gsap.TweenTarget,
  trigger: string,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
) {
  // Cada página monta solo algunas secciones (y algunos elementos están
  // comentados): sin ellos no hay nada que animar, y GSAP llenaría la consola
  // de avisos de "target not found".
  if (!document.querySelector(trigger)) return;
  if (typeof targets === 'string' && !document.querySelector(targets)) return;

  return gsap.fromTo(targets, fromVars, {
    ...toVars,
    scrollTrigger: {
      trigger,
      start: SCROLL_TRIGGER_START,
      toggleActions: 'play none none none',
    },
  });
}

export function initScrollAnimations(): void {
  mm.add(NO_REDUCED_MOTION, () => {
    // Proyectos: cada uno es una hoja de plano que se descubre de abajo
    // arriba, con sus marcas de corte y el número de hoja.
    document.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
      const timeline = gsap.timeline({
        scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none none' },
      });

      const image = card.querySelector('.project-image');
      if (image) {
        timeline.fromTo(image,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power3.inOut' },
          0,
        );
        const picture = image.querySelector('img');
        if (picture) timeline.fromTo(picture, { scale: 1.2 }, { scale: 1, duration: 1.6, ease: EASE_OUT }, 0);
      }

      const corners = card.querySelectorAll('.project-corner');
      if (corners.length) {
        timeline.fromTo(corners,
          { opacity: 0, scale: 0.3 },
          { opacity: 0.7, scale: 1, duration: 0.6, stagger: 0.06, ease: EASE_OUT },
          0.55,
        );
      }

      const sheetMeta = card.querySelector('.project-sheet-meta');
      if (sheetMeta) {
        timeline.fromTo(sheetMeta,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: EASE_IN_OUT },
          0.15,
        );
      }

      const number = card.querySelector('.project-number');
      if (number) timeline.fromTo(number, { yPercent: 35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: EASE_OUT }, 0.2);

      const copy = card.querySelectorAll('.project-category, .project-title, .project-description, .project-link');
      timeline.fromTo(copy, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: EASE_OUT }, 0.25);

      const tags = card.querySelectorAll('.project-tag');
      if (tags.length) {
        timeline.fromTo(tags, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: STAGGER_FAST, ease: EASE_OUT }, 0.6);
      }

      const waypoint = card.querySelector('.project-waypoint');
      if (waypoint) timeline.fromTo(waypoint, { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' }, 0.5);

      // Parallax solo en capturas a sangre: una imagen "contain" se movería
      // dentro de su marco y dejaría a la vista el fondo.
      const img = card.querySelector('.project-parallax');
      if (img) {
        gsap.to(img, {
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          y: -30,
          ease: 'none',
        });
      }
    });

    // La ruta que une los proyectos se descubre al ritmo del scroll.
    document.querySelectorAll<HTMLElement>('.project-list').forEach((list) => {
      const trail = list.querySelector('.project-trail');
      if (!trail) return;
      gsap.fromTo(trail, { clipPath: 'inset(0% 0% 100% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: { trigger: list, start: 'top 60%', end: 'bottom 60%', scrub: 0.5 },
      });
    });

    // Contact section
    scrollReveal('#contact .contact-eyebrow', '#contact',
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: EASE_IN_OUT },
    );

    scrollReveal('.contact-title', '#contact',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: EASE_OUT },
    );

    scrollReveal('.contact-subtitle', '#contact',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.25, ease: EASE_OUT },
    );

    scrollReveal('.contact-form', '#contact',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.35, ease: EASE_OUT },
    );
  });
}

// Los planos de curvas (ContourMap con reveal="scroll") entran tumbados y se
// incorporan, como una maqueta que se levanta de la mesa. Se anima el SVG
// entero: mover sus cotas por separado obliga a repintarlo en cada fotograma.
function revealContourMap(map: SVGSVGElement): void {
  gsap.fromTo(map,
    { opacity: 0, rotateX: 55, y: 40, transformPerspective: 900, transformOrigin: '50% 100%' },
    {
      opacity: 1, rotateX: 0, y: 0, duration: 1.6, ease: EASE_OUT,
      // Se quitan los estilos al acabar para que el hover de la tarjeta (CSS)
      // pueda inclinar el plano.
      clearProps: 'opacity,transform,transformOrigin',
      scrollTrigger: { trigger: map, start: CONTOUR_DRAW_START, toggleActions: 'play none none none' },
    },
  );
}

// Animación genérica para secciones nuevas, sin selectores por sección:
// `data-reveal` sube y aparece al entrar en pantalla; `data-reveal-stagger`
// hace lo mismo con sus hijos directos, uno detrás de otro; `data-wipe` se
// descubre de izquierda a derecha; `data-split` sube línea a línea desde una
// máscara, y los planos con reveal="scroll" se incorporan como una maqueta.
export function initRevealAnimations(): void {
  mm.add(NO_REDUCED_MOTION, () => {
    gsap.utils.toArray<HTMLElement>('[data-wipe]').forEach((element) => {
      gsap.fromTo(element, { clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', duration: 0.8, ease: EASE_IN_OUT,
        scrollTrigger: { trigger: element, start: SCROLL_TRIGGER_START, toggleActions: 'play none none none' },
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-split]').forEach((heading) => {
      // autoSplit vuelve a partir las líneas si cambian el ancho o las
      // fuentes; la animación devuelta en onSplit se sincroniza sola.
      SplitText.create(heading, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit: (split) => gsap.from(split.lines, {
          yPercent: 110,
          duration: 1.1,
          stagger: 0.1,
          ease: EASE_REVEAL,
          scrollTrigger: { trigger: heading, start: SCROLL_TRIGGER_START, toggleActions: 'play none none none' },
        }),
      });
    });

    gsap.utils.toArray<SVGSVGElement>('[data-contour-map="scroll"]').forEach(revealContourMap);

    // La cumbre del contacto se inclina al ritmo del scroll: al llegar arriba
    // del todo se ve como una maqueta.
    gsap.utils.toArray<HTMLElement>('[data-summit-rise]').forEach((wrapper) => {
      gsap.fromTo(wrapper, { rotateX: 0, transformPerspective: 1000, transformOrigin: '50% 70%' }, {
        rotateX: SUMMIT_TILT_DEG,
        ease: 'none',
        scrollTrigger: { trigger: wrapper, start: 'top 85%', end: 'bottom 50%', scrub: 0.8 },
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
      gsap.fromTo(element, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, ease: EASE_OUT,
        scrollTrigger: { trigger: element, start: SCROLL_TRIGGER_START, toggleActions: 'play none none none' },
      });
    });

    gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((group) => {
      gsap.fromTo(group.children, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, stagger: STAGGER_MEDIUM, ease: EASE_OUT,
        scrollTrigger: { trigger: group, start: SCROLL_TRIGGER_START, toggleActions: 'play none none none' },
      });
    });
  });
}

// Perfil de "Sobre mí": la línea avanza con el scroll, un punto marca por
// dónde va la subida con su cota y los hitos aparecen al alcanzarlos.
export function initElevationProfile(): void {
  mm.add(NO_REDUCED_MOTION, () => {
    const cleanups: (() => void)[] = [];

    document.querySelectorAll<HTMLElement>('[data-profile]').forEach((figure) => {
      const canvas = figure.querySelector<HTMLElement>('.profile-canvas');
      const terrain = figure.querySelector<SVGSVGElement>('.profile-terrain');
      const walker = figure.querySelector<HTMLElement>('.profile-walker');
      const readout = figure.querySelector<HTMLElement>('.profile-walker-readout');
      if (!canvas || !terrain || !walker || !readout) return;

      const heights = (figure.dataset.heights ?? '').split(' ').map(Number);
      const [axisLow, axisHigh, plotTop, plotBottom] = (figure.dataset.axis ?? '').split(' ').map(Number);
      const milestones = figure.querySelectorAll<HTMLElement>('[data-at]');
      const walkerStyle = walker.getAttribute('style');
      const readoutText = readout.textContent;
      const state = { progress: 0 };

      const render = () => {
        const progress = state.progress;
        const metres = heights[Math.round(progress * (heights.length - 1))];
        const y = plotTop + (1 - (metres - axisLow) / (axisHigh - axisLow)) * (plotBottom - plotTop);
        terrain.style.clipPath = `inset(0 ${((1 - progress) * 100).toFixed(2)}% 0 0)`;
        walker.style.setProperty('--x', progress.toFixed(4));
        walker.style.setProperty('--y', y.toFixed(4));
        readout.textContent = `${formatCount(Math.round(metres), 0)} m`;
        milestones.forEach((milestone) => {
          milestone.classList.toggle('is-pending', progress + 0.005 < Number(milestone.dataset.at));
        });
      };

      render();
      gsap.to(state, {
        progress: 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: { trigger: canvas, start: PROFILE_SCROLL_START, end: PROFILE_SCROLL_END, scrub: PROFILE_SCRUB },
      });

      cleanups.push(() => {
        terrain.style.clipPath = '';
        if (walkerStyle !== null) walker.setAttribute('style', walkerStyle);
        readout.textContent = readoutText;
        milestones.forEach((milestone) => milestone.classList.remove('is-pending'));
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  });
}

// Rutas de pasos (RouteSteps.astro): el perfil se dibuja con el scroll y cada
// hito se enciende al alcanzarlo.
export function initRouteSteps(): void {
  mm.add(NO_REDUCED_MOTION, () => {
    const cleanups: (() => void)[] = [];

    document.querySelectorAll<HTMLElement>('[data-route]').forEach((route) => {
      const canvas = route.querySelector<HTMLElement>('.route-canvas');
      const terrain = route.querySelector<SVGSVGElement>('.route-terrain');
      if (!canvas || !terrain) return;
      const waypoints = route.querySelectorAll<HTMLElement>('[data-at]');
      const state = { progress: 0 };

      const render = () => {
        terrain.style.clipPath = `inset(0 ${((1 - state.progress) * 100).toFixed(2)}% 0 0)`;
        waypoints.forEach((waypoint) => {
          waypoint.classList.toggle('is-pending', state.progress + 0.02 < Number(waypoint.dataset.at));
        });
      };

      render();
      gsap.to(state, {
        progress: 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: { trigger: canvas, start: 'top 80%', end: 'top 25%', scrub: PROFILE_SCRUB },
      });

      cleanups.push(() => {
        terrain.style.clipPath = '';
        waypoints.forEach((waypoint) => waypoint.classList.remove('is-pending'));
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  });
}

// Visualizaciones de datos de las landings: cifras que cuentan, la rejilla de
// personas que se van en silencio, barras, el dial del autoevaluador y el
// marcador del caso de estudio. En el HTML está siempre el estado final: sin
// JavaScript o con movimiento reducido se ve tal cual.
const COUNT_DURATION = 1.6;
const DATA_VISUAL_START = 'top 80%';

const pageLocale = () => (document.documentElement.lang === 'en' ? 'en-GB' : 'es-ES');

const formatCount = (value: number, decimals: number, locale = pageLocale()) =>
  value.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function initDataVisuals(): void {
  mm.add(NO_REDUCED_MOTION, () => {
    const cleanups: (() => void)[] = [];
    const once = (trigger: Element) => ({ trigger, start: DATA_VISUAL_START, toggleActions: 'play none none none' });

    gsap.utils.toArray<HTMLElement>('[data-count]').forEach((element) => {
      const to = Number(element.dataset.count);
      const decimals = Number(element.dataset.countDecimals ?? 0);
      const suffix = element.dataset.countSuffix ?? '';
      const original = element.textContent;
      const state = { value: 0 };
      const render = () => {
        element.textContent = `${formatCount(state.value, decimals, element.dataset.countLocale)}${suffix}`;
      };
      render();
      gsap.to(state, { value: to, duration: COUNT_DURATION, ease: 'power2.out', onUpdate: render, scrollTrigger: once(element) });
      cleanups.push(() => {
        element.textContent = original;
      });
    });

    // De 100 personas que encuentran una barrera, 92 se van sin decir nada.
    gsap.utils.toArray<HTMLElement>('[data-people]').forEach((grid) => {
      const silent = grid.querySelectorAll('.stat-person:not(.is-teller)');
      const tellers = grid.querySelectorAll('.stat-person.is-teller');
      gsap.set(grid.children, { opacity: 0.8 });
      gsap.set(tellers, { backgroundColor: '#E2E4E7', boxShadow: '0 0 0 rgba(232, 200, 114, 0)' });
      gsap.timeline({ scrollTrigger: once(grid), delay: 0.3 })
        .to(silent, { opacity: 0.14, duration: 0.5, ease: 'power1.out', stagger: { each: 0.014, from: 'random' } })
        .to(tellers, {
          backgroundColor: '#E8C872',
          boxShadow: '0 0 10px rgba(232, 200, 114, 0.6)',
          duration: 0.5,
          stagger: 0.06,
        }, '-=0.3');
    });

    gsap.utils.toArray<HTMLElement>('[data-bar] > span').forEach((fill) => {
      gsap.from(fill, { scaleX: 0, duration: 1.4, ease: EASE_OUT, scrollTrigger: once(fill) });
    });

    gsap.utils.toArray<HTMLElement>('[data-dial]').forEach((dial) => {
      gsap.timeline({ scrollTrigger: once(dial) })
        .from(dial.querySelectorAll('.dial-segment'), { opacity: 0.1, duration: 0.45, stagger: 0.16, ease: 'power1.out' })
        .from(dial.querySelector('.dial-center'), { opacity: 0, scale: 0.85, duration: 0.8, ease: EASE_OUT }, 0.2);
    });

    gsap.utils.toArray<HTMLElement>('[data-scores]').forEach((scores) => {
      const ring = scores.querySelector<SVGCircleElement>('[data-ring]');
      const marks = scores.querySelector('[data-marks]');
      const timeline = gsap.timeline({ scrollTrigger: once(scores) });
      if (ring) {
        const length = parseFloat(ring.style.getPropertyValue('--ring')) || 0;
        timeline.fromTo(ring, { strokeDashoffset: length }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' });
      }
      if (marks) {
        timeline.from(marks.children, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.4, stagger: 0.07, ease: 'back.out(2)' }, 0.9);
      }
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  });
}

// Altímetro lateral: el scroll de toda la página es la subida de La Granja a
// Peñalara por el perfil real del terreno.
export function initAltimeter(): void {
  mm.add(ALTIMETER_MEDIA, () => {
    const altimeter = document.querySelector<HTMLElement>('[data-altimeter]');
    if (!altimeter) return;
    const scale = altimeter.querySelector<HTMLElement>('.altimeter-scale');
    const needle = altimeter.querySelector<HTMLElement>('.altimeter-needle');
    const elevation = altimeter.querySelector<HTMLElement>('.altimeter-elevation');
    const distance = altimeter.querySelector<HTMLElement>('.altimeter-distance');
    if (!scale || !needle || !elevation || !distance) return;

    const heights = (altimeter.dataset.heights ?? '').split(' ').map(Number);
    const [scaleLow, scaleHigh] = (altimeter.dataset.scale ?? '').split(' ').map(Number);
    const totalKm = Number(altimeter.dataset.distance);
    let scaleHeight = scale.clientHeight;

    const render = (progress: number) => {
      const metres = heights[Math.round(progress * (heights.length - 1))];
      const y = ((scaleHigh - metres) / (scaleHigh - scaleLow)) * scaleHeight;
      needle.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      elevation.textContent = `${formatCount(metres, 0)} m`;
      distance.textContent = `km ${formatCount(progress * totalKm, 1)}`;
    };

    // Dentro del hero ya hay un marco con coordenadas: el altímetro aparece
    // cuando se empieza a bajar por la página.
    const hero = document.querySelector('#hero');
    const show = () => document.documentElement.classList.add('altimeter-ready');
    const hide = () => document.documentElement.classList.remove('altimeter-ready');
    if (hero) {
      ScrollTrigger.create({ trigger: hero, start: 'bottom 70%', onEnter: show, onLeaveBack: hide });
    } else {
      show();
    }

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => render(self.progress),
      onRefresh: (self) => {
        scaleHeight = scale.clientHeight;
        render(self.progress);
      },
    });

    return () => {
      hide();
      needle.style.transform = '';
    };
  });
}

export function destroyAnimations(): void {
  // revert() mata los tweens y ScrollTriggers creados dentro de los contextos
  // matchMedia y restaura los valores originales de las propiedades animadas.
  mm.revert();
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.killTweensOf('*');
}
