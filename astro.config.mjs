// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
// Set site for canonical URLs, sitemap, and Open Graph. Change for production.
export default defineConfig({
  site: 'https://directoriomorado.com',
  integrations: [tailwind(), react(), sitemap()],
});
