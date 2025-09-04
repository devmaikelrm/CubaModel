import { defineConfig } from 'astro/config'
import preact from '@astrojs/preact'

export default defineConfig({
  integrations: [preact()],
  output: 'static',
  site: 'https://devmaikelrm.github.io/CubaModel/',
  base: '/CubaModel/',             // IMPORTANTE para GitHub Pages
  build: { inlineStylesheets: 'auto' }
})
