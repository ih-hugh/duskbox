import { describe, it, expect } from "vitest";
import { buildPalette, BASE_HUES } from "./types";
import type { VariantConfig } from "./types";
import { contrastRatio } from "../oklch";

const dusk: VariantConfig = {
  name: "dusk", kind: "dark", uiContrast: "normal",
  bg: [0.265, 0.018, 278], fg: [0.86, 0.035, 265], accentL: 0.78, accentC: 0.12,
};

describe("buildPalette", () => {
  it("derives canvas + 9 accents as hex", () => {
    const p = buildPalette(dusk);
    expect(p.bg0).toMatch(/^#[0-9a-f]{6}$/);
    expect(Object.keys(p.accents).sort()).toEqual(Object.keys(BASE_HUES).sort());
    for (const k of Object.keys(BASE_HUES)) expect((p.accents as any)[k]).toMatch(/^#[0-9a-f]{6}$/);
  });
  it("dark variant: fg is much lighter than bg (>= 4.5:1)", () => {
    const p = buildPalette(dusk);
    expect(contrastRatio(p.fg0, p.bg0)).toBeGreaterThanOrEqual(4.5);
  });
  it("every accent clears 4.5:1 on the dark bg", () => {
    const p = buildPalette(dusk);
    for (const k of Object.keys(p.accents))
      expect(contrastRatio((p.accents as any)[k], p.bg0)).toBeGreaterThanOrEqual(4.5);
  });
  it("signature variant overrides the magenta slot hue, tints bg3, and exposes palette.signature", () => {
    const azureDusk: VariantConfig = { ...dusk, name: "dusk-azure", signature: 235 };
    const p = buildPalette(azureDusk);
    expect(p.signature).toMatch(/^#[0-9a-f]{6}$/);
    expect(p.signature).toBe(p.accents.magenta); // signature IS the magenta slot
    // base dusk: no signature, magenta stays the fuchsia default, bg3 stays blue-tinted
    const base = buildPalette(dusk);
    expect(base.signature).toBeUndefined();
    expect(base.accents.magenta).not.toBe(p.accents.magenta);
    expect(base.bg3).not.toBe(p.bg3); // selection tint shifts toward the signature hue
  });
});
