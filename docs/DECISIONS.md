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
