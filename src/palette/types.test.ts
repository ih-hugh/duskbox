import { describe, it, expect } from "vitest";
import { buildPalette, BASE_HUES } from "./types";
import type { VariantConfig } from "./types";
import { VARIANTS } from "./variants";
import { contrastRatio, hexToOklch, isPinkish, oklchToHex } from "../oklch";
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
  it("floor loop ensures bg-material punct clears the readability floor on a synthetic stage", () => {
    // bg-material punct is derived from the stage, not from fg — no fg-proximity guarantee.
    // The invariant is: clears floor AND is a valid hex.
    const synthetic: VariantConfig = {
      name: "synthetic-low", kind: "dark", uiContrast: "normal",
      bg: [0.265, 0.018, 278], fg: [0.55, 0.035, 265], accentL: 0.78, accentC: 0.12,
    };
    const p = buildPalette(synthetic);
    expect(contrastRatio(p.fgPunct, p.bg0)).toBeGreaterThanOrEqual(3.0);
    expect(p.fgPunct).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("v2 stages & ladder", () => {
  const get = (name: string) => buildPalette(VARIANTS.find((v) => v.name === name)!);
  it("gallery-relocked stages: moody fixtures hold (v1.4 bg tuples, chroma ×2.0, half-lean)", () => {
    expect(get("dusk").bg0).toBe("#232336");      // indigo lean 290 — v1.4 byte-exact
    expect(get("storm").bg0).toBe("#262e3e");     // slate lean 250
    expect(get("midnight").bg0).toBe("#0a0f22");  // deep lean 265
    expect(get("dawn").bg0).toBe("#faf2e8");      // warm cream lean 60
    expect(get("dusk-azure").bg0).toBe("#24263a");   // v2.3 T2: dusk slate + 2% azure pigment
    expect(get("dusk-salmon").bg0).toBe("#272538");  // v2.3 T2: dusk slate + 2% salmon pigment
    expect(get("cyber-salmon").bg0).toBe("#1a0e16"); // signature lean, bgHex ignored
  });
  it("v2.3: dusk children = base slate + 2% signature pigment (formula identity); cyber children still lean", () => {
    const d = get("dusk"), sm = get("dusk-salmon");
    expect(sm.bg0).toBe(blend(d.bg0, sm.signature!, 0.02));
    expect(sm.bg1).toBe(blend(d.bg1, sm.signature!, 0.02));
    expect(sm.bg2).toBe(blend(d.bg2, sm.signature!, 0.02));
    expect(get("dusk-magenta").bg0).toBe("#27253a");
    expect(get("dusk-neon-purple").bg0).toBe("#26263a");
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
  it("fgVar (lavender tier) is lighter than fg0 (dark) / darker (light); hue in 270–300; contrast floor on all", () => {
    const d = get("dusk"), l = get("dawn");
    expect(hexToOklch(d.fgVar).L).toBeGreaterThan(hexToOklch(d.fg0).L);
    expect(hexToOklch(l.fgVar).L).toBeLessThan(hexToOklch(l.fg0).L);
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      const { L, H } = hexToOklch(p.fgVar);
      const floor = v.uiContrast === "high" ? 7 : 4.5;
      expect(contrastRatio(p.fgVar, p.bg0), v.name + " contrast").toBeGreaterThanOrEqual(floor);
      expect(H, v.name + " hue").toBeGreaterThanOrEqual(270);
      expect(H, v.name + " hue").toBeLessThanOrEqual(300);
      expect(L, v.name).toBeGreaterThan(0);
    }
  });
  it("fgParam is the moonlit blend (unchanged mechanism)", () => {
    const p = get("dusk");
    expect(p.fgParam).toBe(blend(p.fg0, p.accents.cyan, 0.30));
  });
  it("fgPunct (bg-material) hue tracks the variant's mood hue (±20° of moodH) on dark variants", () => {
    // bg-material: fgPunct derives from moodC/moodH (mood = halfLean(bgH, bgLean ?? signature)).
    // The gamut clamp on the enriched-chroma step can nudge H, but it must stay near the stage's
    // mood — observed deltas are ≤ ~1°; ±20° leaves room without letting a hue swap sneak in.
    // (Light variants are excluded: day-hc's zero-chroma gray has no meaningful hue.)
    const moodHueOf = (bgH: number, lean: number | undefined) => {
      if (lean === undefined) return bgH;
      const d = ((lean - bgH + 540) % 360) - 180;
      return ((bgH + d / 2) % 360 + 360) % 360;
    };
    const circDelta = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
    for (const v of VARIANTS.filter((v) => v.kind === "dark")) {
      const p = buildPalette(v);
      const floor = v.uiContrast === "high" ? 4.5 : 3.0;
      expect(contrastRatio(p.fgPunct, p.bg0), v.name).toBeGreaterThanOrEqual(floor);
      const moodH = moodHueOf(v.bg[2], v.bgLean ?? v.signature);
      expect(circDelta(hexToOklch(p.fgPunct).H, moodH), v.name + " fgPunct hue drift").toBeLessThanOrEqual(20);
    }
  });
  it("moduleKw gallery-locked pins: dusk / dusk-azure / dusk-salmon / cyber", () => {
    expect(get("dusk").moduleKw).toBe("#ae93fd"); // v2.3 brightened
    expect(get("dusk-azure").moduleKw).toBe("#4eaeff"); // v2.3 brightened
    expect(get("dusk-salmon").moduleKw).toBe("#ff8a6f"); // v2.1 vivid-salmon band (screen 22 B)
    expect(get("cyber").moduleKw).toBe("#b197fe");
    expect(get("dusk-magenta").moduleKw).toBe(get("dusk").moduleKw); // sig>=300 falls back to the 255 anchor — same walk as base
    expect(get("cyber-magenta").moduleKw).toBe(get("cyber").moduleKw); // sig>=300 falls back to the 255 anchor — same walk as base
  });
  it("salmon boundary: moduleKw jumps to the vivid-salmon band when the walk can't leave red", () => {
    // screen 22 option B (locked): walks landing within 12° of red jump to oklch(0.755, 0.16, 34).
    expect(get("dusk-salmon").moduleKw).toBe("#ff8a6f");
    expect(get("cyber-salmon").moduleKw).toBe("#ff8a6f");
  });
  it("moduleKw pink gate: no variant moduleKw is pinkish", () => {
    for (const v of VARIANTS) {
      const { moduleKw } = buildPalette(v);
      expect(isPinkish(moduleKw), v.name + " moduleKw pinkish").toBe(false);
    }
  });
});

describe("v2.1.1 — const-variable whisper tier", () => {
  const get = (name: string) => buildPalette(VARIANTS.find((v) => v.name === name)!);
  it("fgConst is the 35% fgVar→purple blend (screen 24 A); dusk pin holds", () => {
    const p = get("dusk");
    expect(p.fgConst).toBe(blend(p.fgVar, p.fgMod, 0.35)); // v2.3: follows the modifier lane
    expect(p.fgConst).toBe("#b3caff"); // blue-cast whisper (v2.3)
  });
  it("fgConst clears the variable floor and the pink gate on every variant", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      const floor = v.uiContrast === "high" ? 7 : 4.5;
      expect(contrastRatio(p.fgConst, p.bg0), v.name).toBeGreaterThanOrEqual(floor);
      expect(isPinkish(p.fgConst), v.name + " fgConst pinkish").toBe(false);
    }
  });
});

describe("v2.2 — neon selection (cyber + HC)", () => {
  const get = (name: string) => buildPalette(VARIANTS.find((v) => v.name === name)!);
  it("S1 pins: the 7 affected variants select in their identity hue", () => {
    expect(get("cyber").bg3).toBe("#0f3434");
    expect(get("cyber-azure").bg3).toBe("#173140");
    expect(get("cyber-neon-purple").bg3).toBe("#312940");
    expect(get("cyber-magenta").bg3).toBe("#38273a");
    expect(get("cyber-salmon").bg3).toBe("#402620");
    expect(get("night-hc").bg3).toBe("#1a3c44");
    expect(get("day-hc").bg3).toBe("#bce1e9");
  });
  it("everyone else is byte-identical (selection confirmed fine outside cyber/HC)", () => {
    expect(get("dusk").bg3).toBe("#253a55");
    expect(get("dusk-azure").bg3).toBe("#193e51");
    expect(get("storm").bg3).toBe("#31445c");
  });
  it("fg0 stays readable on the new selections (4.5:1, 7:1 HC)", () => {
    for (const n of ["cyber", "cyber-azure", "cyber-neon-purple", "cyber-magenta", "cyber-salmon", "night-hc", "day-hc"]) {
      const v = VARIANTS.find((x) => x.name === n)!;
      const p = buildPalette(v);
      const floor = v.uiContrast === "high" ? 7 : 4.5;
      expect(contrastRatio(p.fg0, p.bg3), n).toBeGreaterThanOrEqual(floor);
    }
  });
  it("neonLine: set exactly on the cyber family (= signature ?? cyber cyan), absent elsewhere", () => {
    expect(get("cyber").neonLine).toBe(get("cyber").accents.cyan);
    expect(get("cyber-azure").neonLine).toBe(get("cyber-azure").signature);
    expect(get("night-hc").neonLine).toBeUndefined();
    expect(get("dusk").neonLine).toBeUndefined();
  });
});

describe("v2.3 — modifier + string lanes", () => {
  const get = (name: string) => buildPalette(VARIANTS.find((v) => v.name === name)!);
  it("fgMod: electric blue per archetype; cyber keeps periwinkle", () => {
    expect(get("dusk").fgMod).toBe("#60a7ff");
    expect(get("night-hc").fgMod).toBe("#87bafd");
    expect(get("dawn").fgMod).toBe("#045cb2");
    expect(get("day-hc").fgMod).toBe("#004b96");
    expect(get("cyber").fgMod).toBe(get("cyber").accents.purple);
  });
  it("fgString: seafoam per archetype; green accent untouched; cyber keeps neon green", () => {
    expect(get("dusk").fgString).toBe("#8bdbb7");
    expect(get("night-hc").fgString).toBe("#8bebc1");
    expect(get("cyber").fgString).toBe(get("cyber").accents.green);
    expect(get("dusk").accents.green).toBe("#89cc7b");
  });
  it("lanes clear the readability floors on every variant", () => {
    for (const v of VARIANTS) {
      const p = buildPalette(v);
      const floor = v.uiContrast === "high" ? 7 : 4.5;
      expect(contrastRatio(p.fgMod, p.bg0), v.name + " fgMod").toBeGreaterThanOrEqual(floor);
      expect(contrastRatio(p.fgString, p.bg0), v.name + " fgString").toBeGreaterThanOrEqual(floor);
    }
  });
});
