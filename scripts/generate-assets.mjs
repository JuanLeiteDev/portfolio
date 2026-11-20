/**
 * Generates static brand assets with the site's own fonts and photo:
 *   public/og/og-pt.png, public/og/og-en.png   (1200×630 Open Graph cards)
 *   public/og/juan-leite.jpg                    (structured-data photo)
 *   public/apple-touch-icon.png (180), public/icon-512.png, public/favicon.ico (32, PNG-in-ICO)
 *
 * Usage: node scripts/generate-assets.mjs   (re-run after changing copy/brand)
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const b64 = async (p) => (await readFile(p)).toString('base64');
const grotesk = await b64('public/fonts/schibsted-grotesk-latin.woff2');
const mono = await b64('public/fonts/jetbrains-mono-latin.woff2');
const photoJpg = await sharp('src/assets/juan-leite.webp').grayscale().resize(560).jpeg({ quality: 82 }).toBuffer();
const photo = photoJpg.toString('base64');

const fonts = `
@font-face{font-family:G;src:url(data:font/woff2;base64,${grotesk}) format('woff2');font-weight:400 900}
@font-face{font-family:M;src:url(data:font/woff2;base64,${mono}) format('woff2');font-weight:100 800}
*{margin:0;box-sizing:border-box}`;

const copy = {
  pt: { line: 'Transformo problemas técnicos em software útil.', tag: 'Engenharia de software & automação inteligente' },
  en: { line: 'I turn technical problems into useful software.', tag: 'Software engineering & intelligent automation' },
};

const og = (lang) => `<!doctype html><html><head><style>${fonts}
body{width:1200px;height:630px;background:#0d0e0c;color:#ece9e1;font-family:G;position:relative;overflow:hidden;
  background-image:radial-gradient(rgba(236,233,225,.06) 1px,transparent 1.2px);background-size:24px 24px}
.wrap{position:absolute;inset:64px 72px;display:grid;grid-template-columns:1fr 330px;gap:56px}
.eb{font-family:M;font-size:20px;color:#a6a398;display:flex;align-items:center;gap:12px}
.eb i{width:10px;height:10px;background:#ff6b2c;display:block}
h1{font-size:150px;line-height:.86;letter-spacing:-.055em;font-weight:700;margin-top:38px}
h1 b{display:inline-block;width:14px;height:14px;background:#ff6b2c;margin-left:8px}
p{font-size:34px;line-height:1.2;font-weight:500;letter-spacing:-.015em;margin-top:40px;max-width:640px}
.ph{position:relative;border-radius:8px;overflow:hidden;height:440px;margin-top:8px}
.ph img{width:100%;height:100%;object-fit:cover;object-position:50% 20%}
.c{position:absolute;width:18px;height:18px;border:0 solid #ff6b2c}
.tl{top:12px;left:12px;border-width:2px 0 0 2px}.br{right:12px;bottom:12px;border-width:0 2px 2px 0}
.ft{position:absolute;left:72px;right:72px;bottom:44px;display:flex;justify-content:space-between;font-family:M;font-size:19px;color:#7d7b72;
  border-top:1px solid #3a3b36;padding-top:18px}
.ft span:first-child{color:#ece9e1}
</style></head><body><div class="wrap"><div>
<div class="eb"><i></i>${copy[lang].tag}</div>
<h1>Juan<br>Leite<b></b></h1>
<p>${copy[lang].line}</p></div>
<div class="ph"><img src="data:image/jpeg;base64,${photo}"><span class="c tl"></span><span class="c br"></span></div></div>
<div class="ft"><span>juanleitedev.com</span><span>python · automation · applied ai</span></div></body></html>`;

const icon = (size) => `<!doctype html><html><head><style>${fonts}
body{width:${size}px;height:${size}px;background:#0d0e0c;display:grid;place-items:center;position:relative}
span{font-family:M;font-weight:700;color:#ece9e1;font-size:${size * 0.4}px;letter-spacing:-.06em}
i{position:absolute;right:${size * 0.2}px;bottom:${size * 0.22}px;width:${size * 0.13}px;height:${Math.max(2, size * 0.05)}px;background:#ff6b2c}
</style></head><body><span>JL</span><i></i></body></html>`;

await mkdir('public/og', { recursive: true });
const browser = await chromium.launch();

for (const lang of ['pt', 'en']) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(og(lang), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/og/og-${lang}.png` });
  await page.close();
}

const shot = async (size) => {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(icon(size), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.screenshot();
  await page.close();
  return buf;
};
await writeFile('public/apple-touch-icon.png', await shot(180));
await writeFile('public/icon-512.png', await shot(512));

// favicon.ico: single 32×32 PNG wrapped in an ICO container
const png32 = await sharp(await shot(64)).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // planes
header.writeUInt16LE(32, 12); // bpp
header.writeUInt32LE(png32.length, 14); // size
header.writeUInt32LE(22, 18); // offset
await writeFile('public/favicon.ico', Buffer.concat([header, png32]));

await sharp('src/assets/juan-leite.webp').resize(800).jpeg({ quality: 80, mozjpeg: true }).toFile('public/og/juan-leite.jpg');

await browser.close();
// Recompress OG cards (PNG screenshots are large)
for (const lang of ['pt', 'en']) {
  const p = `public/og/og-${lang}.png`;
  const out = await sharp(p).png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
  await writeFile(p, out);
}
console.log('assets generated');
