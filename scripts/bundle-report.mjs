/**
 * First-visit transfer report (doc 03 §6 budgets): loads the home page in
 * Chromium, waits for idle work (React island hydration, glyph-portrait
 * chunk) and sums the *transferred* (compressed) bytes per resource type.
 * Nothing interaction-dependent is triggered.
 *
 * Usage: node scripts/bundle-report.mjs [baseURL]   (static server on 4321)
 */
import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://127.0.0.1:4321';
const browser = await chromium.launch();
const out = [];

for (const [label, viewport] of [
  ['mobile 390', { width: 390, height: 844 }],
  ['desktop 1440', { width: 1440, height: 900 }],
]) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const reqs = new Map();
  cdp.on('Network.responseReceived', (e) => reqs.set(e.requestId, { url: e.response.url, type: e.type, bytes: 0 }));
  cdp.on('Network.loadingFinished', (e) => {
    const r = reqs.get(e.requestId);
    if (r) r.bytes = e.encodedDataLength;
  });
  await page.goto(base + '/', { waitUntil: 'load' });
  await page.waitForTimeout(3500); // idle hydration + lazy effect chunk
  const rows = [...reqs.values()].filter((r) => r.url.startsWith(base));
  const sum = (t) => rows.filter((r) => t(r)).reduce((a, r) => a + r.bytes, 0);
  const kib = (b) => Number((b / 1024).toFixed(1));
  const isJs = (r) => r.type === 'Script' || /\.m?js(\?|$)/.test(r.url);
  out.push({
    label,
    totalKiB: kib(sum(() => true)),
    jsKiB: kib(sum(isJs)),
    cssKiB: kib(sum((r) => r.type === 'Stylesheet')),
    fontKiB: kib(sum((r) => r.type === 'Font')),
    imageKiB: kib(sum((r) => r.type === 'Image')),
    htmlKiB: kib(sum((r) => r.type === 'Document')),
    requests: rows.length,
    js: rows.filter(isJs).map((r) => ({ file: r.url.replace(base, ''), kib: kib(r.bytes) })),
  });
  await ctx.close();
}
await browser.close();

await mkdir('reports', { recursive: true });
await writeFile('reports/bundle.json', JSON.stringify(out, null, 2));
for (const o of out) {
  console.log(`\n${o.label}: total ${o.totalKiB} KiB · JS ${o.jsKiB} · CSS ${o.cssKiB} · fonts ${o.fontKiB} · images ${o.imageKiB} · HTML ${o.htmlKiB} · ${o.requests} requests`);
  for (const j of o.js) console.log(`   ${j.kib.toString().padStart(6)} KiB  ${j.file}`);
}
