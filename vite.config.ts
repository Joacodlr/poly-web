import { defineConfig, loadEnv } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * En cPanel no hay build en el servidor: lo que se compila acá es
 * exactamente lo que se sube. Este plugin imprime, justo antes de
 * empaquetar, qué quedó horneado en el bundle — así se detecta un
 * `.env.production` faltante ANTES de subir el sitio, y no después.
 */
function resumenDeConfiguracion(env: Record<string, string>): Plugin {
  return {
    name: "poly-resumen-config",
    apply: "build",
    buildStart() {
      const cms = env.VITE_SANITY_PROJECT_ID?.trim();
      const form = env.VITE_WEB3FORMS_KEY?.trim();
      const captcha = env.VITE_TURNSTILE_SITE_KEY?.trim();

      const linea = (ok: boolean, txt: string) => `  ${ok ? "✔" : "✖"} ${txt}`;

      console.log("\n┌─ Configuración horneada en este build ─────────────");
      console.log(
        linea(
          Boolean(cms),
          cms
            ? `CMS Sanity: ${cms} / ${env.VITE_SANITY_DATASET?.trim() || "production"}`
            : "CMS Sanity: SIN CONFIGURAR → el sitio mostrará productos de ejemplo",
        ),
      );
      console.log(
        linea(
          Boolean(form),
          form
            ? "Formulario: Web3Forms conectado (llega por correo)"
            : "Formulario: sin correo → deriva a WhatsApp",
        ),
      );
      console.log(linea(true, captcha ? "Captcha: Turnstile activo" : "Captcha: apagado"));
      console.log("└────────────────────────────────────────────────────");

      if (!cms) {
        console.warn(
          "\n⚠  Falta VITE_SANITY_PROJECT_ID. Si esto es un build para subir a\n" +
            "   producción, revisá que exista .env.production antes de publicar.\n",
        );
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");

  return {
    plugins: [react(), tailwindcss(), resumenDeConfiguracion(env)],
    build: {
      // Sin sourcemaps en producción: no publicamos el código original.
      sourcemap: false,
    },
    server: {
      watch: {
        // poly-studio es un proyecto aparte (Sanity Studio): no es parte del sitio.
        ignored: ["**/poly-studio/**"],
      },
    },
  };
});
