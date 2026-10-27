# STATE — current status (handoff document)

## Last updated

2026-10-27 — initial foundation session (Claude Code).

## Status summary

1. Foundation is built: Astro 7 static site, Tina schema, seed content, deploy workflow, handoff docs.
2. Deploys run on every push to `main` via GitHub Actions → GitHub Pages; CI builds without Tina secrets.
3. Not yet live on the domain: Tina Cloud is not configured and the custom domain/DNS is not set up.

## What exists

### Routes

| Route | Source | Content |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Hero + text + facts from the exhibition singleton; grid of `featured` artists |
| `/artists` | `src/pages/artists/index.astro` | All artists, sorted by `order` then name |
| `/artists/[slug]` | `src/pages/artists/[slug].astro` | Artist detail: role, short bio, body, portrait, gallery, links |
| `/[slug]` | `src/pages/[slug].astro` | Generic page from `content/pages/<slug>.md` (currently only `/about`) |
| `/404` | `src/pages/404.astro` | Not-found page |
| `/admin` | built by `tinacms build` | **Only exists once Tina secrets are set** |

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
Nyberg), 1 About page, site settings. Placeholder SVG images in `public/uploads/`.

Media: Tina repo-based media, uploads go to `public/uploads/` (served at `/uploads/...`).

### Workflows

- `.github/workflows/deploy.yml` — on push to `main` and manual dispatch:
  `npm ci` → configure-pages (gets base path) → `npx tinacms build` **only if
  `TINA_CLIENT_ID` secret is set** → `npx astro build` → upload `dist` → deploy to Pages.

### Docs

- `CLAUDE.md` — standing instructions for Claude Code sessions.
- `docs/DECISIONS.md` — append-only decision log.
- `README.md` — short overview.

## In progress

Nothing.

## Next steps

1. Point the domain (Caspar, browser only — see "Environment / secrets status" for steps).
2. Set up Tina Cloud and add the two repo secrets → `/admin` goes live on the next deploy.
3. Replace placeholder content with real exhibition/artist content (via `/admin` once live).
4. Design pass: typography, colour tokens in `src/styles/global.css`, hero treatment.
5. Later: first light visual as a client-only island in `src/components/visual/`.

## Open questions for Caspar

- Real exhibition details: dates, venue name, address, opening hours.
- Site language: English only, Swedish only, or both? (Currently English; dates formatted en-GB.)
- Which social links should appear in the footer?
- Separate Info / Visit pages, or is one About page enough for now?
- Any brand assets (logo, fonts, colours) to use in the design pass?

## Known issues

- `/admin` 404s until Tina Cloud secrets are added (expected).
- Images placed *inside* Markdown body text as `/uploads/...` won't render on the
  `bromsc.github.io/spacecraft-site/` preview URL (base-path prefix not applied there); they work
  on the custom domain. Frontmatter image fields work on both.
- `npm audit` reports advisories in transitive dependencies of the Tina CLI (build-time only, not
  shipped to the site).

## Environment / secrets status

| Item | Status |
| --- | --- |
| GitHub Pages source = "GitHub Actions" | ✅ done (per Caspar) |
| Repo secret `TINA_CLIENT_ID` | ❌ not set — Tina Cloud project not created yet |
| Repo secret `TINA_TOKEN` | ❌ not set |
| Custom domain in Settings → Pages | ❌ not set (required — GitHub ignores `public/CNAME` for Actions deploys) |
| GoDaddy DNS → GitHub Pages | ❌ not pointed |

**To point the domain (browser only):**
1. GitHub → repo Settings → Pages → Custom domain: `thespacecraft.se` → Save.
2. GoDaddy DNS for thespacecraft.se: four `A` records on `@` → `185.199.108.153`,
   `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `CNAME` on `www` → `bromsc.github.io`.
   Remove any GoDaddy "parked"/forwarding records on `@`.
3. Once GitHub shows the DNS check as successful, tick "Enforce HTTPS".
4. Re-run the deploy workflow (Actions → Deploy to GitHub Pages → Run workflow) so the site is
   rebuilt for the root path.

**To connect Tina Cloud (browser only):**
1. app.tina.io → sign in with GitHub → create project from `BromsC/spacecraft-site`, branch `main`.
2. Copy the Client ID and create a read-only content token.
3. GitHub → Settings → Secrets and variables → Actions → add `TINA_CLIENT_ID` and `TINA_TOKEN`.
4. Add `https://thespacecraft.se` (and the github.io URL if still used) to the project's site URLs.
5. Re-run the deploy workflow; `/admin` will be built.

## Deploy URL

- Production (once domain is set + DNS pointed): https://thespacecraft.se
- Until then: https://bromsc.github.io/spacecraft-site/
- Deploy runs: https://github.com/BromsC/spacecraft-site/actions
