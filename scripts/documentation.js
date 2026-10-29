// Documentation page: on-page table of contents and the interactive network topology.

/* ── Table of contents ─────────────────────────────────────────────────── */

function initToc() {
  const links = [...document.querySelectorAll(".doc-toc a")]
  if (!links.length || typeof IntersectionObserver !== "function") return

  const byId = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]))
  const setActive = (id) => {
    byId.forEach((link, key) => {
      if (key === id) link.setAttribute("aria-current", "true")
      else link.removeAttribute("aria-current")
    })
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id)
      }
    },
    { rootMargin: "-30% 0px -55% 0px" },
  )
  byId.forEach((_, id) => {
    const section = document.getElementById(id)
    if (section) observer.observe(section)
  })
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

// Shared canvas: 1000 x 540. Nodes are the same hosts in both views.
const LAYOUT = {
  pc: { x: 350, y: 40, w: 300, h: 84, type: "monitor" },
  switch: { x: 350, y: 210, w: 300, h: 84, type: "switch" },
  server: { x: 50, y: 412, w: 280, h: 84, type: "server" },
  user1: { x: 360, y: 412, w: 280, h: 84, type: "user" },
  user2: { x: 670, y: 412, w: 280, h: 84, type: "user" },
}

const EDGE_GEOMETRY = {
  "pc-switch": { d: "M 500 124 L 500 210", label: { x: 500, y: 150 }, duration: 2.2 },
  "switch-server": { d: "M 500 294 L 500 352 L 190 352 L 190 412", label: { x: 190, y: 382 }, duration: 2.6 },
  "switch-user1": { d: "M 500 294 L 500 412", label: { x: 500, y: 382 }, duration: 2.0 },
  "switch-user2": { d: "M 500 294 L 500 352 L 810 352 L 810 412", label: { x: 810, y: 382 }, duration: 2.8 },
}

