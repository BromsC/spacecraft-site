import type { MdastPluginDefinition } from 'satteri';

// Markdown step (astro.config.mjs → satteri `mdastPlugins`): empty lines from the Tina editor
// become one blank line each on the site.
//
// An editor makes a gap by leaving an empty line. Tina writes that as a line holding only `\`.
// Followed directly by text, Markdown reads it as a hard break at the start of the next paragraph;
// between blank lines it stays a literal "\" paragraph. An empty paragraph can also come out as
// `&#x20;`, a one-space paragraph the browser draws 0 px tall. Every such empty line becomes its
// own `<p class="blank-line"><br></p>`: one line of body text tall (the `<br>` sets the height, so
// no CSS is needed for it) and never a visible backslash. Rule: each `\` on its own line is one
// blank line; a `\` at the end of a text line is a line break, and hard breaks inside a paragraph
// (`text \` + next line, as in work credits) are left alone. Where blank lines are hidden in the
// artist block (next to an image, start/end of the text): global.css, "#current / artist page".

interface Inline {
  type: string;
  value?: string;
}

const blankLine = () => ({
  type: 'paragraph' as const,
  data: { hProperties: { className: ['blank-line'] } },
  children: [{ type: 'break' as const }],
});

// A hard break, whitespace, or a lone literal backslash.
const isBlank = (node: Inline) =>
  node.type === 'break' || (node.type === 'text' && /^[\s\\]*$/.test(node.value ?? ''));

// Number of `\` lines in a run of blank nodes: each break and each literal backslash.
const countLines = (run: readonly Inline[]) =>
  run.reduce((sum, node) => sum + (node.type === 'break' ? 1 : (node.value?.match(/\\/g)?.length ?? 0)), 0);

const repeat = (n: number) => Array.from({ length: n }, blankLine);

export const blankLines: MdastPluginDefinition = {
  name: 'blank-lines',
  paragraph(node, ctx) {
    const children = node.children;
    let start = 0;
    while (start < children.length && isBlank(children[start])) start++;
    // Only empty lines (or only whitespace, e.g. `&#x20;`): at least one blank line.
    if (start === children.length) {
      ctx.replaceNode(node, repeat(Math.max(1, countLines(children))));
      return;
    }

    let end = children.length;
    while (end > start && isBlank(children[end - 1])) end--;
    const rest = children.slice(start, end);
    // A `\` at the very end of the text is a line break with nothing after it: drop it.
    const last = rest[rest.length - 1];
    const trailingBackslash = last.type === 'text' && /[ \t]*\\$/.test(last.value);
    const before = countLines(children.slice(0, start));
    // The first trailing break only ends the last text line.
    const after = Math.max(0, countLines(children.slice(end)) - 1);
    if (!before && !after && !trailingBackslash) return;

    if (trailingBackslash) rest[rest.length - 1] = { type: 'text', value: last.value.replace(/[ \t]*\\$/, '') };
    ctx.replaceNode(node, [...repeat(before), { type: 'paragraph', children: rest }, ...repeat(after)]);
  },
};
