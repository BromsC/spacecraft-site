# Decisions log

Append-only. Never edit or delete an entry; supersede it with a new one that references it.
Format: date · decision · why · alternatives rejected.

---

## 2026-10-27 — Astro over Next.js

- **Decision:** Build the site with Astro (v7, static output), TypeScript, npm.
- **Why:** The site is content-first with no backend; Astro ships zero JS by default, builds to
  plain static files for GitHub Pages, and has first-class Markdown content collections.
  Client-side visuals can be added later as isolated islands.
- **Rejected:** Next.js (React runtime on every page, static export is a second-class mode, more
  moving parts for no benefit here); Eleventy/Hugo (weaker TypeScript story, no island model).

## 2026-10-27 — Standard Tina editing, not visual editing

- **Decision:** Use TinaCMS with Tina Cloud and the standard form-based admin at `/admin`.
  No visual (click-to-edit) editing.
- **Why:** Visual editing requires rendering pages as React components with Tina's `useTina`
  hook, which would force React into the site. Form editing works with plain Markdown files and
  a fully static Astro site.
- **Rejected:** Tina visual editing (React on the frontend); Decap CMS (dated UI, weaker schema
  typing); a headless SaaS CMS (content leaves the repo, extra cost).
- **Note:** `react` / `react-dom` are dependencies only because `@tinacms/cli` needs them to
  build the admin SPA. The public site ships no React.

## 2026-10-27 — Plain CSS with custom properties

- **Decision:** One global stylesheet (`src/styles/global.css`) with design tokens on `:root`;
  component-scoped `<style>` in `.astro` files is allowed when useful.
- **Why:** Small site, no design system yet; tokens make a later visual redesign a one-file job.
  No build-time CSS tooling to maintain.
- **Rejected:** Tailwind (utility noise in templates, another dependency); CSS-in-JS / UI kits.

## 2026-10-27 — Markdown content via Astro content collections

- **Decision:** All content lives as Markdown/JSON under `content/` and is read by Astro content
  collections using the `glob` loader. Tina edits the same files. Entry id = filename = URL slug.
  `src/content.config.ts` and `tina/config.ts` mirror each other.
- **Why:** One source of truth in git; Tina commits straight to the repo; Astro validates
  frontmatter with zod at build time, so bad content fails CI instead of shipping.
- **Rejected:** Querying Tina's GraphQL API at build time (needs Tina credentials for every
  build, including CI before Tina Cloud exists); keeping content in `src/content/` (the top-level
  `content/` folder keeps editable content clearly separate from code).

## 2026-10-27 — Conditional Tina build in CI

- **Decision:** The deploy workflow runs `npx tinacms build` only when the `TINA_CLIENT_ID`
  secret is non-empty, then always runs `npx astro build`. `npm run build:site` is the
  Tina-free build used to verify changes.
- **Why:** The Tina Cloud project isn't set up yet; deploys must succeed now. When the secrets
  are added, `/admin` appears on the next deploy with no workflow change.
- **Rejected:** Always building Tina (red CI until Tina Cloud exists); `tinacms build --local`
  in CI (ships an admin that only works against a local server).

## 2026-10-27 — Three.js deferred

- **Decision:** No Three.js (or any client-side visual library) yet. `src/components/visual/` is
  reserved for client-only islands, with conventions in its README.
- **Why:** Content and structure first; visuals need design input that doesn't exist yet. Adding
  it later is isolated to one component plus a dependency entry here.
- **Rejected:** Adding Three.js now "just in case" (bundle weight and maintenance for no output).

## 2026-10-27 — Base path follows GitHub Pages config (refines "base: '/'")

- **Decision:** `astro.config.mjs` uses `base: process.env.BASE_PATH || '/'`. CI sets
  `BASE_PATH` from `actions/configure-pages`, which is `""` once the custom domain is configured
  in repo Settings → Pages, and `/spacecraft-site` before that. All internal links and image
  paths go through `url()` in `src/lib/url.ts`. Tina's `build.basePath` follows the same variable.
- **Why:** With a custom domain the site lives at `/` (as intended), but until the domain is
  configured the only working URL is `https://bromsc.github.io/spacecraft-site/`, where root-
  relative links and CSS would 404. This keeps the preview usable with zero manual steps and
  becomes plain `/` automatically once the domain is set.
- **Rejected:** Hard-coded `base: '/'` (broken preview until DNS is done); hard-coded
  `/spacecraft-site` (wrong once the domain is live).
