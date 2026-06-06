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
  it("strings render green", () => {
    const hl = buildNeovim(dusk, { bold: true });
    expect(hl.String!.fg).toBe(buildPalette(dusk).accents.green);
  });
  it("file-explorer ignored/hidden entries stay readable (not near-bg) on every variant", () => {
    for (const v of VARIANTS) {
      const hl = buildNeovim(v, { bold: true });
      const p = buildPalette(v);
      expect(contrastRatio(hl.SnacksPickerPathIgnored!.fg as string, p.bg0), v.name)
        .toBeGreaterThanOrEqual(3.0);
    }
  });
  it("LSP inlay hints are readable against their pill background on every variant", () => {
    for (const v of VARIANTS) {
      const hl = buildNeovim(v, { bold: true });
      expect(contrastRatio(hl.LspInlayHint!.fg as string, hl.LspInlayHint!.bg as string), v.name)
        .toBeGreaterThanOrEqual(3.0);
    }
  });
  it("plugin accent groups follow the variant; semantic plugin groups stay fixed", () => {
    const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
    const sp = buildPalette(cs);
    const hl = buildNeovim(cs, { bold: true });
    for (const k of ["BlinkCmpMenuBorder", "BufferLineIndicatorSelected", "NoiceCmdlinePopupBorder", "SnacksIndentScope", "SnacksPickerTitle"])
      expect(hl[k]!.fg, k).toBe(sp.signature);
    expect(hl.SnacksNotifierIconError!.fg).toBe(sp.accents.red);
    expect(hl.BufferLineModified!.fg).toBe(sp.accents.green);
    expect(buildNeovim(dusk, { bold: true }).BlinkCmpMenuBorder!.fg).toBe(buildPalette(dusk).accents.blue);
  });
  it("signature variants paint syntax + UI accent with the signature; base stays unchanged", () => {
    const azureDusk = VARIANTS.find((v) => v.name === "dusk-azure")!;
    const sp = buildPalette(azureDusk);
    const hl = buildNeovim(azureDusk, { bold: true });
    // UI accent -> signature
    for (const g of ["FloatBorder", "FloatTitle", "Title", "Directory", "Folded", "MatchParen", "CursorLineNr"]) {
      expect(hl[g]!.fg, g).toBe(sp.signature);
    }
    expect(hl.PmenuSel!.bg).toBe(sp.signature);
    expect(hl.TabLineSel!.bg).toBe(sp.signature);
    expect(hl.SnacksPickerMatch!.fg).toBe(sp.signature);
    // syntax standout -> signature (same slot)
    expect(hl["@variable.builtin"]!.fg).toBe(sp.signature);
    // semantics stay put: info stays blue, not the signature
    expect(hl.DiagnosticInfo!.fg).toBe(sp.accents.blue);
    // base dusk: original colors preserved (orange paren, yellow line-nr, blue border)
    const bp = buildPalette(dusk);
    const base = buildNeovim(dusk, { bold: true });
    expect(base.MatchParen!.fg).toBe(bp.accents.orange);
    expect(base.CursorLineNr!.fg).toBe(bp.accents.yellow);
    expect(base.FloatBorder!.fg).toBe(bp.accents.blue);
  });
});
