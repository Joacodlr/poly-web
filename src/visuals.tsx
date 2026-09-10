import { useId, useState } from "react";
import type { CSSProperties, ReactNode, SVGProps } from "react";
import type { Piece, Shape } from "./data";
import { shade } from "./lib/color";

/** Tono por defecto de la pieza genérica: el celeste de marca. */
const GENERIC_TINT = "#1668C7";

/* ------------------------------------------------------------------ *
 *  Arte vectorial de las piezas.
 *  Todo se dibuja en el navegador: nunca hay una imagen rota y el
 *  catálogo pesa lo mismo con 14 productos que con 400.
 * ------------------------------------------------------------------ */

const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

/* ------------------------------ paletas ----------------------------- */

type Tone = { hi: string; mid: string; low: string; deep: string; ink: string };

/** Construye una paleta de metal a partir de un color cualquiera. */
const toneFromTint = (tint: string): Tone => ({
  hi: shade(tint, 0.55),
  mid: tint,
  low: shade(tint, -0.3),
  deep: shade(tint, -0.65),
  ink: shade(tint, -0.72),
});

/** El acabado del producto define el metal con el que se dibuja. */
function metalTone(finish = ""): Tone {
  const f = finish.toLowerCase();
  if (f.includes("níquel") || f.includes("niquel") || f.includes("plata"))
    return { hi: "#FBFDFF", mid: "#C6D0DC", low: "#7B8A9C", deep: "#39434F", ink: "#3F4A58" };
  if (f.includes("cobre"))
    return { hi: "#FBD5B4", mid: "#C87B4A", low: "#8A4E28", deep: "#3F2110", ink: "#57301A" };
  return { hi: "#F6E3B6", mid: "#D5AC6A", low: "#8C6A32", deep: "#3B2A10", ink: "#4A3416" };
}

const RUBBER_TONE = { face: "#E4572E", edge: "#A93518", ink: "#FFF3EE" };
const LEATHER_TONE = { face: "#B87C46", edge: "#6E4526", ink: "#43290F" };

/* --------------------------- primitivas SVG -------------------------- */

/** Texto grabado: una copia clara desplazada crea el relieve. */
function Engrave({
  children,
  fill,
  light = "rgba(255,255,255,.4)",
  dy = 0.9,
  ...rest
}: {
  children: ReactNode;
  fill: string;
  light?: string;
  dy?: number;
} & SVGProps<SVGTextElement>) {
  return (
    <g>
      <text {...rest} y={Number(rest.y ?? 0) + dy} fill={light} aria-hidden="true">
        {children}
      </text>
      <text {...rest} fill={fill}>
        {children}
      </text>
    </g>
  );
}

/** Moleteado: los dientes del canto de un botón metálico. */
function Knurl({ cx, cy, r, teeth = 60, len = 5, color }: {
  cx: number; cy: number; r: number; teeth?: number; len?: number; color: string;
}) {
  return (
    <g stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.55">
      {Array.from({ length: teeth }, (_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        return (
          <line
            key={i}
            x1={cx + c * r}
            y1={cy + s * r}
            x2={cx + c * (r - len)}
            y2={cy + s * (r - len)}
          />
        );
      })}
    </g>
  );
}

/** Costura perimetral punteada. */
function Stitch(props: SVGProps<SVGRectElement> & { color?: string }) {
  const { color = "rgba(255,255,255,.72)", ...rest } = props;
  return (
    <rect
      {...rest}
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeDasharray="5 4.5"
      strokeLinecap="round"
    />
  );
}

/* ------------------------------ formas ------------------------------ */

type ArtProps = { id: string; tone: Tone; finish: string };

