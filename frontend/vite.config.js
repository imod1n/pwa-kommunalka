import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:8000'
  const apiUrlPattern = new RegExp('^' + apiUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/api/(?!budget/)')

  return {
  base: '/',
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon-16.png', 'favicon-32.png', 'icon-48.png', 'icon-72.png', 'icon-96.png', 'icon-120.png', 'icon-152.png', 'icon-167.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Доска М',
        short_name: 'Доска М',
        description: 'Учёт платежей на содержание',
        start_url: '/',
        display: 'standalone',
        background_color: '#111111',
        theme_color: '#111111',
        orientation: 'portrait',
        lang: 'ru',
        icons: [
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-48.png',
            sizes: '48x48',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-167.png',
            sizes: '167x167',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icon-120.png',
            sizes: '120x120',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'favicon-32.png',
            sizes: '32x32',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'favicon-16.png',
            sizes: '16x16',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: apiUrlPattern,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24  // 24 часа
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
  }
})
