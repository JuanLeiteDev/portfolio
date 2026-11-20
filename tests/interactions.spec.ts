import { test, expect, type Page } from '@playwright/test';
import { isMobileProject, trackErrors } from './helpers';

const waitForMenu = (page: Page) => page.waitForFunction(() => document.documentElement.classList.contains('cmd-ready'));

test.describe('command menu (desktop)', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop palette');

  test('Ctrl/⌘+K opens, filters, Enter jumps to a section, focus lands on its heading', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');
    await waitForMenu(page);
    await page.keyboard.press('ControlOrMeta+k');
    const dialog = page.getByRole('dialog', { name: 'Menu de comandos' });
    await expect(dialog).toBeVisible();
    const input = page.getByRole('combobox');
    await expect(input).toBeFocused();
    await input.fill('percur');
    await expect(page.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/#percurso$/);
    await expect(page.locator('#percurso-title')).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('Escape closes and focus returns to the trigger', async ({ page }) => {
    await page.goto('/');
    await waitForMenu(page);
    const trigger = page.locator('header.rail [data-cmd-open]');
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('arrow keys move the active option (aria-activedescendant)', async ({ page }) => {
    await page.goto('/en/');
    await waitForMenu(page);
    await page.keyboard.press('/');
    const input = page.getByRole('combobox');
    const first = await input.getAttribute('aria-activedescendant');
    await page.keyboard.press('ArrowDown');
    const second = await input.getAttribute('aria-activedescendant');
    expect(second).not.toBe(first);
    await expect(page.locator(`[id="${second}"]`)).toHaveAttribute('aria-selected', 'true');
  });

  test('rail marks the section in view', async ({ page }) => {
    await page.goto('/');
    await page.locator('#projetos').scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById('projetos')?.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(page.locator('[data-rail-link="projects"]')).toHaveAttribute('aria-current', 'true');
    // the language switch now targets the equivalent EN section
    await expect(page.locator('header.rail a[data-lang-link="en"]')).toHaveAttribute('href', '/en/#projects');
  });
});

test.describe('mobile navigation', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  test('dock opens the sheet; choosing a project navigates', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/');
    await waitForMenu(page);
    await page.locator('.dock [data-cmd-open]').tap();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.getByRole('option', { name: /Mini Shell/ }).tap();
    await expect(page).toHaveURL(/\/projetos\/mini-shell\/$/);
    expect(errors).toEqual([]);
  });

  test('intent cards: summaries collapsed, a tap expands and updates aria-expanded', async ({ page }) => {
    await page.goto('/');
    const card = page.locator('.practice').nth(1);
    const btn = card.locator('[data-intent-btn]');
    const hint = card.locator('.hint-wrap');
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
    const closedH = (await hint.boundingBox())?.height ?? 0;
    expect(closedH).toBeLessThan(2);
    await btn.tap();
    await expect(btn).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(async () => (await hint.boundingBox())?.height ?? 0).toBeGreaterThan(10);
  });

  test('dock shows the current section', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.getElementById('contacto')?.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(page.locator('[data-dock-n]')).toHaveText('05');
  });
});

test.describe('motion preferences', () => {
  test.use({ reducedMotion: 'reduce' });

  test('reduced motion: no decode, figures shown final, portrait effect not loaded', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.goto('/');
    await expect(page.locator('.dc-cell')).toHaveCount(0);
    await expect(page.locator('.count-live').first()).toHaveText(/10\s?000\+/);
    await page.waitForTimeout(1800);
    expect(requests.some((u) => u.includes('glyph-portrait'))).toBe(false);
  });
});

test('theme toggle switches and persists', async ({ page }, info) => {
  await page.goto('/');
  const btn = page.locator(isMobileProject(info) ? '.topbar [data-theme-toggle]' : 'header.rail [data-theme-toggle]');
  // the initial theme follows the emulated system preference; the toggle flips it
  const initial = await page.evaluate(() => (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  const next = initial === 'light' ? 'dark' : 'light';
  await btn.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', next);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', next);
  await expect(btn).toHaveAttribute('aria-pressed', String(next === 'light'));
});

test('project pages: back link returns to the project index', async ({ page }) => {
  await page.goto('/en/projects/ps2/');
  await page.getByRole('link', { name: 'Back to projects' }).click();
  await expect(page).toHaveURL(/\/en\/#projects$/);
});
