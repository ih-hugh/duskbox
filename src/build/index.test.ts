import { describe, it, expect, beforeAll } from "vitest";
import { runBuild } from "./index";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../..");
describe("build orchestrator", () => {
  beforeAll(() => runBuild(root));
  it("writes 8 nvim colorschemes + theme tables + 8 vscode themes", () => {
    for (const v of ["dawn","day","day-hc","storm","dusk","midnight","night-hc","cyber"]) {
      expect(existsSync(resolve(root, `colors/duskbox-${v}.lua`))).toBe(true);
      expect(existsSync(resolve(root, `lua/duskbox/themes/${v}.lua`))).toBe(true);
      expect(existsSync(resolve(root, `themes/duskbox-${v}-color-theme.json`))).toBe(true);
    }
  });
  it("registers all themes in package.json contributes", () => {
    const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
    expect(pkg.contributes.themes).toHaveLength(8);
    expect(pkg.contributes.themes[0]).toHaveProperty("uiTheme");
  });
  it("is deterministic (second run produces identical dusk output)", () => {
    const a = readFileSync(resolve(root, "themes/duskbox-dusk-color-theme.json"), "utf8");
    runBuild(root);
    const b = readFileSync(resolve(root, "themes/duskbox-dusk-color-theme.json"), "utf8");
    expect(a).toBe(b);
  });
});
