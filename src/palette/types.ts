import { oklchToHex, contrastRatio } from "../oklch";
import { blend } from "../build/blend";

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
  bgHex?: string;               // exact bg override (e.g. cyber's #13131c)
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
  fgVar: string;               // bright-variable tier: locals pop above body text without a hue shift
  fgParam: string;             // moonlit-parameter tier: moonlit cyan blend for parameter slots
  accents: Record<AccentName, string>;
  headings: [string, string, string, string]; // markdown h1..h4 — hue walk from signature ?? blue
  fgPunct: string;                            // punctuation tone between fg0 and fg2 (HC-floored)
  builtin: string;             // builtin tier placeholder — Task 3 wires the tier slot
  signature?: string;          // resolved signature hex (set iff the variant defines `signature`)
}

export function buildPalette(v: VariantConfig): Palette {
  const dir = v.kind === "dark" ? 1 : -1; // dark: surfaces step lighter; light: step darker
  const [bgL, bgC, bgH] = v.bg;
  const [fgL, fgC, fgH] = v.fg;
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  // v2 near-neutral stages: backgrounds are authored directly from the variant's bg tuple.
  // bgHex provides an exact override (e.g. cyber's #13131c); signature children inherit it.
  const bg0 = v.bgHex ?? oklchToHex(clamp01(bgL), bgC, bgH);
  const bg1 = oklchToHex(clamp01(bgL - 0.025), bgC, bgH);        // panel always recedes (darker)
  const bg2 = oklchToHex(clamp01(bgL + dir * 0.04), bgC, bgH);   // cursorline: lighter(dark)/darker(light)
  // Signature bg3 floors its chroma so the tint stays perceptible (ΔE ≥ ~0.012) on near-neutral stages.
  const bg3C = v.signature !== undefined ? Math.max(bgC * 1.5, 0.030) : bgC * 1.5;
  const bg3 = oklchToHex(clamp01(bgL + dir * 0.08), bg3C, v.signature ?? 255); // selection (chrome: cool or signature-tinted)
  // High-contrast variants keep secondary text much closer to the main fg so
  // comments / dim text stay legible against the near-black (or near-white) bg.
  const dimDrop = v.uiContrast === "high" ? 0.07 : 0.12;
  const muteDrop = v.uiContrast === "high" ? 0.15 : 0.24;
  const fg0 = oklchToHex(clamp01(fgL), fgC, fgH);
  const fg1 = oklchToHex(clamp01(fgL - dir * dimDrop), fgC, fgH);  // dim
  // Muted/comment tone: raised deterministically until it clears the 3.8:1 readability floor vs bg0
  // (the loop runs uniformly; HC drops already produce high contrast, so it never fires there).
  let fg2Drop = muteDrop;
  let fg2 = oklchToHex(clamp01(fgL - dir * fg2Drop), fgC, fgH);    // muted/comment
  while (contrastRatio(fg2, bg0) < 3.8 && fg2Drop > 0) {
    fg2Drop = Math.max(0, fg2Drop - 0.01);
    fg2 = oklchToHex(clamp01(fgL - dir * fg2Drop), fgC, fgH);
  }

  // Bright-variable tier: locals pop above body text without a hue shift; capped off pure white/black.
  const varL = v.kind === "dark" ? Math.min(fgL + 0.10, 0.975) : Math.max(fgL - 0.10, 0.125);
  const fgVar = oklchToHex(clamp01(varL), fgC, fgH);

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

  const fgParam = blend(fg0, accents.cyan, 0.30); // moonlit parameters

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
    bg0, bg1, bg2, bg3, fg0, fg1, fg2, fgVar, fgParam,
    accents, headings, fgPunct,
    builtin: accents.orange, // placeholder — Task 3 wires the tier slot
    signature: v.signature !== undefined ? accents.magenta : undefined,
  };
}
