import { test, expect } from '@playwright/test';
import { PAGES } from './helpers';

const SITE = 'https://juanleitedev.com';

test.describe('i18n + SEO metadata', () => {
  for (const [i, pt] of PAGES.pt.entries()) {
    const en = PAGES.en[i]!;

    test(`PT ${pt} ↔ EN ${en}: lang, canonical, reciprocal hreflang`, async ({ page }) => {
      for (const [path, lang, other, otherPath] of [
        [pt, 'pt-PT', 'en', en],
        [en, 'en', 'pt-PT', pt],
      ] as const) {
        await page.goto(path);
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', SITE + path);
        await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute('href', SITE + path);
        await expect(page.locator(`link[rel="alternate"][hreflang="${other}"]`)).toHaveAttribute('href', SITE + otherPath);
        await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', SITE + pt);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{60,}/);
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\/og-(pt|en)\.png$/);
        expect(await page.locator('h1').count()).toBe(1);
      }
    });
  }

  test('language switch links to the equivalent page and keeps the language on navigation', async ({ page }) => {
    await page.goto('/projetos/mini-shell/');
    const toEn = page.locator('a[data-lang-link="en"]:visible').first();
    await expect(toEn).toHaveAttribute('href', '/en/projects/mini-shell/');
    await toEn.click();
    await expect(page).toHaveURL(/\/en\/projects\/mini-shell\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // every internal link on the EN page stays in EN (except the explicit switch / CV)
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) =>
      as.filter((a) => !a.hasAttribute('data-lang-link') && !a.hasAttribute('download')).map((a) => a.getAttribute('href')),
    );
    for (const h of hrefs) expect(h, `link ${h}`).toMatch(/^\/en\//);
  });

  test('no untranslated UI: EN home has no common PT words in visible chrome', async ({ page }) => {
    await page.goto('/en/');
    const text = await page.locator('body').innerText();
    for (const w of ['Projetos', 'Percurso', 'Competências', 'Descarregar', 'Contacto', 'Saltar']) {
      expect(text, `found "${w}"`).not.toContain(w);
    }
  });

  test('sitemap lists every page in both languages with alternates; robots points to it', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    for (const p of [...PAGES.pt, ...PAGES.en]) expect(xml).toContain(`<loc>${SITE}${p}</loc>`);
    expect((xml.match(/hreflang="x-default"/g) ?? []).length).toBe(12);
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  test('404 page is served, bilingual and not indexed', async ({ page }) => {
    const res = await page.goto('/nao-existe/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Go to the English home' })).toHaveAttribute('href', '/en/');
  });

  test('old-site URLs redirect (rules read from netlify.toml)', async ({ request }) => {
    for (const [from, to] of [
      ['/assets/cv/cv.pdf', '/cv/juan-leite-cv-pt.pdf'],
      ['/assets/img/favicon.ico', '/favicon.ico'],
    ] as const) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status(), from).toBe(301);
      expect(res.headers()['location']).toBe(to);
    }
  });

  test('structured data is valid JSON with a Person', async ({ page }) => {
    await page.goto('/');
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const parsed = blocks.map((b) => JSON.parse(b) as { '@type': string; name?: string });
    expect(parsed.some((d) => d['@type'] === 'Person' && d.name === 'Juan Lucas Souza Leite')).toBe(true);
  });
});
