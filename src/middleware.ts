import { defineMiddleware } from 'astro:middleware';

const MAIN_HOSTS = new Set(['localhost', '127.0.0.1']);

function getMainDomain(): string {
  return import.meta.env.PUBLIC_MAIN_DOMAIN || 'aestheticdine.com';
}

function isMainHost(hostname: string): boolean {
  if (MAIN_HOSTS.has(hostname)) return true;
  if (hostname.endsWith('.pages.dev')) return true;
  if (hostname === getMainDomain()) return true;
  if (hostname === `www.${getMainDomain()}`) return true;
  return false;
}

function getSubdomainSlug(hostname: string): string | null {
  if (isMainHost(hostname)) return null;

  const mainDomain = getMainDomain();
  if (hostname.endsWith(`.${mainDomain}`)) {
    const slug = hostname.slice(0, -(mainDomain.length + 1));
    if (slug && slug !== 'www') return slug;
  }

  // Local dev: slug.localhost
  if (hostname.endsWith('.localhost')) {
    return hostname.replace('.localhost', '');
  }

  return null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const slug = getSubdomainSlug(context.url.hostname);

  if (slug && !context.url.pathname.startsWith('/sites/')) {
    const path = context.url.pathname === '/' ? '' : context.url.pathname;
    return context.rewrite(new URL(`/sites/${slug}${path}`, context.url));
  }

  return next();
});
