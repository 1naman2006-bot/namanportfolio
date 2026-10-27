# Naman Goyal — Premium Portfolio

A standalone portfolio site for **Naman Goyal — Video Editor | Motion Graphics Artist | 3D Artist | Photographer**.
It is a completely separate project from `naman-can-code.vercel.app` and does not touch that site or its deployment.

- Cinematic opening: black screen → light glows → your name → your **3D character** floating among tumbling cubes → navigation
- Four portfolio sections with their own pages and asset folders: Photoshop, After Effects, Premiere Pro, Maya
- One data file drives every gallery — add a project and it appears in the right place
- CONTACT ME (WhatsApp) and HIRE ME (email) in the navigation, hero and contact section
- Zero dependencies: plain HTML, CSS and JavaScript modules plus a small Node build script

---

## 1. Run it locally

Requires **Node.js 18 or newer** (nothing to install — there are no npm packages).

```bash
cd naman-premium-portfolio
npm run dev        # → http://localhost:5173  (edit files, refresh the browser)
npm run build      # → builds the production site into dist/
npm run preview    # → builds, then serves dist/ at http://localhost:5173
```

## 2. Folder structure

```
naman-premium-portfolio/
├── index.html                  page shell (titles/meta are filled in per page by the build)
├── package.json                scripts: dev, build, preview
├── vercel.json                 Vercel settings for a separate deployment
├── public/                     everything here is served as-is at the site root
│   ├── projects/
│   │   ├── photoshop/          ← Photoshop project files
│   │   ├── after-effects/      ← After Effects project files
│   │   ├── premiere-pro/       ← Premiere Pro project files
│   │   └── maya/               ← Maya project files
│   ├── images/
│   │   ├── profile/portrait.jpg   your About photo
│   │   ├── thumbnails/            optional shared thumbnails
│   │   └── og-image.png           link-preview image
│   └── videos/                 showreel.mp4, hero.mp4, hero-mobile.mp4
├── src/
│   ├── config/site.js          ★ contact details, showreel, hero video, Spline, drafts switch
│   ├── data/projects.js        ★ YOUR PROJECTS — the only list you edit to add work
│   ├── data/categories.js      the four categories (names, intros, URLs)
│   ├── data/content.js         ★ About, Services, Workflow and Skills text
│   ├── components/             reusable pieces (nav, cards, player, 3D hero, character…)
│   ├── pages/                  Home, Work, category and project pages
│   └── styles/main.css         all styling
└── tools/                      dev server + build script (no dependencies)
```

Each folder under `public/` has its own README with recommended sizes and formats.

## 3. Add, edit or remove a project

1. Put the files in the matching folder, e.g. `public/projects/maya/watch-render.jpg`.
2. Open `src/data/projects.js` and add an entry to `PROJECTS`:

```js
{
  id: 'luxury-watch-render',           // unique; becomes /work/maya/luxury-watch-render
  title: 'Luxury Watch Render',
  category: 'maya',                    // photoshop | after-effects | premiere-pro | maya
  description: 'Product visualisation of a steel watch with studio lighting.',
  thumbnail: '/projects/maya/watch-thumb.jpg',
  gallery: ['/projects/maya/watch-1.jpg', '/projects/maya/watch-wire.jpg'],
  video: '/projects/maya/watch-turntable.mp4',   // or a YouTube / Vimeo link
  preview: '/projects/maya/watch-loop.mp4',      // optional silent hover loop
  software: ['Maya', 'Arnold'],
  date: '2026-10',
  duration: '0:10',
  tags: ['Product visualisation'],
  objective: '…', approach: '…', output: '4K stills + turntable',
  breakdown: ['Modelling', 'Look development', 'Lighting', 'Render'],
  featured: true,                      // also show on the homepage
},
```

3. Save. With `npm run dev` running, refresh — it appears on its category page, gets its own detail page, and (if `featured`) shows on the homepage.

