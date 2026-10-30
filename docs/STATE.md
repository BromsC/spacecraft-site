# STATE — current status (handoff document)

## Last updated

2026-10-30 — Design-fix round (Claude Code): one text field per artist flowing around both
images, empty-list placeholder rows + credits line, header title → home on subpages, "← Home" on
artist pages, loading-logo overlay instead of the intro section, small quality pass (OG meta,
focus outlines, image attributes). Pushed on branch `claude/eager-ride-of8ykd` with a PR to
`main` (this environment can only push the feature branch). **Not live until that PR is
merged.**

## Status summary

1. The Figma design pass (PR https://github.com/BromsC/spacecraft-site/pull/1) is **merged and
   live** on https://thespacecraft.se. Since then Caspar has uploaded the logo and Sabrina
   Gschwandtner's images/text via `/admin` ("TinaCMS content update" / "Update from TinaCMS"
   commits); all those deploys are green.
2. This round's changes are code-complete on `claude/eager-ride-of8ykd`: `npm run build:site` and
   `npx astro check` pass with 0 errors, 0 warnings, 0 hints. Checked in headless Chromium at
   1512×982 and 390×844 with test content (not committed) — see "Verified" below.
3. **The Tina schema changed** (artist `continuedText` removed, `body` toolbar reduced, labels):
   the first deploy after merging must be checked (see "What Caspar must do" step 1).

## What exists

### Routes

| Route | Source | Content |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Loading overlay (logo, only if set) → `#landing` (title, dates + venue, "Presenting…" line, "Currently on view" + down arrow) → `#current` (current artist, whole text around both images) → `#exhibitions` (Previous / Upcoming lists + credits line) |
| `/artists` | `src/pages/artists/index.astro` | "Currently on view:", "Previous exhibitions:", "Upcoming exhibitions:" lists + credits line. Not linked from anywhere any more, but kept. |
| `/artists/[slug]` | `src/pages/artists/[slug].astro` | Artist block (images + name/period + text + links + "← Home") |
| `/404` | `src/pages/404.astro` | "Nothing here." + "Back to the start" |
| `/admin` | built by `tinacms build` in CI | Tina Cloud login |

Removed this round: the `#intro` section (replaced by the overlay), the `#continued` section and
`src/components/ArtistContinued.astro`.

### Shared pieces

- `src/layouts/Layout.astro` — `<head>`: title, description, canonical, Open Graph (`og:type`
  website, `og:title` = page title, `og:description`, `og:url` = canonical, `og:image` = absolute
  URL of the exhibition logo if set), `twitter:card` summary_large_image, `theme-color` #ffffff,
  font preload, `js` class on `<html>`. Then `SiteHeader` and `<main>`.
- `src/components/SiteHeader.astro` — fixed header, three white "pill" links: title (left), dates
  line (centre), venue (right). Home page: hidden while `#landing` is in view, fades in (300 ms)
  once `#landing` is scrolled past (IntersectionObserver); all three pills link to `#top`. Every
  other page: always visible; the **title links to `/`**, dates/venue to `#top`. Phone
  (< 48rem): title at the top, dates + venue in a fixed line at the bottom, 12 px Medium Italic.
- `src/components/ArtistFeature.astro` — used by `#current` and `/artists/[slug]`. DOM order:
  main image, second image, title (name + period), `.prose` body (+ slot for links / "← Home").
  - Desktop (≥ 48rem): `display: flow-root`. Main image floats on `imageSide` (square, half width
    minus half the column gap); the second image floats on the other side with `clear`, so its
    top edge is exactly the main image's bottom edge (720 × 822 crop). Title and text are normal
    flow: the text runs beside the main image, breaks at its bottom edge and continues on the
    other side beside the second image, then full width if it is longer than both. No JS.
  - Phone: grid with `order` — name/period centred → 133 px square main image → text → links →
    second image full width (26 px gaps).
  - Sub-headings in the text (any heading level) are bold oblique, `--fs-subheading`, and wrap
    around the images like paragraphs. Paragraphs have no margins (blank lines come from the
    editor).
- `src/components/ExhibitionLists.astro` — headings + rows: underlined name link → blue arrow →
  period. An empty group shows one placeholder row `"..."` → arrow → `"..."` (not a link). The
  Site settings **Credits line** (`footerText`) sits centred at the bottom of the section
  (section is at least one screen tall; omitted if the field is empty). Phone: Upcoming →
  Previous → credits.
- `src/components/Arrow.astro` — inline SVG, `direction` `right|down`, stroke `currentColor`
  (accent token).
