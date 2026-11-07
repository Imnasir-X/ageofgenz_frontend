import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ssr from 'vite-plugin-ssr/plugin';

export default defineConfig(({ command }) => ({
  plugins: [react(), ssr({ prerender: true })],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Dev server only (`vite` / `npm run dev`). Its SSR module runner resolves react-router(-dom) v7
  // through the "node" export condition, which picks the CommonJS build whose named exports it
  // cannot read ("Named export 'useParams' not found"). Adding "module-sync" selects the ESM build.
  // `vite build` and prerender never see this block, so production output is unchanged.
  ...(command === 'serve' ? { ssr: { resolve: { externalConditions: ['node', 'module-sync'] } } } : {}),
  server: { port: 3000 },
  preview: { port: 4173 },
  build: { chunkSizeWarningLimit: 600 },
}));
