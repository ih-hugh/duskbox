import { describe, it, expect } from "vitest";
import { TOKENS, slot, type TokenStyle } from "./tokens";
import { BASE_HUES, buildPalette } from "./palette/types";
import { VARIANTS } from "./palette/variants";

const VALID = new Set([...Object.keys(BASE_HUES), "fg0", "fg1", "fg2", "h1", "h2", "h3", "h4", "punct", "builtin", "param", "var", "moduleKw"]);

describe("tokens", () => {
  it("every role maps to a valid color slot", () => {
    for (const [role, s] of Object.entries(TOKENS)) expect(VALID.has(s.color), role).toBe(true);
  });
  it("keyword, type, and function are bold; comments italic+muted", () => {
    expect(TOKENS.keyword.bold).toBe(true);
    expect(TOKENS.type.bold).toBe(true);
    expect(TOKENS.function.bold).toBe(true);
    expect(TOKENS.comment.italic).toBe(true);
    expect(TOKENS.comment.color).toBe("fg2");
  });
  it("green is limited to string + diagnostics/git (no other syntax role is green)", () => {
    const allowedGreen = new Set(["string", "ok", "gitAdd", "stringQuote"]);
    for (const [role, s] of Object.entries(TOKENS)) {
      if (s.color === "green") expect(allowedGreen.has(role), `${role} unexpectedly green`).toBe(true);
    }
    expect(TOKENS.string.color).toBe("green");
  });
  it("high-frequency roles are mutually distinct (slot+mute+italic combo)", () => {
    const hi = ["keyword","function","type","parameter","variable","string","number","constant","property"];
    const keys = hi.map((r) => { const t = (TOKENS as any)[r]; return `${t.color}:${t.mute ? 1 : 0}:${t.italic ? 1 : 0}`; });
    expect(new Set(keys).size).toBe(hi.length);
  });
  it("native tag and custom component are distinct colors", () => {
    expect(TOKENS.tagNative.color).not.toBe(TOKENS.tagComponent.color);
  });
});

describe("detail-pass roles", () => {
  const p = buildPalette(VARIANTS.find((v) => v.name === "dusk")!);
  it("heading roles resolve to the palette ladder via slot()", () => {
    expect(slot(p, "h1")).toBe(p.headings[0]);
    expect(slot(p, "h4")).toBe(p.headings[3]);
  });
  it("punct slot resolves to fgPunct", () => {
    expect(slot(p, "punct")).toBe(p.fgPunct);
  });
  it("identity changes: operator is cyan; punctuation is punct; parameter is italic param slot", () => {
    expect(TOKENS.operator.color).toBe("cyan");
    expect(TOKENS.punctuation.color).toBe("punct");
    expect(TOKENS.parameter).toEqual({ color: "param", italic: true });
  });
  it("guard roles exist: quotes stay string-colored, wordy operators stay keywords", () => {
    expect(TOKENS.stringQuote.color).toBe("green");
    expect(TOKENS.wordOperator).toEqual({ color: "red", bold: true });
  });
  it("interface is distinct from class (italic vs bold orange)", () => {
    expect(TOKENS.typeInterface).toEqual({ color: "orange", italic: true });
  });
  it("typeKeyword role exists: orange italic (type keyword split)", () => {
    expect(TOKENS.typeKeyword).toEqual({ color: "orange", italic: true });
  });
  it("moduleKw role exists: moduleKw slot, bold (gallery-locked module boundary)", () => {
    expect(TOKENS.moduleKw).toEqual({ color: "moduleKw", bold: true });
    expect(slot(p, "moduleKw")).toBe(p.moduleKw);
  });
});

describe("v2 roles", () => {
  it("B1 bold budget: declarations/keywords/types bold; calls and tags plain", () => {
    expect(TOKENS.function.bold).toBe(true);
    expect((TOKENS.functionCall as TokenStyle).bold).toBeUndefined();
    expect((TOKENS.methodCall as TokenStyle).bold).toBeUndefined();
    expect((TOKENS.tagNative as TokenStyle).bold).toBeUndefined();
    expect((TOKENS.tagComponent as TokenStyle).bold).toBeUndefined();
  });
  it("builtins/ctor/preproc leave magenta; nothing in TOKENS references magenta", () => {
    expect(TOKENS.builtin.color).toBe("builtin");
    expect(TOKENS.ctor.color).toBe("builtin");
    expect(TOKENS.preproc.color).toBe("red");
    for (const [k, s] of Object.entries(TOKENS)) expect(s.color, k).not.toBe("magenta");
  });
  it("variables and parameters have their slots", () => {
    expect(TOKENS.variable.color).toBe("var");
    expect(TOKENS.parameter).toEqual({ color: "param", italic: true });
  });
});

describe("v2.1 roles", () => {
  it("keywordModifier (v2.1): purple tier, italic, NOT bold — the Tokyo split", () => {
    expect(TOKENS.keywordModifier).toEqual({ color: "purple", italic: true });
    // command class unchanged: red bold ("ember" in design docs)
    for (const r of ["keyword", "conditional", "repeat", "exception", "keywordReturn"] as const) {
      expect(TOKENS[r]).toEqual({ color: "red", bold: true });
    }
  });
});
