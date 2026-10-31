// Documentation page: on-page table of contents and the interactive network topology.

/* ── Table of contents ─────────────────────────────────────────────────── */

// Scroll spy: the active link is the last section whose top has passed a reading line near the top
// of the viewport. At the very bottom of the page the last section wins, so short final sections
// still get their turn. A glowing bar slides to the active link (vertical on desktop, along the
// bottom edge when the table of contents becomes a horizontal strip).
function initToc() {
  const list = document.querySelector(".doc-toc ul")
  const links = [...document.querySelectorAll(".doc-toc a")]
  if (!list || !links.length) return

  const sections = links.map((link) => document.getElementById(link.getAttribute("href").slice(1)))
  const indicator = document.createElement("span")
  indicator.className = "doc-toc-ind"
  indicator.setAttribute("aria-hidden", "true")
  list.append(indicator)

  let current = null

  function moveIndicator(link) {
    const horizontal = getComputedStyle(list).display === "flex"
    indicator.classList.toggle("is-horizontal", horizontal)
    indicator.style.setProperty("--x", `${link.offsetLeft}px`)
    indicator.style.setProperty("--y", `${link.offsetTop}px`)
    indicator.style.setProperty("--w", `${link.offsetWidth}px`)
    indicator.style.setProperty("--h", `${link.offsetHeight}px`)
    indicator.classList.add("is-on")
    if (horizontal) {
      // Keep the active link visible inside the scrollable strip without moving the page.
      list.scrollTo({ left: link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2, behavior: "smooth" })
    }
  }

  function update() {
    const header = document.querySelector(".site-header")?.offsetHeight ?? 0
    const line = Math.max(window.innerHeight * 0.3, header + 100)
    let index = -1
    sections.forEach((section, i) => {
      if (section && section.getBoundingClientRect().top <= line) index = i
    })
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
    if (atBottom) index = sections.length - 1

    const next = index >= 0 ? links[index] : null
    if (next === current) return
    current = next
    links.forEach((link) => {
      if (link === next) link.setAttribute("aria-current", "true")
      else link.removeAttribute("aria-current")
    })
    if (next) moveIndicator(next)
    else indicator.classList.remove("is-on")
  }

  let queued = false
  const schedule = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      update()
    })
  }

  window.addEventListener("scroll", schedule, { passive: true })
  window.addEventListener("resize", () => {
    // Link geometry changes with the layout, so re-measure the active link.
    const active = current
    current = null
    update()
    if (!current && active) moveIndicator(active)
  })
  update()
}

/* ── Hover tooltip (reusable) ──────────────────────────────────────────── */

// A small floating card anchored above (or below, near the top edge) an element. `host` must be a
// positioned ancestor that does not clip overflow.
function createTooltip(host) {
  const el = document.createElement("div")
  el.className = "topo-tip"
  el.setAttribute("aria-hidden", "true") // the anchors already carry an accessible label
  host.append(el)

  return {
    show(anchor, html) {
      el.innerHTML = html
      const a = anchor.getBoundingClientRect()
      const h = host.getBoundingClientRect()
      // Flip below the anchor when there is no room above, inside the host or under the fixed header.
      const headerHeight = document.querySelector(".site-header")?.offsetHeight ?? 0
      const room = el.offsetHeight + 24
      const below = a.top - h.top < room || a.top < headerHeight + room
      el.classList.toggle("is-below", below)
      el.style.left = `${Math.min(Math.max(a.left - h.left + a.width / 2, 110), h.width - 110)}px`
      el.style.top = `${(below ? a.bottom : a.top) - h.top}px`
      el.classList.add("is-on")
    },
    hide() {
      el.classList.remove("is-on")
    },
  }
}

/* ── Topology ──────────────────────────────────────────────────────────── */

const ICONS = {
  monitor:
    '<path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14.5z"/><path d="M9 20h6M12 16.5V20"/><path d="M7 8.5l2.5 2.5L7 13.5"/>',
  switch:
    '<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M6.5 10.5v3M10 10.5v3M13.5 10.5v3M17 10.5v3"/>',
  server:
    '<rect x="4" y="3.5" width="16" height="7" rx="1.5"/><rect x="4" y="13.5" width="16" height="7" rx="1.5"/><path d="M7.5 7h.01M7.5 17h.01M11 7h6M11 17h6"/>',
  user: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2.5 19h19M12 15v4"/>',
}

