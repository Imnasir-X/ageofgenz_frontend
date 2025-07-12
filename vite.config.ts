// vite.config.ts - COMPLETE FILE WITH BUNDLE SIZE FIX
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // ✅ EXISTING: Keep your server config
  server: {
    port: 3000, // Your existing port
    open: true, // Auto-open browser on dev start
  },
  
  // ✅ NEW: Build optimizations to fix Vercel warning
  build: {
    // Fix bundle size warning by increasing limit
    chunkSizeWarningLimit: 1000, // Increase from default 500KB to 1000KB
    
    // Better code splitting for optimal loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'react-helmet-async'],
          // Add other large dependencies here as needed
        },
      },
    },
    
    // Enable production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    
    // Target modern browsers for smaller bundles
    target: 'esnext',
    
    // Enable source maps for debugging (can disable for smaller builds)
    sourcemap: false,
  },
  
  // ✅ NEW: Dependency optimization for faster dev server
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'lucide-react',
      'react-helmet-async'
    ],
    // Exclude large dependencies that shouldn't be pre-bundled
    exclude: [],
  },
  
  // ✅ NEW: Define aliases if needed (optional)
  resolve: {
    alias: {
      // Add path aliases here if needed
      // '@': path.resolve(__dirname, './src'),
    },
  },
  
  // ✅ NEW: Environment variables (optional)
  define: {
    // Define global constants here if needed
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});