import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
import { buildNeovim, toLua } from "./neovim";
import { VARIANTS } from "../palette/variants";
import { buildPalette } from "../palette/types";
import { contrastRatio } from "../oklch";
import { blend } from "./blend";

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
  it("applies italic to parameter and distinguishes jsx tags", () => {
    const hl = buildNeovim(dusk, { bold: true });
    const p = buildPalette(dusk);
    // parameter: v2 slot change fg0→fgParam (moonlit-cyan blend); italic distinguishes from plain variable
    expect(hl["@variable.parameter"]!.fg).toBe(p.fgParam);
    expect(hl["@variable.parameter"]!.italic).toBe(true);
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
    // parameter is now fgParam/italic (v2 slot); italic distinguishes from plain variable
    expect(hl["@variable.parameter"]!.italic).toBe(true);
    expect(hl["@variable"]!.italic).toBeUndefined();
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
    // v2: syntax standout (@variable.builtin) uses the builtin slot (warm orange cousin), NOT magenta
    // (signature is chrome-only; syntax palette is identical on base and signature variants)
    expect(hl["@variable.builtin"]!.fg).toBe(sp.builtin);
    // semantics stay put: info stays blue, not the signature
    expect(hl.DiagnosticInfo!.fg).toBe(sp.accents.blue);
    // base dusk: original colors preserved (orange paren, yellow line-nr, blue border)
    const bp = buildPalette(dusk);
    const base = buildNeovim(dusk, { bold: true });
    expect(base.MatchParen!.fg).toBe(bp.accents.orange);
    expect(base.CursorLineNr!.fg).toBe(bp.accents.yellow);
    expect(base.FloatBorder!.fg).toBe(bp.accents.blue);
  });
  it("more plugins: accent follows variant, semantic fixed, LSP refs neutral", () => {
    const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
    const sp = buildPalette(cs);
    const hl = buildNeovim(cs, { bold: true });
    for (const k of ["WhichKey", "TroubleCount", "LspSignatureActiveParameter", "MasonHighlight", "LazySpecial"])
      expect(hl[k]!.fg, k).toBe(sp.signature);
    expect(hl.FlashLabel!.bg).toBe(sp.signature);
    expect(hl.MiniIconsGreen!.fg).toBe(sp.accents.green);
    expect(hl.RenderMarkdownChecked!.fg).toBe(sp.accents.green);
    expect(hl.LspReferenceText!.bg).toBe(sp.bg2);
    expect(Object.keys(hl).length).toBeGreaterThanOrEqual(200);
  });
});

describe("detail pass — neovim", () => {
  const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
  const p = buildPalette(cs);
  const hl = buildNeovim(cs, { bold: true });

  it("heading ladder lands on @markup.heading.1..4 (5/6 reuse 4)", () => {
    expect(hl["@markup.heading.1"]!.fg).toBe(p.headings[0]);
    expect(hl["@markup.heading.2"]!.fg).toBe(p.headings[1]);
    expect(hl["@markup.heading.4"]!.fg).toBe(p.headings[3]);
    expect(hl["@markup.heading.6"]!.fg).toBe(p.headings[3]);
    expect(hl["@markup.heading"]!.fg).toBe(p.headings[0]);
  });
  it("@markup.raw is a teal chip on bg2 (not plain string green)", () => {
    expect(hl["@markup.raw"]).toMatchObject({ fg: p.accents.teal, bg: p.bg2 });
  });
  it("punctuation dims to fgPunct; operators are cyan; wordy operators stay keyword red", () => {
    expect(hl["@punctuation.delimiter"]!.fg).toBe(p.fgPunct);
    expect(hl["@operator"]!.fg).toBe(p.accents.cyan);
    expect(hl["@keyword.operator"]!.fg).toBe(p.accents.red);
  });
  it("@lsp mirrors: parameter italic fgParam, decorator/defaultLibrary builtin, readonly var whisper, interface italic", () => {
    expect(hl["@lsp.type.parameter"]).toMatchObject({ fg: p.fgParam, italic: true });
    expect(hl["@lsp.type.decorator"]!.fg).toBe(p.builtin);
    expect(hl["@lsp.typemod.variable.readonly"]!.fg).toBe(p.fgConst); // v2.1.1: const-declared names leave plum
    expect(hl["@lsp.type.interface"]).toMatchObject({ fg: p.accents.orange, italic: true });
    // all FOUR defaultLibrary combos mirror VS Code (function/variable/method/class -> builtin role, italic)
    for (const g of ["function", "variable", "method", "class"])
      expect(hl[`@lsp.typemod.${g}.defaultLibrary`], g).toMatchObject({ fg: p.builtin, italic: true });
  });
});

