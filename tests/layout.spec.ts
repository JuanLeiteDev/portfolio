import { test, expect } from '@playwright/test';
import { PAGES, trackErrors } from './helpers';

/** QA matrix widths from docs/03 §10 (+ landscape phone). */
const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];

test.describe('responsive layout', () => {
  test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || isMobile, 'matrix runs on desktop Chromium; other engines run the functional suites');

  for (const w of WIDTHS) {
    test(`no horizontal overflow, no console errors @ ${w}px (PT + EN)`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.setViewportSize({ width: w, height: w < 768 ? 800 : 900 });
      for (const path of [...PAGES.pt, ...PAGES.en]) {
        await page.goto(path, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(0);
        // text never clipped by its own box (headings and buttons); 1px boxes
        // are the screen-reader-only pattern, clipped on purpose
        const clipped = await page.evaluate(() =>
          Array.from(document.querySelectorAll<HTMLElement>('h1, h2, h3, .btn, .key, .btn-dock'))
            .filter((el) => el.offsetParent !== null && el.clientWidth > 1 && el.scrollWidth > el.clientWidth + 1)
            .map((el) => el.textContent?.trim().slice(0, 40)),
        );
        expect(clipped, `${path} clipped: ${clipped.join(' | ')}`).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
  }

  test('landscape phone (844×390) keeps navigation usable', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');
    await expect(page.locator('.dock')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('desktop shows the rail, mobile shows the dock — never both', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(page.locator('header.rail')).toBeVisible();
    await expect(page.locator('.dock')).toBeHidden();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('header.rail')).toBeHidden();
    await expect(page.locator('.dock')).toBeVisible();
  });

  test('no layout shift from fonts, images or effects on load (CLS ≈ 0)', async ({ page }) => {
    await page.goto('/');
    const cls = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let total = 0;
          new PerformanceObserver((list) => {
            for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
              if (!e.hadRecentInput) total += e.value;
            }
          }).observe({ type: 'layout-shift', buffered: true });
          setTimeout(() => resolve(total), 2500);
        }),
    );
    expect(cls).toBeLessThan(0.05);
  });
});
