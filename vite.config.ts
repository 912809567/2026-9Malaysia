import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'images/hero-malaysia.webp', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'],
    manifest: {
      name: 'Malaysia 2026 · 吉隆坡 × 亚庇',
      short_name: 'Malaysia 2026',
      start_url: './',
      scope: './',
      display: 'standalone',
      background_color: '#f5f2e9',
      theme_color: '#0e6c70',
      description: '深圳—吉隆坡—亚庇 7天6晚自由行攻略',
      icons: [
        { src: './icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: './icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      cacheId: 'malaysia-trip-2026-v4',
      globPatterns: ['**/*.{js,css,html,webp,png,svg,woff2}'],
      navigateFallback: 'index.html',
      runtimeCaching: [{ urlPattern: /^https:\/\/.*\.tile\.openstreetmap\.org\//, handler: 'NetworkOnly', options: { cacheName: 'map-tiles' } }],
    },
  })],
  base: './',
})
