import { prefersReducedMotion } from '../lib/util.js';

/**
 * Opening sequence (first visit to the homepage in a browser session):
 *   0.0s  black screen, light glows and wavy lines fade up
 *   0.7s  name resolves in the centre (blur → sharp, rising)
 *   1.1s  subtitle
 *   1.3s  3D scene fades in behind (handled in hero3d.js)
 *   2.1s  headline, intro and buttons
 *   2.4s  navigation slides in
 * Later visits (and reduced motion) show everything immediately.
 */
const KEY = 'ng-intro-played';

export const playIntro = (hero) => {
  if (!hero) return;
  let played = false;
  try { played = sessionStorage.getItem(KEY) === '1'; } catch { /* storage blocked */ }

  if (played || prefersReducedMotion()) {
    hero.classList.add('is-instant', 'is-in');
    return;
  }
  document.body.classList.add('intro-running');
  // Two frames so the starting state paints before transitions run
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-in')));
  setTimeout(() => document.body.classList.remove('intro-running'), 2400);
  try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }
};
