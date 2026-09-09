import path from 'node:path'
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

function githubPagesSpa() {
  return {
    name: 'github-pages-spa',
    closeBundle() {
      const index = path.resolve('dist/index.html')
      if (!existsSync(index)) return
      copyFileSync(index, path.resolve('dist/404.html'))
      writeFileSync(path.resolve('dist/.nojekyll'), '')
    },
  }
}

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/conference-manager-web/' : '/',
  plugins: [react(), tailwindcss(), githubPagesSpa()],
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
