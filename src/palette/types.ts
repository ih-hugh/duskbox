import { oklchToHex } from "../oklch";

export type AccentName =
  | "red" | "orange" | "yellow" | "green" | "teal" | "cyan" | "blue" | "purple" | "magenta";

/** Shared hue wheel (degrees). Per-variant L/C come from VariantConfig; cyber overrides hues. */
export const BASE_HUES: Record<AccentName, number> = {
  red: 22, orange: 52, yellow: 85, green: 145, teal: 185, cyan: 220, blue: 255, purple: 290, magenta: 335,
};

export interface VariantConfig {
  name: string;
  kind: "dark" | "light";
  uiContrast: "normal" | "high";
  bg: [number, number, number]; // OKLCH of the editor background
  fg: [number, number, number]; // OKLCH of the primary foreground
  accentL: number;              // default accent lightness
  accentC: number;              // default accent chroma
  bgHex?: string;               // exact bg override (e.g. cyber's #0a0a0f)
  hues?: Partial<Record<AccentName, number>>;        // hue overrides (cyber neon)
  accentLC?: Partial<Record<AccentName, [number, number]>>; // per-accent [L,C] overrides
  signature?: number;          // signature hue°: marks a signature variant — sets the magenta slot hue + bg3 tint here; the emitters also recolor the UI accent
}

export interface Palette {
  name: string;
  kind: "dark" | "light";
  uiContrast: "normal" | "high";
  bg0: string; bg1: string; bg2: string; bg3: string; // editor, panel/darker, cursorline, selection
  fg0: string; fg1: string; fg2: string;              // text, dim, muted/comment
  accents: Record<AccentName, string>;
  signature?: string;          // resolved signature hex (set iff the variant defines `signature`)
}

export function buildPalette(v: VariantConfig): Palette {
  const dir = v.kind === "dark" ? 1 : -1; // dark: surfaces step lighter; light: step darker
  const [bgL, bgC, bgH] = v.bg;
  const [fgL, fgC, fgH] = v.fg;
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  const bg0 = v.bgHex ?? oklchToHex(clamp01(bgL), bgC, bgH);
  const bg1 = oklchToHex(clamp01(bgL - 0.025), bgC, bgH);        // panel always recedes (darker)
  const bg2 = oklchToHex(clamp01(bgL + dir * 0.04), bgC, bgH);   // cursorline: lighter(dark)/darker(light)
  const bg3 = oklchToHex(clamp01(bgL + dir * 0.08), bgC * 1.5, v.signature ?? 255); // selection (cool, or signature-tinted)
  // High-contrast variants keep secondary text much closer to the main fg so
  // comments / dim text stay legible against the near-black (or near-white) bg.
  const dimDrop = v.uiContrast === "high" ? 0.07 : 0.12;
  const muteDrop = v.uiContrast === "high" ? 0.15 : 0.24;
  const fg0 = oklchToHex(clamp01(fgL), fgC, fgH);
  const fg1 = oklchToHex(clamp01(fgL - dir * dimDrop), fgC, fgH);  // dim
  const fg2 = oklchToHex(clamp01(fgL - dir * muteDrop), fgC, fgH); // muted/comment

  const accents = {} as Record<AccentName, string>;
  for (const name of Object.keys(BASE_HUES) as AccentName[]) {
    let hue = v.hues?.[name] ?? BASE_HUES[name];
    // signature is the semantic override; it wins over hues.magenta for the magenta slot
    if (name === "magenta" && v.signature !== undefined) hue = v.signature;
    let [L, C] = v.accentLC?.[name] ?? [v.accentL, v.accentC];
    // magenta is the "fuchsia" standout (this / import / constructor) — boost its chroma so it
    // pops/neon, unless the variant already pins it explicitly (e.g. cyber's neon wheel).
    if (name === "magenta" && !v.accentLC?.magenta) C = C * 1.4;
    accents[name] = oklchToHex(L, C, hue);
  }

  return {
    name: v.name, kind: v.kind, uiContrast: v.uiContrast,
    bg0, bg1, bg2, bg3, fg0, fg1, fg2, accents,
    signature: v.signature !== undefined ? accents.magenta : undefined,
  };
}
