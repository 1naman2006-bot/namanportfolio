/**
 * Designed cover art for each category, drawn from that tool's own interface
 * vocabulary. Used on Work cards and as the fallback whenever a project image is
 * missing. These are design elements, not portfolio work.
 */

const V = '#8B7CFF'; // violet signal
const B = '#4DA3FF'; // electric blue
const L = 'rgba(242,242,240,.16)'; // hairline
const L2 = 'rgba(242,242,240,.32)';

const rand = (seed) => {
  let s = 0;
  for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
};

const photoshop = (r) => {
  // Offset layer stack + marquee selection
  let out = '';
  for (let i = 0; i < 5; i++) {
    const x = 70 + i * 26 + r() * 10, y = 90 + i * 34 + r() * 8;
    out += `<rect x="${x}" y="${y}" width="210" height="250" rx="2" fill="${i === 4 ? 'rgba(139,124,255,.14)' : 'rgba(242,242,240,.025)'}" stroke="${i === 4 ? V : L}" />`;
  }
  out += `<rect x="150" y="190" width="140" height="160" fill="none" stroke="${L2}" stroke-dasharray="6 5"/>`;
  out += `<circle cx="${220 + r() * 40}" cy="${260 + r() * 30}" r="46" fill="url(#g-ps)" opacity=".85"/>`;
  return `<defs><radialGradient id="g-ps"><stop offset="0" stop-color="${B}" stop-opacity=".9"/><stop offset="1" stop-color="${V}" stop-opacity="0"/></radialGradient></defs>${out}`;
};

const afterEffects = (r) => {
  // Graph editor: grid, eased curve, keyframes
  let grid = '';
  for (let x = 40; x <= 360; x += 40) grid += `<line x1="${x}" y1="80" x2="${x}" y2="420" stroke="${L}" stroke-width=".6"/>`;
  for (let y = 80; y <= 420; y += 40) grid += `<line x1="40" y1="${y}" x2="360" y2="${y}" stroke="${L}" stroke-width=".6"/>`;
  const a = 360 - r() * 40, b = 140 + r() * 40;
  const curve = `M40 ${a} C 150 ${a}, 170 ${b}, 360 ${b}`;
  const keys = [[40, a], [360, b]]
    .map(([x, y]) => `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" transform="rotate(45 ${x} ${y})" fill="#07080B" stroke="${V}" stroke-width="1.6"/>`)
    .join('');
  return `${grid}<path d="M40 ${a} L150 ${a} M360 ${b} L170 ${b}" stroke="${L2}" stroke-width="1"/>
    <circle cx="150" cy="${a}" r="4" fill="${L2}"/><circle cx="170" cy="${b}" r="4" fill="${L2}"/>
    <path d="${curve}" fill="none" stroke="${V}" stroke-width="2.4"/>${keys}`;
};

const premiere = (r) => {
  // Edit timeline: tracks, clips, playhead
  let out = '';
  const tracks = [130, 175, 220, 290, 335];
  tracks.forEach((y, t) => {
    out += `<line x1="30" y1="${y + 34}" x2="370" y2="${y + 34}" stroke="${L}" stroke-width=".6"/>`;
    let x = 30 + r() * 30;
    while (x < 350) {
      const w = 30 + r() * 90;
      const audio = t >= 3;
      out += `<rect x="${x}" y="${y}" width="${Math.min(w, 370 - x)}" height="30" rx="3" fill="${audio ? 'rgba(77,163,255,.14)' : 'rgba(139,124,255,.16)'}" stroke="${audio ? 'rgba(77,163,255,.5)' : 'rgba(139,124,255,.55)'}"/>`;
      if (audio) {
        for (let k = x + 4; k < x + Math.min(w, 370 - x) - 4; k += 4) {
          const h = 3 + r() * 10;
          out += `<line x1="${k}" y1="${y + 15 - h}" x2="${k}" y2="${y + 15 + h}" stroke="rgba(77,163,255,.55)" stroke-width="1"/>`;
        }
      }
      x += w + 6 + r() * 14;
    }
  });
  const ph = 150 + r() * 120;
  out += `<line x1="${ph}" y1="96" x2="${ph}" y2="390" stroke="#F2F2F0" stroke-width="1.4"/><path d="M${ph - 8} 92h16l-8 10z" fill="#F2F2F0"/>`;
  return out;
};

const maya = (r) => {
  // Wireframe sphere over a perspective grid
  const cx = 200, cy = 220, R = 120;
  let out = '';
  for (let i = -3; i <= 3; i++) {
    const y = cy + (i / 4) * R, rx = Math.sqrt(1 - (i / 4) ** 2) * R;
    out += `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${rx * 0.18}" fill="none" stroke="${L2}" stroke-width=".8"/>`;
  }
  const tilt = r() * 20;
  for (let i = 0; i < 6; i++) {
    const rx = Math.abs(Math.cos(((i * 30 + tilt) * Math.PI) / 180)) * R;
    out += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${R}" fill="none" stroke="${i === 2 ? V : L2}" stroke-width="${i === 2 ? 1.6 : 0.8}"/>`;
  }
  for (let i = 0; i <= 8; i++) {
    const x = 40 + i * 40;
    out += `<line x1="${x}" y1="420" x2="${200 + (x - 200) * 0.35}" y2="370" stroke="${L}" stroke-width=".6"/>`;
  }
  [370, 385, 400, 420].forEach((y) => (out += `<line x1="20" y1="${y}" x2="380" y2="${y}" stroke="${L}" stroke-width=".6"/>`));
  out += `<ellipse cx="${cx}" cy="370" rx="90" ry="10" fill="rgba(139,124,255,.18)"/>`;
  return out;
};

const DRAW = { photoshop, 'after-effects': afterEffects, 'premiere-pro': premiere, maya };

export const cover = (category, seed = category) => {
  const draw = DRAW[category] || photoshop;
  return `<svg class="cover-art" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <rect width="400" height="500" fill="#12141A"/>${draw(rand(seed))}</svg>`;
};
