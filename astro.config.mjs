// @ts-check
import { defineConfig, envField } from 'astro/config';
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
  env: {
    schema: {
      // Runtime secret on Cloudflare — do not rely on import.meta.env alone
      // (that is build-time only and misses Worker secrets).
      GOOGLE_SHEETS_WEBAPP_URL: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      PUBLIC_MAIN_DOMAIN: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'aestheticdine.com',
      }),
    },
  },
  vite: {
    plugins: [stabilizeCloudflareOptimizeDeps()],
  },
});
