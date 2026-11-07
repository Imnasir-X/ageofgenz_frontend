#!/usr/bin/env node
// `npm run dev:local`: Vite dev server on http://localhost:3000 talking to a local backend.
// Local testing only (see LOCAL_RUN.md); production builds and Vercel never run this.
//
// VITE_API_URL defaults to http://localhost:8000 (the backend docker stack). It is set in the
// process environment so both the browser bundle (import.meta.env) and server-side rendering
// (process.env) use it. Extra arguments are passed to Vite, e.g. `npm run dev:local -- --host`.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const api = (process.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const env = { ...process.env, VITE_API_URL: api };

const [major] = process.versions.node.split('.').map(Number);
if (major < 20) {
  console.error(`[dev:local] Node ${process.versions.node} is too old; install Node 20 or newer.`);
  process.exit(1);
}

let viteBin;
try {
  // vite's package "exports" hide bin/, so locate it through package.json.
  viteBin = join(dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
} catch {
  console.error('[dev:local] Vite is not installed. Run `npm ci` first.');
  process.exit(1);
}

fetch(`${api}/api/core/health/`)
  .then((res) => console.log(`[dev:local] backend ${api}: ${res.ok ? 'up' : `HTTP ${res.status}`}`))
  .catch(() =>
    console.warn(
      `[dev:local] backend ${api} is not answering yet. Start it from the backend repo with ./run-local.sh backend`,
    ),
  );

const args = process.argv.slice(2);
const portIdx = args.findIndex((a) => a === '--port' || a.startsWith('--port='));
const port = portIdx === -1 ? '3000' : args[portIdx].includes('=') ? args[portIdx].split('=')[1] : args[portIdx + 1];
const viteArgs = portIdx === -1 ? ['--port', port, '--strictPort', ...args] : [...args];
// Dev-only config overlay (see scripts/vite.local.config.mjs); production uses vite.config.ts.
if (!args.some((a) => a === '--config' || a === '-c' || a.startsWith('--config='))) {
  viteArgs.unshift('--config', join(dirname(fileURLToPath(import.meta.url)), 'vite.local.config.mjs'));
}
console.log(`[dev:local] site http://localhost:${port}  studio http://localhost:${port}/studio  (API ${api})`);
const child = spawn(process.execPath, [viteBin, ...viteArgs], {
  stdio: 'inherit',
  env,
});
child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
