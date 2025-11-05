import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/spotify': {
        target: 'https://api.spotify.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/spotify/, '/v1'),
        headers: {
          'Accept': 'application/json'
        }
      },
      '/api/bmm': {
        target: 'https://bmm-api.brunstad.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bmm/, ''),
        headers: {
          'Accept': 'application/json'
        }
      }
    }
  }
})
