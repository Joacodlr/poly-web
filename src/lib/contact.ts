/* ------------------------------------------------------------------ *
 *  Envío del formulario de contacto.
 *
 *  No hay servidor propio: el correo lo despacha Web3Forms. Eso evita
 *  mantener un endpoint que atacar y deja el sitio 100% estático.
 *
 *  Defensas contra bots, en capas:
 *    1. Honeypot  — campo oculto que un humano nunca completa.
 *    2. Trampa de tiempo — un envío en menos de 3 s no es humano.
 *    3. Límites de longitud — validados acá y de nuevo en Web3Forms.
 *    4. Turnstile (opcional) — captcha invisible de Cloudflare.
 * ------------------------------------------------------------------ */

import { WA } from "../data";

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY?.trim();
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();

/** ¿Está conectado el servicio de correo? Si no, el formulario es una demo. */
export const contactEnabled = Boolean(WEB3FORMS_KEY);
export const turnstileEnabled = Boolean(TURNSTILE_SITE_KEY);

/** Segundos mínimos entre que se pinta el formulario y se envía. */
const MIN_SECONDS = 3;

export const LIMITS = {
  nombre: 80,
  correo: 120,
  telefono: 30,
  empresa: 100,
  ruc: 15,
  mensaje: 1200,
} as const;

export type ContactData = {
  nombre: string;
  correo: string;
  telefono: string;
  empresa: string;
  ruc: string;
  producto: string;
  mensaje: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Valida en el navegador. Devuelve el mensaje de error, o null si está bien. */
export function validate(d: ContactData): string | null {
  if (!d.nombre.trim()) return "Escribe tu nombre.";
  if (d.nombre.length > LIMITS.nombre) return "El nombre es demasiado largo.";
  if (!EMAIL_RE.test(d.correo.trim())) return "Revisa el correo: no parece válido.";
  if (!d.telefono.trim()) return "Escribe un teléfono de contacto.";
  if (d.telefono.length > LIMITS.telefono) return "El teléfono es demasiado largo.";
  if (d.empresa.length > LIMITS.empresa) return "El nombre de la empresa es demasiado largo.";
  if (d.ruc.length > LIMITS.ruc) return "El RUC es demasiado largo.";
  if (d.mensaje.length > LIMITS.mensaje) return "El mensaje es demasiado largo.";
  return null;
}

export class ContactError extends Error {}

/**
 * Qué pasó con la solicitud.
 *   `email`    — salió por correo.
 *   `whatsapp` — no hay servicio de correo configurado, así que el
 *                mensaje se arma y se abre en WhatsApp. Nunca se pierde
 *                un contacto por una clave que falta.
 */
export type ContactResult = { mode: "email" } | { mode: "whatsapp"; url: string };

/** Arma el mensaje de WhatsApp con lo que el visitante completó. */
export function contactWaText(d: ContactData): string {
  return [
    "Hola Manufacturas Poly, quisiera una cotización.",
    "",
    `Nombre: ${d.nombre.trim()}`,
    `Correo: ${d.correo.trim()}`,
    `Teléfono: ${d.telefono.trim()}`,
    d.empresa.trim() && `Empresa: ${d.empresa.trim()}`,
    d.ruc.trim() && `RUC: ${d.ruc.trim()}`,
    `Interés: ${d.producto}`,
    d.mensaje.trim() && `\n${d.mensaje.trim()}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Envía la solicitud. Lanza `ContactError` con un texto listo para mostrar.
 *
 * @param honeypot  contenido del campo trampa; si trae algo, es un bot
 * @param startedAt `Date.now()` de cuando se montó el formulario
 * @param captcha   token de Turnstile, si está activado
 */
export async function sendContact(
  d: ContactData,
  { honeypot, startedAt, captcha }: { honeypot: string; startedAt: number; captcha?: string },
): Promise<ContactResult> {
  // 1. Honeypot: silenciosamente hacemos como que salió bien.
  if (honeypot.trim()) return { mode: "email" };

  // 2. Trampa de tiempo.
  if (Date.now() - startedAt < MIN_SECONDS * 1000) {
    throw new ContactError("Espera un momento antes de enviar.");
  }

  // 3. Validación.
  const invalid = validate(d);
  if (invalid) throw new ContactError(invalid);

  if (turnstileEnabled && !captcha) {
    throw new ContactError("Completa la verificación de seguridad.");
  }

  // Sin servicio de correo, el mensaje se deriva a WhatsApp ya escrito.
  if (!WEB3FORMS_KEY) {
    return {
      mode: "whatsapp",
      url: `https://wa.me/${WA}?text=${encodeURIComponent(contactWaText(d))}`,
    };
  }

  const clip = <K extends keyof typeof LIMITS>(v: string, k: K) => v.trim().slice(0, LIMITS[k]);

  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: `Nueva solicitud de cotización — ${clip(d.nombre, "nombre")}`,
      from_name: "Sitio web Manufacturas Poly",
      replyto: clip(d.correo, "correo"),
      Nombre: clip(d.nombre, "nombre"),
      Correo: clip(d.correo, "correo"),
      Teléfono: clip(d.telefono, "telefono"),
      Empresa: clip(d.empresa, "empresa") || "—",
      RUC: clip(d.ruc, "ruc") || "—",
      "Producto de interés": d.producto,
      Mensaje: clip(d.mensaje, "mensaje") || "—",
      ...(captcha ? { "cf-turnstile-response": captcha } : {}),
    }),
  });

  const body = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null;

  if (!res.ok || !body?.success) {
    throw new ContactError(
      body?.message ?? "No pudimos enviar el mensaje. Escríbenos por WhatsApp mientras lo revisamos.",
    );
  }

  return { mode: "email" };
}
