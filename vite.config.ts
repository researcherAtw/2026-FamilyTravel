
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['src/globeicon.svg'],
      manifest: {
        name: '2026-FamilyTravel',
        short_name: '2026-FamilyTravel',
        description: 'A Japanese Zen minimalist style personal travel planning application.',
        theme_color: '#F7F4EB',
        background_color: '#F7F4EB',
        display: 'standalone',
        scope: './',
        start_url: './',
        orientation: 'portrait',
        icons: [
          {
            src: 'src/globeicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ],
  // Use relative base path so assets load correctly on GitHub Pages regardless of repo name
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});