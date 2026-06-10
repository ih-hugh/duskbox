import type { AccentName } from "./types";

export type Archetype = "normal-dark" | "hc-dark" | "normal-light" | "hc-light";

/** v2 hue spine (normal variants). Cyber overrides via VariantConfig.hues as before. */
export const TIER_HUES: Record<AccentName, number> = {
  red: 26, orange: 55, yellow: 92, green: 140, teal: 184, cyan: 213, blue: 253, purple: 297, magenta: 335,
};

/** Per-slot OKLCH [L, C] by archetype — hierarchy from lightness×chroma (spec anchors).
 *  Tier 1 = red (darker+max chroma on normal variants; chroma-only at floor-safe L on HC).
 *  magenta is CHROME-ONLY (signature carrier + legacy notifier colors); never bound in syntax. */
export const SLOT_LC: Record<Archetype, Record<AccentName, [number, number]>> = {
  "normal-dark": {
    red: [0.66, 0.200], orange: [0.74, 0.160], yellow: [0.83, 0.135], green: [0.78, 0.130],
    teal: [0.78, 0.120], cyan: [0.81, 0.125], blue: [0.755, 0.115], purple: [0.74, 0.100], magenta: [0.78, 0.140],
  },
  "hc-dark": {
    red: [0.74, 0.220], orange: [0.82, 0.170], yellow: [0.88, 0.150], green: [0.84, 0.180],
    teal: [0.85, 0.140], cyan: [0.88, 0.160], blue: [0.80, 0.170], purple: [0.80, 0.130], magenta: [0.80, 0.170],
  },
  "normal-light": {
    red: [0.52, 0.190], orange: [0.50, 0.140], yellow: [0.55, 0.120], green: [0.50, 0.110],
    teal: [0.50, 0.100], cyan: [0.52, 0.105], blue: [0.50, 0.105], purple: [0.50, 0.090], magenta: [0.52, 0.130],
  },
  "hc-light": {
    red: [0.44, 0.210], orange: [0.43, 0.160], yellow: [0.46, 0.140], green: [0.43, 0.130],
    teal: [0.43, 0.120], cyan: [0.44, 0.125], blue: [0.43, 0.125], purple: [0.43, 0.110], magenta: [0.44, 0.150],
  },
};

export const archetypeOf = (kind: "dark" | "light", ui: "normal" | "high"): Archetype =>
  `${ui === "high" ? "hc" : "normal"}-${kind}` as Archetype;

/** The builtin slot (this/self/ctor targets): orange's warm cousin — slightly brighter, hue +2. */
export const BUILTIN_LC: Record<Archetype, [number, number]> = {
  "normal-dark": [0.77, 0.145], "hc-dark": [0.82, 0.160],
  "normal-light": [0.52, 0.130], "hc-light": [0.45, 0.150],
};
