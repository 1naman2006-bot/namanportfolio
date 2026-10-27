import { SITE } from '../config/site.js';
import { ICONS } from './icons.js';
import { esc, asset, embedUrl, mediaExists, hasAsset, qs } from '../lib/util.js';
import { contactButton } from './ui.js';

/**
 * Showreel player. Supports a local video (SITE.showreel.src) or a YouTube/Vimeo
 * link (SITE.showreel.embed). Never autoplays. Shows a designed "coming soon" state
 * when no video is available.
 */

export const renderShowreel = () => `
  <section class="section showreel" id="showreel" aria-labelledby="showreel-title">
    <div class="wrap">
      <div class="section-head">
        <h2 id="showreel-title" class="h2">Showreel</h2>
        <p class="lede">A cut of recent editing, motion and 3D work in one place.</p>
      </div>
      <div class="player" data-player>
        <div class="player__stage">
          <div class="player__poster" aria-hidden="true">
            ${hasAsset(SITE.showreel.poster) ? `<img src="${esc(asset(SITE.showreel.poster))}" alt="" loading="lazy" decoding="async" data-poster-img>` : ''}
          </div>
          <div class="player__placeholder" data-placeholder hidden>
            <p class="player__soon">The new showreel is in the edit.</p>
            <p class="player__soon-sub">Ask for a private preview of recent work.</p>
            ${contactButton({ label: 'REQUEST A PREVIEW' })}
          </div>
        </div>
      </div>
    </div>
  </section>`;

const fmt = (s) => {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

export const initShowreel = async (root) => {
  const player = qs('[data-player]', root);
  if (!player) return;
  const stage = qs('.player__stage', player);
  const placeholder = qs('[data-placeholder]', player);
  const posterImg = qs('[data-poster-img]', player);
  posterImg?.addEventListener('error', () => posterImg.remove());

  // 1) YouTube / Vimeo embed
  const embed = embedUrl(SITE.showreel.embed || '');
  if (embed) {
    stage.insertAdjacentHTML(
      'beforeend',
      `<button class="player__big" type="button" data-load-embed aria-label="Play showreel">${ICONS.play}<span>Play showreel</span></button>`
    );
    qs('[data-load-embed]', stage).addEventListener('click', () => {
      stage.innerHTML = `<iframe class="player__frame" src="${esc(embed)}&autoplay=1" title="${esc(SITE.name)} showreel"
        allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    });
    return;
  }

  // 2) Local file — only if it really exists
  const ok = await mediaExists(SITE.showreel.src);
  if (!ok) {
    placeholder.hidden = false;
    player.classList.add('is-empty');
    return;
  }

  stage.insertAdjacentHTML(
    'beforeend',
    `<video class="player__video" preload="none" playsinline ${hasAsset(SITE.showreel.poster) ? `poster="${esc(asset(SITE.showreel.poster))}"` : ''} src="${esc(asset(SITE.showreel.src))}"
       aria-label="${esc(SITE.name)} showreel"></video>
     <button class="player__big" type="button" data-toggle aria-label="Play showreel">${ICONS.play}<span>Play showreel</span></button>`
  );
  player.insertAdjacentHTML(
    'beforeend',
    `<div class="player__bar">
       <button class="icon-btn" type="button" data-toggle aria-label="Play">${ICONS.play}</button>
       <span class="player__time" data-time>0:00</span>
       <input class="player__seek" type="range" min="0" max="1000" value="0" step="1" aria-label="Seek" data-seek>
       <span class="player__time" data-dur>0:00</span>
       <button class="icon-btn" type="button" data-mute aria-label="Mute">${ICONS.volume}</button>
       <button class="icon-btn" type="button" data-fs aria-label="Fullscreen">${ICONS.expand}</button>
     </div>`
  );

  const video = qs('video', player);
  const toggles = [...player.querySelectorAll('[data-toggle]')];
  const seek = qs('[data-seek]', player);
  const mute = qs('[data-mute]', player);

  const sync = () => {
    const playing = !video.paused;
    player.classList.toggle('is-playing', playing);
    player.classList.add('is-started');
    toggles.forEach((b) => {
      b.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      b.firstElementChild.outerHTML = playing ? ICONS.pause : ICONS.play;
    });
  };
  toggles.forEach((b) => b.addEventListener('click', () => (video.paused ? video.play() : video.pause())));
  video.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  video.addEventListener('loadedmetadata', () => (qs('[data-dur]', player).textContent = fmt(video.duration)));
  video.addEventListener('timeupdate', () => {
    qs('[data-time]', player).textContent = fmt(video.currentTime);
    if (video.duration) seek.value = String((video.currentTime / video.duration) * 1000);
  });
  video.addEventListener('error', () => {
    player.classList.add('is-empty');
    placeholder.hidden = false;
  });
  seek.addEventListener('input', () => video.duration && (video.currentTime = (seek.value / 1000) * video.duration));
  mute.addEventListener('click', () => {
    video.muted = !video.muted;
    mute.setAttribute('aria-label', video.muted ? 'Unmute' : 'Mute');
    mute.innerHTML = video.muted ? ICONS.mute : ICONS.volume;
  });
  qs('[data-fs]', player).addEventListener('click', () => {
    const el = video;
    if (document.fullscreenElement) document.exitFullscreen();
    else (el.requestFullscreen || el.webkitEnterFullscreen || el.webkitRequestFullscreen)?.call(el);
  });
};