- Loading overlay — `index.astro`: a fixed white layer (z-index 30, above the header) with the
  logo centred, `aria-hidden`. On every load and reload: once the logo has loaded (at most 2 s),
  it stays 800 ms, fades out over 500 ms (`--fade-intro`), then is removed from the DOM
  (`transitionend`, 1.5 s fallback). Reduced motion → removed immediately (and hidden by CSS).
  Only shown with JS (`.js .loader`), so no-JS visitors never get stuck. Scrolling is not locked.

### Design tokens (`src/styles/global.css`)

White background, black text, one accent `--color-accent: #0000ff` (arrows only). Font: ABC Areal
Superfamily Variable, self-hosted `public/fonts/ABCArealSuperfamilyVariable.woff2` (axes:
`wght` 400–700, `slnt` 0…−12). Declared twice from the same file: `font-style: normal` and
`font-style: oblique 12deg` — italics use the font's real slanted design. Type sizes use
`clamp(phone size, vw, desktop size)`; new this round: `--fs-subheading` (20–32 px) and
`--fs-credits` (16–28 px), `--fade-intro: 500ms`. Layout breakpoint: 48rem (768 px). Links get a
2 px `currentColor` outline on `:focus-visible` only. `scroll-behavior: smooth` unchanged.

### Content collections (Tina ⇄ Astro, same files)

| Collection | Type | Files | Fields |
| --- | --- | --- | --- |
| `site` | singleton | `content/site/settings.json` | siteTitle, tagline, socialLinks[] {label, url} (*unused*), footerText ("Credits line") |
| `exhibition` | singleton | `content/exhibition/current.md` | title, datesLine, startDate, endDate, venue, presentingPrefix, currentLabel, logo (overlay + `og:image`) |
| `artists` | list | `content/artists/*.md` (filename = slug) | name, status (current / upcoming / previous), period (free text), order, imageSide (left / right), mainImage, body (rich-text, "Text" — the whole text), btsImage ("Second image"), links[] {label, url} |

Schema changes this round:
- **`continuedText` removed** from `tina/config.ts` and `src/content.config.ts`. The artist's
  whole text is the Markdown body. Tina toolbar for "Text" is reduced to heading, bold, italic,
  link, with one heading level (`overrides: { toolbar: [...], headingLevels: ['h3'] }`, shape
  checked against the installed `@tinacms/schema-tools` types). Description: "Sub-headings
  (e.g. 'About the works:') are headings in the editor."
- `btsImage` relabelled "Second image" with a new description; `footerText` relabelled "Credits
  line"; the logo description now describes the overlay.
- `marked` / `renderMarkdown()` are gone (nothing else used them), so the transitive-`marked` risk
  is gone too.
- **Migration:** only `sabrina-gschwandtner.md` had `continuedText`; it was appended to the body
  as paragraphs and the key deleted. No other prose was edited. Because Sabrina's body already
  contained the text twice, **the text now appears three times** — Caspar must clean it up (below).
- `content/site/settings.json` `footerText` seeded with "The festival is curated by The Space
  Craft and organized in collaboration with Centrum for AMP. Supported by Region Stockholm."
- `tina/tina-lock.json` regenerated with `tinacms build --local` (stopped at the Tina Cloud check
  as before — no network to Tina Cloud from the sandbox; the lock file is complete: no
  `continuedText`, has `headingLevels` and the new labels; schema version still 4.0.1).

How the fields are used:
- Landing title = `title`; landing dates line = `datesLine` + ". " + `venue` + "."; header shows
  `datesLine` and `venue`.
- "Presenting…" line = `presentingPrefix` + all artist names in `order` + ".".
- `#current` = the first artist (by `order`) with status `current`; if none, the landing arrow and
  `#current` are left out.
- Lists are filtered by `status` and sorted by `order`; `period` is shown as written.

Current content: exhibition "Out of This World! …", 30 October – 11 December 2026, Jan Stenbecks
torg, Kista; logo `/uploads/LOGO.png`. Artists: Sabrina Gschwandtner (current, images
`/uploads/Roni-1.png` + `/uploads/Instagram-post-7.png`), Boom! Glass Group, Roni Kaufman, Helene
Kask, Maria Pita Guerreiro, Joanne Grüne Yanoff (upcoming, "Text coming soon.", no images).
`public/uploads/` also holds `LOGO-2.png` (unused).

### Verified (headless Chromium, 1512×982 and 390×844, test content not committed)

- Left image, long text with a sub-heading: last right-column line sits beside the main image,
  the next line starts at the main image's bottom edge beside the second image — no full-width
  line in between; text continues full width below both images.
- `imageSide: right` mirrors exactly. No second image: text goes full width below the main image.
  Text shorter than the main image: nothing beside the second image.
