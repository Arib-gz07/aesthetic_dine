// @ts-check
import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  session: false,
  site: 'https://aesthetic-dine.vercel.app',
  env: {
    schema: {
      PUBLIC_MAIN_DOMAIN: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
        default: 'aestheticdine.com',
      }),
    },
  },
});
