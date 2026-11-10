// Content report: lists everything in content/artists that is outside the editor's tool set
// (paragraph, line break, h3 sub-heading, bold, italic, link, bullet list; caption: italic and
// link only), with file and line. Written to the GitHub job summary in deploy.yml and to stdout.
// It never fails the build: it always exits 0. Plain line-based checks, no dependencies.
import fs from 'node:fs';

const dir = new URL('../content/artists/', import.meta.url);

const BODY = [
  [/^\s{0,3}(#{1,2}|#{4,6})\s/, 'heading level other than the sub-heading (###)'],
  [/^\s{0,3}(=+|-+)\s*$/, 'underlined heading or horizontal rule'],
  [/^\s{0,3}(\*\s*){3,}$|^\s{0,3}(_\s*){3,}$/, 'horizontal rule'],
  [/^\s*\d+[.)]\s/, 'numbered list'],
  [/^\s{0,3}>/, 'quote'],
  [/^\s*\|.*\|\s*$/, 'table'],
  [/!\[[^\]]*\]\(/, 'image inside the text'],
  [/^\s{0,3}(```|~~~)|`[^`]+`/, 'code'],
  [/<\/?[a-zA-Z][^>]*>/, 'raw HTML'],
  [/~~[^~]+~~/, 'strikethrough'],
];
const CAPTION = [
  ...BODY,
  [/\*\*[^*]+\*\*|__[^_]+__/, 'bold in a caption'],
  [/^\s{0,3}#{1,6}\s/, 'heading in a caption'],
  [/^\s*[*+-]\s/, 'list in a caption'],
];
// Repaired when the site is built (src/lib/blank-lines.ts); listed so nobody is surprised.
const HANDLED = [
  [/^\\$/, 'lone "\\" line (a line break at the start of a paragraph)'],
  [/^&#x20;$/, 'paragraph holding only a space'],
  [/[\u2028\u2029\u000B]/, 'pasted line-separator character'],
  [/^\s*[·•]\s+/, 'pasted bullet character instead of a bullet list'],
];

const findings = [];
const handled = [];
const scan = (file, text, line, where, rules) => {
  for (const [pattern, what] of rules) if (pattern.test(text)) findings.push({ file, line, where, what, text });
  for (const [pattern, what] of HANDLED) if (pattern.test(text)) handled.push({ file, line, where, what, text });
};

try {
  for (const file of fs.readdirSync(dir).filter((name) => name.endsWith('.md')).sort()) {
    const lines = fs.readFileSync(new URL(file, dir), 'utf8').split('\n');
    const end = lines[0] === '---' ? lines.indexOf('---', 1) : -1;
    let inCaption = false;
    lines.forEach((text, index) => {
      const line = index + 1;
      if (index > end) return scan(file, text, line, 'text', BODY);
      // Frontmatter: only the caption is rich text, as `btsCaption: value` or a `|` block.
      const inline = /^btsCaption:\s*(.*)$/.exec(text);
      if (inline) {
        inCaption = /^[|>][+-]?\d*$/.test(inline[1]);
        if (!inCaption) scan(file, inline[1].replace(/^(['"])(.*)\1$/, '$2'), line, 'caption', CAPTION);
      } else if (inCaption && /^(\s+|$)/.test(text)) scan(file, text.trim(), line, 'caption', CAPTION);
      else inCaption = false;
    });
  }
} catch (error) {
  console.log(`::warning::Content report could not run: ${error instanceof Error ? error.message : error}`);
}

const cell = (text) => text.trim().slice(0, 70).replace(/[\u2028\u2029\u000B]/g, '␤').replace(/\|/g, '\\|').replace(/`/g, "'");
const table = (rows) =>
  ['| File | Line | Where | What | Text |', '| --- | --- | --- | --- | --- |']
    .concat(rows.map((r) => `| \`content/artists/${r.file}\` | ${r.line} | ${r.where} | ${r.what} | \`${cell(r.text)}\` |`))
    .join('\n');

const report = [
  '## Content report: artist texts',
  '',
  'Tool set: paragraph, line break, sub-heading, bold, italic, link, bullet list. Caption: italic and link.',
  '',
  findings.length ? `### Outside the tool set (${findings.length})\n\n${table(findings)}` : 'Nothing outside the tool set.',
  '',
  handled.length ? `### Repaired automatically when the site is built (${handled.length})\n\nNo action needed.\n\n${table(handled)}` : '',
  '',
].join('\n');

console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) {
  try {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${report}\n`);
  } catch {
    // The summary is a convenience; stdout has the report too.
  }
}
