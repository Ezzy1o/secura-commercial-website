# SECURA commercial website

A static HTML/CSS/JS showcase for SECURA, a secure web platform concept for
AI-assisted document anonymization. Built with Vite as the dev server and
bundler only; there is no framework.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Homepage: 3D landing (Three.js, scroll-driven story). Header links to the pages below. |
| `about.html` | About: anonymization simulation, overview, problems and objectives, technology used |
| `documentation.html` | Documentation: workflow, physical network topology, role-based interfaces |
| `contact.html` | Contact Us: supervisor, team and links back into the project |

## Scope

Frontend-only academic product showcase. Interface previews are static
screenshots, not working dashboards. There is no backend, database,
authentication, file upload, form submission, or AI processing.

## Structure

- `styles/site.css`: shared styles for About, Documentation and Contact (same
  palette, fonts and header as the landing; the landing keeps its own inline CSS).
- `styles/fonts.css` and `public/fonts/`: self-hosted Space Grotesk (headings), Inter (text) and
  JetBrains Mono (labels), Latin subset. Every page preloads them; there is no Google Fonts request.
- `scripts/site.js`: shared behaviour (WebGL background using the landing's
  obsidian shader, cursor, reveal and count-up animations, and Lenis smooth
  scrolling). Lenis is off for reduced motion and is not used on the
  landing, which has its own scroll-driven scene. Tune `lerp` and `wheelMultiplier`
  in `initSmoothScroll()`. The page scrollbar is hidden in `styles/site.css`.
- `scripts/nav.js`: the mobile menu (below 900px the header is one slim row with a menu
  button). Loaded by every page, including the landing.
- `scripts/transitions.js`: page-change fade for browsers without cross-document view
  transitions (Chrome, Edge and Safari use the native `@view-transition` in the CSS).
- `scripts/about.js`: the About page's "Simulation Anonymize Document" demo and
  the Technology Used filter. The sample document, its entities and the
  replacement values live in `DOCUMENT` at the top; edit them to change the demo.
  Everything is fictional and runs locally.
- `scripts/documentation.js`: table of contents (scroll spy), the physical
  topology and the screenshot viewer. The topology shows roles and links only, with
  no addresses, ports or switch configuration; edit `NODES`, `EDGES` and the
  `WIDE_*` / `COMPACT_*` layouts (desktop and phone) to change devices or links.
  Each screenshot's zoom tour is plain HTML: a `data-region="x,y,w,h"` button per area, in
  screenshot pixels.
- `public/`: web-sized logo (`secura-logo-sm.png`), `favicon.png`, fonts, and the dashboard
  screenshots and team photos as WebP. The lossless originals live in `assets-src/` and are not
  served; re-export them to WebP (quality about 0.92 for the screenshots) if they change.

New pages must be added to `build.rollupOptions.input` in `vite.config.js`.

## Local setup

Node.js 22.12 or later and pnpm 10 (see `.mise.toml`).

```sh
pnpm install --frozen-lockfile
pnpm dev        # local development
pnpm build      # production output in dist/
pnpm preview    # serve dist/
```

`pnpm typecheck` only runs a JavaScript syntax check on `scripts/`. It is kept
so an existing `typecheck && build` command in Vercel keeps working.

## Vercel

- Framework preset: **Vite**
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm run build`
- Output directory: `dist`

No environment variables or server functions are required. Pages use clean URLs
(`/about`, `/documentation`, `/contact`): `vercel.json` sets `cleanUrls` for
production, and a small plugin in `vite.config.js` does the same for `pnpm dev`
and `pnpm preview`. Link to pages as `/about`, not `about.html`.

Everything, including Three.js (a lazy chunk on the landing only) and the fonts, is served from
the site itself; there are no third-party requests.
