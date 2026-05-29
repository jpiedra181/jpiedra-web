import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

function scrollReveal(
  targets: gsap.TweenTarget,
  trigger: string,
  fromVars: gsap.TweenVars,
  toVars: gsap.TweenVars,
) {
  return gsap.fromTo(targets, fromVars, {
    ...toVars,
    scrollTrigger: {
      trigger,
      start: SCROLL_TRIGGER_START,
      toggleActions: 'play none none none',
    },
  });
}

export function initHeroAnimations(): void {
  mm.add(NO_REDUCED_MOTION, () => {
    const tl = gsap.timeline({ delay: 0.3 });

    tl.fromTo('.hero-label span', {
      clipPath: 'inset(0 100% 0 0)',
    }, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.6,
      ease: EASE_IN_OUT,
    });

    tl.from('.hero-title', {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: EASE_OUT,
    }, '-=0.2');

    tl.from('.hero-subtitle', {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: EASE_OUT,
    }, '-=0.4');

    tl.from('.hero-cta', {
      y: 15,
      opacity: 0,
      duration: 0.6,
      ease: EASE_OUT,
    }, '-=0.4');

    tl.from('.hero-tag', {
      y: 10,
      opacity: 0,
      duration: 0.4,
      stagger: STAGGER_FAST,
      ease: EASE_OUT,
    }, '-=0.3');

    tl.from('.hero-canvas', {
      opacity: 0,
      duration: 1,
      ease: EASE_OUT,
    }, 0.5);
  });
}

export function initScrollAnimations(): void {
  mm.add(NO_REDUCED_MOTION, () => {
    // Context section
    scrollReveal('#contexto .context-eyebrow', '#contexto',
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: EASE_IN_OUT },
    );

    scrollReveal('.context-title', '#contexto',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: EASE_OUT },
    );

    scrollReveal('.context-subtitle', '#contexto',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.25, ease: EASE_OUT },
    );

    scrollReveal('.context-stat', '#contexto',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: STAGGER_MEDIUM, delay: 0.35, ease: EASE_OUT },
    );

    scrollReveal('.context-closing', '#contexto',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: EASE_OUT },
    );

    scrollReveal('.context-sources', '#contexto',
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.15, ease: EASE_OUT },
    );

    // About section
    scrollReveal('.about-image', '#about',
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: EASE_OUT },
    );

    scrollReveal('#about .section-label', '#about',
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: EASE_IN_OUT },
    );

    scrollReveal('.about-title', '#about',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: EASE_OUT },
    );

    scrollReveal('.about-text', '#about',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: EASE_OUT },
    );

    // Approach section
    scrollReveal('#approach .approach-eyebrow', '#approach',
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: EASE_IN_OUT },
    );

    scrollReveal('.approach-title', '#approach',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: EASE_OUT },
    );

    scrollReveal('.approach-subtitle', '#approach',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.25, ease: EASE_OUT },
    );

    scrollReveal('.approach-card', '#approach',
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: STAGGER_MEDIUM, delay: 0.35, ease: EASE_OUT },
    );

    // Projects section
    scrollReveal('#projects .section-label', '#projects',
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.6, ease: EASE_IN_OUT },
    );

    scrollReveal('.projects-title', '#projects',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: EASE_OUT },
    );

    // Each project card
    document.querySelectorAll('.project-card').forEach((card) => {
      gsap.fromTo(card,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: EASE_OUT,
          scrollTrigger: { trigger: card, start: SCROLL_TRIGGER_START, toggleActions: 'play none none none' },
        },
      );

      // Parallax on project images
      const img = card.querySelector('.project-image img');
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

      // Stagger project tags
      const tags = card.querySelectorAll('.project-tag');
      gsap.fromTo(tags,
        { y: 10, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.4, stagger: STAGGER_FAST, delay: 0.4, ease: EASE_OUT,
          scrollTrigger: { trigger: card, start: SCROLL_TRIGGER_START, toggleActions: 'play none none none' },
        },
      );
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

export function initHeaderScroll(): void {
  // Handled in Header.astro with vanilla JS for faster response
}

export function destroyAnimations(): void {
  // revert() mata los tweens y ScrollTriggers creados dentro de los contextos
  // matchMedia y restaura los valores originales de las propiedades animadas.
  mm.revert();
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.killTweensOf('*');
}
