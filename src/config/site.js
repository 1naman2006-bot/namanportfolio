/**
 * SITE CONFIG — the one place to change contact details, links and media.
 * Every button and link on the site reads from here.
 */

export const SITE = {
  name: 'Naman Goyal',
  title: 'Video Editor | Motion Graphics Artist | 3D Artist | Photographer',
  headline: 'Turning Ideas Into Visual Experiences.',
  intro: 'Photography, cinematic editing, motion graphics, VFX, and 3D visual storytelling.',
  // Your NEW deployment's domain (used for SEO tags + sitemap). Update after the first Vercel deploy.
  url: 'https://naman-premium-portfolio.vercel.app',

  // ── Contact ────────────────────────────────────────────────
  whatsapp: {
    number: '916399399235', // country code + number, digits only (+91 6399399235)
    display: '+91 6399399235',
    message: 'Hi Naman, I visited your portfolio and would like to discuss a project with you.',
  },
  email: {
    address: '1naman2006@gmail.com',
    subject: 'Freelance Project Enquiry',
  },
  instagram: {
    url: 'https://www.instagram.com/s_corps25/',
    handle: '@s_corps25',
  },

  // ── Showreel ───────────────────────────────────────────────
  // Drop your file in public/videos/ and point `src` at it.
  // Or paste a YouTube / Vimeo link into `embed` instead (leave src as is).
  showreel: {
    src: '/videos/showreel.mp4',
    poster: '/images/showreel-poster.jpg',
    embed: '', // e.g. 'https://www.youtube.com/watch?v=XXXXXXXX'
  },

  // ── Portrait ───────────────────────────────────────────────
  portrait: '/images/profile/portrait.jpg',

  // ── Hero opening ───────────────────────────────────────────
  subtitle: 'Video Editing / Motion Graphics / 3D Art / Photography',
  // Opening-scene character. '' = the built-in 3D character that turns and moves.
  // Set to a transparent PNG/WebP (e.g. '/images/naman-3d.webp', your 3D bust) to
  // float that image instead — it can only sway, not fully turn.
  heroCharacter: '',
  // Your own looping hero render (e.g. a 10–15 s Maya or After Effects loop, no audio).
  // When these files exist they play full-screen behind your name and replace the
  // built-in cube scene. Leave them missing to use the built-in scene.
  heroVideo: {
    desktop: '/videos/hero.mp4', // 1920 × 1080, H.264, ideally under 8 MB
    mobile: '/videos/hero-mobile.mp4', // 1080 × 1920 portrait, under 5 MB
  },

  // ── Hero 3D ────────────────────────────────────────────────
  // Leave empty to use the built-in animated 3D form.
  // To use Spline: paste your scene's public .splinecode URL here.
  splineScene: '',
  splineViewerScript: 'https://unpkg.com/@splinetool/viewer/build/spline-viewer.js',

  // ── Placeholders ───────────────────────────────────────────
  // Example "draft" projects are visible while true so you can see the layout.
  // Set to false before showing the site to clients.
  showDrafts: false,
};

export const whatsappUrl = (message = SITE.whatsapp.message) =>
  `https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(message)}`;

export const mailtoUrl = (subject = SITE.email.subject, body = '') =>
  `mailto:${SITE.email.address}?subject=${encodeURIComponent(subject)}` +
  (body ? `&body=${encodeURIComponent(body)}` : '');
