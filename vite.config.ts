import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { emotionChatDevPlugin } from './src/server/emotionChatPlugin';

export default defineConfig({
  plugins: [
    react(),
    emotionChatDevPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // We have explicit custom registration in index.html & sw.js
      manifest: {
        name: 'EmoSense AI — Chetana Companion',
        short_name: 'EmoSense',
        description: 'Works offline. Your calming tools are always ready.',
        theme_color: '#060911',
        background_color: '#060911',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024
      }
    })
  ],
  server: {
    port: 5174,
    host: true
  }
});

