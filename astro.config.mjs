// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { blankLines } from './src/lib/blank-lines.ts';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://thespacecraft.se',
  // '/' in production (custom domain). CI sets BASE_PATH from actions/configure-pages, which is
  // "/spacecraft-site" only while the custom domain isn't configured on GitHub Pages yet, so the
  // github.io preview URL still works. Always build links with url() from src/lib/url.ts.
  base: process.env.BASE_PATH || '/',
  output: 'static',
  trailingSlash: 'ignore',
  markdown: {
    // Sätteri is Astro's default Markdown processor; this only adds one step to it: empty lines
    // from the editor (lone `\` lines) → one blank line each. See src/lib/blank-lines.ts.
    processor: satteri({ mdastPlugins: [blankLines] }),
  },
});
