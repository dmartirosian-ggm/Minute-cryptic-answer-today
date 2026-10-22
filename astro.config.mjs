import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Change this if the live domain is different.
export default defineConfig({
  site: 'https://minutecrypticanswertoday.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
