/// <reference types="vite/client" />

/**
 * Variables de entorno del sitio.
 *
 * TODAS son públicas: Vite incrusta cualquier variable `VITE_*` dentro del
 * JavaScript que descarga el visitante. Si algo tiene que ser secreto, no
 * lleva el prefijo `VITE_` y se usa del lado del servidor.
 */
interface ImportMetaEnv {
  /** Project ID de Sanity (público, solo lectura). */
  readonly VITE_SANITY_PROJECT_ID?: string;
  /** Dataset de Sanity. Por defecto: "production". */
  readonly VITE_SANITY_DATASET?: string;
  /** Access key de Web3Forms para el formulario de contacto. */
  readonly VITE_WEB3FORMS_KEY?: string;
  /** Site key de Cloudflare Turnstile. Si falta, el captcha queda apagado. */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
