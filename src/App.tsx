import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock,
  Factory,
  Images,
  Layers,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  Menu,
  Palette,
  Phone,
  Ruler,
  Search,
  Send,
  ShieldCheck,
  Shirt,
  Sparkles,
  Tag,
  TriangleAlert,
  X,
} from "lucide-react";

import { CONTACT, SECTORS, WA } from "./data";
import type { Piece } from "./data";
import { IconWA, Logo, PieceVisual } from "./visuals";
import { Btn, CountUp, Eyebrow, Field, Reveal } from "./ui";
import { useRevealOnScroll } from "./hooks";
import { useGallery } from "./lib/useGallery";
import type { CatalogStatus } from "./lib/useGallery";
import { useSolutionImages } from "./lib/useSolutionImages";
import {
  ContactError,
  LIMITS,
  contactEnabled,
  sendContact,
  turnstileEnabled,
  validate,
} from "./lib/contact";
import type { ContactData } from "./lib/contact";
import { Turnstile } from "./lib/Turnstile";

/* ------------------------------------------------------------------ *
 *  MANUFACTURAS POLY — sitio de soluciones
 *
 *  A pedido del dueño, el sitio NO organiza ni filtra las piezas por
 *  material o categoría de producto: eso convertía la web en un mapa
 *  legible del catálogo, fácil de copiar por la competencia.
 *
 *  En su lugar: 4 "Soluciones" fijas (propuesta de valor, no
 *  organigrama de producción) y, debajo, una única galería mixta de
 *  piezas — sin chips, sin conteos por categoría. Se muestra amplitud
 *  y oficio, no la estructura interna del negocio.
 * ------------------------------------------------------------------ */

const waHref = (piece?: Piece) =>
  `https://wa.me/${WA}?text=` +
  encodeURIComponent(
    piece
      ? `Hola Manufacturas Poly, me interesa "${piece.name}". ¿Me pueden enviar información y cotización?`
      : "Hola Manufacturas Poly, quisiera cotizar un pedido.",
  );

/** WhatsApp pre-armado para consultar por una solución puntual. */
const waHrefSolution = (title: string) =>
  `https://wa.me/${WA}?text=` +
  encodeURIComponent(`Hola Manufacturas Poly, quisiera cotizar: ${title}. ¿Me cuentan más?`);

export default function App() {
  const { pieces, status } = useGallery();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Piece | null>(null);
  const [menu, setMenu] = useState(false);

  useRevealOnScroll();

  /* Bloquea el scroll de fondo mientras hay una capa abierta. */
  useEffect(() => {
    const open = menu || active !== null;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu, active]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pieces;
    return pieces.filter((p) => [p.name, p.desc].some((v) => v?.toLowerCase().includes(q)));
  }, [pieces, query]);

  const goto = (id: string) => {
    setMenu(false);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }));
  };

  return (
    <div className="font-body text-ink">
      <a
        href="#soluciones"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-display focus:font-semibold focus:text-carbon"
      >
        Saltar a soluciones
      </a>

      <Header menu={menu} setMenu={setMenu} goto={goto} />

      <main id="top">
        <Hero goto={goto} />
        <Capabilities />
        <Solutions
          pieces={shown}
          total={pieces.length}
          status={status}
          query={query}
          setQuery={setQuery}
          onOpen={setActive}
          goto={goto}
        />
        <About />
        <CtaBand goto={goto} />
        <Contact />
      </main>

      <Footer goto={goto} />

      {/* WhatsApp flotante */}
      <a
        href={waHref()}
        target="_blank"
        rel="noreferrer"
        aria-label="Escribir por WhatsApp"
        className="group fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-wa text-white shadow-[0_12px_30px_-6px_rgba(37,211,102,.7)] transition-transform duration-300 hover:scale-110 sm:bottom-7 sm:right-7"
      >
        <span className="anim-pulse-ring absolute inset-0 rounded-full bg-wa" aria-hidden="true" />
        <span className="relative z-10">
          <IconWA size={27} />
        </span>
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-ink px-3.5 py-2 font-display text-[13px] font-semibold text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 sm:block">
          Cotiza tu pedido
        </span>
      </a>

      <CmsBadge status={status} count={pieces.length} />

      {active && <PieceModal piece={active} onClose={() => setActive(null)} />}
    </div>
  );
}

/* =============================== HEADER =============================== */

const NAV = [
  ["Inicio", "top"],
  ["Soluciones", "soluciones"],
  ["Nosotros", "nosotros"],
  ["Contacto", "contacto"],
] as const;

