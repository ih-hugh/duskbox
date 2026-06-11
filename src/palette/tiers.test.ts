import { describe, it, expect } from "vitest";
import { buildPalette } from "./types";
import type { AccentName } from "./types";
import { VARIANTS } from "./variants";
import { SLOT_LC, BUILTIN_LC, TIER_HUES, type Archetype } from "./tiers";
import { contrastRatio, hexToOklch, isPinkish, oklchToHex } from "../oklch";

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
  it("per-archetype anchors (mutation guard: one exact-hex pin per non-dusk archetype)", () => {
    // hc-dark (night-hc): red from the archetype table; green from the variant cap (tier-1 fix)
    const nhc = get("night-hc");
    expect(nhc.accents.red).toBe("#fe7f76");
    expect(nhc.accents.green).toBe("#94e282");
    // normal-light (dawn)
    const dawn = get("dawn");
    expect(dawn.accents.red).toBe("#be2327");
    expect(dawn.accents.orange).toBe("#974c00");
    // hc-light (day-hc)
    expect(get("day-hc").accents.red).toBe("#9e0213");
  });
  it("night-hc: red is the most chromatic syntax accent (tier-1 identity, post green cap)", () => {
    const p = get("night-hc");
    const redC = hexToOklch(p.accents.red).C;
    for (const k of ["orange", "yellow", "green", "teal", "cyan", "blue", "purple"] as const)
      expect(hexToOklch(p.accents[k]).C, k).toBeLessThanOrEqual(redC);
  });
  it("signature variants share their base's SYNTAX palette exactly (chrome-only signatures)", () => {
    const base = get("dusk"), sig = get("dusk-magenta");
    expect(sig.accents).toEqual(base.accents);
    expect(sig.builtin).toBe(base.builtin);
    expect(sig.signature).toBeDefined();
    expect(sig.signature).not.toBe(sig.accents.magenta);
  });
  it("PINK GATE: no v2-retained syntax slot is pinkish (magenta leaves syntax in the role retarget)", () => {
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
  it("builtin is perceptibly distinct from orange on every variant (ΔE ≥ 0.025)", () => {
    const dE = (h1: string, h2: string) => {
      const a = hexToOklch(h1), b = hexToOklch(h2);
      const rad = (d: number) => (d * Math.PI) / 180;
      return Math.hypot(
        a.L - b.L,
        a.C * Math.cos(rad(a.H)) - b.C * Math.cos(rad(b.H)),
        a.C * Math.sin(rad(a.H)) - b.C * Math.sin(rad(b.H)),
      );
    };
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      expect(dE(p.builtin, p.accents.orange), v.name).toBeGreaterThanOrEqual(0.025);
    }
  });
  it("builtin clears contrast floors on every variant (4/7)", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      const floor = v.uiContrast === "high" ? 7 : 4;
      expect(contrastRatio(p.builtin, p.bg0), v.name).toBeGreaterThanOrEqual(floor);
    }
  });
});

describe("authored-vs-effective drift guard", () => {
  // Cells whose authored chroma intentionally exceeds the sRGB gamut at their L/hue — the clamp
  // is accepted (audit 2026-06): the bright HC bands and the warm light-side slots hit the gamut
  // ceiling by design. This set documents reality; the assertion below stops NEW silent clamps.
  const KNOWN_CLAMPED = new Set([
    "hc-dark/red", "hc-dark/orange", "hc-dark/cyan", "hc-dark/blue", "hc-dark/purple",
    "normal-light/orange", "normal-light/teal", "normal-light/cyan",
    "hc-light/red", "hc-light/orange", "hc-light/yellow", "hc-light/teal", "hc-light/cyan",
    "hc-light/builtin",
  ]);
  it("every SLOT_LC and BUILTIN_LC cell holds its authored chroma (±0.012) unless documented", () => {
    for (const arch of Object.keys(SLOT_LC) as Archetype[]) {
      for (const slot of Object.keys(TIER_HUES) as AccentName[]) {
        if (KNOWN_CLAMPED.has(`${arch}/${slot}`)) continue;
        const [L, C] = SLOT_LC[arch][slot];
        const eff = hexToOklch(oklchToHex(L, C, TIER_HUES[slot]));
        expect(eff.C, `${arch}/${slot} authored C=${C}`).toBeGreaterThanOrEqual(C - 0.012);
      }
      if (!KNOWN_CLAMPED.has(`${arch}/builtin`)) {
        const [bL, bC] = BUILTIN_LC[arch];
        const eff = hexToOklch(oklchToHex(bL, bC, TIER_HUES.orange + 2));
        expect(eff.C, `${arch}/builtin authored C=${bC}`).toBeGreaterThanOrEqual(bC - 0.012);
      }
    }
  });

  it("GALLERY-APPROVED v2 fixtures: bg0 + tier-1 red pinned for all 16", () => {
    const PINNED: [string, string, string][] = [
      ["dawn", "#faf2e9", "#be2327"], ["day", "#f9fafc", "#be2327"], ["day-hc", "#ffffff", "#9e0213"],
      ["storm", "#262e3b", "#fe736a"], ["dusk", "#1f202e", "#f4514c"], ["midnight", "#0c101c", "#f4514c"],
      ["night-hc", "#171a25", "#fe7f76"], ["cyber", "#13131c", "#fe7f78"],
      ["dusk-azure", "#19222e", "#f4514c"], ["cyber-azure", "#0d131c", "#fe7f78"],
      ["dusk-neon-purple", "#20202d", "#f4514c"], ["cyber-neon-purple", "#13111c", "#fe7f78"],
      ["dusk-magenta", "#231f2c", "#f4514c"], ["cyber-magenta", "#15101b", "#fe7f78"],
      ["dusk-salmon", "#291d27", "#f4514c"], ["cyber-salmon", "#190f16", "#fe7f78"],
    ];
    for (const [name, bg0, red] of PINNED) {
      const p = buildPalette(VARIANTS.find((v) => v.name === name)!);
      expect(p.bg0, name + " bg0").toBe(bg0);
      expect(p.accents.red, name + " red").toBe(red);
    }
  });
});
