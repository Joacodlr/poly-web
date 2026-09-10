import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { prefersReducedMotion } from "./hooks";

/* ------------------------------------------------------------------ *
 *  Piezas de interfaz compartidas por el sitio y el panel.
 * ------------------------------------------------------------------ */

/** Envoltorio que hace aparecer su contenido cuando entra en pantalla. */
export function Reveal({
  delay = 0,
  className = "",
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-reveal=""
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/** Cuenta hacia arriba la primera vez que el número entra en pantalla. */
export function CountUp({ to, duration = 1400 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(() => (prefersReducedMotion() ? to : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (t: number) => {
          const k = Math.min(1, (t - t0) / duration);
          setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
          if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return <span ref={ref}>{n}</span>;
}

/* ------------------------------ etiquetas ----------------------------- */

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`label-mono mb-4 flex items-center gap-2.5 ${light ? "text-accent-hi" : "text-accent"}`}>
      <span className={`h-px w-7 ${light ? "bg-accent-hi/50" : "bg-accent/40"}`} />
      {children}
    </p>
  );
}

/* ------------------------------- botones ------------------------------ */

type BtnProps = {
  children: ReactNode;
  className?: string;
  variant?: "solid" | "accent" | "ghost" | "wa" | "outline";
} & Record<string, unknown>;

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100";

const BTN_VARIANT = {
  solid:
    "bg-accent-hi text-ink px-7 py-3.5 shadow-[0_10px_30px_-8px_rgba(79,179,255,.65)] hover:bg-white hover:shadow-[0_16px_40px_-10px_rgba(255,255,255,.5)] hover:-translate-y-0.5",
  ghost:
    "px-7 py-3.5 text-white border border-white/25 bg-white/5 hover:bg-white/12 hover:border-white/45 hover:-translate-y-0.5",
  accent:
    "bg-accent text-white px-7 py-3.5 shadow-[0_10px_30px_-8px_rgba(22,104,199,.55)] hover:bg-carbon hover:-translate-y-0.5",
  outline:
    "px-7 py-3.5 text-carbon border border-line bg-white hover:border-carbon/35 hover:-translate-y-0.5 hover:shadow-card",
  wa: "bg-wa px-6 py-3.5 text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,.7)] hover:brightness-110 hover:-translate-y-0.5",
} as const;

/** Botón o enlace con el mismo lenguaje visual. Usa `href` para renderizar `<a>`. */
export function Btn({ children, className = "", variant = "solid", ...rest }: BtnProps) {
  const cls = `${BTN_BASE} ${BTN_VARIANT[variant]} ${className}`;
  if (typeof rest.href === "string") {
    return (
      <a className={cls} target="_blank" rel="noreferrer" {...(rest as object)}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...(rest as object)}>
      {children}
    </button>
  );
}

/* -------------------------------- chips ------------------------------- */

export function Chip({
  children,
  active,
  onClick,
  tint,
  count,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
  tint?: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-all duration-300 ${
        active
          ? "border-transparent text-white shadow-card"
          : "border-line bg-white text-carbon hover:border-carbon/30 hover:-translate-y-0.5"
      }`}
      style={active ? { background: tint ?? "#131922" } : undefined}
    >
      {children}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 font-mono text-[10px] ${
            active ? "bg-black/25" : "bg-paper text-steel"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function SubChip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 font-mono text-[11.5px] transition-all duration-300 ${
        active
          ? "border-accent bg-accent text-white"
          : "border-line bg-white/60 text-steel hover:border-accent/40 hover:text-carbon"
      }`}
    >
      {children}
    </button>
  );
}

/* ----------------------------- formularios ---------------------------- */

/** Campos oscuros: el único lugar que los usa (el formulario de contacto)
 *  siempre vive sobre fondo oscuro. */
const CONTROL =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-carbon px-4 py-3 text-[15px] text-white transition-all duration-300 placeholder:text-steel-2/50 hover:border-white/30 focus:border-accent-hi focus:outline-none focus:ring-4 focus:ring-accent-hi/15";

export function Field({
  label,
  req = false,
  as = "input",
  className = "",
  ...rest
}: {
  label: string;
  req?: boolean;
  as?: "input" | "textarea" | "select";
  className?: string;
} & Record<string, unknown>) {
  const Tag = as as "input";
  return (
    <label className={`block ${className}`}>
      <span className="font-display text-[13.5px] font-semibold text-white">
        {label}
        {req && <span className="text-danger"> *</span>}
      </span>
      <Tag className={CONTROL} {...(rest as object)} />
    </label>
  );
}
