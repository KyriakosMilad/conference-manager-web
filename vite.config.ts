import path from 'node:path'
import { copyFileSync, writeFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

function githubPagesSpa() {
  return {
    name: 'github-pages-spa',
    closeBundle() {
      const dist = path.resolve('dist')
      writeFileSync(path.join(dist, '.nojekyll'), '')
      // GitHub Pages has no server rewrite: unknown paths like /login need 404.html.
      copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'))
    },
  }
}

export default defineConfig({
  base: '/',
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
