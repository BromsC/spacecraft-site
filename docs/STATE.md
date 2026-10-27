# STATE — current status (handoff document)

## Last updated

2026-10-27 — Go-live documentation session (Claude Code). Records the Tina Cloud + custom-domain
setup Caspar completed in web UIs the same day. No code changes.

## Status summary

1. **Production is live at https://thespacecraft.se** (base path `/`, HTTPS enforced).
   https://bromsc.github.io/spacecraft-site/ redirects to the domain.
2. **`/admin` is live** on the domain: Tina Cloud login works, and saving an edit commits to
   `main` (verified: `45aee4d` "TinaCMS content update", an artist edit) and triggers a deploy.
3. Last deploy: Actions run #6 (`workflow_dispatch`) on commit `45aee4d` — green.
4. All setup items (Pages, DNS, HTTPS, Tina Cloud, secrets) are done. The site still shows
   placeholder content; replacing it via `/admin` is the next job.

## What exists

### Routes

| Route | Source | Content |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Hero + text + facts from the exhibition singleton; grid of `featured` artists |
| `/artists` | `src/pages/artists/index.astro` | All artists, sorted by `order` then name |
| `/artists/[slug]` | `src/pages/artists/[slug].astro` | Artist detail: role, short bio, body, portrait, gallery, links |
| `/[slug]` | `src/pages/[slug].astro` | Generic page from `content/pages/<slug>.md` (currently only `/about`) |
| `/404` | `src/pages/404.astro` | Not-found page |
| `/admin` | built by `tinacms build` in CI | ✅ live — https://thespacecraft.se/admin/ (Tina Cloud login) |

Shared shell: `src/layouts/Layout.astro` (nav: Home, Artists, Info → `/about`; footer text and
social links from site settings).

### Content collections (Tina ⇄ Astro, same files)

| Collection | Type | Files | Fields |
| --- | --- | --- | --- |
| `site` | singleton | `content/site/settings.json` | siteTitle, tagline, socialLinks[] {label, url}, footerText |
| `exhibition` | singleton | `content/exhibition/current.md` | title, subtitle, startDate, endDate, venue, address, openingHours, heroImage, body |
| `artists` | list | `content/artists/*.md` (filename = slug) | name, role, shortBio, portrait, gallery[] {image, caption}, links[] {label, url}, order, featured, body |
| `pages` | list | `content/pages/*.md` (filename = slug) | title, body |

Seed content: 1 exhibition, 3 placeholder artists (Ada Lind, Bo Karlsson — featured; Cleo
Nyberg), 1 About page, site settings. Placeholder SVG images in `public/uploads/`. (One artist
was test-edited via `/admin` in `45aee4d`.)

Media: Tina repo-based media, uploads go to `public/uploads/` (served at `/uploads/...`).

### Workflows

- `.github/workflows/deploy.yml` — on push to `main` and manual dispatch:
  `npm ci` → configure-pages (gets base path, now `""` → `/`) → `npx tinacms build` only if
  `TINA_CLIENT_ID` secret is set (it is) → `npx astro build` → upload `dist` → deploy to Pages.

**Operational rule — how to redeploy:** Actions → "Deploy to GitHub Pages" → **Run workflow**
(on `main`). Never use "Re-run all jobs" on an old run: that redeploys *that run's* old commit,
not the latest `main` (this happened once with run #3). See DECISIONS.md.

### Docs

- `CLAUDE.md` — standing instructions for Claude Code sessions.
- `docs/DECISIONS.md` — append-only decision log.
- `README.md` — short overview.

## In progress

- Nothing in progress. Waiting on real content and design input from Caspar.

## Next steps

1. Replace placeholder content with real exhibition/artist content via
   https://thespacecraft.se/admin/ (Caspar, browser only; each save commits to `main` and
   redeploys automatically).
