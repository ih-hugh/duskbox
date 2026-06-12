import { expect, test, type Page } from '@playwright/test';
import { setAuthCookie, SEED_ACTIVE } from './helpers';

const PUBLIC = ['/', '/login', '/privacy', '/terms'];

// the default seed user is at-cap — auth as the no-agent user so pages render
const AUTHED: Array<[string, string | undefined]> = [
  ['/dashboard', undefined],
  [`/agents/${SEED_ACTIVE}/settings`, undefined],
];

async function overflowPx(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
}

test.describe('no horizontal overflow at 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of PUBLIC) {
    test(`public ${path}`, async ({ page }) => {
      await page.goto(path);
      expect(await overflowPx(page)).toBeLessThanOrEqual(1);
    });
  }

  for (const [path, userId] of AUTHED) {
    test(`authed ${path}`, async ({ page, context }) => {
      await setAuthCookie(context, userId);
      await page.goto(path);
      expect(await overflowPx(page)).toBeLessThanOrEqual(1);
    });
  }
});
