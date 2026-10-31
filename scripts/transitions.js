// Page transitions for browsers without cross-document view transitions (the CSS in site.css and
// index.html handles the rest). Internal links fade the page out before navigating, and each page
// fades in on arrival. Where view transitions exist this file does nothing.

const supportsViewTransitions = "onpageswap" in window

if (!supportsViewTransitions) {
  document.documentElement.classList.add("no-vt")

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  document.addEventListener("click", (event) => {
    if (reduced || event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null
    if (!link || link.target || link.hasAttribute("download")) return

    const url = new URL(link.href, location.href)
    const samePage = url.pathname === location.pathname && url.search === location.search
    if (url.origin !== location.origin || samePage) return // other sites and in-page anchors behave normally

    event.preventDefault()
    document.body.classList.add("is-leaving")
    setTimeout(() => location.assign(url.href), 260)
  })

  // Coming back through the browser's history can restore a page that was left faded out.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) document.body.classList.remove("is-leaving")
  })
}

// Resolves once the page change has finished animating, so heavy start-up work (the WebGL shader
// compile) does not land in the middle of it and drop frames. A direct visit resolves straight away.
export const settled = new Promise((resolve) => {
  const done = () => requestAnimationFrame(() => resolve())
  const cameFromSite = document.referrer.startsWith(location.origin)
  if (!cameFromSite) return done()
  const transition = document.activeViewTransition
  if (transition) transition.finished.then(done, done)
  else setTimeout(done, 650)
})
