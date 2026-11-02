# STATE — current status (handoff document)

## Last updated

2026-11-02 — Design-fix round 2 (Claude Code): the artist block is one centred column on every
viewport (no floats), phone content padding 20 px, new "Second image caption" field, and a
build fix for empty link items. Pushed on branch `claude/festive-planck-vjztn2` with a PR to
`main` (this environment can only push the feature branch). **Not live until that PR is
merged.**

## Status summary

1. PR https://github.com/BromsC/spacecraft-site/pull/2 (design-fix round 1: one text field,
   loading overlay, list placeholders, credits line) was **merged on 2026-10-30 and is live**.
   Sabrina Gschwandtner's text has since been cleaned up in `/admin`: it appears once, with
   `###` sub-headings ("About the works:", "About the artist:").
2. **`main` is currently red:** deploy run #35 (2026-11-01 20:46 UTC, "TinaCMS content update",
   `9f55bf5`) failed in the Astro build. That `/admin` save added an empty item to Sabrina's
   **Links** (`links: - {}`), which the schema rejected. The site is still serving run #34
   (`36ae034`, green), so the last edit — the line "Image features “Hands at Work Video”, 2017.
   Photo by Joshua White Photography." appended to Sabrina's text — is not live yet. This
   round's PR fixes the build (empty link items are now ignored); merging it deploys everything.
3. This round is code-complete on `claude/festive-planck-vjztn2`: `npm run build:site` and
   `npx astro check` pass with 0 errors, 0 warnings, 0 hints. Checked in headless Chromium
   at 1512×982 and 390×844 with test content (not committed); see "Verified" below.
4. **The Tina schema changed** (new field `btsCaption`, new descriptions on `btsImage` and
   `imageSide`), so check the first deploy after merging ("What Caspar must do" step 1).

## What exists

### Routes

| Route | Source | Content |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Loading overlay (logo, only if set) → `#landing` (title, dates + venue, "Presenting…" line, "Currently on view" + down arrow) → `#current` (current artist block) → `#exhibitions` (Previous / Upcoming lists + credits line) |
| `/artists` | `src/pages/artists/index.astro` | "Currently on view:", "Previous exhibitions:", "Upcoming exhibitions:" lists + credits line. Not linked from anywhere, but kept. |
| `/artists/[slug]` | `src/pages/artists/[slug].astro` | Artist block + links + "← Home" |
| `/404` | `src/pages/404.astro` | "Nothing here." + "Back to the start" |
| `/admin` | built by `tinacms build` in CI | Tina Cloud login |

### Shared pieces

- `src/layouts/Layout.astro` — `<head>`: title, description, canonical, Open Graph (`og:type`
  website, `og:title` = page title, `og:description`, `og:url` = canonical, `og:image` = absolute
  URL of the exhibition logo if set), `twitter:card` summary_large_image, `theme-color` #ffffff,
  font preload, `js` class on `<html>`. Then `SiteHeader` and `<main>`.
- `src/components/SiteHeader.astro` — fixed header, three white "pill" links: title (left), dates
  line (centre), venue (right). Home page: hidden while `#landing` is in view, fades in (300 ms)
  once `#landing` is scrolled past (IntersectionObserver); all three pills link to `#top`. Every
  other page: always visible; the **title links to `/`**, dates/venue to `#top`. Phone
  (< 48rem): title at the top, dates + venue in a fixed line at the bottom, 12 px Medium Italic,
  5 px from the edge (`--gutter`).
