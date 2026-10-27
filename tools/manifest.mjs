// Lists every file in public/ so the site knows which media exist before requesting them.
// Missing files then show designed fallbacks without any failed network requests.
import { readdir } from 'node:fs/promises';
import path from 'node:path';

export const assetManifest = async (publicDir) => {
  const out = [];
  const walk = async (dir) => {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await walk(p);
      else if (!/^(README\.md|\.gitkeep)$/.test(e.name)) out.push('/' + path.relative(publicDir, p).split(path.sep).join('/'));
    }
  };
  await walk(publicDir);
  return out.sort();
};
