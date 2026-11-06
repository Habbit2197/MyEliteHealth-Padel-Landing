import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Cambia `site` por el dominio final antes de publicar (sirve para las URLs de Open Graph).
export default defineConfig({
  site: 'https://ambermuscle.com',
  output: 'static',
  integrations: [sitemap()],
});
