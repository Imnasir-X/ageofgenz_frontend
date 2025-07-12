// vite.config.ts - MINIMAL FIX
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 1000, // Just increase the limit
  },
});