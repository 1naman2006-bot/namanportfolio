import { SITE, whatsappUrl, mailtoUrl } from '../config/site.js';
import { CATEGORIES } from '../data/categories.js';
import { ABOUT, SERVICES, WORKFLOW, SKILLS } from '../data/content.js';
import { ICONS } from './icons.js';
import { cover } from './covers.js';
import { contactButton, hireButton, instagramLink } from './ui.js';
import { esc, asset, realCountIn, hasAsset, qs } from '../lib/util.js';

/* ── Category cards (Work page + homepage) ─────────────────────────────── */

export const categoryCards = () => `
  <ul class="cats" role="list">
    ${CATEGORIES.map((c) => {
      const n = realCountIn(c.id);
      return `<li class="cat">
        <a class="cat__link" href="/work/${c.id}">
          <div class="cat__art">${cover(c.id)}</div>
          <div class="cat__body">
            <div class="cat__head"><span class="mark">${c.mark}</span><h3 class="cat__name">${c.name}</h3></div>
            <p class="cat__desc">${esc(c.short)}</p>
            <p class="cat__foot"><span>${n ? `${n} project${n === 1 ? '' : 's'}` : 'Coming soon'}</span>
              <span class="cat__cta">View projects ${ICONS.arrowRight}</span></p>
          </div>
        </a>
      </li>`;
    }).join('')}
  </ul>`;

/* ── About ─────────────────────────────────────────────────────────────── */

export const aboutSection = () => `
  <section class="section about" id="about" aria-labelledby="about-title">
    <div class="wrap about__grid">
      <figure class="portrait ${hasAsset(SITE.portrait) ? '' : 'is-missing'}" data-portrait>
        ${hasAsset(SITE.portrait) ? '' : '<!-- add your portrait: see public/images/profile/README.md -->'}
        <img ${hasAsset(SITE.portrait) ? '' : 'hidden data-'}src="${esc(asset(SITE.portrait))}" alt="Portrait of ${esc(SITE.name)}" loading="lazy" decoding="async">
        <div class="portrait__fallback" aria-hidden="true"><span>NG</span></div>
      </figure>
      <div class="about__text">
        <h2 id="about-title" class="h2">${esc(ABOUT.heading)}</h2>
        ${ABOUT.paragraphs.map((p) => `<p class="lede">${esc(p)}</p>`).join('')}
        <ul class="pills" role="list">${ABOUT.disciplines.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
      </div>
    </div>
  </section>`;

/* ── Services ──────────────────────────────────────────────────────────── */

