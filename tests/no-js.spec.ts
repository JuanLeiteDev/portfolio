import { test, expect } from '@playwright/test';

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('all content is visible and readable', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Juan Leite');
    // nothing hidden by reveal-on-scroll
    const hidden = await page.locator('[data-reveal]').evaluateAll(
      (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length,
    );
    expect(hidden).toBe(0);
    // every project panel and every skill area's text is in the page
    await expect(page.locator('[data-acc-panel]')).toHaveCount(5);
    const hiddenPanels = await page.locator('[data-sk-panel]').evaluateAll(
      (els) => els.filter((e) => getComputedStyle(e).visibility !== 'visible').length,
    );
    expect(hiddenPanels).toBe(0);
    // intent summaries are fully visible without JS
    const hiddenHints = await page.locator('.hint .w').evaluateAll(
      (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length,
    );
    expect(hiddenHints).toBe(0);
    await expect(page.locator('[data-intent-btn]').first()).toHaveAttribute('aria-expanded', 'true');
  });

  test('contact actions and project pages work', async ({ page }) => {
    await page.goto('/');
    for (const key of ['whatsapp', 'linkedin', 'github', 'cv']) {
      await expect(page.locator(`a[data-contact="${key}"]`)).toHaveAttribute('href', /.+/);
    }
    // each accordion panel is a plain link (the log analyser comes first)
    await page.locator('a[data-acc-link]').first().click();
    await expect(page).toHaveURL(/\/projetos\/log-analyzer\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Analisador de logs');
  });

  test('language switch is a plain link', async ({ page }) => {
    await page.goto('/');
    await page.locator('a[data-lang-link="en"]:visible').first().click();
    await expect(page).toHaveURL(/\/en\/$/);
  });

  test('mobile "Menu" falls back to the footer site map', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.locator('.dock a[href="#menu"]').click();
    await expect(page).toHaveURL(/#menu$/);
    await expect(page.locator('#menu')).toBeInViewport();
  });
});
