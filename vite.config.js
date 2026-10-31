import { defineConfig } from "vite"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

// Static multi-page site: every HTML file at the root is a build entry.
const page = (file) => fileURLToPath(new URL(file, import.meta.url))

// Serves /about from about.html in dev and preview, matching "cleanUrls" in vercel.json.
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
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

export default defineConfig({
  plugins: [cleanUrls()],
  build: {
    chunkSizeWarningLimit: 700, // the lazily loaded Three.js chunk (landing only)
    rollupOptions: {
      input: {
        index: page("./index.html"),
        about: page("./about.html"),
        documentation: page("./documentation.html"),
        contact: page("./contact.html"),
      },
    },
  },
})