- `src/components/ArtistFeature.astro` — the artist block, used by `#current` and
  `/artists/[slug]` (same output on both). **One centred column on every viewport, no floats,
  no JS.**
  - DOM: main image, second image, caption, title (name + period), `.feature__body.prose` (the
    rendered Markdown), `.feature__extra` (the slot: links + "← Home" on artist pages; only
    rendered if the slot has content).
  - `.feature` is a one-column grid; `.feature__body` is `display: contents`, so each paragraph
    and heading of the text is its own grid item. Visual order via CSS `order`:
    1 title · 2 intro (text before the first sub-heading) · 3 main image · 4 rest of the text
    (first sub-heading onwards) · 5 second image · 6 caption · 7 links / back link.
    The intro is selected with `:has()`; **if the text has no sub-heading, the main image goes
    after the first paragraph.** If the text starts with a sub-heading, the intro is empty and the
    main image comes right after the title.
  - Desktop (≥ 48rem): column `width: min(100%, var(--feature-col))` (710 px), `justify-self:
    center` — title, every text item, both images and the caption share the same left/right
    edges, centred in the viewport. Title left-aligned. Gaps: title → intro
    `clamp(32px, 6.3vw, 95px)` (the old body margin); main image 26 px above and below (square,
    full column width); second image 26 px below the text (720 / 822 crop, full column width);
    caption 8 px below it.
  - Phone: same order. Title centred, 17 px to the intro; main image 133 px square, centred,
    26 px above and below; second image full column width (720 / 822), 26 px below the text;
    caption 8 px below.
  - The first sub-heading's own top margin is 0 (the main image's 26 px is the gap); later
    sub-headings keep their `1em` top / `0.3em` bottom margins. `.prose > :first-child` still
    zeroes the first text item's top margin.
  - `imageSide` is no longer used by the layout (still in both schemas and the content).
  - Caption (`.feature__caption.prose`): `btsCaption` rendered to inline HTML; only shown if
    `btsImage` is set and the caption is non-empty after trimming. `--fs-body`, left-aligned,
    paragraphs without margins; italics only where the editor set them (`<em>` → oblique font).
- `src/components/ExhibitionLists.astro` — headings + rows: underlined name link → blue arrow →
  period. An empty group shows one placeholder row `"..."` → arrow → `"..."` (not a link). The
  Site settings **Credits line** (`footerText`) sits centred at the bottom of the section
  (section is at least one screen tall; omitted if the field is empty). Phone: Upcoming →
  Previous → credits.
- `src/components/Arrow.astro` — inline SVG, `direction` `right|down`, stroke `currentColor`
  (accent token).
- Loading overlay — `index.astro`: a fixed white layer (z-index 30, above the header) with the
  logo centred, `aria-hidden`. On every load: once the logo has loaded (at most 2 s), it stays
  800 ms, fades out over 500 ms (`--fade-intro`), then is removed from the DOM. Reduced motion →
  removed immediately. Only shown with JS. Scrolling is not locked.
- `src/lib/content.ts` — data helpers, plus `renderCaption()` (Markdown → inline HTML with
  `marked.parseInline`, each blank-line-separated block wrapped in `<p>`).

### Design tokens (`src/styles/global.css`)

White background, black text, one accent `--color-accent: #0000ff` (arrows only). Font: ABC Areal
Superfamily Variable, self-hosted `public/fonts/ABCArealSuperfamilyVariable.woff2` (axes:
`wght` 400–700, `slnt` 0…−12), declared as `normal` and `oblique 12deg` from the same file. Type
sizes use `clamp(phone size, vw, desktop size)`. Layout breakpoint: 48rem (768 px). Links get a
2 px `currentColor` outline on `:focus-visible` only.

Spacing tokens:

| Token | Phone | Desktop (≥ 48rem) | Used for |
| --- | --- | --- | --- |
| `--gutter` | 5px | 20px | fixed header (pills), skip link, loading overlay padding |
| `--content-gutter` (new) | 20px | `var(--gutter)` (20px) | horizontal padding of `.section` (artist block, lists + credits, 404) and `.landing` |
| `--feature-col` (new) | — | 710px | width of the artist column |
| `--col-gap` | 20px | 20px | header grid, lists columns |

Desktop rendering is unchanged by `--content-gutter`.

### Content collections (Tina ⇄ Astro, same files)

| Collection | Type | Files | Fields |
| --- | --- | --- | --- |
| `site` | singleton | `content/site/settings.json` | siteTitle, tagline, socialLinks[] {label, url} (*unused*), footerText ("Credits line") |
| `exhibition` | singleton | `content/exhibition/current.md` | title, datesLine, startDate, endDate, venue, presentingPrefix, currentLabel, logo (overlay + `og:image`) |
| `artists` | list | `content/artists/*.md` (filename = slug) | name, status (current / upcoming / previous), period (free text), order, imageSide (left / right — *unused by the layout*), mainImage, body (rich-text, "Text"), btsImage ("Second image"), **btsCaption ("Second image caption", new)**, links[] {label, url} |

