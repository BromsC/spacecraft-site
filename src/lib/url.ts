// Prefix a site-internal path ("/artists", "/uploads/x.svg") with the configured base path.
// External URLs (https:, mailto:, //host) are returned unchanged.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function url(path: string) {
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return path;
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Current pathname without the base path, e.g. "/artists/ada-lind".
export function stripBase(pathname: string) {
  const stripped = base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return stripped.replace(/\/$/, '') || '/';
}
