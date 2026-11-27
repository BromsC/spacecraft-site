# STATE — current status (handoff document)

## Last updated

2026-11-27 — **Artist sound** (Claude Code): optional looping sound per artist (Tina field
"Sound"), with a "Sound on / Sound off" toggle. Branch `claude/fervent-bardeen-dico7g`, pull request
[#6](https://github.com/BromsC/spacecraft-site/pull/6) into `main`, **not merged yet**. No artist has a sound yet. Details: DECISIONS 2026-11-27
(three entries).

Before that: 2026-11-10 editor rework (PR #5, merged): one text rule in `/admin` and on the site.

## Sound (plain words)

- **Adding a sound in `/admin`:** Artists → the artist → field **"Sound (loops while the page is
  open)"** (below "Second image caption") → click the field → the media manager opens →
  **Upload** → choose an **mp3** or **m4a** file (keep it small, about 1–3 MB) → click the file
  in the list → **Save**. Dragging the file straight onto the field also works. Picking an image
  by mistake shows "Choose an mp3 or m4a file." and Save stays greyed out. To remove the sound:
  the bin icon next to the file name → Save.
- **Where it plays:** on that artist's page (`/artists/<name>`), and on the home page in the
  "Currently on view" block while that block is on screen (fades out when you scroll away). It
  loops until the visitor leaves or switches it off.
- **In the browser:** sound starts after the visitor's first click or tap anywhere on the page;
  iPhones always need a tap. Until then the pill in the bottom-right corner says **"Sound off"**;
  tapping it turns sound on, tapping again turns it off. "Off" is remembered while the browser
  tab stays open: later pages then stay silent until switched on again. Switching to another tab
  pauses the sound; coming back resumes it. Without a sound in the field there is no pill and
  nothing is downloaded. On an iPhone with the silent switch on, the automatic start stays
  silent; pressing "Sound on" plays anyway.

## The text rule (plain words)

- **Enter** starts a new paragraph. A paragraph always has **exactly one blank line** above it
  (one line of text tall: 26 px on desktop, 17 px on a phone).
- **Shift+Enter** starts a new line directly underneath, **no gap** (for work credits, names).
- There is no "empty line" trick any more. Pressing Enter twice does not make a bigger gap: Tina
  does not save an empty paragraph. The editor now labels it "empty paragraph: not saved".
  A Shift+Enter at the very end of a paragraph is not saved either.
- Tools in **Text**: paragraph, line break, sub-heading, bold, italic (also inside a
  sub-heading), link, bullet list. In **Second image caption**: italic and link.
- The same rule holds in the caption.
- **Pasting** (Google Docs, Word): the editor pastes plain text. Every line becomes a paragraph
  with one blank line above it; bold, italic, links, headings and lists must be re-applied in the
  editor.

## Status summary

1. **Live:** https://thespacecraft.se. `main` = PR #5 (editor rework, 2026-11-10) plus content
   commits from `/admin` up to `ee35242` (2026-11-26; deploy run 140 green). The sound feature is
   on branch `claude/fervent-bardeen-dico7g` until its pull request is merged.
2. `npm run build:site`, `npx astro check` (0 errors, 0 warnings, 0 hints), `npm run test:text`
   (all pass) and `npm run test:sound` (all pass) pass.
3. **The editor in `/admin` is restyled** (site font, 710 px column, same gaps). This was tested
   in Tina's local mode in the sandbox, **not on the live Tina Cloud admin**: see "What Caspar
   must do".
4. **Content:** Helene Kask *current* (20 – 27 November); Sabrina, Boom! Glass Group, Roni
   Kaufman *previous*; Maria Pita Guerreiro, Joanne Grüne Yanoff *upcoming*. No sounds.
5. **Still broken:** Sabrina's second image file
   `/uploads/Photo-Joshua_White-jwpictures.com-9991.jpg` was deleted from the repo by a Tina
   media action (`edeab6d`, 2026-11-09) but her **Second image** field still points to it → 404
   on `/artists/sabrina-gschwandtner`.
6. **The tag `pre-editor-rework` could not be pushed** from the sandbox (the git gateway drops
   tag pushes). The same commit (`77102c8`, `main` before the rework) is kept as the **branch**
   `pre-editor-rework` instead.

## What changed on each artist page (editor rework, 2026-11-10)

| Page | File edited? | Change on the page |
| --- | --- | --- |
| Sabrina Gschwandtner | yes, structure only | None in layout: same text, same gaps, pixel-identical to before at 1512×982 and 390×844 (before the smoother line breaks, below). |
| Boom! Glass Group (also `#current` on the home page) | yes, structure only | None in layout: pixel-identical as above. |
| Roni Kaufman | no | One blank line now between "…the human hand." and "Visitors are invited…", and between "…in our societies." and "He is a graduate…". Page 52 px taller on desktop, 34 px on phone. |
| Helene Kask | no | One blank line between the three paragraphs under "Talismanic Bodies" (2 gaps) and under "Talismaniska kroppar" (2 gaps). +104 px desktop, +68 px phone. |
| Maria Pita Guerreiro | no | One blank line before "The project explores…", before "● Heliophile…" and before "She has participated…". +78 px desktop, +51 px phone. |
| Joanne Grüne Yanoff | no | None (one paragraph). |

In the two edited files no character of the text changed: lines that had no gap between them are
now joined with a line break, and each old "empty line" is now a paragraph boundary.
**Smoother line breaks** (`text-wrap`, separate commit) then moved some line ends on all pages in
browsers that support it (no single word alone on a last line; evenly broken headings).

## Rollback (sound)

- One artist: `/admin` → the artist → Sound → bin icon → Save (no pill, nothing downloaded).
- The whole feature: GitHub → the merged "artist sound" pull request → **Revert** → merge. A
  `sound:` line left in an artist file does no harm afterwards (the site ignores fields it
  doesn't know); clear the Sound fields first anyway to keep the files tidy.

## Rollback (editor rework)

1. GitHub → Pull requests → Closed → **#5** → **Revert** → Create pull request → Merge. The site
   redeploys with the old rules.
2. The exact pre-rework commit is the branch **`pre-editor-rework`** (`77102c8`; the tag of that
   name could not be pushed, see Status 6).
3. Caveat: texts saved in `/admin` **after** the merge are written for the new rule. Under the
   old rules their paragraphs have no gaps until each is opened in `/admin`, given empty lines
   again and saved.

## What exists

### Routes

| Route | Source | Content |
| --- | --- | --- |
| `/` | `src/pages/index.astro` | Loading overlay (logo, only if set) → `#landing` (title, dates + venue, "Presenting…" line, "Currently on view" + down arrow) → `#current` (current artist block) → `#exhibitions` (Previous / Upcoming lists + credits line). Sound toggle if the current artist has a sound (plays only while `#current` is in view). |
| `/artists` | `src/pages/artists/index.astro` | "Currently on view:", "Previous exhibitions:", "Upcoming exhibitions:" lists + credits line. Not linked from anywhere, but kept. |
| `/artists/[slug]` | `src/pages/artists/[slug].astro` | Artist block + links + "← Home". Sound toggle if the artist has a sound. |
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
    list and heading is its own grid item. Visual order via CSS `order`:
    1 title · 2 intro (text before the first sub-heading) · 3 main image · 4 rest of the text ·
    5 second image · 6 caption · 7 links / back link. Intro selected with `:has()`; without a
    sub-heading the main image goes after the first paragraph.
  - **Paragraph gaps:** one line between neighbouring paragraphs/lists (`.prose` rule, margin on
    top only). The element right after the main image has no top margin, so the image keeps
    exactly 26 px above and below; no gap at the start or end of the text.
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
  - Caption (`.feature__caption.prose`): `btsCaption` rendered by the same Markdown processor
    as the text (paragraphs with inline formatting only), only if `btsImage` is set and the
    caption is non-empty. `--fs-caption` (14 → 18 px), left-aligned, italics as `oblique 12deg`,
    one caption line between paragraphs.
  - Bullet lists: body size, `disc` bullets, hanging indent, no gap between items.
- `src/components/ExhibitionLists.astro` — headings + rows: underlined name link → blue arrow →
  period. Empty group → one placeholder row `"..."`. Credits line (`footerText`) centred at the
  bottom of the section (at least one screen tall). Phone: Upcoming → Previous → credits.
- `src/components/Arrow.astro` — inline SVG arrow, `direction` `right|down`, accent colour.
- `src/components/visual/ArtistSound.astro` — the artist's looping sound + toggle. Rendered only
  when the artist has `sound` (otherwise no markup, no script). Web Audio (fetch →
  `decodeAudioData` → looping `AudioBufferSourceNode` → `GainNode`, 300 ms fades), `<audio loop>`
  fallback. Props `src`, `scope` (home: `"current"` → plays while `#current` covers the middle
  half of the screen). Lazy: fetch at idle (artist page) / when `#current` scrolls into view /
  on the first click. Autoplay tried; if refused, "Sound off" + the first click/tap/key starts
  it. `sessionStorage` `spacecraft:sound` = `on`/`off`. Pauses on hidden tab, stops on
  `pagehide`. Toggle CSS in `global.css` ("Sound toggle"): fixed pill, bottom right (16 px from
  the bottom on desktop; on a phone directly above the dates/venue line), `<button
  aria-pressed>`, accessible name "Sound", hidden without JS.
- Loading overlay (`index.astro`): white layer with the logo; after the logo loads (max 2 s) it
  stays 800 ms, fades 500 ms, is removed. Reduced motion → removed at once. JS only.
- `src/lib/content.ts` — data helpers + async `renderCaption()` (Sätteri via
  `@astrojs/markdown-satteri`, smart punctuation off).
- `src/lib/blank-lines.ts` — Sätteri mdast steps: `blankLines` (safety net: whitespace-only
  paragraph or lone `\` → one empty line, trailing `\` dropped, U+2028/U+2029/U+000B → dropped
  at a line end, line break inside text), `inlineOnly` (caption), `captionOptions`.
- `astro.config.mjs` — `markdown.processor: satteri({ mdastPlugins: [blankLines] })`.
- `tina/rich-text.ts` — the two rich-text field definitions (`bodyField`, `captionField`) and
  the rule sentence; imported by `tina/config.ts` and by the test.
- `tina/admin.css` + `scripts/inject-admin-css.mjs` — editor styling for `/admin`, added to
  `public/admin/index.html` after the Tina build. Unsupported by Tina but fail-safe: on any
  problem it warns and leaves the admin as Tina built it.
- `scripts/text-test.mjs` (`npm run test:text`) — Tina round trip of every tool, all artist
  files byte for byte, and the site's rendering of the same fixtures.
- `scripts/content-report.mjs` — lists anything outside the tool set, with file and line.
- `scripts/sound-check.mjs` (`npm run test:sound`, after a build) — the toggle and its script are
  on exactly the pages whose artist has a sound (home: the current artist), built `hidden`;
  warns about a missing file, a type other than mp3/m4a, or a file over 3 MB.

### Design tokens (`src/styles/global.css`)

White background, black text, one accent `--color-accent: #0000ff` (arrows only). Font: ABC Areal
Superfamily Variable, self-hosted `public/fonts/ABCArealSuperfamilyVariable.woff2` (`wght`
400–700, `slnt` 0…−12), declared as `normal` and `oblique 12deg`. `html { font-synthesis: none }`;
every slanted text sets `oblique 12deg` explicitly ("Currently on view", phone header,
`.prose em/i` — editor italics, also inside sub-headings). Sub-headings themselves are upright. Type sizes `clamp(phone, vw, desktop)`. Breakpoint 48rem (768 px).
**Paragraphs** (`.prose`): no margin of their own; one line (`1lh`) between neighbouring
paragraphs and lists. `text-wrap: pretty` on paragraphs, `balance` on sub-headings and the artist
title (Chrome/Edge, Safari 26; `balance` also Firefox).

| Token | Phone → desktop | Used for |
| --- | --- | --- |
| `--fs-landing-title` | 40 → 84 px | landing title |
| `--fs-landing-dates` | 24 → 64 px | landing dates line |
| `--fs-landing-presenting` | 20 → 48 px | "Presenting…" line |
| `--fs-label` | 24 → 48 px | "Currently on view" |
| `--fs-heading` | 32 → 48 px | artist name/period, list headings, 404 |
| `--fs-subheading` | 20 → 32 px | sub-headings in the text |
| `--fs-row` | 16 → 32 px | list rows |
| `--fs-body` | 16 → 24 px | body text (one line = the paragraph gap) |
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
| `artists` | list | `content/artists/*.md` (filename = slug) | name, status (current / upcoming / previous), period, order, imageSide (*unused*), mainImage, body ("Text"), btsImage ("Second image"), btsCaption ("Second image caption"), sound ("Sound (loops while the page is open)": `/uploads/x.mp3`, optional; `""` = none), links[] {label, url} |

Fields: landing title = `title`; landing dates = `datesLine` + ". " + `venue` + "."; "Presenting…"
= `presentingPrefix` + all artist names by `order`; `#current` = first artist (by `order`) with
status `current` (none → arrow and `#current` left out); lists filtered by `status`, sorted by
`order`. Incomplete link items are dropped (zod), not build errors. Tina schema version 4.0.1.

Tina media: `media.tina` (`public/uploads`); uploads allowed = Tina's default list + mp3/m4a
(`media.accept`, made effective by `cmsCallback`, see DECISIONS 2026-11-27). The `sound` field
is an `image` field with `ui.validate` (mp3/m4a only).

Current content: "Out of This World! Exhibition Festival of Contemporary Craft and Innovation.",
30 October – 11 December 2026, Jan Stenbecks torg, Kista; logo `/uploads/LOGO.png`. Artists by
order: Sabrina Gschwandtner (previous, "30 October"), Boom! Glass Group (previous, "6 November"),
Roni Kaufman (previous, "13 November"), **Helene Kask (current, 20 – 27 November)**, Maria Pita
Guerreiro (upcoming, 27 November – 4 December), Joanne Grüne Yanoff (upcoming, 4 – 11
December). No artist has a sound.

### Verified — artist sound (2026-11-27)

- **Site (headless Chromium, on a copy of the project with a test tone set on two artists; the
  real content files were not touched):** without a click the pill shows "Sound off", nothing
  plays, no console error; after a click it plays, loops (past the 2 s file length, one source,
  never ended) and is audible; tab hidden → faded out and paused, visible → resumed; "Sound off"
  → silent, and on the next pages no download and no AudioContext even after clicks; keyboard
  Enter on the focused pill switches it on (focus ring visible); home page: nothing downloaded on
  the landing, plays when `#current` is on screen, fades out when scrolled to the top or to the
  lists, plays again when back; artist without sound: no pill, no script, no download; no
  JavaScript: no pill; `<audio>` fallback (Web Audio removed) incl. the browser's real
  `NotAllowedError`; `sessionStorage` blocked; missing file (404) → pill disappears, one warning.
  Phone 390 and 320 px: pill above the dates/venue line, no overlap; a tap starts it. mp3 and m4a.
  Headless Chromium doesn't enforce autoplay rules for Web Audio, so the browsers' rules were
  imitated in the test (iPhone-strict, Chrome, and "autoplay allowed"): all checks pass in each.
- **Tina local mode:** an mp3 dropped on the field and an m4a uploaded in the media manager both
  upload and can be chosen; an image is refused; Save writes `sound: /uploads/…`.
- **Not verified:** real iPhone / Safari / Firefox; an audio upload in the live Tina Cloud admin.

### Verified — editor rework (headless Chromium, 1512×982 and 390×844)

- **Gaps:** between paragraphs, before/after a list: 26.00 px desktop, 17.00 px phone (the old
  `.blank-line` height). Main image 26 px above and below, second image 26 px above, with a
  sub-heading, without one, and without images. No gap at the start or end of a text. Caption
  paragraphs 20 px apart on desktop. Sub-heading margins as before (first 0 after the image,
  later 1em top / 0.3em bottom).
- **Migration:** Sabrina's and Boom's pages and the home page: identical `textContent`, identical
  full-page screenshots against a build of old `main` (taken before the `text-wrap` commit).
- **Editor (Tina local mode):** toolbar buttons as specified; site font loaded; paragraphs one
  line apart, line breaks none; saved file and built page match the editor block for block. Real
  clipboard paste tested with Google Docs- and Word-shaped HTML (hand-written to those shapes).
- **Not verified here:** the live Tina Cloud admin (needs a login), and a paste from the real
  Google Docs / Word apps.

### Workflows

- `.github/workflows/deploy.yml` — on push to `main` and manual dispatch: `npm ci` →
  configure-pages → `npx tinacms build` → `node scripts/inject-admin-css.mjs` (both only with
  Tina secrets) → `npx astro build` → content report → text test → sound check (all three
  report-only, never fail the deploy; the reports are on the run's Summary page) → deploy to
  Pages.

**Operational rule — how to redeploy:** Actions → "Deploy to GitHub Pages" → **Run workflow**
(on `main`). Never "Re-run all jobs" on an old run (it redeploys that run's old commit).

## What Caspar must do (browser only)

**Sound (new):**

0. **Merge pull request #6** (GitHub → Pull requests → #6 "feat: optional looping sound per artist" → Merge), wait for
   the deploy (Actions, about 2 minutes).
1. **Try it once in the live admin:** https://thespacecraft.se/admin/ → Artists → any artist →
   **Sound** → click it → **Upload** → pick a small mp3 → click it → **Save**. Wait for the
   deploy, open that artist's page, click anywhere: the sound should start and the pill should
   say "Sound on". If the upload says "Invalid file type", say so in the Project chat (the live
   admin then needs a different fix than the local test showed). Remove it again (bin icon →
   Save) if it was only a test.
2. On an iPhone: open the page, tap once, check the sound and the "Sound on / off" pill.

**Earlier checklist (editor rework):**

1. **Check the editor:** open https://thespacecraft.se/admin/ → Artists → **Roni Kaufman**. The
   **Text** box should show the site's font in a narrower column, with a clear blank line between
   paragraphs. If it still looks like before, reload once with Ctrl+Shift+R (Cmd+Shift+R).
2. **Type test:** in any artist's **Text**, type a paragraph, press Enter, type a second one,
   press Shift+Enter, type a line → **Save** → wait for the deploy (Actions, about 2 minutes) →
   compare with the page on the site: same blank line, same line break. Remove the test text.
3. **Italic sub-heading:** select a sub-heading's text → italic button → Save → reload the admin
   page and open the artist again: the heading should still be italic.
4. **Paste test:** copy a few paragraphs from Google Docs, paste into **Text**, Save, compare
   with the site. Expect plain text: one blank line between paragraphs, formatting gone.
5. **Look at Roni, Helene and Maria** on the site: their paragraphs now have gaps. If two lines
   should sit directly under each other, join them in the editor with Shift+Enter.
6. **Sabrina's second image is missing:** `/admin` → Sabrina Gschwandtner → **Second image** →
   upload/choose the photo again → Save. Or clear the field.
7. In Sabrina's **Text**, the last line repeats the caption: delete it if it shouldn't show
   twice. **Links:** delete the empty item (trash icon) or fill it in.
8. Ongoing: when an exhibition ends, its **Status** → *Previous*, the next → *Current*. Put a
   sub-heading after the intro of each text: that's where the main image goes.

If anything in the editor looks wrong, nothing is lost: the styling is cosmetic and the saved
text is unaffected. Say so in the Project chat, or roll back (above).

## In progress

- Artist sound: PR [#6](https://github.com/BromsC/spacecraft-site/pull/6) open, waiting for merge and Caspar's live check (above).

## Next steps

1. Caspar's checklist; fix whatever the live admin shows differently from the local test
   (editor styling, audio upload).
2. Unpin `@tinacms/cli` / remove the `@tinacms/graphql` override, regenerate
   `tina/tina-lock.json`, verify CI's Tina step (own session, on a green `main`). After any Tina
   update: run `npm run test:text` and re-check the editor styling.
3. Later: first light visual as a client-only island in `src/components/visual/`.

## Open questions for Caspar

- **Sound pill on the home page:** it shows from the start (also over the landing), because the
  page has a sound. Hide it until "Currently on view" is reached? (WCAG only needs it while the
  sound can play.)
- **Sound default:** sound starts on the first click anywhere. Prefer it to start only when the
  visitor presses "Sound on"?
- **Quotes in captions:** in the text, straight quotes become curly (" → “ ”) automatically; in
  captions they stay as typed. Make captions curly too? (It would change Sabrina's caption.)
- **Editor text size:** 20 px in the editor (site: 24 px on a wide screen). Bigger, smaller?
- **Maria's "●":** now that there is a bullet-list button, should that line be a real list?
- **Image cropping:** main image square, second image 720 × 822. OK, or show whole artworks?
- **Social links:** `socialLinks` exists in Site settings but isn't shown. Keep or drop?
- **`/artists` page:** nothing links to it. Keep as a hidden overview, or remove?
- **Drop `imageSide`?** It no longer does anything. Remove from both schemas and the content?
- **Loading overlay on phone:** logo keeps 5 px side padding. Should it be 20 px?

## Known issues

- **Audio uploads depend on a Tina workaround** (`cmsCallback` in `tina/config.ts`): Tina 3.15
  drops `media.accept` from the schema, so audio would otherwise be refused. If a Tina update
  changes its internals, uploads fall back to Tina's list (audio refused); the rest of the admin
  and the site are unaffected. Re-test an mp3 upload after any Tina update.
- **Sound toggle CSS** uses 15 px for the phone dates/venue line's bottom offset, copied from
  `.site-header__meta`; change both together.
- Chrome may print a yellow *warning* (not an error) "The AudioContext was not allowed to start"
  on a page with a sound before the first click. Harmless.
- **Sabrina's second image 404s** (Status 5).
- **`/admin` commits are authored by `tinacloud-app[bot]`**: with "act as self", Tina falls back to
  the bot when the editor's GitHub account can't write to the repo. Saving works. If attribution
  matters: GitHub → repo Settings → Collaborators → add their account (Write).
- **`@astrojs/markdown-satteri` is pinned to `0.4.4`**, the version `astro` 7.4.1 uses. Bump it
  together with `astro`, or two copies end up installed.
- **Tina does not save an empty paragraph or a trailing Shift+Enter.** The editor shows them,
  the site cannot. The editor labels the empty paragraph.
- **The editor styling depends on Tina's markup** (`[data-slate-editor]`, `.slate-p`). A Tina
  update can silently switch it off (the editor then looks like Tina's default; nothing breaks).
- **`maria-pita-guerreiro.md`:** its next save in `/admin` removes three trailing spaces. Harmless.
- **`:has()` required** for the image position and the 26 px image gaps (all current browsers).
  Older browsers show the text in order with the main image above it.
- **`1lh` unit** (Chrome 109, Safari 16.4, Firefox 120); older browsers use `1.0833em`.
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
- Sound feature: branch `claude/fervent-bardeen-dico7g` → PR [#6](https://github.com/BromsC/spacecraft-site/pull/6) into `main`.
- `main`: content commits from `/admin` up to `ee35242` (2026-11-26) on top of the PR #5 merge
  (2026-11-10, editor rework) on top of `77102c8`. Earlier: `1e79d23`
  (upright headings), `110b57b` (empty lines), PR #4 `c55c1b1`, PR #3 `84ab069`.
- Rollback point: branch `pre-editor-rework` = `77102c8`.
- Deploy runs: https://github.com/BromsC/spacecraft-site/actions
