import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || "production",
  },
  /**
   * Dirección pública del panel: https://manufacturas-poly.sanity.studio
   * Los subdominios .sanity.studio son globales para toda la plataforma,
   * no sólo para este proyecto: "poly" a secas ya estaba tomado.
   */
  studioHost: "manufacturas-poly",
  deployment: {
    /** El Studio se mantiene solo al día con las mejoras de Sanity. */
    autoUpdates: true,
    /** Identificador de la aplicación ya desplegada: evita que
     *  `npm run deploy` vuelva a preguntarlo cada vez. */
    appId: "gg68jtxk41i6cf5ub3ou6uq1",
  },
});
