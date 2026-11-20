import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAGES } from './helpers';

/**
 * Automated WCAG checks with axe-core (WCAG 2.0/2.1/2.2 A + AA tags).
 * axe does not prove conformance; manual checks are recorded in README/PLAN.
 */
const targets = [...PAGES.pt.slice(0, 2), ...PAGES.en.slice(0, 2), '/nao-existe/'];

for (const path of targets) {
  for (const theme of ['dark', 'light'] as const) {
    test(`axe: ${path} (${theme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
      await page.goto(path);
      // reveal everything so contrast is checked on final states
      await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      const summary = results.violations.map(
        (v) => `${v.id} (${v.impact}): ${v.nodes.length}× — ${v.nodes[0]?.target.join(' ')}`,
      );
      expect(summary, summary.join('\n')).toEqual([]);
    });
  }
}

// WebKit (Safari default) keeps links out of the Tab order unless "Press Tab to highlight
// each item" is enabled; Playwright cannot set that preference, so link-tabbing runs on
// Chromium and Firefox. Buttons remain tabbable in WebKit (verified manually with a probe).
const NO_LINK_TAB = (name: string) => name === 'webkit' || name.startsWith('mobile');

test('skip link is the first focusable element and moves focus to main', async ({ page }, info) => {
  test.skip(NO_LINK_TAB(info.project.name), 'link tabbing: Chromium + Firefox');
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip-link');
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('heading outline: one h1, sections labelled by h2', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  const sections = page.locator('main section[data-section][aria-labelledby]');
  const n = await sections.count();
  expect(n).toBe(5);
  for (let i = 0; i < n; i += 1) {
    const id = await sections.nth(i).getAttribute('aria-labelledby');
    await expect(page.locator(`h2#${id}`)).toHaveCount(1);
  }
});

test('the hero name is readable by assistive tech as plain text', async ({ page }) => {
  await page.goto('/');
  // the visual decode layer is aria-hidden; the accessible name must be stable from the first frame
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Juan Leite');
});
