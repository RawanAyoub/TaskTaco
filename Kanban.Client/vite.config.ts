import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve("./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        secure: false
      },
      // Proxy static uploads so <img src="/uploads/..."> works in dev
      '/uploads': {
        target: 'http://localhost:5090',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
