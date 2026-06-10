import type { VariantConfig } from "./types";

// Authored in OKLCH. Dark variants: low bg L, high fg L. Light: high bg L, low fg L (accents darkened).
// HC variants widen the fg/bg gap and raise accent chroma. Cyber pins bg to the exact portfolio
// near-black (#13131c) and overrides hues/L,C to the neon wheel.
// v2: stages are near-neutral; tier tuning happens at the v2 gallery checkpoint.
export const VARIANTS: VariantConfig[] = [
  // --- light ---
  { name: "dawn", kind: "light", uiContrast: "normal",
    bg: [0.965, 0.008, 85], fg: [0.32, 0.02, 265], accentL: 0.52, accentC: 0.13 },
  { name: "day", kind: "light", uiContrast: "normal",
    bg: [0.985, 0.003, 250], fg: [0.30, 0.02, 265], accentL: 0.52, accentC: 0.14 },
  { name: "day-hc", kind: "light", uiContrast: "high",
    bg: [1.0, 0.0, 0], fg: [0.16, 0.01, 265], accentL: 0.44, accentC: 0.18 },
  // --- dark ---
  { name: "storm", kind: "dark", uiContrast: "normal",
    bg: [0.30, 0.014, 270], fg: [0.85, 0.028, 265], accentL: 0.80, accentC: 0.085,
    accentLC: { red: [0.72, 0.20] } }, // raised from archetype 0.66: storm's lighter bg (L=0.30) needs it for the 4:1
    // floor + pill contrast; 0.72 keeps red uniquely darkest+most-chromatic (tier-1 identity) under orange [0.74,0.160]
  { name: "dusk", kind: "dark", uiContrast: "normal",
    bg: [0.250, 0.014, 270], fg: [0.88, 0.030, 265], accentL: 0.78, accentC: 0.12 },
  { name: "midnight", kind: "dark", uiContrast: "normal",
    bg: [0.175, 0.014, 270], fg: [0.82, 0.028, 265], accentL: 0.76, accentC: 0.105 },
  // --- high-contrast dark (bg lifted off pure-black; bright text + accents floored >=7:1) ---
  { name: "night-hc", kind: "dark", uiContrast: "high",
    bg: [0.22, 0.012, 275], fg: [0.93, 0.016, 262], accentL: 0.84, accentC: 0.15 },
  // --- signature neon (portfolio), high-contrast ---
  { name: "cyber", kind: "dark", uiContrast: "high",
    bg: [0.185, 0.012, 285], bgHex: "#13131c", fg: [0.93, 0.014, 258], accentL: 0.84, accentC: 0.18,
    accentLC: {
      red: [0.74, 0.22], orange: [0.82, 0.17], yellow: [0.88, 0.15], green: [0.84, 0.18],
      teal: [0.85, 0.14], cyan: [0.88, 0.16], blue: [0.80, 0.17], purple: [0.80, 0.13], magenta: [0.80, 0.20],
    },
    hues: { red: 25, orange: 60, yellow: 95, green: 145, teal: 210, cyan: 195, blue: 245, purple: 280, magenta: 335 },
  },
];

// Signature variants share their base's syntax palette EXACTLY; the signature is a CHROME hex
// (cursor/borders/selection/headings) resolved at the archetype's magenta band (SLOT_LC[arch].magenta).
const SIGNATURES: { slug: string; hue: number }[] = [
  { slug: "azure", hue: 235 },
  { slug: "neon-purple", hue: 300 },
  { slug: "magenta", hue: 322 },
  { slug: "salmon", hue: 32 },
];
const _duskBase = VARIANTS.find((v) => v.name === "dusk")!;
const _cyberBase = VARIANTS.find((v) => v.name === "cyber")!;
for (const s of SIGNATURES) {
  VARIANTS.push({ ..._duskBase, name: `dusk-${s.slug}`, signature: s.hue });
  VARIANTS.push({ ..._cyberBase, name: `cyber-${s.slug}`, signature: s.hue });
}

export const VARIANT_NAMES = VARIANTS.map((v) => v.name);