// Wide canvas: 1000 x 540.
const WIDE_LAYOUT = {
  pc: { x: 350, y: 40, w: 300, h: 84, type: "monitor" },
  switch: { x: 350, y: 210, w: 300, h: 84, type: "switch" },
  server: { x: 50, y: 412, w: 280, h: 84, type: "server" },
  user1: { x: 360, y: 412, w: 280, h: 84, type: "user" },
  user2: { x: 670, y: 412, w: 280, h: 84, type: "user" },
}

const WIDE_EDGES = {
  "pc-switch": { d: "M 500 124 L 500 210", label: { x: 500, y: 150 }, duration: 2.2 },
  "switch-server": { d: "M 500 294 L 500 352 L 190 352 L 190 412", label: { x: 190, y: 382 }, duration: 2.6 },
  "switch-user1": { d: "M 500 294 L 500 412", label: { x: 500, y: 382 }, duration: 2.0 },
  "switch-user2": { d: "M 500 294 L 500 352 L 810 352 L 810 412", label: { x: 810, y: 382 }, duration: 2.8 },
}

// Compact canvas for phones: 360 x 720, devices stacked, the switch fanning out along a rail on the left.
const COMPACT_LAYOUT = {
  pc: { x: 30, y: 40, w: 300, h: 84, type: "monitor" },
  switch: { x: 30, y: 176, w: 300, h: 84, type: "switch" },
  server: { x: 30, y: 336, w: 300, h: 84, type: "server" },
  user1: { x: 30, y: 456, w: 300, h: 84, type: "user" },
  user2: { x: 30, y: 576, w: 300, h: 84, type: "user" },
}

const COMPACT_EDGES = {
  "pc-switch": { d: "M 180 124 L 180 176", label: { x: 262, y: 150 }, duration: 2.0 },
  "switch-server": { d: "M 30 218 L 16 218 L 16 378 L 30 378", label: { x: 180, y: 320 }, duration: 2.6 },
  "switch-user1": { d: "M 30 218 L 16 218 L 16 498 L 30 498", label: { x: 180, y: 440 }, duration: 2.8 },
  "switch-user2": { d: "M 30 218 L 16 218 L 16 618 L 30 618", label: { x: 180, y: 560 }, duration: 3.0 },
}

const VIEWS = {
  wide: {
    viewBox: "0 0 1000 540",
    layout: WIDE_LAYOUT,
    edges: WIDE_EDGES,
    tier: { x: 500, y: 28 },
    lan: { x: 20, y: 172, w: 960, h: 352, pillX: 44, pillY: 158, note: { x: 962, y: 514 } },
  },
  compact: {
    viewBox: "0 0 360 720",
    layout: COMPACT_LAYOUT,
    edges: COMPACT_EDGES,
    tier: { x: 180, y: 24 },
    lan: { x: 4, y: 150, w: 352, h: 556, pillX: 20, pillY: 136, note: { x: 342, y: 696 } },
  },
}

// Physical topology, described by role and connection only: no addresses, ports or switch configuration.
// `edge` is the link that ends at the device.
const NODES = {
  pc: {
    label: "Mini PC / IDS",
    role: "Monitoring & visibility",
    link: "Passive traffic mirror",
    zone: "Outside the Internal LAN",
    edge: "pc-switch",
    doc: "A dedicated monitoring host that sits outside the Internal LAN and receives a mirrored copy of network traffic. It observes patterns for anomaly detection without sitting in the forwarding path, so it adds no delay to users.",
  },
  switch: {
    label: "Network Switch",
    role: "Local connectivity core",
    link: "Connects every device",
    zone: "Internal LAN",
    edge: null,
    doc: "The connectivity core of the Internal LAN. It links the web application and the client workstations, separates user, server and monitoring traffic, and mirrors a copy of that traffic to the IDS.",
  },
  server: {
    label: "Web Application",
    role: "Application host",
    link: "Secure access (HTTPS)",
    zone: "Internal LAN",
    edge: "switch-server",
    doc: "Hosts the SECURA web application on an isolated LAN segment. It has no direct internet exposure, so users can only reach it through the managed switch over an encrypted connection.",
  },
  user1: {
    label: "Workstation 1",
    role: "Authorized endpoint",
    link: "Secure access (HTTPS)",
    zone: "Internal LAN",
    edge: "switch-user1",
    doc: "An authorized workstation inside the private network. Access to SECURA follows role-based permissions, and requests for original documents go through the controlled approval workflow.",
  },
  user2: {
    label: "Workstation 2",
    role: "Authorized endpoint",
    link: "Secure access (HTTPS)",
    zone: "Internal LAN",
    edge: "switch-user2",
    doc: "A second authorized workstation. Both endpoints operate under the same role-based access model, and sessions are logged for review by the Security Officer role.",
  },
}

