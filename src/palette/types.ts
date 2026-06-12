import { oklchToHex, hexToOklch, contrastRatio } from "../oklch";
import { blend } from "../build/blend";
import { TIER_HUES, SLOT_LC, BUILTIN_LC, MOD_LC, STR_LC, archetypeOf } from "./tiers";

export type AccentName =
  | "red" | "orange" | "yellow" | "green" | "teal" | "cyan" | "blue" | "purple" | "magenta";

/** @deprecated Use TIER_HUES from ./tiers — kept for gallery script and legacy test imports. */
export const BASE_HUES: Record<AccentName, number> = TIER_HUES;

export interface VariantConfig {
  name: string;
  kind: "dark" | "light";
  uiContrast: "normal" | "high";
  bg: [number, number, number]; // OKLCH of the editor background
  fg: [number, number, number]; // OKLCH of the primary foreground
  accentL: number;              // heading-ladder band (syntax accents now come from SLOT_LC tiers)
  accentC: number;              // heading-ladder band (syntax accents now come from SLOT_LC tiers)
  bgHex?: string;               // exact bg override (e.g. cyber's #13131c)
  hues?: Partial<Record<AccentName, number>>;        // hue overrides (cyber neon)
  accentLC?: Partial<Record<AccentName, [number, number]>>; // per-accent [L,C] overrides (cyber continuity)
  signature?: number;          // signature hue°: chrome-only hex for cursor/UI accent/bg3 tint; syntax palette is identical to base
  bgLean?: number;             // mood hue° for the bg ramp (A1.5-strength, gallery-relocked: chroma ×2.0, half-lean); falls back to `signature`
}

export interface Palette {
  name: string;
  kind: "dark" | "light";
  uiContrast: "normal" | "high";
  bg0: string; bg1: string; bg2: string; bg3: string; // editor, panel/darker, cursorline, selection
  fg0: string; fg1: string; fg2: string;              // text, dim, muted/comment
  fgVar: string;               // bright-LAVENDER variable tier (H288): locals pop and carry the lavender identity
  fgParam: string;             // moonlit-parameter tier: moonlit cyan blend for parameter slots
  fgConst: string;             // const-variable whisper tier (v2.1.1): lavender pulled 35% toward plum —
                               // const-declared NAMES read as white-with-a-const-cast, distinct from the
                               // plum-italic `const` keyword AND from plain lavender let-variables
  accents: Record<AccentName, string>;
  headings: [string, string, string, string]; // markdown h1..h4 — hue walk from signature ?? blue
  fgPunct: string;                            // bg-material punctuation: carved from the stage (mood hue, lifted L), floor-looped
  builtin: string;             // builtin slot: this/self/ctor targets — orange's warm cousin (hue +2); consumed by the v2 role retarget (Task 4)
  moduleKw: string;            // module boundary (gallery-locked): import/export walk from red toward the variant anchor
  signature?: string;          // resolved signature hex (set iff the variant defines `signature`)
  fgMod: string;               // v2.3 modifier lane (const/async): electric blue, italic at the role;
                               // cyber family keeps its periwinkle (= accents.purple there)
  fgString: string;            // v2.3 string lane: seafoam (H164) — green accent stays git/diag-only;
                               // cyber family keeps neon-green strings (= accents.green there)
  neonLine?: string;           // cyber family only: the identity neon (signature ?? cyan) that the
                               // current-line treatment keys off (nvim underdashed sp / vscode border)
}

/** Circular midpoint between two hues, going the short way around the wheel. */
function halfLean(from: number, to: number): number {
  return halfLeanK(from, to, 0.5);
}

/** Generalized hue interpolation: walk k fraction of the short arc from `from` toward `to`. */
function halfLeanK(from: number, to: number, k: number): number {
  const d = ((to - from + 540) % 360) - 180;
  return ((from + d * k) % 360 + 360) % 360;
}