- **Caveat:** Images embedded *inside* Markdown body text as `/uploads/...` are not prefixed, so
  they only render correctly on the custom domain. Frontmatter image fields are fine.

## 2026-10-27 — Custom domain must be set in Pages settings (CNAME kept)

- **Decision:** Keep `public/CNAME` (`thespacecraft.se`) as requested, but document that the
  custom domain must also be entered in GitHub → Settings → Pages → Custom domain.
- **Why:** For Pages sites deployed by a custom GitHub Actions workflow, GitHub ignores the CNAME
  file in the artifact; the domain is read from the repo setting. The file is harmless and keeps
  intent visible in the repo.
- **Rejected:** Removing CNAME (the spec asked for it, and it documents the domain).

## 2026-10-27 — Tooling versions and generated files

- **Decision:** Node 24 in CI (`engines.node >=22.23`, Astro 7's minimum). TypeScript 6
  (`@astrojs/check` does not support TS 7 yet). Commit `tina/tina-lock.json`; gitignore
  `tina/__generated__/` and `public/admin/` — per current Tina guidance, the lock file is what
  Tina Cloud reads to index the schema, the rest is regenerated on every build.
- **Dependencies added:** `astro`, `tinacms`, `react`, `react-dom` (Tina admin build only);
  dev: `@tinacms/cli`, `@astrojs/check`, `typescript`, `@types/node`.
- **Pinned GitHub Actions:** checkout v7, setup-node v7, configure-pages v6,
  upload-pages-artifact v5, deploy-pages v5 (latest majors at time of writing).

## 2026-10-27 — Nav "Info" points to the About page

- **Decision:** Header nav is Home (`/`), Artists (`/artists`), Info (`/about`). The `pages`
  collection serves any `content/pages/<slug>.md` at `/<slug>`; only `about` is seeded.
- **Why:** Spec asked for an "Info" nav item and an "about" seed page; one info page is enough
  until there is real content for separate Info/Visit pages.
- **Rejected:** Separate empty Info and Visit pages (placeholder clutter).

## 2026-10-27 — Pin @tinacms/cli 4.0.3 / @tinacms/graphql 4.0.1

- **Decision:** `package.json` pins `@tinacms/cli` to exactly `4.0.3` and adds
  `"overrides": { "@tinacms/graphql": "4.0.1" }`. `tina/tina-lock.json` was regenerated and now
  records schema `fullVersion` `4.0.1`. `tinacms` stays at `^3.15.0` (installs cleanly with
  cli 4.0.3; one copy of `@tinacms/graphql` in the tree).
- **Why:** `@tinacms/graphql` 4.1.0 (published 2026-10-27) came in via `@tinacms/cli` 4.0.4 and
  was written into `tina-lock.json`. Tina Cloud does not support it yet: `tinacms build` in CI
  failed with "Invalid version 4.1.0 … ERR_CLOUD_CHECK_FAILED" (deploy run #3). The override is
  needed because cli 4.0.3 declares `@tinacms/graphql` `^4.0.1`, which still resolves to 4.1.0.
- **Rejected:** Waiting for Tina Cloud to support 4.1.0 (`/admin` stays down for an unknown
  time); `tinacms build --skip-cloud-checks` (hides the mismatch — the admin would still talk to
  a Tina Cloud that cannot index a 4.1.0 schema, and it would mask future real failures).
- **Revisit:** When Tina Cloud supports graphql 4.1.0 (check Tina's changelog / release notes,
  or try a build on a branch): restore `^` ranges, remove the override, reinstall, regenerate
  `tina/tina-lock.json`, confirm CI is green. Until then don't bump these packages.

## 2026-10-27 — Apex domain + www on GitHub Pages via GoDaddy A/AAAA/CNAME

- **Decision:** Serve the site at the apex `thespacecraft.se` with `www` as the alternate name.
  GoDaddy DNS (GoDaddy nameservers): four `A` records on `@` → `185.199.108–111.153`, four `AAAA`
  records on `@` → `2606:50c0:8000–8003::153`, `CNAME` `www` → `bromsc.github.io`. GoDaddy's
  "Parked" A record and the old `www` → `thespacecraft.se` CNAME were deleted; no forwarding.
  Custom domain set in repo Settings → Pages, "Enforce HTTPS" on.
- **Why:** This is GitHub's documented setup. Apex A/AAAA plus a `www` CNAME lets GitHub Pages
  redirect between the two names itself and issue one certificate covering both.
- **Rejected:** GoDaddy domain forwarding (would have fought the A records on `@`);
  CNAME flattening / ALIAS records (not needed — GitHub publishes stable apex IPs).

## 2026-10-27 — Tina git authoring: act as self

- **Decision:** In the Tina Cloud project, Git authoring is set to "act as self": commits made
  from `/admin` are authored by the logged-in editor's GitHub account (currently BromsC).
- **Why:** Edits are attributable to the person who made them in git history. If the editor's
  GitHub permissions are missing, Tina falls back to the `tina-cloud-app` bot automatically, so
  saving never breaks.
- **Rejected:** Bot-only commits (every content change shows as `tina-cloud-app`, no record of
  who edited what).

## 2026-10-27 — Deploy from "Run workflow", not "Re-run"

- **Decision:** To redeploy the latest `main`, use Actions → "Deploy to GitHub Pages" →
  **Run workflow** (on `main`). Never use "Re-run all jobs" on an old run.
- **Why:** A re-run executes against that run's original commit, so it redeploys old code. This
  happened once: re-running run #3 redeployed `efe3777` instead of the latest `main`.
- **Rejected:** Re-running old runs as a "redeploy" shortcut.

## 2026-10-27 — Design pass: white-only colour scheme

- **Decision:** One colour scheme: white background (`--color-bg: #ffffff`), black text, one
  accent `--color-accent: #0000ff` used only for the arrows. The `prefers-color-scheme` block and
  the dark defaults are gone; `<meta name="color-scheme" content="light">`.
- **Why:** The Figma mockup (`Otd6V0py66ddmBsxEBj3xE`) is white/black/blue only; the logo and
  artworks are designed against white.
- **Rejected:** Keeping a dark mode (no design for it; would need its own art direction). The
  arrow SVG colour couldn't be read from Figma (the connector didn't return SVG content), so
  `#0000FF` per the spec.

## 2026-10-27 — Self-hosted ABC Areal Superfamily (variable)

- **Decision:** Self-host `public/fonts/ABCArealSuperfamilyVariable.woff2` (licensed by The Space
  Craft, uploaded by Caspar) as `font-family: 'ABC Areal'`, `font-weight: 400 700`, preloaded in
  the layout. Declared twice from the same file: `font-style: normal` and
  `font-style: oblique 12deg`. Italic text uses `font-style: oblique 12deg`. Fallback stack
  `'ABC Areal', Helvetica, Arial, sans-serif`.
- **Why:** The mockup's typeface. The font has a `slnt` axis (0…−12) but no `ital` axis; an
  oblique face lets browsers drive `slnt` directly, so "Currently on view" and the phone header
  use the font's own slanted design instead of a synthesised slant. One file, one download.
- **Rejected:** A Google/Adobe font substitute (not the brand face); `font-variation-settings`
  inside `@font-face` (not supported by Chromium); `font-style: italic` on the face (maps to an
  `ital` axis the font doesn't have).

## 2026-10-27 — Sticky header replaces nav and footer (supersedes "Nav 'Info' points to the About page")

- **Decision:** Remove the header nav (Home / Artists / Info) and the footer. A fixed
  `SiteHeader` shows three white pills — exhibition title, dates line, venue — all linking to
  `#top`. On the home page it is hidden while `#intro`/`#landing` are in view and fades in after
  `#landing`. Phone: title at the top, dates + venue fixed at the bottom. Site settings'
  `socialLinks` and `footerText` stay in the schema but are unused for now.
- **Why:** That is the mockup. The pills keep it legible over images.
- **Rejected:** Keeping a nav alongside (not in the design); deleting `socialLinks`/`footerText`
  (likely needed again; harmless to keep).

## 2026-10-27 — `pages` collection removed

- **Decision:** Delete the `pages` collection (Tina + Astro), `content/pages/`, and
  `src/pages/[slug].astro` (the `/about` page).
- **Why:** The design has no generic text pages and no nav to reach them; an unreachable About
  page in the CMS would confuse editors.
- **Rejected:** Keeping it "for later" (re-adding a collection is a documented 5-step job in
  CLAUDE.md).

## 2026-10-27 — Artist `status` select replaces `featured`

- **Decision:** Artists get a required `status` string field with Tina `options`
  (`current` / `upcoming` / `previous`, shown as a select; shape verified against the installed
  `@tinacms/schema-tools` types, as tina.io was unreachable from the build sandbox). zod:
  `z.enum([...])`. `featured`, `role`, `shortBio`, `portrait`, `gallery` are removed. The home
  page's current artist is the first `current` artist by `order`. New artists default to
  `upcoming` / image `left` via the collection's `defaultItem`.
- **Why:** The site is organised around one current artist plus previous/upcoming lists; a
  three-way status says that directly and a select prevents typos.
- **Rejected:** Deriving status from dates (see next entry); a boolean `current` (can't separate
  previous from upcoming).

## 2026-10-27 — Free-text `period`, sorting by `order`

- **Decision:** Each artist has a free-text `period` ("30 October – 6 November", "November
  13th") shown as written; lists sort by the numeric `order` field. The exhibition gets a
  free-text `datesLine`; `startDate`/`endDate` remain but aren't displayed.
- **Why:** The mockup mixes date formats on purpose ("6 – 13 November", "November 13th"); typed
  dates would force one format. Manual `order` keeps the editor in control.
- **Rejected:** Start/end date fields per artist with automatic formatting and automatic status
  switching (rigid formatting, needs a rebuild at midnight to switch status anyway).

## 2026-10-27 — Two text fields instead of auto-flowing text

- **Decision:** An artist's text is split by the editor into `body` ("Text", beside the main
  image) and `continuedText` ("Text, continued", beside the second image in `#continued`).
  `#continued` only renders if `continuedText` or `btsImage` is set. The continued text sits
  under the main image's column and the second image on the other side (as in Figma frames
  `35:16` → `42:145`).
- **Why:** Matches the two mockup frames exactly and works without JavaScript or measuring text.
- **Rejected:** Flowing one long text across both sections with CSS columns/regions or JS
  (fragile across viewports, unpredictable breaks).

## 2026-10-27 — Intro and header behaviour in vanilla JS

- **Decision:** The intro (2 s logo, then smooth scroll to `#landing`, skipped on repeat
  visits/reduced motion, cancelled by user input) is a small inline script in `index.astro`. The
  header fade uses one IntersectionObserver on `#landing`, with the root extended far downwards
  (and 1 px in at the top) so it flips exactly when `#landing` leaves the viewport upwards —
  including instant jumps past it, which a plain observer misses.
- **Why:** A few lines of code; no dependency; the page is fully usable without JS.
- **Rejected:** Scroll libraries (GSAP ScrollTrigger, Lenis) — new dependencies for two small
  behaviours; scroll-event listeners (more work per frame than an observer).

## 2026-10-27 — `continuedText` stored as Markdown in frontmatter, rendered with `marked`

- **Decision:** `continuedText` is a Tina `rich-text` field without `isBody`; Tina serialises it
  to a Markdown string in the frontmatter (checked in `@tinacms/graphql`: every rich-text field
  goes through `serializeMDX`). Astro reads it as `z.string().optional()` and renders it with
  `marked` (`renderMarkdown()` in `src/lib/content.ts`).
- **Why:** Editors get the same rich-text editor as the main text (bold, italic, links), and the
  output keeps that formatting. `marked` is already installed as a transitive dependency
  (`tinacms` → `mermaid` → `marked` 16), so no new dependency is added.
- **Rejected:** Plain text with `white-space: pre-line` (Markdown syntax like `**bold**` from the
  rich-text editor would show up literally); a second content collection for continued texts
  (two files per artist); adding `marked` or `@astrojs/markdown-remark` to `package.json` (a new
  dependency for something already present).
- **Risk:** If a Tina update stops pulling in `marked`, `npm run build` fails with "Cannot find
  package 'marked'". Then add `marked` to `package.json` and note it here.

## 2026-10-30 — One text field per artist, floats for the "clean cut" (supersedes "Two text fields instead of auto-flowing text" and "`continuedText` stored as Markdown in frontmatter, rendered with `marked`")

- **Decision:** An artist has one rich-text field, the Markdown body ("Text"); `continuedText` is
  removed from both schemas and migrated into the body (only `sabrina-gschwandtner.md` had it).
  The `#continued` section and `ArtistContinued.astro` are gone. `ArtistFeature` is a
  `display: flow-root` box on desktop: the main image floats on `imageSide`, the second image
  floats on the other side with `clear` and no vertical margin, so its top edge is the main
  image's bottom edge; title and text are normal flow and wrap around both. Phone: a grid stacked
  with `order`. The "Text" toolbar is reduced to heading / bold / italic / link with one heading
  level (`h3`); every heading level is styled the same in `.prose`. `marked` /
  `renderMarkdown()` are removed.
- **Why:** Editors write one text; the browser decides where it breaks, at any viewport width.
  CSS floats give exactly the mockup's dynamic cut (text beside the main image, then beside the
  second image on the other side) with no JavaScript and no measuring. One field also removes the
  dependency on the transitive `marked` package.