/** Botón de jean: cabeza abombada, canto moleteado, marca grabada. */
function ButtonJean({ id, tone }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}f`} cx="36%" cy="28%" r="78%">
          <stop offset="0%" stopColor={tone.hi} />
          <stop offset="38%" stopColor={tone.mid} />
          <stop offset="76%" stopColor={tone.low} />
          <stop offset="100%" stopColor={tone.deep} />
        </radialGradient>
        <radialGradient id={`${id}r`} cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor={tone.low} />
          <stop offset="100%" stopColor={tone.deep} />
        </radialGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".55" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <path id={`${id}t`} d="M100,100 m-64,0 a64,64 0 1,1 128,0" fill="none" />
        <path id={`${id}b`} d="M100,100 m62,0 a62,62 0 1,1 -124,0" fill="none" />
      </defs>

      <ellipse cx="100" cy="176" rx="72" ry="10" fill="rgba(0,0,0,.35)" />
      <circle cx="100" cy="100" r="92" fill={`url(#${id}r)`} />
      <Knurl cx={100} cy={100} r={90} teeth={72} len={7} color={tone.hi} />
      <circle cx="100" cy="100" r="84" fill={`url(#${id}f)`} />
      <circle cx="100" cy="100" r="84" fill="none" stroke={tone.deep} strokeOpacity=".4" strokeWidth="2" />
      <circle cx="100" cy="100" r="60" fill="none" stroke={tone.deep} strokeOpacity=".35" strokeWidth="3" />
      <circle cx="100" cy="100" r="56" fill="none" stroke={tone.hi} strokeOpacity=".35" strokeWidth="1.2" />

      <text fontFamily={MONO} fontSize="12.5" fontWeight="700" letterSpacing="5.5" fill={tone.ink} opacity=".9">
        <textPath href={`#${id}t`} startOffset="50%" textAnchor="middle">
          MANUFACTURAS · POLY
        </textPath>
      </text>
      <text fontFamily={MONO} fontSize="9.5" letterSpacing="6" fill={tone.ink} opacity=".75">
        <textPath href={`#${id}b`} startOffset="50%" textAnchor="middle">
          LIMA · PERÚ
        </textPath>
      </text>

      <Engrave
        x="100"
        y="108"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="700"
        fontSize="30"
        letterSpacing="1"
        fill={tone.ink}
      >
        POLY
      </Engrave>

      <circle cx="100" cy="100" r="84" fill={`url(#${id}s)`} />
    </>
  );
}

/** Botón cosido: cara plana con 3 o 4 huecos y garganta rebajada. */
function ButtonSew({ id, tone, finish }: ArtProps) {
  const three = finish.toLowerCase().includes("mate");
  const holes: [number, number][] = three
    ? [[100, 76], [78, 114], [122, 114]]
    : [[82, 82], [118, 82], [82, 118], [118, 118]];
  return (
    <>
      <defs>
        <radialGradient id={`${id}f`} cx="34%" cy="26%" r="80%">
          <stop offset="0%" stopColor={tone.hi} />
          <stop offset="45%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.low} />
        </radialGradient>
        <radialGradient id={`${id}h`} cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor={tone.deep} />
          <stop offset="100%" stopColor="#000" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="174" rx="70" ry="9" fill="rgba(0,0,0,.35)" />
      <circle cx="100" cy="100" r="88" fill={tone.deep} />
      <circle cx="100" cy="100" r="85" fill={`url(#${id}f)`} />
      <circle cx="100" cy="100" r="66" fill="none" stroke={tone.deep} strokeOpacity=".38" strokeWidth="6" />
      <circle cx="100" cy="100" r="62" fill="none" stroke={tone.hi} strokeOpacity=".3" strokeWidth="1.4" />

      {holes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="10.5" fill={`url(#${id}h)`} />
          <circle cx={x} cy={y} r="10.5" fill="none" stroke={tone.hi} strokeOpacity=".45" strokeWidth="1.4" />
        </g>
      ))}

      <path
        d="M100,100 m-85,0 a85,85 0 0,1 42,-73"
        fill="none"
        stroke="#fff"
        strokeOpacity=".5"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </>
  );
}

