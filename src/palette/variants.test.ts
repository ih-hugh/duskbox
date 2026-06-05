import { describe, it, expect } from "vitest";
import { VARIANTS, VARIANT_NAMES } from "./variants";
import { buildPalette } from "./types";
import { contrastRatio } from "../oklch";

describe("variants", () => {
  it("defines exactly the 8 expected variants", () => {
    expect(VARIANT_NAMES).toEqual(["dawn","day","day-hc","storm","dusk","midnight","night-hc","cyber"]);
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
  it("cyber uses the portfolio near-black background", () => {
    const cyber = VARIANTS.find((v) => v.name === "cyber")!;
    expect(buildPalette(cyber).bg0).toBe("#0a0a0f");
  });
});
