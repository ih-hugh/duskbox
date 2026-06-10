import { describe, it, expect } from "vitest";
import { buildPalette } from "./types";
import { VARIANTS } from "./variants";
import { contrastRatio, isPinkish, oklchToHex } from "../oklch";

describe("v2 tier palettes", () => {
  const get = (name: string) => buildPalette(VARIANTS.find((v) => v.name === name)!);
  it("dusk anchors match the locked hybrid", () => {
    const p = get("dusk");
    expect(p.accents.red).toBe(oklchToHex(0.66, 0.200, 26));
    expect(p.accents.yellow).toBe(oklchToHex(0.83, 0.135, 92));
    expect(p.accents.orange).toBe(oklchToHex(0.74, 0.160, 55));
    expect(p.builtin).toBe(oklchToHex(0.77, 0.145, 57));
    expect(p.accents.teal).toBe(oklchToHex(0.78, 0.120, 184));
    expect(p.accents.purple).toBe(oklchToHex(0.74, 0.100, 297));
  });
  it("cyber anchors hold (continuity) and clear HC floors", () => {
    const p = get("cyber");
    expect(p.accents.red).toBe(oklchToHex(0.74, 0.220, 25));
    for (const k of ["red", "orange", "yellow", "green", "teal", "cyan", "blue", "purple"] as const)
      expect(contrastRatio(p.accents[k], p.bg0), k).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.builtin, p.bg0)).toBeGreaterThanOrEqual(7);
  });
  it("signature variants share their base's SYNTAX palette exactly (chrome-only signatures)", () => {
    const base = get("dusk"), sig = get("dusk-magenta");
    expect(sig.accents).toEqual(base.accents);
    expect(sig.builtin).toBe(base.builtin);
    expect(sig.signature).toBeDefined();
    expect(sig.signature).not.toBe(sig.accents.magenta);
  });
  it("PINK GATE: no syntax slot is pinkish on any variant", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      const syntax = [p.accents.red, p.accents.orange, p.accents.yellow, p.accents.green,
        p.accents.teal, p.accents.cyan, p.accents.blue, p.accents.purple, p.builtin, p.fgParam, p.fgVar];
      for (const hex of syntax) expect(isPinkish(hex), `${v.name} ${hex}`).toBe(false);
    }
  });
  it("tier-1 contrast floors hold (4:1 normal / 7:1 HC) on all variants", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      const floor = v.uiContrast === "high" ? 7 : 4;
      expect(contrastRatio(p.accents.red, p.bg0), v.name).toBeGreaterThanOrEqual(floor);
    }
  });
});
