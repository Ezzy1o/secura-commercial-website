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
- `public/video/`: the About page's commercial video as a web copy (1080p, 60fps, H.264 High @ 4.2,
  about 28 MB, `faststart`) plus its poster frame. The 4K master (about 300 MB) stays in
  `assets-src/video/`, which is git-ignored because GitHub rejects files over 100 MB. The page has
  dark purple gradients, so the encode uses a low CRF with `-tune film` and `aq-mode=3`; a higher
  CRF shows visible blocks in the glow. To replace the video, re-encode it, for example
  `ffmpeg -i master.mp4 -vf "scale=1920:-2:flags=lanczos+accurate_rnd+full_chroma_int" -c:v libx264 -preset slow -crf 17 -tune film -x264-params aq-mode=3 -g 120 -pix_fmt yuv420p -profile:v high -level:v 4.2 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart -c:a aac -b:a 160k public/video/video_secura_commercial.web.mp4`,
  and refresh the poster with `-ss 2 -frames:v 1`. Phones and tablets (up to 768px), "Data Saver"
  and slow connections (2G/3G) get a lighter copy instead, picked in `initVideo()` in
  `scripts/about.js`: `video_secura_commercial.mobile.mp4` (720p, 30fps, level 3.1, about 7 MB, made
  with `-vf "scale=1280:-2,fps=30" -crf 22 -level:v 3.1 -b:a 96k`) and a 960px poster, with
  `preload="none"` so only the poster downloads until play is pressed. The `<video>` in
  `about.html` deliberately has no `src` or `poster`, otherwise phones would start fetching the large
  file before the script runs; a `<noscript>` player covers visitors without JavaScript. If the
  file is missing the page shows a short message instead of an empty player. If the player is blank in `npm run dev`, restart the dev
  server: Vite lists `public/` files once at start and a file added later is answered with HTML.

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
