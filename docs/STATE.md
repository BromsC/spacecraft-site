# STATE — current status (handoff document)

## Last updated

2026-11-02 (afternoon) — Caption/italics fix (Claude Code): a smaller caption size
(`--fs-caption`), the editor's italics shown in the font's own slanted design (`.prose em/i` →
`oblique 12deg`), and `font-synthesis: none`. CSS only, no schema change. Pushed on branch
`claude/caption-italics`; a PR to `main` still has to be opened (see Status 3). **Not live until
merged.**

## Status summary

1. PR https://github.com/BromsC/spacecraft-site/pull/3 (design-fix round 2: centred single-column
   artist block, 20 px phone content padding, "Second image caption" field, empty-link build fix)
   was **merged on 2026-11-02 (`84ab069`)**. Since then Caspar has saved Sabrina's caption from
   `/admin` twice (`ff968bc`, `001c2c7`), so Tina Cloud has indexed the new schema. The caption is
   still a placeholder: "Image features …, 2017. Photo by …CAPTIONS HERE!!!".
   PR #2 (round 1) was merged on 2026-10-30. Sabrina's text was cleaned up earlier: it appears
   once, with `###` sub-headings.
2. The deploy runs after the PR #3 merge were **not checked this session** (the GitHub connector
   was unavailable). Locally, `origin/main` builds (the empty Links item that broke run #35 is
   now ignored).
