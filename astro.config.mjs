// @ts-check
import { defineConfig } from 'astro/config';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://thespacecraft.se',
  // '/' in production (custom domain). CI sets BASE_PATH from actions/configure-pages, which is
  // "/spacecraft-site" only while the custom domain isn't configured on GitHub Pages yet, so the
  // github.io preview URL still works. Always build links with url() from src/lib/url.ts.
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'ignore',
});
