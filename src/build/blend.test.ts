import { describe, it, expect } from "vitest";
import { blend, muteHex } from "./blend";

describe("blend", () => {
  it("blends two hexes by t", () => {
    expect(blend("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(blend("#ff0000", "#00ff00", 0)).toBe("#ff0000");
    expect(blend("#ff0000", "#00ff00", 1)).toBe("#00ff00");
  });
  it("muteHex pulls an accent ~45% toward fg0", () => {
    const m = muteHex("#7dcfff", "#c4ccdc");
    expect(m).toMatch(/^#[0-9a-f]{6}$/);
    expect(m).not.toBe("#7dcfff");
  });
});
