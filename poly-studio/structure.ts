import type { StructureResolver } from "sanity/structure";

/* ------------------------------------------------------------------ *
 *  Menú del panel.
 *
 *  Sin familias: la galería del sitio es una sola lista mixta, así
 *  que acá también. Sólo dos accesos: todo, y lo que falta fotografiar.
 *
 *  Las 4 "Soluciones" son casilleros fijos, no una lista: el dueño
 *  puede cambiarles la foto, pero no crear, borrar ni renombrar
 *  ninguna — el título de cada una vive en el código del sitio.
 * ------------------------------------------------------------------ */

/** Debe coincidir con las claves de SOLUTIONS en ../src/App.tsx */
const SOLUCIONES = [
  { id: "solucion-identidad-marca", title: "Identidad de marca" },
  { id: "solucion-detalles-prendas", title: "Detalles para prendas" },
  { id: "solucion-acabados-especiales", title: "Acabados especiales" },
  { id: "solucion-desarrollos-medida", title: "Desarrollos a medida" },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .title("Todas las piezas")
        .child(S.documentTypeList("pieza").title("Todas las piezas")),

      S.divider(),

      S.listItem()
        .title("Piezas sin foto")
        .child(
          S.documentList()
            .title("Piezas sin foto")
            .filter('_type == "pieza" && !defined(imagen)'),
        ),

      S.divider(),

      S.listItem()
        .title("Fotos de las Soluciones")
        .child(
          S.list()
            .title("Fotos de las Soluciones")
            .items(
              SOLUCIONES.map((s) =>
                S.listItem()
                  .title(s.title)
                  .child(
                    S.document()
                      .schemaType("solucion")
                      .documentId(s.id)
                      .title(s.title),
                  ),
              ),
            ),
        ),
    ]);
