import { test, expect } from '@playwright/test';

const EXPECTED = [
  { key: 'whatsapp', pt: 'WhatsApp', en: 'WhatsApp', href: 'https://wa.me/351914095001' },
  { key: 'linkedin', pt: 'LinkedIn', en: 'LinkedIn', href: 'https://www.linkedin.com/in/juan-leite/' },
  { key: 'github', pt: 'GitHub', en: 'GitHub', href: 'https://github.com/JuanLeiteDev' },
  { key: 'cv', pt: 'Descarregar CV', en: 'Download CV', href: '/cv/juan-leite-cv-pt.pdf' },
] as const;

for (const lang of ['pt', 'en'] as const) {
  test.describe(`contact actions (${lang})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(lang === 'pt' ? '/#contato' : '/en/#contact');
    });

    test('four labelled actions with the right destinations', async ({ page }) => {
      for (const e of EXPECTED) {
        const link = page.locator(`a[data-contact="${e.key}"]`);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute('href', e.href);
        await expect(link).toContainText(e[lang]);
        if (e.key === 'cv') {
          await expect(link).toHaveAttribute('download', /\.pdf$/);
          await expect(link).toContainText(lang === 'pt' ? 'PDF em português' : 'PDF in Portuguese');
        } else {
          await expect(link).toHaveAttribute('target', '_blank');
          await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        }
      }
    });

    test('WhatsApp link uses digits only (international code, no "+")', async ({ page }) => {
      const href = await page.locator('a[data-contact="whatsapp"]').getAttribute('href');
      expect(href).toMatch(/^https:\/\/wa\.me\/\d+$/);
      expect(href).toContain('351914095001');
    });

    test('touch targets are at least 44×44 CSS px', async ({ page }) => {
      for (const e of EXPECTED) {
        const box = await page.locator(`a[data-contact="${e.key}"]`).boundingBox();
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
    });
  });
}

test('CV download delivers a valid PDF', async ({ page, browserName }, info) => {
  await page.goto('/#contato');
  // WebKit/mobile emulation do not always surface the download event; verify the resource directly there.
  if (browserName === 'chromium' && !info.project.name.startsWith('mobile')) {
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('a[data-contact="cv"]').click()]);
    expect(download.suggestedFilename()).toBe('Juan-Leite-CV-PT.pdf');
  }
  const res = await page.request.get('/cv/juan-leite-cv-pt.pdf');
  expect(res.status()).toBe(200);
  const body = await res.body();
  expect(body.subarray(0, 5).toString()).toBe('%PDF-');
  expect(body.length).toBeGreaterThan(10_000);
});

test('contact actions are reachable by keyboard', async ({ page }, info) => {
  // WebKit keeps links out of the Tab order by default (Safari preference) — see a11y.spec.ts
  test.skip(info.project.name === 'webkit' || info.project.name.startsWith('mobile'), 'link tabbing: Chromium + Firefox');
  await page.goto('/#contato');
  const reached = new Set<string>();
  for (let i = 0; i < 80 && reached.size < 4; i += 1) {
    await page.keyboard.press('Tab');
    const key = await page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.contact);
    if (key) reached.add(key);
  }
  expect([...reached].sort()).toEqual(['cv', 'github', 'linkedin', 'whatsapp']);
});
