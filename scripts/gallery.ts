// scripts/gallery.ts — emit one SVG per variant: bg, accent swatches, 3 lines of sample code.
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { VARIANTS } from "../src/palette/variants";
import { buildPalette, BASE_HUES, type AccentName } from "../src/palette/types";

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
  ${line(98, [["export ", p.moduleKw, true], ["async ", a.purple, false, true], ["function ", a.red, true], ["load", a.yellow], ["(id) {", p.fg1]])}
  ${line(124, [["  return ", a.red, true], ["fetch", a.yellow], ["(", p.fg1], ['"/api"', a.cyan], [") ", p.fg1], ["* ", a.blue], ["100", a.blue]])}
  ${sw}
</svg>`;
}

// palette.svg — the "color diagram": an OKLCH hue wheel (9 tiered accents placed by
// hue angle) beside a syntax legend (role -> color). Uses the default `dusk` palette.
function diagram(): string {
  const p = buildPalette(VARIANTS.find((x) => x.name === "dusk")!);
  const a = p.accents;
  const W = 820, H = 440, cx = 200, cy = 224, R = 122; // 12 legend rows + footnote need the extra height
  const rad = (d: number) => (d * Math.PI) / 180;
  let wheel = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${p.fg2}" stroke-opacity="0.22"/>`;
  for (const acc of ACCENTS) {
    const h = BASE_HUES[acc], c = Math.cos(rad(h)), s = Math.sin(rad(h));
    const dx = cx + R * c, dy = cy - R * s, lx = cx + (R + 26) * c, ly = cy - (R + 26) * s;
    const anchor = c > 0.2 ? "start" : c < -0.2 ? "end" : "middle";
    wheel += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="11" fill="${a[acc]}" stroke="${p.bg0}" stroke-width="2"/>`;
    wheel += `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" font-family="${MONO}" font-size="11" fill="${p.fg2}" text-anchor="${anchor}">${acc}</text>`;
  }
  wheel += `<text x="${cx}" y="${cy - 1}" font-family="${MONO}" font-size="12" fill="${p.fg1}" text-anchor="middle">tiered attention</text>`;
  wheel += `<text x="${cx}" y="${cy + 16}" font-family="${MONO}" font-size="10" fill="${p.fg2}" text-anchor="middle">hierarchy from L×C</text>`;
  const rows: [string, string, boolean, boolean][] = [
    ["keyword", a.red, true, false],
    ["async / const / static", a.purple, false, true],
    ["function", a.yellow, true, false],
    ["type", a.orange, true, false],
    ["property", a.teal, false, false],
    ["string", a.green, false, false],
    ["escape", a.cyan, false, false],
    ["number", a.blue, false, false],
    ["constant", a.purple, false, false],
    ["this / self / constructor", p.builtin, false, true],
    ["import / export", p.moduleKw, true, false],
    ["comment", p.fg2, false, true],
  ];
  const lx0 = 440;
  let y = 92;
  let legend = `<text x="${lx0}" y="${y - 22}" font-family="${MONO}" font-size="12" fill="${p.fg1}">syntax → color</text>`;
  for (const [role, color, bold, italic] of rows) {
    const st = [bold ? 'font-weight="700"' : "", italic ? 'font-style="italic"' : ""].filter(Boolean).join(" ");
    legend += `<rect x="${lx0}" y="${y - 13}" width="18" height="18" rx="4" fill="${color}"/>`;
    legend += `<text x="${lx0 + 28}" y="${y + 1}" font-family="${MONO}" font-size="13" fill="${p.fg0}" ${st}>${esc(role)}</text>`;
    y += 28;
  }
  legend += `<text x="${lx0}" y="${y + 4}" font-family="${MONO}" font-size="10" fill="${p.fg2}">signature variants recolor the chrome (cursor/headings/borders)</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="duskbox OKLCH palette diagram">
  <rect width="${W}" height="${H}" rx="14" fill="${p.bg0}"/>
  <text x="32" y="40" font-family="${MONO}" font-size="14" fill="${p.fg1}">duskbox — OKLCH palette</text>
  ${wheel}
  ${legend}
</svg>`;
}

const root = resolve(import.meta.dirname, "..");
mkdirSync(resolve(root, "docs/img"), { recursive: true });
for (const v of VARIANTS) writeFileSync(resolve(root, `docs/img/${v.name}.svg`), svg(v.name) + "\n");
writeFileSync(resolve(root, "docs/img/palette.svg"), diagram() + "\n");
console.log(`gallery: wrote ${VARIANTS.length} variant SVGs + palette.svg to docs/img/`);