export function buildPalette(v: VariantConfig): Palette {
  const dir = v.kind === "dark" ? 1 : -1; // dark: surfaces step lighter; light: step darker
  const arch = archetypeOf(v.kind, v.uiContrast);
  // Chrome-only signature (hoisted: the v2.3 T2 stage pigment needs it before the bg ramp).
  const signature = v.signature !== undefined
    ? oklchToHex(SLOT_LC[arch].magenta[0], SLOT_LC[arch].magenta[1], v.signature)
    : undefined;
  const [bgL, bgC, bgH] = v.bg;
  const [fgL, fgC, fgH] = v.fg;
  const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
  // v2 atmosphere (A1.5-strength, gallery-relocked): the bg ramp leans toward `bgLean ?? signature`
  // at chroma ×2.0, hue at the circular midpoint — strong enough to differentiate the family at a
  // glance, calm enough not to fight the warm ember tier-1 (floors re-gated below in the test suite).
  // A leaned variant ignores bgHex (cyber's children compute their mood; plain cyber keeps its
  // pinned near-black identity). Same lightness, so fg contrast is essentially preserved.
  const lean = v.bgLean ?? v.signature;
  const moodC = lean !== undefined ? bgC * 2.0 : bgC;
  const moodH = lean !== undefined ? halfLean(bgH, lean) : bgH;
  const bg0 = lean === undefined && v.bgHex ? v.bgHex : oklchToHex(clamp01(bgL), moodC, moodH);
  const bg1 = oklchToHex(clamp01(bgL - 0.025), moodC, moodH);        // panel always recedes (darker)
  let bg2 = oklchToHex(clamp01(bgL + dir * 0.04), moodC, moodH);   // cursorline: lighter(dark)/darker(light)
  // v2.3 T2 (screens 28+31, locked): dusk-family signature children stand on the base slate plus
  // a 2% SIGNATURE-PIGMENT blend — hue-leaning can only produce plum for salmon; pigment carries
  // the true signature. Cyber children (v.hues) keep their leans untouched.
  let bg0t = bg0, bg1t = bg1;
  if (v.signature !== undefined && v.hues === undefined && signature !== undefined) {
    bg0t = blend(bg0, signature, 0.02); bg1t = blend(bg1, signature, 0.02); bg2 = blend(bg2, signature, 0.02);
  }
  // Signature bg3 floors its chroma so the tint stays perceptible (ΔE ≥ ~0.012) even on quiet stages.
  // v2.2 S1 "neon selection" (screens 25–26, locked): the cyber family (v.hues — the existing
  // wheel-override marker) and HC variants select in their IDENTITY hue at a stronger step —
  // the flat slate block deadened the neon. Everyone else keeps the prior derivation byte-exact.
  const s1Sel = v.hues !== undefined || v.uiContrast === "high";
  const bg3C = v.signature !== undefined ? Math.max(moodC * 1.5, 0.030) : moodC * 1.5;
  const bg3 = s1Sel
    ? oklchToHex(clamp01(bgL + dir * 0.115), v.kind === "dark" ? 0.042 : 0.04, v.signature ?? v.hues?.cyan ?? 213)
    : oklchToHex(clamp01(bgL + dir * 0.08), bg3C, v.signature ?? 255); // selection (chrome: cool or signature-tinted)
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

  // Bright-lavender variable tier (gallery-locked): locals pop AND carry the lavender identity.
  let varL = v.kind === "light" ? 0.32 : v.uiContrast === "high" ? 0.95 : 0.91;
  const varC = v.kind === "light" ? 0.06 : 0.05;
  let fgVar = oklchToHex(clamp01(varL), varC, 288);
  let varGuard = 0;
  while (contrastRatio(fgVar, bg0) < (v.uiContrast === "high" ? 7 : 4.5) && varGuard++ < 40) {
    varL = clamp01(varL + dir * 0.01);
    fgVar = oklchToHex(clamp01(varL), varC, 288);
  }

  const accents = {} as Record<AccentName, string>;
  for (const name of Object.keys(TIER_HUES) as AccentName[]) {
    const hue = v.hues?.[name] ?? TIER_HUES[name];
    const [L, C] = v.accentLC?.[name] ?? SLOT_LC[arch][name];
    accents[name] = oklchToHex(L, C, hue);
  }
  const [bL, bC] = BUILTIN_LC[arch];
  const builtin = oklchToHex(bL, bC, (v.hues?.orange ?? TIER_HUES.orange) + 2);

  const fgParam = blend(fg0, accents.cyan, 0.30); // moonlit parameters
  const fgMod = v.hues !== undefined ? accents.purple : oklchToHex(MOD_LC[arch][0], MOD_LC[arch][1], 255);
  const fgString = v.hues !== undefined ? accents.green : oklchToHex(STR_LC[arch][0], STR_LC[arch][1], 152);
  const fgConst = blend(fgVar, fgMod, 0.35); // const-variable whisper follows the modifier lane (v2.3)

  // Heading ladder: -25° OKLCH hue walk from the variant's anchor (signature ?? blue), at the
  // variant's equiluminant accent band — harmonious on every variant by construction.
  const anchor = v.signature ?? 255;
  const headings = [0, 1, 2, 3].map((k) =>
    oklchToHex(v.accentL, v.accentC, ((anchor - 25 * k) % 360 + 360) % 360)
  ) as [string, string, string, string];

  // M2++ punctuation (gallery-locked): structure is carved from the stage itself — the mood hue at
  // lifted lightness, enriched chroma, floor-looped. Glue inherits the atmosphere automatically.
  const punctFloor = v.uiContrast === "high" ? 4.5 : 3.0;
  let punctL = clamp01(bgL + dir * 0.50);
  let fgPunct = oklchToHex(punctL, moodC * 1.6, moodH);
  let pGuard = 0;
  while (contrastRatio(fgPunct, bg0) < punctFloor && pGuard++ < 60) {
    punctL = clamp01(punctL + dir * 0.01);
    fgPunct = oklchToHex(punctL, moodC * 1.6, moodH);
  }

  // Module boundary (gallery-locked): import/export walk from red toward the variant anchor.
  // Azure's anchor is far from red — K70 strands periwinkle; it gets K92 to actually read blue.
  // Neon-purple/magenta chrome anchors (hue ≥ 300°) sit in the fuchsia zone — use the neutral blue
  // anchor (255°) so moduleKw stays in the purple-blue corridor and clears the pink gate.
  const impSig = v.signature !== undefined && v.signature < 300 ? v.signature : undefined;
  const impAnchor = impSig ?? 255;
  const impK = impSig === 235 ? 0.92 : 0.70;
  const redO = hexToOklch(accents.red);
  // v2.1 salmon boundary (gallery-locked, screen 22 B): when the walk can't leave keyword red
  // (walks landing less than 12° from red — the salmon family), jump to a fixed vivid-salmon band instead.
  // #ff8a6f clears the pink gate outright (effective C 0.148 ≥ 0.13) — no gate carve-out.
  const walkedH = halfLeanK(redO.H, impAnchor, impK);
  const walkEscaped = Math.abs(((walkedH - redO.H + 540) % 360) - 180) >= 12;
  // v2.3: the walked boundary is brightened (+0.07 L) — it read too dim; the vivid-salmon band
  // and the CYBER family (locked pins) are shielded.
  const walked = oklchToHex(redO.L, Math.max(redO.C, 0.14), walkedH);
  const wo = hexToOklch(walked);
  const brightened = oklchToHex(Math.min(Math.max(wo.L + dir * 0.07, 0.30), 0.93), Math.max(wo.C, 0.13), wo.H); // dark: lighter; light: deeper (more vivid on white)
  const moduleKw = walkEscaped
    ? (v.hues !== undefined ? walked : brightened)
    : oklchToHex(0.755, 0.16, 34);

  // Identity neon for the cyber family's current-line treatment (dashed in nvim, border in vscode).
  const neonLine = v.hues !== undefined ? (signature ?? accents.cyan) : undefined;

  return {
    name: v.name, kind: v.kind, uiContrast: v.uiContrast,
    bg0: bg0t, bg1: bg1t, bg2, bg3, fg0, fg1, fg2, fgVar, fgParam, fgConst, fgMod, fgString,
    accents, headings, fgPunct,
    builtin, moduleKw,
    signature, neonLine,
  };
}
