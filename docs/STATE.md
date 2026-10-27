# STATE — current status (handoff document)

## Last updated

2026-10-27 — Design pass session (Claude Code): implemented the Figma mockup (file
`Otd6V0py66ddmBsxEBj3xE` "Space Craft") — one long scrolling home page, sticky header, new
exhibition/artist schema, real seed content. Pushed on branch
`claude/spacecraft-figma-design-q886gh` with a PR to `main` (this environment can only push the
feature branch). **Not live until that PR is merged.**

## Status summary

1. Production https://thespacecraft.se still shows the *old* placeholder site until the design
   PR is merged; merging deploys automatically.
2. Design pass is code-complete: `npm run build:site` and `npx astro check` pass with 0 errors,
   0 warnings, 0 hints. Checked in headless Chromium at 1512×982 and 390×844 against the Figma
   frames (with test images, not committed).
3. Content is the real festival line-up (6 artists), but **no images yet** — logo, artist images
   and the second ("behind the scenes") images must be uploaded in `/admin` (see "What Caspar must
   do").
4. `/admin` keeps working; the Tina schema changed, so the **first deploy after merging must be
   checked** (see Known issues → tina-lock).

## What exists

### Routes

| Route | Source | Content |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | One long page: `#intro` (logo, only if set) → `#landing` (title, dates + venue, "Presenting…" line, "Currently on view" + down arrow) → `#current` (current artist) → `#continued` (only if the current artist has "Text, continued" or a second image) → `#exhibitions` (Previous / Upcoming lists) |
| `/artists` | `src/pages/artists/index.astro` | "Currently on view:", "Previous exhibitions:", "Upcoming exhibitions:" lists |
| `/artists/[slug]` | `src/pages/artists/[slug].astro` | Artist block (image + name/period + text + links + "← All exhibitions") and the continued block |
| `/404` | `src/pages/404.astro` | "Nothing here." + "Back to the start" |
| `/admin` | built by `tinacms build` in CI | Tina Cloud login |

Removed this session: `/[slug]` generic pages (and `/about`), the nav, the footer.

### Shared pieces

- `src/layouts/Layout.astro` — `<head>` (font preload, `js` class on `<html>`), `SiteHeader`, `<main>`.
- `src/components/SiteHeader.astro` — fixed header, three white "pill" links to `#top`: title
  (left), dates line (centre), venue (right). Home page: hidden while `#intro`/`#landing` are in
  view, fades in (300 ms) once `#landing` is scrolled past (IntersectionObserver). Other pages:
  always visible. Phone (< 48rem): title at the top, dates + venue in a fixed line at the bottom,
  12 px Medium Italic as in the phone mockups.
- `src/components/ArtistFeature.astro` — image on `imageSide`, name + period (bold) and body on
  the other side. Phone: name, 133 px square image, text.
- `src/components/ArtistContinued.astro` — "Text, continued" under the main image's column, second
  image (720 × 822 ratio, cropped to fill) on the other side, matching Figma frame `42:145`.
- `src/components/ExhibitionLists.astro` — headings + rows: underlined name link → blue arrow →
  period. Phone: Upcoming before Previous.
- `src/components/Arrow.astro` — inline SVG, `direction` `right|down`, stroke `currentColor`
  (accent token).
- Intro behaviour — inline script in `index.astro`: logo for 2 s, then smooth scroll to
  `#landing`; skipped (instant jump) on repeat visits in the same tab (`sessionStorage
  spacecraftIntroSeen`) or with reduced motion; cancelled by wheel/touch/key/pointer input; left
  alone if the page was opened at an anchor or a restored scroll position. Works without JS
  (the sections are static).

### Design tokens (`src/styles/global.css`)

White background, black text, one accent `--color-accent: #0000ff` (arrows only). Font: ABC Areal
Superfamily Variable, self-hosted `public/fonts/ABCArealSuperfamilyVariable.woff2` (axes:
`wght` 400–700, `slnt` 0…−12, plus `MONO` and `DRKM` unused). Declared twice from the same file:
`font-style: normal` and `font-style: oblique 12deg` — the italic ("Currently on view", phone
header) is the font's **real slanted design** via the `slnt` axis, not a synthesised oblique.
Type sizes use `clamp(phone size, vw, desktop size)` so they never exceed the 1512-wide mockup.
Layout breakpoint: 48rem (768 px) — below it everything stacks with a 5 px gutter.

### Content collections (Tina ⇄ Astro, same files)

| Collection | Type | Files | Fields |
| --- | --- | --- | --- |
| `site` | singleton | `content/site/settings.json` | siteTitle, tagline, socialLinks[] {label, url}, footerText — *socialLinks/footerText are currently unused (no footer)* |
| `exhibition` | singleton | `content/exhibition/current.md` | title, datesLine, startDate, endDate, venue, presentingPrefix (default "Presenting exhibitions of works by"), currentLabel (default "Currently on view"), logo |
| `artists` | list | `content/artists/*.md` (filename = slug) | name, status (select: current / upcoming / previous, required), period (free text), order, imageSide (select: left / right, default left), mainImage, body (rich-text, "Text"), btsImage ("Second image"), continuedText (rich-text, "Text, continued"; stored as a Markdown string in frontmatter), links[] {label, url} |

How the fields are used:
- Landing title = `title`; landing dates line = `datesLine` + ". " + `venue` + "." (line break
  between); header shows `datesLine` and `venue`.
- "Presenting…" line = `presentingPrefix` + all artist names in `order` + ".".
- `#current` = the first artist (by `order`) with status `current`; if there is none, the landing
  arrow and `#current`/`#continued` are left out.
- Lists are filtered by `status` and sorted by `order`; `period` is shown as written.
- `startDate`/`endDate` are kept but not displayed (for later use).

Seed content: exhibition "Out of This World! Exhibition Festival of Contemporary Craft and
Innovation.", 30 October – 11 December 2026, Jan Stenbecks torg, Kista. Artists: Sabrina
Gschwandtner (current, full text from the mockup), Boom! Glass Group, Roni Kaufman, Helene Kask,
Maria Pita Guerreiro, Joanne Grüne Yanoff (upcoming, "Text coming soon."). No images. The old
placeholder artists, the About page and the placeholder SVGs are deleted (`public/uploads/` is
kept with a `.gitkeep`).

### Workflows

- `.github/workflows/deploy.yml` (unchanged) — on push to `main` and manual dispatch:
  `npm ci` → configure-pages → `npx tinacms build` (secrets are set) → `npx astro build` →
  deploy to Pages.

**Operational rule — how to redeploy:** Actions → "Deploy to GitHub Pages" → **Run workflow**
(on `main`). Never use "Re-run all jobs" on an old run (it redeploys that run's old commit).

## What Caspar must do (browser only)

1. **Merge the design PR** on GitHub (Pull requests → the "Figma design pass" PR → Merge). Then
   open Actions and check that the "Deploy to GitHub Pages" run is green — especially the
   "Build Tina admin" step (see Known issues → tina-lock).
2. In https://thespacecraft.se/admin:
   - **Exhibition** → upload the **Logo** (the intro screen only appears once a logo is set).
     Check "Dates line" and "Venue".
   - **Artists** → for each artist: upload **Main image**, optionally a **Second image** and
     "Text, continued"; check **Period** (Roni Kaufman onwards are "November 13th"-style as in the
     mockup — fix to the real periods); pick **Main image side**; replace "Text coming soon."
   - When an exhibition ends: set that artist's **Status** to *Previous* and the next one to
     *Current*. Only one artist should be *Current* at a time (if several are, the lowest
     **Sort order** wins).
3. The admin's media library starts empty (the old placeholder images were deleted).

## In progress

- Nothing in progress. The design PR is waiting to be merged.

## Next steps

1. Merge the PR, check the deploy and `/admin` (above).
2. Upload real images and texts via `/admin`.
3. Unpin `@tinacms/cli` / remove the `@tinacms/graphql` override, regenerate
   `tina/tina-lock.json`, verify CI's Tina step (own session, on a green `main`).
4. Later: first light visual as a client-only island in `src/components/visual/` (separate prompt).

## Open questions for Caspar

- **Main image cropping:** the mockup shows the main image as a square, so non-square uploads are
  cropped to fill it (and the second image to 720 × 822). OK, or should whole artworks always be
  shown uncropped?
- **No way "home" from `/artists` and artist pages:** per the spec the header links only scroll to
  the top of the current page. Should the title link to `/` instead?
- **Footer / social links:** `socialLinks` and `footerText` still exist in Site settings but are
  not shown anywhere. Keep them for later, or drop them?
- Site language stays English (dates are free text now, so this only affects UI labels).
- "Previous" list is empty until the first exhibition ends — fine to show just the heading?

## Known issues

- **tina-lock.json regenerated offline:** `tinacms build --local` regenerated
  `tina/tina-lock.json` from the new schema (still schema version 4.0.1) and then stopped at the
  Tina Cloud check, because this sandbox has no network access to Tina Cloud (`fetch failed`). The
  lock file contents are complete (new fields, select options, no `pages` collection), but
  **Tina Cloud has not seen this schema yet**: check that the "Build Tina admin" step in the first
  deploy after merging is green, and that `/admin` shows the new fields. If the step fails, the
  error message says why; Tina Cloud may need a moment to re-index the branch — run the workflow
  again via "Run workflow".
- **Old content in Tina Cloud's index:** the deleted files (old artists, About page) disappear from
  `/admin` once Tina Cloud re-indexes `main` after the merge.
- **`continuedText` rendering depends on `marked`**, which is not a direct dependency — it comes
  in via `tinacms` → `mermaid`. If a Tina update ever drops it, the build fails with "Cannot find
  package 'marked'"; the fix is a one-line DECISIONS entry + adding `marked` to `package.json`.
- **Font path:** `@font-face` uses `/fonts/…` (root-relative). Fine on the custom domain; would
  break only if the site were served from a sub-path again (same caveat as images in Markdown).
- **Tina packages are pinned:** `@tinacms/cli` `4.0.3` + `overrides` `@tinacms/graphql` `4.0.1`
  (see DECISIONS). Tina Cloud appears to accept 4.1.0 now; unpinning is next step 3. Don't let
  Dependabot/`npm update` bump these until then.
- **`www` certificate:** right after setup, https://www.thespacecraft.se showed
  `ERR_CERT_COMMON_NAME_INVALID` while GitHub's certificate for `www` was provisioning. If it
  persists: GitHub → repo Settings → Pages → Custom domain → **Remove**, re-enter
  `thespacecraft.se` → Save, wait for the DNS check, tick "Enforce HTTPS" again.
- `npm install` warns that `react-final-form` (inside `tinacms`) wants React ≤18; harmless.
- `npm audit` reports advisories in transitive dependencies of the Tina CLI (build-time only).

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
- Last deploy: run #10 (push, "Add files via upload" — the font) on `9bbd4c3`, green
  (2026-10-27 23:12 UTC). Runs #7–#9 (docs + two Tina content edits) were green too.
- Deploy runs: https://github.com/BromsC/spacecraft-site/actions
