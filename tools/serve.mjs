// Local preview server with clean-URL routing. No dependencies.
//   npm run dev      → serves the source folder (edit files, refresh the browser)
//   npm run preview  → serves the production build in dist/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { renderHtml } from './html.mjs';
import { assetManifest } from './manifest.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const mode = process.argv[2] === 'dist' ? 'dist' : 'dev';
const port = Number(process.env.PORT) || 5173;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.mov': 'video/quicktime', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.woff2': 'font/woff2',
};

const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

const resolveFile = async (urlPath) => {
  const candidates = mode === 'dist'
    ? [path.join(root, 'dist', urlPath)]
    : [path.join(root, urlPath), path.join(root, 'public', urlPath)];
  for (const c of candidates) {
    if (!c.startsWith(root)) continue;
    if (path.basename(c) === 'README.md' || path.basename(c) === '.gitkeep') continue;
    if (await isFile(c)) return c;
  }
  return null;
};

const sendFile = async (req, res, file) => {
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const { size } = await stat(file);
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (range && type.startsWith('video')) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Number(range[2]) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    if (req.method === 'HEAD') return res.end();
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
};

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);

    if (mode === 'dev' && urlPath === '/asset-manifest.json') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
      return res.end(JSON.stringify(await assetManifest(path.join(root, 'public'))));
    }

    // Real files (anything with an extension): serve it, or a genuine 404
    if (path.extname(urlPath)) {
      const file = await resolveFile(urlPath);
      if (file) return sendFile(req, res, file);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }

    // Page routes: dev renders the shell for this route; dist mirrors Vercel
    // (pre-rendered page if it exists, otherwise index.html and the app shows its 404 view)
    let html;
    if (mode === 'dist') {
      const page = await resolveFile(path.join(urlPath, 'index.html'));
      html = await readFile(page || path.join(root, 'dist', 'index.html'), 'utf8');
    } else {
      html = await renderHtml(urlPath.replace(/\/+$/, '') || '/');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? '' : html);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(err));
  }
}).listen(port, () => console.log(`\n  Naman Goyal portfolio (${mode}) → http://localhost:${port}\n`));