export const servicesSection = () => `
  <section class="section services" id="services" aria-labelledby="services-title">
    <div class="wrap">
      <div class="section-head">
        <h2 id="services-title" class="h2">What I can make for you</h2>
        <p class="lede">Four areas of work, available for freelance projects and collaborations.</p>
      </div>
      <div class="services__grid">
        ${SERVICES.map(
          (s) => `<article class="service">
            <h3 class="h3">${esc(s.title)}</h3>
            <ul role="list">${s.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
          </article>`
        ).join('')}
      </div>
    </div>
  </section>`;

/* ── Workflow (a real sequence, so it is numbered) ─────────────────────── */

export const workflowSection = () => `
  <section class="section workflow" aria-labelledby="workflow-title">
    <div class="wrap">
      <div class="section-head">
        <h2 id="workflow-title" class="h2">How a project runs</h2>
      </div>
      <ol class="steps">
        ${WORKFLOW.map(
          (s, i) => `<li class="step">
            <span class="step__n">${String(i + 1).padStart(2, '0')}</span>
            <h3 class="h3">${esc(s.title)}</h3>
            <p>${esc(s.text)}</p>
          </li>`
        ).join('')}
      </ol>
    </div>
  </section>`;

/* ── Skills & software ─────────────────────────────────────────────────── */

export const skillsSection = () => `
  <section class="section skills" aria-labelledby="skills-title">
    <div class="wrap">
      <div class="section-head">
        <h2 id="skills-title" class="h2">Tools I work in</h2>
      </div>
      <ul class="skills__list" role="list">
        ${SKILLS.map(
          (s) => `<li class="skill">
            <span class="mark mark--lg">${esc(s.mark)}</span>
            <div><h3 class="h3">${esc(s.name)}</h3><p>${esc(s.text)}</p></div>
          </li>`
        ).join('')}
      </ul>
    </div>
  </section>`;

/* ── Contact ───────────────────────────────────────────────────────────── */

export const contactSection = () => `
  <section class="section contact" id="contact" aria-labelledby="contact-title">
    <div class="wrap">
      <h2 id="contact-title" class="h1 contact__title">Have a Project in Mind? Let's Create Something Great.</h2>
      <div class="contact__grid">
        <div class="contact__direct">
          <a class="channel" href="${esc(whatsappUrl())}" target="_blank" rel="noopener noreferrer" data-contact="whatsapp">
            <span class="channel__icon">${ICONS.whatsapp}</span>
            <span class="channel__label">CONTACT ME</span>
            <span class="channel__value">WhatsApp ${esc(SITE.whatsapp.display)}</span>
          </a>
          <a class="channel" href="${esc(mailtoUrl())}" data-contact="email">
            <span class="channel__icon">${ICONS.mail}</span>
            <span class="channel__label">HIRE ME</span>
            <span class="channel__value">${esc(SITE.email.address)}</span>
          </a>
          <a class="channel" href="${esc(SITE.instagram.url)}" target="_blank" rel="noopener noreferrer" data-contact="instagram">
            <span class="channel__icon">${ICONS.instagram}</span>
            <span class="channel__label">FOLLOW</span>
            <span class="channel__value">Instagram ${esc(SITE.instagram.handle)}</span>
          </a>
        </div>

        <form class="composer" data-composer novalidate aria-labelledby="composer-title">
          <h3 id="composer-title" class="h3">Describe your project</h3>
          <p class="composer__note">Fill this in and choose where to continue. Your WhatsApp or email app opens with the details filled in, and nothing is sent until you press send there.</p>
          <label class="field"><span>Your name</span><input name="name" autocomplete="name" required></label>
          <label class="field"><span>Project type</span>
            <select name="type">
              <option>Video editing</option><option>Motion graphics / VFX</option><option>3D / Maya</option>
              <option>Photoshop / design</option><option>Photography</option><option>Something else</option>
            </select>
          </label>
          <label class="field"><span>Details</span><textarea name="details" rows="4" placeholder="What do you need, by when, and where will it be used?"></textarea></label>
          <p class="composer__error" data-error role="alert" hidden>Add your name so Naman knows who's writing.</p>
          <div class="btn-row">
            <button class="btn btn--whatsapp btn--text" type="submit" value="whatsapp">${ICONS.whatsapp}<span>Continue in WhatsApp</span></button>
            <button class="btn btn--hire btn--text" type="submit" value="email">${ICONS.mail}<span>Continue in email</span></button>
          </div>
        </form>
      </div>
    </div>
  </section>`;

export const initComposer = (root) => {
  const form = qs('[data-composer]', root);
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const via = e.submitter?.value || 'whatsapp';
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const err = qs('[data-error]', form);
    if (!name) {
      err.hidden = false;
      form.elements.name.focus();
      return;
    }
    err.hidden = true;
    const type = data.get('type');
    const details = String(data.get('details') || '').trim();
    if (via === 'whatsapp') {
      const msg = `${SITE.whatsapp.message}\n\nName: ${name}\nProject: ${type}${details ? `\nDetails: ${details}` : ''}`;
      window.open(whatsappUrl(msg), '_blank', 'noopener');
    } else {
      const body = `Hi Naman,\n\nName: ${name}\nProject: ${type}\n\n${details}`;
      window.location.href = mailtoUrl(`${SITE.email.subject}: ${type}`, body);
    }
  });
};

/* ── Portrait fallback ─────────────────────────────────────────────────── */
export const initPortrait = (root) => {
  const fig = qs('[data-portrait]', root);
  const img = fig && qs('img', fig);
  if (!img) return;
  const fail = () => fig.classList.add('is-missing');
  img.addEventListener('error', fail);
  if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
};

export { contactButton, hireButton, instagramLink };