describe("v2 — nvim", () => {
  const dusk = VARIANTS.find((v) => v.name === "dusk")!;
  const p = buildPalette(dusk);
  const hl = buildNeovim(dusk, { bold: true });
  it("calls are plain gold; declarations bold gold; tags plain red", () => {
    expect(hl["@function.call"]).toMatchObject({ fg: p.accents.yellow });
    expect(hl["@function.call"]!.bold).toBeUndefined();
    expect(hl["@function"]).toMatchObject({ fg: p.accents.yellow, bold: true });
    expect(hl["@tag.builtin"]!.bold).toBeUndefined();
  });
  it("this/ctor are warm builtin (no fuchsia anywhere)", () => {
    expect(hl["@variable.builtin"]!.fg).toBe(p.builtin);
    expect(hl["@constructor"]!.fg).toBe(p.builtin);
  });
  it("variables ride fgVar; params ride fgParam (incl. @lsp mirrors)", () => {
    expect(hl["@variable"]!.fg).toBe(p.fgVar);
    expect(hl["@variable.parameter"]).toMatchObject({ fg: p.fgParam, italic: true });
    expect(hl["@lsp.type.parameter"]).toMatchObject({ fg: p.fgParam, italic: true });
    expect(hl["@lsp.type.decorator"]!.fg).toBe(p.builtin);
    expect(hl["@lsp.type.decorator"]!.italic).toBeUndefined(); // decorator role: explicit syntax, no italic
  });
  it("B1 split survives LSP semantic tokens: @lsp function/method plain, .declaration bold", () => {
    expect(hl["@lsp.type.function"]).toMatchObject({ fg: p.accents.yellow });
    expect(hl["@lsp.type.function"]!.bold).toBeUndefined();
    expect(hl["@lsp.type.method"]!.bold).toBeUndefined();
    expect(hl["@lsp.typemod.function.declaration"]).toMatchObject({ fg: p.accents.yellow, bold: true });
    expect(hl["@lsp.typemod.method.declaration"]).toMatchObject({ fg: p.accents.yellow, bold: true });
  });
  it("treesitter decorators (@attribute) ride the decorator role, not red Macro", () => {
    expect(hl["@attribute"]!.fg).toBe(p.builtin);
    expect(hl["@attribute"]!.italic).toBeUndefined();
    expect(hl["@attribute.builtin"]!.fg).toBe(p.builtin);
  });
  it("Special is warm but NOT italic (legacy catch-all split off the builtin role)", () => {
    expect(hl.Special!.fg).toBe(p.builtin);
    expect(hl.Special!.italic).toBeUndefined();
  });
  it("gallery-locked: @keyword.import is moduleKw (bold); @keyword.type is orange italic; @operator is cyan", () => {
    expect(hl["@keyword.import"]!.fg).toBe(p.moduleKw);
    expect(hl["@keyword.import"]!.bold).toBe(true);
    expect(hl["@keyword.type"]!.fg).toBe(p.accents.orange);
    expect(hl["@keyword.type"]!.italic).toBe(true);
    expect(hl["@operator"]!.fg).toBe(p.accents.cyan);
    expect(hl["@operator"]!.bold).toBeUndefined();
  });
});

