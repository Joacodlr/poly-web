import { defineField, defineType } from "sanity";
import { FORMAS } from "./opciones";

/* ------------------------------------------------------------------ *
 *  Pieza — una foto de la galería, con su descripción.
 *
 *  El sitio es una galería mixta, no un catálogo navegable por
 *  categoría: por eso la pieza NO tiene un campo de familia o rubro.
 *  Sólo nombre, foto y descripción son lo importante.
 *
 *  Código, acabado y medida son de uso interno — quedan acá para tu
 *  propia referencia, pero el sitio público nunca los muestra.
 * ------------------------------------------------------------------ */

export const pieza = defineType({
  name: "pieza",
  title: "Pieza",
  type: "document",
  groups: [
    { name: "principal", title: "Lo principal", default: true },
    { name: "interno", title: "Uso interno (no se publica)" },
  ],
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre",
      type: "string",
      group: "principal",
      description: "Cómo se llama la pieza. Ej: Botón jean troquelado",
      validation: (Rule) => Rule.required().max(80).error("El nombre es obligatorio."),
    }),
    defineField({
      name: "imagen",
      title: "Foto",
      type: "image",
      group: "principal",
      description:
        "La foto de la pieza. Si no subes ninguna, el sitio dibuja una automáticamente.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texto alternativo",
          type: "string",
          description:
            "Opcional. Describe la foto para lectores de pantalla y buscadores. Si lo dejas vacío se usa el nombre de la pieza.",
        }),
      ],
    }),
    defineField({
      name: "descripcion",
      title: "Descripción",
      type: "text",
      rows: 3,
      group: "principal",
      description:
        "Qué es, para qué sirve, en qué prenda se usa. Texto simple: no hace falta formato ni negritas.",
      validation: (Rule) => Rule.max(600),
    }),
    defineField({
      name: "orden",
      title: "Orden",
      type: "number",
      group: "principal",
      description: "Menor número, aparece primero. Si lo dejas vacío, van primero las más nuevas.",
      validation: (Rule) => Rule.min(0).max(999).integer(),
    }),

    /* ------------------------- uso interno ------------------------ */

    defineField({
      name: "codigo",
      title: "Código",
      type: "string",
      group: "interno",
      description:
        "Opcional y privado. El código con el que la identifican en planta. NO aparece en el sitio: es sólo para tu propia referencia.",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "acabado",
      title: "Acabado",
      type: "string",
      group: "interno",
      description:
        "Opcional y privado. Ej: Bronce envejecido, Níquel mate, Cobre pulido. NO aparece en el sitio.",
      validation: (Rule) => Rule.max(60),
    }),
    defineField({
      name: "medida",
      title: "Medida",
      type: "string",
      group: "interno",
      description:
        "Opcional y privado. Ej: Línea 32 · 20 mm, 45 × 16 mm. NO aparece en el sitio.",
      validation: (Rule) => Rule.max(40),
    }),
    defineField({
      name: "forma",
      title: "Dibujo de respaldo",
      type: "string",
      group: "interno",
      description:
        "Opcional, y sólo importa si esta pieza no tiene foto. Si lo dejas vacío, se dibuja el genérico.",
      options: { list: FORMAS },
    }),
  ],
  preview: {
    select: { title: "nombre", subtitle: "codigo", media: "imagen" },
  },
  orderings: [
    {
      title: "Orden de la galería",
      name: "ordenAsc",
      by: [
        { field: "orden", direction: "asc" },
        { field: "_createdAt", direction: "desc" },
      ],
    },
    {
      title: "Más recientes primero",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});
