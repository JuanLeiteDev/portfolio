/**
 * Sitemap with reciprocal hreflang alternates for every PT/EN pair.
 * Written by hand because PT and EN paths differ (/projetos vs /en/projects).
 */
import type { APIRoute } from 'astro';
import { htmlLang, routes, LANGS, type L } from '@/i18n';
import { projects } from '@/data/projects';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://juanleitedev.com');
  const pairs: L[] = [routes.home, ...projects.map((p) => routes.project(p.slug))];
  const abs = (p: string) => new URL(p, base).href;

  const urls = pairs.flatMap((pair) =>
    LANGS.map((lang) => {
      const alternates = LANGS.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${htmlLang[l]}" href="${abs(pair[l])}"/>`,
      );
      alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${abs(pair.pt)}"/>`);
      return `  <url>\n    <loc>${abs(pair[lang])}</loc>\n${alternates.join('\n')}\n  </url>`;
    }),
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
