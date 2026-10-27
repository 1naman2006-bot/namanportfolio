/**
 * Naman's 3D character for the opening scene.
 *
 * A real 3D model (not a flat drawing): built from shaded spheres and boxes in
 * model space, rotated in 3D every frame and depth-sorted together with the
 * cubes by hero3d.js. Clay / toy-figure style, chibi proportions:
 *   - big curly black hair, short faded sides
 *   - thick brows, brown eyes, full moustache, short beard along the jaw
 *   - black blazer over a black shirt, silver chain
 *   - camera held in both hands, legs floating in space
 *
 * Model space: y up, the face looks toward -z (the viewer).
 */

const SKIN = [190, 132, 92];
const SKIN_DARK = [150, 98, 66];
const HAIR = [26, 19, 16];
const BEARD = [30, 22, 18];
const BLAZER = [30, 31, 38];
const SHIRT = [12, 12, 15];
const TROUSER = [28, 29, 36];
const SHOE = [20, 20, 24];

const HEAD = [0, 1.15, 0];
const HR = 0.62; // head radius

// deterministic random so the hair is the same on every load
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const onHead = (az, el, d = HR) => {
  // az: around the vertical axis (0 = facing viewer), el: up/down from the centre
  const ce = Math.cos(el);
  return [HEAD[0] + Math.sin(az) * ce * d, HEAD[1] + Math.sin(el) * d, HEAD[2] - Math.cos(az) * ce * d];
};

const chain = (a, b, n, r0, r1, col, extra = {}) =>
  Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    return { p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t], r: r0 + (r1 - r0) * t, col, ...extra };
  });

