/**
 * Visual review helper: full-page screenshots for a set of pages and
 * viewports against a running preview server, plus console errors and
 * horizontal-overflow detection.
 *
 * Usage: node scripts/shots.mjs [baseURL] [--pages=/,/en/] [--widths=390,1440] [--theme=light] [--reduced]
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const args = process.argv.slice(2);
const base = args.find((a) => a.startsWith('http')) ?? 'http://127.0.0.1:4321';
const opt = (k, d) => args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d;
const pages = opt('pages', '/,/en/,/projetos/xi-repair/').split(',');
const widths = opt('widths', '320,390,768,1024,1440').split(',').map(Number);
const theme = opt('theme', 'dark');
const reduced = args.includes('--reduced');
const full = !args.includes('--viewport-only');
const out = opt('out', 'reports/screenshots');

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const w of widths) {
  const h = w < 768 ? 844 : w < 1024 ? 1024 : 900;
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
    colorScheme: theme,
    reducedMotion: reduced ? 'reduce' : 'no-preference',
    hasTouch: w < 1024,
    isMobile: w < 768,
  });
  for (const p of pages) {
    const page = await ctx.newPage();
    page.on('console', (m) => m.type() === 'error' && problems.push(`[console ${w} ${p}] ${m.text()}`));
    page.on('pageerror', (e) => problems.push(`[pageerror ${w} ${p}] ${e.message}`));
    page.on('requestfailed', (r) => problems.push(`[requestfailed ${w} ${p}] ${r.url()}`));
    await page.goto(base + p, { waitUntil: 'networkidle' });
    // let one-shot effects finish, then trigger reveal for everything
    await page.waitForTimeout(1600);
    if (full) {
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) {
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 60));
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      await page.waitForTimeout(900);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) problems.push(`[overflow ${w} ${p}] +${overflow}px`);
    const name = `${p.replace(/\//g, '_') || 'root'}-${w}-${theme}${reduced ? '-rm' : ''}.png`;
    if (args.includes('--sections')) {
      const secs = await page.$$('[data-section], footer, article.case');
      for (const [i, s] of secs.entries()) {
        await s.screenshot({ path: `${out}/${name.replace('.png', `-s${i}.png`)}` });
      }
    } else {
      await page.screenshot({ path: `${out}/${name}`, fullPage: full });
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log(problems.length ? problems.join('\n') : 'no console errors, failed requests or overflow');
