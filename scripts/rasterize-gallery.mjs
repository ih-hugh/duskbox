// Rasterize the marketplace gallery: docs/img/*.svg -> docs/img/*.png.
//
// WHY this exists: the VS Marketplace / Open VSX README (README.marketplace.md) is rejected by
// `vsce` if it embeds SVG images (SVGs are blocked for security regardless of host), but PNG over
// HTTPS is allowed. GitHub's README.md keeps the crisp SVGs; the marketplace listing uses the PNGs
// this script renders from the SAME SVG source, so there's no separate artwork to keep in sync.
//
// No rsvg-convert/cairosvg/inkscape is assumed (stock macOS has none) — we rasterize with headless
// Chrome at 2x for retina crispness, the same approach used for the store icon.
//
// Run after `pnpm gallery` (which regenerates the SVGs):  pnpm gallery:png

import { writeFileSync, unlinkSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const img = (name) => resolve(root, "docs/img", name);

// The marketplace listing carries the palette diagram + the 8 core variants. (Signature variants
// stay as a text note + repo link there — see README.marketplace.md.) Native SVG sizes drive the
// 2x render dimensions so aspect ratio is exact.
const PALETTE = { name: "palette", w: 820, h: 400 };
const CORE = ["dawn", "day", "day-hc", "storm", "dusk", "midnight", "night-hc", "cyber"]
  .map((name) => ({ name, w: 640, h: 220 }));
const TARGETS = [PALETTE, ...CORE];

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
];
const chrome = CHROME_CANDIDATES.find(existsSync);
if (!chrome) {
  console.error("rasterize-gallery: no Chrome/Chromium found. Install Google Chrome or edit CHROME_CANDIDATES.");
  process.exit(1);
}

const SCALE = 2; // 2x source -> downscaled to 1x with sips for clean antialiasing
let count = 0;
for (const { name, w, h } of TARGETS) {
  const svg = img(`${name}.svg`);
  if (!existsSync(svg)) {
    console.error(`rasterize-gallery: missing ${svg} — run \`pnpm gallery\` first.`);
    process.exit(1);
  }
  const W = w * SCALE, H = h * SCALE;
  const wrap = img(`.${name}.wrap.html`);
  const big = img(`.${name}.2x.png`);
  const out = img(`${name}.png`);

  // Inline the SVG via <img> at 2x; transparent page bg so the SVG's own rounded-rect shows
  // through (matches the icon pipeline). The SVG's viewBox keeps the upscale crisp.
  writeFileSync(
    wrap,
    `<!doctype html><meta charset=utf8>` +
      `<style>html,body{margin:0;background:transparent}img{display:block}</style>` +
      `<img src="file://${svg}" width="${W}" height="${H}">`
  );
  try {
    execFileSync(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--default-background-color=00000000",
      `--window-size=${W},${H}`,
      `--screenshot=${big}`,
      `file://${wrap}`,
    ], { stdio: "ignore" });
    // Downscale 2x -> 1x for crisp antialiased edges at the listing's display size.
    execFileSync("sips", ["-z", String(h), String(w), big, "--out", out], { stdio: "ignore" });
    count++;
    console.log(`  ${name}.png  (${w}x${h})`);
  } finally {
    for (const f of [wrap, big]) if (existsSync(f)) unlinkSync(f);
  }
}
console.log(`gallery:png — wrote ${count} PNGs to docs/img/ (palette + ${CORE.length} core variants)`);