- **Rejected:** JS splitting of the text at the image edge (measures fonts and layout, breaks on
  resize, flashes); CSS Regions (not supported by browsers); CSS multi-column (balances columns,
  can't make text step from one side to the other at an image edge); keeping two fields (editors
  must guess where the image ends).

## 2026-10-30 — Loading overlay replaces the intro section (supersedes the intro part of "Intro and header behaviour in vanilla JS")

- **Decision:** No `#intro` section and no auto-scroll. If the exhibition has a logo, the home
  page renders a fixed white overlay (z-index above the header) with the logo, shown only when
  `<html>` has the `js` class. On every load and reload: after the logo has loaded (capped at
  2 s), it stays 800 ms, fades over 500 ms (`--fade-intro`), then is removed from the DOM
  (`transitionend`, 1.5 s fallback). Reduced motion → removed immediately. No scroll lock, no
  `sessionStorage`. The header observer on `#landing` is unchanged.
- **Why:** The intro section plus scripted smooth scroll fought the user's own scrolling and
  needed repeat-visit logic; an overlay over the landing page gives the same brand moment with
  no layout to scroll past. Waiting for the logo to load avoids fading out an empty white screen
  on a slow connection.
- **Rejected:** Keeping the intro section; a CSS-only animation (can't remove the element from the
  DOM or wait for the image); showing it once per session (asked for on every load).