/** Botón de pie con cabeza piramidal facetada. */
function ButtonShank({ id, tone }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}b`} cx="40%" cy="32%" r="72%">
          <stop offset="0%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.deep} />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="176" rx="66" ry="9" fill="rgba(0,0,0,.35)" />
      <circle cx="100" cy="100" r="86" fill={`url(#${id}b)`} />
      <Knurl cx={100} cy={100} r={84} teeth={54} len={6} color={tone.hi} />

      {/* Cuatro caras de la pirámide, cada una con su propia luz */}
      <path d="M100 30 L170 100 L100 100 Z" fill={tone.hi} />
      <path d="M170 100 L100 170 L100 100 Z" fill={tone.low} />
      <path d="M100 170 L30 100 L100 100 Z" fill={tone.deep} />
      <path d="M30 100 L100 30 L100 100 Z" fill={tone.mid} />

      <path
        d="M100 30 L170 100 L100 170 L30 100 Z"
        fill="none"
        stroke={tone.deep}
        strokeOpacity=".55"
        strokeWidth="2.5"
      />
      <circle cx="100" cy="100" r="4" fill={tone.hi} opacity=".9" />
    </>
  );
}

/** Jalador de cierre: cuerpo grabado + anilla. */
function PullerMetal({ id, tone }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor={tone.hi} />
          <stop offset="42%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.low} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="178" rx="52" ry="7" fill="rgba(0,0,0,.35)" />

      {/* Anilla */}
      <circle cx="100" cy="42" r="20" fill="none" stroke={`url(#${id}f)`} strokeWidth="9" />
      <circle cx="100" cy="42" r="20" fill="none" stroke={tone.deep} strokeOpacity=".4" strokeWidth="1.5" />

      {/* Cuerpo */}
      <rect x="62" y="58" width="76" height="104" rx="16" fill={tone.deep} />
      <rect x="64" y="60" width="72" height="100" rx="14" fill={`url(#${id}f)`} />
      <rect
        x="74"
        y="70"
        width="52"
        height="80"
        rx="9"
        fill="none"
        stroke={tone.deep}
        strokeOpacity=".35"
        strokeWidth="2.5"
      />
      <Engrave
        x="100"
        y="118"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="700"
        fontSize="22"
        letterSpacing="1"
        fill={tone.ink}
      >
        POLY
      </Engrave>
      <path
        d="M70 66 L70 154"
        stroke="#fff"
        strokeOpacity=".45"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </>
  );
}

