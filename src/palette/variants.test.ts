import { describe, it, expect } from "vitest";
import { VARIANTS, VARIANT_NAMES } from "./variants";
import { buildPalette, BASE_HUES } from "./types";
import { contrastRatio } from "../oklch";

describe("variants", () => {
  it("defines the 8 base + 8 signature variants", () => {
    expect(VARIANT_NAMES).toEqual([
      "dawn", "day", "day-hc", "storm", "dusk", "midnight", "night-hc", "cyber",
      "dusk-azure", "cyber-azure", "dusk-neon-purple", "cyber-neon-purple",
      "dusk-magenta", "cyber-magenta", "dusk-salmon", "cyber-salmon",
    ]);
  });
  it("all variants build without gamut errors", () => {
    for (const v of VARIANTS) expect(buildPalette(v).bg0).toMatch(/^#[0-9a-f]{6}$/);
  });
  it("high-contrast variants reach >= 7:1 fg/bg; others >= 4.5:1", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      const min = v.uiContrast === "high" ? 7 : 4.5;
      expect(contrastRatio(p.fg0, p.bg0)).toBeGreaterThanOrEqual(min);
    }
  });
  it("cyber uses a lifted near-black background (off pure-black for HC depth)", () => {
    const cyber = VARIANTS.find((v) => v.name === "cyber")!;
    expect(buildPalette(cyber).bg0).toBe("#13131c");
  });
  it("every accent clears >= 4.0:1 on its own background (all variants)", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      for (const name of Object.keys(BASE_HUES) as (keyof typeof BASE_HUES)[]) {
        expect(contrastRatio(p.accents[name], p.bg0), `${v.name}/${name}`).toBeGreaterThanOrEqual(4.0);
      }
    }
  });
  it("high-contrast variants: fg ramp AND every accent clear >= 7:1 on bg", () => {
    for (const v of VARIANTS.filter((x) => x.uiContrast === "high")) {
      const p = buildPalette(v);
      for (const [lbl, hex] of [["fg0", p.fg0], ["fg1", p.fg1], ["fg2", p.fg2]] as [string, string][]) {
        expect(contrastRatio(hex, p.bg0), `${v.name}/${lbl}`).toBeGreaterThanOrEqual(7);
      }
      for (const name of Object.keys(BASE_HUES) as (keyof typeof BASE_HUES)[]) {
        expect(contrastRatio(p.accents[name], p.bg0), `${v.name}/${name}`).toBeGreaterThanOrEqual(7);
      }
    }
  });
  it("no variant uses a pure-white foreground", () => {
    for (const v of VARIANTS) {
      const fg = buildPalette(v).fg0.toLowerCase();
      expect(["#ffffff", "#fefefe", "#fdfdfd"], v.name).not.toContain(fg);
    }
  });
  it("signature variants set palette.signature; base variants do not", () => {
    const sigNames = ["dusk-azure", "cyber-salmon", "dusk-magenta", "cyber-neon-purple"];
    for (const n of sigNames) {
      const p = buildPalette(VARIANTS.find((v) => v.name === n)!);
      expect(p.signature, n).toBe(p.accents.magenta);
    }
    expect(buildPalette(VARIANTS.find((v) => v.name === "dusk")!).signature).toBeUndefined();
  });
});