- **Edit** a title/description: change the text in that entry.
- **Thumbnail**: set `thumbnail` to the file path (4:5 for Photoshop, 16:10 for video/3D works best).
- **Video preview on hover**: set `preview` to a short silent MP4.
- **Before/after slider** (retouching, grading): `beforeAfter: { before: '…', after: '…' }`.
- **Remove**: delete the entry.
- **Placeholders**: the four entries marked `draft: true` are layout examples labelled "Placeholder". Delete them, or set `showDrafts: false` in `src/config/site.js` to hide them all.

If a file path is wrong or the file is missing, the site shows a designed cover instead of a broken image (and while `showDrafts` is on, it prints which file to add).

## 4. Your 3D character and the opening

The opening scene draws a real-time 3D character of you (curly hair, beard and moustache, black blazer, chain, camera) built in `src/components/character3d.js`, floating among cubes from `src/components/hero3d.js`.

**Replace it with your own Maya / After Effects render** (recommended once you have it):
1. Render a seamless 10–15 s loop with no audio — 1920×1080 for desktop and 1080×1920 for mobile, H.264, ideally under 8 MB / 5 MB.
2. Save them as `public/videos/hero.mp4` and `public/videos/hero-mobile.mp4`.

The video then plays full-screen behind your name and replaces the code-drawn scene automatically. The opening plays once per browser session; repeat visits skip straight to the finished state. Visitors with "reduce motion" switched on get a still frame.

Prefer Spline? Put your scene URL in `splineScene` in `src/config/site.js`.

## 5. Replace the showreel

- Local file: save as `public/videos/showreel.mp4` (and optionally `public/images/showreel-poster.jpg`).
- Or YouTube/Vimeo: paste the link into `showreel.embed` in `src/config/site.js`.

Until one exists, the homepage shows a "showreel is in the edit" panel with a contact button. Video never autoplays with sound.

## 6. Contact buttons

All set in `src/config/site.js`:

| Button | Opens |
|---|---|
| CONTACT ME | `https://wa.me/916399399235?text=Hi%20Naman%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20discuss%20a%20project%20with%20you.` |
| HIRE ME | `mailto:1naman2006@gmail.com?subject=Freelance%20Project%20Enquiry` |
| Instagram | `https://www.instagram.com/s_corps25/` |

WhatsApp opens with the message pre-filled and the visitor presses send; the email app opens with the recipient and subject filled in. Nothing is sent automatically. The "Describe your project" form on the contact section works the same way — it opens WhatsApp or email with the details filled in, with no backend needed.

## 7. Deploy to Vercel as a separate project

1. Push this folder to a **new** GitHub repository (e.g. `naman-premium-portfolio`) — not your existing site's repo.
2. In Vercel: **Add New → Project**, import that new repository.
3. Vercel reads `vercel.json` automatically: build command `npm run build`, output directory `dist`, no install step. Click **Deploy**.
4. After the first deploy, put the new address into `url` in `src/config/site.js` (used for SEO tags and the sitemap) and push again.

Or with the Vercel CLI from this folder: `npx vercel` (preview) and `npx vercel --prod`.

## 8. Assets still to add

- `public/videos/showreel.mp4` (+ `public/images/showreel-poster.jpg`) or a YouTube/Vimeo link
- "A Day of My Life — Let's Do It Tomorrow" (461 MB) — upload to YouTube, then uncomment its entry in `src/data/projects.js` and paste the link
- Optional: `public/videos/hero.mp4` + `hero-mobile.mp4`, your own 3D loop for the opening
- Optional: a custom `public/images/og-image.png` for link previews
- After deploying: your final domain in `src/config/site.js` → `url`

## 9. Uploading to GitHub in the browser

GitHub's drag-and-drop upload accepts files up to 25 MB and about 100 files per upload. Every video in this project is compressed below 25 MB. If GitHub refuses a large batch, upload `public/` first and everything else in a second upload.
