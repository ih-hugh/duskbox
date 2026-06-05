// scripts/gallery.ts — emit one SVG per variant: bg, accent swatches, 3 lines of sample code.
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { VARIANTS } from "../src/palette/variants";
import { buildPalette, type AccentName } from "../src/palette/types";

const ACCENTS: AccentName[] = ["red","orange","yellow","green","teal","cyan","blue","purple","magenta"];
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function line(y: number, parts: [string, string, boolean?, boolean?][]): string {
  let x = 24; const out: string[] = [];
  for (const [text, color, bold, italic] of parts) {
    const style = [bold ? 'font-weight="700"' : "", italic ? 'font-style="italic"' : ""].filter(Boolean).join(" ");
    out.push(`<text x="${x}" y="${y}" font-family="${MONO}" font-size="15" fill="${color}" ${style}>${esc(text)}</text>`);
    x += text.length * 9.0;
  }
  return out.join("");
}

function svg(name: string): string {
  const v = VARIANTS.find((x) => x.name === name)!;
  const p = buildPalette(v); const a = p.accents; const W = 640, H = 220;
  const sw = ACCENTS.map((acc, i) => `<rect x="${24 + i * 36}" y="150" width="28" height="28" rx="6" fill="${a[acc]}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="duskbox ${name}">
  <rect width="${W}" height="${H}" rx="12" fill="${p.bg0}"/>
  <text x="24" y="36" font-family="${MONO}" font-size="13" fill="${p.fg2}">duskbox-${name}</text>
  ${line(72, [["// fetch the account balance", p.fg2, false, true]])}
  ${line(98, [["export ", a.red, true], ["function ", a.red, true], ["load", a.yellow], ["(id) {", p.fg1]])}
  ${line(124, [["  return ", a.red, true], ["fetch", a.yellow], ["(", p.fg1], ['"/api"', a.cyan], [") ", p.fg1], ["* ", a.blue], ["100", a.blue]])}
  ${sw}
</svg>`;
}

const root = resolve(import.meta.dirname, "..");
mkdirSync(resolve(root, "docs/img"), { recursive: true });
for (const v of VARIANTS) writeFileSync(resolve(root, `docs/img/${v.name}.svg`), svg(v.name) + "\n");
console.log(`gallery: wrote ${VARIANTS.length} SVGs to docs/img/`);
