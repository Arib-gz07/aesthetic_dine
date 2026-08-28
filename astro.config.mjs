// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

/** Stabilize Cloudflare workerd + Vite SSR optimizer for local `astro dev`. */
function stabilizeCloudflareOptimizeDeps() {
  return {
    name: 'stabilize-cloudflare-optimize-deps',
    /** @param {string} name */
    configEnvironment(name) {
      if (name === 'client') return;
      return {
        optimizeDeps: {
          holdUntilCrawlEnd: true,
          include: [
            '@astrojs/cloudflare/entrypoints/server',
            'astro/app/manifest',
            'astro/assets/services/noop',
          ],
        },
      };
    },
  };
}

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  session: false,
  site: 'https://aesthetic-dine.workers.dev',
  vite: {
    plugins: [stabilizeCloudflareOptimizeDeps()],
  },
});
