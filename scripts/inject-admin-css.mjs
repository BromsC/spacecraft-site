// Adds our editor stylesheet (tina/admin.css) to the Tina admin page, so the rich-text editor in
// /admin looks like the site. Run right after `tinacms build` (see .github/workflows/deploy.yml).
//
// Tina has no supported way to style the editor, so this edits the generated static page
// public/admin/index.html. It is fail-safe: it never throws and always exits 0; if the page or
// the expected markup is missing it prints a warning and the admin stays as Tina built it.
// Idempotent: running it again replaces the block it added before.
import fs from 'node:fs';

const page = new URL('../public/admin/index.html', import.meta.url);
const stylesheet = new URL('../tina/admin.css', import.meta.url);
const START = '<!-- spacecraft editor css -->';
const END = '<!-- /spacecraft editor css -->';
const warn = (message) => console.log(`::warning::Editor styling not added to /admin: ${message}`);

try {
  if (!fs.existsSync(page)) warn('public/admin/index.html does not exist (Tina admin not built).');
  else {
    // Same rule as astro.config.mjs / tina/config.ts: "" on the custom domain.
    const base = (process.env.BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');
    const css = fs.readFileSync(stylesheet, 'utf8').replaceAll('__BASE__', base ? `/${base}` : '');
    const block = `${START}<style>\n${css.replaceAll('</style', '<\\/style')}</style>${END}`;
    const original = fs.readFileSync(page, 'utf8');
    const html = original.split(START).length === 2 && original.includes(END)
      ? original.slice(0, original.indexOf(START)) + original.slice(original.indexOf(END) + END.length)
      : original;
    if (html.includes(START) || !html.includes('</head>')) warn('unexpected markup in public/admin/index.html.');
    else {
      // Last in <head>, after Tina's own stylesheet.
      fs.writeFileSync(page, html.replace('</head>', () => `${block}\n  </head>`));
      console.log('Editor styling added to public/admin/index.html.');
    }
  }
} catch (error) {
  warn(error instanceof Error ? error.message : String(error));
}
