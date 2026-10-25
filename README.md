# SECURA commercial website

A standalone React + Vite + TypeScript presentation website with three
hash-routed views: About, Documentation, and Contact Us.

## Scope

This is a frontend-only academic product showcase. Interface previews use the supplied SECURA dashboard screenshots as static
promotional visuals, not working application dashboards. The inquiry form
validates locally in React memory; it sends no messages and persists no data.
There is no backend, database, authentication, file upload, or AI processing.

## Local setup and checks

Use Node.js 22.12 or later (Node.js 22 LTS recommended) and pnpm 10.
The pinned development versions are recorded in `.mise.toml`.

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run build
```

The production output is `dist/`. Outside Figma Make, use `pnpm dev` to start
local development or `pnpm preview` to inspect a production build.
Inside Figma Make, use the supervised preview rather than starting another server.

## Complete source export

Keep `src/`, `styles/`, `public/`, `index.html`, `package.json`,
`pnpm-lock.yaml`, `tsconfig.json`, `vite.config.ts`, and `.mise.toml`.
**Include the hidden `.figma/make/site.json` file**: the existing Vite config
imports it to populate the HTML metadata. Exporting only visible files will
omit that build dependency.

The existing `.figma/make/` scripts may remain in the export. They are not
required by the standalone `pnpm run build` command, and Figma-specific
development plugins are not included in the production website.

Do not include `node_modules/`, temporary browser checks, or local secrets.

## Vercel

Import the complete repository into Vercel and select:

- Framework preset: **Vite**
- Node.js: **22.x**
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm run typecheck && pnpm run build`
- Output directory: `dist`

No environment variables, server functions, or external API credentials are
required. Hash routes (`#/about`, `#/documentation`, `#/contact`) work on a
static host without custom rewrite rules.

## Styling and publication notes

Shared design tokens and responsive styles live in `styles/global.css`.
`src/index.css` loads Tailwind, the global stylesheet, and the existing
Instrument Sans Google Fonts import. If that external font is unavailable,
the defined sans-serif fallback remains readable.

The existing site configuration intentionally disables search indexing.
Review `.figma/make/site.json` metadata and indexing preferences before a
public launch. No live Vercel deployment is performed by the build checks.

## Official local assets

`public/assets/secura-logo.png` is the supplied `secura-logo-dark.png`, copied
without modification. Header, footer, and documentation branding use this PNG.
The three role previews use the supplied `user-dashboard.png`,
`admin-dashboard.png`, and `security-officer-dashboard.png` from the same folder.
Images retain their original proportions and contents inside responsive browser
frames; the screens do not provide application functionality.
