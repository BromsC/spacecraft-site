import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Astro reads the same files TinaCMS edits (see tina/config.ts).
// Keep both schemas in sync. Image fields are public paths like "/uploads/x.svg".
// Entry ids come from filenames (content/artists/jane-doe.md → id "jane-doe").

// A list of links. Tina writes an empty item (`- {}`) when "add item" is clicked and the item is
// left blank; such incomplete items are dropped here instead of failing the build.
const links = z
  .array(z.object({ label: z.string().optional(), url: z.string().optional() }))
  .default([])
  .transform((items) =>
    items.flatMap(({ label, url }) =>
      label?.trim() && url?.trim() ? [{ label: label.trim(), url: url.trim() }] : [],
    ),
  );

const site = defineCollection({
  loader: glob({ pattern: 'settings.json', base: './content/site' }),
  schema: z.object({
    siteTitle: z.string(),
    tagline: z.string().optional(),
    socialLinks: links,
    footerText: z.string().optional(), // "Credits line" under the exhibition lists
  }),
});

const exhibition = defineCollection({
  loader: glob({ pattern: 'current.md', base: './content/exhibition' }),
  schema: z.object({
    title: z.string(),
    datesLine: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    venue: z.string().optional(),
    presentingPrefix: z.string().default('Presenting exhibitions of works by'),
    currentLabel: z.string().default('Currently on view'),
    logo: z.string().optional(),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/artists' }),
  schema: z.object({
    name: z.string(),
    status: z.enum(['current', 'upcoming', 'previous']),
    period: z.string().optional(),
    order: z.number().default(100),
    imageSide: z.enum(['left', 'right']).default('left'), // kept, no longer affects the layout
    mainImage: z.string().optional(),
    btsImage: z.string().optional(),
    btsCaption: z.string().optional(), // Markdown string (Tina rich-text, not isBody)
    links,
  }),
});

export const collections = { site, exhibition, artists };
