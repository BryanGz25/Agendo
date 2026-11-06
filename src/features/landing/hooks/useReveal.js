import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scroll reveals for the landing. Elements with [data-reveal] rise 28px and
 * fade in once; [data-reveal-group] staggers its children. With reduced motion
 * everything is shown as is.
 */
export function useReveal(scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          });
        });
        gsap.utils.toArray('[data-reveal-group]').forEach((group) => {
          gsap.from(group.children, {
            y: 24,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            stagger: 0.07,
            scrollTrigger: { trigger: group, start: 'top 85%', once: true },
          });
        });
        gsap.utils.toArray('[data-count]').forEach((el) => {
          const end = Number(el.dataset.count);
          const decimals = Number(el.dataset.decimals ?? 0);
          const state = { value: 0 };
          gsap.to(state, {
            value: end,
            duration: 1.4,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            onUpdate: () => {
              el.textContent = state.value.toLocaleString('es-CR', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              });
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
