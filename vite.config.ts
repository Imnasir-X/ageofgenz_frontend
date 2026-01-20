// vite.config.ts - MINIMAL FIX
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import ssr from 'vite-plugin-ssr/plugin'

export default defineConfig({
  plugins: [react(), ssr({ prerender: true })],
  ssr: {
    noExternal: ['react-helmet-async'],
  },
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 1000, // Just increase the limit
  },
});
