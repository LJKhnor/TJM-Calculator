import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // './' = chemins relatifs → fonctionne sur GitHub Pages
  // quel que soit le nom du repo (monpseudo.github.io/mon-repo/)
  base: './',
})
