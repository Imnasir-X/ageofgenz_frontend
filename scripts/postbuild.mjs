// Post-build steps for Vercel's static output (dist/client):
//  - publish the prerendered /404/ page as 404.html so unknown URLs return a real 404 status;
//  - fail the build if prerender didn't produce the core pages.
import fs from 'node:fs';
import path from 'node:path';

const out = path.resolve('dist/client');
const must = ['index.html', '404/index.html', '__shell/index.html', 'trending/index.html', 'tech/index.html', 'opinion/index.html', 'about/index.html'];
const missing = must.filter((f) => !fs.existsSync(path.join(out, f)));
if (missing.length) {
  console.error(`[postbuild] prerender is missing: ${missing.join(', ')}`);
  process.exit(1);
}
fs.copyFileSync(path.join(out, '404/index.html'), path.join(out, '404.html'));
const pages = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'assets') walk(full);
    else if (entry.name === 'index.html') pages.push(full);
  }
};
walk(out);
console.log(`[postbuild] ${pages.length} prerendered pages; 404.html written.`);
