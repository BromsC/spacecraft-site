// Text test: the /admin editor and the site must agree. Run with `npm run test:text`.
//
// Part 1, round trip: every tool of the editor's tool set goes Markdown → Tina tree → Markdown →
//   Tina tree through Tina's own serializer (@tinacms/mdx) with the real field definitions
//   (tina/rich-text.ts). The Markdown and the tree must come back unchanged, otherwise the first
//   save in /admin would reshuffle a text.
// Part 2, known behaviour of Tina that the rule is built around (documented, asserted).
// Part 3, files: content/artists/*.md through Tina's file reader/writer, byte for byte.
//   Only the files in MUST_ROUND_TRIP fail the test; the rest are reported.
// Part 4, site: the same fixtures rendered by the site's Markdown step (src/lib/blank-lines.ts),
//   for the artist text and for the caption.
import fs from 'node:fs';
import { parseMDX, serializeMDX } from '@tinacms/mdx';
import { parseFile, stringifyFile } from '@tinacms/graphql';
import { createSatteriMarkdownProcessor } from '@astrojs/markdown-satteri';
import { bodyField, captionField } from '../tina/rich-text.ts';
import { blankLines, captionOptions } from '../src/lib/blank-lines.ts';

const MUST_ROUND_TRIP = ['sabrina-gschwandtner.md', 'boom-glass-group.md'];
const ARTISTS = new URL('../content/artists/', import.meta.url);

