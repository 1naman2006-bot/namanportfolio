import { SITE } from './config/site.js';
import { getCategory } from './data/categories.js';
import { renderNav, initNav, setActiveNav, renderFooter } from './components/nav.js';
import { home } from './pages/home.js';
import { workIndex, categoryPage, projectPage, notFound } from './pages/work.js';
import { prefersReducedMotion, loadAssetManifest, qs, qsa } from './lib/util.js';

/* ── Shell ─────────────────────────────────────────────────────────────── */

const app = qs('#app');
app.innerHTML = `${renderNav()}<main id="main" tabindex="-1"></main>${renderFooter()}`;
qs('[data-year]').textContent = new Date().getFullYear();
initNav();
const main = qs('#main');

/* ── Missing-image fallback (works for every <img data-fallback>) ──────── */

document.addEventListener(
  'error',
  (e) => {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.hasAttribute('data-fallback')) {
      img.closest('.media')?.classList.add('is-missing');
      img.remove();
    }
  },
  true
);

/* ── Routing ───────────────────────────────────────────────────────────── */

const match = (path) => {
  const parts = path.replace(/\/+$/, '').split('/').filter(Boolean);
  if (parts.length === 0) return [home, {}];
  if (parts[0] === 'work') {
    if (parts.length === 1) return [workIndex, {}];
    if (getCategory(parts[1])) {
      if (parts.length === 2) return [categoryPage, { category: parts[1] }];
      if (parts.length === 3) return [projectPage, { category: parts[1], id: decodeURIComponent(parts[2]) }];
    }
  }
  return [notFound, {}];
};

const setMeta = (name, value, attr = 'name') => {
  let el = qs(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

let cleanup = null;
let revealObserver = null;

const reveal = () => {
  revealObserver?.disconnect();
  const els = qsa('.section-head, .cats, .grid, .about__grid, .services__grid, .steps, .skills__list, .contact__grid', main);
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          revealObserver.unobserve(en.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
};

const render = async ({ hash = location.hash, focus = false, scroll = true } = {}) => {
  let [page, params] = match(location.pathname);
  let view = page.render(params);
  if (!view) [page, view] = [notFound, notFound.render()];

  const swap = () => {
    if (typeof cleanup === 'function') cleanup();
    main.innerHTML = view.html;
    document.title = view.title;
    setMeta('description', view.description);
    setMeta('og:title', view.title, 'property');
    setMeta('og:description', view.description, 'property');
    setMeta('og:url', SITE.url + location.pathname, 'property');
    qs('link[rel="canonical"]')?.setAttribute('href', SITE.url + location.pathname);
    setActiveNav(view.navKey);
    cleanup = page.init(main);
    reveal();

    if (hash && hash.length > 1) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        requestAnimationFrame(() => target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));
        if (['about', 'services', 'contact'].includes(target.id)) setActiveNav(target.id);
      }
    } else if (scroll) window.scrollTo(0, 0);
    if (focus) main.focus({ preventScroll: true });
  };

  if (prefersReducedMotion() || !main.innerHTML) return swap();
  main.classList.add('is-leaving');
  await new Promise((r) => setTimeout(r, 160));
  swap();
  main.classList.remove('is-leaving');
};

export const navigate = (url) => {
  const u = new URL(url, location.origin);
  const samePage = u.pathname === location.pathname;
  history.pushState({}, '', u.pathname + u.search + u.hash);
  if (samePage && u.hash) {
    const el = document.getElementById(u.hash.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      setActiveNav(u.hash.slice(1));
      return;
    }
  }
  render({ hash: u.hash, focus: !u.hash });
};

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (a.target === '_blank' || a.hasAttribute('download')) return;
  const href = a.getAttribute('href');
  if (!href || /^(mailto:|tel:|https?:)/.test(href) || href.startsWith('#')) return;
  const u = new URL(href, location.origin);
  if (u.origin !== location.origin) return;
  if (/\.[a-z0-9]{2,5}$/i.test(u.pathname)) return; // real files
  e.preventDefault();
  navigate(u.href);
});

window.addEventListener('popstate', () => render({ scroll: !location.hash }));

loadAssetManifest().then(() => render());
