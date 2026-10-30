import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

// Small data helpers so pages don't repeat collection plumbing.

export type Artist = CollectionEntry<'artists'>;
export type ArtistStatus = Artist['data']['status'];

export async function getSiteSettings() {
  const entry = await getEntry('site', 'settings');
  if (!entry) throw new Error('Missing content/site/settings.json');
  return entry.data;
}

export async function getExhibition() {
  const entry = await getEntry('exhibition', 'current');
  if (!entry) throw new Error('Missing content/exhibition/current.md');
  return entry.data;
}

// All artists, sorted by `order` then name.
export async function getArtists() {
  const artists = await getCollection('artists');
  return artists.sort(
    (a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name),
  );
}

export function byStatus(artists: Artist[], status: ArtistStatus) {
  return artists.filter((a) => a.data.status === status);
}

// The artist on view now: the first `current` artist by order, if any.
export function getCurrentArtist(artists: Artist[]) {
  return byStatus(artists, 'current')[0];
}

// "<prefix> A, B, C." — every artist name in sort order.
export function presentingLine(prefix: string, artists: Artist[]) {
  return `${prefix} ${artists.map((a) => a.data.name).join(', ')}.`;
}

// "Kista" → "Kista." (leaves text that already ends in punctuation alone).
export function withPeriod(text: string) {
  return /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;
}
