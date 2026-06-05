import { describe, it, expect } from "vitest";
import { buildVscode, uiThemeFor } from "./vscode";
import { VARIANTS } from "../palette/variants";

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
    expect(uiThemeFor(dusk)).toBe("vs-dark");
    expect(uiThemeFor(cyber)).toBe("hc-black");
  });
});
