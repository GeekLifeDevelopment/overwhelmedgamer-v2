// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import os from 'node:os';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.PUBLIC_SITE_URL || 'https://www.theoverwhelmedgamer.com';

// Keep Vite's pre-bundle cache on local disk so Google Drive doesn't slow it down
const localCacheDir = path.join(os.tmpdir(), 'vite-overwhelmedgamer');

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    cacheDir: localCacheDir,
  }
});