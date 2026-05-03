import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sp',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    allowedHosts: ['strong-dory-enabled.ngrok-free.app', 'ge-serverhub.com', 'www.ge-serverhub.com', 'localhost'],
    proxy: {
      '/sp-api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sp-api/, '/api'),
      },
    },
  }
})
