# STATE — current status (handoff document)

## Last updated

2026-10-27 — Tina version-pin fix session (Claude Code).

## Status summary

1. Foundation is built: Astro 7 static site, Tina schema, seed content, deploy workflow, handoff docs.
2. First deploy succeeded 2026-10-27 (Actions run #1): live at https://bromsc.github.io/spacecraft-site/. Every push to `main` redeploys; CI builds without Tina secrets.
3. Tina Cloud project exists (main indexed) and the repo secrets are set. Deploy run #3 (first
   with secrets) failed at `npx tinacms build`: Tina Cloud rejected schema version 4.1.0
   (`ERR_CLOUD_CHECK_FAILED`). Fixed by pinning `@tinacms/cli` 4.0.3 / `@tinacms/graphql` 4.0.1 and
   regenerating `tina/tina-lock.json` (now `fullVersion` 4.0.1). `/admin` goes live on the next
   green deploy.
4. Not yet live on the domain: the custom domain/DNS is not set up.

## What exists

### Routes

| Route | Source | Content |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Hero + text + facts from the exhibition singleton; grid of `featured` artists |
| `/artists` | `src/pages/artists/index.astro` | All artists, sorted by `order` then name |
| `/artists/[slug]` | `src/pages/artists/[slug].astro` | Artist detail: role, short bio, body, portrait, gallery, links |
| `/[slug]` | `src/pages/[slug].astro` | Generic page from `content/pages/<slug>.md` (currently only `/about`) |
| `/404` | `src/pages/404.astro` | Not-found page |
| `/admin` | built by `tinacms build` | Secrets set; **pending the first green deploy with the version-pin fix** |

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

- Verify the first deploy after the Tina version-pin fix is green and `/admin` loads at
  https://bromsc.github.io/spacecraft-site/admin/ (log in with the Tina Cloud account).

## Next steps

1. Confirm the deploy is green and `/admin` works (if the push landed on a PR branch, merge the
   PR first — Actions deploys only from `main`).
2. Point the domain (Caspar, browser only — see "Environment / secrets status" for steps), then
   add `https://thespacecraft.se` to the Tina Cloud project's site URLs.
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

- `/admin` 404s until the first green deploy with the Tina version-pin fix.
- **Tina packages are pinned:** `@tinacms/cli` exact `4.0.3` and `overrides` →
  `@tinacms/graphql` `4.0.1` in `package.json`, because Tina Cloud rejects schema version 4.1.0.
  Unpin (back to `^` ranges, remove the override, regenerate `tina/tina-lock.json`) once Tina
  Cloud supports graphql 4.1.0 — see DECISIONS.md. Don't let Dependabot/`npm update` bump these.
- `npm install` warns that `react-final-form` (inside `tinacms` 3.15.0) wants React ≤18; we use
  React 19. Pre-existing, harmless for the build; the warning comes from Tina, not from us.
- Images placed *inside* Markdown body text as `/uploads/...` won't render on the
  `bromsc.github.io/spacecraft-site/` preview URL (base-path prefix not applied there); they work
  on the custom domain. Frontmatter image fields work on both.
- `npm audit` reports advisories in transitive dependencies of the Tina CLI (build-time only, not
  shipped to the site).

## Environment / secrets status

| Item | Status |
| --- | --- |
| GitHub Pages source = "GitHub Actions" | ✅ done (per Caspar) |
| Tina Cloud project | ✅ created from `BromsC/spacecraft-site`, branch `main` indexed; site URL `https://bromsc.github.io` |
| Repo secret `TINA_CLIENT_ID` | ✅ set |
| Repo secret `TINA_TOKEN` | ✅ set |
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

**Tina Cloud (done except one step):** project created, secrets added. Remaining, once the
domain is live: app.tina.io → the project → its settings → Site URLs → add
`https://thespacecraft.se` → Save.

## Deploy URL

- Production (once domain is set + DNS pointed): https://thespacecraft.se
- Live now: https://bromsc.github.io/spacecraft-site/ (runs #1–#2 green with Tina step skipped;
  run #3, the first with Tina secrets, failed on the Tina Cloud version check — fixed by the pin)
- Deploy runs: https://github.com/BromsC/spacecraft-site/actions
