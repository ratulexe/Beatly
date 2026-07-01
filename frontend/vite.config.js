import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_ASSET_BASE || (process.env.VERCEL ? '/' : './'),
  cacheDir: 'node_modules/.vite_new', // Bypass the locked .vite folder
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Beatly',
        short_name: 'Beatly',
        description: 'Understand Your Music Like Never Before.',
        theme_color: '#121212',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache only versioned static assets. Do not precache HTML; Vercel should serve
        // the latest app shell so account switches and hotfixes do not show stale UI.
        // Exclude all API routes and dynamically fetched data.
        globPatterns: ['**/*.{js,css,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        navigateFallback: null,
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: []
      }
    })
  ],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true
      }
    }
  }
})
