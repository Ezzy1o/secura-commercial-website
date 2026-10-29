// Shared behaviour for About / Documentation / Contact.

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
const finePointer = window.matchMedia("(pointer: fine)").matches

/* ── Scroll progress (header underline + shader mix) ───────────────────── */

let scrollProgress = 0
const scrollListeners = new Set()

function measureScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  scrollProgress = Math.min(1, Math.max(0, window.scrollY / max))
  document.documentElement.style.setProperty("--scroll-progress", scrollProgress.toFixed(4))
  scrollListeners.forEach((listener) => listener())
}

window.addEventListener("scroll", measureScroll, { passive: true })
window.addEventListener("resize", measureScroll, { passive: true })
measureScroll()

/* ── Background: the landing's obsidian shader, without Three.js ───────── */

const vertexSource = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`

const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uTime;
uniform float uScroll;
uniform float uLines;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float time = uTime * 0.035;
  float flow = fbm(p * 2.2 + vec2(time, -uScroll * 2.0));
  float detail = fbm(p * 5.0 - vec2(time * 0.65, time * 0.4));
  float wave = sin((p.x * 2.1 + p.y * 1.35 + flow * 2.7) * 5.0 - time * 3.0);
  float ridge = 1.0 - smoothstep(0.02, 0.24, abs(wave + (detail - 0.5) * 0.62));
  float specular = pow(max(0.0, ridge), 5.0) * (0.18 + detail * 0.32);
  float falloff = smoothstep(1.18, 0.08, length(p * vec2(0.86, 1.0)));

  vec3 obsidian = vec3(0.0314, 0.0235, 0.0549);
  vec3 violet = vec3(0.1765, 0.0314, 0.4706);
  vec3 midnight = vec3(0.0196, 0.0314, 0.0784);
  vec3 deepCyan = vec3(0.0549, 0.2275, 0.3529);
  vec3 base = mix(obsidian, midnight, smoothstep(0.0, 1.0, uScroll));
  vec3 mineral = mix(violet, deepCyan, smoothstep(0.0, 1.0, uScroll));
  float veining = smoothstep(0.43, 0.84, flow + detail * 0.24) * falloff;
  vec3 color = base + mineral * veining * 0.19;
  // uLines scales the topographic ridges only; the base colour is untouched.
  color += vec3(0.70, 0.78, 1.0) * specular * falloff * 0.58 * uLines;
  color += mineral * (0.035 + 0.08 * falloff);
  gl_FragColor = vec4(color, 1.0);
}`

