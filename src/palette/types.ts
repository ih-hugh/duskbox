import { oklchToHex, contrastRatio } from "../oklch";

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
  bgLean?: number;             // mood hue°: A1.5 atmosphere — bg chroma ×2.0, hue walks halfway toward this (falls back to `signature`)
}

export interface Palette {
  name: string;
  kind: "dark" | "light";
  uiContrast: "normal" | "high";
  bg0: string; bg1: string; bg2: string; bg3: string; // editor, panel/darker, cursorline, selection
  fg0: string; fg1: string; fg2: string;              // text, dim, muted/comment
  accents: Record<AccentName, string>;
  headings: [string, string, string, string]; // markdown h1..h4 — hue walk from signature ?? blue
  fgPunct: string;                            // punctuation tone between fg0 and fg2 (HC-floored)
  signature?: string;          // resolved signature hex (set iff the variant defines `signature`)
}

/** Circular midpoint between two hues, going the short way around the wheel. */
function halfLean(from: number, to: number): number {
  const d = ((to - from + 540) % 360) - 180;
  return ((from + d / 2) % 360 + 360) % 360;
}

export function buildPalette(v: VariantConfig): Palette {
  const dir = v.kind === "dark" ? 1 : -1; // dark: surfaces step lighter; light: step darker
  const [bgL, bgC, bgH] = v.bg;
  const [fgL, fgC, fgH] = v.fg;
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  // A1.5 atmosphere: when a mood lean exists (explicit bgLean, or the signature hue), the whole
  // bg ramp tints toward it — chroma ×2.0, hue at the circular midpoint. Same lightness, so all
  // fg contrast is preserved by construction. A leaned variant ignores bgHex (cyber's signature
  // children compute their mood; plain cyber keeps its pinned near-black identity).
  const lean = v.bgLean ?? v.signature;
  const moodC = lean !== undefined ? bgC * 2.0 : bgC;
  const moodH = lean !== undefined ? halfLean(bgH, lean) : bgH;
  const bg0 = lean === undefined && v.bgHex ? v.bgHex : oklchToHex(clamp01(bgL), moodC, moodH);
  const bg1 = oklchToHex(clamp01(bgL - 0.025), moodC, moodH);        // panel always recedes (darker)
  const bg2 = oklchToHex(clamp01(bgL + dir * 0.04), moodC, moodH);   // cursorline: lighter(dark)/darker(light)
  const bg3 = oklchToHex(clamp01(bgL + dir * 0.08), moodC * 1.5, v.signature ?? 255); // selection (cool, or signature-tinted)
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

  // Heading ladder: -25° OKLCH hue walk from the variant's anchor (signature ?? blue), at the
  // variant's equiluminant accent band — harmonious on every variant by construction.
  const anchor = v.signature ?? 255;
  const headings = [0, 1, 2, 3].map((k) =>
    oklchToHex(v.accentL, v.accentC, ((anchor - 25 * k) % 360 + 360) % 360)
  ) as [string, string, string, string];

  // Punctuation tone: fg stepped 60% of the mute drop (HC variants start at the dim drop), then
  // raised deterministically until it clears the readability floor (3:1 normal, 4.5:1 HC vs bg0).
  const punctFloor = v.uiContrast === "high" ? 4.5 : 3.0;
  let punctDrop = v.uiContrast === "high" ? dimDrop : muteDrop * 0.6;
  let fgPunct = oklchToHex(clamp01(fgL - dir * punctDrop), fgC, fgH);
  while (contrastRatio(fgPunct, bg0) < punctFloor && punctDrop > 0) {
    punctDrop = Math.max(0, punctDrop - 0.01); // clamp so we never overshoot brighter than fg0 itself
    fgPunct = oklchToHex(clamp01(fgL - dir * punctDrop), fgC, fgH);
  }

  return {
    name: v.name, kind: v.kind, uiContrast: v.uiContrast,
    bg0, bg1, bg2, bg3, fg0, fg1, fg2, accents, headings, fgPunct,
    signature: v.signature !== undefined ? accents.magenta : undefined,
  };
}
