import { useEffect, useRef } from "react";
import { TURNSTILE_SITE_KEY, turnstileEnabled } from "./contact";

/* ------------------------------------------------------------------ *
 *  Captcha invisible de Cloudflare Turnstile.
 *
 *  El script sólo se carga si VITE_TURNSTILE_SITE_KEY está configurada.
 *  Mientras no lo esté, el sitio no pide nada a Cloudflare y la CSP
 *  puede quedarse tan estricta como está.
 * ------------------------------------------------------------------ */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
      theme?: "auto" | "light" | "dark";
      appearance?: "always" | "execute" | "interaction-only";
    },
  ) => string;
  remove: (id: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("No se pudo cargar Turnstile"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** Renderiza el widget e informa el token al formulario. */
export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!turnstileEnabled) return;
    const box = boxRef.current;
    if (!box) return;

    let widgetId: string | undefined;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        widgetId = window.turnstile.render(box, {
          sitekey: TURNSTILE_SITE_KEY!,
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
          appearance: "interaction-only",
          theme: "light",
        });
      })
      .catch((err) => console.error("[poly]", err));

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [onToken]);

  if (!turnstileEnabled) return null;
  return <div ref={boxRef} className="mt-4" />;
}