Schema changes this round:
- **`btsCaption`** added after `btsImage` in `tina/config.ts`: `rich-text`, not `isBody` (Tina
  stores a Markdown string in the frontmatter), toolbar bold / italic / link. zod:
  `z.string().optional()`. Not added to any content file.
- Descriptions: `btsImage` → "Shown below the whole text, at full column width."; `imageSide` →
  "Not used by the current layout (images are centred)."
- `links` / `socialLinks` (zod only): items with an empty `label` or `url` are dropped instead of
  failing the build (see Status 2).
- `tina/tina-lock.json` regenerated with `npx tinacms build --local` (stopped at the Tina Cloud
  check as before, no network to Tina Cloud from the sandbox). The lock contains `btsCaption`
  with the toolbar override; schema version still 4.0.1.
- New dependency: `marked` `^18.1.2` (see DECISIONS).

How the fields are used:
- Landing title = `title`; landing dates line = `datesLine` + ". " + `venue` + "."; header shows
  `datesLine` and `venue`.
- "Presenting…" line = `presentingPrefix` + all artist names in `order` + ".".
- `#current` = the first artist (by `order`) with status `current`; if none, the landing arrow and
  `#current` are left out.
- Lists are filtered by `status` and sorted by `order`; `period` is shown as written.

Current content: exhibition "Out of This World! Exhibition Festival of Contemporary Craft and
Innovation.", 30 October – 11 December 2026, Jan Stenbecks torg, Kista; logo `/uploads/LOGO.png`.
Artists: Sabrina Gschwandtner (current, main image `/uploads/2160Sabrina.png`, second image
`/uploads/Photo-Joshua_White-jwpictures.com-9991.jpg`, text cleaned up with `###` sub-headings; its
last paragraph is the photo credit, see "What Caspar must do"; one empty Links item), Boom! Glass
Group, Roni Kaufman, Helene Kask, Maria Pita Guerreiro, Joanne Grüne Yanoff (upcoming, no images).

### Verified (headless Chromium 153, 1512×982 and 390×844, test content not committed)

- `:has()` and `~` inside `:not()` work (`CSS.supports('selector(:has(a))')` = true).
- Text with sub-headings (Sabrina): title → intro paragraph → main image → "About the works:" →
  … → second image → caption → links → "← Home". Main image exactly 26 px below the intro and
  26 px above the sub-heading.
- Text without a sub-heading: main image after the first paragraph.
- Caption filled but no second image: no caption.
- Desktop: every item at x = 401–1111 (710 px, centred in 1512); main image 710 × 710.
- Phone: every content item starts 20 px from the edge (landing, artist block, lists, credits);
  header title and bottom dates line text at 5 px. Second image lazy-loads on scroll.
