import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

import type { Piece, Shape } from "../data";

/* ------------------------------------------------------------------ *
 *  Lectura de la galería desde Sanity.
 *
 *  Sólo llegan al navegador el projectId y el dataset: ambos son
 *  públicos y de SOLO LECTURA. Nunca poner acá un token de escritura
 *  (ni con el prefijo VITE_, porque Vite lo publicaría en el bundle).
 * ------------------------------------------------------------------ */

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID?.trim();
const dataset = import.meta.env.VITE_SANITY_DATASET?.trim() || "production";

/** ¿Hay un proyecto de Sanity configurado en las variables de entorno? */
export const sanityEnabled = Boolean(projectId);

export const sanity = sanityEnabled
  ? createClient({
      projectId: projectId!,
      dataset,
      apiVersion: "2024-10-01",
      useCdn: true,
      // Ignora los borradores: sólo se ve lo que el dueño publicó.
      perspective: "published",
    })
  : null;

const builder = sanity ? createImageUrlBuilder({ projectId: projectId!, dataset }) : null;

const imageUrl = (src: SanityImageSource, size: number) =>
  builder?.image(src).width(size).height(size).fit("crop").auto("format").quality(80).url() ?? "";

/* --------------------------- consulta GROQ -------------------------- */

export const PIECES_QUERY = `*[_type == "pieza" && defined(nombre)]
  | order(coalesce(orden, 999) asc, _createdAt desc){
    _id, nombre, descripcion, imagen, forma,
    codigo, acabado, medida
  }`;

type PieceRow = {
  _id: string;
  nombre?: string;
  descripcion?: string;
  imagen?: SanityImageSource;
  forma?: string;
  codigo?: string;
  acabado?: string;
  medida?: string;
};

const clean = (v: string | undefined) => {
  const t = v?.trim();
  return t ? t : undefined;
};

const safeShape = (v: string | undefined): Shape | undefined =>
  v && v !== "generic" ? (v as Shape) : undefined;

/**
 * Convierte un documento del CMS en una pieza de la galería.
 * Todo lo que viene del CMS se trata como texto plano: nunca se
 * interpreta como HTML.
 *
 * `codigo`, `acabado` y `medida` viajan en el objeto por si algún día
 * hace falta usarlos internamente, pero el sitio (App.tsx) nunca los
 * renderiza: son de uso exclusivo del panel.
 */
function toPiece(row: PieceRow): Piece | null {
  const name = clean(row.nombre);
  if (!name) return null;

  return {
    id: row._id,
    name,
    desc: clean(row.descripcion) ?? "",
    shape: safeShape(row.forma),
    code: clean(row.codigo),
    finish: clean(row.acabado),
    size: clean(row.medida),
    image: row.imagen
      ? { card: imageUrl(row.imagen, 700), full: imageUrl(row.imagen, 1100), alt: name }
      : undefined,
  };
}

/** Trae las piezas publicadas. Lanza si Sanity no responde. */
export async function fetchPieces(signal?: AbortSignal): Promise<Piece[]> {
  if (!sanity) return [];
  const rows = await sanity.fetch<PieceRow[]>(PIECES_QUERY, {}, { signal });
  return rows.map(toPiece).filter((p): p is Piece => p !== null);
}

/* ------------------------ fotos de las soluciones ---------------------- */

/**
 * Los 4 casilleros de foto de las Soluciones (ver poly-studio/structure.ts).
 * `_id` es fijo: "solucion-identidad-marca" → clave "identidad-marca".
 * El título y la descripción de cada solución NO viven acá — son fijos
 * en SOLUTIONS dentro de App.tsx, a propósito.
 */
export const SOLUTION_IMAGES_QUERY = `*[_type == "solucion" && _id in [
    "solucion-identidad-marca", "solucion-detalles-prendas",
    "solucion-acabados-especiales", "solucion-desarrollos-medida"
  ]]{ _id, imagen }`;

type SolutionImageRow = { _id: string; imagen?: SanityImageSource };

/** Trae las fotos publicadas de las 4 Soluciones, indexadas por clave. */
export async function fetchSolutionImages(signal?: AbortSignal): Promise<Record<string, string>> {
  if (!sanity) return {};
  const rows = await sanity.fetch<SolutionImageRow[]>(SOLUTION_IMAGES_QUERY, {}, { signal });

  const out: Record<string, string> = {};
  for (const row of rows) {
    if (!row.imagen) continue;
    const key = row._id.replace(/^solucion-/, "");
    out[key] = imageUrl(row.imagen, 900);
  }
  return out;
}
