# Visual islands

Client-only visual components (e.g. a future Three.js scene) live here.

Convention:

1. Write the component as a plain `.astro` file with a `<script>` tag (no UI framework needed),
   or add a framework integration first and note it in `docs/DECISIONS.md`.
2. Keep heavy libraries out of the initial page load: import them dynamically inside the
   `<script>` (e.g. `const THREE = await import('three')`) and only start when the element
   is visible (IntersectionObserver).
3. Respect `prefers-reduced-motion` and render a static fallback (image or CSS gradient)
   so the page works without JavaScript.
4. Use it from a page or layout: `import LightField from '../components/visual/LightField.astro'`.

Nothing lives here yet — Three.js is deliberately deferred (see docs/DECISIONS.md).