function Header({
  menu,
  setMenu,
  goto,
}: {
  menu: boolean;
  setMenu: (v: boolean) => void;
  goto: (id: string) => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  /* La barra es oscura siempre; al bajar sólo gana sombra para
     despegarse del contenido. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b bg-ink transition-shadow duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${
          scrolled ? "border-white/10 shadow-[0_4px_24px_-12px_rgba(0,0,0,.6)]" : "border-transparent"
        }`}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6">
          <button onClick={() => goto("top")} aria-label="Ir al inicio" className="shrink-0">
            <Logo light />
          </button>

          <nav className="hidden items-center gap-0.5 text-white lg:flex">
            {NAV.map(([label, id]) => (
              <button
                key={id}
                onClick={() => goto(id)}
                className="nav-link rounded-lg px-3 py-2 font-display text-[15px] font-medium"
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={waHref()}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 rounded-full bg-wa px-5 py-2.5 font-display text-[14.5px] font-semibold text-white shadow-[0_8px_22px_-8px_rgba(37,211,102,.8)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 sm:inline-flex"
            >
              <IconWA size={17} /> Cotizar
            </a>
            <button
              className="rounded-xl p-2.5 text-white transition-colors hover:bg-white/10 lg:hidden"
              onClick={() => setMenu(!menu)}
              aria-label={menu ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menu}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${menu ? "" : "pointer-events-none"}`} aria-hidden={!menu}>
        <div
          className={`absolute inset-0 bg-ink/60 transition-opacity duration-400 ${menu ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenu(false)}
        />
        <div
          className={`absolute inset-x-0 top-[72px] max-h-[calc(100dvh-72px)] origin-top overflow-y-auto rounded-b-3xl border-b border-white/10 bg-ink p-5 shadow-lift transition-all duration-400 ease-[cubic-bezier(.22,1,.36,1)] ${
            menu ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          }`}
        >
          <nav className="flex flex-col">
            {NAV.map(([label, id]) => (
              <button
                key={id}
                onClick={() => goto(id)}
                className="flex items-center justify-between border-b border-white/10 py-3.5 text-left font-display text-lg font-semibold text-white last:border-0"
              >
                {label}
                <ArrowRight size={17} className="text-steel-2" />
              </button>
            ))}
          </nav>
          <a
            href={waHref()}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex items-center justify-center gap-2 rounded-full bg-wa py-3.5 font-display font-semibold text-white"
          >
            <IconWA size={18} /> Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}

/* ================================ HERO ================================ */

/**
 * Foto de portada. Vive en `public/` y no en `src/assets/` a propósito:
 * si el archivo falta, el sitio compila igual y se ve el fondo oscuro de
 * respaldo, en vez de romperse el build.
 */
const HERO_IMG = "/hero.jpg";

function Hero({ goto }: { goto: (id: string) => void }) {
  const [sinFoto, setSinFoto] = useState(false);

  return (
    <section className="relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden bg-ink pt-[72px] text-white lg:min-h-[88svh]">
      {/* Fondo */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Respaldo: si la foto no está, esto es lo que se ve. */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_20%,#152230_0%,#0a0f17_55%,#06090f_100%)]" />

        {!sinFoto && (
          <img
            src={HERO_IMG}
            alt=""
            onError={() => setSinFoto(true)}
            fetchPriority="high"
            decoding="async"
            className="anim-kenburns absolute inset-0 h-full w-full object-cover object-center"
          />
        )}

        {/* Velo: la foto tiene que leerse como textura, no competir con
            el texto. Más oscuro a la izquierda, donde va el titular. */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <div className="grain absolute inset-0 opacity-50" />
      </div>

      {/* Titular */}
      <div className="shell flex flex-1 items-center py-16 lg:py-20">
        <div className="max-w-2xl">
          <Reveal>
            <p className="label-mono flex items-center gap-3 text-brass-hi">
              <span className="h-px w-8 bg-brass-hi/50" />
              Diseño y fabricación · desde 1989
            </p>
          </Reveal>

          <Reveal delay={110}>
            <h1 className="h-hero mt-6">
              Creamos los <span className="text-accent-hi">detalles</span>
              <br />
              que definen tu marca.
            </h1>
          </Reveal>

          <Reveal delay={220}>
            <p className="mt-7 max-w-lg text-[17.5px] leading-relaxed text-white/70">
              Botones, remaches, placas, accesorios en goma, cuero y marroquinería en general.
            </p>
          </Reveal>

          <Reveal delay={310}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Btn onClick={() => goto("soluciones")}>
                Ver soluciones <ArrowRight size={18} />
              </Btn>
              <Btn variant="ghost" href={waHref()}>
                <IconWA size={18} /> Cotiza por WhatsApp
              </Btn>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Franja inferior: los datos duros, sin adornos */}
      <div className="relative border-t border-white/12 bg-ink/40 backdrop-blur-sm">
        <div className="shell flex flex-wrap items-center justify-between gap-x-10 gap-y-5 py-6">
          <dl className="flex flex-wrap items-center gap-x-10 gap-y-4">
            {[
              ["+35", "años de experiencia"],
              ["100%", "a tu medida"],
              ["100%", "fabricación propia"],
            ].map(([n, l]) => (
              <div key={l} className="flex items-baseline gap-2.5">
                <dt className="font-display text-[26px] font-bold leading-none tracking-tight text-white">
                  {n}
                </dt>
                <dd className="text-[13px] leading-snug text-white/55">{l}</dd>
              </div>
            ))}
          </dl>

          <p className="hidden font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/35 lg:block">
            {SECTORS.slice(0, 5).join(" · ")}
          </p>

          <button
            onClick={() => goto("soluciones")}
            className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/45 transition-colors hover:text-brass-hi lg:hidden"
          >
            Ver soluciones ↓
          </button>
        </div>
      </div>
    </section>
  );
}

/**
 * Aviso de estado del CMS. Sólo aparece en `npm run dev`; en producción
 * este componente no renderiza nada.
 */
function CmsBadge({ status, count }: { status: CatalogStatus; count: number }) {
  if (!import.meta.env.DEV) return null;

  const label = {
    demo: "CMS sin configurar · galería de ejemplo",
    loading: "CMS conectando…",
    live: `CMS conectado · ${count} piezas`,
    empty: "CMS conectado · sin piezas aún",
    error: "CMS con error · ver consola",
  }[status];

  const tone = {
    demo: "border-brass/40 bg-brass/15 text-brass",
    loading: "border-accent-hi/40 bg-accent-hi/15 text-accent",
    live: "border-wa/40 bg-wa/15 text-wa",
    empty: "border-accent-hi/40 bg-accent-hi/15 text-accent",
    error: "border-danger/40 bg-danger/15 text-danger",
  }[status];

  return (
    <p
      className={`fixed bottom-5 left-5 z-40 rounded-full border px-3 py-1.5 font-mono text-[10.5px] tracking-[0.06em] backdrop-blur ${tone}`}
    >
      {label}
    </p>
  );
}

/* ============================ CAPACIDADES ============================ */

const CAPS = [
  [Sparkles, "Desarrollamos tu diseño", "Del concepto a la pieza final"],
  [Factory, "Fabricación a tu medida", "Series pequeñas y grandes volúmenes"],
  [Ruler, "Muestras físicas", "Aprobación antes de producir"],
  [ShieldCheck, "Más de 35 años", "Diseño y fabricación · desde 1989"],
] as const;

function Capabilities() {
  return (
    <section className="bg-ink">
      <div className="shell grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {CAPS.map(([Ic, t, d], i) => (
          <Reveal key={t} delay={i * 80}>
            <div
              className={`group flex h-full items-start gap-3.5 border-white/8 py-7 sm:pr-6 ${
                i % 2 ? "sm:border-l sm:pl-6" : "sm:pl-0"
              } ${i ? "lg:border-l lg:pl-6" : "lg:pl-0"}`}
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-accent-hi/20 bg-accent-hi/10 text-accent-hi transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-hi group-hover:text-ink">
                <Ic size={17} />
              </span>
              <span>
                <span className="block font-display text-[15px] font-semibold text-white">{t}</span>
                <span className="mt-1 block text-[12.5px] leading-snug text-steel-2">{d}</span>
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ============================== SOLUCIONES ============================== */

/**
 * Las 4 soluciones son propuesta de valor, no un organigrama de
 * producción. Es contenido estratégico y fijo — a propósito NO vive
 * en el CMS: si el dueño pudiera agregar categorías libremente acá,
 * se podría terminar reconstruyendo la misma estructura por familia
 * que este cambio buscaba evitar.
 */
const SOLUTIONS = [
  {
    /** Coincide con el "solucion-<key>" fijo del panel (ver structure.ts). */
    key: "identidad-marca",
    icon: Tag,
    title: "Identidad de marca",
    desc: "Etiquetas, placas y aplicaciones personalizadas.",
  },
  {
    key: "detalles-prendas",
    icon: Shirt,
    title: "Detalles para prendas",
    desc: "Elementos desarrollados para complementar cada diseño.",
  },
  {
    key: "acabados-especiales",
    icon: Palette,
    title: "Acabados especiales",
    desc: "Diferentes materiales, texturas y acabados para lograr el resultado que buscas.",
  },
  {
    key: "desarrollos-medida",
    icon: Lightbulb,
    title: "Desarrollos a medida",
    desc: "Convertimos una idea, dibujo o referencia en una pieza fabricable.",
  },
] as const;

function Solutions({
  pieces,
  total,
  status,
  query,
  setQuery,
  onOpen,
  goto,
}: {
  pieces: Piece[];
  total: number;
  status: CatalogStatus;
  query: string;
  setQuery: (q: string) => void;
  onOpen: (p: Piece) => void;
  goto: (id: string) => void;
}) {
  const images = useSolutionImages();

  return (
    <section id="soluciones" className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_85%_0%,#152436,transparent_65%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="shell">
        <Reveal>
          <Eyebrow light>Soluciones</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="h-section max-w-4xl">Soluciones para darle identidad a tus productos</h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-steel-2">
            No vendemos productos sueltos: desarrollamos los componentes que hacen que una prenda o
            elemento se sienta de marca. Esto es lo que podemos resolver por ti.
          </p>
        </Reveal>
      </div>

      {/*
        Un solo bloque, dividido en 4 — no 4 tarjetas sueltas, y a
        propósito por fuera de `.shell`: cubre todo el ancho de la
        pantalla en vez de quedar encerrado en el contenido. Los
        divisores son la línea de 1px que deja ver el fondo `bg-white/10`
        por debajo. Cada sección se ilumina al pasar el mouse: barra superior,
        resplandor detrás del ícono, zoom en la foto.
      */}
      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden border-y border-white/10 bg-white/10 sm:grid-cols-2">
        {SOLUTIONS.map((s, i) => (
          <Reveal key={s.key} delay={180 + i * 90}>
            <div className="group relative flex h-full flex-col overflow-hidden bg-carbon transition-colors duration-500 hover:bg-carbon-2 lg:flex-row">
              {/* Barra de acento: se desliza al entrar el mouse. */}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-accent-hi transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100"
              />

              {/* Foto — editable por el dueño desde el panel. Si todavía
                  no subió ninguna, se ve un respaldo con el ícono, nunca
                  un hueco vacío. */}
              <div className="spotlight tex-neutral relative h-52 shrink-0 overflow-hidden lg:h-auto lg:w-[40%]">
                {images[s.key] ? (
                  <img
                    src={images[s.key]}
                    alt={s.title}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover brightness-95 transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.08] group-hover:brightness-100"
                  />
                ) : (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <s.icon
                      size={44}
                      className="text-accent-hi/70 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                )}
              </div>

              <div className="relative flex flex-1 flex-col p-7 lg:p-8">
                {/* Resplandor detrás del ícono, sólo visible en hover. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-8 -top-8 h-36 w-36 rounded-full bg-accent-hi/0 blur-2xl transition-colors duration-500 group-hover:bg-accent-hi/20"
                />
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-accent-hi/20 bg-accent-hi/10 text-accent-hi transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-hi group-hover:text-ink group-hover:shadow-[0_10px_24px_-8px_rgba(79,179,255,.55)]">
                  <s.icon size={20} />
                </span>
                <h3 className="relative mt-5 font-display text-[20px] font-bold tracking-tight text-white">
                  {s.title}
                </h3>
                <p className="relative mt-2.5 flex-1 text-[15px] leading-relaxed text-steel-2">
                  {s.desc}
                </p>
                <a
                  href={waHrefSolution(s.title)}
                  target="_blank"
                  rel="noreferrer"
                  className="relative mt-6 inline-flex items-center gap-1.5 font-display text-[13.5px] font-semibold text-accent-hi transition-colors hover:text-white"
                >
                  Cotizar esta solución
                  <ArrowUpRight size={15} className="arrow-go" />
                </a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Gallery
        pieces={pieces}
        total={total}
        status={status}
        query={query}
        setQuery={setQuery}
        onOpen={onOpen}
        goto={goto}
      />
    </section>
  );
}

/* ============================== GALERÍA ============================== */

function Gallery({
  pieces,
  total,
  status,
  query,
  setQuery,
  onOpen,
}: {
  pieces: Piece[];
  total: number;
  status: CatalogStatus;
  query: string;
  setQuery: (q: string) => void;
  onOpen: (p: Piece) => void;
  goto: (id: string) => void;
}) {
  return (
    <div className="shell mt-20 lg:mt-28">
      <div className="flex flex-wrap items-end justify-between gap-5 pb-8 pt-16">
        <Reveal>
          <h3 className="font-display text-[26px] font-bold tracking-tight text-white lg:text-[30px]">
            ¿Tienes una idea? La hacemos realidad.
          </h3>
        </Reveal>
        <Reveal delay={100}>
          <p className="max-w-md text-[15px] leading-relaxed text-steel-2">
            Una muestra del trabajo que sale de nuestra planta. Toca cualquier pieza para verla en
            grande.
          </p>
        </Reveal>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.16em] text-steel-2">
          {status === "loading" ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Cargando…
            </>
          ) : (
            <>
              {pieces.length} {pieces.length === 1 ? "pieza" : "piezas"}
            </>
          )}
        </p>

        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-2"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en la galería…"
            aria-label="Buscar en la galería"
            className="w-full rounded-full border border-white/15 bg-carbon py-2.5 pl-10 pr-9 text-[14px] text-white transition-all duration-300 placeholder:text-steel-2/60 focus:border-accent-hi focus:outline-none focus:ring-4 focus:ring-accent-hi/15"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-steel-2 hover:bg-white/10 hover:text-white"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pieces.map((p, i) => (
          <Reveal key={p.id} delay={Math.min(i, 5) * 70}>
            <article className="group lift flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-carbon">
              <button
                onClick={() => onOpen(p)}
                className="relative block h-56 w-full overflow-hidden"
                aria-label={`Ver ${p.name} en grande`}
              >
                <PieceVisual piece={p} className="h-full w-full" />
              </button>

              <div className="flex flex-1 flex-col p-5">
                <h4 className="font-display text-[17px] font-semibold leading-snug text-white">
                  {p.name}
                </h4>

                {p.desc && (
                  <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-steel-2">
                    {p.desc}
                  </p>
                )}

                <div className="mt-5 flex gap-2 pt-0">
                  <button
                    onClick={() => onOpen(p)}
                    className="flex-1 rounded-xl border border-white/15 py-2.5 font-display text-[13.5px] font-semibold text-white transition-all duration-300 hover:border-white/35 hover:bg-white/10"
                  >
                    Ver en grande
                  </button>
                  <a
                    href={waHref(p)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Consultar ${p.name} por WhatsApp`}
                    className="grid w-11 place-items-center rounded-xl bg-wa text-white transition-all duration-300 hover:brightness-110"
                  >
                    <IconWA size={17} />
                  </a>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {status !== "loading" && pieces.length === 0 && (
        <div className="rounded-3xl border border-dashed border-white/15 bg-carbon py-20 text-center">
          {status === "error" ? (
            <TriangleAlert size={30} className="mx-auto text-danger/70" />
          ) : (
            <Images size={30} className="mx-auto text-steel-2/60" />
          )}
          <p className="mt-4 font-display text-lg font-semibold text-white">
            {status === "error"
              ? "No pudimos cargar la galería"
              : query
                ? "Sin resultados"
                : total === 0
                  ? "Todavía no hay piezas acá"
                  : "Sin resultados"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-[14.5px] text-steel-2">
            {status === "error"
              ? "Puede ser una falla momentánea o un bloqueador de anuncios. Escríbenos por WhatsApp y te mandamos las fotos de lo que estés buscando."
              : query
                ? "No encontramos nada con esa búsqueda. Prueba con otra palabra o contáctanos: fabricamos a medida."
                : "Estamos cargando las fotos. Mientras tanto, escríbenos y te mostramos lo que tenemos."}
          </p>
          <Btn variant="wa" href={waHref()} className="mt-6">
            <IconWA size={18} /> Consultar por WhatsApp
          </Btn>
        </div>
      )}
    </div>
  );
}

/* ============================== NOSOTROS ============================== */

const TILES = [
  [Factory, "Planta propia en SJL", "Producción y control bajo el mismo techo"],
  [Layers, "Múltiples técnicas", "Distintos procesos, un solo proveedor"],
  [Ruler, "Piezas a medida", "Tu diseño, tu color, tu medida"],
  [ShieldCheck, "Control de calidad", "Revisión pieza por pieza antes de despachar"],
] as const;

function About() {
  return (
    <section id="nosotros" className="relative isolate overflow-hidden bg-ink py-20 text-white lg:py-28">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_15%_0%,#152436,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_95%_90%,rgba(79,179,255,.12),transparent_70%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="shell grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow light>Nosotros</Eyebrow>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="h-section">Más de 35 años haciendo el detalle que la ropa necesita.</h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-6 text-[16.5px] leading-relaxed text-steel-2">
              Diseñamos y fabricamos los componentes que le dan identidad a las prendas y productos
              de nuestros clientes. Cada proyecto empieza con una idea, un logo o una referencia, y
              termina en una pieza física, aprobada y lista para producir en el volumen que
              necesites.
            </p>
          </Reveal>
          <Reveal delay={210}>
            <p className="mt-4 text-[15.5px] leading-relaxed text-steel-2/80">
              Un equipo de profesionales asesora cada proyecto, con el respaldo de haber trabajado
              para marcas reconocidas del rubro.
            </p>
          </Reveal>

          <Reveal delay={280}>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[
                { n: 35, suffix: "+", l: "años en el mercado" },
                { n: 100, suffix: "%", l: "fabricación propia" },
                { n: 100, suffix: "%", l: "a tu medida" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-display text-[38px] font-bold leading-none tracking-tight text-accent-hi">
                    <CountUp to={s.n} />
                    {s.suffix}
                  </dt>
                  <dd className="mt-2 text-[13px] leading-snug text-steel-2">{s.l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {TILES.map(([Ic, t, d], i) => (
            <Reveal key={t} delay={i * 100}>
              <div className="glass-dark group flex h-full min-h-44 flex-col justify-between rounded-3xl p-6 transition-colors duration-400 hover:bg-white/10">
                <Ic size={25} className="text-accent-hi transition-transform duration-400 group-hover:scale-110" />
                <div className="mt-6">
                  <p className="font-display text-[15.5px] font-semibold leading-snug">{t}</p>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-steel-2">{d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== CTA BAND ============================== */

function CtaBand({ goto }: { goto: (id: string) => void }) {
  return (
    <section className="bg-ink py-16 lg:py-20">
      <div className="shell">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[32px] border border-carbon/10 bg-carbon px-7 py-12 text-white lg:px-14 lg:py-16">
            <div className="absolute inset-0 -z-10" aria-hidden="true">
              <div className="absolute inset-0 bg-[radial-gradient(70%_100%_at_85%_20%,rgba(79,179,255,.28),transparent_65%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(60%_100%_at_5%_100%,rgba(22,104,199,.35),transparent_65%)]" />
              <div className="grain absolute inset-0" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-9">
              <div className="max-w-xl">
                <p className="label-mono text-accent-hi">¿Tienes un logo?</p>
                <h2 className="h-section mt-4">Nosotros ponemos el molde.</h2>
                <p className="mt-4 text-[16px] leading-relaxed text-steel-2">
                  Mándanos tu diseño y te devolvemos una muestra física para que la tengas en la
                  mano antes de decidir. Sin compromiso.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Btn variant="wa" href={waHref()}>
                  <IconWA size={18} /> Enviar mi logo
                </Btn>
                <Btn variant="ghost" onClick={() => goto("soluciones")}>
                  Ver soluciones <ArrowRight size={18} />
                </Btn>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================== CONTACTO ============================== */

function Contact() {
  return (
    <section
      id="contacto"
      className="relative isolate overflow-hidden border-t border-white/10 bg-ink py-20 text-white lg:py-28"
    >
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_15%_100%,#152436,transparent_65%)]" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="shell">
        <Reveal>
          <Eyebrow light>Contacto</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="h-section mb-12 max-w-3xl">Cuéntanos qué necesitas</h2>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <ContactForm />
          </Reveal>

          <Reveal delay={120} className="lg:col-span-2">
            <div className="flex h-full flex-col gap-4">
              <a
                href={waHref()}
                target="_blank"
                rel="noreferrer"
                className="lift group flex items-center gap-4 rounded-3xl bg-wa p-6 text-white shadow-card"
              >
                <IconWA size={30} />
                <span className="min-w-0">
                  <span className="block font-display text-[17.5px] font-bold">
                    Escríbenos por WhatsApp
                  </span>
                  <span className="block text-[13.5px] opacity-90">
                    Es la vía más rápida: respondemos en el día
                  </span>
                </span>
                <ArrowUpRight size={20} className="arrow-go ml-auto shrink-0" />
              </a>

              {(
                [
                  [MapPin, "Dirección", CONTACT.address, null],
                  [Phone, "Teléfono", CONTACT.phone, CONTACT.phoneHref],
                  [Mail, "Email", CONTACT.email, `mailto:${CONTACT.email}`],
                  [Clock, "Horario", CONTACT.hours, null],
                ] as const
              ).map(([Ic, t, d, href]) => {
                const inner = (
                  <>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent-hi/20 bg-accent-hi/10 text-accent-hi transition-colors duration-300 group-hover:bg-accent-hi group-hover:text-ink">
                      <Ic size={19} />
                    </span>
                    <span className="min-w-0">
                      <span className="label-mono block text-steel-2">{t}</span>
                      <span className="mt-1 block font-medium leading-snug text-white">{d}</span>
                    </span>
                  </>
                );
                return href ? (
                  <a
                    key={t}
                    href={href}
                    className="group flex items-start gap-4 rounded-3xl border border-white/10 bg-carbon p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-hi/30 hover:bg-carbon-2"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={t} className="group flex items-start gap-4 rounded-3xl border border-white/10 bg-carbon p-5">
                    {inner}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const EMPTY_FORM: ContactData = {
  nombre: "",
  correo: "",
  telefono: "",
  empresa: "",
  ruc: "",
  producto: SOLUTIONS[0].title,
  mensaje: "",
};

function ContactForm() {
  const [f, setF] = useState(EMPTY_FORM);
  const [ok, setOk] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  /** Campo trampa: los bots lo completan, las personas no lo ven. */
  const [honeypot, setHoneypot] = useState("");
  const [captcha, setCaptcha] = useState("");
  /** Momento en que el formulario quedó visible, para la trampa de tiempo. */
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = (k: keyof ContactData) => (e: { target: { value: string } }) => {
    setError("");
    setF((s) => ({ ...s, [k]: e.target.value }));
  };

  const valid = validate(f) === null && (!turnstileEnabled || Boolean(captcha));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await sendContact(f, { honeypot, startedAt: startedAt.current, captcha });
      if (res.mode === "whatsapp") window.open(res.url, "_blank", "noopener,noreferrer");
      setOk(true);
    } catch (err) {
      setError(
        err instanceof ContactError ? err.message : "No pudimos enviar el mensaje. Probá por WhatsApp.",
      );
    } finally {
      setSending(false);
    }
  };

  if (ok) {
    return (
      <div className="grid h-full place-items-center rounded-3xl border border-white/10 bg-carbon p-10 text-center">
        <div>
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-wa text-white">
            <Check size={30} />
          </span>
          <h3 className="mt-5 font-display text-[23px] font-bold text-white">
            ¡Listo, {f.nombre.trim().split(" ")[0]}!
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-steel-2">
            {contactEnabled
              ? "Recibimos tu solicitud. Te contactamos a la brevedad con muestras y cotización."
              : "Te abrimos WhatsApp con tu mensaje ya escrito. Presiona enviar y te respondemos en el día."}
          </p>
          <button
            onClick={() => {
              setOk(false);
              setF(EMPTY_FORM);
              setCaptcha("");
              startedAt.current = Date.now();
            }}
            className="mt-6 rounded-full border border-white/15 px-6 py-2.5 font-display font-semibold text-white transition-colors hover:bg-white/10"
          >
            Enviar otro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="rounded-3xl border border-white/10 bg-carbon p-6 md:p-8" onSubmit={submit} noValidate>
      <h3 className="font-display text-[22px] font-bold tracking-tight text-white">
        Pide tu cotización
      </h3>
      <p className="mt-1.5 text-[14.5px] text-steel-2">
        {contactEnabled
          ? "Te respondemos con muestras, plazos y precio por millar."
          : "Completa tus datos y te abrimos WhatsApp con el mensaje listo."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre completo" req value={f.nombre} onChange={set("nombre")} placeholder="Tu nombre" autoComplete="name" maxLength={LIMITS.nombre} />
        <Field label="Correo" req type="email" value={f.correo} onChange={set("correo")} placeholder="tucorreo@empresa.com" autoComplete="email" maxLength={LIMITS.correo} />
        <Field label="Teléfono" req value={f.telefono} onChange={set("telefono")} placeholder="+51 9…" autoComplete="tel" maxLength={LIMITS.telefono} />
        <Field label="Empresa" value={f.empresa} onChange={set("empresa")} placeholder="Nombre de tu empresa" autoComplete="organization" maxLength={LIMITS.empresa} />
        <Field label="RUC" value={f.ruc} onChange={set("ruc")} placeholder="N° de RUC" inputMode="numeric" maxLength={LIMITS.ruc} />
        <Field label="Qué estás buscando" as="select" value={f.producto} onChange={set("producto")}>
          {[...SOLUTIONS.map((s) => s.title), "Otro"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </Field>
      </div>

      <Field
        className="mt-4"
        label="Mensaje"
        as="textarea"
        rows={3}
        value={f.mensaje}
        onChange={set("mensaje")}
        placeholder="Cantidad aproximada, material, si ya tienes el logo…"
        maxLength={LIMITS.mensaje}
      />

      {/* Campo trampa: invisible para personas, irresistible para bots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label>
          No completar este campo
          <input
            type="text"
            name="botcheck"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <Turnstile onToken={setCaptcha} />

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-[13.5px] font-medium text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Btn variant="accent" type="submit" disabled={!valid || sending}>
          {sending ? (
            <>
              <Loader2 size={17} className="animate-spin" /> Enviando…
            </>
          ) : (
            <>
              {contactEnabled ? "Enviar solicitud" : "Continuar por WhatsApp"}
              {contactEnabled ? <Send size={17} /> : <IconWA size={17} />}
            </>
          )}
        </Btn>
        <p className="text-[12.5px] text-steel-2">Sin compromiso. No compartimos tus datos.</p>
      </div>
    </form>
  );
}

/* =============================== FOOTER =============================== */

function Footer({ goto }: { goto: (id: string) => void }) {
  return (
    <footer className="relative isolate overflow-hidden bg-ink text-white">
      <div className="grain absolute inset-0 -z-10" aria-hidden="true" />
      <div className="shell grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-steel-2">
            Diseñamos y fabricamos los detalles que le dan identidad a marcas de la industria
            textil, promocional y del calzado. Fabricación propia en Lima, Perú.
          </p>
          <div className="mt-6 flex gap-2">
            {["FB", "IG", "IN"].map((t) => (
              <span
                key={t}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 font-mono text-[11px] text-steel-2 transition-colors duration-300 hover:border-accent-hi/40 hover:bg-accent-hi/15 hover:text-accent-hi"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="label-mono text-accent-hi">Navegar</p>
          <div className="mt-4 flex flex-col items-start gap-2.5">
            {NAV.map(([label, id]) => (
              <button
                key={id}
                onClick={() => goto(id)}
                className="text-[14.5px] text-steel-2 transition-colors hover:text-white"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="label-mono text-accent-hi">Soluciones</p>
          <div className="mt-4 flex flex-col items-start gap-2.5">
            {SOLUTIONS.map((s) => (
              <button
                key={s.title}
                onClick={() => goto("soluciones")}
                className="text-[14.5px] text-steel-2 transition-colors hover:text-white"
              >
                {s.title}
              </button>
            ))}
          </div>
          <p className="label-mono mt-8 text-accent-hi">Contacto</p>
          <a
            href={CONTACT.phoneHref}
            className="mt-4 block text-[14.5px] text-steel-2 transition-colors hover:text-white"
          >
            {CONTACT.phone}
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="mt-2 block text-[14.5px] text-steel-2 transition-colors hover:text-white"
          >
            {CONTACT.email}
          </a>
        </div>
      </div>

      <div className="shell flex flex-wrap items-center justify-between gap-3 border-t border-white/8 py-5">
        <p className="text-[12.5px] text-steel-2/70">
          © {new Date().getFullYear()} Manufacturas Poly S.A.C.
        </p>
        <p className="text-[12.5px] text-steel-2/70">San Juan de Lurigancho, Lima</p>
      </div>
    </footer>
  );
}

/* ============================ MODAL DE PIEZA =========================== */

function PieceModal({ piece, onClose }: { piece: Piece; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="anim-fade fixed inset-0 z-50 flex justify-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={piece.name}
    >
      <div
        className="anim-pop m-auto w-full max-w-3xl overflow-hidden rounded-[28px] bg-carbon shadow-deep"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          <div className="group relative">
            <PieceVisual piece={piece} full className="h-64 w-full md:h-full md:min-h-[420px]" padding="14%" />
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ink/70 text-white backdrop-blur transition-colors hover:bg-ink/90 md:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-start justify-end">
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="hidden rounded-lg p-1.5 text-steel-2 transition-colors hover:bg-white/10 hover:text-white md:block"
              >
                <X size={20} />
              </button>
            </div>

            <h3 className="font-display text-[27px] font-bold leading-tight tracking-tight text-white">
              {piece.name}
            </h3>

            {piece.desc && (
              <p className="mt-4 text-[15px] leading-relaxed text-steel-2">{piece.desc}</p>
            )}

            <Btn variant="wa" href={waHref(piece)} className="mt-6 w-full">
              <IconWA size={19} /> Consultar por WhatsApp
            </Btn>
            <p className="mt-2.5 text-center text-[12px] text-steel-2">
              Sin precios en línea: cada pedido se cotiza según diseño y volumen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
