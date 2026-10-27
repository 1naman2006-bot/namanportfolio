// Production build: copies the site into dist/ and pre-renders one HTML file per route.
// No dependencies — runs on plain Node 18+.
import { cp, mkdir, rm, writeFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE } from '../src/config/site.js';
import { routes, renderHtml } from './html.mjs';
import { assetManifest } from './manifest.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// public/ → dist/ (same as Vite/Next: /projects/... /images/... /videos/...)
// README/.gitkeep files are documentation for you, not for visitors.
await cp(path.join(root, 'public'), dist, {
  recursive: true,
  filter: (src) => !/(README\.md|\.gitkeep)$/.test(src),
});
await cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });

await writeFile(path.join(dist, 'asset-manifest.json'), JSON.stringify(await assetManifest(path.join(root, 'public'))));

const list = routes();
for (const r of list) {
  const file = r === '/' ? path.join(dist, 'index.html') : path.join(dist, r, 'index.html');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, await renderHtml(r));
}
await writeFile(path.join(dist, '404.html'), await renderHtml('/404'));

const origin = SITE.url.replace(/\/$/, '');
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list
    .map((r) => `  <url><loc>${origin}${r === '/' ? '/' : r}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);

const size = async (dir) => {
  let total = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    total += e.isDirectory() ? await size(p) : (await stat(p)).size;
  }
  return total;
};
console.log(`✓ Built ${list.length} pages + 404 into dist/ (${(await size(dist) / 1024).toFixed(0)} KB)`);
