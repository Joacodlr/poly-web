import { useEffect } from "react";

/** ¿El visitante pidió menos movimiento en su sistema operativo? */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Activa el revelado al hacer scroll de todo `[data-reveal=""]` del documento,
 * incluidos los nodos que aparecen después (por ejemplo al filtrar el catálogo).
 */
export function useRevealOnScroll() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-reveal", "in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );

    let queued = 0;
    const scan = () => {
      queued = 0;
      for (const el of document.querySelectorAll('[data-reveal=""]')) io.observe(el);
    };
    const schedule = () => {
      if (!queued) queued = requestAnimationFrame(scan);
    };

    scan();
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      if (queued) cancelAnimationFrame(queued);
    };
  }, []);
}
