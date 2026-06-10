import { describe, it, expect } from "vitest";
import { oklchToHex, contrastRatio, hexToOklch, isPinkish } from "./oklch";

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

describe("hexToOklch", () => {
  it("round-trips within quantization tolerance", () => {
    for (const [L, C, H] of [[0.66, 0.2, 26], [0.78, 0.12, 184], [0.25, 0.014, 270]] as const) {
      const { L: l2, C: c2, H: h2 } = hexToOklch(oklchToHex(L, C, H));
      expect(Math.abs(l2 - L)).toBeLessThan(0.01);
      expect(Math.abs(c2 - C)).toBeLessThan(0.01);
      expect(Math.abs(((h2 - H + 540) % 360) - 180)).toBeLessThan(5); // near-achromatic (C≈0.014) needs ~4.2° slack
    }
  });
  it("isPinkish flags the rose/fuchsia region and washed reds; clears true reds", () => {
    expect(isPinkish("#fb9795")).toBe(true);   // old keyword — washed red reads pink
    expect(isPinkish("#f78be2")).toBe(true);   // old fuchsia builtin
    expect(isPinkish(oklchToHex(0.66, 0.2, 26))).toBe(false);  // v2 ember keyword
    expect(isPinkish(oklchToHex(0.74, 0.22, 25))).toBe(false); // cyber keyword (light but chromatic)
    expect(isPinkish(oklchToHex(0.74, 0.1, 297))).toBe(false); // muted constant purple
    expect(isPinkish(oklchToHex(0.66, 0.10, 22))).toBe(false); // dusty muted red — dim, not pink
  });
});