- Phone stacking order and gaps as specified; second image lazy-loads.
- Overlay: opaque ~0.85 s, fades by ~1.35 s, removed; gone instantly with reduced motion; hidden
  without JS. Header title: `#top` on home, `/` on subpages. Arrow jump to `#current` shows the
  header. No console errors on any route (404 only logs its own 404 status).
- Note: where a text line would straddle the main image's bottom edge, the browser moves it below
  that edge, leaving a gap of up to one line height on the text side — inherent to floats, fine.

### Workflows

- `.github/workflows/deploy.yml` (unchanged) — on push to `main` and manual dispatch:
  `npm ci` → configure-pages → `npx tinacms build` (secrets are set) → `npx astro build` →
  deploy to Pages.

**Operational rule — how to redeploy:** Actions → "Deploy to GitHub Pages" → **Run workflow**
(on `main`). Never use "Re-run all jobs" on an old run (it redeploys that run's old commit).

## What Caspar must do (browser only)

1. **Merge this round's PR** on GitHub (Pull requests → the "design fixes" PR from
   `claude/eager-ride-of8ykd` → Merge). Then Actions → the new "Deploy to GitHub Pages" run →
   check it is green, **especially the "Build Tina admin" step** (Tina Cloud must re-index the
   changed schema; if it fails, wait a minute and use "Run workflow").
2. Open https://thespacecraft.se/admin → Artists → any artist: the "Text" field's toolbar should
   show only heading, bold, italic and link; "Text, continued" should be gone. If the old field
   still shows, Tina Cloud hasn't re-indexed yet — reload later.
3. In `/admin`:
   - **Sabrina Gschwandtner → Text:** the text is there three times (it was pasted twice before,
     and "Text, continued" has been moved into it). Delete the duplicates so it appears once.
   - **Add sub-headings** (e.g. "About the works:") with the heading button in the toolbar.
   - **Site settings → Credits line:** check the sentence.
   - **Artists → Period:** use the "6 – 13 Nov" form consistently (Roni Kaufman onwards still
     say "November 13th" etc.). Replace "Text coming soon." and upload images when available.
   - When an exhibition ends: set that artist's **Status** to *Previous* and the next one to
     *Current* (only one *Current* at a time; the lowest **Sort order** wins).

## In progress

- Nothing. The design-fix PR is waiting to be merged.

## Next steps

1. Merge the PR, check the deploy and `/admin` (above). Clean up Sabrina's text.
2. Unpin `@tinacms/cli` / remove the `@tinacms/graphql` override, regenerate
   `tina/tina-lock.json`, verify CI's Tina step (own session, on a green `main`).
3. Later: first light visual as a client-only island in `src/components/visual/` (separate prompt).

## Open questions for Caspar

- **Main image cropping:** non-square uploads are cropped to a square (second image to 720 × 822).
  OK, or should whole artworks be shown uncropped?
- **Social links:** `socialLinks` still exists in Site settings but isn't shown. Keep or drop?
- **`/artists` page:** nothing links to it any more (artist pages now go "← Home"). Keep it as a
  hidden overview, or remove it?

## Known issues

- **Tina Cloud hasn't seen the new schema yet** (lock file regenerated offline — see above). Check
  the first deploy's "Build Tina admin" step.
- **`scroll-margin-top` deliberately not added** to `#current` / `#exhibitions`: those sections
  already start with `--header-space` padding, so anchor jumps never hide content; an extra scroll
  margin would double the gap and leave `#landing`'s bottom edge in view after the arrow jump,
  which keeps the home header hidden (see DECISIONS).
- **Figma not re-read this round:** the Figma MCP's plan limit was reached at the start of the
  session; the layout follows the measurements given in the task (frames 35:16, 42:145, 38:47,
  phone frames).
- **Font path:** `@font-face` uses `/fonts/…` (root-relative) — fine on the custom domain.
- **Tina packages are pinned:** `@tinacms/cli` `4.0.3` + `overrides` `@tinacms/graphql` `4.0.1`
  (see DECISIONS). Don't let Dependabot/`npm update` bump these until next step 2.
- **`www` certificate:** if https://www.thespacecraft.se shows a certificate error: GitHub → repo
  Settings → Pages → Custom domain → **Remove**, re-enter `thespacecraft.se` → Save, wait for the
  DNS check, tick "Enforce HTTPS" again.
- `npm install` warns that `react-final-form` (inside `tinacms`) wants React ≤18, and about the
  Node engine in some sandboxes; harmless.
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
- Last deploy: run #19 (push, "TinaCMS content update") on `499a5ba`, green
  (2026-10-28 11:35 UTC). Run #11 (PR #1 merge, `162bd3e`) and the Tina content runs #12–#18
  are green, except #13 and #15, which were cancelled by the next push (expected).
- Deploy runs: https://github.com/BromsC/spacecraft-site/actions
