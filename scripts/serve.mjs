/**
 * Minimal static server for the production build, mirroring Netlify:
 * directory indexes, trailing-slash redirects, real 404 status with
 * dist/404.html, gzip for text assets and immutable caching for /_astro.
 * Used by Playwright and Lighthouse so measurements reflect static hosting.
 *
 * Usage: node scripts/serve.mjs [port=4321]
 */
import { createServer } from 'node:http';
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { createGzip } from 'node:zlib';

const root = resolve('dist');
const port = Number(process.argv[2] ?? 4321);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};
// [[redirects]] from netlify.toml, so local tests exercise the real config
const redirects = [...readFileSync('netlify.toml', 'utf8').matchAll(
  /\[\[redirects\]\]\s*from = "([^"]+)"\s*to = "([^"]+)"\s*status = (\d+)/g,
)].map(([, from, to, status]) => ({ from, to, status: Number(status) }));

const compressible = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg', '.webmanifest']);

const fileAt = (p) => {
  try {
    const s = statSync(p);
    if (s.isFile()) return { path: p, size: s.size };
    if (s.isDirectory()) return fileAt(join(p, 'index.html'));
  } catch {
    /* not found */
  }
  return null;
};

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const redirect = redirects.find((r) => r.from === url.pathname);
  if (redirect && !fileAt(join(root, url.pathname))) {
    res.writeHead(redirect.status, { Location: redirect.to }).end();
    return;
  }
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
  const target = join(root, rel);
  if (!target.startsWith(root)) {
    res.writeHead(400).end();
    return;
  }
  // directory without trailing slash → redirect (like Netlify pretty URLs)
  if (!url.pathname.endsWith('/') && !extname(url.pathname) && fileAt(join(target, 'index.html'))) {
    res.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
    return;
  }
  let file = fileAt(target);
  let status = 200;
  if (!file) {
    file = fileAt(join(root, '404.html'));
    status = 404;
  }
  if (!file) {
    res.writeHead(404).end('Not found');
    return;
  }
  const ext = extname(file.path);
  const headers = {
    'Content-Type': types[ext] ?? 'application/octet-stream',
    'Cache-Control': url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/fonts/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  };
  if (url.pathname.startsWith('/cv/')) headers['Content-Disposition'] = 'attachment; filename="Juan-Leite-CV-PT.pdf"';
  const gzip = compressible.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '');
  if (gzip) headers['Content-Encoding'] = 'gzip';
  else headers['Content-Length'] = file.size;
  res.writeHead(status, headers);
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  const stream = createReadStream(file.path);
  (gzip ? stream.pipe(createGzip({ level: 6 })) : stream).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`serving dist on http://127.0.0.1:${port}`));
