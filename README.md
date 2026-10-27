# The Space Craft — website

Website for **The Space Craft**, an ongoing exhibition in Stockholm: the exhibition, the
current artists, and light visuals. Static site built with Astro, content edited with TinaCMS,
hosted on GitHub Pages at [thespacecraft.se](https://thespacecraft.se).

**Current status, next steps and open questions:** see [docs/STATE.md](docs/STATE.md).
Design/tech decisions: [docs/DECISIONS.md](docs/DECISIONS.md). Instructions for Claude Code
sessions: [CLAUDE.md](CLAUDE.md).

## Editing content

Once Tina Cloud is connected, go to **https://thespacecraft.se/admin**, log in, and edit the
exhibition, artists, pages and site settings. Saving commits the change to `main`, which
triggers a new deploy. Content lives as Markdown/JSON in [`content/`](content/); uploaded images
go to `public/uploads/`.

## Deploys

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
install → (Tina admin build, only if the Tina secrets exist) → Astro build → publish to GitHub
Pages. Progress and logs: the repo's **Actions** tab. A deploy can also be started manually there
("Run workflow").
