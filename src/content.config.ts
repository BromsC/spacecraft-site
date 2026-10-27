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
    subtitle: z.string().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    venue: z.string().optional(),
    address: z.string().optional(),
    openingHours: z.string().optional(),
    heroImage: z.string().optional(),
  }),
});

const artists = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/artists' }),
  schema: z.object({
    name: z.string(),
    role: z.string().optional(),
    shortBio: z.string().optional(),
    portrait: z.string().optional(),
    gallery: z
      .array(z.object({ image: z.string(), caption: z.string().optional() }))
      .default([]),
    links: z.array(link).default([]),
    order: z.number().default(100),
    featured: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/pages' }),
  schema: z.object({
    title: z.string(),
  }),
});

export const collections = { site, exhibition, artists, pages };
