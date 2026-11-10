import type { MdastPluginDefinition } from 'satteri';

// Markdown steps (Sätteri mdast plugins) shared by the artist text (astro.config.mjs) and the
// second-image caption (src/lib/content.ts). They are the safety net under one rule:
//
//   Enter       = new paragraph = one blank line on the site (CSS margin, global.css `.prose`)
//   Shift+Enter = line break (`\` at the end of a line in the file), no gap
//
// The site renders what is saved: a break at the start of a paragraph, or several in a row, show
// as that many lines (plain `<br>`s, nothing to do here). What this step repairs:
//   - a whitespace-only paragraph (`&#x20;`, which a browser would draw 0 px tall) and a lone `\`
//     between blank lines (which Markdown reads as a literal backslash) become a paragraph of one
//     empty line: `<p><br></p>`;
//   - a `\` at the very end of a paragraph (literal in Markdown) is dropped, so a backslash can
//     never reach the page;
//   - paste leftovers U+2028 / U+2029 (line / paragraph separator, e.g. from Word or a PDF): at
//     the end of a line they are dropped, inside text they become a line break.
// Content files are never changed by this; it only runs at build time.

interface Inline {
  type: string;
  value?: string;
  children?: Inline[];
}

const SEPARATORS = /[\u2028\u2029]/;
const brk = (): Inline => ({ type: 'break' });

// Split text at U+2028/U+2029. `atEnd`: nothing but a line end follows this text node.
function splitSeparators(value: string, atEnd: boolean): Inline[] {
  const out: Inline[] = [];
  const parts = value.split(SEPARATORS);
  parts.forEach((part, i) => {
    const isLast = i === parts.length - 1;
    // Spaces around a separator would otherwise start or end a line.
    let text = part;
    if (i > 0) text = text.replace(/^[ \t]+/, '');
    if (!isLast) text = text.replace(/[ \t]+$/, '');
    if (i > 0) {
      const before = out[out.length - 1];
      const endsLine = /^\n/.test(text) || (isLast && text === '' && atEnd);
      const startsLine = !before || before.type === 'break' || /\n$/.test(before.value ?? '');
      // At the end (or start) of a line the separator is noise; inside text it is a line break.
      if (!endsLine && !startsLine) out.push(brk());
    }
    if (text) out.push({ type: 'text', value: text });
  });
  return out;
}

// Returns the cleaned children, or undefined if nothing had to change.
function clean(children: readonly Inline[]): Inline[] | undefined {
  let changed = false;
  const out: Inline[] = [];
  children.forEach((child, i) => {
    if (child.type === 'text' && SEPARATORS.test(child.value ?? '')) {
      const next = children[i + 1];
      out.push(...splitSeparators(child.value ?? '', !next || next.type === 'break'));
      changed = true;
    } else out.push(child);
  });
  // A `\` at the very end of the text: a line break with nothing after it.
  const last = out[out.length - 1];
  if (last?.type === 'text' && /\\$/.test(last.value ?? '')) {
    const value = (last.value ?? '').replace(/[ \t]*\\$/, '');
    if (value) out[out.length - 1] = { type: 'text', value };
    else out[out.length - 1] = brk();
    changed = true;
  }
  return changed ? out : undefined;
}

const isEmpty = (node: Inline) => node.type === 'break' || (node.type === 'text' && /^\s*$/.test(node.value ?? ''));

export const blankLines: MdastPluginDefinition = {
  name: 'blank-lines',
  paragraph(node, ctx) {
    const cleaned = clean(node.children);
    const children = cleaned ?? (node.children as readonly Inline[]);
    if (children.every(isEmpty)) {
      // Nothing visible: one empty line per saved line, at least one.
      const lines = Math.max(1, children.filter((child) => child.type === 'break').length);
      ctx.replaceNode(node, { type: 'paragraph', children: Array.from({ length: lines }, () => ({ type: 'break' })) });
    } else if (cleaned) {
      ctx.replaceNode(node, { ...node, children: cleaned } as typeof node);
    }
  },
  heading(node, ctx) {
    const cleaned = clean(node.children);
    if (cleaned) ctx.replaceNode(node, { ...node, children: cleaned } as typeof node);
  },
};

// Caption only: block constructs typed by hand or pasted (headings, lists, quotes, code) come out
// as plain paragraphs, so a caption is never more than paragraphs with inline formatting.
interface Block extends Inline {
  children?: Block[];
}

function flatten(node: Block): Block[] {
  switch (node.type) {
    case 'heading':
      return [{ type: 'paragraph', children: node.children ?? [] }];
    case 'code':
      return [{ type: 'paragraph', children: [{ type: 'text', value: node.value ?? '' }] }];
    case 'thematicBreak':
      return [];
    case 'list':
    case 'listItem':
    case 'blockquote':
      return (node.children ?? []).flatMap(flatten);
    default:
      return [node];
  }
}

export const inlineOnly: MdastPluginDefinition = {
  name: 'inline-only',
  before(node, ctx) {
    const children = (node.children as Block[]).flatMap(flatten);
    if (children.length !== node.children.length || children.some((child, i) => child !== node.children[i])) {
      ctx.replaceNode(node, { type: 'root', children } as typeof node);
    }
  },
};

// Options for the caption renderer (src/lib/content.ts; also used by scripts/text-test.mjs).
// Smart punctuation is off: a caption is shown with the characters as typed.
export const captionOptions = {
  syntaxHighlight: false,
  mdastPlugins: [inlineOnly, blankLines],
  features: { smartPunctuation: false },
} as const;
