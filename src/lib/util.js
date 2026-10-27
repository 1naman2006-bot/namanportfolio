import { SITE } from '../config/site.js';
import { PROJECTS } from '../data/projects.js';

/** Escape text for safe insertion into HTML. */
export const esc = (v = '') =>
  String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Encode a local or remote media path (handles spaces in file names). */
export const asset = (p = '') => (/^https?:\/\//.test(p) ? p : encodeURI(p));

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Projects visible on the site (drafts hidden unless SITE.showDrafts). Newest first. */
export const visibleProjects = () =>
  PROJECTS.filter((p) => p && p.id && p.category && (SITE.showDrafts || !p.draft)).sort((a, b) =>
    String(b.date || '').localeCompare(String(a.date || ''))
  );

export const projectsIn = (cat) => visibleProjects().filter((p) => p.category === cat);
export const realCountIn = (cat) => visibleProjects().filter((p) => p.category === cat && !p.draft).length;
export const featuredProjects = () => visibleProjects().filter((p) => p.featured);
export const findProject = (cat, id) => visibleProjects().find((p) => p.category === cat && p.id === id);

export const formatDate = (d) => {
  if (!d) return '';
  const [y, m] = String(d).split('-');
  if (!m) return y;
  const month = new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-GB', { month: 'long' });
  return `${month} ${y}`;
};

/** Recognise YouTube / Vimeo links and return an embeddable URL, or null for local files. */
export const embedUrl = (url = '') => {
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?dnt=1`;
  return null;
};

/* ── Asset manifest ────────────────────────────────────────────────────
   The build writes /asset-manifest.json listing every file in public/.
   Media that isn't listed shows its designed fallback straight away, with no
   failed request. If the manifest can't load, files are simply requested. */
let ASSETS = null;
export const loadAssetManifest = async () => {
  try {
    const res = await fetch('/asset-manifest.json', { cache: 'no-cache' });
    if (res.ok) ASSETS = new Set(await res.json());
  } catch {
    ASSETS = null;
  }
};

/** Does this media path exist? Remote URLs are assumed to. */
export const hasAsset = (p) => {
  if (!p) return false;
  if (/^https?:\/\//.test(p)) return true;
  return ASSETS ? ASSETS.has(p.split('?')[0]) : true;
};

export const mediaExists = async (p) => hasAsset(p);

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];
