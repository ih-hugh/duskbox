import type { VariantConfig } from "./types";

// Authored in OKLCH. Dark variants: low bg L, high fg L. Light: high bg L, low fg L (accents darkened).
// HC variants widen the fg/bg gap and raise accent chroma. Cyber pins bg to the exact portfolio
// near-black (#0a0a0f) and overrides hues/L,C to the neon wheel.
export const VARIANTS: VariantConfig[] = [
  // --- light ---
  { name: "dawn", kind: "light", uiContrast: "normal",
    bg: [0.965, 0.008, 85], fg: [0.34, 0.02, 265], accentL: 0.55, accentC: 0.13 },
  { name: "day", kind: "light", uiContrast: "normal",
    bg: [0.985, 0.003, 250], fg: [0.30, 0.02, 265], accentL: 0.52, accentC: 0.14 },
  { name: "day-hc", kind: "light", uiContrast: "high",
    bg: [1.0, 0.0, 0], fg: [0.16, 0.01, 265], accentL: 0.44, accentC: 0.18 },
  // --- dark ---
  { name: "storm", kind: "dark", uiContrast: "normal",
    bg: [0.30, 0.016, 278], fg: [0.83, 0.03, 265], accentL: 0.80, accentC: 0.085 },
  { name: "dusk", kind: "dark", uiContrast: "normal",
    bg: [0.265, 0.018, 278], fg: [0.86, 0.035, 265], accentL: 0.78, accentC: 0.12 },
  { name: "midnight", kind: "dark", uiContrast: "normal",
    bg: [0.175, 0.02, 278], fg: [0.80, 0.03, 265], accentL: 0.76, accentC: 0.105 },
  // --- high-contrast dark ---
  { name: "night-hc", kind: "dark", uiContrast: "high",
    bg: [0.12, 0.01, 275], fg: [0.97, 0.01, 265], accentL: 0.80, accentC: 0.16 },
  // --- signature neon (portfolio) ---
  { name: "cyber", kind: "dark", uiContrast: "high",
    bg: [0.115, 0.018, 285], bgHex: "#0a0a0f", fg: [0.96, 0.005, 250], accentL: 0.80, accentC: 0.20,
    accentLC: {
      red: [0.66, 0.23], orange: [0.78, 0.18], yellow: [0.86, 0.16], green: [0.80, 0.20],
      teal: [0.82, 0.15], cyan: [0.86, 0.18], blue: [0.74, 0.20], purple: [0.70, 0.20], magenta: [0.74, 0.24],
    },
    hues: { red: 25, orange: 60, yellow: 95, green: 145, teal: 210, cyan: 195, blue: 245, purple: 280, magenta: 330 },
  },
];

export const VARIANT_NAMES = VARIANTS.map((v) => v.name);
