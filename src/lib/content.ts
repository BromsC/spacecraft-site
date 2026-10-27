import { getCollection, getEntry } from 'astro:content';

// Small data helpers so pages don't repeat collection plumbing.

export async function getSiteSettings() {
  const entry = await getEntry('site', 'settings');
  if (!entry) throw new Error('Missing content/site/settings.json');
  return entry.data;
}

export async function getExhibition() {
  const entry = await getEntry('exhibition', 'current');
  if (!entry) throw new Error('Missing content/exhibition/current.md');
  return entry;
}

export async function getArtists() {
  const artists = await getCollection('artists');
  return artists.sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Stockholm',
});

export function formatDateRange(start?: Date, end?: Date) {
  if (start && end) return `${dateFormat.format(start)} – ${dateFormat.format(end)}`;
  if (start) return `From ${dateFormat.format(start)}`;
  if (end) return `Until ${dateFormat.format(end)}`;
  return '';
}