const MODES = {
  physical: {
    tab: "Physical Topology",
    description:
      "Physical infrastructure cabling, managed switch interfaces (Gi0/1–Gi0/8), and the dedicated SPAN mirror link.",
    caption:
      "The IDS or IDPS device supports monitoring and visibility. It does not imply automatic prevention of every security incident.",
    aria: "Physical network diagram: a mini PC connects to a network switch, which serves a web application and two client workstations inside the Internal LAN.",
    nodes: {
      pc: {
        label: "Mini PC / IDS",
        role: "Monitoring & visibility",
        ip: "192.168.10.254",
        protocol: "SPAN port, Syslog",
        port: "Gi0/8 · SPAN mirror",
        segment: "Outside the Internal LAN · SPAN mirror link",
        doc: "A dedicated monitoring host outside the Internal LAN boundary, fed by a SPAN (mirror) port on the managed switch. It observes traffic patterns for anomaly detection without sitting in the forwarding path — passive visibility, zero impact on latency.",
      },
      switch: {
        label: "Network Switch",
        role: "Local connectivity core",
        ip: "192.168.10.1",
        protocol: "VLAN, port mirroring",
        port: "Gi0/8 uplink · Gi0/1–3 access",
        segment: "Internal LAN 192.168.10.0/24",
        doc: "The connectivity core inside the Internal LAN. Uplink Gi0/8 carries mirrored traffic to the IDS; access ports Gi0/1, Gi0/2, and Gi0/3 serve the web application and both client nodes. VLANs segment user, server, and monitoring traffic.",
      },
      server: {
        label: "Web Application",
        role: "Application host",
        ip: "192.168.10.10",
        protocol: "HTTPS :443",
        port: "Gi0/1 · HTTPS :443",
        segment: "Internal LAN 192.168.10.0/24",
        doc: "Hosts the SECURA web application on an isolated LAN segment behind switch port Gi0/1. It has no direct internet exposure — users reach it only through the managed switch. TLS termination happens here with local certificate trust.",
      },
      user1: {
        label: "Workstation 1",
        role: "Authorized endpoint",
        ip: "192.168.10.20",
        protocol: "HTTPS Client",
        port: "Gi0/2 · HTTPS Client",
        segment: "Internal LAN 192.168.10.0/24",
        doc: "An authorized workstation inside the private network on switch port Gi0/2. Access to SECURA follows role-based permissions, and requests for original documents go through the controlled approval workflow.",
      },
      user2: {
        label: "Workstation 2",
        role: "Authorized endpoint",
        ip: "192.168.10.30",
        protocol: "HTTPS Client",
        port: "Gi0/3 · HTTPS Client",
        segment: "Internal LAN 192.168.10.0/24",
        doc: "A second authorized workstation on switch port Gi0/3. Both endpoints operate under the same role-based access model; sessions are logged for review by the security officer role.",
      },
    },
    edges: [
      { id: "pc-switch", label: "Gi0/8 · SPAN", span: true },
      { id: "switch-server", label: "Gi0/1 · Server" },
      { id: "switch-user1", label: "Gi0/2 · Client" },
      { id: "switch-user2", label: "Gi0/3 · Client" },
    ],
  },
  logical: {
    tab: "Logical Data Flow",
    description:
      "How data moves between authorized users, the SECURA application, and the passive monitoring host — flows, not cables.",
    caption:
      "Monitoring receives mirrored copies and log streams only. It never sits in the request path between users and the application.",
    aria: "Logical data flow diagram: authorized user flows reach the SECURA application through the switch, while monitoring observes passively.",
    nodes: {
      pc: {
        label: "IDS / SIEM Telemetry",
        role: "Observes, never forwards",
        ip: "192.168.10.254",
        protocol: "Mirrored copies only",
        port: "Passive analysis",
        segment: "Passive monitoring · mirrored copies only",
        doc: "At the logical layer the monitoring host consumes mirrored traffic and log streams. It never sits in the request path — application traffic between clients and the web application is unaffected by monitoring.",
      },
      switch: {
        label: "Transport & Segmentation",
        role: "Logical boundary",
        ip: "192.168.10.1",
        protocol: "VLAN segmentation",
        port: "SPAN replication",
        segment: "Logical boundary · traffic stays in LAN",
        doc: "Logically, the switch is the boundary that keeps flows separated: user-to-server traffic stays inside the LAN, while monitoring receives only copies. Requests to original documents traverse this boundary under the approval workflow.",
      },
      server: {
        label: "SECURA Application",
        role: "Processes documents",
        ip: "192.168.10.10",
        protocol: "HTTPS request/response",
        port: "Flow: upload → anonymize → share",
        segment: "Logical boundary · traffic stays in LAN",
        doc: "Logical destination for authorized sessions: upload, NLP-based detection, anonymization, and controlled sharing. Every step validates the caller's role before proceeding.",
      },
      user1: {
        label: "Authorized User Flow",
        role: "Initiates requests",
        ip: "192.168.10.20",
        protocol: "HTTPS Client",
        port: "Flow: authenticate → upload/share",
        segment: "Logical boundary · traffic stays in LAN",
        doc: "Logical view of a user session: authenticate, upload or process documents, and share protected files. Original-file requests pause until a security officer approves them.",
      },
      user2: {
        label: "Authorized User Flow",
        role: "Initiates requests",
        ip: "192.168.10.30",
        protocol: "HTTPS Client",
        port: "Flow: authenticate → upload/share",
        segment: "Logical boundary · traffic stays in LAN",
        doc: "A second logical user flow with the same guarantees. Both endpoints see only protected documents unless an original-file request is explicitly approved.",
      },
    },
    edges: [
      { id: "pc-switch", label: "Mirrored copies", span: true },
      { id: "switch-server", label: "HTTPS · Application" },
      { id: "switch-user1", label: "HTTPS · User session" },
      { id: "switch-user2", label: "HTTPS · User session" },
    ],
  },
}

const ORDER = ["pc", "switch", "server", "user1", "user2"]

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

