import { describe, it, expect } from "vitest";
import { buildPalette, BASE_HUES } from "./types";
import type { VariantConfig } from "./types";
import { VARIANTS } from "./variants";
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

describe("headings ladder", () => {
  it("dusk ladder matches the approved fixture (anchor blue 255, -25° walk)", () => {
    const dusk = VARIANTS.find((v) => v.name === "dusk")!;
    expect(buildPalette(dusk).headings).toEqual(["#86bafe", "#59c5f5", "#3bcddc", "#4ad0ba"]);
  });
  it("cyber-salmon ladder anchors at the signature (32°)", () => {
    const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
    expect(buildPalette(cs).headings).toEqual(["#ffb6a7", "#fdb3c1", "#fface0", "#eab2fe"]);
  });
  it("every variant gets 4 distinct heading colors", () => {
    for (const v of VARIANTS) {
      const h = buildPalette(v).headings;
      expect(new Set(h).size).toBe(4);
    }
  });
});

describe("fgPunct", () => {
  it("contrast vs bg0 sits strictly between fg0 and fg2 on dusk", () => {
    const p = buildPalette(VARIANTS.find((v) => v.name === "dusk")!);
    expect(contrastRatio(p.fg0, p.bg0)).toBeGreaterThan(contrastRatio(p.fgPunct, p.bg0));
    expect(contrastRatio(p.fgPunct, p.bg0)).toBeGreaterThan(contrastRatio(p.fg2, p.bg0));
  });
  it("meets the contrast floor on every variant (3:1 normal, 4.5:1 HC)", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      const floor = v.uiContrast === "high" ? 4.5 : 3.0;
      expect(contrastRatio(p.fgPunct, p.bg0), v.name).toBeGreaterThanOrEqual(floor);
    }
  });
  it("ladder hexes clear the variant's accent floor on every variant (4:1 normal, 7:1 HC)", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      const floor = v.uiContrast === "high" ? 7 : 4;
      for (const h of p.headings) expect(contrastRatio(h, p.bg0), `${v.name} ${h}`).toBeGreaterThanOrEqual(floor);
    }
  });
  it("raise loop lifts a low-contrast fg to the floor without passing fg0", () => {
    const synthetic: VariantConfig = {
      name: "synthetic-low", kind: "dark", uiContrast: "normal",
      bg: [0.265, 0.018, 278], fg: [0.55, 0.035, 265], accentL: 0.78, accentC: 0.12,
    };
    const p = buildPalette(synthetic);
    expect(contrastRatio(p.fgPunct, p.bg0)).toBeGreaterThanOrEqual(3.0);
    expect(contrastRatio(p.fgPunct, p.bg0)).toBeLessThanOrEqual(contrastRatio(p.fg0, p.bg0));
  });
});
