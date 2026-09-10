import { defineField, defineType } from "sanity";

/* ------------------------------------------------------------------ *
 *  Foto de una Solución.
 *
 *  Las 4 Soluciones (Identidad de marca, Detalles para prendas,
 *  Acabados especiales, Desarrollos a medida) son la propuesta de
 *  valor central del sitio — el título y la descripción de cada una
 *  quedan fijos en el código, a propósito: son la base de la
 *  estrategia comercial, no algo para editar sobre la marcha.
 *
 *  Lo único editable acá es la FOTO. Por eso en el panel no aparecen
 *  como una lista donde se puede crear o borrar: son 4 casilleros
 *  fijos (ver structure.ts) — se abre uno, se cambia la foto, se
 *  publica.
 * ------------------------------------------------------------------ */

export const solucion = defineType({
  name: "solucion",
  title: "Foto de solución",
  type: "document",
  fields: [
    defineField({
      name: "imagen",
      title: "Foto",
      type: "image",
      description: "La foto que ilustra esta solución en el sitio.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texto alternativo",
          type: "string",
          description: "Opcional. Si lo dejas vacío se usa el nombre de la solución.",
        }),
      ],
    }),
  ],
  preview: {
    select: { media: "imagen" },
    prepare: ({ media }) => ({ title: "Foto de esta solución", media }),
  },
});
