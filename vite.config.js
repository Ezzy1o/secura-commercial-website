import { defineConfig } from "vite"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

// Static multi-page site: every HTML file at the root is a build entry.
const page = (file) => fileURLToPath(new URL(file, import.meta.url))

// A browser navigation to something that is not a file and not a page: the kind of request Vercel answers
// with 404.html. Excludes the home page, files with an extension and Vite's own /@... and /__... URLs.
const isMissingPage = (req) => {
  const path = (req.url ?? "").split("?")[0]
  return (
    req.method === "GET" &&
    (req.headers.accept ?? "").includes("text/html") &&
    path !== "/" &&
    !/\.[a-z0-9]+$/i.test(path) &&
    !path.startsWith("/@") &&
    !path.startsWith("/__")
  )
}

const send404 = (res, html) => {
  res.statusCode = 404
  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.end(html)
}

// Serves /about from about.html in dev and preview, matching "cleanUrls" in vercel.json, and answers
// unknown URLs with a real 404 using 404.html, as Vercel does.
const cleanUrls = () => {
  const rewrite = (req, _res, next) => {
    const [path, query = ""] = (req.url ?? "").split("?")
    const name = path.replace(/^\/|\/$/g, "")
    if (name && !name.includes(".") && !name.includes("/") && existsSync(page(`./${name}.html`))) {
      req.url = `/${name}.html${query ? `?${query}` : ""}`
    }
    next()
  }
  return {
    name: "clean-urls",
    configureServer(server) {
      server.middlewares.use(rewrite)
      // Runs after Vite's own file serving, so only requests nothing else answered reach it.
      return () =>
        server.middlewares.use(async (req, res, next) => {
          if (!isMissingPage(req)) return next()
          send404(res, await server.transformIndexHtml("/404.html", readFileSync(page("./404.html"), "utf8")))
        })
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
      return () =>
        server.middlewares.use((req, res, next) => {
          const file = join(server.config.root, server.config.build.outDir, "404.html")
          if (!isMissingPage(req) || !existsSync(file)) return next()
          send404(res, readFileSync(file, "utf8"))
        })
    },
  }
}

export default defineConfig({
  plugins: [cleanUrls()],
  // Plain multi-page site: an unknown URL is a real 404 (like on Vercel), not a fallback to the landing page.
  appType: "mpa",
  server: {
    watch: {
      // Only the 300 MB 4K master is ignored. Never ignore public/: Vite learns about new public files
      // through the watcher, so an ignored folder makes new videos come back as HTML (a blank player).
      ignored: ["**/assets-src/video/**"],
    },
  },
  build: {
    chunkSizeWarningLimit: 700, // the lazily loaded Three.js chunk (landing only)
    // Hashed scripts and styles go to /bundle/, apart from the unhashed images in /assets/, so vercel.json
    // can cache /bundle/ forever without ever serving a stale replacement.
    assetsDir: "bundle",
    rollupOptions: {
      input: {
        index: page("./index.html"),
        about: page("./about.html"),
        documentation: page("./documentation.html"),
        contact: page("./contact.html"),
        notFound: page("./404.html"), // Vercel serves 404.html for any URL that does not exist
      },
    },
  },
})
