// Shared by build.mjs and serve.mjs: fills index.html's %TOKENS% for a given route
// so every page has correct <title>, description and social tags without JavaScript.
import { readFile } from 'node:fs/promises';
import { SITE, whatsappUrl, mailtoUrl } from '../src/config/site.js';
import { CATEGORIES, getCategory } from '../src/data/categories.js';
import { PROJECTS } from '../src/data/projects.js';

const esc = (v = '') => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const visible = () => PROJECTS.filter((p) => p && p.id && getCategory(p.category) && (SITE.showDrafts || !p.draft));

/** Every route that should get its own pre-rendered HTML file. */
export const routes = () => [
  '/',
  '/work',
  ...CATEGORIES.map((c) => `/work/${c.id}`),
  ...visible().map((p) => `/work/${p.category}/${p.id}`),
];

export const metaFor = (route) => {
  const parts = route.split('/').filter(Boolean);
  const home = { title: `${SITE.name} | ${SITE.title}`, description: `${SITE.name}: ${SITE.intro}` };
  if (!parts.length) return home;
  if (parts[0] === 'work' && parts.length === 1)
    return { title: `Work | ${SITE.name}`, description: 'Photoshop, After Effects, Premiere Pro and Maya work by Naman Goyal.' };
  const cat = parts[0] === 'work' && getCategory(parts[1]);
  if (cat && parts.length === 2) return { title: `${cat.name} | ${SITE.name}`, description: cat.intro };
  const p = cat && parts.length === 3 && visible().find((x) => x.category === cat.id && x.id === parts[2]);
  if (p) return { title: `${p.title} | ${cat.name} | ${SITE.name}`, description: p.description || cat.intro };
  return { title: `Page not found | ${SITE.name}`, description: 'This page does not exist.', notFound: true };
};

const noscript = () => `
      <main style="padding:6rem 1.5rem;max-width:40rem;margin:auto;font-family:system-ui;color:#F2F2F0">
        <h1>${esc(SITE.name)}</h1>
        <p>${esc(SITE.title)}</p>
        <p>${esc(SITE.intro)}</p>
        <p><a style="color:#b9b0ff" href="${esc(whatsappUrl())}">CONTACT ME on WhatsApp</a></p>
        <p><a style="color:#b9b0ff" href="${esc(mailtoUrl())}">HIRE ME by email</a></p>
        <p><a style="color:#b9b0ff" href="${esc(SITE.instagram.url)}">Instagram ${esc(SITE.instagram.handle)}</a></p>
      </main>`;

export const renderHtml = async (route, templatePath = new URL('../index.html', import.meta.url)) => {
  const tpl = await readFile(templatePath, 'utf8');
  const m = metaFor(route);
  const origin = SITE.url.replace(/\/$/, '');
  return tpl
    .replaceAll('%TITLE%', esc(m.title))
    .replaceAll('%DESCRIPTION%', esc(m.description))
    .replaceAll('%URL%', esc(origin + (route === '/' ? '/' : route)))
    .replaceAll('%ORIGIN%', esc(origin))
    .replaceAll('%NAME%', esc(SITE.name))
    .replace('%NOSCRIPT%', noscript());
};