const EDGES = [
  { id: "pc-switch", label: "Mirrored traffic", span: true },
  { id: "switch-server", label: "Secure access" },
  { id: "switch-user1", label: "Secure access" },
  { id: "switch-user2", label: "Secure access" },
]

const ORDER = ["pc", "switch", "server", "user1", "user2"]

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

function initTopology() {
  const root = document.getElementById("topology-root")
  if (!root) return

  const svg = root.querySelector(".topo-svg")
  const chips = root.querySelector(".topo-chips")
  const detail = root.querySelector(".topo-detail")
  const tooltip = createTooltip(root)

  const phone = window.matchMedia("(max-width: 640px)")
  const view = () => (phone.matches ? VIEWS.compact : VIEWS.wide)

  let active = null // selected device (opens the detail panel)
  let hot = null // device under the pointer or focus, to trace its link

  /* Diagram */

  function nodeMarkup(id) {
    const spec = NODES[id]
    const box = view().layout[id]
    const isActive = active === id
    const cy = box.y + box.h / 2
    return `
      <g class="t-node${isActive ? " is-active" : ""}" data-node="${id}" tabindex="0" role="button"
         aria-pressed="${isActive}" aria-label="${escapeHtml(spec.label)}, ${escapeHtml(spec.role)}">
        <rect class="t-box" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="10"/>
        <g class="t-icon" transform="translate(${box.x + 20} ${cy - 15}) scale(1.25)">${ICONS[box.type]}</g>
        <text class="t-label" x="${box.x + 64}" y="${box.y + 38}">${escapeHtml(spec.label)}</text>
        <text class="t-role" x="${box.x + 64}" y="${box.y + 60}">${escapeHtml(spec.role)}</text>
      </g>`
  }

  function edgeMarkup(edge) {
    const geo = view().edges[edge.id]
    const width = Math.round(edge.label.length * 6.6 + 26)
    return `
      <g class="t-edge" data-edge="${edge.id}">
        <path class="t-track" d="${geo.d}"/>
        <path class="t-flow${edge.span ? " is-span" : ""}" d="${geo.d}"/>
        <rect class="t-edge-pill" x="${geo.label.x - width / 2}" y="${geo.label.y - 12}" width="${width}" height="24" rx="12"/>
        <text class="t-edge-text" x="${geo.label.x}" y="${geo.label.y + 4}">${escapeHtml(edge.label)}</text>
      </g>`
  }

  function particleMarkup(edge) {
    const geo = view().edges[edge.id]
    const color = edge.span ? "#8b5cf6" : "#38bdf8"
    return `
      <circle r="4.5" fill="${color}">
        <animateMotion dur="${geo.duration}s" repeatCount="indefinite" path="${geo.d}"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="${geo.duration}s" repeatCount="indefinite"/>
      </circle>`
  }

  function renderDiagram() {
    const v = view()
    svg.setAttribute("viewBox", v.viewBox)
    svg.classList.toggle("is-compact", v === VIEWS.compact)
    svg.innerHTML = `
      <text class="t-tier-text" x="${v.tier.x}" y="${v.tier.y}" text-anchor="middle">External monitoring appliance (passive tap)</text>
      <rect class="t-lan" x="${v.lan.x}" y="${v.lan.y}" width="${v.lan.w}" height="${v.lan.h}" rx="14"/>
      <rect class="t-lan-pill" x="${v.lan.pillX}" y="${v.lan.pillY}" width="170" height="28" rx="14"/>
      <text class="t-lan-text" x="${v.lan.pillX + 18}" y="${v.lan.pillY + 18}">INTERNAL LAN</text>
      <text class="t-lan-note" x="${v.lan.note.x}" y="${v.lan.note.y}" text-anchor="end">No direct internet exposure</text>
      ${EDGES.map(edgeMarkup).join("")}
      <g class="topo-particles" aria-hidden="true">${EDGES.map(particleMarkup).join("")}</g>
      ${ORDER.map(nodeMarkup).join("")}`
  }

  /* Device chips are built once and updated in place. */

  function renderChips() {
    chips.innerHTML = ORDER.map(
      (id) => `<button class="topo-chip" type="button" data-node="${id}" aria-pressed="false">${escapeHtml(NODES[id].label)}</button>`,
    ).join("")
  }

  function renderDetail() {
    if (!active) {
      detail.innerHTML = `<p class="topo-detail-empty">Select a device in the diagram or from the list to see how it connects and what it does.</p>`
      return
    }
    const spec = NODES[active]
    detail.innerHTML = `
      <div>
        <p class="eyebrow">${escapeHtml(spec.role)}</p>
        <h3>${escapeHtml(spec.label)}</h3>
      </div>
      <dl class="spec-list">
        <div><dt>Role</dt><dd>${escapeHtml(spec.role)}</dd></div>
        <div><dt>Connection</dt><dd>${escapeHtml(spec.link)}</dd></div>
        <div><dt>Network zone</dt><dd>${escapeHtml(spec.zone)}</dd></div>
      </dl>
      <p class="topo-doc">${escapeHtml(spec.doc)}</p>`
  }

  /* State painting */

  function paintActive() {
    root.querySelectorAll(".topo-chip").forEach((el) => {
      el.setAttribute("aria-pressed", String(el.dataset.node === active))
    })
  }

  // The device being hovered (or, failing that, the selected one) lights up everywhere it appears.
  function paintHot() {
    const id = hot ?? active
    const edge = id ? NODES[id].edge : null
    root.querySelectorAll(".t-node, .topo-chip").forEach((el) => {
      el.classList.toggle("is-hot", el.dataset.node === id)
    })
    root.querySelectorAll(".t-edge").forEach((el) => el.classList.toggle("is-hot", el.dataset.edge === edge))
  }

  function render() {
    renderDiagram()
    renderDetail()
    paintActive()
    paintHot()
  }

  function select(id) {
    tooltip.hide()
    active = active === id ? null : id
    render()
  }

  function previewNode(node) {
    const spec = NODES[node.dataset.node]
    tooltip.show(
      node,
      `<strong>${escapeHtml(spec.label)}</strong><em>${escapeHtml(spec.role)}</em><small>Click for details</small>`,
    )
  }

  /* Events */

  const target = (event) => (event.target instanceof Element ? event.target.closest("[data-node]") : null)

  root.addEventListener("click", (event) => {
    const el = target(event)
    if (!el) return
    const fromDiagram = el.classList.contains("t-node")
    select(el.dataset.node)
    // The diagram is re-rendered, so hand keyboard focus to the new node.
    if (fromDiagram) svg.querySelector(`.t-node[data-node="${el.dataset.node}"]`)?.focus({ preventScroll: true })
  })

  // Mouse hover traces the cable; touch goes straight to the click action.
  root.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return
    const el = target(event)
    const id = el ? el.dataset.node : null
    if (id !== hot) {
      hot = id
      paintHot()
    }
    if (el && el.classList.contains("t-node")) previewNode(el)
    else tooltip.hide()
  })
  root.addEventListener("pointerleave", () => {
    hot = null
    paintHot()
    tooltip.hide()
  })

  root.addEventListener("focusin", (event) => {
    const el = target(event)
    if (!el) return
    hot = el.dataset.node
    paintHot()
    if (el.matches(":focus-visible") && el.classList.contains("t-node")) previewNode(el)
  })
  root.addEventListener("focusout", () => {
    hot = null
    paintHot()
    tooltip.hide()
  })

  root.querySelector(".topo-canvas").addEventListener("scroll", () => tooltip.hide(), { passive: true })

  svg.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return
    const node = event.target instanceof Element ? event.target.closest(".t-node") : null
    if (!node) return
    event.preventDefault()
    const id = node.dataset.node
    select(id)
    svg.querySelector(`.t-node[data-node="${id}"]`)?.focus({ preventScroll: true })
  })

  renderChips()
  render()
  phone.addEventListener("change", render)
}

