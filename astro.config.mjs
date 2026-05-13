// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.PUBLIC_SITE_URL || 'https://www.theoverwhelmedgamer.com';

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()]
  }
});