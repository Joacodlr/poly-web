import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

/* ------------------------------------------------------------------ *
 *  Panel del propietario de Manufacturas Poly.
 *
 *  El projectId y el dataset son públicos (solo lectura). Quién puede
 *  EDITAR se controla invitando miembros en sanity.io/manage, no acá.
 * ------------------------------------------------------------------ */

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

if (!projectId) {
  throw new Error(
    "Falta SANITY_STUDIO_PROJECT_ID. Copiá .env.example como .env y poné el ID de tu proyecto.",
  );
}

export default defineConfig({
  name: "poly",
  title: "Manufacturas Poly",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
