// Intro preloader for the landing page. The overlay markup and styles are already in the page (see
// styles/preloader.css); this script builds the falling lines, decides when to leave and fades out.
//
// It stays up for at least 2.2 s and until the 3D scene has started, but never longer than 3 s, so a slow
// device is not held back and a fast one still sees the intro. The time is counted from the start of the
// page load, not from when this script runs. Visitors who prefer reduced motion get a shorter, calmer one.
// It plays once per browser session (the flag is also set by every other page).

const root = document.getElementById("preloader")

if (root) {
  const KEY = "secura:intro"
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const MIN = reduced ? 900 : 2200
  const MAX = reduced ? 1400 : 3000
  const html = document.documentElement
  const covered = [...document.querySelectorAll(".site-header, main, .interface-grid")]
  let finished = false

  root.style.setProperty("--preloader-min", `${MIN}ms`)

  // Keep the page behind the overlay still and out of the keyboard order while it is showing.
  html.style.overflow = "hidden"
  for (const element of covered) element.inert = true

  if (!reduced) buildRain(root.querySelector(".preloader-rain"))

  const skip = root.querySelector(".preloader-skip")
  skip?.focus({ preventScroll: true })

  const cleanup = () => {
    if (!root.isConnected) return
    root.remove()
    html.classList.remove("has-preloader")
    html.style.removeProperty("overflow")
    for (const element of covered) element.inert = false
    window.dispatchEvent(new Event("secura:intro-done"))
  }

  const finish = () => {
    if (finished) return
    finished = true
    document.removeEventListener("keydown", onKey)
    try {
      sessionStorage.setItem(KEY, "1")
    } catch {}
    root.classList.add("is-leaving")
    // Only the overlay's own opacity transition counts: transitions on its children bubble up here too.
    root.addEventListener("transitionend", (event) => {
      if (event.target === root && event.propertyName === "opacity") cleanup()
    })
    setTimeout(cleanup, 1000) // in case the transition never fires (hidden tab, reduced motion)
  }

  const onKey = (event) => {
    if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      finish()
    }
  }
  document.addEventListener("keydown", onKey)
  root.addEventListener("click", finish)

  const wait = (limit) => new Promise((resolve) => setTimeout(resolve, Math.max(0, limit - performance.now())))
  const sceneReady = new Promise((resolve) => {
    if (window.__sceneReady) resolve()
    else window.addEventListener("secura:scene-ready", resolve, { once: true })
  })

  Promise.race([Promise.all([wait(MIN), sceneReady]), wait(MAX)]).then(finish)
}

function buildRain(container) {
  if (!container) return
  const columns = window.innerWidth < 640 ? 14 : 30
  const random = (min, max) => min + Math.random() * (max - min)
  const lines = []
  for (let i = 0; i < columns; i += 1) {
    const line = document.createElement("i")
    // Spread across the width with a little jitter so the columns do not look like a ruler.
    const x = ((i + random(0.1, 0.9)) / columns) * 100
    const duration = random(2.4, 5.2)
    line.style.setProperty("--x", `${x.toFixed(2)}%`)
    line.style.setProperty("--h", `${Math.round(random(70, 220))}px`)
    line.style.setProperty("--o", random(0.08, 0.3).toFixed(2))
    line.style.setProperty("--dur", `${duration.toFixed(2)}s`)
    // A negative delay starts every line part-way down, so the screen is alive from the first frame.
    line.style.setProperty("--delay", `-${random(0, duration).toFixed(2)}s`)
    lines.push(line)
  }
  container.append(...lines)
}
