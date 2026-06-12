// duskbox lab — screenshot every variant rendering the fixtures in REAL VS Code (code-server).
// Prereq: lab/up.sh running. Usage: cd lab && npm run shoot [-- variant1 variant2 …]
import { chromium } from "playwright";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
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
const DOCS_OUTPUT = process.env.DUSKBOX_LAB_DOCS === "1";
const DOCS_FIXTURE = process.env.DUSKBOX_LAB_DOCS_FIXTURE ?? "sample.tsx";
const FIXTURES = (process.env.DUSKBOX_LAB_FIXTURES ?? (DOCS_OUTPUT ? DOCS_FIXTURE : "sample.ts,sample.py")).split(",");
const DOCS_SHOTS = resolve(LAB, "..", "docs", "img", "shots");

const expectedTheme = (name) => `Duskbox ${name}`;

mkdirSync(resolve(LAB, "shots"), { recursive: true });
if (DOCS_OUTPUT) mkdirSync(DOCS_SHOTS, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(`http://127.0.0.1:${PORT}/?folder=${resolve(LAB, "fixtures")}`);
await page.waitForSelector(".monaco-workbench", { timeout: 30_000 });
await page.waitForTimeout(3000); // extension host + theme load

// clear the decks: dismiss notifications, close chat/aux bar + any welcome editors
const quickInput = page.locator(".quick-input-widget input");
const quickWidget = page.locator(".quick-input-widget");

const pickQuickRow = async (label, matches) => {
  const rows = page.locator(".quick-input-list .monaco-list-row");
  let lastTexts = [];
  for (let attempt = 0; attempt < 100; attempt++) {
    const count = await rows.count();
    lastTexts = [];
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const text = await row.innerText().catch(() => "");
      lastTexts.push(text.replaceAll("\n", " / "));
      if (matches(text)) {
        await row.click();
        return;
      }
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`Quick input row not found for ${label}. Saw: ${lastTexts.join(" | ")}`);
};

const runCommand = async (cmd) => {
  await page.keyboard.press("F1");
  await quickInput.waitFor({ state: "visible", timeout: 10_000 });
  await quickInput.fill(`>${cmd}`);
  await pickQuickRow(cmd, (text) => text.split("\n")[0] === cmd);
  await page.waitForTimeout(500);
};

const closeQuickInput = async () => {
  if (await quickWidget.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
  }
};

const palette = async (cmd) => {
  try {
    await runCommand(cmd);
  } catch (error) {
    console.warn(`optional command not available: ${cmd}`);
  }
  await closeQuickInput();
};

const activeTheme = () => JSON.parse(readFileSync(SETTINGS, "utf8"))["workbench.colorTheme"];

const selectTheme = async (name) => {
  const theme = expectedTheme(name);
  await runCommand("Preferences: Color Theme");
  await quickInput.waitFor({ state: "visible", timeout: 10_000 });
  await quickInput.fill(theme);
  await pickQuickRow(theme, (text) => text.split("\n")[0] === theme);
  await quickWidget.waitFor({ state: "hidden", timeout: 5_000 }).catch(closeQuickInput);
  for (let i = 0; i < 50 && activeTheme() !== theme; i++) {
    await page.waitForTimeout(100);
  }
  const applied = activeTheme();
  if (applied !== theme) {
    throw new Error(`Theme switch failed: wanted ${theme}, settings still says ${applied}`);
  }
  await page.waitForTimeout(900); // let token colors repaint before capture
};

await palette("Notifications: Clear All Notifications");
await palette("View: Close Secondary Side Bar");
await palette("View: Close All Editors");

for (const fixture of FIXTURES) {
  // open via the explorer tree (quick-open can land in other surfaces)
  await page.click(`.explorer-folders-view .monaco-list-row[aria-label*="${fixture}"]`);
  await page.waitForTimeout(2500); // tokenization + semantic tokens

  for (const v of variants) {
    await selectTheme(v);
    const slug = v.toLowerCase().replaceAll(" ", "-");
    const file = resolve(LAB, "shots", `${slug}--${fixture.replace(".", "_")}.png`);
    await page.screenshot({ path: file });
    console.log("shot", file);
    if (DOCS_OUTPUT && fixture === DOCS_FIXTURE) {
      const docsFile = resolve(DOCS_SHOTS, `${slug}.png`);
      copyFileSync(file, docsFile);
      console.log("docs-shot", docsFile);
    }
  }
}
await browser.close();
console.log(`done: ${variants.length * FIXTURES.length} screenshots in lab/shots/`);