/** Placa con logotipo y remaches. */
function Plate({ id, tone }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={tone.hi} />
          <stop offset="45%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.low} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="146" rx="82" ry="9" fill="rgba(0,0,0,.35)" />
      <rect x="14" y="62" width="172" height="72" rx="18" fill={tone.deep} />
      <rect x="17" y="65" width="166" height="66" rx="16" fill={`url(#${id}f)`} />
      <rect
        x="28"
        y="75"
        width="144"
        height="46"
        rx="10"
        fill="none"
        stroke={tone.deep}
        strokeOpacity=".32"
        strokeWidth="2"
      />
      <Engrave
        x="100"
        y="106"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="700"
        fontSize="27"
        letterSpacing="3"
        fill={tone.ink}
      >
        POLY
      </Engrave>
      {[34, 166].map((x) => (
        <circle key={x} cx={x} cy="98" r="5" fill={tone.deep} opacity=".6" />
      ))}
      <path d="M24 70 L176 70" stroke="#fff" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

/** Remache de refuerzo: domo con anillos concéntricos. */
function Rivet({ id, tone }: ArtProps) {
  return (
    <>
      <defs>
        <radialGradient id={`${id}f`} cx="35%" cy="28%" r="75%">
          <stop offset="0%" stopColor={tone.hi} />
          <stop offset="40%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.deep} />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="162" rx="58" ry="9" fill="rgba(0,0,0,.35)" />
      <circle cx="100" cy="100" r="74" fill={tone.deep} opacity=".85" />
      <circle cx="100" cy="100" r="64" fill={`url(#${id}f)`} />
      {[46, 32, 18].map((r, i) => (
        <circle
          key={r}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={i % 2 ? tone.hi : tone.deep}
          strokeOpacity=".35"
          strokeWidth="2"
        />
      ))}
      <circle cx="100" cy="100" r="8" fill={tone.deep} opacity=".7" />
      <path
        d="M100,100 m-64,0 a64,64 0 0,1 34,-56"
        fill="none"
        stroke="#fff"
        strokeOpacity=".5"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </>
  );
}

/** Parche de goma inyectada, alto relieve y borde biselado. */
function Patch({ id }: ArtProps) {
  const t = RUBBER_TONE;
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#F5794F" />
          <stop offset="55%" stopColor={t.face} />
          <stop offset="100%" stopColor={t.edge} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="158" rx="74" ry="10" fill="rgba(0,0,0,.4)" />
      <rect x="22" y="44" width="156" height="112" rx="26" fill={t.edge} />
      <rect x="26" y="46" width="148" height="104" rx="23" fill={`url(#${id}f)`} />
      <Stitch x="38" y="58" width="124" height="80" rx="16" color="rgba(255,255,255,.55)" />
      <Engrave
        x="100"
        y="100"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="700"
        fontSize="30"
        letterSpacing="2"
        fill={t.ink}
        light="rgba(0,0,0,.28)"
        dy={2}
      >
        POLY
      </Engrave>
      <text
        x="100"
        y="122"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="10"
        letterSpacing="4"
        fill="rgba(255,255,255,.72)"
      >
        LIMA · PERÚ
      </text>
      <rect x="26" y="46" width="148" height="34" rx="23" fill="#fff" opacity=".14" />
    </>
  );
}

/** Etiqueta de goma cosible, texto en bajo relieve. */
function LabelRubber({ id }: ArtProps) {
  const t = RUBBER_TONE;
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#F5794F" />
          <stop offset="100%" stopColor={t.edge} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="140" rx="80" ry="8" fill="rgba(0,0,0,.4)" />
      <rect x="12" y="72" width="176" height="60" rx="30" fill={t.edge} />
      <rect x="15" y="74" width="170" height="54" rx="27" fill={`url(#${id}f)`} />
      <Engrave
        x="100"
        y="108"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="700"
        fontSize="26"
        letterSpacing="4"
        fill="rgba(0,0,0,.38)"
        light="rgba(255,255,255,.4)"
        dy={-1.6}
      >
        POLY
      </Engrave>
      <rect x="15" y="74" width="170" height="18" rx="9" fill="#fff" opacity=".16" />
    </>
  );
}

/** Botón de goma mate, dos huecos. */
function ButtonRubber({ id }: ArtProps) {
  const t = RUBBER_TONE;
  return (
    <>
      <defs>
        <radialGradient id={`${id}f`} cx="36%" cy="28%" r="76%">
          <stop offset="0%" stopColor="#FA8B60" />
          <stop offset="55%" stopColor={t.face} />
          <stop offset="100%" stopColor={t.edge} />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="172" rx="66" ry="9" fill="rgba(0,0,0,.4)" />
      <circle cx="100" cy="100" r="84" fill={t.edge} />
      <circle cx="100" cy="100" r="80" fill={`url(#${id}f)`} />
      <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="5" />
      {[[80, 100], [120, 100]].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="11" fill="rgba(0,0,0,.45)" />
          <circle cx={x} cy={y} r="11" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.5" />
        </g>
      ))}
      <path
        d="M100,100 m-80,0 a80,80 0 0,1 40,-69"
        fill="none"
        stroke="#fff"
        strokeOpacity=".38"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </>
  );
}

