import { SITE, whatsappUrl } from '../config/site.js';
import { CATEGORIES } from '../data/categories.js';
import { ICONS } from './icons.js';
import { contactButton, hireButton, instagramLink } from './ui.js';
import { esc, qs, qsa } from '../lib/util.js';

const LINKS = [
  { href: '/', label: 'Home', key: 'home' },
  { href: '/work', label: 'Work', key: 'work', sub: true },
  { href: '/#about', label: 'About', key: 'about' },
  { href: '/#services', label: 'Services', key: 'services' },
  { href: '/#contact', label: 'Contact', key: 'contact' },
];

const workMenu = (id) => `
  <ul class="dropdown" id="${id}" role="list">
    ${CATEGORIES.map(
      (c) => `<li><a href="/work/${c.id}"><span class="mark mark--sm">${c.mark}</span><span>${c.name}</span></a></li>`
    ).join('')}
  </ul>`;

export const renderNav = () => `
  <a class="skip" href="#main">Skip to content</a>
  <header class="nav" data-nav>
    <div class="nav__inner">
      <a class="wordmark" href="/" aria-label="${esc(SITE.name)}, home">${esc(SITE.name)}</a>
      <nav class="nav__links" aria-label="Main">
        <ul role="list">
          ${LINKS.map((l) =>
            l.sub
              ? `<li class="has-dropdown" data-dropdown>
                  <a href="${l.href}" data-nav-key="${l.key}">${l.label}</a>
                  <button class="dropdown-toggle" type="button" aria-expanded="false" aria-controls="work-menu" aria-label="Show work categories">${ICONS.chevron}</button>
                  ${workMenu('work-menu')}
                </li>`
              : `<li><a href="${l.href}" data-nav-key="${l.key}">${l.label}</a></li>`
          ).join('')}
        </ul>
      </nav>
      <div class="nav__actions">
        ${contactButton({ size: 'btn--sm' })}
        ${hireButton({ size: 'btn--sm' })}
      </div>
      <div class="nav__compact">
        <a class="icon-btn" href="#contact-shortcut" data-compact="whatsapp" aria-label="Contact me on WhatsApp">${ICONS.whatsapp}</a>
        <a class="icon-btn" href="#hire-shortcut" data-compact="email" aria-label="Hire me by email">${ICONS.mail}</a>
        <button class="icon-btn" type="button" data-menu-open aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">${ICONS.menu}</button>
      </div>
    </div>
  </header>

  <div class="mobile-menu" id="mobile-menu" hidden>
    <div class="mobile-menu__top">
      <span class="wordmark">${esc(SITE.name)}</span>
      <button class="icon-btn" type="button" data-menu-close aria-label="Close menu">${ICONS.close}</button>
    </div>
    <nav aria-label="Mobile">
      <ul class="mobile-menu__links" role="list">
        ${LINKS.map(
          (l) => `<li><a href="${l.href}">${l.label}</a>${
            l.sub
              ? `<ul class="mobile-menu__sub" role="list">${CATEGORIES.map((c) => `<li><a href="/work/${c.id}">${c.name}</a></li>`).join('')}</ul>`
              : ''
          }</li>`
        ).join('')}
      </ul>
    </nav>
    <div class="mobile-menu__actions">
      ${contactButton()}${hireButton()}
      ${instagramLink()}
    </div>
  </div>`;

export const initNav = () => {
  const nav = qs('[data-nav]');
  const dd = qs('[data-dropdown]');
  const toggle = qs('.dropdown-toggle', dd);
  const menu = qs('#mobile-menu');
  const openBtn = qs('[data-menu-open]');

  // Compact icon buttons mirror the full buttons' URLs (single source of truth)
  qs('[data-compact="whatsapp"]').href = qs('.nav__actions [data-contact="whatsapp"]').href;
  qs('[data-compact="whatsapp"]').target = '_blank';
  qs('[data-compact="whatsapp"]').rel = 'noopener noreferrer';
  qs('[data-compact="email"]').href = qs('.nav__actions [data-contact="email"]').href;

  const setDropdown = (open) => {
    dd.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  // Hover opens on desktop; a click right after a hover-open keeps it open instead of closing it.
  let hoverOpened = false;
  toggle.addEventListener('click', () => {
    if (hoverOpened) {
      hoverOpened = false;
      return setDropdown(true);
    }
    setDropdown(!dd.classList.contains('is-open'));
  });
  dd.addEventListener('mouseenter', () => {
    if (!matchMedia('(hover: hover)').matches) return;
    hoverOpened = !dd.classList.contains('is-open');
    setDropdown(true);
  });
  dd.addEventListener('mouseleave', () => {
    hoverOpened = false;
    setDropdown(false);
  });
  dd.addEventListener('focusout', (e) => !dd.contains(e.relatedTarget) && setDropdown(false));

  const setMenu = (open) => {
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    if (open) qs('[data-menu-close]', menu).focus();
    else openBtn.focus({ preventScroll: true });
  };
  openBtn.addEventListener('click', () => setMenu(true));
  qs('[data-menu-close]').addEventListener('click', () => setMenu(false));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      menu.hidden = true;
      document.body.classList.remove('menu-open');
      openBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!menu.hidden) setMenu(false);
    if (dd.classList.contains('is-open')) {
      setDropdown(false);
      toggle.focus();
    }
  });

  const onScroll = () => nav.classList.toggle('is-solid', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};

/** Highlight the active nav item for the current route. */
export const setActiveNav = (key) => {
  qsa('[data-nav-key]').forEach((a) => {
    const on = a.dataset.navKey === key;
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
};

export const renderFooter = () => `
  <footer class="footer">
    <div class="footer__inner">
      <div>
        <p class="wordmark">${esc(SITE.name)}</p>
        <p class="footer__title">${esc(SITE.title)}</p>
      </div>
      <ul class="footer__links" role="list">
        ${CATEGORIES.map((c) => `<li><a href="/work/${c.id}">${c.name}</a></li>`).join('')}
      </ul>
      <ul class="footer__links" role="list">
        <li>${instagramLink('')}</li>
        <li><a href="mailto:${esc(SITE.email.address)}">${esc(SITE.email.address)}</a></li>
        <li><a href="${esc(whatsappUrl())}" target="_blank" rel="noopener noreferrer" data-contact="whatsapp">${esc(SITE.whatsapp.display)}</a></li>
      </ul>
    </div>
    <p class="footer__copy">© <span data-year></span> ${esc(SITE.name)}</p>
  </footer>`;
