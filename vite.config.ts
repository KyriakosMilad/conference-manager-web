import path from 'node:path'
import { writeFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

function githubPagesSpa() {
  return {
    name: 'github-pages-spa',
    closeBundle() {
      writeFileSync(path.resolve('dist/.nojekyll'), '')
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
