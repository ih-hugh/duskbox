import { describe, it, expect } from "vitest";
import { TOKENS } from "./tokens";
import { BASE_HUES } from "./palette/types";

const VALID = new Set([...Object.keys(BASE_HUES), "fg0", "fg1", "fg2"]);

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
  it("green is reserved for diagnostics/git, never code syntax", () => {
    const syntax = ["keyword","function","method","type","ctor","typeBuiltin","builtin","parameter",
      "string","escape","number","constant","boolean","property","variable","preproc","operator",
      "punctuation","tagNative","tagComponent","tagAttr","tagDelim"];
    for (const r of syntax) expect((TOKENS as any)[r].color, r).not.toBe("green");
  });
  it("high-frequency roles are mutually distinct (slot+mute combo)", () => {
    const hi = ["keyword","function","type","parameter","string","number","constant","property"];
    const keys = hi.map((r) => { const t = (TOKENS as any)[r]; return `${t.color}:${t.mute ? 1 : 0}`; });
    expect(new Set(keys).size).toBe(hi.length);
  });
  it("native tag and custom component are distinct colors", () => {
    expect(TOKENS.tagNative.color).not.toBe(TOKENS.tagComponent.color);
  });
});
