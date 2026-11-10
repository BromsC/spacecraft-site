import type { TinaField } from 'tinacms';

// The two rich-text fields of an artist, in a file of their own so that the round-trip test
// (scripts/text-test.mjs) and the content report run Tina's serializer with exactly the field
// definitions the /admin editor uses. No runtime imports here: Node loads this file directly.

// One rule, the same in the editor (tina/admin.css) and on the site (src/styles/global.css).
export const TEXT_RULE =
  'Enter starts a new paragraph with a blank line above it. Shift+Enter starts a new line without a gap.';

type RichText = Extract<TinaField, { type: 'rich-text' }>;

export const bodyField: RichText = {
  type: 'rich-text',
  name: 'body',
  label: 'Text',
  isBody: true,
  description: `${TEXT_RULE} Sub-headings (e.g. 'About the works:') are headings in the editor.`,
  // One heading level only: h3 sits below the artist name (h1 on the artist page, h2 on the home
  // page). Tool set: paragraph, line break, sub-heading, bold, italic, link, bullet list.
  overrides: {
    toolbar: ['heading', 'bold', 'italic', 'link', 'ul'],
    headingLevels: ['h3'],
  },
};

export const captionField: RichText = {
  type: 'rich-text',
  name: 'btsCaption',
  label: 'Second image caption',
  description: `Shown under the second image, e.g. "Image features …, 2017. Photo by …". Use the italic button for italics. ${TEXT_RULE}`,
  // Not isBody: Tina stores it as a Markdown string in the frontmatter. Italic and link only.
  overrides: { toolbar: ['italic', 'link'] },
};
