/** Aclara (pct > 0) u oscurece (pct < 0) un color hexadecimal. */
export function shade(hex: string, pct: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.replace(/./g, (c) => c + c) : clean;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n) || full.length !== 6) return hex;

  const mix = (c: number) => Math.round(pct < 0 ? c * (1 + pct) : c + (255 - c) * pct);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);

  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
