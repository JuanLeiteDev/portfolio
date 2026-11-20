/**
 * Renders the Mini Shell example session as a terminal illustration.
 * The text is copied verbatim from the repository README
 * (github.com/JuanLeiteDev/mini-shell-file-system › "Interpretador") —
 * nothing is invented; the site captions it as an illustration, not a screenshot.
 *
 * Output: src/assets/projects/mini-shell/session.png
 * Usage: node scripts/render-terminal.mjs
 */
import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';

const mono = (await readFile('public/fonts/jetbrains-mono-latin.woff2')).toString('base64');

// [kind, text] — kinds: shell ($), prompt (%), out (program output)
const session = [
  ['shell', './build/bin/interpretador'],
  ['prompt', 'lista /home'],
  ['out', '...'],
  ['out', 'Terminou comando lista com código 0'],
  ['prompt', 'mostra ficheiro.txt > copia.txt'],
  ['out', 'Terminou comando mostra com código 0'],
  ['prompt', 'termina'],
  ['shell', ''],
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lines = session
  .map(([k, t]) => {
    if (k === 'shell') return `<p><span class="ps">$</span> ${esc(t)}${t ? '' : '<i class="cur"></i>'}</p>`;
    if (k === 'prompt') return `<p><span class="pp">%</span> <span class="cmd">${esc(t)}</span></p>`;
    return `<p class="out">${esc(t)}</p>`;
  })
  .join('');

const html = `<!doctype html><html><head><style>
@font-face{font-family:M;src:url(data:font/woff2;base64,${mono}) format('woff2');font-weight:100 800}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:640px;background:#0d0e0c;font-family:M;display:grid;place-items:center}
.win{width:1120px;height:568px;border:1px solid #3a3b36;border-radius:14px;background:#090a08;overflow:hidden;
  box-shadow:0 30px 80px -30px rgba(0,0,0,.8)}
.bar{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid #262723;
  background:#141512;color:#8d8b81;font-size:15px}
.bar b{display:inline-block;width:9px;height:9px;background:#ff6b2c;margin-right:12px}
.body{padding:34px 40px;font-size:24px;line-height:1.75;color:#ece9e1}
.ps{color:#8d8b81}.pp{color:#ff6b2c;font-weight:700}.cmd{color:#ece9e1}
.out{color:#a6a398}
.cur{display:inline-block;width:13px;height:26px;background:#ff6b2c;vertical-align:-5px}
</style></head><body><div class="win">
<div class="bar"><span><b></b>mini-shell — interpretador</span><span>C · POSIX</span></div>
<div class="body">${lines}</div></div></body></html>`;

await mkdir('src/assets/projects/mini-shell', { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 640 }, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'src/assets/projects/mini-shell/session.png' });
await browser.close();
console.log('rendered src/assets/projects/mini-shell/session.png');
