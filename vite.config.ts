import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import ssr from 'vite-plugin-ssr/plugin';

export default defineConfig({
  plugins: [react(), ssr({ prerender: true })],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 3000 },
  preview: { port: 4173 },
  build: { chunkSizeWarningLimit: 600 },
});
