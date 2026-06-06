import { describe, it, expect } from "vitest";
import { buildVscode, uiThemeFor } from "./vscode";
import { VARIANTS } from "../palette/variants";
import { buildPalette } from "../palette/types";

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
});
