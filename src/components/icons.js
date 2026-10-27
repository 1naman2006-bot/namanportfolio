// Small inline SVG icon set. All icons are decorative (aria-hidden); buttons carry their own text labels.
const svg = (body, vb = '0 0 24 24') =>
  `<svg class="icon" viewBox="${vb}" width="18" height="18" aria-hidden="true" focusable="false">${body}</svg>`;

const stroke = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';

export const ICONS = {
  whatsapp: svg(
    `<path fill="currentColor" d="M12 2.2a9.7 9.7 0 0 0-8.36 14.6L2.3 21.7l5.03-1.32A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.08-1.12l-.29-.17-2.98.78.8-2.9-.19-.3A8 8 0 1 1 12 19.9Z"/>
     <path fill="currentColor" d="M16.4 14.02c-.24-.12-1.43-.7-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06a6.55 6.55 0 0 1-3.27-2.86c-.25-.42.25-.4.7-1.3.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46a.88.88 0 0 0-.64.3 2.68 2.68 0 0 0-.84 2c0 1.18.86 2.32.98 2.48.12.16 1.69 2.58 4.1 3.62 1.52.66 2.12.71 2.88.6.46-.07 1.43-.58 1.63-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.27Z"/>`
  ),
  mail: svg(`<rect x="3" y="5" width="18" height="14" rx="2" ${stroke}/><path d="m3.5 6.5 8.5 6.5 8.5-6.5" ${stroke}/>`),
  instagram: svg(
    `<rect x="3.5" y="3.5" width="17" height="17" rx="5" ${stroke}/><circle cx="12" cy="12" r="4" ${stroke}/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/>`
  ),
  arrowRight: svg(`<path d="M5 12h14M13 6l6 6-6 6" ${stroke}/>`),
  arrowLeft: svg(`<path d="M19 12H5M11 6l-6 6 6 6" ${stroke}/>`),
  chevron: svg(`<path d="m6 9 6 6 6-6" ${stroke}/>`),
  play: svg(`<path fill="currentColor" d="M8 5.5v13a.8.8 0 0 0 1.2.7l10.4-6.5a.8.8 0 0 0 0-1.4L9.2 4.8A.8.8 0 0 0 8 5.5Z"/>`),
  pause: svg(`<rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor"/>`),
  volume: svg(`<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" ${stroke}/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" ${stroke}/>`),
  mute: svg(`<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" ${stroke}/><path d="m16 9.5 5 5m0-5-5 5" ${stroke}/>`),
  expand: svg(`<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" ${stroke}/>`),
  close: svg(`<path d="M6 6l12 12M18 6 6 18" ${stroke}/>`),
  menu: svg(`<path d="M4 8h16M4 16h16" ${stroke}/>`),
};
