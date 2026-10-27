import { SITE } from '../config/site.js';
import { getCategory } from '../data/categories.js';
import { ICONS } from '../components/icons.js';
import { categoryCards, contactSection, initComposer } from '../components/sections.js';
import { projectCard, emptyState, media, contactButton, hireButton } from '../components/ui.js';
import { initLightbox, initBeforeAfter } from '../components/lightbox.js';
import {
  esc, asset, embedUrl, formatDate, projectsIn, findProject, prefersReducedMotion, hasAsset, qs, qsa,
} from '../lib/util.js';

/* ── /work ─────────────────────────────────────────────────────────────── */

export const workIndex = {
  render: () => ({
    navKey: 'work',
    title: `Work | ${SITE.name}`,
    description: 'Photoshop, After Effects, Premiere Pro and Maya work by Naman Goyal.',
    html: `
      <section class="page-head">
        <div class="wrap">
          <h1 class="h1">Work</h1>
          <p class="lede">Choose a discipline. Each one holds its own projects, from stills and composites to edits, motion and 3D renders.</p>
        </div>
      </section>
      <section class="section section--tight" aria-label="Work categories">
        <div class="wrap">${categoryCards()}</div>
      </section>`,
  }),
  init: () => {},
};

/* ── /work/:category ───────────────────────────────────────────────────── */

const hoverPreviews = (root) => {
  if (prefersReducedMotion() || !matchMedia('(hover: hover)').matches) return;
  qsa('.card', root).forEach((card) => {
    const v = qs('.card__preview', card);
    if (!v) return;
    card.addEventListener('mouseenter', () => {
      if (!v.src) v.src = v.dataset.src;
      v.play().then(() => card.classList.add('is-previewing')).catch(() => {});
    });
    card.addEventListener('mouseleave', () => {
      v.pause();
      card.classList.remove('is-previewing');
    });
  });
};

