import { useEffect, useState } from "react";

import { SEED_PIECES } from "../data";
import type { Piece } from "../data";
import { fetchPieces, sanityEnabled } from "./sanity";

/**
 * `demo`    — no hay CMS configurado: se muestra la galería de ejemplo.
 * `loading` — pidiendo el contenido a Sanity.
 * `live`    — la galería viene del CMS.
 * `empty`   — el CMS responde pero todavía no hay nada publicado.
 * `error`   — Sanity no respondió; se muestra un estado de error, no
 *             piezas inventadas.
 */
export type CatalogStatus = "demo" | "loading" | "live" | "empty" | "error";

/**
 * Contenido de la galería.
 *
 * Los datos de ejemplo son SÓLO para cuando no hay CMS configurado
 * (desarrollo y vista previa). En cuanto hay un proyecto de Sanity, lo
 * que se muestra es lo que el CMS devuelve — aunque sea nada.
 */
export function useGallery() {
  const seed = !sanityEnabled;
  const [pieces, setPieces] = useState<Piece[]>(seed ? SEED_PIECES : []);
  const [status, setStatus] = useState<CatalogStatus>(seed ? "demo" : "loading");

  useEffect(() => {
    if (!sanityEnabled) return;

    const ctrl = new AbortController();
    fetchPieces(ctrl.signal)
      .then((rows) => {
        if (ctrl.signal.aborted) return;
        setPieces(rows);
        setStatus(rows.length > 0 ? "live" : "empty");
      })
      .catch((err) => {
        if (ctrl.signal.aborted) return;
        console.error("[poly] No se pudo leer la galería de Sanity:", err);
        setPieces([]);
        setStatus("error");
      });

    return () => ctrl.abort();
  }, []);

  return { pieces, status };
}
