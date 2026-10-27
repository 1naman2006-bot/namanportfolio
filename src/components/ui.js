import { SITE, whatsappUrl, mailtoUrl } from '../config/site.js';
import { getCategory } from '../data/categories.js';
import { ICONS } from './icons.js';
import { cover } from './covers.js';
import { esc, asset, formatDate, hasAsset } from '../lib/util.js';

/* ── Contact buttons (single source: SITE config) ──────────────────────── */

export const contactButton = ({ size = '', label = 'CONTACT ME' } = {}) =>
  `<a class="btn btn--whatsapp ${size}" href="${esc(whatsappUrl())}" target="_blank" rel="noopener noreferrer"
      aria-label="${esc(label)} on WhatsApp (opens in a new tab)" data-contact="whatsapp">
     ${ICONS.whatsapp}<span>${esc(label)}</span></a>`;

export const hireButton = ({ size = '', label = 'HIRE ME' } = {}) =>
  `<a class="btn btn--hire ${size}" href="${esc(mailtoUrl())}" aria-label="${esc(label)} by email (opens your email app)" data-contact="email">
     ${ICONS.mail}<span>${esc(label)}</span></a>`;

export const instagramLink = (cls = 'link-inline') =>
  `<a class="${cls}" href="${esc(SITE.instagram.url)}" target="_blank" rel="noopener noreferrer" data-contact="instagram">
     ${ICONS.instagram}<span>Instagram ${esc(SITE.instagram.handle)}</span></a>`;

/* ── Media with graceful fallback ──────────────────────────────────────── */

/**
 * An image that falls back to the category's cover art if the file is missing.
 * `ratio` is a CSS aspect-ratio value.
 */
export const media = ({ src, alt = '', category, seed, ratio = '16 / 10', eager = false, cls = '' }) => {
  const fallback = `<div class="media__fallback">${cover(category, seed || src || category)}${
    SITE.showDrafts && src ? `<span class="media__hint">Add file: ${esc(src)}</span>` : ''
  }</div>`;
  const present = hasAsset(src);
  const img = present
    ? `<img src="${esc(asset(src))}" alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" data-fallback>`
    : '';
  return `<figure class="media ${present ? '' : 'is-missing'} ${cls}" style="aspect-ratio:${ratio}">${fallback}${img}</figure>`;
};

/* ── Project card ──────────────────────────────────────────────────────── */

export const projectCard = (p, { ratio } = {}) => {
  const cat = getCategory(p.category);
  const r = ratio || (cat?.media === 'image' ? '4 / 5' : '16 / 10');
  const meta = [p.duration, formatDate(p.date)].filter(Boolean).join(', ');
  return `<article class="card ${p.draft ? 'card--draft' : ''}">
    <a class="card__link" href="/work/${esc(p.category)}/${esc(p.id)}" aria-label="${esc(p.title)}${p.draft ? ' (placeholder)' : ''}">
      <div class="card__media">
        ${media({ src: p.thumbnail, alt: '', category: p.category, seed: p.id, ratio: r })}
        ${hasAsset(p.preview) ? `<video class="card__preview" muted loop playsinline preload="none" data-src="${esc(asset(p.preview))}" aria-hidden="true"></video>` : ''}
        ${p.video ? `<span class="card__play" aria-hidden="true">${ICONS.play}</span>` : ''}
        ${p.draft ? '<span class="badge badge--draft">Placeholder</span>' : ''}
      </div>
      <div class="card__body">
        <h3 class="card__title">${esc(p.title)}</h3>
        ${p.description ? `<p class="card__desc">${esc(p.description)}</p>` : ''}
        <p class="card__meta">${esc(cat?.name || '')}${p.tags?.length ? ` / ${esc(p.tags[0])}` : ''}${meta ? `<span>${esc(meta)}</span>` : ''}</p>
      </div>
    </a>
  </article>`;
};

/* ── Empty state ───────────────────────────────────────────────────────── */

export const emptyState = (catName) => `
  <div class="empty">
    <p class="empty__title">${esc(catName)} projects are on their way.</p>
    <p class="empty__text">New work is being prepared for this section. In the meantime, get in touch to see recent pieces or talk about a project.</p>
    <div class="btn-row">${contactButton()}${hireButton()}</div>
  </div>`;
