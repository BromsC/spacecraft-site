import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Astro reads the same files TinaCMS edits (see tina/config.ts).
// Keep both schemas in sync. Image fields are public paths like "/uploads/x.svg".
// Entry ids come from filenames (content/artists/jane-doe.md → id "jane-doe").

const link = z.object({
  label: z.string(),
  url: z.string(),
});

const site = defineCollection({
  loader: glob({ pattern: 'settings.json', base: './content/site' }),
  schema: z.object({
    siteTitle: z.string(),
    tagline: z.string().optional(),
    socialLinks: z.array(link).default([]),
    footerText: z.string().optional(),
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
    imageSide: z.enum(['left', 'right']).default('left'),
    mainImage: z.string().optional(),
    btsImage: z.string().optional(),
    // Tina rich-text stored in frontmatter as a Markdown string (the body is the other text field).
    continuedText: z.string().optional(),
    links: z.array(link).default([]),
  }),
});

export const collections = { site, exhibition, artists };