/** Puller de PVC con anilla metálica. */
function PullerPlastic({ id, tone }: ArtProps) {
  const t = RUBBER_TONE;
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#F5794F" />
          <stop offset="100%" stopColor={t.edge} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="180" rx="50" ry="7" fill="rgba(0,0,0,.4)" />
      <circle cx="100" cy="40" r="18" fill="none" stroke={tone.mid} strokeWidth="8" />
      <circle cx="100" cy="40" r="18" fill="none" stroke={tone.deep} strokeOpacity=".45" strokeWidth="1.4" />

      <path
        d="M100 56 C142 56 152 92 152 118 C152 150 128 168 100 168 C72 168 48 150 48 118 C48 92 58 56 100 56 Z"
        fill={t.edge}
      />
      <path
        d="M100 60 C138 60 148 94 148 118 C148 147 126 164 100 164 C74 164 52 147 52 118 C52 94 62 60 100 60 Z"
        fill={`url(#${id}f)`}
      />
      <Engrave
        x="100"
        y="128"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="700"
        fontSize="24"
        letterSpacing="1"
        fill="rgba(0,0,0,.35)"
        light="rgba(255,255,255,.4)"
        dy={-1.5}
      >
        POLY
      </Engrave>
      <ellipse cx="86" cy="82" rx="24" ry="14" fill="#fff" opacity=".2" transform="rotate(-22 86 82)" />
    </>
  );
}

/** Etiqueta de cuero grabada al fuego, con costura. */
function LabelLeather({ id }: ArtProps) {
  const t = LEATHER_TONE;
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#D0965C" />
          <stop offset="60%" stopColor={t.face} />
          <stop offset="100%" stopColor={t.edge} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="156" rx="76" ry="9" fill="rgba(0,0,0,.42)" />
      <rect x="22" y="52" width="156" height="100" rx="12" fill={t.edge} />
      <rect x="25" y="54" width="150" height="94" rx="10" fill={`url(#${id}f)`} />
      <Stitch x="37" y="66" width="126" height="70" rx="6" color="rgba(255,240,220,.7)" />
      <Engrave
        x="100"
        y="104"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="700"
        fontSize="28"
        letterSpacing="2"
        fill={t.ink}
        light="rgba(255,255,255,.32)"
        dy={-1.4}
      >
        POLY
      </Engrave>
      <text
        x="100"
        y="124"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="9"
        letterSpacing="4"
        fill={t.ink}
        opacity=".65"
      >
        GENUINE LEATHER
      </text>
    </>
  );
}

/** Aplique troquelado en cuero, forma de escudo. */
function Applique({ id }: ArtProps) {
  const t = LEATHER_TONE;
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#D0965C" />
          <stop offset="100%" stopColor={t.edge} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="172" rx="60" ry="8" fill="rgba(0,0,0,.42)" />
      <path d="M100 24 L172 58 L172 116 C172 148 138 168 100 178 C62 168 28 148 28 116 L28 58 Z" fill={t.edge} />
      <path
        d="M100 29 L167 61 L167 115 C167 145 136 163 100 172 C64 163 33 145 33 115 L33 61 Z"
        fill={`url(#${id}f)`}
      />
      <path
        d="M100 42 L155 68 L155 113 C155 137 130 152 100 160 C70 152 45 137 45 113 L45 68 Z"
        fill="none"
        stroke="rgba(255,240,220,.6)"
        strokeWidth="1.6"
        strokeDasharray="5 4.5"
        strokeLinecap="round"
      />
      <Engrave
        x="100"
        y="112"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="700"
        fontSize="26"
        letterSpacing="1"
        fill={t.ink}
        light="rgba(255,255,255,.3)"
        dy={-1.4}
      >
        POLY
      </Engrave>
    </>
  );
}

