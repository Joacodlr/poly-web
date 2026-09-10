import { useEffect, useState } from "react";

import { fetchSolutionImages, sanityEnabled } from "./sanity";

/**
 * Fotos de las 4 Soluciones, indexadas por clave ("identidad-marca",
 * "detalles-prendas", "acabados-especiales", "desarrollos-medida").
 *
 * Si el dueño todavía no subió una foto para alguna —o ninguna—, esa
 * clave simplemente no aparece en el objeto: el componente que lo usa
 * cae a un respaldo visual, nunca a un hueco vacío.
 */
export function useSolutionImages() {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!sanityEnabled) return;
    const ctrl = new AbortController();
    fetchSolutionImages(ctrl.signal)
      .then((rows) => {
        if (!ctrl.signal.aborted) setImages(rows);
      })
      .catch((err) => {
        if (!ctrl.signal.aborted) console.error("[poly] No se pudieron leer las fotos de Soluciones:", err);
      });
    return () => ctrl.abort();
  }, []);

  return images;
}