3. This fix is code-complete on `claude/caption-italics`: `npm run build:site` and
   `npx astro check` pass with 0 errors, 0 warnings, 0 hints. Checked in headless Chromium at
   1512×982 and 390×844 (see "Verified"). The GitHub connector was unavailable, so **no PR has
   been opened yet**. Open it from GitHub's "Compare & pull request" banner for
   `claude/caption-italics`.

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
    `btsImage` is set and the caption is non-empty after trimming. `--fs-caption` (14 → 18 px,
    one step below the body text), left-aligned, paragraphs without margins; italics only where
    the editor set them (`<em>` → `oblique 12deg`, the font's own slanted design).
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

Italics and bold: `html { font-synthesis: none }`, so the browser never fakes bold or italic.
Every slanted text sets `font-style: oblique 12deg` explicitly: sub-headings, the "Currently on
view" label, the phone header, and (new) `.prose em, .prose i`, i.e. italics from the editor in
artist texts and captions. Weights used: 400, 500, 700, all inside the font's 400–700 range.

Type tokens:

| Token | Phone → desktop | Used for |
| --- | --- | --- |
| `--fs-landing-title` | 40 → 84 px | landing title |
| `--fs-landing-dates` | 24 → 64 px | landing dates line |
| `--fs-landing-presenting` | 20 → 48 px | "Presenting…" line |
| `--fs-label` | 24 → 48 px | "Currently on view" |
| `--fs-heading` | 32 → 48 px | artist name/period, list headings, 404 |
| `--fs-subheading` | 20 → 32 px | sub-headings in the text |
| `--fs-row` | 16 → 32 px | list rows |
| `--fs-body` | 16 → 24 px | body text |
| `--fs-caption` (new) | 14 → 18 px (`clamp(14px, 1.19vw, 18px)`) | second-image caption |
| `--fs-credits` | 16 → 28 px | credits line |
| `--fs-header` | 12 px → `clamp(14px, 1.323vw, 20px)` | header pills |

Spacing tokens:

| Token | Phone | Desktop (≥ 48rem) | Used for |
| --- | --- | --- | --- |
| `--gutter` | 5px | 20px | fixed header (pills), skip link, loading overlay padding |
| `--content-gutter` | 20px | `var(--gutter)` (20px) | horizontal padding of `.section` (artist block, lists + credits, 404) and `.landing` |
| `--feature-col` | — | 710px | width of the artist column |
| `--col-gap` | 20px | 20px | header grid, lists columns |

Desktop rendering is unchanged by `--content-gutter`.

### Content collections (Tina ⇄ Astro, same files)

| Collection | Type | Files | Fields |
| --- | --- | --- | --- |
| `site` | singleton | `content/site/settings.json` | siteTitle, tagline, socialLinks[] {label, url} (*unused*), footerText ("Credits line") |
| `exhibition` | singleton | `content/exhibition/current.md` | title, datesLine, startDate, endDate, venue, presentingPrefix, currentLabel, logo (overlay + `og:image`) |
| `artists` | list | `content/artists/*.md` (filename = slug) | name, status (current / upcoming / previous), period (free text), order, imageSide (left / right — *unused by the layout*), mainImage, body (rich-text, "Text"), btsImage ("Second image"), btsCaption ("Second image caption"), links[] {label, url} |

Schema changes in round 2 (none in the caption/italics fix):
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

### Verified — caption/italics fix (headless Chromium 153, 1512×982 and 390×844)

- Test caption (not committed) "Image features *“Hands at Work Video”*, 2017. Photo by **Joshua
  White** Photography.": the caption computes to 18 px (desktop) / 14 px (phone). Its `<em>`
  computes to `font-style: oblique 12deg`, its `<strong>` to weight 700; `font-synthesis: none`.
- Before/after screenshots compared pixel by pixel. Everything above the caption, the
  lists/credits below it, `/artists` (header pills included), landing, title and sub-headings:
  **identical**. The landing label stays `oblique 12deg`.
- Only other change: existing italics in artist texts (e.g. *LIFE ON VENUS – Celestial Body* on
  Boom! Glass Group) are now slightly less slanted. Before, `<em>` (`font-style: italic`) got the
  browser's fake slant on top of the font's own; side by side with an explicit
  `oblique 12deg` sample, the new rendering is the font's real design.
- No console errors.

### Verified — round 2 (headless Chromium 153, 1512×982 and 390×844, test content not committed)

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

1. **Open and merge the PR for `claude/caption-italics`**: GitHub → the repo → the yellow
   "claude/caption-italics had recent pushes — Compare & pull request" banner (or Pull requests
   → New pull request → base `main`, compare `claude/caption-italics`) → Create pull request →
   Merge. Then Actions → the new "Deploy to GitHub Pages" run → check it is green. No schema
   change this time.
2. Also check that the runs after the round-2 merge (2026-11-02, "Merge pull request #3" and the
   two "TinaCMS content update" runs) are green.
3. In `/admin` → **Sabrina Gschwandtner**:
   - **Second image caption:** replace the placeholder ("Image features …, 2017. Photo by
     …CAPTIONS HERE!!!") with the real credit, e.g. "Image features “Hands at Work Video”,
     2017. Photo by Joshua White Photography." Select the work title and press the italic
     button. Save.
   - **Text:** delete the last line ("Image features … Photo by Joshua White Photography.") so it
     isn't shown twice.
   - **Links:** delete the empty item (trash icon) or fill in label + URL.
4. Check https://thespacecraft.se: the caption is smaller than the text and its italic title is
   slanted.
5. Ongoing: Artists → Period: use the "6 – 13 Nov" form consistently; replace "Text coming soon."
   and upload images when available. When an exhibition ends: set that artist's **Status** to
   *Previous* and the next one to *Current* (only one *Current* at a time; the lowest **Sort
   order** wins). Put a sub-heading after the first paragraph(s) of each text: that's where the
   main image goes.

## In progress

- Nothing. The caption/italics branch is waiting for its PR (step 1 above).

## Next steps

1. Open and merge the PR, check the deploys, fill in the real caption.
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

- **Deploy status after the round-2 merge not verified** in this session (GitHub connector
  unavailable); see Status 2.
- **`/admin` commits since 2026-11-01 are authored by `tinacloud-app[bot]`**, not a person. With
  "act as self", Tina falls back to the bot when the editor's GitHub account can't write to the
  repo; most likely the second editor has no access to `BromsC/spacecraft-site`. Saving works.
  If attribution matters: GitHub → repo Settings → Collaborators → add their account (Write).
- **`:has()` required** for the image position (all current browsers). Older browsers show the
  text in order with the main image above it.
- **Figma not read in round 2** (as instructed); the layout follows Caspar's screenshots as
  described in that task.
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
- `main` head: `001c2c7` ("TinaCMS content update", 2026-11-02 12:00 +01:00). PR #3 merge:
  `84ab069` (2026-11-02 11:08 +01:00). Run results after run #35 (failed, empty link item, fixed
  by PR #3) were not checked this session. PR #2 merge: `4c869a2` (2026-10-30).
- Deploy runs: https://github.com/BromsC/spacecraft-site/actions
