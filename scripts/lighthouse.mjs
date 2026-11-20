/**
 * Lighthouse audit of the production build (doc 03 §6):
 * 3 runs per scenario (mobile default throttling + desktop preset), median kept.
 * Requires the static server: `npm run build && npm run serve` (port 4321).
 *
 * Output: reports/lighthouse/summary.json and reports/lighthouse/summary.md
 * Usage: node scripts/lighthouse.mjs [baseURL]
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { mkdir, writeFile, readFile } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://127.0.0.1:4321';
const pages = ['/', '/en/', '/projetos/xi-repair/'];
const RUNS = 3;
const desktopConfig = (await import('lighthouse/core/config/desktop-config.js')).default;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

await mkdir('reports/lighthouse', { recursive: true });
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
const lhVersion = JSON.parse(await readFile('node_modules/lighthouse/package.json', 'utf8')).version;
const results = [];

for (const formFactor of ['mobile', 'desktop']) {
  for (const path of pages) {
    const runs = [];
    for (let i = 0; i < RUNS; i += 1) {
      const res = await lighthouse(
        base + path,
        { port: chrome.port, output: 'json', logLevel: 'error' },
        formFactor === 'desktop' ? desktopConfig : undefined,
      );
      const lhr = res.lhr;
      const a = lhr.audits;
      runs.push({
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        lcp: Math.round(a['largest-contentful-paint'].numericValue),
        fcp: Math.round(a['first-contentful-paint'].numericValue),
        tbt: Math.round(a['total-blocking-time'].numericValue),
        cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
        si: Math.round(a['speed-index'].numericValue),
        bytes: Math.round(a['total-byte-weight'].numericValue / 1024),
        chrome: lhr.environment.hostUserAgent.match(/Chrome\/[\d.]+/)?.[0],
        failed: Object.values(lhr.categories)
          .flatMap((c) => c.auditRefs.map((r) => a[r.id]))
          .filter((x) => x && x.score !== null && x.score < 0.9 && x.scoreDisplayMode === 'binary')
          .map((x) => x.id),
      });
      process.stdout.write('.');
    }
    const keys = ['performance', 'accessibility', 'bestPractices', 'seo', 'lcp', 'fcp', 'tbt', 'cls', 'si', 'bytes'];
    const med = Object.fromEntries(keys.map((k) => [k, median(runs.map((r) => r[k]))]));
    results.push({ formFactor, path, median: med, runs });
  }
}
chromeLauncher.killAll();

const chromeVersion = results[0]?.runs[0]?.chrome ?? 'unknown';
const meta = { date: new Date().toISOString(), lighthouse: lhVersion, chrome: chromeVersion, runs: RUNS, base };
await writeFile('reports/lighthouse/summary.json', JSON.stringify({ meta, results }, null, 2));

const rows = results.map(
  ({ formFactor, path, median: m }) =>
    `| ${formFactor} | \`${path}\` | ${m.performance} | ${m.accessibility} | ${m.bestPractices} | ${m.seo} | ${(m.lcp / 1000).toFixed(2)} s | ${m.tbt} ms | ${m.cls} | ${m.bytes} KiB |`,
);
const failed = [...new Set(results.flatMap((r) => r.runs.flatMap((x) => x.failed)))];
const md = `# Lighthouse — mediana de ${RUNS} execuções

- Data: ${meta.date}
- Lighthouse ${meta.lighthouse} · ${meta.chrome} (headless) · servidor estático local (\`scripts/serve.mjs\`, gzip)
- Mobile: throttling simulado por defeito do Lighthouse (Moto G Power, 4G lento, CPU 4×). Desktop: preset desktop.

| Perfil | Página | Perf. | A11y | Best pr. | SEO | LCP | TBT | CLS | Peso |
|---|---|---|---|---|---|---|---|---|---|
${rows.join('\n')}

Auditorias binárias falhadas em alguma execução: ${failed.length ? failed.map((f) => `\`${f}\``).join(', ') : 'nenhuma'}.
`;
await writeFile('reports/lighthouse/summary.md', md);
console.log('\n' + md);