## 2026-10-30 — Header title links home on subpages (supersedes the "all linking to `#top`" part of "Sticky header replaces nav and footer")

- **Decision:** The header title pill links to `url('/')` on every page except the home page,
  where it stays `#top` (decided by the existing `autohide` prop, which only the home page sets).
  Dates/venue pills stay `#top`. Artist pages' back link is "← Home" → `/` (was "← All
  exhibitions" → `/artists`); the `/artists` route stays.
- **Why:** There was no way home from subpages (open question from the design pass).
- **Rejected:** A nav (not in the design); checking `Astro.url.pathname` (the prop already says
  "this is home", and stays right if the base path changes).

## 2026-10-30 — Placeholder row for empty exhibition lists

- **Decision:** An empty Previous / Upcoming / Current group keeps its heading and shows one row
  `"..."` → blue arrow → `"..."` (same grid and sizes as a real row, not a link).
- **Why:** Figma frame 38:47 and the phone frame show it; a bare heading looked unfinished.
- **Rejected:** Hiding empty groups; a sentence like "None yet".

## 2026-10-30 — `footerText` reused as the credits line

- **Decision:** The unused Site-settings field `footerText` is relabelled "Credits line" and
  rendered centred at the bottom of the exhibition-lists section (home and `/artists`), which is
  at least one screen tall on all viewports. Omitted when empty. Seeded with the festival credits.
- **Why:** The mockup has exactly one such line; reusing the field avoids a schema migration and
  keeps the stored content.
- **Rejected:** A new `credits` field (one more field and an orphaned one); a site-wide footer
  (the design has none).

## 2026-10-30 — No `scroll-margin-top` on `#current` / `#exhibitions`

- **Decision:** Not added, although it was requested in this round's quality pass.
- **Why:** Both sections already begin with `--header-space` top padding, so an anchor jump puts
  their content below the header already. With an extra scroll margin the jump to `#current` would
  stop `--header-space` early, leaving `#landing`'s last pixels in view — the header observer then
  keeps the home header hidden — and doubling the white gap.
- **Rejected:** Adding it and removing the padding (changes the layout of every section).

## 2026-10-30 — Smooth-scroll library (Lenis) considered and rejected for now

- **Decision:** No smooth-scroll / scroll-jacking library. Native `scroll-behavior: smooth`
  (only with `prefers-reduced-motion: no-preference`) stays as it is.
- **Why:** The overlay removed the only scripted scroll; native scrolling is faster, accessible and
  dependency-free.
- **Rejected:** Lenis (new dependency, overrides native scrolling and its accessibility; revisit
  only if a later visual design needs scroll-linked motion).
