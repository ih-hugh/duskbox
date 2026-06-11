import { describe, it, expect } from "vitest";
import { buildGhostty } from "./ghostty";
import { VARIANTS } from "../palette/variants";
import { buildPalette } from "../palette/types";

const dusk = VARIANTS.find((v) => v.name === "dusk")!;

describe("ghostty emitter", () => {
  it("emits a Ghostty-compatible theme with required colors and 16 ANSI palette entries", () => {
    const conf = buildGhostty(dusk);
    const p = buildPalette(dusk);
    expect(conf).toContain(`background = ${p.bg0}`);
    expect(conf).toContain(`foreground = ${p.fg0}`);
    expect(conf).toContain(`cursor-color = ${p.accents.blue}`);
    expect(conf.match(/^palette = \d+=#[0-9a-f]{6}$/gm)).toHaveLength(16);
  });

  it("maps ANSI colors from the variant palette", () => {
    const conf = buildGhostty(dusk);
    const p = buildPalette(dusk);
    expect(conf).toContain(`palette = 0=${p.bg2}`);
    expect(conf).toContain(`palette = 1=${p.accents.red}`);
    expect(conf).toContain(`palette = 2=${p.accents.green}`);
    expect(conf).toContain(`palette = 3=${p.accents.yellow}`);
    expect(conf).toContain(`palette = 4=${p.accents.blue}`);
    expect(conf).toContain(`palette = 5=${p.accents.magenta}`);
    expect(conf).toContain(`palette = 6=${p.accents.cyan}`);
    expect(conf).toContain(`palette = 7=${p.fg1}`);
    expect(conf).toContain(`palette = 8=${p.bg3}`);
    expect(conf).toContain(`palette = 15=${p.fg0}`);
  });

  it("only references colors from this variant's palette", () => {
    for (const v of VARIANTS) {
      const conf = buildGhostty(v);
      const p = buildPalette(v);
      const allowed = new Set([
        p.bg0, p.bg1, p.bg2, p.bg3, p.fg0, p.fg1, p.fg2, p.builtin,
        ...(p.signature ? [p.signature] : []), ...Object.values(p.accents),
      ]);
      const hexes = conf.match(/#[0-9a-f]{6}/g) ?? [];
      expect(hexes.length, v.name).toBeGreaterThan(0);
      for (const h of hexes) expect(allowed.has(h), `${v.name}: ${h}`).toBe(true);
    }
  });

  it("signature variants use the signature for cursor chrome; base uses blue", () => {
    const azureDusk = VARIANTS.find((v) => v.name === "dusk-azure")!;
    const sp = buildPalette(azureDusk);
    expect(buildGhostty(azureDusk)).toContain(`cursor-color = ${sp.signature}`);
    expect(buildGhostty(dusk)).toContain(`cursor-color = ${buildPalette(dusk).accents.blue}`);
  });

  it("is deterministic", () => {
    expect(buildGhostty(dusk)).toBe(buildGhostty(dusk));
  });
});
