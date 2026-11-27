// Sound check: run after `astro build` (`npm run test:sound`; in CI after the build, report only).
//
// The built site must match the "Sound" field (artists.sound) exactly:
//   - an artist page has the sound toggle + its script only if that artist has a sound;
//   - the home page has them only if the #current artist (first `current` by order) has one;
//   - no other page has them;
//   - the toggle is built `hidden`, so without JavaScript nothing is shown.
// Also lists, for each sound that is set, a missing file, a type other than mp3/m4a, or a file
// larger than 3 MB. Exit code 1 if the site doesn't match; file notes are warnings only.
import fs from 'node:fs';
import { parseFile } from '@tinacms/graphql';

const root = new URL('../', import.meta.url);
const ARTISTS = new URL('content/artists/', root);
const DIST = new URL('dist/', root);
const MAX_BYTES = 3 * 1024 * 1024;

let failed = 0;
const lines = [];
const check = (ok, label) => {
  if (!ok) failed++;
  lines.push(`${ok ? 'ok  ' : 'FAIL'} ${label}`);
};
const warn = (label) => lines.push(`warn ${label}`);

const read = (url) => (fs.existsSync(url) ? fs.readFileSync(url, 'utf8') : undefined);
const toggleIn = (html) => /data-artist-sound/.test(html);
const scriptIn = (html) => /ArtistSound[^"']*\.js/.test(html);
const toggleHidden = (html) => /<div class="sound"[^>]*\bdata-artist-sound\b[^>]*\bhidden\b/.test(html);

try {
  if (!fs.existsSync(new URL('index.html', DIST))) throw new Error('dist/ not found: run `npm run build:site` first');

  const artists = fs
    .readdirSync(ARTISTS)
    .filter((name) => name.endsWith('.md'))
    .map((file) => {
      const data = parseFile(fs.readFileSync(new URL(file, ARTISTS), 'utf8'), '.md', (yup) => yup.object({}));
      const sound = typeof data.sound === 'string' && data.sound.trim() ? data.sound.trim() : undefined;
      return { slug: file.replace(/\.md$/, ''), name: data.name, status: data.status, order: data.order ?? 100, sound };
    })
    .sort((a, b) => a.order - b.order || String(a.name).localeCompare(String(b.name)));

  // Artist pages
  for (const artist of artists) {
    const html = read(new URL(`artists/${artist.slug}/index.html`, DIST));
    if (html === undefined) {
      check(false, `/artists/${artist.slug}/ was not built`);
      continue;
    }
    if (artist.sound) {
      check(toggleIn(html) && scriptIn(html), `/artists/${artist.slug}/ has a sound (${artist.sound}): toggle and script present`);
      check(toggleHidden(html), `/artists/${artist.slug}/ toggle is hidden until the script runs (no JS → nothing shown)`);
    } else {
      check(!toggleIn(html) && !scriptIn(html), `/artists/${artist.slug}/ has no sound: no toggle, no script`);
    }
  }

  // Home page: follows the #current artist only
  const current = artists.find((a) => a.status === 'current');
  const home = read(new URL('index.html', DIST)) ?? '';
  if (current?.sound) {
    check(toggleIn(home) && scriptIn(home) && /data-scope="current"/.test(home), `/ (#current = ${current.name}) has a sound: toggle and script present, tied to #current`);
    check(toggleHidden(home), '/ toggle is hidden until the script runs (no JS → nothing shown)');
  } else {
    check(!toggleIn(home) && !scriptIn(home), `/ (#current = ${current?.name ?? 'none'}) has no sound: no toggle, no script`);
  }

  // Every other page: never
  const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const url = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
      return entry.isDirectory() ? walk(url) : entry.name.endsWith('.html') ? [url] : [];
    });
  const others = walk(DIST)
    .map((url) => url.pathname.slice(DIST.pathname.length))
    .filter((path) => path !== 'index.html' && !/^artists\/[^/]+\/index\.html$/.test(path) && !path.startsWith('admin/'));
  const leaking = others.filter((path) => toggleIn(read(new URL(path, DIST))));
  check(leaking.length === 0, `other pages (${others.join(', ')}): no toggle${leaking.length ? ` — found in ${leaking.join(', ')}` : ''}`);

  // The files themselves (warnings: the site still builds; a missing file hides the toggle)
  for (const artist of artists.filter((a) => a.sound)) {
    const file = new URL(`public/${artist.sound.replace(/^\/+/, '')}`, root);
    if (!/^\/uploads\//.test(artist.sound)) warn(`${artist.name}: sound "${artist.sound}" is not in /uploads/`);
    if (!/\.(mp3|m4a)$/i.test(artist.sound)) warn(`${artist.name}: sound "${artist.sound}" is not an mp3 or m4a file`);
    if (!fs.existsSync(file)) warn(`${artist.name}: sound file ${artist.sound} is missing (the toggle hides itself)`);
    else if (fs.statSync(file).size > MAX_BYTES)
      warn(`${artist.name}: sound file ${artist.sound} is ${(fs.statSync(file).size / 1024 / 1024).toFixed(1)} MB (keep it at about 1–3 MB)`);
  }
  if (!artists.some((a) => a.sound)) lines.push('note no artist has a sound: every page must be without toggle and script');
} catch (error) {
  check(false, `sound check could not run: ${error instanceof Error ? error.message : error}`);
}

const report = [`## Sound check`, '', '```', ...lines, '```', '', failed ? `**${failed} failed.**` : 'All passed.', ''].join('\n');
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  try {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
  } catch {
    // stdout has the report too
  }
}
process.exit(failed ? 1 : 0);