describe("soul pass — neovim", () => {
  const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
  const p = buildPalette(cs);
  const hl = buildNeovim(cs, { bold: true });

  it("cursor takes the variant accent (signature here)", () => {
    expect(hl.Cursor).toMatchObject({ fg: p.bg0, bg: p.signature });
    expect(hl.TermCursor).toMatchObject({ fg: p.bg0, bg: p.signature });
  });
  it("comment badges are tinted pills with readable fg (≥4:1 on all variants)", () => {
    expect(hl["@comment.todo"]!.bg).not.toBe(p.bg0);
    for (const v of VARIANTS) {
      const hh = buildNeovim(v, { bold: true });
      for (const g of ["@comment.todo", "@comment.error", "@comment.warning", "@comment.note"]) {
        expect(contrastRatio(hh[g]!.fg!, hh[g]!.bg!), `${v.name} ${g}`).toBeGreaterThanOrEqual(4);
      }
    }
  });
  it("diagnostic virtual text sits on severity-tinted chips, fg readable", () => {
    expect(hl.DiagnosticVirtualTextError!.bg).not.toBe(p.bg1);
    for (const v of VARIANTS) {
      const hh = buildNeovim(v, { bold: true });
      expect(contrastRatio(hh.DiagnosticVirtualTextError!.fg!, hh.DiagnosticVirtualTextError!.bg!), v.name).toBeGreaterThanOrEqual(4);
    }
  });
  it("@lsp.type.comment is a no-op so treesitter codetag pills win over LSP comment tokens", () => {
    expect(hl["@lsp.type.comment"]).toEqual({});
  });
  it("diff washes use spec factors, halved on HC", () => {
    const dusk = VARIANTS.find((v) => v.name === "dusk")!;
    const pd = buildPalette(dusk);
    const hd = buildNeovim(dusk, { bold: true });
    expect(hd.DiffAdd!.bg).toBe(blend(pd.bg0, pd.accents.green, 0.14));
    expect(hd.DiffChange!.bg).toBe(blend(pd.bg0, pd.accents.blue, 0.12)); // gitChange resolves to blue
    expect(hd.DiffText!.bg).toBe(blend(pd.bg0, pd.accents.blue, 0.28));
    expect(hd.DiffText!.bold).toBe(true);
    expect(hd.DiffDelete!.fg).toBeDefined();
    expect(hd.DiffDelete!.fg).not.toBe(pd.accents.red); // muted, not raw gitDelete red
    const hc = VARIANTS.find((v) => v.name === "night-hc")!;
    const ph = buildPalette(hc);
    expect(buildNeovim(hc, { bold: true }).DiffAdd!.bg).toBe(blend(ph.bg0, ph.accents.green, 0.07));
  });
});