let failed = 0;
const check = (ok, label, detail = '') => {
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${!ok && detail ? `\n       ${detail}` : ''}`);
};
const show = (value) => JSON.stringify(value);
const keep = (value) => value;
const parse = (md, field) => parseMDX(md, field, keep);
const stringify = (tree, field) => serializeMDX(tree, field, keep);

// --- 1. Round trip of the tool set -------------------------------------------------------------
const TOOLS = {
  'paragraphs (Enter)': 'One.\n\nTwo.\n',
  'line break mid-paragraph (Shift+Enter)': 'One \\\ntwo.\n',
  'two line breaks in a row': 'One \\\n\\\ntwo.\n',
  'paragraph that starts with a break': 'One.\n\n\\\nTwo.\n',
  'sub-heading (h3)': '### Heading\n\nText.\n',
  bold: 'A **bold** word.\n',
  italic: 'An *italic* word.\n',
  'bold + italic': 'A ***bold italic*** word.\n',
  link: 'A [link](https://example.com/) here.\n',
  'bullet list': 'Before.\n\n* one\n* two\n\nAfter.\n',
  'italic sub-heading': '### *italic heading*\n',
  'bold italic sub-heading': '### ***bold italic***\n',
  'whitespace-only paragraph (&#x20;)': 'One.\n\n&#x20;\n\nTwo.\n',
};
const CAPTION_TOOLS = {
  'caption: italic': 'Name, *Title*, 2026.\n',
  'caption: link': 'Photo by [Someone](https://example.com/).\n',
  'caption: two paragraphs': 'One.\n\nTwo.\n',
  'caption: line break': 'One \\\ntwo.\n',
};

console.log('\n1. Round trip through Tina (parse → stringify → parse)');
for (const [fixtures, field] of [[TOOLS, bodyField], [CAPTION_TOOLS, captionField]]) {
  for (const [name, md] of Object.entries(fixtures)) {
    const tree = parse(md, field);
    const out = stringify(tree, field);
    const again = parse(out, field);
    check(out === md && show(tree) === show(again), name, `${show(md)} → ${show(out)}`);
  }
}

// --- 2. What Tina does with the shapes the rule is built around ----------------------------------
console.log('\n2. Known Tina behaviour');
const p = (...children) => ({ type: 'p', children });
const t = (text) => ({ type: 'text', text });
const br = () => ({ type: 'break', children: [t('')] });
const saved = (...blocks) => stringify({ type: 'root', children: blocks }, bodyField);
check(saved(p(t('One.')), p(t('')), p(t('Two.'))) === 'One.\n\nTwo.\n', 'an empty paragraph (Enter twice) is not saved');
check(saved(p(t('One.'), br()), p(t('Two.'))) === 'One.\n\nTwo.\n', 'a line break at the end of a paragraph is not saved');
check(saved(p(br())) === '', 'a paragraph holding only a line break is not saved');
check(saved(p(br(), t('Two.'))) === '\\\nTwo.\n', 'a line break at the start of a paragraph is saved as a lone "\\" line');
check(saved(p(t(' '))) === '&#x20;\n', 'a paragraph holding one space is saved as &#x20;');
check(show(parse('One.\n\n\n\nTwo.\n', bodyField)) === show(parse('One.\n\nTwo.\n', bodyField)), 'extra empty lines in a file are one paragraph boundary');
check(stringify(parse('One.\u2028\n\nTwo\u2028three.\n', bodyField), bodyField) === 'One.\u2028\n\nTwo\u2028three.\n', 'U+2028 is kept as typed (cleaned at render time only)');
check(stringify(parse('One.\u000BTwo.\n', bodyField), bodyField) === 'One.\u000BTwo.\n', 'U+000B is kept as typed (cleaned at render time only)');
check(stringify(parse('One.\n\n\\\n\nTwo.\n', bodyField), bodyField) === 'One.\n\n\\\\\n\nTwo.\n', 'hand-written lone "\\" between empty lines is a literal backslash to Tina (the site shows an empty line)');

// --- 3. Content files, byte for byte -------------------------------------------------------------
console.log('\n3. Content files through Tina (read → write)');
export function roundTripFile(source) {
  const data = parseFile(source, '.md', (yup) => yup.object({}));
  const out = { ...data, $_body: stringify(parse(data.$_body, bodyField), bodyField) };
  if (typeof data.btsCaption === 'string') out.btsCaption = stringify(parse(data.btsCaption, captionField), captionField);
  return stringifyFile(out, '.md', false);
}
for (const file of fs.readdirSync(ARTISTS).filter((name) => name.endsWith('.md')).sort()) {
  const source = fs.readFileSync(new URL(file, ARTISTS), 'utf8');
  const same = roundTripFile(source) === source;
  if (MUST_ROUND_TRIP.includes(file)) check(same, `${file} is unchanged by a save`);
  else console.log(`${same ? 'ok  ' : 'note'} ${file} ${same ? 'is unchanged by a save' : 'will be re-formatted by its next save in /admin (not an error)'}`);
}

// --- 4. The site renders the same fixtures ------------------------------------------------------
console.log('\n4. Site rendering (Sätteri + src/lib/blank-lines.ts)');
const body = await createSatteriMarkdownProcessor({ syntaxHighlight: false, mdastPlugins: [blankLines] });
const caption = await createSatteriMarkdownProcessor(captionOptions);
const html = async (renderer, md) => (await renderer.render(md)).code.replace(/\n/g, '').replace(/ id="[^"]*"/g, '');
const RENDER = [
  ['paragraphs', TOOLS['paragraphs (Enter)'], '<p>One.</p><p>Two.</p>'],
  ['line break', TOOLS['line break mid-paragraph (Shift+Enter)'], '<p>One <br>two.</p>'],
  ['two line breaks in a row', TOOLS['two line breaks in a row'], '<p>One <br><br>two.</p>'],
  ['break at the start of a paragraph', TOOLS['paragraph that starts with a break'], '<p>One.</p><p><br>Two.</p>'],
  ['sub-heading', TOOLS['sub-heading (h3)'], '<h3>Heading</h3><p>Text.</p>'],
  ['bold', TOOLS.bold, '<p>A <strong>bold</strong> word.</p>'],
  ['italic', TOOLS.italic, '<p>An <em>italic</em> word.</p>'],
  ['bold + italic', TOOLS['bold + italic'], '<p>A <em><strong>bold italic</strong></em> word.</p>'],
  ['link', TOOLS.link, '<p>A <a href="https://example.com/">link</a> here.</p>'],
  ['bullet list', TOOLS['bullet list'], '<p>Before.</p><ul><li>one</li><li>two</li></ul><p>After.</p>'],
  ['italic sub-heading', TOOLS['italic sub-heading'], '<h3><em>italic heading</em></h3>'],
  ['bold italic sub-heading', TOOLS['bold italic sub-heading'], '<h3><em><strong>bold italic</strong></em></h3>'],
  ['whitespace-only paragraph = one empty line', TOOLS['whitespace-only paragraph (&#x20;)'], '<p>One.</p><p><br></p><p>Two.</p>'],
  ['extra empty lines in the file = one boundary', 'One.\n\n\n\nTwo.\n', '<p>One.</p><p>Two.</p>'],
  ['lone "\\" between empty lines = one empty line, no backslash', 'One.\n\n\\\n\nTwo.\n', '<p>One.</p><p><br></p><p>Two.</p>'],
  ['two lone "\\" lines = two empty lines', 'One.\n\n\\\n\\\n\nTwo.\n', '<p>One.</p><p><br><br></p><p>Two.</p>'],
  ['"\\" at the end of a paragraph is dropped', 'One. \\\n\nTwo.\n', '<p>One.</p><p>Two.</p>'],
  ['U+2028 at the end of a line is dropped', 'One. \u2028\n\nTwo.\u2029\n', '<p>One.</p><p>Two.</p>'],
  ['U+2028 inside text is a line break', 'One\u2028two.\n', '<p>One<br>two.</p>'],
  ['U+000B (Word soft return, as pasted) inside text is a line break', 'One.\u000BTwo.\n', '<p>One.<br>Two.</p>'],
  ['U+2028 before a hard break is dropped', 'One.\u2028\\\ntwo.\n', '<p>One.<br>two.</p>'],
];
for (const [name, md, expected] of RENDER) {
  const out = await html(body, md);
  check(out === expected, `text: ${name}`, `${show(md)} → ${out}`);
}
const CAPTION_RENDER = [
  ['italic', CAPTION_TOOLS['caption: italic'], '<p>Name, <em>Title</em>, 2026.</p>'],
  ['link', CAPTION_TOOLS['caption: link'], '<p>Photo by <a href="https://example.com/">Someone</a>.</p>'],
  ['two paragraphs', CAPTION_TOOLS['caption: two paragraphs'], '<p>One.</p><p>Two.</p>'],
  ['line break', CAPTION_TOOLS['caption: line break'], '<p>One <br>two.</p>'],
  ['quotes stay as typed', '"Hands at Work Video," 2017.\n', '<p>"Hands at Work Video," 2017.</p>'],
  ['whitespace-only paragraph', 'One.\n\n&#x20;\n\nTwo.\n', '<p>One.</p><p><br></p><p>Two.</p>'],
  ['U+2028 inside text', 'One\u2028two.\n', '<p>One<br>two.</p>'],
  ['heading and list typed by hand stay paragraphs', '### One\n\n* two\n* three\n\n> four\n', '<p>One</p><p>two</p><p>three</p><p>four</p>'],
];
for (const [name, md, expected] of CAPTION_RENDER) {
  const out = await html(caption, md);
  check(out === expected, `caption: ${name}`, `${show(md)} → ${out}`);
}

console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed.');
process.exit(failed ? 1 : 0);
