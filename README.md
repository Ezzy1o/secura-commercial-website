# SECURA commercial website

A static HTML/CSS/JS showcase for SECURA, a secure web platform concept for
AI-assisted document anonymization. Built with Vite as the dev server and
bundler only; there is no framework.

## Pages

| File | Page |
| --- | --- |
| `index.html` | 3D landing (Three.js, scroll-driven story). Header links to the pages below. |
| `about.html` | About: anonymization simulation, overview, problems and objectives, technology used |
| `documentation.html` | Documentation: workflow, interactive network topology, role-based interfaces |
| `contact.html` | Contact Us: team and a demonstration inquiry form |

## Scope

Frontend-only academic product showcase. Interface previews are static
screenshots, not working dashboards. The inquiry form validates locally in the
browser; it sends no messages and stores no data. There is no backend,
database, authentication, file upload, or AI processing.

## Structure

- `styles/site.css`: shared styles for About, Documentation and Contact (same
  palette, fonts and header as the landing; the landing keeps its own inline CSS).
- `scripts/site.js`: shared behaviour (WebGL background using the landing's
  obsidian shader, cursor, access dialog, reveal and count-up animations).
- `scripts/about.js`: the About page's "Simulation Anonymize Document" demo and
  the Technology Used filter. The sample document, its entities and the
  replacement values live in `DOCUMENT` at the top; edit them to change the demo.
  Everything is fictional and runs locally.
- `scripts/documentation.js`: table of contents and the topology diagram.
  Edit the `MODES` and `LAYOUT` objects to change devices, IPs or links.
- `scripts/contact.js`: inquiry form validation.
- `public/`: logo, dashboard screenshots, team photos and favicon.

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

The landing loads Three.js from `unpkg.com` and Google Fonts at runtime, so
those need to be reachable for the 3D scene and fonts to appear.
