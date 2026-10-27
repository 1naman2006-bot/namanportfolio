import { SITE } from '../config/site.js';
import { ICONS } from '../components/icons.js';
import { initHero3D } from '../components/hero3d.js';
import { playIntro } from '../components/intro.js';
import { renderShowreel, initShowreel } from '../components/showreel.js';
import { contactButton, hireButton, projectCard } from '../components/ui.js';
import {
  categoryCards, aboutSection, servicesSection, workflowSection, skillsSection,
  contactSection, initComposer, initPortrait,
} from '../components/sections.js';
import { esc, featuredProjects, qs } from '../lib/util.js';

const timecode = (t) => {
  const f = Math.floor(t * 24);
  const ff = f % 24, s = Math.floor(f / 24) % 60, m = Math.floor(f / 1440) % 60, h = Math.floor(f / 86400);
  return [h, m, s, ff].map((n) => String(n).padStart(2, '0')).join(':');
};

const selectedWork = () => {
  const list = featuredProjects().slice(0, 4);
  if (!list.length) return '';
  return `
    <section class="section selected" aria-labelledby="selected-title">
      <div class="wrap">
        <div class="section-head section-head--row">
          <h2 id="selected-title" class="h2">Selected work</h2>
          <a class="link-inline" href="/work">All work ${ICONS.arrowRight}</a>
        </div>
        <div class="grid grid--featured">${list.map((p) => projectCard(p, { ratio: '16 / 11' })).join('')}</div>
      </div>
    </section>`;
};

export const home = {
  render: () => ({
    navKey: 'home',
    title: `${SITE.name} | ${SITE.title}`,
    description: `${SITE.name}: ${SITE.intro}`,
    html: `
      <section class="hero" data-intro aria-labelledby="hero-name">
        <div class="hero__glows" aria-hidden="true">
          <span class="glow glow--teal"></span><span class="glow glow--violet"></span><span class="glow glow--magenta"></span>
        </div>
        <div class="hero__visual" data-hero3d aria-hidden="true"><canvas></canvas></div>
        <div class="hero__shade" aria-hidden="true"></div>

        <div class="hero__center">
          <h1 id="hero-name" class="hero__name">NAMAN GOYAL</h1>
          <p class="hero__sub">${esc(SITE.subtitle)}</p>
        </div>

        <div class="hero__bottom">
          <p class="hero__headline">${esc(SITE.headline)}</p>
          <p class="hero__intro">${esc(SITE.intro)}</p>
          <div class="btn-row hero__actions">
            <a class="btn btn--primary" href="/work">EXPLORE MY WORK ${ICONS.arrowRight}</a>
            ${contactButton()}
            ${hireButton()}
          </div>
        </div>
        <span class="hero__tc" data-tc aria-hidden="true">00:00:00:00</span>
      </section>

      ${renderShowreel()}

      ${selectedWork()}

      <section class="section" aria-labelledby="work-title">
        <div class="wrap">
          <div class="section-head section-head--row">
            <h2 id="work-title" class="h2">Four disciplines, four bodies of work</h2>
            <a class="link-inline" href="/work">Open the work index ${ICONS.arrowRight}</a>
          </div>
          ${categoryCards()}
        </div>
      </section>

      ${aboutSection()}
      ${servicesSection()}
      ${workflowSection()}
      ${skillsSection()}
      ${contactSection()}`,
  }),

  init: (root) => {
    const tc = qs('[data-tc]', root);
    let last = '';
    const cleanup = initHero3D(qs('[data-hero3d]', root), {
      onTick: (t) => {
        const v = timecode(t);
        if (v !== last) tc.textContent = last = v;
      },
    });
    playIntro(qs('[data-intro]', root));
    initShowreel(root);
    initComposer(root);
    initPortrait(root);
    return cleanup;
  },
};
