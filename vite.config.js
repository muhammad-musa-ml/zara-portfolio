import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig(({ command }) => ({
  // GitHub Pages project site subpath. Change to '/' if moved to a root domain.
  base: command === 'build' ? '/faati-portfolio/' : '/',
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        main: r('./index.html'),
        resume: r('./resume.html')
      }
    }
  }
}))