describe("v2.1 — keyword stratification (nvim)", () => {
  const dusk = VARIANTS.find((v) => v.name === "dusk")!;
  const hl = buildNeovim(dusk, { bold: true });
  const p = buildPalette(dusk);

  it("@keyword.modifier and @keyword.coroutine are purple italic, not bold", () => {
    for (const g of ["@keyword.modifier", "@keyword.coroutine"]) {
      expect(hl[g], g).toEqual({ fg: p.accents.purple, italic: true });
    }
  });
  it("command captures stay ember bold; @keyword.type stays orange italic (the `type` keyword)", () => {
    expect(hl["@keyword"]).toMatchObject({ fg: p.accents.red, bold: true });
    expect(hl["@keyword.type"]).toMatchObject({ fg: p.accents.orange, italic: true });
  });
  it("ships after/queries that re-partition stock captures (parity with the VS Code grammar)", () => {
    const root = resolve(import.meta.dirname, "../..");
    const ecma = readFileSync(resolve(root, "after/queries/ecma/highlights.scm"), "utf8");
    const ts = readFileSync(resolve(root, "after/queries/typescript/highlights.scm"), "utf8");
    const py = readFileSync(resolve(root, "after/queries/python/highlights.scm"), "utf8");
    // EXACT first line: nvim's modeline matcher is anchored (^;+%s*extends%s*$) — trailing text
    // would silently turn these into FULL OVERRIDES that wipe stock highlights for the language.
    for (const q of [ecma, ts, py]) expect(q.split("\n")[0].trim()).toBe(";; extends");
    expect(ecma).toContain('"const"');
    expect(ecma).toContain('"class" @keyword');
    expect(ts).toContain('"interface"');
    expect(ts).toContain("type_alias_declaration");
    expect(ts).toContain("import_specifier"); // inline `import { type F }` parity (TM: keyword.control.type)
    expect(py).toContain('"global"');
  });
  it("after/queries parse with real parsers (skipped when nvim unavailable)", () => {
    const probe = spawnSync("nvim", ["--version"], { encoding: "utf8" });
    if (probe.error || probe.status !== 0) return; // no nvim in this environment — content checks above still apply
    const lua = [
      `for _, l in ipairs({{"typescript","after/queries/typescript/highlights.scm"},`,
      `{"python","after/queries/python/highlights.scm"},{"javascript","after/queries/ecma/highlights.scm"}}) do`,
      ` local has = pcall(vim.treesitter.language.inspect, l[1])`,
      ` if has then local f = io.open(l[2]); local s = f:read("*a"); f:close(); vim.treesitter.query.parse(l[1], s) end`,
      `end print("PARSE_OK")`,
    ].join(" ");
    const r = spawnSync("nvim", ["--headless", "-c", "lua " + lua, "-c", "qa!"], {
      cwd: resolve(import.meta.dirname, "../.."), encoding: "utf8", timeout: 30_000,
    });
    expect(r.stdout + r.stderr).toContain("PARSE_OK");
  });
});

describe("v2.1.1 — const-variable whisper tier (nvim)", () => {
  const dusk = VARIANTS.find((v) => v.name === "dusk")!;
  const hl = buildNeovim(dusk, { bold: true });
  const p = buildPalette(dusk);

  it("@lsp.typemod.variable.readonly rides fgConst; @constant and property.readonly stay plum", () => {
    expect(hl["@lsp.typemod.variable.readonly"]).toEqual({ fg: p.fgConst });
    expect(hl["@lsp.typemod.property.readonly"]).toEqual({ fg: p.accents.purple });
    expect(hl["@constant"]).toMatchObject({ fg: p.accents.purple });
  });
});

describe("v2.2 — dashed cyber current line (nvim)", () => {
  it("cyber family: CursorLine carries underdashed in the identity neon; others fill-only", () => {
    const cyber = buildNeovim(VARIANTS.find((v) => v.name === "cyber")!, { bold: true });
    const pc = buildPalette(VARIANTS.find((v) => v.name === "cyber")!);
    expect(cyber.CursorLine).toEqual({ bg: pc.bg2, underdashed: true, sp: pc.neonLine });
    expect(cyber.CursorColumn).toEqual({ bg: pc.bg2 }); // column unaffected
    const dusk = buildNeovim(VARIANTS.find((v) => v.name === "dusk")!, { bold: true });
    const pd = buildPalette(VARIANTS.find((v) => v.name === "dusk")!);
    expect(dusk.CursorLine).toEqual({ bg: pd.bg2 });
    const hc = buildNeovim(VARIANTS.find((v) => v.name === "night-hc")!, { bold: true });
    expect(hc.CursorLine).toEqual({ bg: buildPalette(VARIANTS.find((v) => v.name === "night-hc")!).bg2 }); // HC: no dash
  });
  it("toLua serializes underdashed (the artifact must carry it, not just the object)", () => {
    const lua = toLua({ CursorLine: { bg: "#1b1b21", underdashed: true, sp: "#18f5f6" } });
    expect(lua).toContain("underdashed = true");
    expect(lua).toContain('sp = "#18f5f6"');
  });
});
