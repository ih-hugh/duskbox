import { describe, it, expect } from "vitest";
import { buildLazygit } from "./lazygit";
import { VARIANTS } from "../palette/variants";
import { buildPalette } from "../palette/types";

const dusk = VARIANTS.find((v) => v.name === "dusk")!;

describe("lazygit emitter", () => {
  it("emits a gui.theme block keyed off the palette", () => {
    const yml = buildLazygit(dusk);
    const p = buildPalette(dusk);
    expect(yml).toContain("gui:");
    expect(yml).toContain("theme:");
    expect(yml).toContain("activeBorderColor:");
    expect(yml).toContain(`- "${p.accents.blue}"`); // active border = blue accent
    expect(yml).toContain(`- "bold"`); // active border carries a bold attribute
    expect(yml).toContain(`- "${p.fg0}"`); // defaultFgColor = fg0
    expect(yml).toContain(`"*": "${p.accents.purple}"`); // author colors
  });
  it("only references colors from this variant's palette", () => {
    for (const v of VARIANTS) {
      const yml = buildLazygit(v);
      const p = buildPalette(v);
      const allowed = new Set([p.bg0, p.bg1, p.bg2, p.bg3, p.fg0, p.fg1, p.fg2, ...Object.values(p.accents)]);
      const hexes = yml.match(/#[0-9a-f]{6}/g) ?? [];
      expect(hexes.length, v.name).toBeGreaterThan(0);
      for (const h of hexes) expect(allowed.has(h), `${v.name}: ${h}`).toBe(true);
    }
  });
  it("is deterministic", () => {
    expect(buildLazygit(dusk)).toBe(buildLazygit(dusk));
  });
  it("signature variants use the signature for the active border + options; base uses blue", () => {
    const azureDusk = VARIANTS.find((v) => v.name === "dusk-azure")!;
    const sp = buildPalette(azureDusk);
    const yml = buildLazygit(azureDusk);
    expect(yml).toContain(`activeBorderColor:\n      - "${sp.signature}"`);
    expect(yml).toContain(`optionsTextColor:\n      - "${sp.signature}"`);
    // base dusk keeps blue
    const bp = buildPalette(VARIANTS.find((v) => v.name === "dusk")!);
    expect(buildLazygit(VARIANTS.find((v) => v.name === "dusk")!)).toContain(`- "${bp.accents.blue}"`);
  });
});
