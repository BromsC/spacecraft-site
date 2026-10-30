import { defineConfig, type Template } from 'tinacms';

// Slugify helper used for artist filenames.
// The filename IS the URL slug: content/artists/jane-doe.md → /artists/jane-doe
const slugify = (value?: string) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const linkFields: Template['fields'] = [
  { type: 'string', name: 'label', label: 'Label', required: true },
  { type: 'string', name: 'url', label: 'URL', required: true },
];

export default defineConfig({
  branch: 'main',
  clientId: process.env.TINA_CLIENT_ID ?? null,
  token: process.env.TINA_TOKEN ?? null,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
    // Matches Astro's base (see astro.config.mjs); empty on the custom domain.
    basePath: (process.env.BASE_PATH ?? '').replace(/^\/+|\/+$/g, ''),
  },

  media: {
    tina: {
      publicFolder: 'public',
      mediaRoot: 'uploads',
    },
  },

  // Keep in sync with src/content.config.ts (Astro reads the same files).
  schema: {
    collections: [
      {
        name: 'site',
        label: 'Site settings',
        path: 'content/site',
        format: 'json',
        match: { include: 'settings' },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'siteTitle', label: 'Site title', required: true },
          { type: 'string', name: 'tagline', label: 'Tagline' },
          {
            type: 'object',
            name: 'socialLinks',
            label: 'Social links',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label }) },
            fields: linkFields,
          },
          {
            type: 'string',
            name: 'footerText',
            label: 'Credits line',
            description:
              'Shown centred at the bottom of the exhibition lists, e.g. "The festival is curated by The Space Craft and organized in collaboration with Centrum for AMP. Supported by Region Stockholm."',
            ui: { component: 'textarea' },
          },
        ],
      },
      {
        name: 'exhibition',
        label: 'Exhibition',
        path: 'content/exhibition',
        format: 'md',
        match: { include: 'current' },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          {
            type: 'string',
            name: 'datesLine',
            label: 'Dates line',
            description:
              'Shown as written on the landing page and in the header, e.g. "30 October – 11 December 2026".',
          },
          { type: 'datetime', name: 'startDate', label: 'Start date' },
          { type: 'datetime', name: 'endDate', label: 'End date' },
          { type: 'string', name: 'venue', label: 'Venue' },
          {
            type: 'string',
            name: 'presentingPrefix',
            label: '"Presenting" line prefix',
            description:
              'Followed by all artist names in sort order. Default: "Presenting exhibitions of works by".',
          },
          {
            type: 'string',
            name: 'currentLabel',
            label: 'Label above the arrow',
            description: 'Default: "Currently on view".',
          },
          {
            type: 'image',
            name: 'logo',
            label: 'Logo',
            description:
              'Shown full-screen over the home page for a moment on every load. Leave empty to skip.',
          },
        ],
      },
      {
        name: 'artists',
        label: 'Artists',
        path: 'content/artists',
        format: 'md',
        defaultItem: () => ({ status: 'upcoming', imageSide: 'left' }),
        ui: {
          filename: {
            // Filename = URL slug. Generated from the name, editable on create.
            slugify: (values) => slugify(values?.name),
          },
        },
        fields: [
          { type: 'string', name: 'name', label: 'Name', isTitle: true, required: true },
          {
            type: 'string',
            name: 'status',
            label: 'Status',
            required: true,
            description: 'Current = the artist on view now (shown on the home page).',
            options: [
              { value: 'current', label: 'Current' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'previous', label: 'Previous' },
            ],
          },
          {
            type: 'string',
            name: 'period',
            label: 'Period',
            description: 'Shown as written, e.g. "30 October – 6 November".',
          },
          {
            type: 'number',
            name: 'order',
            label: 'Sort order',
            description: 'Lower numbers are listed first.',
          },
          {
            type: 'string',
            name: 'imageSide',
            label: 'Main image side',
            options: [
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
            ],
          },
          { type: 'image', name: 'mainImage', label: 'Main image' },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Text',
            isBody: true,
            description: "Sub-headings (e.g. 'About the works:') are headings in the editor.",
            // One heading level only: h3 sits below the artist name (h1 on the artist page, h2 on
            // the home page). All headings in the text are styled the same anyway.
            overrides: {
              toolbar: ['heading', 'bold', 'italic', 'link'],
              headingLevels: ['h3'],
            },
          },
          {
            type: 'image',
            name: 'btsImage',
            label: 'Second image',
            description:
              'Shown on the opposite side of the main image, directly below it. Text flows around both.',
          },
          {
            type: 'object',
            name: 'links',
            label: 'Links',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label }) },
            fields: linkFields,
          },
        ],
      },
    ],
  },
});
