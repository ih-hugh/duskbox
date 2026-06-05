import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const themes = pkg.contributes?.themes ?? [];
if (themes.length !== 8) { console.error(`expected 8 themes, got ${themes.length}`); process.exit(1); }
const uiOk = new Set(["vs", "vs-dark", "hc-black", "hc-light"]);
let failed = false;
for (const t of themes) {
  if (!t.label || !uiOk.has(t.uiTheme) || !t.path) { console.error("bad contributes entry", t); failed = true; continue; }
  const file = resolve(root, t.path);
  if (!existsSync(file)) { console.error("missing theme file", t.path); failed = true; continue; }
  const j = JSON.parse(readFileSync(file, "utf8"));
  for (const key of ["name", "type", "colors", "tokenColors"]) {
    if (!(key in j)) { console.error(`${t.path} missing ${key}`); failed = true; }
  }
  if (!j.colors["editor.background"]) { console.error(`${t.path} missing editor.background`); failed = true; }
}
if (failed) process.exit(1);
console.log(`validate-vscode OK: ${themes.length} themes`);
