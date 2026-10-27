import { defineConfig, type Template } from 'tinacms';

// Slugify helper used for filenames of list collections (artists, pages).
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
          { type: 'string', name: 'footerText', label: 'Footer text', ui: { component: 'textarea' } },
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
          { type: 'string', name: 'subtitle', label: 'Subtitle' },
          { type: 'datetime', name: 'startDate', label: 'Start date' },
          { type: 'datetime', name: 'endDate', label: 'End date' },
          { type: 'string', name: 'venue', label: 'Venue' },
          { type: 'string', name: 'address', label: 'Address' },
          { type: 'string', name: 'openingHours', label: 'Opening hours', ui: { component: 'textarea' } },
          { type: 'image', name: 'heroImage', label: 'Hero image' },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
      {
        name: 'artists',
        label: 'Artists',
        path: 'content/artists',
        format: 'md',
        ui: {
          filename: {
            // Filename = URL slug. Generated from the name, editable on create.
            slugify: (values) => slugify(values?.name),
          },
        },
        fields: [
          { type: 'string', name: 'name', label: 'Name', isTitle: true, required: true },
          { type: 'string', name: 'role', label: 'Role / discipline' },
          { type: 'string', name: 'shortBio', label: 'Short bio', ui: { component: 'textarea' } },
          { type: 'image', name: 'portrait', label: 'Portrait' },
          {
            type: 'object',
            name: 'gallery',
            label: 'Gallery',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.caption || item?.image }) },
            fields: [
              { type: 'image', name: 'image', label: 'Image', required: true },
              { type: 'string', name: 'caption', label: 'Caption' },
            ],
          },
          {
            type: 'object',
            name: 'links',
            label: 'Links',
            list: true,
            ui: { itemProps: (item) => ({ label: item?.label }) },
            fields: linkFields,
          },
          {
            type: 'number',
            name: 'order',
            label: 'Sort order',
            description: 'Lower numbers are listed first.',
          },
          {
            type: 'boolean',
            name: 'featured',
            label: 'Featured on home page',
          },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
      {
        name: 'pages',
        label: 'Pages',
        path: 'content/pages',
        format: 'md',
        ui: {
          filename: {
            // Filename = URL slug: content/pages/about.md → /about
            slugify: (values) => slugify(values?.title),
          },
        },
        fields: [
          { type: 'string', name: 'title', label: 'Title', isTitle: true, required: true },
          { type: 'rich-text', name: 'body', label: 'Body', isBody: true },
        ],
      },
    ],
  },
});
