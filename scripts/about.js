// About page: the document anonymization simulation and the technology filter.
// The simulation is local and uses fictional sample data. Nothing is uploaded,
// stored or processed by a model.

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

/* ── Sample data ───────────────────────────────────────────────────────── */

const TYPES = {
  person: { label: "Person" },
  id: { label: "ID number" },
  email: { label: "Email" },
  phone: { label: "Phone" },
  address: { label: "Address" },
  org: { label: "Organization" },
  date: { label: "Date" },
}

const METHODS = {
  redact: {
    name: "Redact",
    action: "Redacted",
    note: "Replaces the value with solid blocks. Nothing about the original can be recovered from the copy.",
  },
  mask: {
    name: "Mask",
    action: "Masked",
    note: "Hides most characters but keeps the shape, such as the last four digits of an ID number.",
  },
  pseudonym: {
    name: "Pseudonym",
    action: "Replaced",
    note: "Swaps the value for a realistic synthetic one so the document still reads naturally.",
  },
}

const FILE_NAME = "hr_case_summary_0417.pdf"

const ENTITIES = []
const ent = (type, value, fake, confidence) => {
  const entity = { index: ENTITIES.length, type, value, fake, confidence, el: null }
  ENTITIES.push(entity)
  return entity
}

const DOCUMENT = [
  { kind: "title", parts: ["HR case summary"] },
  { kind: "meta", parts: ["Ref. HR-2026-0417 · Filed ", ent("date", "14 April 2026", "02 June 2026", 96)] },
  { kind: "field", label: "Employee", parts: [ent("person", "Aisyah binti Rahman", "Nurul Izzati binti Hamid", 99)] },
  { kind: "field", label: "ID number", parts: [ent("id", "900214-14-5566", "880731-10-4412", 99)] },
  { kind: "field", label: "Employer", parts: [ent("org", "Meridian Logistics Sdn Bhd", "Harbor Freight Sdn Bhd", 94)] },
  {
    kind: "field",
    label: "Contact",
    parts: [
      ent("email", "aisyah.rahman@example.com", "izzati.hamid@example.org", 100),
      " · ",
      ent("phone", "+60 12-345 6789", "+60 17-882 4410", 98),
    ],
  },
  {
    kind: "field",
    label: "Address",
    parts: [
      ent(
        "address",
        "12, Jalan Mawar 3, Taman Bunga, 47000 Petaling Jaya, Selangor",
        "88, Jalan Kenanga 5, Taman Indah, 40000 Shah Alam, Selangor",
        93,
      ),
    ],
  },
  { kind: "heading", parts: ["Summary"] },
  {
    kind: "text",
    parts: [
      "On ",
      ent("date", "3 March 2026", "21 May 2026", 95),
      ", ",
      ent("person", "Aisyah", "Nurul", 97),
      " reported a payroll discrepancy to her line manager, ",
      ent("person", "Daniel Lim", "Farid Hakim", 98),
      ". The payroll team confirmed the correction and will pay the difference to the account on file.",
    ],
  },
  { kind: "text", parts: ["This summary is restricted to the authorised review group."] },
]

/* ── Output formats ────────────────────────────────────────────────────── */

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

// Keeps the first letter or digit and hides the rest; punctuation stays.
function maskWord(word) {
  let seen = false
  return word.replace(/[\p{L}\p{N}]/gu, (char) => {
    if (seen) return "*"
    seen = true
    return char
  })
}

function maskValue({ type, value }) {
  if (type === "id") return value.replace(/\d(?=.*\d{4}$)/g, "*")
  if (type === "phone") {
    const [code, ...rest] = value.split(" ")
    return `${code} ${rest.join(" ").replace(/\d(?=.*\d{2}$)/g, "*")}`
  }
  if (type === "email") {
    const [local, domain] = value.split("@")
    const dot = domain.lastIndexOf(".")
    return `${maskWord(local)}@${maskWord(domain.slice(0, dot))}${domain.slice(dot)}`
  }
  if (type === "date") {
    const words = value.split(" ")
    return words.map((word, i) => (i === words.length - 1 ? word : "*".repeat(word.length))).join(" ")
  }
  return value.split(" ").map(maskWord).join(" ")
}

