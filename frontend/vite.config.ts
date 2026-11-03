import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Запросы фронтенда к /api перенаправляются на бэкенд Ktor в dev-режиме.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
