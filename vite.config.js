import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import graphqlLoader from 'vite-plugin-graphql-loader'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VueDevTools(), graphqlLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/graphql': {
        target: 'https://api.github.com',
        changeOrigin: true
      }
    }
  }
})