- Desktop unaffected by the gutter change: compared against a local build of `36ae034` (what run
  #34 deployed; https://thespacecraft.se itself was not reachable from the sandbox): `#landing`
  pixel-identical; the lists/header view differs by one antialiased arrow pixel only, because the
  lists now start at a different sub-pixel y offset under the taller artist block.
- `/artists/[slug]` renders the block exactly like `#current`. No console errors on any route.

### Workflows

- `.github/workflows/deploy.yml` (unchanged) — on push to `main` and manual dispatch:
  `npm ci` → configure-pages → `npx tinacms build` (secrets are set) → `npx astro build` →
  deploy to Pages.

**Operational rule — how to redeploy:** Actions → "Deploy to GitHub Pages" → **Run workflow**
(on `main`). Never use "Re-run all jobs" on an old run (it redeploys that run's old commit).

## What Caspar must do (browser only)

1. **Merge this round's PR** on GitHub (Pull requests → "design fixes round 2" from
   `claude/festive-planck-vjztn2` → Merge). Then Actions → the new "Deploy to GitHub Pages" run →
   check it is green, **especially the "Build Tina admin" step** (Tina Cloud must re-index the
   changed schema; if it fails, wait a minute and use "Run workflow"). This run also fixes the red
   run #35.
2. Open https://thespacecraft.se/admin → Artists → any artist: below "Second image" there should
   be **"Second image caption"** with only bold, italic and link in its toolbar. If it's missing,
   Tina Cloud hasn't re-indexed yet; reload later.
3. In `/admin` → **Sabrina Gschwandtner**:
   - **Second image caption:** type the credit, e.g. "Image features *“Hands at Work Video”*,
     2017. Photo by Joshua White Photography." Select the work title and press the italic button
     if it should be italic. Save.
   - **Text:** delete that same last line ("Image features … Photo by Joshua White
     Photography.") from the text, so it isn't shown twice.
   - **Links:** there is one empty item; delete it (trash icon) or fill in label + URL. It no
     longer breaks the build, but it isn't shown either.
4. Check https://thespacecraft.se on a phone and a laptop: one centred column, main image between
   the first paragraph and "About the works:", second image + caption at the end.
5. Ongoing: Artists → Period: use the "6 – 13 Nov" form consistently; replace "Text coming soon."
   and upload images when available. When an exhibition ends: set that artist's **Status** to
   *Previous* and the next one to *Current* (only one *Current* at a time; the lowest **Sort
   order** wins). Put a sub-heading after the first paragraph(s) of each text: that's where the
   main image goes.

## In progress

- Nothing. The round-2 PR is waiting to be merged.

## Next steps

1. Merge the PR, check the deploy and `/admin` (above), fill in the caption.
2. Unpin `@tinacms/cli` / remove the `@tinacms/graphql` override, regenerate
   `tina/tina-lock.json`, verify CI's Tina step (own session, on a green `main`).
3. Later: first light visual as a client-only island in `src/components/visual/` (separate prompt).

## Open questions for Caspar

- **Image cropping:** the main image is cropped to a square, the second image to 720 × 822. OK,
  or should whole artworks be shown uncropped?
- **Social links:** `socialLinks` still exists in Site settings but isn't shown. Keep or drop?
- **`/artists` page:** nothing links to it. Keep it as a hidden overview, or remove it?
- **Drop `imageSide`?** "Main image side" no longer does anything (images are centred). Remove the
  field from both schemas and the content files?
- **Loading overlay on phone:** the logo keeps 5 px side padding (it's a splash, not content).
  Should it be 20 px like the content?

## Known issues

- **`main` is red until this PR is merged** (run #35, see Status 2).
- **Tina Cloud hasn't seen the new schema yet** (lock file regenerated offline). Check the first
  deploy's "Build Tina admin" step.
- **`/admin` commits since 2026-11-01 are authored by `tinacloud-app[bot]`**, not a person. With
  "act as self", Tina falls back to the bot when the editor's GitHub account can't write to the
  repo; most likely the second editor has no access to `BromsC/spacecraft-site`. Saving works.
  If attribution matters: GitHub → repo Settings → Collaborators → add their account (Write).
- **`:has()` required** for the image position (all current browsers). Older browsers show the
  text in order with the main image above it.
- **Figma not read this round** (as instructed); the layout follows Caspar's screenshots as
  described in the task.
- **`scroll-margin-top` deliberately not added** to `#current` / `#exhibitions` (see DECISIONS).
- **Font path:** `@font-face` uses `/fonts/…` (root-relative) — fine on the custom domain.
- **Tina packages are pinned:** `@tinacms/cli` `4.0.3` + `overrides` `@tinacms/graphql` `4.0.1`
  (see DECISIONS). Don't let Dependabot/`npm update` bump these until next step 2.
- **`www` certificate:** if https://www.thespacecraft.se shows a certificate error: GitHub → repo
  Settings → Pages → Custom domain → **Remove**, re-enter `thespacecraft.se` → Save, wait for the
  DNS check, tick "Enforce HTTPS" again.
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
| Tina Cloud git authoring | ✅ "act as self" (falls back to `tinacloud-app[bot]` when the editor can't write to the repo) |
| Tina Cloud plan | ✅ Free — 2/2 users (second editor added 2026-11-01, role Editor) |
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
- Live deploy: run #34 (push, "TinaCMS content update") on `36ae034`, green (2026-11-01 20:40
  UTC). Latest run #35 on `9f55bf5` **failed** (empty link item, fixed by this round's PR).
  PR #2 merge: `4c869a2` (2026-10-30).
- Deploy runs: https://github.com/BromsC/spacecraft-site/actions
