import { SITE } from '../config/site.js';
import { prefersReducedMotion, hasAsset, asset } from '../lib/util.js';
import { characterModel, CHARACTER_HEAD, CHARACTER_HEAD_R } from './character3d.js';

/**
 * Hero scene for the opening sequence.
 *
 * Layers (back → front):
 *   1. CSS light glows (teal, violet, magenta) — in the page markup
 *   2. Canvas: faint wavy vertical lines + floating light particles
 *   3. Canvas: tumbling cubes (glass, solid and wireframe) drifting through space
 *   4. Optional: your own looping hero render (SITE.heroVideo) — replaces the cubes
 *
 * No libraries. Pauses off-screen. With reduced motion it draws one still frame.
 * If SITE.splineScene is set, a Spline scene loads in place of the cubes.
 */

// Cube palette — electric blue, amber, pink glass, violet wire
// Each cube orbits the centre of the frame at its own radius, speed and height.
const CUBES = [
  { c: [62, 98, 255], style: 'solid', r: 1.2, a0: 2.6, sp: 0.16, y: 0.05, s: 0.42, rx: 0.4, ry: 0.7, vx: 0.21, vy: 0.33 },
  { c: [255, 196, 46], style: 'solid', r: 1.25, a0: 0.2, sp: 0.12, y: -0.38, s: 0.3, rx: 1.1, ry: 0.2, vx: -0.28, vy: 0.19 },
  { c: [255, 64, 120], style: 'glass', r: 1.05, a0: 0.9, sp: 0.1, y: -0.12, s: 0.5, zb: 0.55, rx: 0.6, ry: 1.3, vx: 0.14, vy: -0.22 },
  { c: [139, 124, 255], style: 'wire', r: 1.45, a0: 3.9, sp: 0.09, y: -0.55, s: 0.34, rx: 0.2, ry: 0.4, vx: 0.18, vy: 0.26 },
  { c: [77, 163, 255], style: 'glass', r: 1.6, a0: 5.2, sp: 0.14, y: 0.3, s: 0.3, rx: 0.9, ry: 0.1, vx: -0.16, vy: 0.3 },
  { c: [255, 196, 46], style: 'wire', r: 1.15, a0: 4.6, sp: 0.18, y: -0.62, s: 0.22, rx: 0.3, ry: 0.9, vx: 0.24, vy: -0.18 },
];

const VERTS = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const FACES = [
  [0, 1, 2, 3, [0, 0, -1]], [5, 4, 7, 6, [0, 0, 1]], [4, 0, 3, 7, [-1, 0, 0]],
  [1, 5, 6, 2, [1, 0, 0]], [4, 5, 1, 0, [0, -1, 0]], [3, 2, 6, 7, [0, 1, 0]],
];
const LIGHT = (() => { const v = [-0.4, -0.7, -0.6]; const l = Math.hypot(...v); return v.map((n) => n / l); })();

const rot = (p, ax, ay, az) => {
  let [x, y, z] = p;
  let c = Math.cos(ax), s = Math.sin(ax);
  [y, z] = [y * c - z * s, y * s + z * c];
  c = Math.cos(ay); s = Math.sin(ay);
  [x, z] = [x * c + z * s, -x * s + z * c];
  c = Math.cos(az); s = Math.sin(az);
  [x, y] = [x * c - y * s, x * s + y * c];
  return [x, y, z];
};

