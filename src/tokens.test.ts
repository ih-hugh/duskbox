import { describe, it, expect } from "vitest";
import { TOKENS } from "./tokens";
import { BASE_HUES } from "./palette/types";

const VALID = new Set([...Object.keys(BASE_HUES), "fg0", "fg1", "fg2"]);

describe("tokens", () => {
  it("every role maps to a valid color slot", () => {
    for (const [role, s] of Object.entries(TOKENS)) expect(VALID.has(s.color), role).toBe(true);
  });
  it("keyword and type are bold (the duskbox identity)", () => {
    expect(TOKENS.keyword.bold).toBe(true);
    expect(TOKENS.type.bold).toBe(true);
  });
  it("comments are italic and muted", () => {
    expect(TOKENS.comment.italic).toBe(true);
    expect(TOKENS.comment.color).toBe("fg2");
  });
});
