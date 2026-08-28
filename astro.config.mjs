// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    // Avoid auto-provisioning KV/Images bindings that break Workers Builds deploy tokens
    imageService: 'passthrough',
  }),
  session: false,
  site: 'https://aesthetic-dine.workers.dev',
});
