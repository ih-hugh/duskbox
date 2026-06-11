import { describe, it, expect } from "vitest";
import { buildVscode, uiThemeFor } from "./vscode";
import { VARIANTS } from "../palette/variants";
import { buildPalette } from "../palette/types";
import { contrastRatio } from "../oklch";

const dusk = VARIANTS.find((v) => v.name === "dusk")!;
const cyber = VARIANTS.find((v) => v.name === "cyber")!;

describe("vscode emitter", () => {
  it("produces a valid theme object", () => {
    const t = buildVscode(dusk, { bold: true });
    expect(t.name).toBe("Duskbox Dusk");
    expect(t.type).toBe("dark");
    expect(t.semanticHighlighting).toBe(true);
    expect(t.colors["editor.background"]).toMatch(/^#[0-9a-f]{6}$/);
    expect(Array.isArray(t.tokenColors)).toBe(true);
    const kw = t.tokenColors.find((s) => (Array.isArray(s.scope) ? s.scope : [s.scope]).includes("keyword"));
    expect(kw?.settings.fontStyle).toBe("bold");
    expect(t.semanticTokenColors["keyword"]).toBeDefined();
  });
  it("maps uiTheme by variant kind/contrast", () => {
    const dawn = VARIANTS.find((v) => v.name === "dawn")!;
    const dayHc = VARIANTS.find((v) => v.name === "day-hc")!;
    expect(uiThemeFor(dusk)).toBe("vs-dark");
    expect(uiThemeFor(cyber)).toBe("hc-black");
    expect(uiThemeFor(dawn)).toBe("vs");
    expect(uiThemeFor(dayHc)).toBe("hc-light");
  });
  it("signature variants accent the UI with the signature; base unchanged; git stays semantic", () => {
    const azureDusk = VARIANTS.find((v) => v.name === "dusk-azure")!;
    const sp = buildPalette(azureDusk);
    const t = buildVscode(azureDusk, { bold: true });
    expect(t.colors["focusBorder"]).toBe(sp.signature);
    expect(t.colors["editorLineNumber.activeForeground"]).toBe(sp.signature);
    expect(t.colors["button.background"]).toBe(sp.signature);
    expect(t.colors["list.highlightForeground"]).toBe(sp.signature);
    expect(t.colors["editorBracketMatch.border"]).toBe(sp.signature);
    // semantic stays: git-modified & info remain blue
    expect(t.colors["gitDecoration.modifiedResourceForeground"]).toBe(sp.accents.blue);
    expect(t.colors["editorInfo.foreground"]).toBe(sp.accents.blue);
    // base dusk unchanged; no bracket-match key added
    const bt = buildVscode(dusk, { bold: true });
    expect(bt.colors["focusBorder"]).toBe(buildPalette(dusk).accents.blue);
    expect(bt.colors["editorBracketMatch.border"]).toBeUndefined();
  });
  it("HC contrast borders: active = signature, ambient = calm; normal variants set neither", () => {
    const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
    const sp = buildPalette(cs);
    const t = buildVscode(cs, { bold: true });
    expect(t.colors["contrastActiveBorder"]).toBe(sp.signature);
    expect(t.colors["contrastBorder"]).toBeDefined();
    expect(t.colors["contrastBorder"]).not.toBe(sp.signature);
    expect(t.colors["contrastBorder"]!.toLowerCase()).not.toBe("#6fc3df");
    expect(contrastRatio(t.colors["contrastBorder"]!, sp.bg0)).toBeGreaterThanOrEqual(2.0);
    const d = buildVscode(dusk, { bold: true });
    expect(d.colors["contrastActiveBorder"]).toBeUndefined();
    expect(d.colors["contrastBorder"]).toBeUndefined();
  });
  it("accent UI keys follow the variant; selection stays a tinted surface (not the raw accent)", () => {
    const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
    const sp = buildPalette(cs);
    const t = buildVscode(cs, { bold: true });
    for (const k of ["textLink.foreground", "progressBar.background", "pickerGroup.foreground", "peekView.border", "list.focusOutline", "keybindingLabel.foreground"])
      expect(t.colors[k], k).toBe(sp.signature);
    expect(t.colors["selection.background"]).toBe(sp.bg3);
    expect(buildVscode(dusk, { bold: true }).colors["textLink.foreground"]).toBe(buildPalette(dusk).accents.blue);
  });
  it("semantic keys stay fixed (green/blue/red/yellow) even on a signature variant", () => {
    const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
    const a = buildPalette(cs).accents;
    const t = buildVscode(cs, { bold: true });
    expect(t.colors["editorGutter.addedBackground"]).toBe(a.green);
    expect(t.colors["editorGutter.deletedBackground"]).toBe(a.red);
    expect(t.colors["editorOverviewRuler.modifiedForeground"]).toBe(a.blue);
    expect(t.colors["testing.iconPassed"]).toBe(a.green);
    expect(t.colors["minimapGutter.deletedBackground"]).toBe(a.red);
  });
  it("neutral surfaces come from the bg/fg ramp; alpha on overlays; coverage floor", () => {
    const p = buildPalette(dusk);
    const t = buildVscode(dusk, { bold: true });
    expect(t.colors["editorWidget.background"]).toBe(p.bg1);
    expect(t.colors["menu.background"]).toBe(p.bg1);
    expect(t.colors["quickInput.background"]).toBe(p.bg1);
    expect(t.colors["scrollbarSlider.background"]).toMatch(/^#[0-9a-f]{6}[0-9a-f]{2}$/);
    expect(t.colors["menu.foreground"]).toBe(p.fg0);
    expect(Object.keys(t.colors).length).toBeGreaterThanOrEqual(200);
  });
});

describe("detail pass — vscode", () => {
  const dusk = VARIANTS.find((v) => v.name === "dusk")!;
  const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
  const theme = buildVscode(dusk, { bold: true });
  const themeCS = buildVscode(cs, { bold: true });
  const ruleFor = (t: ReturnType<typeof buildVscode>, sel: string) =>
    t.tokenColors.find((r) => r.scope.includes(sel));

  it("coverage floors: ≥80 scope selectors, ≥30 semantic keys", () => {
    const selectors = theme.tokenColors.flatMap((r) => r.scope);
    expect(selectors.length).toBeGreaterThanOrEqual(80);
    expect(Object.keys(theme.semanticTokenColors).length).toBeGreaterThanOrEqual(30);
  });
  it("h2 heading rides the signature ladder on cyber-salmon", () => {
    const p = buildPalette(cs);
    expect(ruleFor(themeCS, "heading.2.markdown")!.settings.foreground).toBe(p.headings[1]);
  });
  it("JSON/CSS keys are teal via propertyKey", () => {
    const p = buildPalette(dusk);
    expect(ruleFor(theme, "support.type.property-name")!.settings.foreground).toBe(p.accents.teal);
  });
  it("string quotes are protected from the punctuation dim", () => {
    const p = buildPalette(dusk);
    expect(ruleFor(theme, "punctuation.definition.string")!.settings.foreground).toBe(p.accents.green);
    expect(ruleFor(theme, "punctuation")!.settings.foreground).toBe(p.fgPunct);
  });
  it("wordy operators stay keyword red while symbolic operators are cyan", () => {
    const p = buildPalette(dusk);
    expect(ruleFor(theme, "keyword.operator.expression")!.settings.foreground).toBe(p.accents.red);
    expect(ruleFor(theme, "keyword.operator")!.settings.foreground).toBe(p.accents.cyan);
  });
  it("semantic: parameter italic; decorator rides the builtin slot; readonly is constant-purple", () => {
    const p = buildPalette(cs);
    expect(themeCS.semanticTokenColors["parameter"]!.italic).toBe(true);
    expect(themeCS.semanticTokenColors["decorator"]!.foreground).toBe(p.builtin); // v2: builtin slot (warm, not magenta)
    expect(themeCS.semanticTokenColors["variable.readonly"]!.foreground).toBe(p.accents.purple);
    expect(themeCS.semanticTokenColors["interface"]!.italic).toBe(true);
  });
  it("markdown link underlines via fontStyle", () => {
    expect(ruleFor(theme, "markup.underline.link")!.settings.fontStyle).toContain("underline");
  });
  it("descendant guard selectors are present verbatim", () => {
    const selectors = theme.tokenColors.flatMap((r) => r.scope);
    expect(selectors).toContain("heading.2.markdown punctuation.definition.heading");
    expect(selectors).toContain("support.type.property-name punctuation");
  });
});

describe("v2 — vscode", () => {
  const dusk = VARIANTS.find((v) => v.name === "dusk")!;
  const t = buildVscode(dusk, { bold: true });
  const pd = buildPalette(dusk);
  const ruleOf = (sel: string) => {
    const rule = t.tokenColors.find((r) => r.scope.includes(sel));
    expect(rule, `no tokenColors rule carries scope "${sel}"`).toBeDefined();
    return rule!;
  };
  it("function calls unbolded, declarations bold", () => {
    expect(ruleOf("meta.function-call").settings.fontStyle ?? "").not.toContain("bold");
    expect(ruleOf("entity.name.function").settings.fontStyle).toContain("bold");
  });
  it("call-site descendant guard carries an EXPLICIT empty fontStyle (absence inherits bold at trie insert)", () => {
    const selectors = t.tokenColors.flatMap((r) => r.scope);
    expect(selectors).toContain("meta.function-call entity.name.function");
    expect(ruleOf("meta.function-call entity.name.function").settings.fontStyle).toBe("");
  });
  it("semantic function/method carry explicit bold:false (no TextMate bold fall-through)", () => {
    expect(t.semanticTokenColors["function"]!.bold).toBe(false);
    expect(t.semanticTokenColors["method"]!.bold).toBe(false);
    expect(t.semanticTokenColors["function.declaration"]!.bold).toBe(true);
  });
  it("this on builtin warm; semantic parameter/variable on their tiers; decl split present", () => {
    expect(ruleOf("variable.language").settings.foreground).toBe(pd.builtin);
    expect(t.semanticTokenColors["parameter"]!.foreground).toBe(pd.fgParam);
    expect(t.semanticTokenColors["variable"]!.foreground).toBe(pd.fgVar);
    expect(t.semanticTokenColors["function.declaration"]!.foreground).toBe(pd.accents.yellow);
    expect(t.semanticTokenColors["decorator"]!.foreground).toBe(pd.builtin);
    expect(t.semanticTokenColors["decorator"]!.italic).toBeUndefined(); // decorator role: explicit syntax, no italic
  });
  it("gallery-locked: keyword.control.import is moduleKw+bold, keyword.control.type is orange+italic, keyword.operator is cyan", () => {
    expect(ruleOf("keyword.control.import").settings.foreground).toBe(pd.moduleKw);
    expect(ruleOf("keyword.control.import").settings.fontStyle).toContain("bold");
    expect(ruleOf("keyword.control.type").settings.foreground).toBe(pd.accents.orange);
    expect(ruleOf("keyword.control.type").settings.fontStyle).toContain("italic");
    expect(ruleOf("keyword.operator").settings.foreground).toBe(pd.accents.cyan);
  });
});

describe("soul pass — vscode", () => {
  const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
  const soulCS = buildVscode(cs, { bold: true });
  const pcs = buildPalette(cs);
  it("cursor rides the variant accent", () => {
    expect(soulCS.colors["editorCursor.foreground"]).toBe(pcs.signature);
    expect(soulCS.colors["editorCursor.background"]).toBe(pcs.bg0);
    expect(soulCS.colors["terminalCursor.foreground"]).toBe(pcs.signature);
  });
  it("severity ranges get faint washes (halved alpha on HC)", () => {
    const dusk = VARIANTS.find((v) => v.name === "dusk")!;
    const t = buildVscode(dusk, { bold: true });
    const pd = buildPalette(dusk);
    expect(t.colors["editorError.background"]).toBe(pd.accents.red + "1a");
    expect(soulCS.colors["editorError.background"]).toBe(pcs.accents.red + "0d"); // cyber-salmon is HC
  });
  it("diff factors per spec; merge uses teal/blue", () => {
    const dusk = VARIANTS.find((v) => v.name === "dusk")!;
    const t = buildVscode(dusk, { bold: true });
    const pd = buildPalette(dusk);
    expect(t.colors["diffEditor.insertedTextBackground"]).toBe(pd.accents.green + "26");
    expect(t.colors["diffEditor.insertedLineBackground"]).toBe(pd.accents.green + "14");
    expect(t.colors["merge.currentContentBackground"]).toBe(pd.accents.teal + "14");
    expect(t.colors["merge.incomingContentBackground"]).toBe(pd.accents.blue + "14");
    // HC halves
    expect(soulCS.colors["diffEditor.insertedTextBackground"]).toBe(pcs.accents.green + "13");
  });
  it("cyber family merges use green for 'current' (M1 — teal/blue too close on the neon wheel)", () => {
    expect(soulCS.colors["merge.currentContentBackground"]).toBe(pcs.accents.green + "0a");
    expect(soulCS.colors["merge.currentHeaderBackground"]).toBe(pcs.accents.green + "1a");
    expect(soulCS.colors["merge.incomingContentBackground"]).toBe(pcs.accents.blue + "0a");
  });
});

describe("v2.1 — keyword stratification (vscode)", () => {
  const dusk = VARIANTS.find((v) => v.name === "dusk")!;
  const t = buildVscode(dusk, { bold: true });
  const p = buildPalette(dusk);
  const rule = (sel: string) => t.tokenColors.find((r) => r.scope.includes(sel));

  it("modifier scopes paint purple italic, not bold", () => {
    for (const sel of ["storage.modifier", "storage.type.ts", "storage.type.tsx", "storage.type.js", "storage.type.function.async"]) {
      const r = rule(sel);
      expect(r, sel).toBeDefined();
      expect(r!.settings.foreground).toBe(p.accents.purple);
      expect(r!.settings.fontStyle).toBe("italic"); // SET value — no trie inheritance hazard
    }
  });
  it("keyword family no longer claims storage.modifier; bare storage.type stays command red", () => {
    const kw = rule("storage.type")!;
    expect(kw.settings.foreground).toBe(p.accents.red);
    expect(kw.scope).not.toContain("storage.modifier");
  });
  it("type keyword and moduleKw scopes are untouched", () => {
    expect(rule("storage.type.type")!.settings.foreground).toBe(p.accents.orange);
    expect(rule("keyword.control.import")!.settings.foreground).toBe(p.moduleKw);
  });
  it("cross-language guards: non-modifier storage.modifier.* scopes stay out of the modifier class", () => {
    // vscode-textmate sorts rules by scope at trie insert, so storage.modifier (italic) is ALWAYS
    // the parent these deeper rules clone from — every guard must carry a SET fontStyle.
    const imp = rule("storage.modifier.import")!;
    expect(imp.settings.foreground).toBe(p.accents.red); // Java/Groovy dotted paths — exact v2.0 render
    expect(imp.settings.fontStyle).toBe("bold");
    const glyph = rule("storage.modifier.pointer")!;
    expect(glyph.scope).toContain("storage.modifier.reference");
    expect(glyph.scope).toContain("storage.modifier.array.bracket.square");
    expect(glyph.settings.foreground).toBe(p.accents.cyan); // declarator glyphs ride the operator voice
    expect(glyph.settings.fontStyle).toBe("bold"); // matches keyword.operator's rendered weight; never italic
    const attr = rule("storage.modifier.attribute")!;
    expect(attr.settings.foreground).toBe(p.builtin); // Swift @attribute — decorator home, warm
    expect(attr.settings.fontStyle).toBe(""); // EXPLICIT none — unset would clone the modifier italic
    // Java `class/interface/enum` (meta.class.identifier) and `record` (nested separately under
    // meta.record.identifier — see repository/record in java.tmLanguage.json)
    for (const sel of ["meta.class.identifier storage.modifier", "meta.record.identifier storage.modifier"]) {
      const r = rule(sel);
      expect(r, sel).toBeDefined();
      expect(r!.settings.foreground).toBe(p.accents.red);
      expect(r!.settings.fontStyle).toBe("bold");
    }
  });
});
