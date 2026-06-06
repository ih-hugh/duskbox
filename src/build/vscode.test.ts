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
});