/** Muestrario: abanico de tonos de cuero. */
function Swatch({ id }: ArtProps) {
  const tones = ["#E0B385", "#C68F55", "#A66F3C", "#7E4F28", "#57331A"];
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".28" />
          <stop offset="100%" stopColor="#000" stopOpacity=".22" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="172" rx="76" ry="9" fill="rgba(0,0,0,.42)" />
      {tones.map((c, i) => {
        const a = -34 + i * 17;
        return (
          <g key={c} transform={`rotate(${a} 100 166)`}>
            <rect x="82" y="44" width="36" height="122" rx="9" fill="#4A2C14" />
            <rect x="84" y="46" width="32" height="118" rx="8" fill={c} />
            <rect x="84" y="46" width="32" height="118" rx="8" fill={`url(#${id}f)`} />
            <circle cx="100" cy="58" r="3.4" fill="rgba(0,0,0,.4)" />
          </g>
        );
      })}
    </>
  );
}

/**
 * Pieza genérica: medallón biselado con la marca en relieve.
 *
 * Es el respaldo para cualquier pieza que todavía no tiene foto ni un
 * dibujo específico asignado. Se tiñe con el celeste de la marca.
 */
function Generic({ id, tone }: ArtProps) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}f`} x1="0" y1="0" x2="0.45" y2="1">
          <stop offset="0%" stopColor={tone.hi} />
          <stop offset="48%" stopColor={tone.mid} />
          <stop offset="100%" stopColor={tone.low} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="170" rx="70" ry="10" fill="rgba(0,0,0,.38)" />
      <rect x="26" y="34" width="148" height="130" rx="34" fill={tone.deep} />
      <rect x="30" y="37" width="140" height="124" rx="31" fill={`url(#${id}f)`} />
      <rect
        x="44"
        y="51"
        width="112"
        height="96"
        rx="22"
        fill="none"
        stroke={tone.deep}
        strokeOpacity=".32"
        strokeWidth="2"
      />
      <Engrave
        x="100"
        y="107"
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontWeight="700"
        fontSize="30"
        letterSpacing="2"
        fill={tone.ink}
        light="rgba(255,255,255,.42)"
        dy={-1.5}
      >
        POLY
      </Engrave>
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fontFamily={MONO}
        fontSize="9"
        letterSpacing="4.5"
        fill={tone.ink}
        opacity=".6"
      >
        LIMA · PERÚ
      </text>
      <rect x="30" y="37" width="140" height="40" rx="31" fill="#fff" opacity=".16" />
    </>
  );
}

/* ---------------------------- despachador ---------------------------- */

const SHAPES: Record<Shape, (p: ArtProps) => ReactNode> = {
  generic: Generic,
  "button-jean": ButtonJean,
  "button-sew": ButtonSew,
  "button-shank": ButtonShank,
  "puller-metal": PullerMetal,
  plate: Plate,
  rivet: Rivet,
  patch: Patch,
  "label-rubber": LabelRubber,
  "button-rubber": ButtonRubber,
  "puller-plastic": PullerPlastic,
  "label-leather": LabelLeather,
  applique: Applique,
  swatch: Swatch,
};

/** Dibuja una pieza suelta (sin fondo). */
export function ProductArt({
  shape,
  finish = "",
  tint = GENERIC_TINT,
  className,
  style,
}: {
  shape: Shape;
  finish?: string;
  /** Sólo la usa la forma genérica; el resto se tiñe por el acabado. */
  tint?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId().replace(/:/g, "");
  const Render = SHAPES[shape] ?? Generic;
  // Las formas concretas toman su metal del acabado ("Cobre pulido").
  // La genérica no sabe de acabados: se tiñe con el celeste de marca.
  const tone = shape === "generic" ? toneFromTint(tint) : metalTone(finish);

  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden="true">
      {Render({ id, tone, finish })}
    </svg>
  );
}

/**
 * Una pieza de la galería.
 *
 * Si el CMS tiene foto, se muestra la foto. Si no, se dibuja — sobre
 * un único fondo neutro para todas las piezas, a propósito: la
 * galería es mixta y no debe leerse como una taxonomía por material.
 */
