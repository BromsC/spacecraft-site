import { DEFAULT_MEDIA_UPLOAD_TYPES, defineConfig, type Template } from 'tinacms';
import { bodyField, captionField } from './rich-text';

// Slugify helper used for artist filenames.
// The filename IS the URL slug: content/artists/jane-doe.md → /artists/jane-doe
const slugify = (value?: string) =>
  (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Uploads allowed in /admin: Tina's default list (images, video, PDFs, …; no audio at all) plus
// mp3 (`audio/mpeg`; some Windows browsers say `audio/mp3`) and m4a (`audio/mp4`, `audio/x-m4a`,
// `audio/m4a`) for the artist "Sound" field. Not the field-level `accept`: its vocabulary has
// mp3 but no m4a. See DECISIONS 2026-11-27.
const UPLOAD_TYPES = [
  ...DEFAULT_MEDIA_UPLOAD_TYPES.split(','),
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
];
const SOUND_EXTENSIONS = /\.(mp3|m4a)$/i;

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
    // The documented setting. Tina 3.15 drops it when it writes the schema (its config check
    // keeps only `media.tina`), so the admin never sees it: cmsCallback below applies the same
    // list. Kept so it takes over once Tina passes it through.
    accept: UPLOAD_TYPES,
  },

  // Both upload paths in the admin (the media manager and dropping a file on a field) fall back to
  // `cms.media.accept`, which Tina hard-wires to its default list. Override it on the instance.
  cmsCallback: (cms) => {
    try {
      Object.defineProperty(cms.media, 'accept', { configurable: true, get: () => UPLOAD_TYPES.join(',') });
    } catch {
      // Tina changed its internals: uploads fall back to Tina's default list (no audio).
    }
    return cms;
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
            description: 'Not used by the current layout (images are centred).',
            options: [
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
            ],
          },
          { type: 'image', name: 'mainImage', label: 'Main image' },
          bodyField,
          {
            type: 'image',
            name: 'btsImage',
            label: 'Second image',
            description: 'Shown below the whole text, at full column width.',
          },
          captionField,
          {
            // An "image" field is Tina's only media-manager field; it stores the file's public path
            // (/uploads/x.mp3) like the image fields. Played by src/components/visual/ArtistSound.astro.
            type: 'image',
            name: 'sound',
            label: 'Sound (loops while the page is open)',
            description:
              'Optional. Keep the file small (about 1–3 MB), mp3 or m4a. It starts after the visitor\'s first click or tap (iPhones always need a tap); visitors can switch it off. Leave empty for no sound.',
            ui: {
              validate: (value?: string) =>
                value && !SOUND_EXTENSIONS.test(value) ? 'Choose an mp3 or m4a file.' : undefined,
            },
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