const buildStatic = () => {
  const S = [];
  const r = rng(11);

  // Head + ears + neck
  S.push({ p: HEAD, r: HR, col: SKIN, head: true });
  S.push({ p: [-HR * 0.98, 1.08, 0.04], r: 0.13, col: SKIN_DARK });
  S.push({ p: [HR * 0.98, 1.08, 0.04], r: 0.13, col: SKIN_DARK });
  S.push({ p: [0, 0.5, 0.02], r: 0.22, col: SKIN_DARK });

  // Curly hair: dense coils over the crown and back, a fringe over the forehead
  const N = 140, golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(1 - y * y), th = golden * i;
    const v = [Math.cos(th) * rad, y, Math.sin(th) * rad]; // unit direction
    const front = v[2] < -0.35, low = v[1] < 0.18;
    if (low && (front || v[1] < -0.25)) continue; // keep the face and jaw clear
    if (Math.abs(v[0]) > 0.82 && v[1] < 0.35) continue; // faded sides: no big curls over the ears
    const top = Math.max(0, v[1]);
    const d = HR * (1.0 + 0.16 * top + r() * 0.06) + (v[1] > 0.5 ? 0.05 : 0);
    S.push({ p: [HEAD[0] + v[0] * d, HEAD[1] + 0.06 + v[1] * d * 1.02, HEAD[2] + v[2] * d], r: 0.13 + r() * 0.07, col: HAIR, hair: true });
  }
  // fringe curls falling onto the forehead
  for (let i = 0; i < 7; i++) {
    const az = -0.55 + (i / 6) * 1.1;
    S.push({ p: onHead(az, 0.62 + (i % 2) * 0.06, HR * 1.04), r: 0.12 + r() * 0.03, col: HAIR, hair: true });
  }
  // short fade on the sides
  for (const side of [-1, 1]) {
    for (let k = 0; k < 6; k++) S.push({ p: onHead(side * (1.1 + k * 0.06), 0.15 + k * 0.08, HR * 1.0), r: 0.07, col: [20, 15, 13], face: true });
  }

  // Beard: short, following the jaw line and chin, clear of the mouth
  for (let az = -1.62; az <= 1.62; az += 0.13) {
    for (let el = -1.02; el <= -0.38; el += 0.11) {
      if (Math.abs(az) < 0.36 && el > -0.64) continue; // lips + space under the moustache
      if (Math.abs(az) > 1.25 && el > -0.6) continue; // sideburns taper into the fade
      if (Math.abs(az) > 0.55 && Math.abs(az) < 1.25 && el > -0.5) continue; // cheeks stay clear
      S.push({ p: onHead(az, el, HR * 0.955), r: 0.062, col: BEARD, face: true });
    }
  }
  // sideburns joining the hair
  for (const side of [-1, 1]) S.push(...chain(onHead(side * 1.36, 0.12, HR * 0.95), onHead(side * 1.3, -0.55, HR * 0.94), 9, 0.08, 0.07, BEARD, { face: true }));

  // Moustache (full, slightly drooping at the corners)
  for (let i = 0; i < 9; i++) {
    const t = i / 8, az = -0.48 + t * 0.96;
    const el = -0.3 - Math.abs(az) * 0.22;
    S.push({ p: onHead(az, el, HR * 1.01), r: 0.055, col: [16, 11, 9], face: true });
  }
  // Lips
  S.push({ p: onHead(0, -0.46, HR * 1.0), r: 0.065, col: [150, 80, 66], face: true });

  // Nose
  S.push({ p: onHead(0, -0.06, HR * 1.04), r: 0.085, col: SKIN, face: true });
  S.push({ p: onHead(0, -0.18, HR * 1.06), r: 0.075, col: [176, 118, 82], face: true });

  // Eyes: white, iris, highlight
  for (const side of [-1, 1]) {
    const az = side * 0.36;
    S.push({ p: onHead(az, 0.06, HR * 0.97), r: 0.09, col: [240, 232, 224], face: true, flat: true });
    S.push({ p: onHead(az, 0.06, HR * 1.06), r: 0.052, col: [64, 36, 22], face: true, flat: true });
    S.push({ p: onHead(az, 0.06, HR * 1.1), r: 0.026, col: [8, 5, 4], face: true, flat: true });
    S.push({ p: onHead(az + side * -0.03, 0.1, HR * 1.12), r: 0.012, col: [255, 255, 255], face: true, flat: true });
    // eyelid line
    S.push(...chain(onHead(az - 0.13, 0.12, HR * 1.02), onHead(az + 0.13, 0.12, HR * 1.02), 4, 0.022, 0.022, [26, 17, 13], { face: true, flat: true }));
    // thick brows
    S.push(...chain(onHead(side * 0.16, 0.27, HR * 1.02), onHead(side * 0.52, 0.29, HR * 0.99), 7, 0.042, 0.034, [16, 11, 9], { face: true }));
  }

  // Torso: black blazer
  S.push({ p: [0, 0.02, 0.02], r: 0.44, col: BLAZER, body: true });
  S.push({ p: [0, -0.32, 0.02], r: 0.42, col: BLAZER, body: true });
  for (const sx of [-1, 1]) {
    S.push({ p: [sx * 0.24, 0.12, 0.02], r: 0.33, col: BLAZER, body: true });
    S.push({ p: [sx * 0.4, 0.26, 0.02], r: 0.22, col: BLAZER, body: true });
    S.push({ p: [sx * 0.22, -0.34, 0.02], r: 0.32, col: BLAZER, body: true });
    // lapels
    S.push(...chain([sx * 0.1, 0.32, -0.36], [sx * 0.02, -0.05, -0.42], 4, 0.07, 0.05, [44, 45, 54]));
  }
  // black shirt opening + skin V + chain
  S.push({ p: [0, 0.18, -0.36], r: 0.11, col: SHIRT });
  S.push({ p: [0, 0.33, -0.3], r: 0.075, col: SKIN_DARK });
  for (let i = 0; i < 7; i++) {
    const a = -0.9 + (i / 6) * 1.8;
    S.push({ p: [Math.sin(a) * 0.12, 0.3 - Math.cos(a) * 0.08 + 0.04, -0.33 - Math.cos(a) * 0.04], r: 0.02, col: [214, 216, 222], metal: true });
  }

  // Arms holding the camera
  for (const sx of [-1, 1]) {
    S.push(...chain([sx * 0.44, 0.22, 0], [sx * 0.5, -0.12, -0.2], 7, 0.13, 0.12, BLAZER));
    S.push(...chain([sx * 0.5, -0.12, -0.2], [sx * 0.24, 0.0, -0.5], 7, 0.12, 0.1, BLAZER));
    S.push({ p: [sx * 0.24, 0.0, -0.56], r: 0.1, col: SKIN });
  }

  // Camera (box) + lens
  S.push({ box: true, p: [0, 0.02, -0.6], size: [0.5, 0.3, 0.2], col: [40, 42, 50] });
  S.push({ box: true, p: [-0.12, 0.2, -0.6], size: [0.16, 0.08, 0.14], col: [34, 36, 42] });
  S.push({ p: [0, 0.02, -0.73], r: 0.12, col: [70, 90, 220], lens: true });
  S.push({ p: [0.17, 0.11, -0.71], r: 0.022, col: [239, 68, 68], flat: true });

  return S;
};

const STATIC = buildStatic();

/** Model primitives for time t (legs float and kick slowly). */
export const characterModel = (t) => {
  const kick = Math.sin(t * 0.9) * 0.12;
  const legs = [];
  // left leg: long, drifting
  legs.push(...chain([-0.17, -0.62, 0.02], [-0.2, -1.0, -0.12 + kick * 0.5], 8, 0.16, 0.145, TROUSER));
  legs.push(...chain([-0.2, -1.0, -0.12 + kick * 0.5], [-0.22, -1.38, 0.04 + kick], 8, 0.145, 0.13, TROUSER));
  legs.push({ p: [-0.22, -1.48, -0.04 + kick], r: 0.15, col: SHOE });
  legs.push({ p: [-0.22, -1.56, -0.02 + kick], r: 0.06, col: [232, 230, 226] });
  // right leg: bent at the knee
  legs.push(...chain([0.17, -0.62, 0.02], [0.3, -0.92, -0.32 - kick], 8, 0.16, 0.145, TROUSER));
  legs.push(...chain([0.3, -0.92, -0.32 - kick], [0.34, -1.2, 0.12 - kick], 8, 0.145, 0.13, TROUSER));
  legs.push({ p: [0.35, -1.28, 0.06 - kick], r: 0.15, col: SHOE });
  legs.push({ p: [0.36, -1.36, 0.08 - kick], r: 0.06, col: [232, 230, 226] });
  return STATIC.concat(legs);
};

export const CHARACTER_HEAD = HEAD;
export const CHARACTER_HEAD_R = HR;