export function PieceVisual({
  piece,
  className = "",
  padding = "18%",
  full = false,
}: {
  piece: Pick<Piece, "shape" | "finish" | "image">;
  className?: string;
  padding?: string;
  /** Usa la variante grande de la foto (modal, no tarjeta). */
  full?: boolean;
}) {
  const zoom =
    "transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.07]";

  return (
    <div
      className={`spotlight vignette tex-neutral relative grid place-items-center overflow-hidden ${className}`}
    >
      {piece.image ? (
        <img
          src={full ? piece.image.full : piece.image.card}
          alt={piece.image.alt}
          loading="lazy"
          decoding="async"
          className={`relative z-10 h-full w-full object-cover ${zoom}`}
        />
      ) : (
        <ProductArt
          shape={piece.shape ?? "generic"}
          finish={piece.finish}
          className={`relative z-10 h-full w-full ${zoom}`}
          style={{ padding }}
        />
      )}
    </div>
  );
}

/* ------------------------------ marca ------------------------------ */

/**
 * Logotipo real de la empresa.
 *
 * El archivo es un JPG con fondo blanco, sin transparencia. Por eso
 * sobre fondo oscuro (`light`) va montado en una placa blanca: pegarlo
 * directo dejaría un recuadro blanco sucio alrededor.
 *
 * Si el archivo faltara, cae al logotipo vectorial de respaldo y el
 * encabezado nunca queda vacío.
 */
export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  const [roto, setRoto] = useState(false);
  if (roto) return <Wordmark light={light} className={className} />;

  const img = (
    <img
      src="/logo.jpg"
      alt="Manufacturas Poly"
      width={703}
      height={703}
      onError={() => setRoto(true)}
      className={light ? "h-11 w-auto" : "h-[52px] w-auto"}
    />
  );

  if (!light) return <span className={`flex items-center ${className}`}>{img}</span>;

  return (
    <span className={`inline-flex rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,.6)] ${className}`}>
      {img}
    </span>
  );
}

/** Logotipo vectorial de respaldo, por si falta el archivo de imagen. */
export function Wordmark({ light = false, className = "" }: { light?: boolean; className?: string }) {
  const stroke = light ? "#4FB3FF" : "#1668C7";
  const word = light ? "#FFFFFF" : "#131922";
  return (
    <span className={`flex select-none items-center gap-2.5 ${className}`}>
      <svg width="36" height="36" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
        <circle cx="20" cy="20" r="18" fill="none" stroke={stroke} strokeWidth="2.5" />
        <circle
          cx="20"
          cy="20"
          r="13"
          fill="none"
          stroke={stroke}
          strokeOpacity=".45"
          strokeWidth="1.2"
          strokeDasharray="3 3"
        />
        {[
          [16, 16],
          [24, 16],
          [16, 24],
          [24, 24],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill={stroke} />
        ))}
      </svg>
      <span className="leading-none">
        <span
          className="block font-display text-[21px] font-bold tracking-[-0.03em]"
          style={{ color: word }}
        >
          POLY
        </span>
        <span
          className="mt-0.5 block font-mono text-[8.5px] tracking-[0.28em]"
          style={{ color: stroke }}
        >
          MANUFACTURAS
        </span>
      </span>
    </span>
  );
}

export function IconWA({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.4.7 4.6 1.9 6.5L4 29l7-1.8c1.8 1 3.9 1.6 6 1.6 6.6 0 12-5.3 12-11.9C29 8.3 23.6 3 16 3zm0 21.7c-1.9 0-3.6-.5-5.1-1.4l-.4-.2-4.2 1.1 1.1-4-.2-.4c-1-1.6-1.5-3.4-1.5-5.3 0-5.4 4.5-9.8 10-9.8s9.9 4.4 9.9 9.8-4.4 9.9-9.9 9.9zm5.5-7.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.2s-.8 1-.9 1.2c-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4z" />
    </svg>
  );
}
