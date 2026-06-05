import { describe, it, expect } from "vitest";
import { oklchToHex, contrastRatio } from "./oklch";

describe("oklch", () => {
  it("converts known OKLCH to hex (white/black)", () => {
    expect(oklchToHex(1, 0, 0)).toBe("#ffffff");
    expect(oklchToHex(0, 0, 0)).toBe("#000000");
  });
  it("produces a 6-digit hex", () => {
    expect(oklchToHex(0.78, 0.12, 25)).toMatch(/^#[0-9a-f]{6}$/);
  });
  it("clamps out-of-gamut chroma instead of throwing", () => {
    expect(oklchToHex(0.6, 0.5, 145)).toMatch(/^#[0-9a-f]{6}$/);
  });
  it("computes WCAG contrast (white on black = 21)", () => {
    expect(Math.round(contrastRatio("#ffffff", "#000000"))).toBe(21);
  });
});
