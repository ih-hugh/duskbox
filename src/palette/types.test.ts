import { describe, it, expect } from "vitest";
import { buildPalette, BASE_HUES } from "./types";
import type { VariantConfig } from "./types";
import { VARIANTS } from "./variants";
import { contrastRatio, hexToOklch, oklchToHex } from "../oklch";
import { blend } from "../build/blend";

// Synthetic config for generic invariants — NOT the shipped dusk variant (see VARIANTS for that).
const fixture: VariantConfig = {
  name: "fixture", kind: "dark", uiContrast: "normal",
  bg: [0.265, 0.018, 278], fg: [0.86, 0.035, 265], accentL: 0.78, accentC: 0.12,
};

describe("buildPalette", () => {
  it("derives canvas + 9 accents as hex", () => {
    const p = buildPalette(fixture);
    expect(p.bg0).toMatch(/^#[0-9a-f]{6}$/);
    expect(Object.keys(p.accents).sort()).toEqual(Object.keys(BASE_HUES).sort());
    for (const k of Object.keys(BASE_HUES)) expect((p.accents as any)[k]).toMatch(/^#[0-9a-f]{6}$/);
  });
  it("dark variant: fg is much lighter than bg (>= 4.5:1)", () => {
    const p = buildPalette(fixture);
    expect(contrastRatio(p.fg0, p.bg0)).toBeGreaterThanOrEqual(4.5);
  });
  it("every accent clears 4:1 on the dark bg (red is tier-1: anchored low-L, high-C; floor is 4:1 not 4.5:1)", () => {
    const p = buildPalette(fixture);
    for (const k of Object.keys(p.accents))
      expect(contrastRatio((p.accents as any)[k], p.bg0)).toBeGreaterThanOrEqual(4);
  });
  it("signature variant exposes a chrome-only palette.signature; syntax palette is identical to base", () => {
    const azure: VariantConfig = { ...fixture, name: "fixture-azure", signature: 235 };
    const p = buildPalette(azure);
    expect(p.signature).toMatch(/^#[0-9a-f]{6}$/);
    // v2: signature is chrome-only; it does NOT override the magenta syntax slot
    expect(p.signature).not.toBe(p.accents.magenta);
    // signature shares the base's syntax palette exactly
    const base = buildPalette(fixture);
    expect(base.signature).toBeUndefined();
    expect(base.accents.magenta).toBe(p.accents.magenta); // same magenta — no longer overridden
    expect(base.bg3).not.toBe(p.bg3); // selection tint still shifts toward the signature hue
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

describe("v2 stages & ladder", () => {
  const get = (name: string) => buildPalette(VARIANTS.find((v) => v.name === name)!);
  it("gallery-approved A2 stages: moody fixtures hold (chroma ×1.8, half-lean)", () => {
    expect(get("dusk").bg0).toBe("#1f202e");      // indigo lean 290
    expect(get("storm").bg0).toBe("#262e3b");     // slate lean 250
    expect(get("midnight").bg0).toBe("#0c101c");  // deep lean 265
    expect(get("dawn").bg0).toBe("#faf2e9");      // warm cream lean 60
    expect(get("dusk-azure").bg0).toBe("#19222e");   // lean = signature 235
    expect(get("dusk-salmon").bg0).toBe("#291d27");  // lean = signature 32
    expect(get("cyber-salmon").bg0).toBe("#190f16"); // signature lean, bgHex ignored
  });
  it("signature children LEAN toward their signature (stages differ from base); non-leaned stay pinned", () => {
    expect(get("dusk-azure").bg0).not.toBe(get("dusk").bg0);
    expect(get("cyber-salmon").bg0).not.toBe(get("cyber").bg0);
    expect(get("cyber").bg0).toBe("#13131c");  // pinned hex, no lean
    expect(get("day").bg0).toBe("#f9fafc");    // neutral, no lean
    expect(get("day-hc").bg0).toBe("#ffffff");
  });
  it("bg3 signature tint is perceptible (ΔE-ish gate, not just byte-inequality)", () => {
    const dusk = get("dusk");
    for (const child of ["dusk-azure", "dusk-salmon"]) {
      const c = hexToOklch(get(child).bg3), b = hexToOklch(dusk.bg3);
      const dE = Math.hypot(c.L - b.L, c.C * Math.cos(c.H * Math.PI/180) - b.C * Math.cos(b.H * Math.PI/180), c.C * Math.sin(c.H * Math.PI/180) - b.C * Math.sin(b.H * Math.PI/180));
      expect(dE, child).toBeGreaterThanOrEqual(0.012);
    }
  });
  it("fg2 (comments) clears the 3.8:1 readability floor on every variant", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      expect(contrastRatio(p.fg2, p.bg0), v.name).toBeGreaterThanOrEqual(3.8);
    }
  });
  it("fgVar is brighter than fg0 (dark) / darker (light), capped off pure white/black", () => {
    const d = get("dusk"), l = get("dawn");
    expect(hexToOklch(d.fgVar).L).toBeGreaterThan(hexToOklch(d.fg0).L);
    expect(hexToOklch(l.fgVar).L).toBeLessThan(hexToOklch(l.fg0).L);
    for (const v of VARIANTS) {
      const L = hexToOklch(buildPalette(v).fgVar).L;
      expect(L, v.name).toBeLessThanOrEqual(0.978);
      expect(L, v.name).toBeGreaterThanOrEqual(0.122);
    }
  });
  it("fgParam is the moonlit blend", () => {
    const p = get("dusk");
    expect(p.fgParam).toBe(blend(p.fg0, p.accents.cyan, 0.30));
  });
});
