import { ICONS } from './icons.js';
import { qs, qsa } from '../lib/util.js';

/**
 * Full-size image viewer built on <dialog> (focus trap + Escape for free).
 * Any element with [data-lightbox="<group>"] and data-full="<url>" opens it.
 */
let dialog, img, caption, items = [], index = 0;

const ensure = () => {
  if (dialog) return;
  document.body.insertAdjacentHTML(
    'beforeend',
    `<dialog class="lightbox" aria-label="Image viewer">
       <button class="icon-btn lightbox__close" type="button" data-lb-close aria-label="Close viewer">${ICONS.close}</button>
       <button class="icon-btn lightbox__prev" type="button" data-lb-prev aria-label="Previous image">${ICONS.arrowLeft}</button>
       <figure class="lightbox__figure"><img alt=""><figcaption></figcaption></figure>
       <button class="icon-btn lightbox__next" type="button" data-lb-next aria-label="Next image">${ICONS.arrowRight}</button>
     </dialog>`
  );
  dialog = qs('.lightbox');
  img = qs('img', dialog);
  caption = qs('figcaption', dialog);
  qs('[data-lb-close]', dialog).addEventListener('click', () => dialog.close());
  qs('[data-lb-prev]', dialog).addEventListener('click', () => show(index - 1));
  qs('[data-lb-next]', dialog).addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  dialog.addEventListener('close', () => document.body.classList.remove('menu-open'));
};

const show = (i) => {
  index = (i + items.length) % items.length;
  const el = items[index];
  img.src = el.dataset.full;
  img.alt = el.dataset.alt || '';
  caption.textContent = `${index + 1} / ${items.length}${el.dataset.alt ? `  ${el.dataset.alt}` : ''}`;
  const multi = items.length > 1;
  qs('[data-lb-prev]', dialog).hidden = !multi;
  qs('[data-lb-next]', dialog).hidden = !multi;
};

export const initLightbox = (root) => {
  qsa('[data-lightbox]', root).forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (trigger.closest('.media')?.classList.contains('is-missing')) return;
      ensure();
      items = qsa(`[data-lightbox="${trigger.dataset.lightbox}"]`, root).filter(
        (t) => !t.closest('.media')?.classList.contains('is-missing')
      );
      document.body.classList.add('menu-open');
      dialog.showModal();
      show(items.indexOf(trigger));
    });
  });
};

/** Before/after comparison slider. */
export const initBeforeAfter = (root) => {
  qsa('[data-compare]', root).forEach((el) => {
    const range = qs('input', el);
    const set = () => el.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', set);
    set();
  });
};
