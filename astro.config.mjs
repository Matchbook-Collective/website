import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Netlify injects build variables; loadEnv also supports the documented local .env.
const rawSite = process.env.SITE_URL ?? loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '').SITE_URL;
let site;
if (rawSite) {
  const url = new URL(rawSite);
  if (url.protocol !== 'https:' || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL must be an HTTPS origin without credentials, a path, query, or fragment.');
  }
  site = url.origin;
}
if (process.env.CONTEXT === 'production' && !site) {
  throw new Error('Set SITE_URL to the approved production HTTPS origin before a Netlify production build.');
}
export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  integrations: site
    ? [sitemap({ filter: (page) => !['/404', '/thank-you'].some((path) => new URL(page).pathname.startsWith(path)) })]
    : [],
  devToolbar: { enabled: false },
});