function outputFor(entity, mode) {
  if (mode === "mask") return maskValue(entity)
  if (mode === "pseudonym") return entity.fake
  return "█".repeat(Math.min(Math.max(entity.value.length, 6), 20))
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function tween(duration, onFrame, alive) {
  return new Promise((resolve) => {
    const start = performance.now()
    const tick = (now) => {
      if (!alive()) return resolve()
      const progress = Math.min(1, (now - start) / duration)
      onFrame(progress)
      if (progress < 1) requestAnimationFrame(tick)
      else resolve()
    }
    requestAnimationFrame(tick)
  })
}

/* ── Simulation ────────────────────────────────────────────────────────── */

function initSimulation() {
  const root = document.getElementById("sim")
  if (!root) return

  const $ = (selector) => root.querySelector(selector)
  const paper = $("#sim-paper")
  const doc = $("#sim-doc")
  const chipsEl = $("#sim-chips")
  const inspector = $("#sim-inspector")
  const statusEl = $("#sim-status")
  const fileEl = $("#sim-file")
  const runButton = $("#sim-run")
  const requestButton = $("#sim-request")
  const requestNote = $("#sim-request-note")
  const result = $("#sim-result")
  const methodNote = $("#sim-method-note")
  const methodSample = $("#sim-method-sample")
  const steps = [...root.querySelectorAll(".sim-steps li")]
  const modeButtons = [...root.querySelectorAll("[data-mode]")]
  const viewButtons = [...root.querySelectorAll("[data-view]")]

  const state = {
    stage: -1, // -1 idle, 0 upload, 1 detect, 2 anonymize, 3 share
    complete: false,
    running: false,
    runId: 0,
    view: "original",
    mode: "redact",
    enabled: new Set(Object.keys(TYPES)),
    found: new Set(),
    converted: new Set(),
    selected: null,
    requested: false,
    upload: 0,
  }

  /* Build the document and the policy chips */

  paper.replaceChildren()
  for (const block of DOCUMENT) {
    const row = document.createElement("div")
    row.className = `sim-${block.kind}`
    let target = row
    if (block.label) {
      const label = document.createElement("span")
      label.className = "sim-label"
      label.textContent = block.label
      target = document.createElement("span")
      target.className = "sim-value"
      row.append(label, target)
    }
    for (const part of block.parts) {
      if (typeof part === "string") {
        target.append(part)
        continue
      }
      const el = document.createElement("span")
      el.className = "ent"
      el.dataset.type = part.type
      el.dataset.index = String(part.index)
      el.textContent = part.value
      part.el = el
      target.append(el)
    }
    paper.append(row)
  }

  const chips = Object.entries(TYPES).map(([key, type]) => {
    const chip = document.createElement("button")
    chip.type = "button"
    chip.className = "sim-chip"
    chip.dataset.type = key
    chip.setAttribute("aria-pressed", "true")
    chip.innerHTML = `${esc(type.label)} <b>0</b>`
    chipsEl.append(chip)
    return chip
  })

  /* Derived values */

  const protectedCount = () =>
    ENTITIES.filter((e) => state.converted.has(e.index) && state.enabled.has(e.type)).length

  /* Painting */

  function paintEntity(entity) {
    const converted = state.view === "anonymized" && state.converted.has(entity.index)
    const safe = converted && state.enabled.has(entity.type)
    const kept = converted && !state.enabled.has(entity.type)
    const found = state.found.has(entity.index)
    const el = entity.el
    const text = safe ? outputFor(entity, state.mode) : entity.value
    if (el.textContent !== text) {
      el.textContent = text
      el.classList.remove("is-swap")
      void el.offsetWidth
      el.classList.add("is-swap")
    }
    el.classList.toggle("is-found", found && !safe)
    el.classList.toggle("is-safe", safe)
    el.classList.toggle("is-kept", kept)
    el.classList.toggle("is-active", state.selected === entity.index)
    if (found) {
      el.tabIndex = 0
      el.setAttribute("role", "button")
      el.setAttribute("aria-label", `${TYPES[entity.type].label}, ${safe ? "protected" : "detected"}`)
    } else {
      el.removeAttribute("tabindex")
      el.removeAttribute("role")
      el.removeAttribute("aria-label")
    }
  }

  function paintChips() {
    for (const chip of chips) {
      const key = chip.dataset.type
      chip.setAttribute("aria-pressed", String(state.enabled.has(key)))
      chip.querySelector("b").textContent = String(
        ENTITIES.filter((e) => e.type === key && state.found.has(e.index)).length,
      )
    }
  }

  function paintSteps() {
    steps.forEach((li, i) => {
      li.classList.toggle("is-done", state.complete || i < state.stage)
      const button = li.querySelector("button")
      if (i === state.stage && !state.complete) button.setAttribute("aria-current", "step")
      else button.removeAttribute("aria-current")
    })
  }

  function paintMetrics() {
    const safe = protectedCount()
    const converted = state.converted.size
    $("#m-found").textContent = String(state.found.size)
    $("#m-safe").textContent = String(safe)
    $("#m-kept").textContent = String(converted - safe)
  }

  function paintView() {
    for (const button of viewButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.view === state.view))
      if (button.dataset.view === "anonymized") button.disabled = state.stage < 2
    }
  }

  function paintMethod() {
    const method = METHODS[state.mode]
    root.dataset.mode = state.mode
    for (const button of modeButtons) button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode))
    methodNote.textContent = method.note
    const sample = ENTITIES.find((e) => e.type === "person")
    methodSample.innerHTML = `<span>${esc(sample.value)}</span><i aria-hidden="true">→</i><strong>${esc(outputFor(sample, state.mode))}</strong>`
  }

  function paintResult() {
    result.classList.toggle("is-idle", !state.complete)
    requestButton.disabled = !state.complete || state.requested
    requestButton.textContent = state.requested ? "REQUEST PENDING" : "REQUEST ORIGINAL"
    requestNote.textContent = !state.complete
      ? "Unlocks once the anonymized copy is shared."
      : state.requested
        ? "Sent to the Security Officer for review. Simulation only, nothing was sent."
        : "Access needs an approved request from the Security Officer."
  }

  function paintRun() {
    runButton.disabled = state.running
    runButton.innerHTML = state.running
      ? "RUNNING…"
      : state.stage >= 0
        ? '<span aria-hidden="true">↻</span> RUN AGAIN'
        : '<span aria-hidden="true">▶</span> RUN SIMULATION'
    root.classList.toggle("is-running", state.running)
  }

  function statusText() {
    const total = ENTITIES.length
    const categories = new Set(ENTITIES.map((e) => e.type)).size
    const safe = protectedCount()
    if (state.stage < 0) return "Ready. Run the simulation, or open any stage to jump straight to it."
    if (state.stage === 0) {
      return state.running ? "Stage 1 of 4 · Uploading the document…" : "Stage 1 of 4 · Document uploaded and queued."
    }
    if (state.stage === 1) {
      return state.running && state.found.size < total
        ? "Stage 2 of 4 · Scanning for sensitive information…"
        : `Stage 2 of 4 · ${state.found.size} sensitive items detected across ${categories} categories.`
    }
    if (state.stage === 2) {
      if (state.running && state.converted.size < total) {
        return `Stage 3 of 4 · Applying policy (${METHODS[state.mode].name.toLowerCase()})…`
      }
      return safe === 0
        ? "Stage 3 of 4 · No categories selected, so the copy is unchanged."
        : `Stage 3 of 4 · ${safe} of ${total} items protected.`
    }
    return safe === 0
      ? "Stage 4 of 4 · No categories are protected, so the shared copy still exposes everything."
      : "Stage 4 of 4 · The anonymized copy is ready for authorized departments. The original stays locked."
  }

  function paintStatus() {
    const text = statusText()
    if (statusEl.textContent !== text) statusEl.textContent = text
    const suffix = state.stage < 0 ? "ready to upload" : state.stage === 0 && state.running ? `uploading ${Math.round(state.upload * 100)}%` : "uploaded"
    fileEl.textContent = `${FILE_NAME} · ${suffix}`
  }

  function paintInspector() {
    const entity = ENTITIES[state.selected]
    if (!entity) {
      inspector.innerHTML = `<p class="sim-hint">${
        state.stage < 1
          ? "Run the simulation to detect sensitive information. Detected items become selectable."
          : "Hover or focus a highlighted item to see how it was classified."
      }</p>`
      return
    }
    const converted = state.converted.has(entity.index)
    const enabled = state.enabled.has(entity.type)
    const hidden = state.view === "anonymized" && converted && enabled
    const outcome = !converted ? "Pending" : enabled ? METHODS[state.mode].action : "Left visible"
    inspector.innerHTML = `
      <div class="insp-head"><span class="insp-type" data-type="${entity.type}">${esc(TYPES[entity.type].label)}</span></div>
      <dl class="insp-list">
        <div><dt>Confidence</dt><dd><span class="insp-meter" aria-hidden="true"><i style="width:${entity.confidence}%"></i></span>${entity.confidence}%</dd></div>
        <div><dt>Policy</dt><dd>${enabled ? "Protect" : "Leave visible"}</dd></div>
        <div><dt>Result</dt><dd>${outcome}</dd></div>
        <div><dt>Original</dt><dd>${hidden ? "Hidden in the shared copy" : esc(entity.value)}</dd></div>
      </dl>`
  }

  function paintAll() {
    for (const entity of ENTITIES) paintEntity(entity)
    paintChips()
    paintSteps()
    paintMetrics()
    paintView()
    paintResult()
    paintRun()
    paintStatus()
    paintInspector()
  }

  /* State changes */

  function select(index) {
    if (state.selected === index) return
    const previous = state.selected
    state.selected = index
    if (previous !== null) paintEntity(ENTITIES[previous])
    if (index !== null) paintEntity(ENTITIES[index])
    paintInspector()
  }

  function cancelRun() {
    state.runId += 1
    state.running = false
    doc.classList.remove("is-scanning")
  }

  // Sets the simulation to a finished state for the given stage, without animation.
  function jumpTo(stage) {
    cancelRun()
    state.stage = stage
    state.complete = stage === 3
    state.found = new Set(stage >= 1 ? ENTITIES.map((e) => e.index) : [])
    state.converted = new Set(stage >= 2 ? ENTITIES.map((e) => e.index) : [])
    state.view = stage >= 2 ? "anonymized" : "original"
    state.requested = false
    state.upload = stage >= 0 ? 1 : 0
    if (stage < 1) state.selected = null
    root.style.setProperty("--upload", String(state.upload))
    doc.style.setProperty("--beam", "0")
    paintAll()
  }

  function foundEntity(entity) {
    state.found.add(entity.index)
    paintEntity(entity)
    paintChips()
    paintMetrics()
    select(entity.index)
  }

  async function run() {
    if (state.running) return
    jumpTo(-1)
    if (reducedMotion) {
      jumpTo(3)
      return
    }
    const token = state.runId
    const alive = () => token === state.runId
    state.running = true

    state.stage = 0
    paintAll()
    await tween(
      900,
      (p) => {
        state.upload = p
        root.style.setProperty("--upload", p.toFixed(3))
        paintStatus()
      },
      alive,
    )
    if (!alive()) return

    state.stage = 1
    doc.classList.add("is-scanning")
    paintAll()
    const box = doc.getBoundingClientRect()
    const marks = ENTITIES.map((e) => {
      const r = e.el.getBoundingClientRect()
      return (r.top + r.height / 2 - box.top) / box.height
    })
    await tween(
      2600,
      (p) => {
        doc.style.setProperty("--beam", p.toFixed(4))
        for (const e of ENTITIES) if (!state.found.has(e.index) && p >= marks[e.index]) foundEntity(e)
      },
      alive,
    )
    if (!alive()) return
    for (const e of ENTITIES) if (!state.found.has(e.index)) foundEntity(e)
    doc.classList.remove("is-scanning")
    paintStatus()
    await wait(500)
    if (!alive()) return

    state.stage = 2
    state.view = "anonymized"
    paintAll()
    for (const e of ENTITIES) {
      await wait(140)
      if (!alive()) return
      state.converted.add(e.index)
      paintEntity(e)
      paintMetrics()
      select(e.index)
    }
    await wait(450)
    if (!alive()) return

    state.stage = 3
    state.complete = true
    state.running = false
    paintAll()
  }

  /* Events */

  runButton.addEventListener("click", run)
  $("#sim-reset").addEventListener("click", () => jumpTo(-1))
  requestButton.addEventListener("click", () => {
    state.requested = true
    paintResult()
  })

  steps.forEach((li, i) => li.querySelector("button").addEventListener("click", () => jumpTo(i)))

  for (const button of viewButtons) {
    button.addEventListener("click", () => {
      state.view = button.dataset.view
      paintAll()
    })
  }

  for (const button of modeButtons) {
    button.addEventListener("click", () => {
      state.mode = button.dataset.mode
      paintMethod()
      paintAll()
    })
  }

  for (const chip of chips) {
    chip.addEventListener("click", () => {
      const key = chip.dataset.type
      if (state.enabled.has(key)) state.enabled.delete(key)
      else state.enabled.add(key)
      paintAll()
    })
  }

  const pick = (event) => {
    const target = event.target instanceof Element ? event.target.closest(".ent") : null
    if (target && state.found.has(Number(target.dataset.index))) select(Number(target.dataset.index))
  }
  paper.addEventListener("pointerover", pick)
  paper.addEventListener("focusin", pick)
  paper.addEventListener("click", pick)

  paintMethod()
  paintAll()

  // Play once when the demo first comes into view.
  if (!reducedMotion && typeof IntersectionObserver === "function") {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        if (state.stage < 0) run()
      },
      { threshold: 0.4 },
    )
    // The whole demo can be taller than the viewport, so watch the document pane.
    observer.observe($(".sim-viewer"))
  }
}

/* ── Technology filter ─────────────────────────────────────────────────── */

function initTech() {
  const root = document.getElementById("tech")
  if (!root) return
  const tiles = [...root.querySelectorAll(".tech-tile")]
  const buttons = [...root.querySelectorAll("[data-filter]")]
  const count = root.querySelector(".tech-count")

  const apply = (key) => {
    let shown = 0
    for (const tile of tiles) {
      const match = key === "all" || tile.dataset.cat.split(" ").includes(key)
      tile.classList.toggle("is-dim", !match)
      if (match) shown += 1
    }
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.filter === key))
    count.textContent = key === "all" ? `Showing all ${tiles.length} tools` : `Highlighting ${shown} of ${tiles.length} tools`
  }

  for (const button of buttons) button.addEventListener("click", () => apply(button.dataset.filter))

  for (const tile of tiles) {
    tile.addEventListener("pointermove", (event) => {
      const box = tile.getBoundingClientRect()
      tile.style.setProperty("--mx", `${event.clientX - box.left}px`)
      tile.style.setProperty("--my", `${event.clientY - box.top}px`)
    })
  }
}

initSimulation()
initTech()