function initBackground() {
  const canvas = document.getElementById("bg")
  if (!canvas) return
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" })
  if (!gl) return

  const compile = (type, source) => {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
      return null
    }
    return shader
  }

  const vertex = compile(gl.VERTEX_SHADER, vertexSource)
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource)
  if (!vertex || !fragment) return

  const program = gl.createProgram()
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, "position")
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const uTime = gl.getUniformLocation(program, "uTime")
  const uScroll = gl.getUniformLocation(program, "uScroll")
  const uResolution = gl.getUniformLocation(program, "uResolution")

  // Line strength: 0.5-0.8 keeps depth without competing with body text (1 is the
  // landing's full strength). A page can override it with <canvas data-lines="0.6">.
  const lines = Number.parseFloat(canvas.dataset.lines ?? "0.7")
  gl.uniform1f(gl.getUniformLocation(program, "uLines"), Number.isFinite(lines) ? lines : 0.7)

  // The shader is soft, so rendering at half resolution is invisible and cheap.
  const resize = () => {
    canvas.width = Math.max(2, Math.round(window.innerWidth * 0.5))
    canvas.height = Math.max(2, Math.round(window.innerHeight * 0.5))
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uResolution, canvas.width, canvas.height)
  }

  const draw = (time) => {
    gl.uniform1f(uTime, time)
    gl.uniform1f(uScroll, scrollProgress)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  resize()

  if (reducedMotion) {
    draw(0)
    window.addEventListener("resize", () => {
      resize()
      draw(0)
    })
    scrollListeners.add(() => draw(0))
    return
  }

  window.addEventListener("resize", resize)
  const start = performance.now()
  const frame = (now) => {
    draw((now - start) / 1000)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

/* ── Custom cursor (fine pointers only) ────────────────────────────────── */

function initCursor() {
  const dot = document.querySelector(".cursor-dot")
  const ring = document.querySelector(".cursor-ring")
  if (!dot || !ring || !finePointer || reducedMotion) return

  let x = window.innerWidth / 2
  let y = window.innerHeight / 2
  let ringX = x
  let ringY = y

  window.addEventListener(
    "pointermove",
    (event) => {
      if (!document.documentElement.classList.contains("has-cursor")) {
        document.documentElement.classList.add("has-cursor")
      }
      x = event.clientX
      y = event.clientY
      dot.style.left = `${x}px`
      dot.style.top = `${y}px`
    },
    { passive: true },
  )

  const follow = () => {
    ringX += (x - ringX) * 0.2
    ringY += (y - ringY) * 0.2
    ring.style.left = `${ringX}px`
    ring.style.top = `${ringY}px`
    requestAnimationFrame(follow)
  }
  requestAnimationFrame(follow)

  const interactive = "a, button, input, textarea, [role='button']"
  document.addEventListener("pointerover", (event) => {
    if (event.target instanceof Element && event.target.closest(interactive)) {
      ring.classList.add("is-hovering")
    }
  })
  document.addEventListener("pointerout", (event) => {
    if (event.target instanceof Element && event.target.closest(interactive)) {
      ring.classList.remove("is-hovering")
    }
  })
}

/* ── Access dialog ─────────────────────────────────────────────────────── */

function initDialog() {
  const dialog = document.getElementById("access-dialog")
  const open = document.getElementById("open-access")
  const close = document.getElementById("close-access")
  if (!dialog || !open || !close) return

  open.addEventListener("click", () => {
    dialog.showModal()
    close.focus()
  })
  close.addEventListener("click", () => dialog.close())
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close()
  })
  dialog.addEventListener("close", () => open.focus())
}

/* ── Headline letter animation (same effect as the landing) ────────────── */

function initTitles() {
  for (const title of document.querySelectorAll("[data-split]")) {
    const text = title.textContent.trim()
    const words = text.split(/\s+/)
    title.setAttribute("aria-label", text)
    let letterIndex = 0
    const content = words.flatMap((word, wordIndex) => {
      const wordElement = document.createElement("span")
      wordElement.className = "title-word"
      wordElement.setAttribute("aria-hidden", "true")
      wordElement.append(
        ...Array.from(word, (character) => {
          const letter = document.createElement("span")
          letter.className = "title-letter"
          letter.style.setProperty("--letter-delay", `${Math.min(letterIndex++, 28) * 22}ms`)
          letter.textContent = character
          return letter
        }),
      )
      if (wordIndex === words.length - 1) return [wordElement]
      // A plain space collapses at a line break; an inline-block spacer would show up as an indent.
      return [wordElement, document.createTextNode(" ")]
    })
    title.replaceChildren(...content)
    requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add("is-in")))
  }
}

/* ── Scroll reveal ─────────────────────────────────────────────────────── */

function initReveal() {
  const items = document.querySelectorAll(".reveal")
  if (reducedMotion || typeof IntersectionObserver !== "function") {
    items.forEach((item) => item.classList.add("is-visible"))
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add("is-visible")
        observer.unobserve(entry.target)
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
  )
  items.forEach((item) => observer.observe(item))
}

/* ── Count-up stats ────────────────────────────────────────────────────── */

function initStats() {
  const values = document.querySelectorAll("[data-count]")
  const suffix = (el) => el.dataset.suffix ?? ""
  if (reducedMotion || typeof IntersectionObserver !== "function") {
    values.forEach((el) => (el.textContent = `${el.dataset.count}${suffix(el)}`))
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        observer.unobserve(entry.target)
        const el = entry.target
        const target = Number(el.dataset.count)
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min(1, (now - start) / 1400)
          el.textContent = `${Math.round((1 - Math.pow(1 - t, 3)) * target)}${suffix(el)}`
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    },
    { threshold: 0.5 },
  )
  values.forEach((el) => {
    el.textContent = `0${suffix(el)}`
    observer.observe(el)
  })
}

initBackground()
initCursor()
initDialog()
initTitles()
initReveal()
initStats()