2. Design pass: typography, colour tokens in `src/styles/global.css`, hero treatment.
3. Unpin `@tinacms/cli` / remove the `@tinacms/graphql` override, regenerate
   `tina/tina-lock.json`, verify CI's "Build Tina admin" step passes. (Tina Cloud now appears to
   accept graphql 4.1.0 — see Known issues. Do it in its own session, on a green `main`.)
4. Later: first light visual as a client-only island in `src/components/visual/`.

## Open questions for Caspar

- Real exhibition details: dates, venue name, address, opening hours.
- Site language: English only, Swedish only, or both? (Currently English; dates formatted en-GB.)
- Which social links should appear in the footer?
- Separate Info / Visit pages, or is one About page enough for now?
- Any brand assets (logo, fonts, colours) to use in the design pass?

## Known issues

- **`www` certificate:** right after setup, https://www.thespacecraft.se showed
  `ERR_CERT_COMMON_NAME_INVALID` — GitHub's certificate for the alternate (`www`) name was still
  provisioning. Expected to resolve on its own. If it persists: GitHub → repo Settings → Pages →
  Custom domain → **Remove**, then re-enter `thespacecraft.se` → Save, wait for the DNS check, and
  tick "Enforce HTTPS" again.
- **Tina packages are pinned (likely no longer needed):** `@tinacms/cli` exact `4.0.3` and
  `overrides` → `@tinacms/graphql` `4.0.1` in `package.json` (commit `dd23289`), because Tina
  Cloud rejected schema version 4.1.0. Update: a re-run of run #3 (commit `efe3777`, whose
  lockfile has `@tinacms/graphql` 4.1.0) passed the Tina Cloud check at ~19:58 UTC on 2026-10-27,
  so Tina Cloud now appears to accept 4.1.0. Unpinning is next step 3 — not done yet. Until then
  don't let Dependabot/`npm update` bump these.
- `npm install` warns that `react-final-form` (inside `tinacms` 3.15.0) wants React ≤18; we use
  React 19. Pre-existing, harmless for the build; the warning comes from Tina, not from us.
- Images placed *inside* Markdown body text as `/uploads/...` are not base-path-prefixed. Now
  that the site is served at `/` on the domain this is harmless; it would only matter if the
  site were ever served from a sub-path again.
- `npm audit` reports advisories in transitive dependencies of the Tina CLI (build-time only, not
  shipped to the site).

## Environment / secrets status

| Item | Status |
| --- | --- |
| GitHub Pages source = "GitHub Actions" | ✅ done |
| Custom domain in Settings → Pages | ✅ `thespacecraft.se` set, DNS check successful |
| Enforce HTTPS | ✅ ticked |
| GoDaddy DNS → GitHub Pages | ✅ pointed (records below) |
| Tina Cloud project | ✅ "spacecraft-site" in Caspar's org; GitHub app installed on `BromsC/spacecraft-site` only; branch `main` indexed |
| Tina Cloud site URLs | ✅ `https://bromsc.github.io`, `https://thespacecraft.se` |
| Tina Cloud git authoring | ✅ "act as self" — commits from `/admin` are authored by BromsC |
| Tina Cloud plan | ✅ Free (2 users) |
| Repo secret `TINA_CLIENT_ID` | ✅ set |
| Repo secret `TINA_TOKEN` | ✅ set (the auto-generated Content read-only token, branches `*`) |

**GoDaddy DNS for thespacecraft.se** (GoDaddy nameservers):

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `bromsc.github.io` |

Deleted during setup: GoDaddy's default "Parked" A record on `@` and the old `www` →
`thespacecraft.se` CNAME. No forwarding rules. Left untouched: the `_dmarc` TXT record and the
`_domainconnect` CNAME.

## Deploy URL

- Production: https://thespacecraft.se (admin: https://thespacecraft.se/admin/)
- Old preview URL https://bromsc.github.io/spacecraft-site/ → redirects to the domain.
- Last deploy: run #6 (`workflow_dispatch`) on `45aee4d`.
- Deploy runs: https://github.com/BromsC/spacecraft-site/actions