function initTopology() {
  const root = document.getElementById("topology-root")
  if (!root) return

  const svg = root.querySelector(".topo-svg")
  const tabs = [...root.querySelectorAll(".topo-tab")]
  const description = root.querySelector(".topo-desc")
  const chips = root.querySelector(".topo-chips")
  const detail = root.querySelector(".topo-detail")
  const caption = document.getElementById("topo-caption")

  let mode = "physical"
  let active = null

  function nodeMarkup(id, spec) {
    const box = LAYOUT[id]
    const isActive = active === id
    const cy = box.y + box.h / 2
    return `
      <g class="t-node${isActive ? " is-active" : ""}" data-node="${id}" tabindex="0" role="button"
         aria-pressed="${isActive}" aria-label="${escapeHtml(spec.label)}, ${escapeHtml(spec.ip)}, ${escapeHtml(spec.role)}">
        <rect class="t-box" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="10"/>
        <g class="t-icon" transform="translate(${box.x + 20} ${cy - 15}) scale(1.25)">${ICONS[box.type]}</g>
        <text class="t-label" x="${box.x + 64}" y="${box.y + 32}">${escapeHtml(spec.label)}</text>
        <text class="t-ip" x="${box.x + 64}" y="${box.y + 52}">${escapeHtml(spec.ip)}</text>
        <text class="t-role" x="${box.x + 64}" y="${box.y + 70}">${escapeHtml(spec.role)}</text>
      </g>`
  }

  function edgeMarkup(edge) {
    const geo = EDGE_GEOMETRY[edge.id]
    const width = Math.round(edge.label.length * 6.6 + 26)
    return `
      <g>
        <path class="t-track" d="${geo.d}"/>
        <path class="t-flow${edge.span ? " is-span" : ""}" d="${geo.d}"/>
        <rect class="t-edge-pill" x="${geo.label.x - width / 2}" y="${geo.label.y - 12}" width="${width}" height="24" rx="12"/>
        <text class="t-edge-text" x="${geo.label.x}" y="${geo.label.y + 4}">${escapeHtml(edge.label)}</text>
      </g>`
  }

  function particleMarkup(edge) {
    const geo = EDGE_GEOMETRY[edge.id]
    const color = edge.span ? "#8b5cf6" : "#38bdf8"
    return `
      <circle r="4.5" fill="${color}">
        <animateMotion dur="${geo.duration}s" repeatCount="indefinite" path="${geo.d}"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="${geo.duration}s" repeatCount="indefinite"/>
      </circle>`
  }

  function renderDiagram() {
    const view = MODES[mode]
    svg.setAttribute("aria-label", view.aria)
    svg.innerHTML = `
      <text class="t-tier-text" x="500" y="28" text-anchor="middle">External monitoring appliance (passive tap)</text>
      <rect class="t-lan" x="20" y="172" width="960" height="352" rx="14"/>
      <rect class="t-lan-pill" x="44" y="158" width="304" height="28" rx="14"/>
      <text class="t-lan-text" x="62" y="176">INTERNAL LAN · 192.168.10.0/24</text>
      ${view.edges.map(edgeMarkup).join("")}
      <g class="topo-particles" aria-hidden="true">${view.edges.map(particleMarkup).join("")}</g>
      ${ORDER.map((id) => nodeMarkup(id, view.nodes[id])).join("")}`
  }

  function renderChips() {
    const view = MODES[mode]
    chips.innerHTML = ORDER.map(
      (id) =>
        `<button class="topo-chip" type="button" data-node="${id}" aria-pressed="${active === id}">${escapeHtml(view.nodes[id].label)}</button>`,
    ).join("")
  }

  function renderDetail() {
    if (!active) {
      detail.innerHTML = `<p class="topo-detail-empty">Select a device in the diagram to see its address, protocol, and role.</p>`
      return
    }
    const spec = MODES[mode].nodes[active]
    detail.innerHTML = `
      <div>
        <p class="eyebrow">${escapeHtml(spec.role)}</p>
        <h3>${escapeHtml(spec.label)}</h3>
      </div>
      <dl class="spec-list">
        <div><dt>IP address</dt><dd>${escapeHtml(spec.ip)}</dd></div>
        <div><dt>Protocol</dt><dd>${escapeHtml(spec.protocol)}</dd></div>
        <div><dt>Interface / flow</dt><dd>${escapeHtml(spec.port)}</dd></div>
        <div><dt>Segment</dt><dd>${escapeHtml(spec.segment)}</dd></div>
      </dl>
      <p class="topo-doc">${escapeHtml(spec.doc)}</p>`
  }

  function render() {
    const view = MODES[mode]
    tabs.forEach((tab) => {
      const selected = tab.dataset.mode === mode
      tab.setAttribute("aria-selected", String(selected))
      tab.tabIndex = selected ? 0 : -1
    })
    description.textContent = view.description
    if (caption) caption.textContent = view.caption
    renderDiagram()
    renderChips()
    renderDetail()
  }

  function select(id) {
    active = active === id ? null : id
    render()
  }

  function setMode(next, focusTab = false) {
    if (!MODES[next] || next === mode) return
    mode = next
    render()
    if (focusTab) root.querySelector(`.topo-tab[data-mode="${next}"]`)?.focus()
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setMode(tab.dataset.mode))
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
      event.preventDefault()
      const step = event.key === "ArrowRight" ? 1 : -1
      setMode(tabs[(index + step + tabs.length) % tabs.length].dataset.mode, true)
    })
  })

  root.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-node]") : null
    if (!target) return
    select(target.dataset.node)
    // Keep keyboard focus on the control that was used after the re-render.
    root.querySelector(`${target.classList.contains("topo-chip") ? ".topo-chip" : ".t-node"}[data-node="${target.dataset.node}"]`)?.focus({ preventScroll: true })
  })

  svg.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return
    const target = event.target instanceof Element ? event.target.closest(".t-node") : null
    if (!target) return
    event.preventDefault()
    const id = target.dataset.node
    select(id)
    svg.querySelector(`.t-node[data-node="${id}"]`)?.focus({ preventScroll: true })
  })

  render()
}

initToc()
initTopology()
