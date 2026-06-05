import { describe, it, expect } from "vitest";
import { buildNeovim, toLua } from "./neovim";
import { VARIANTS } from "../palette/variants";
import { muteHex } from "./blend";
import { buildPalette } from "../palette/types";
import { contrastRatio } from "../oklch";

const dusk = VARIANTS.find((v) => v.name === "dusk")!;

describe("neovim emitter", () => {
  it("emits core + treesitter groups with hex fg", () => {
    const hl = buildNeovim(dusk, { bold: true });
    expect(hl["Normal"]!.fg).toMatch(/^#[0-9a-f]{6}$/);
    expect(hl["Normal"]!.bg).toMatch(/^#[0-9a-f]{6}$/);
    expect(hl["@keyword"]!.fg).toBe(hl["Keyword"]!.fg);
    expect(hl["Keyword"]!.bold).toBe(true);
    expect(hl["Type"]!.bold).toBe(true);
    expect(hl["Comment"]!.italic).toBe(true);
  });
  it("bold:false drops the bold flag", () => {
    const hl = buildNeovim(dusk, { bold: false });
    expect(hl["Keyword"]!.bold).toBeUndefined();
  });
  it("applies mute and distinguishes jsx tags", () => {
    const hl = buildNeovim(dusk, { bold: true });
    const p = buildPalette(dusk);
    expect(hl["@variable.parameter"]!.fg).toBe(muteHex(p.accents.yellow, p.fg0));
    expect(hl["@tag.builtin"]!.fg).not.toBe(hl["@tag"]!.fg);
  });
  it("serializes to a Lua return table", () => {
    const lua = toLua({ Normal: { fg: "#c0caf5", bg: "#232634" }, Keyword: { fg: "#fb817f", bold: true } });
    expect(lua).toContain("return {");
    expect(lua).toContain('["Normal"] = { fg = "#c0caf5", bg = "#232634" }');
    expect(lua).toContain("bold = true");
  });
  it("diff backgrounds are a subtle wash close to bg0", () => {
    const hl = buildNeovim(dusk, { bold: true });
    const p = buildPalette(dusk);
    expect(contrastRatio(hl.DiffAdd!.bg as string, p.bg0)).toBeLessThan(1.5);
  });
  it("key syntax roles render to distinct colors on dusk; param != variable; escape != string", () => {
    const hl = buildNeovim(dusk, { bold: true });
    const p = buildPalette(dusk);
    const vals = [hl.Keyword!.fg, hl.Function!.fg, hl.Type!.fg, hl["@variable.parameter"]!.fg,
      hl.String!.fg, hl["@string.escape"]!.fg, hl.Number!.fg, hl.Constant!.fg, hl["@property"]!.fg];
    expect(new Set(vals).size).toBe(vals.length);
    expect(hl["@variable.parameter"]!.fg).not.toBe(p.fg0);
    expect(hl["@string.escape"]!.fg).not.toBe(hl.String!.fg);
  });
});
