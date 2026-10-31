// Mobile menu: below 900px the header is one slim row and the links open from a button.
// Without JavaScript the links stay visible in a second row (the CSS only collapses them under `.js`).

const header = document.querySelector(".site-header")
const toggle = document.getElementById("nav-toggle")
const nav = document.getElementById("primary-nav")

if (header && toggle && nav) {
  const isOpen = () => header.classList.contains("is-open")

  const setOpen = (open) => {
    header.classList.toggle("is-open", open)
    toggle.setAttribute("aria-expanded", String(open))
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu")
  }

  toggle.addEventListener("click", () => setOpen(!isOpen()))

  // Following a link, pressing Escape, tapping outside, or growing the window all close it.
  nav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) setOpen(false)
  })

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !isOpen()) return
    setOpen(false)
    toggle.focus()
  })

  document.addEventListener("click", (event) => {
    if (isOpen() && event.target instanceof Node && !header.contains(event.target)) setOpen(false)
  })

  window.matchMedia("(min-width: 901px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false)
  })
}

// Keep --header-h equal to the real header height, so the sticky contents bar always sits flush
// beneath it. The CSS values already match; this only corrects them if the header ever changes.
if (header) {
  const sync = () => {
    const height = Math.round(header.getBoundingClientRect().height)
    if (height !== Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h"))) {
      document.documentElement.style.setProperty("--header-h", `${height}px`)
    }
  }
  new ResizeObserver(sync).observe(header)
}
