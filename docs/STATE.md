# STATE — current status (handoff document)

## Last updated

2026-11-10 — Two small fixes (Claude Code), no schema or content change:
1. Empty lines left in the `/admin` editor show on the site as exactly one blank line
   (`src/lib/blank-lines.ts`, a Sätteri Markdown step, plus a few CSS rules); paragraphs
   otherwise stay margin-less. Commit `110b57b`, pushed to `main`.
2. Sub-headings in artist texts are bold and **upright** (no forced oblique), as the editor shows
   them; a heading is italic only where the editor sets italic. CSS only. Commit
   `fix: upright sub-headings, italic only from the editor`.

## Status summary

1. **Live:** https://thespacecraft.se. PR #3 (design-fix round 2: centred single-column artist
   block, 20 px phone padding, "Second image caption" field, empty-link fix) merged 2026-11-02
   (`84ab069`). PR #4 (caption size `--fs-caption` + real italics) merged 2026-11-10
   (`c55c1b1`). Both are live (per Caspar).
2. **Today's fixes** are on top of `c55c1b1`: empty lines `110b57b`, then the heading fix on top
   of `110b57b`. `npm run build:site` and `npx astro check` pass with 0 errors, 0 warnings,
   0 hints; both checked in headless Chromium at 1512×982 and 390×844 (see "Verified").
   **Sub-headings that should be italic now need the italic button in `/admin`** (see "What
   Caspar must do").
3. **Content (from `/admin`, 2026-11-06 … 11-09):** Boom! Glass Group is now *current*
   (6 – 13 November), Sabrina Gschwandtner *previous*. Roni Kaufman has images + caption.
4. **Broken image on Sabrina's page:** her second image file
   `/uploads/Photo-Joshua_White-jwpictures.com-9991.jpg` was deleted from the repo by a Tina
   media action (`edeab6d`, 2026-11-09) but her **Second image** field still points to it → 404
   on `/artists/sabrina-gschwandtner` (the only console error on the site). See "What Caspar must
   do".

## What the empty-lines fix found and does

What Astro 7's Markdown processor (Sätteri) makes of Tina's empty lines, checked in the built
HTML of `origin/main`:

| In the Markdown file | Built HTML before the fix | On screen before |
| --- | --- | --- |
| `\` line directly followed by text (all of Boom's and Sabrina's `\` lines) | `<p><br>We seek…</p>` | one blank line — already worked |
| `\` alone between blank lines | `<p>\</p>` | a literal backslash |
| two `\` lines then text | `<p><br><br>Text</p>` | two blank lines |
| `&#x20;` paragraph (Sabrina, between the two works) | `<p> </p>` | **nothing** (0 px) |
| `text \` + next line (credits) | `text <br>next` | hard line break — correct |

So on `main`, Boom's "About BOOM!" / "Om BOOM!" gaps were already rendered (a leading `<br>`),
but Sabrina's gap between "…hand-colored films." and "Hands at Work Video" was missing, and a
lone `\` paragraph would have shown a backslash. (https://thespacecraft.se was not reachable from
the sandbox, so the live HTML itself was not compared.)

Now every empty line, whatever form Tina saved it in, becomes its own
`<p class="blank-line"><br></p>`: exactly one line of body text tall (26 px desktop, 17 px phone,
same as a one-line paragraph). Rule: each `\` on its own line (or each whitespace-only paragraph)
= one blank line; two = two. A `\` at the end of a text line stays a line break. No backslash can
reach the page. In the artist block, blank lines are not shown at the start/end of the text or
directly above/below the main image (the layout already has a gap there). Details: DECISIONS
2026-11-10.

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

- `src/layouts/Layout.astro` — `<head>`: title, description, canonical, Open Graph (`og:image` =
  exhibition logo if set), `twitter:card`, `theme-color` #ffffff, font preload, `js` class on
  `<html>`. Then `SiteHeader` and `<main>`.
- `src/components/SiteHeader.astro` — fixed header, three white "pill" links: title (left), dates
  line (centre), venue (right). Home: hidden while `#landing` is in view, fades in (300 ms)
  after; all three link to `#top`. Other pages: always visible; the title links to `/`. Phone
  (< 48rem): title at the top, dates + venue in a fixed line at the bottom, 12 px Medium Italic,
  5 px from the edge.
- `src/components/ArtistFeature.astro` — the artist block, used by `#current` and
  `/artists/[slug]` (same output). **One centred column on every viewport, no floats, no JS.**
  - DOM: main image, second image, caption, title (name + period), `.feature__body.prose` (the
    rendered Markdown), `.feature__extra` (slot: links + "← Home"; only if the slot has content).
  - `.feature` is a one-column grid; `.feature__body` is `display: contents`, so each paragraph,
    blank line and heading is its own grid item. Visual order via CSS `order`:
    1 title · 2 intro (text before the first sub-heading) · 3 main image · 4 rest of the text ·
    5 second image · 6 caption · 7 links / back link. Intro selected with `:has()`; without a
    sub-heading the main image goes after the first paragraph (blank lines before it don't
    count).
  - **Blank lines** (`.blank-line`, from `src/lib/blank-lines.ts`): one line tall, no CSS height.
    Hidden at the start of the text, at the end, at the end of the intro (above the main image)
    and, without a sub-heading, right below the main image.
  - Desktop (≥ 48rem): column `min(100%, var(--feature-col))` (710 px), centred; title
    left-aligned. Gaps: title → intro `clamp(32px, 6.3vw, 95px)`; main image 26 px above and
    below (square, full column width); second image 26 px below the text (720 / 822); caption
    8 px below it.
  - Phone: same order. Title centred, 17 px to the intro; main image 133 px square, centred,
    26 px above/below; second image full column width, 26 px below the text; caption 8 px below.
  - Sub-headings (`.prose h1`–`h6`, all levels alike): `--fs-subheading` (20 → 32 px), bold,
    **upright**; italic only where the editor set it (`<h3><em>…</em></h3>` → `oblique 12deg`).
    First sub-heading: top margin 0 (the image's 26 px is the gap); later ones `1em` top /
    `0.3em` bottom.
  - Caption (`.feature__caption.prose`): `btsCaption` rendered to inline HTML (`marked`), only if
    `btsImage` is set and the caption is non-empty. `--fs-caption` (14 → 18 px), left-aligned,
    italics as `oblique 12deg`.
- `src/components/ExhibitionLists.astro` — headings + rows: underlined name link → blue arrow →
  period. Empty group → one placeholder row `"..."`. Credits line (`footerText`) centred at the
  bottom of the section (at least one screen tall). Phone: Upcoming → Previous → credits.
- `src/components/Arrow.astro` — inline SVG arrow, `direction` `right|down`, accent colour.
- Loading overlay (`index.astro`): white layer with the logo; after the logo loads (max 2 s) it
  stays 800 ms, fades 500 ms, is removed. Reduced motion → removed at once. JS only.
- `src/lib/content.ts` — data helpers + `renderCaption()` (`marked.parseInline`, blank-line
  separated blocks wrapped in `<p>`).
- `src/lib/blank-lines.ts` (new) — the Sätteri mdast step for editor empty lines (see above).
- `astro.config.mjs` — `markdown.processor: satteri({ mdastPlugins: [blankLines] })`; otherwise
  Sätteri's defaults (same output as before apart from the blank lines — compared file by file).

### Design tokens (`src/styles/global.css`)

White background, black text, one accent `--color-accent: #0000ff` (arrows only). Font: ABC Areal
Superfamily Variable, self-hosted `public/fonts/ABCArealSuperfamilyVariable.woff2` (`wght`
400–700, `slnt` 0…−12), declared as `normal` and `oblique 12deg`. `html { font-synthesis: none }`;
every slanted text sets `oblique 12deg` explicitly ("Currently on view", phone header,
`.prose em/i` — editor italics, also inside sub-headings). Sub-headings themselves are upright. Type sizes `clamp(phone, vw, desktop)`. Breakpoint 48rem (768 px).
**Paragraphs have no margins** (`p`, `.prose p { margin: 0 }`): a new paragraph is a new line;
only editor empty lines make gaps.

| Token | Phone → desktop | Used for |
| --- | --- | --- |
| `--fs-landing-title` | 40 → 84 px | landing title |
| `--fs-landing-dates` | 24 → 64 px | landing dates line |
| `--fs-landing-presenting` | 20 → 48 px | "Presenting…" line |
| `--fs-label` | 24 → 48 px | "Currently on view" |
| `--fs-heading` | 32 → 48 px | artist name/period, list headings, 404 |
| `--fs-subheading` | 20 → 32 px | sub-headings in the text |
| `--fs-row` | 16 → 32 px | list rows |
| `--fs-body` | 16 → 24 px | body text (and blank-line height) |
| `--fs-caption` | 14 → 18 px | second-image caption |
| `--fs-credits` | 16 → 28 px | credits line |
| `--fs-header` | 12 px → `clamp(14px, 1.323vw, 20px)` | header pills |

| Spacing token | Phone | Desktop | Used for |
| --- | --- | --- | --- |
| `--gutter` | 5px | 20px | fixed header, skip link, loading overlay |
| `--content-gutter` | 20px | 20px | `.section` and `.landing` side padding |
| `--feature-col` | — | 710px | artist column width |
| `--col-gap` | 20px | 20px | header grid, list columns |

### Content collections (Tina ⇄ Astro, same files)

| Collection | Type | Files | Fields |
| --- | --- | --- | --- |
| `site` | singleton | `content/site/settings.json` | siteTitle, tagline, socialLinks[] {label, url} (*unused*), footerText ("Credits line") |
| `exhibition` | singleton | `content/exhibition/current.md` | title, datesLine, startDate, endDate, venue, presentingPrefix, currentLabel, logo |
| `artists` | list | `content/artists/*.md` (filename = slug) | name, status (current / upcoming / previous), period, order, imageSide (*unused*), mainImage, body ("Text"), btsImage ("Second image"), btsCaption ("Second image caption"), links[] {label, url} |

Fields: landing title = `title`; landing dates = `datesLine` + ". " + `venue` + "."; "Presenting…"
= `presentingPrefix` + all artist names by `order`; `#current` = first artist (by `order`) with
status `current` (none → arrow and `#current` left out); lists filtered by `status`, sorted by
`order`. Incomplete link items are dropped (zod), not build errors. Tina schema version 4.0.1.

Current content: "Out of This World! Exhibition Festival of Contemporary Craft and Innovation.",
30 October – 11 December 2026, Jan Stenbecks torg, Kista; logo `/uploads/LOGO.png`. Artists by
order: Sabrina Gschwandtner (previous, 30 October – 6 November), **Boom! Glass Group (current,
6 – 13 November)**, Roni Kaufman (upcoming, November 13th; main + second image, caption), Helene
Kask (November 20th), Maria Pita Guerreiro (November 27th), Joanne Grüne Yanoff (December 4th).

### Verified — upright sub-headings (headless Chromium, 1512×982 and 390×844)

- Home `#current` (Boom! Glass Group): "LIFE ON VENUS – Celestial Body", "About BOOM!", "Om BOOM!"
  compute `font-style: normal`, weight 700, 32 px / 20 px, margins unchanged (first 0, later
  `1em` top, `0.3em` bottom). `/artists/sabrina-gschwandtner`: "About the works:", "About the
  artist:" the same.
- Test text (not committed): `### *Italic heading*` → `<h3><em>`, `oblique 12deg` / 700, the
  font's own slanted face; `### ***Bold italic heading***` → `<em><strong>`, `oblique 12deg`,
  `<strong>` computes 900, clamped to the font's 700 — looks identical to the italic-only one;
  `### Upright heading` upright. `font-synthesis: none`.
- Unchanged: "Currently on view" `oblique 12deg`; header pills `oblique 12deg` on phone, `normal`
  on desktop; artist title upright bold; italics in body text `oblique 12deg`.
- Console: only the 404 for Sabrina's deleted second image (Status 4), no script errors.

### Verified — empty-lines fix (headless Chromium, 1512×982 and 390×844)

- Home `#current`, "About BOOM!": "…chosen craft." / blank line / "We seek…promoted." / blank
  line / "As a group…collaborations." then "BOOM! is a platform…", "We see a need…" each directly
  under the previous, no gaps. "Om BOOM!" the same. Blank lines 26 px (desktop) / 17 px (phone),
  equal to a one-line paragraph.
- `/artists/sabrina-gschwandtner`: credits' hard breaks intact ("“Hand-painted Serpentine
  Dance”, 2021." / "4k video…" on two lines); blank lines after each credit block and, newly,
  between "…hand-colored films." and "“Hands at Work Video”, 2017.".
- Throwaway test texts (not committed), every case from the table above plus: two `\` lines, two
  `&#x20;` paragraphs, `text \` + `\`, `\` at the end of a paragraph, `a \` / `\` / `b`, blank
  lines before the intro / between intro and the first sub-heading / at the end, and a text
  without sub-heading. Result: right number of blank lines, no backslash anywhere; blank lines
  next to the main image, at the start and at the end hidden, image gaps stay exactly 26 px.
- Built HTML compared with a build of `origin/main`: only the three artist texts with empty
  lines differ (smart quotes etc. unchanged).
- Console: no script errors. The only console message is the 404 for Sabrina's deleted second
  image (Status 4, content, not code).

### Workflows

- `.github/workflows/deploy.yml` — on push to `main` and manual dispatch: `npm ci` →
  configure-pages → `npx tinacms build` (secrets set) → `npx astro build` → deploy to Pages.

**Operational rule — how to redeploy:** Actions → "Deploy to GitHub Pages" → **Run workflow**
(on `main`). Never "Re-run all jobs" on an old run (it redeploys that run's old commit).

## What Caspar must do (browser only)

1. Actions → the newest "Deploy to GitHub Pages" runs (after `110b57b` and the heading fix) →
   check they are green.
2. **Italic sub-headings** (they are now upright unless the editor marks them): `/admin` →
   **Sabrina Gschwandtner** → **Text** → select the heading text "About the works:" → italic
   button; the same for "About the artist:" and any other heading that should be italic (e.g.
   Boom! Glass Group's "LIFE ON VENUS – Celestial Body", "About BOOM!", "Om BOOM!" if wanted) →
   Save. Then reopen the entry in the editor and check the heading is still italic (Tina keeps it
   as `### *…*`); on the site it shows slanted after the deploy.
3. Check https://thespacecraft.se → scroll to Boom! Glass Group → "About BOOM!" and "Om BOOM!"
   look like the intended layout; https://thespacecraft.se/artists/sabrina-gschwandtner has a
   gap between the two works.
4. **Sabrina's second image is missing:** `/admin` → Sabrina Gschwandtner → **Second image** →
   upload/choose the Joshua White photo again (it was deleted from Media on 2026-11-09) → Save.
   Or clear the field if it should go.
5. In Sabrina's **Text**, the last line ("Image features … Photo by Joshua White Photography.")
   repeats the caption — delete it if it shouldn't be shown twice. **Links:** delete the empty
   item (trash icon) or fill it in.
6. Ongoing: to make a gap in a text, leave one empty line (two for a bigger gap); a new paragraph
   without an empty line starts directly on the next line. When an exhibition ends: its
   **Status** → *Previous*, the next → *Current* (one *Current*; lowest **Sort order** wins). Put
   a sub-heading after the intro of each text: that's where the main image goes.

## In progress

- Nothing. Waiting on Caspar's `/admin` edits (italic headings, Sabrina's image).

## Next steps

1. Check today's deploys, italicise the sub-headings that should be italic, restore Sabrina's
   second image.
2. Unpin `@tinacms/cli` / remove the `@tinacms/graphql` override, regenerate
   `tina/tina-lock.json`, verify CI's Tina step (own session, on a green `main`).
3. Later: first light visual as a client-only island in `src/components/visual/`.

## Open questions for Caspar

- **Image cropping:** main image square, second image 720 × 822. OK, or show whole artworks?
- **Social links:** `socialLinks` exists in Site settings but isn't shown. Keep or drop?
- **`/artists` page:** nothing links to it. Keep as a hidden overview, or remove?
- **Drop `imageSide`?** It no longer does anything. Remove from both schemas and the content?
- **Loading overlay on phone:** logo keeps 5 px side padding. Should it be 20 px?
- **Blank lines in captions:** the second-image caption (rendered with `marked`) doesn't get the
  empty-line handling; a blank line there separates paragraphs without a gap. Needed?

## Known issues

- **Sabrina's second image 404s** (Status 4).
- **`/admin` commits are authored by `tinacloud-app[bot]`**: with "act as self", Tina falls back to
  the bot when the editor's GitHub account can't write to the repo. Saving works. If attribution
  matters: GitHub → repo Settings → Collaborators → add their account (Write).
- **`@astrojs/markdown-satteri` is pinned to `0.4.4`**, the version `astro` 7.4.1 uses. Bump it
  together with `astro`, or two copies end up installed.
- **`:has()` required** for the image position and for hiding blank lines next to images (all
  current browsers). Older browsers show the text in order with the main image above it, and all
  blank lines.
- **`scroll-margin-top` deliberately not added** to `#current` / `#exhibitions` (see DECISIONS).
- **Font path:** `@font-face` uses `/fonts/…` (root-relative) — fine on the custom domain.
- **Tina packages are pinned:** `@tinacms/cli` `4.0.3` + `overrides` `@tinacms/graphql` `4.0.1`.
  Don't let Dependabot/`npm update` bump these until next step 2.
- **`www` certificate:** if https://www.thespacecraft.se shows a certificate error: Settings →
  Pages → Custom domain → **Remove**, re-enter `thespacecraft.se` → Save, wait for the DNS check,
  tick "Enforce HTTPS" again.
- `npm install` warns that `react-final-form` (inside `tinacms`) wants React ≤18; harmless.
- `npm audit` reports advisories in transitive dependencies of the Tina CLI (build-time only).

## Environment / secrets status

| Item | Status |
| --- | --- |
| GitHub Pages source = "GitHub Actions" | ✅ done |
| Custom domain in Settings → Pages | ✅ `thespacecraft.se` set, DNS check successful |
| Enforce HTTPS | ✅ ticked |
| GoDaddy DNS → GitHub Pages | ✅ pointed (records below) |
| Tina Cloud project | ✅ "spacecraft-site" in Caspar's org; GitHub app on `BromsC/spacecraft-site` only; branch `main` indexed |
| Tina Cloud site URLs | ✅ `https://bromsc.github.io`, `https://thespacecraft.se` |
| Tina Cloud git authoring | ✅ "act as self" (falls back to `tinacloud-app[bot]`) |
| Tina Cloud plan | ✅ Free — 2/2 users (second editor added 2026-11-01, role Editor) |
| Repo secret `TINA_CLIENT_ID` | ✅ set |
| Repo secret `TINA_TOKEN` | ✅ set (Content read-only token, branches `*`) |

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

Deleted during setup: GoDaddy's "Parked" A record and the old `www` → `thespacecraft.se` CNAME.
No forwarding rules. Untouched: `_dmarc` TXT, `_domainconnect` CNAME.

## Deploy URL

- Production: https://thespacecraft.se (admin: https://thespacecraft.se/admin/)
- https://bromsc.github.io/spacecraft-site/ → redirects to the domain.
- `main`: `c55c1b1` (PR #4 merge, 2026-11-10) → `110b57b` (empty lines) → the heading fix. PR #3
  merge `84ab069` (2026-11-02), PR #2 `4c869a2` (2026-10-30). Deploy runs were not checked this
  session.
- Deploy runs: https://github.com/BromsC/spacecraft-site/actions