export const categoryPage = {
  render: ({ category }) => {
    const cat = getCategory(category);
    const list = projectsIn(cat.id);
    const tags = [...new Set(list.flatMap((p) => p.tags || []))];
    return {
      navKey: 'work',
      title: `${cat.name} | ${SITE.name}`,
      description: cat.intro,
      html: `
        <section class="page-head page-head--cat">
          <div class="wrap">
            <nav class="crumbs" aria-label="Breadcrumb"><a href="/work">Work</a><span aria-hidden="true">/</span><span aria-current="page">${esc(cat.name)}</span></nav>
            <div class="cat-title"><span class="mark mark--lg">${cat.mark}</span><h1 class="h1">${esc(cat.name)}</h1></div>
            <p class="lede">${esc(cat.intro)}</p>
            <ul class="pills pills--quiet" role="list" aria-label="Types of work">${cat.types.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          </div>
        </section>
        <section class="section section--tight" aria-label="${esc(cat.name)} projects">
          <div class="wrap">
            ${
              list.length
                ? `${tags.length > 1 ? `<div class="filters" role="group" aria-label="Filter projects">
                      <button type="button" class="chip is-on" data-filter="*" aria-pressed="true">All</button>
                      ${tags.map((t) => `<button type="button" class="chip" data-filter="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join('')}
                    </div>` : ''}
                   <div class="grid grid--${cat.media}" data-grid>
                     ${list.map((p) => `<div class="grid__item" data-tags="${esc((p.tags || []).join('|'))}">${projectCard(p)}</div>`).join('')}
                   </div>`
                : emptyState(cat.name)
            }
          </div>
        </section>
        <section class="section cta-band">
          <div class="wrap cta-band__inner">
            <p class="h2">Need ${cat.id === 'maya' ? '3D work' : cat.id === 'photoshop' ? 'design or retouching' : cat.id === 'premiere-pro' ? 'an edit' : 'motion work'} for a project?</p>
            <div class="btn-row">${contactButton()}${hireButton()}</div>
          </div>
        </section>`,
    };
  },
  init: (root) => {
    hoverPreviews(root);
    const chips = qsa('[data-filter]', root);
    chips.forEach((chip) =>
      chip.addEventListener('click', () => {
        const f = chip.dataset.filter;
        chips.forEach((c) => {
          c.classList.toggle('is-on', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        qsa('.grid__item', root).forEach((it) => {
          it.hidden = f !== '*' && !it.dataset.tags.split('|').includes(f);
        });
      })
    );
  },
};

/* ── /work/:category/:id ───────────────────────────────────────────────── */

const videoBlock = (p) => {
  if (!p.video) return '';
  const embed = embedUrl(p.video);
  if (embed)
    return `<div class="project__video"><iframe src="${esc(embed)}" title="${esc(p.title)}" loading="lazy"
      allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  const present = hasAsset(p.video);
  return `<div class="project__video" data-video>
      ${present ? `<video controls playsinline preload="metadata" ${hasAsset(p.thumbnail) ? `poster="${esc(asset(p.thumbnail))}"` : ''} src="${esc(asset(p.video))}"></video>` : ''}
      <div class="project__video-missing" ${present ? 'hidden' : ''}>
        ${media({ src: '', category: p.category, seed: p.id, ratio: '16 / 9' })}
        <p>Video not uploaded yet${SITE.showDrafts ? `: add <code>${esc(p.video)}</code>` : ''}.</p>
      </div>
    </div>`;
};

const compareBlock = (p) => {
  const ba = p.beforeAfter;
  if (!ba?.before || !ba?.after) return '';
  return `<section class="project__block" aria-labelledby="ba-title">
      <h2 id="ba-title" class="h3">Before and after</h2>
      <div class="compare" data-compare style="--pos:50%">
        ${media({ src: ba.after, alt: 'After', category: p.category, seed: p.id + 'a', ratio: '16 / 10', cls: 'compare__after' })}
        ${media({ src: ba.before, alt: 'Before', category: p.category, seed: p.id + 'b', ratio: '16 / 10', cls: 'compare__before' })}
        <span class="compare__label compare__label--l" aria-hidden="true">Before</span>
        <span class="compare__label compare__label--r" aria-hidden="true">After</span>
        <input type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after">
      </div>
    </section>`;
};

const galleryBlock = (p) => {
  const imgs = p.gallery || [];
  if (!imgs.length) return '';
  return `<section class="project__block" aria-labelledby="gal-title">
      <h2 id="gal-title" class="h3">Gallery</h2>
      <div class="gallery">
        ${imgs.map((src, i) => `<button type="button" class="gallery__item" data-lightbox="g" data-full="${esc(asset(src))}"
            data-alt="${esc(p.title)} image ${i + 1}" aria-label="View image ${i + 1} full size">
            ${media({ src, alt: `${p.title}, image ${i + 1}`, category: p.category, seed: p.id + i, ratio: '4 / 3' })}
          </button>`).join('')}
      </div>
    </section>`;
};

const detail = (label, value) => (value ? `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>` : '');

export const projectPage = {
  render: ({ category, id }) => {
    const cat = getCategory(category);
    const p = findProject(category, id);
    if (!p) return null;
    const siblings = projectsIn(category);
    const i = siblings.indexOf(p);
    const next = siblings.length > 1 ? siblings[(i + 1) % siblings.length] : null;
    return {
      navKey: 'work',
      title: `${p.title} | ${cat.name} | ${SITE.name}`,
      description: p.description || cat.intro,
      html: `
        <article class="project">
          <header class="page-head">
            <div class="wrap">
              <nav class="crumbs" aria-label="Breadcrumb"><a href="/work">Work</a><span aria-hidden="true">/</span>
                <a href="/work/${cat.id}">${esc(cat.name)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.title)}</span></nav>
              ${p.draft ? '<p class="badge badge--draft badge--inline">Placeholder: replace this entry in src/data/projects.js</p>' : ''}
              <h1 class="h1">${esc(p.title)}</h1>
              ${p.description ? `<p class="lede">${esc(p.description)}</p>` : ''}
            </div>
          </header>
          <div class="wrap project__grid">
            <div class="project__main">
              ${p.video ? videoBlock(p) : `<button type="button" class="project__hero" data-lightbox="g" data-full="${esc(asset(p.thumbnail || ''))}" data-alt="${esc(p.title)}" aria-label="View ${esc(p.title)} full size">
                  ${media({ src: p.thumbnail, alt: p.title, category: p.category, seed: p.id, ratio: '16 / 10', eager: true })}</button>`}
              ${compareBlock(p)}
              ${galleryBlock(p)}
              ${p.breakdown?.length ? `<section class="project__block" aria-labelledby="bd-title">
                  <h2 id="bd-title" class="h3">Breakdown</h2>
                  <ol class="breakdown">${p.breakdown.map((b) => `<li>${esc(b)}</li>`).join('')}</ol>
                </section>` : ''}
            </div>
            <aside class="project__aside" aria-label="Project details">
              <dl class="details">
                ${detail('Category', cat.name)}
                ${detail('Software', (p.software || []).join(', '))}
                ${detail('Date', formatDate(p.date))}
                ${detail('Duration', p.duration)}
                ${detail('Objective', p.objective)}
                ${detail('Approach', p.approach)}
                ${detail('Final output', p.output)}
              </dl>
              <div class="btn-row btn-row--stack">${contactButton()}${hireButton()}</div>
            </aside>
          </div>
          <nav class="wrap project__nav" aria-label="More projects">
            <a class="link-inline" href="/work/${cat.id}">${ICONS.arrowLeft} All ${esc(cat.name)} work</a>
            ${next ? `<a class="link-inline" href="/work/${cat.id}/${esc(next.id)}">Next: ${esc(next.title)} ${ICONS.arrowRight}</a>` : ''}
          </nav>
        </article>`,
    };
  },
  init: (root) => {
    initLightbox(root);
    initBeforeAfter(root);
    const wrap = qs('[data-video]', root);
    const v = wrap && qs('video', wrap);
    if (v) {
      const fail = () => {
        v.remove();
        qs('.project__video-missing', wrap).hidden = false;
      };
      v.addEventListener('error', fail);
      // Some browsers report a missing source via the <video> element's networkState
      if (v.error) fail();
    }
  },
};

/* ── 404 ───────────────────────────────────────────────────────────────── */

export const notFound = {
  render: () => ({
    navKey: '',
    title: `Page not found | ${SITE.name}`,
    description: 'This page does not exist.',
    html: `
      <section class="page-head page-head--center">
        <div class="wrap">
          <p class="tc-label">00:00:04:04</p>
          <h1 class="h1">This frame isn't in the edit.</h1>
          <p class="lede">The page you followed doesn't exist or has moved.</p>
          <div class="btn-row"><a class="btn btn--primary" href="/">Back to home</a><a class="btn btn--ghost" href="/work">See the work</a></div>
        </div>
      </section>`,
  }),
  init: () => {},
};

export { contactSection, initComposer };
