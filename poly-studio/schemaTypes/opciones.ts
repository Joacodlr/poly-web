/* ------------------------------------------------------------------ *
 *  Listas compartidas por los formularios del panel.
 *
 *  Los `value` de FORMAS tienen que coincidir con el tipo `Shape` de
 *  ../../src/data.ts — son los dibujos que el sitio sabe hacer.
 * ------------------------------------------------------------------ */

/**
 * Dibujo que usa el sitio cuando una pieza todavía no tiene foto.
 * "Genérico" funciona para cualquier pieza y se tiñe con el celeste de
 * la marca.
 */
export const FORMAS = [
  { title: "Genérico (medallón con la marca)", value: "generic" },
  { title: "Botón para jean", value: "button-jean" },
  { title: "Botón cosido", value: "button-sew" },
  { title: "Botón de pie", value: "button-shank" },
  { title: "Jalador metálico", value: "puller-metal" },
  { title: "Placa", value: "plate" },
  { title: "Remache", value: "rivet" },
  { title: "Parche de goma", value: "patch" },
  { title: "Etiqueta de goma", value: "label-rubber" },
  { title: "Botón de goma", value: "button-rubber" },
  { title: "Puller plástico", value: "puller-plastic" },
  { title: "Etiqueta de cuero", value: "label-leather" },
  { title: "Aplique de cuero", value: "applique" },
  { title: "Muestrario de cuero", value: "swatch" },
];
