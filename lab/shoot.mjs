// duskbox lab — screenshot every variant rendering the fixtures in REAL VS Code (code-server).
// Prereq: lab/up.sh running. Usage: cd lab && npm run shoot [-- variant1 variant2 …]
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const LAB = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.DUSKBOX_LAB_PORT ?? "8089";
const SETTINGS = resolve(LAB, ".data/User/settings.json");
const ALL = [
  "Dawn", "Day", "Day HC", "Storm", "Dusk", "Midnight", "Night HC", "Cyber",
  "Dusk Azure", "Dusk Neon Purple", "Dusk Magenta", "Dusk Salmon",
  "Cyber Azure", "Cyber Neon Purple", "Cyber Magenta", "Cyber Salmon",
];
const want = process.argv.slice(2);
const variants = want.length ? want : ALL;
const FIXTURES = (process.env.DUSKBOX_LAB_FIXTURES ?? "sample.ts,sample.py").split(",");

const setTheme = (name) => {
  const s = JSON.parse(readFileSync(SETTINGS, "utf8"));
  s["workbench.colorTheme"] = `Duskbox ${name}`;
  writeFileSync(SETTINGS, JSON.stringify(s, null, 2));
};

mkdirSync(resolve(LAB, "shots"), { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(`http://127.0.0.1:${PORT}/?folder=${resolve(LAB, "fixtures")}`);
await page.waitForSelector(".monaco-workbench", { timeout: 30_000 });
await page.waitForTimeout(3000); // extension host + theme load

// clear the decks: dismiss notifications, close chat/aux bar + any welcome editors
const palette = async (cmd) => {
  await page.keyboard.press("F1");
  await page.waitForTimeout(300);
  await page.keyboard.type(cmd, { delay: 20 });
  await page.waitForTimeout(400);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
};
await palette("Notifications: Clear All Notifications");
await palette("View: Close Secondary Side Bar");
await palette("View: Close All Editors");

for (const fixture of FIXTURES) {
  // open via the explorer tree (quick-open can land in other surfaces)
  await page.click(`.explorer-folders-view .monaco-list-row[aria-label*="${fixture}"]`);
  await page.waitForTimeout(2500); // tokenization + semantic tokens

  for (const v of variants) {
    setTheme(v); // code-server watches settings.json and applies live
    await page.waitForTimeout(1200);
    const slug = v.toLowerCase().replaceAll(" ", "-");
    const file = resolve(LAB, "shots", `${slug}--${fixture.replace(".", "_")}.png`);
    await page.screenshot({ path: file });
    console.log("shot", file);
  }
}
await browser.close();
console.log(`done: ${variants.length * FIXTURES.length} screenshots in lab/shots/`);
