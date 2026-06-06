import { describe, it, expect } from "vitest";
import { buildLualine } from "./lualine";
import { VARIANTS } from "../palette/variants";
import { buildPalette } from "../palette/types";

describe("lualine theme", () => {
  it("normal mode = the variant signature; insert = green; valid Lua table", () => {
    const cs = VARIANTS.find((v) => v.name === "cyber-salmon")!;
    const sp = buildPalette(cs);
    const lua = buildLualine(cs);
    expect(lua).toContain("return {");
    expect(lua).toContain(`normal = { a = { fg = "${sp.bg0}", bg = "${sp.signature}"`);
    expect(lua).toContain(`insert = { a = { fg = "${sp.bg0}", bg = "${sp.accents.green}"`);
    const dp = buildPalette(VARIANTS.find((v) => v.name === "dusk")!);
    expect(buildLualine(VARIANTS.find((v) => v.name === "dusk")!)).toContain(`bg = "${dp.accents.blue}"`);
  });
});