export const initHero3D = (container, { onTick } = {}) => {
  const canvas = container.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const reduced = prefersReducedMotion();
  const small = matchMedia('(max-width: 700px)').matches;
  let w = 0, h = 0, dpr = 1, raf = 0, visible = true;
  let px = 0, py = 0, tx = 0, ty = 0;
  const start = performance.now();
  let showCubes = true;
  const AVATAR_Z = 0.5;

  // Your 3D bust (from SITE.heroCharacter); falls back to the code-drawn character
  let bust = null;
  if (SITE.heroCharacter && hasAsset(SITE.heroCharacter)) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { bust = img; if (reduced) draw(start + 2600); };
    img.src = asset(SITE.heroCharacter);
  }

  // Your own hero render replaces the cube scene when present
  const vid = SITE.heroVideo || {};
  const src = small && hasAsset(vid.mobile) ? vid.mobile : hasAsset(vid.desktop) ? vid.desktop : hasAsset(vid.mobile) ? vid.mobile : '';
  if (src) {
    const v = document.createElement('video');
    Object.assign(v, { muted: true, loop: true, playsInline: true, autoplay: !reduced, preload: 'auto' });
    v.setAttribute('muted', '');
    v.setAttribute('aria-hidden', 'true');
    v.className = 'hero__video';
    v.src = asset(src);
    v.addEventListener('playing', () => { showCubes = false; container.classList.add('has-video'); }, { once: true });
    v.addEventListener('error', () => v.remove());
    container.appendChild(v);
    if (reduced) v.addEventListener('loadeddata', () => { showCubes = false; container.classList.add('has-video'); }, { once: true });
  }

  // Particles (light dust)
  const DUST = Array.from({ length: small ? 40 : 80 }, () => ({
    x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6,
    sp: 0.004 + Math.random() * 0.012, tw: Math.random() * Math.PI * 2,
    hue: Math.random() < 0.5 ? [255, 196, 120] : Math.random() < 0.5 ? [140, 220, 255] : [200, 170, 255],
  }));
  const LINES = small ? 9 : 16;

  const resize = () => {
    const r = container.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (reduced) draw(start + 2600);
  };

  const drawCube = (cube, t, intro, pos) => {
    const scale = Math.min(w, h) * (small ? 0.7 : 0.58);
    const [ox, oy, oz] = pos;
    const cx = ox + px * 0.08 * (1 + oz * 0.3);
    const cy = oy + py * 0.06 * (1 + oz * 0.3);
    const cz = oz + 3.2;
    const ax = cube.rx + t * cube.vx, ay = cube.ry + t * cube.vy, az = t * 0.07;
    const pts = VERTS.map((v) => {
      const r = rot(v.map((n) => n * cube.s * 0.5), ax, ay, az);
      const z = r[2] + cz;
      const p = 2.6 / z;
      return [w / 2 + (r[0] + cx) * scale * p, h / 2 + (r[1] + cy) * scale * p, z];
    });
    const depthFade = Math.max(0.3, Math.min(1, 1.15 - oz * 0.35));
    const a = intro * depthFade;
    const [R, G, B] = cube.c;

    ctx.save();
    if (oz > 1.1 && !reduced) ctx.filter = `blur(${Math.min(4, (oz - 1) * 3)}px)`;
    const faces = FACES.map((f) => {
      const n = rot(f[4], ax, ay, az);
      const z = (pts[f[0]][2] + pts[f[1]][2] + pts[f[2]][2] + pts[f[3]][2]) / 4;
      return { f, n, z };
    }).sort((p, q) => q.z - p.z);

    for (const { f, n } of faces) {
      const facing = n[2] < 0; // towards camera
      if (cube.style === 'solid' && !facing) continue;
      const light = Math.max(0, -(n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]));
      ctx.beginPath();
      ctx.moveTo(pts[f[0]][0], pts[f[0]][1]);
      for (let k = 1; k < 4; k++) ctx.lineTo(pts[f[k]][0], pts[f[k]][1]);
      ctx.closePath();
      if (cube.style === 'solid') {
        const l = 0.35 + light * 0.75;
        ctx.fillStyle = `rgba(${Math.round(R * l)},${Math.round(G * l)},${Math.round(B * l)},${0.92 * a})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${Math.min(255, R + 60)},${Math.min(255, G + 60)},${Math.min(255, B + 60)},${0.35 * a})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (cube.style === 'glass') {
        ctx.fillStyle = `rgba(${R},${G},${B},${(facing ? 0.16 + light * 0.18 : 0.08) * a})`;
        ctx.fill();
        ctx.shadowColor = `rgba(${R},${G},${B},${0.9 * a})`;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = `rgba(${Math.min(255, R + 40)},${Math.min(255, G + 80)},${Math.min(255, B + 80)},${0.9 * a})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = `rgba(${R},${G},${B},${(facing ? 0.85 : 0.35) * a})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // ── Naman's 3D character ──────────────────────────────────────────────
  // Real 3D: every sphere/box is rotated in model space, projected with the
  // same camera as the cubes and painted back-to-front.
  const shade = (col, k) => col.map((c) => Math.max(0, Math.min(255, Math.round(c * k)))).join(',');
  const MODEL_CENTER_Y = 0.15;

  const drawBust = (t, intro) => {
    const hgt = h * (small ? 0.38 : 0.56);
    const wid = hgt * (bust.naturalWidth / bust.naturalHeight);
    const yaw = reduced ? 0 : Math.sin(t * 0.33) * 0.32 + px * 0.18; // turning left/right
    const tilt = reduced ? 0 : Math.sin(t * 0.21) * 0.05 + py * 0.03;
    const cx = w / 2 + Math.sin(t * 0.27) * w * 0.012 + px * 18;
    const cy = h * (small ? 0.28 : 0.36) + Math.sin(t * 0.8) * h * 0.012 + py * 10 + (1 - intro) * h * 0.08;
    ctx.save();
    ctx.globalAlpha = intro;
    ctx.translate(cx, cy);
    // fake perspective turn: narrow horizontally + shear as the bust rotates
    ctx.transform(Math.cos(yaw) * 0.12 + 0.88, Math.sin(yaw) * 0.06, 0, 1, 0, 0);
    ctx.rotate(tilt);
    const s = 0.94 + intro * 0.06;
    ctx.scale(s, s);
    ctx.shadowColor = 'rgba(139,92,246,.55)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetX = Math.sin(yaw) * -14;
    ctx.drawImage(bust, -wid / 2, -hgt / 2, wid, hgt);
    ctx.shadowColor = 'transparent';
    ctx.restore();
  };

  const drawCharacter = (t, intro) => {
    if (bust) return drawBust(t, intro);
    const scale = Math.min(w, h) * (small ? 0.7 : 0.58);
    const k = small ? 0.31 : 0.33; // model units → world units
    // Tumbling float: turns to show different angles, sways and bobs
    const yaw = reduced ? -0.35 : Math.sin(t * 0.23) * 1.05 + Math.sin(t * 0.07) * 0.35 + px * 0.25;
    const pitch = reduced ? 0.12 : 0.12 + Math.sin(t * 0.31) * 0.22 + py * 0.12;
    const roll = reduced ? -0.08 : Math.sin(t * 0.19) * 0.22;
    const X = Math.sin(t * 0.35) * 0.03 + px * 0.05;
    const Y = (small ? -1.12 : -0.38) + Math.sin(t * 0.8) * 0.025 - (1 - intro) * 0.6;
    const Z = AVATAR_Z + (1 - intro) * 0.8;

    const toWorld = (m) => {
      const r = rot([m[0], m[1] - MODEL_CENTER_Y, m[2]], pitch, yaw, roll);
      return [X + r[0] * k, Y - r[1] * k, Z + r[2] * k];
    };
    const project = (wp) => {
      const z = wp[2] + 3.2, p = 2.6 / z;
      return [w / 2 + wp[0] * scale * p, h / 2 + wp[1] * scale * p, z, p];
    };

    const head = project(toWorld(CHARACTER_HEAD));
    const headR = CHARACTER_HEAD_R * k;
    const items = [];
    for (const prim of characterModel(t)) {
      const wp = toWorld(prim.p);
      const sp = project(wp);
      if (prim.face) {
        // facial features only show when they face the viewer
        if (sp[2] > head[2] - headR * 0.3) continue;
        items.push({ prim, sp, wp, depth: sp[2] - headR * 0.6 });
      } else items.push({ prim, sp, wp, depth: sp[2] });
    }
    items.sort((a, b) => b.depth - a.depth);

    ctx.save();
    ctx.globalAlpha = intro;
    for (const { prim, sp, wp } of items) {
      if (prim.box) { drawBox(prim, toWorld, project, pitch, yaw, roll, k); continue; }
      const R = prim.r * k * scale * sp[3];
      if (R < 0.4) continue;
      const [x, y] = sp;
      let fill;
      if (prim.lens) {
        fill = ctx.createRadialGradient(x - R * 0.3, y - R * 0.35, R * 0.05, x, y, R);
        fill.addColorStop(0, 'rgb(190,175,255)');
        fill.addColorStop(0.3, 'rgb(70,95,220)');
        fill.addColorStop(0.75, 'rgb(14,20,52)');
        fill.addColorStop(1, 'rgb(6,7,14)');
      } else if (prim.flat) {
        fill = `rgb(${shade(prim.col, 1)})`;
      } else {
        const hi = prim.hair ? 1.9 : prim.metal ? 1.5 : 1.32;
        const lo = prim.hair ? 0.5 : 0.42;
        fill = ctx.createRadialGradient(x - R * 0.38, y - R * 0.42, R * 0.08, x, y, R * 1.02);
        fill.addColorStop(0, `rgb(${shade(prim.col, hi)})`);
        fill.addColorStop(0.55, `rgb(${shade(prim.col, 1)})`);
        fill.addColorStop(1, `rgb(${shade(prim.col, lo)})`);
      }
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fill();
      // coloured rim light from the scene's glows (teal left, violet right)
      if (!prim.flat && !prim.face && R > 6) {
        ctx.lineWidth = Math.max(1, R * 0.08);
        ctx.strokeStyle = 'rgba(139,92,246,.28)';
        ctx.beginPath(); ctx.arc(x, y, R * 0.96, -0.9, 0.7); ctx.stroke();
        ctx.strokeStyle = 'rgba(45,212,191,.18)';
        ctx.beginPath(); ctx.arc(x, y, R * 0.96, 2.5, 3.9); ctx.stroke();
      }
    }
    ctx.restore();
  };

  const drawBox = (prim, toWorld, project, pitch, yaw, roll) => {
    const [sx, sy, sz] = prim.size;
    const pts = VERTS.map((v) => project(toWorld([prim.p[0] + v[0] * sx / 2, prim.p[1] + v[1] * sy / 2, prim.p[2] + v[2] * sz / 2])));
    const faces = FACES.map((f) => {
      const n = rot([f[4][0], f[4][1], f[4][2]], pitch, yaw, roll);
      n[1] = -n[1];
      return { f, n, z: (pts[f[0]][2] + pts[f[1]][2] + pts[f[2]][2] + pts[f[3]][2]) / 4 };
    }).sort((a, b) => b.z - a.z);
    for (const { f, n } of faces) {
      if (n[2] >= 0) continue;
      const light = Math.max(0, -(n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]));
      ctx.fillStyle = `rgb(${shade(prim.col, 0.55 + light * 0.9)})`;
      ctx.beginPath();
      ctx.moveTo(pts[f[0]][0], pts[f[0]][1]);
      for (let i = 1; i < 4; i++) ctx.lineTo(pts[f[i]][0], pts[f[i]][1]);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(120,124,140,.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  const draw = (now) => {
    const t = (now - start) / 1000;
    onTick?.(t);
    px += (tx - px) * 0.04; py += (ty - py) * 0.04;
    ctx.clearRect(0, 0, w, h);

    // 1) Wavy vertical lines
    const linesIn = Math.min(1, Math.max(0, (t - 0.1) / 1.2));
    ctx.lineWidth = 1;
    for (let i = 0; i < LINES; i++) {
      const x0 = ((i + 0.5) / LINES) * w;
      ctx.strokeStyle = `rgba(242,242,240,${0.045 * linesIn})`;
      ctx.beginPath();
      for (let y = 0; y <= h; y += 12) {
        const x = x0 + Math.sin(y * 0.045 + t * 1.6 + i) * 3 + Math.sin(y * 0.011 - t * 0.6 + i * 2) * 5;
        y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 2) Cubes (intro: fade in after the name, ~1.4s)
    if (showCubes) {
      const intro = reduced ? 1 : Math.min(1, Math.max(0, (t - 1.3) / 1.4));
      if (intro > 0) {
        const tt = t + 20;
        // Orbit around a point just above the name; z drives depth, size and blur
        const placed = CUBES.map((c) => {
          const ang = c.a0 + tt * c.sp;
          let pos = [Math.cos(ang) * c.r * (small ? 0.85 : 1.55), c.y + Math.sin(tt * 0.5 + c.a0) * 0.06 - (small ? 0.98 : 0.4), Math.sin(ang) * c.r * 0.7 + 0.5 + (c.zb || 0)];
          // Cubes passing in front of the face swing wide so they never cover it
          const clear = small ? 0.62 : 0.7;
          if (pos[2] < AVATAR_Z + 0.2 && Math.abs(pos[0]) < clear) pos = [Math.sign(pos[0] || 1) * clear, pos[1], pos[2]];
          return { c, pos };
        }).sort((p, q) => q.pos[2] - p.pos[2]);
        // Ease in from slightly further away as they appear
        // Painter's order: cubes behind the avatar, the avatar, then cubes in front
        let avatarDrawn = false;
        placed.forEach(({ c, pos }) => {
          if (!avatarDrawn && pos[2] < AVATAR_Z) { drawCharacter(t, intro); avatarDrawn = true; }
          drawCube(c, tt, intro, [pos[0], pos[1], pos[2] + (1 - intro) * 1.5]);
        });
        if (!avatarDrawn) drawCharacter(t, intro);
      }
    }

    // 3) Dust in front
    const dustIn = Math.min(1, Math.max(0, (t - 0.6) / 1.5));
    for (const d of DUST) {
      const y = ((d.y - t * d.sp) % 1 + 1) % 1;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + d.tw));
      const [R, G, B] = d.hue;
      ctx.fillStyle = `rgba(${R},${G},${B},${0.55 * tw * dustIn})`;
      ctx.beginPath();
      ctx.arc(d.x * w + px * 10, y * h + py * 8, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const loop = (now) => {
    if (visible && !document.hidden) draw(now);
    raf = requestAnimationFrame(loop);
  };
  const onPointer = (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };

  const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
  io.observe(container);
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  if (reduced) draw(start + 2600);
  else {
    window.addEventListener('pointermove', onPointer, { passive: true });
    raf = requestAnimationFrame(loop);
  }

  if (SITE.splineScene) loadSpline(container, () => (showCubes = false));

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect(); ro.disconnect();
    window.removeEventListener('pointermove', onPointer);
  };
};

const loadSpline = (container, onReady) => {
  const s = document.createElement('script');
  s.type = 'module';
  s.src = SITE.splineViewerScript;
  s.onload = () => {
    const viewer = document.createElement('spline-viewer');
    viewer.setAttribute('url', SITE.splineScene);
    viewer.className = 'hero__spline';
    viewer.addEventListener('load-complete', () => { container.classList.add('has-spline'); onReady(); });
    container.appendChild(viewer);
  };
  s.onerror = () => console.info('Spline viewer unavailable — using built-in 3D scene.');
  document.head.appendChild(s);
};
