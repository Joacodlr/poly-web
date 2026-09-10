/* ------------------------------------------------------------------ *
 *  MANUFACTURAS POLY — modelo de datos
 *
 *  El sitio es una GALERÍA de piezas, no un catálogo con ficha técnica
 *  ni una estructura de productos navegable. A propósito: la empresa
 *  no quiere que el sitio funcione como un mapa de su catálogo para
 *  la competencia. Se muestra valor ("esto podemos hacer por tu
 *  marca"), no estructura ("estas son nuestras N familias, con estas
 *  subcategorías y estos códigos exactos").
 *
 *  Por eso las piezas NO se agrupan ni se filtran públicamente por
 *  material o categoría — son una sola galería mixta. Lo único
 *  estructural que se muestra son las 4 "Soluciones" (más abajo),
 *  que son propuesta de valor, no un organigrama de producción.
 *
 *  Todo lo técnico (código, acabado, medida) es OPCIONAL y de uso
 *  interno: si el dueño lo completa, queda disponible en el panel
 *  para su propia referencia, pero el sitio público nunca lo muestra.
 * ------------------------------------------------------------------ */

/** WhatsApp Business: +51 998 180 781. Solo dígitos, con prefijo de país. */
export const WA = "51998180781";

export const CONTACT = {
  address: "Jr. Cajamarquilla 1126, Urb. Zárate — San Juan de Lurigancho, Lima",
  phone: "+51 1 715 8020",
  phoneHref: "tel:+5117158020",
  email: "info@mpsac.com.pe",
  hours: "Lun a Vie 8:30–18:00 · Sáb 9:00–13:00",
} as const;

/** Dibujo vectorial que se usa cuando una pieza todavía no tiene foto. */
export type Shape =
  | "generic"
  | "button-jean"
  | "button-sew"
  | "button-shank"
  | "puller-metal"
  | "plate"
  | "rivet"
  | "patch"
  | "label-rubber"
  | "button-rubber"
  | "puller-plastic"
  | "label-leather"
  | "applique"
  | "swatch";

export type Piece = {
  /** Clave única. El _id de Sanity, o el código en los datos de ejemplo. */
  id: string;
  name: string;
  desc: string;
  /** Foto subida al CMS. Si falta, se dibuja la pieza. */
  image?: { card: string; full: string; alt: string };
  shape?: Shape;

  /**
   * Referencia interna, nunca se muestra en el sitio público. Sirve
   * para que el dueño identifique la pieza en planta o al cotizar
   * por teléfono, no para armar un catálogo navegable.
   */
  code?: string;
  finish?: string;
  size?: string;
};

/* -------------------------- piezas de ejemplo ------------------------- */

export const SEED_PIECES: Piece[] = [
  {
    id: "p1",
    name: "Botón jean troquelado",
    shape: "button-jean",
    finish: "Bronce envejecido",
    desc: "Botón de pie para denim, grabado a molde con tu marca. Fijación por remache, resiste lavado industrial.",
  },
  {
    id: "p2",
    name: "Botón jean escudo",
    shape: "button-jean",
    finish: "Antiguo",
    desc: "Cabeza abombada con relieve profundo. Ideal para denim rígido y prendas de trabajo.",
  },
  {
    id: "p3",
    name: "Botón cosido clásico",
    shape: "button-sew",
    finish: "Bronce mate",
    desc: "Botón cosido con logo perimetral grabado. Producción por millar, para camisería y jean liviano.",
  },
  {
    id: "p4",
    name: "Jalador metálico",
    shape: "puller-metal",
    finish: "Cobre pulido",
    desc: "Jalador para cierre con logo troquelado en ambas caras.",
  },
  {
    id: "p5",
    name: "Botón de pie pirámide",
    shape: "button-shank",
    finish: "Níquel",
    desc: "Cabeza piramidal y fijación por remache. Alto contraste sobre denim oscuro.",
  },
  {
    id: "p6",
    name: "Placa logo",
    shape: "plate",
    finish: "Bronce",
    desc: "Placa metálica para bolso o prenda, corte y grabado personalizado.",
  },
  {
    id: "p7",
    name: "Remache reforzado",
    shape: "rivet",
    finish: "Antiguo",
    desc: "Decorativo y de refuerzo para esquinas de bolsillo en jean.",
  },
  {
    id: "p8",
    name: "Parche goma relieve",
    shape: "patch",
    finish: "PVC 3D",
    desc: "Goma inyectada multicolor, alto relieve, con tu isotipo. Cosible o termoadhesivo.",
  },
  {
    id: "p9",
    name: "Etiqueta de goma",
    shape: "label-rubber",
    finish: "PVC flexible",
    desc: "Cosible, texto en bajo relieve. Colores a medida y tacto suave.",
  },
  {
    id: "p10",
    name: "Puller plástico",
    shape: "puller-plastic",
    finish: "PVC",
    desc: "Forma libre según tu diseño, con anilla metálica o cordón.",
  },
  {
    id: "p11",
    name: "Etiqueta de cuero",
    shape: "label-leather",
    finish: "Cuero natural",
    desc: "Grabada al fuego, cosible, para jean y bolsos. Envejece con la prenda.",
  },
  {
    id: "p12",
    name: "Aplique de cuero",
    shape: "applique",
    finish: "Cuero graso",
    desc: "Troquelado a medida para detalles de prenda premium.",
  },
];

/** Rubros a los que abastecemos — tira animada del hero. */
export const SECTORS = [
  "Denim",
  "Camisería",
  "Calzado",
  "Marroquinería",
  "Uniformes",
  "Ropa deportiva",
  "Merchandising",
  "Ropa infantil",
] as const;