/* ── Screenshot viewer: zoom tour + full-size dialog ───────────────────── */

// Each tour chip carries a region in the screenshot's own pixel space ("x,y,w,h"). The image is
// scaled and shifted so that region fills the frame, never beyond its natural resolution.
function initViewers() {
  for (const viewer of document.querySelectorAll("[data-viewer]")) {
    const stage = viewer.querySelector(".viewer-stage")
    const pan = viewer.querySelector(".viewer-pan")
    const spot = viewer.querySelector(".viewer-spot")
    const caption = viewer.querySelector(".viewer-caption")
    const chips = [...viewer.querySelectorAll(".viewer-chip")]
    const naturalW = Number(stage.dataset.w)
    const naturalH = Number(stage.dataset.h)
    let current = null

    function apply() {
      if (!current) {
        pan.style.transform = "none"
        spot.style.opacity = "0"
        return
      }
      const [x, y, w, h] = current
      const W = stage.clientWidth
      const H = stage.clientHeight
      const k = W / naturalW // on-screen size of one screenshot pixel at zoom 1
      const fit = Math.min(W / (w * k), H / (h * k)) * 0.96
      const zoom = Math.max(1, Math.min(fit, 1 / k)) // 1 / k = one screenshot pixel per device pixel
      const tx = Math.min(0, Math.max(W - W * zoom, -(x * k * zoom) + (W - w * k * zoom) / 2))
      const ty = Math.min(0, Math.max(H - H * zoom, -(y * k * zoom) + (H - h * k * zoom) / 2))
      pan.style.transform = `translate(${tx}px, ${ty}px) scale(${zoom})`
      spot.style.left = `${(x / naturalW) * 100}%`
      spot.style.top = `${(y / naturalH) * 100}%`
      spot.style.width = `${(w / naturalW) * 100}%`
      spot.style.height = `${(h / naturalH) * 100}%`
      spot.style.opacity = "1"
    }

    function show(chip) {
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)))
      current = chip.dataset.region ? chip.dataset.region.split(",").map(Number) : null
      const text = chip.dataset.text ?? "Pick an area above to zoom in."
      caption.innerHTML = `<strong>${escapeHtml(chip.dataset.title)}</strong><span>${escapeHtml(text)}</span>`
      apply()
    }

    chips.forEach((chip) => chip.addEventListener("click", () => show(chip)))
    window.addEventListener("resize", apply)
  }

  const dialog = document.getElementById("lightbox")
  if (!dialog) return
  const image = document.getElementById("lightbox-img")
  const scroller = document.getElementById("lightbox-scroll")
  const title = document.getElementById("lightbox-title")
  const zoomButton = document.getElementById("lightbox-zoom")
  let opener = null

  const setActual = (on) => {
    scroller.classList.toggle("is-actual", on)
    zoomButton.setAttribute("aria-pressed", String(on))
    zoomButton.textContent = on ? "FIT TO SCREEN" : "ACTUAL SIZE"
    if (!on) scroller.scrollTo(0, 0)
  }

  document.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest(".viewer-open") : null
    if (!button) return
    opener = button
    image.src = button.dataset.full
    image.alt = button.dataset.alt
    title.textContent = `${button.dataset.title} · full size`
    setActual(false)
    dialog.showModal()
    window.dispatchEvent(new CustomEvent("secura:modal", { detail: true }))
    document.getElementById("lightbox-close").focus()
  })
  zoomButton.addEventListener("click", () => setActual(!scroller.classList.contains("is-actual")))
  document.getElementById("lightbox-close").addEventListener("click", () => dialog.close())
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close()
  })
  dialog.addEventListener("close", () => {
    window.dispatchEvent(new CustomEvent("secura:modal", { detail: false }))
    opener?.focus()
  })
}

initToc()
initTopology()
initViewers()
