import { type FormEvent, useEffect, useRef, useState } from "react"
import Lenis from "lenis"

type Page = "about" | "documentation" | "contact"
type FormField = "name" | "email" | "subject" | "message"

type NavigationItem = {
  id: Page
  label: string
}

const navigation: NavigationItem[] = [
  { id: "about", label: "About" },
  { id: "documentation", label: "Documentation" },
  { id: "contact", label: "Contact Us" },
]

const problemCards = [
  {
    number: "01",
    title: "Unidentified Sensitive Information",
    description:
      "Employees may share documents without properly identifying sensitive information, increasing the risk of data exposure.",
  },
  {
    number: "02",
    title: "Insufficient Integrated Security",
    description:
      "Some SME workflows may lack integrated authentication, authorization, and backend validation, creating weaknesses in access control.",
  },
  {
    number: "03",
    title: "Unsafe and Inefficient Document Sharing",
    description:
      "Employees need a simple way to process, organize, and share documents within authorized departments without losing control of confidential information.",
  },
]

const objectives = [
  {
    number: "01",
    title: "AI-Assisted Anonymization",
    description:
      "Develop an automated system using Natural Language Processing techniques to detect and anonymize sensitive information, with accuracy evaluated through appropriate testing.",
  },
  {
    number: "02",
    title: "Security Enhancement",
    description:
      "Strengthen system security through authentication, authorization, backend validation, and appropriate protection for data transfers.",
  },
  {
    number: "03",
    title: "Efficient Document Collaboration",
    description:
      "Provide a web-based interface that supports document upload, anonymization, processing, and sharing within authorized departments.",
  },
]

const workflow = [
  {
    number: "01",
    title: "Upload a Document",
    description: "An authorized user uploads a supported document.",
  },
  {
    number: "02",
    title: "Detect Sensitive Information",
    description:
      "NLP-based processing identifies supported sensitive information.",
  },
  {
    number: "03",
    title: "Review and Anonymize",
    description:
      "Sensitive details are anonymized according to the application workflow.",
  },
  {
    number: "04",
    title: "Share Securely",
    description:
      "Protected documents are shared within permitted department boundaries.",
  },
]

const interfaceData = [
  {
    type: "user",
    eyebrow: "Authorized employee workspace",
    title: "User Interface",
    description:
      "A focused workspace for processing documents and collaborating with permitted departments.",
    features: [
      [
        "Document Anonymization",
        "Identify and anonymize supported sensitive personal information.",
      ],
      [
        "Document Management",
        "Upload, organize, archive, and restore documents according to implemented functionality.",
      ],
      [
        "Secure Document Sharing",
        "Share protected documents with authorized users or departments.",
      ],
      [
        "Original File Access",
        "Request original documents through the controlled approval process.",
      ],
    ],
  },
  {
    type: "admin",
    eyebrow: "Platform administration",
    title: "Admin Interface",
    description:
      "A structured administrative view for maintaining users, roles, and organizational departments.",
    features: [
      ["User Management", "Manage registered users and assigned roles."],
      [
        "Department Management",
        "Create and manage organizational departments.",
      ],
      ["Account Control", "Activate, deactivate, and manage user accounts."],
      [
        "System Overview",
        "Review relevant platform activity and system information.",
      ],
    ],
  },
  {
    type: "security",
    eyebrow: "Review and monitoring",
    title: "Security Officer Interface",
    description:
      "A security-oriented workspace for controlled approvals, integrity checks, and event review.",
    features: [
      [
        "Access Request Review",
        "Approve or reject original-file requests according to the implemented workflow.",
      ],
      [
        "File Integrity Verification",
        "Check protected originals using the implemented verification mechanism.",
      ],
      [
        "Security Alert Monitoring",
        "Review suspicious activity and relevant security alerts.",
      ],
      [
        "Security Log Review",
        "Inspect application events and relevant IDS or network monitoring events.",
      ],
    ],
  },
]

const team = [
  {
    initials: "ML",
    name: "Muhammad Luqman Hakim Bin Mohd Sabani",
    role: "Project Supervisor",
    supervisor: true,
  },
  {
    initials: "MI",
    name: "Muhammad Irfan Hakeem Bin Nizwan Khairis",
    role: "Project Manager and Backend Developer",
  },
  {
    initials: "AZ",
    name: "Muhammad Irfan Bin Mohd Zaki",
    role: "Security and Network Engineer",
  },
  {
    initials: "AU",
    name: "Adriana Ulfah Binti Mohd Rashdan",
    role: "AI and NLP Engineer",
  },
  {
    initials: "MA",
    name: "Muhammad Aeman Izzuddin Bin Mohd Yusuff",
    role: "Frontend Developer",
  },
]

const marqueeItems = [
  "AI Anonymization",
  "Cross-Department Collaboration",
  "NLP Detection",
  "Controlled Sharing",
  "Private Network",
  "Role-Based Access",
  "Data Privacy",
  "Secure Workflows",
]

const stats = [
  { value: 4, suffix: "", label: "Workflow Stages" },
  { value: 3, suffix: "", label: "Role-Based Interfaces" },
  { value: 100, suffix: "%", label: "Local Processing" },
  { value: 5, suffix: "", label: "Project Members" },
]

const useReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light"
    const stored = window.localStorage.getItem("secura-theme")
    if (stored === "light" || stored === "dark") return stored
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem("secura-theme", theme)
  }, [theme])

  const toggleTheme = (event?: React.MouseEvent) => {
    const next = theme === "light" ? "dark" : "light"
    const root = document.documentElement
    type Doc = Document & {
      startViewTransition?: (cb: () => void) => {
        ready: Promise<void>
      }
    }
    const doc = document as Doc
    const applyTheme = () => {
      setTheme(next)
      root.dataset.theme = next
      window.localStorage.setItem("secura-theme", next)
    }
    if (!doc.startViewTransition || useReducedMotion()) {
      // Cross-fade fallback: tag the root for 300ms so only paint
      // properties transition, then remove the tag.
      root.classList.add("theme-transition")
      applyTheme()
      window.setTimeout(() => root.classList.remove("theme-transition"), 350)
      return
    }
    const x = event?.clientX ?? window.innerWidth - 48
    const y = event?.clientY ?? 48
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )
    const transition = doc.startViewTransition(applyTheme)
    transition.ready.then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 650,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      )
    }).catch(() => {})
  }

  return { theme, toggleTheme }
}

function ThemeToggle({ theme, onToggle }: { theme: "light" | "dark"; onToggle: (event: React.MouseEvent) => void }) {
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      aria-pressed={theme === "dark"}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb">
          <span className="theme-toggle-icon theme-toggle-icon-sun">☀</span>
          <span className="theme-toggle-icon theme-toggle-icon-moon">☾</span>
        </span>
        <span className="theme-toggle-stars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </span>
    </button>
  )
}

function useLenis() {
  useEffect(() => {
    if (useReducedMotion()) return
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.4,
    })
    ;(window as any).__lenis = lenis
    let frame: number
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      ;(window as any).__lenis = undefined
    }
  }, [])
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className="scroll-progress"
      style={{ transform: `scaleX(${progress})` }}
      aria-hidden="true"
    />
  )
}

function MagneticButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "light"
  type?: "button" | "submit"
  disabled?: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)

  const handleMove = (event: React.MouseEvent) => {
    const el = ref.current
    if (!el || useReducedMotion()) return
    const rect = el.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`
  }

  const handleLeave = () => {
    const el = ref.current
    if (el) el.style.transform = ""
  }

  return (
    <button
      ref={ref}
      className={`action-button action-button-${variant}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
      <span className="button-arrow" aria-hidden="true">
        →
      </span>
    </button>
  )
}

function TiltCard({
  children,
  className = "",
  delay = 0,
  glare = true,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  glare?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (event: React.MouseEvent) => {
    const el = ref.current
    if (!el || useReducedMotion()) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width
    const py = (event.clientY - rect.top) / rect.height
    const rotateX = (py - 0.5) * -7
    const rotateY = (px - 0.5) * 7
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`
    el.style.setProperty("--glare-x", `${px * 100}%`)
    el.style.setProperty("--glare-y", `${py * 100}%`)
    el.classList.add("tilt-active")
  }

  const handleLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = ""
    el.classList.remove("tilt-active")
  }

  return (
    <div
      ref={ref}
      className={`reveal tilt-card ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
      {glare && <span className="tilt-glare" aria-hidden="true" />}
    </div>
  )
}

function CountUpStat({
  value,
  suffix,
  label,
}: {
  value: number
  suffix: string
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (useReducedMotion()) {
      setDisplay(value)
      return
    }
    let observer: IntersectionObserver | undefined
    let frame: number
    try {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return
          observer?.disconnect()
          const duration = 1400
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(Math.round(eased * value))
            if (t < 1) frame = requestAnimationFrame(tick)
          }
          frame = requestAnimationFrame(tick)
        },
        { threshold: 0.4 },
      )
      observer.observe(el)
    } catch {
      setDisplay(value)
    }
    return () => {
      observer?.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-value">
        {display}
        {suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function MarqueeBand() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[...marqueeItems, ...marqueeItems].map((item, index) => (
          <span className="marquee-item" key={`${item}-${index}`}>
            {item}
            <i>◆</i>
          </span>
        ))}
      </div>
    </div>
  )
}

function useHeroSpotlight() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = ref.current
    if (!section || useReducedMotion()) return
    const onMove = (event: MouseEvent) => {
      section.style.setProperty("--spotlight-x", `${event.clientX}px`)
      section.style.setProperty("--spotlight-y", `${event.clientY}px`)
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  return ref
}

function Brand() {
  return (
    <span className="brand-lockup">
      <img className="brand-logo" src="/assets/secura-logo.png" alt="SECURA — Cybersecurity & Data Privacy Platform" width={1018} height={374} />
    </span>
  )
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <div
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "light"
  type?: "button" | "submit"
  disabled?: boolean
}) {
  return (
    <button
      className={`action-button action-button-${variant}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      <span className="button-arrow" aria-hidden="true">
        →
      </span>
    </button>
  )
}

function Header({
  page,
  onNavigate,
  theme,
  onToggleTheme,
}: {
  page: Page
  onNavigate: (page: Page) => void
  theme: "light" | "dark"
  onToggleTheme: () => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [page])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        document.querySelector<HTMLButtonElement>(".menu-button")?.focus()
      }
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [open])

  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Primary navigation">
        <button
          className="brand-button"
          type="button"
          onClick={() => onNavigate("about")}
          aria-label="SECURA home"
        >
          <Brand />
        </button>
        <div
          id="primary-menu"
          className={`nav-links ${open ? "nav-links-open" : ""}`}
        >
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-link ${
                page === item.id ? "nav-link-active" : ""
              }`}
              type="button"
              onClick={() => {
                onNavigate(item.id)
                setOpen(false)
              }}
              aria-current={page === item.id ? "page" : undefined}
            >
              <span className="nav-link-text">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            className="menu-button"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            aria-controls="primary-menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
    </header>
  )
}

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="site-footer">
      <div className="content-shell footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>
            A secure web platform concept for AI-assisted document anonymization
            and controlled cross-department collaboration.
          </p>
          <span className="academic-label">
            Cybersecurity Final Year Project
          </span>
        </div>
        <div className="footer-navigation">
          <p className="footer-title">Navigate</p>
          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="content-shell footer-bottom">
        <p>© {new Date().getFullYear()} SECURA. Academic project showcase.</p>
        <p>Designed for presentation and review.</p>
      </div>
    </footer>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
  align = "center",
}: {
  eyebrow?: string
  title: string
  description?: string
  light?: boolean
  align?: "center" | "left"
}) {
  return (
    <div
      className={`section-heading section-heading-${align} ${
        light ? "section-heading-light" : ""
      }`}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  )
}

function Workstation({ label }: { label: string }) {
  return (
    <div className="endpoint">
      <div className="endpoint-screen" aria-hidden="true">
        <span />
        <span />
      </div>
      <div className="endpoint-stand" aria-hidden="true" />
      <p>{label}</p>
    </div>
  )
}

function SecureExchangeIllustration({
  compact = false,
}: {
  compact?: boolean
}) {
  return (
    <div
      className={`secure-exchange ${compact ? "secure-exchange-compact" : ""}`}
      role="img"
      aria-label="Protected document moving securely between Department A and Department B"
    >
      <Workstation label="Department A" />
      <div className="exchange-line exchange-line-left" aria-hidden="true">
        <span />
      </div>
      <div className="document-shield" aria-hidden="true">
        <div className="shield-sheet">
          <i />
          <i />
          <i />
        </div>
        <span className="shield-check">✓</span>
      </div>
      <div className="exchange-line exchange-line-right" aria-hidden="true">
        <span />
      </div>
      <Workstation label="Department B" />
    </div>
  )
}

function AboutPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const heroRef = useHeroSpotlight()

  return (
    <main className="page page-about">
      <section className="hero-section" ref={heroRef}>
        <div className="hero-grid-pattern" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-particles" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="content-shell hero-layout">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="eyebrow-dot" aria-hidden="true" />
              AI-assisted privacy protection
            </p>
            <h1>
              Secure Web Platform for Automated AI Document Anonymization
            </h1>
            <p className="hero-tagline">
              Cross-Department Collaboration, Fortified for Your Safety
            </p>
            <p className="hero-description">
              SECURA is designed to help organizations identify and anonymize
              sensitive information before sharing documents with authorized
              departments.
            </p>
            <div className="hero-actions">
              <MagneticButton onClick={() => onNavigate("documentation")}>
                Explore SECURA
              </MagneticButton>
              <MagneticButton
                variant="secondary"
                onClick={() => onNavigate("contact")}
              >
                Contact the Team
              </MagneticButton>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-caption">
              <span className="status-dot" />
              Protected collaboration flow
            </div>
            <SecureExchangeIllustration />
          </div>
        </div>
        <div className="hero-scroll-hint" aria-hidden="true">
          <span />
          Scroll to explore
        </div>
      </section>

      <MarqueeBand />

      <section className="stats-section">
        <div className="content-shell stats-grid">
          {stats.map((stat) => (
            <CountUpStat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </section>

      <section className="overview-section section-pad">
        <div className="content-shell overview-layout">
          <Reveal className="overview-copy">
            <SectionHeading
              eyebrow="SECURA overview"
              title="Safer document handling, built around controlled collaboration."
              align="left"
            />
            <p className="body-copy">
              Sharing documents across departments can expose sensitive
              information when personal details are not identified or properly
              protected. SECURA is designed to support safer document handling
              by helping users anonymize sensitive information, manage
              documents, and share protected files within authorized
              departments.
            </p>
            <div className="trust-note">
              <span className="trust-icon" aria-hidden="true">
                ✓
              </span>
              <p>
                Original-file access remains separate and follows a controlled
                review and approval process.
              </p>
            </div>
          </Reveal>
          <Reveal className="process-visual" delay={100}>
            {["Document", "Detect", "Anonymize", "Share"].map(
              (label, index) => (
                <div className="mini-step" key={label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{label}</p>
                  {index < 3 && <i aria-hidden="true">→</i>}
                </div>
              ),
            )}
          </Reveal>
        </div>
      </section>

      <section className="problem-section section-pad">
        <div className="content-shell">
          <Reveal>
            <SectionHeading
              eyebrow="Why SECURA"
              title="The Problem"
              description="Everyday document workflows can create privacy and access-control risks when protection is treated as an afterthought."
              light
            />
          </Reveal>
          <div className="card-grid">
            {problemCards.map((card, index) => (
              <TiltCard
                className="feature-card feature-card-dark"
                delay={index * 80}
                key={card.title}
              >
                <span className="card-number">{card.number}</span>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <section className="objectives-section section-pad">
        <div className="content-shell">
          <Reveal>
            <SectionHeading
              eyebrow="Project direction"
              title="Our Objectives"
              description="Three focused objectives guide the proposed SECURA platform and its evaluation."
            />
          </Reveal>
          <div className="card-grid objectives-grid">
            {objectives.map((objective, index) => (
              <TiltCard
                className="feature-card objective-card"
                delay={index * 80}
                key={objective.title}
              >
                <div className="objective-icon" aria-hidden="true">
                  {objective.number}
                </div>
                <h3>{objective.title}</h3>
                <p>{objective.description}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-section section-pad">
        <Reveal className="content-shell closing-panel">
          <div>
            <p className="eyebrow">Understand the system</p>
            <h2>See how SECURA is intended to work.</h2>
            <p>
              Explore the processing workflow, private-network topology, and
              role-based interface concepts.
            </p>
          </div>
          <MagneticButton
            variant="light"
            onClick={() => onNavigate("documentation")}
          >
            Explore Documentation
          </MagneticButton>
        </Reveal>
      </section>
    </main>
  )
}

function Workflow() {
  return (
    <div className="workflow-grid">
      {workflow.map((step, index) => (
        <Reveal className="workflow-step" delay={index * 70} key={step.title}>
          <div className="workflow-number">{step.number}</div>
          <div className="workflow-icon" aria-hidden="true">
            <span />
            <span />
          </div>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
          {index < workflow.length - 1 && (
            <div className="workflow-connector" aria-hidden="true">
              <i />
            </div>
          )}
        </Reveal>
      ))}
    </div>
  )
}

type TopologyViewMode = "physical" | "logical"

interface TopologyNodeSpec {
  id: string
  type: "monitor" | "switch" | "server" | "user"
  label: string
  role: string
  ip: string
  protocol: string
  detail: string
  documentation: string
}

const topologyNodes: TopologyNodeSpec[] = [
  {
    id: "pc",
    type: "monitor",
    label: "Mini PC / IDS",
    role: "Monitoring & visibility",
    ip: "192.168.10.254",
    protocol: "SPAN port, Syslog",
    detail: "Monitors relevant network activity",
    documentation:
      "A dedicated monitoring host outside the Internal LAN boundary, fed by a SPAN (mirror) port on the managed switch. It observes traffic patterns for anomaly detection without sitting in the forwarding path — passive visibility, zero impact on latency.",
  },
  {
    id: "switch",
    type: "switch",
    label: "Network Switch",
    role: "Local connectivity core",
    ip: "192.168.10.1",
    protocol: "VLAN, port mirroring",
    detail: "Gi0/8 uplink · Gi0/1–3 access ports",
    documentation:
      "The connectivity core inside the Internal LAN. Uplink Gi0/8 carries mirrored traffic to the IDS; access ports Gi0/1, Gi0/2, and Gi0/3 serve the web application and both client nodes. VLANs segment user, server, and monitoring traffic.",
  },
  {
    id: "server",
    type: "server",
    label: "Web Application",
    role: "Application host",
    ip: "192.168.10.10",
    protocol: "HTTPS :443",
    detail: "Hosts the SECURA application",
    documentation:
      "Hosts the SECURA web application on an isolated LAN segment behind switch port Gi0/1. It has no direct internet exposure — users reach it only through the managed switch. TLS termination happens here with local certificate trust.",
  },
  {
    id: "user1",
    type: "user",
    label: "Client Node",
    role: "Authorized endpoint",
    ip: "192.168.10.20",
    protocol: "HTTPS client",
    detail: "Authorized endpoint · Gi0/2",
    documentation:
      "An authorized workstation inside the private network on switch port Gi0/2. Access to SECURA follows role-based permissions, and requests for original documents go through the controlled approval workflow.",
  },
  {
    id: "user2",
    type: "user",
    label: "Client Node",
    role: "Authorized endpoint",
    ip: "192.168.10.30",
    protocol: "HTTPS client",
    detail: "Authorized endpoint · Gi0/3",
    documentation:
      "A second authorized workstation on switch port Gi0/3. Both endpoints operate under the same role-based access model; sessions are logged for review by the security officer role.",
  },
]

interface TopologyEdgeSpec {
  id: string
  from: string
  to: string
  /** Orthogonal path inside the Internal LAN coordinate space (928x580). */
  lanPath: string
  label: string
  /** Seconds for one particle traversal. Lower = busier. */
  duration: number
  hideIn?: TopologyViewMode[]
}

const topologyEdges: TopologyEdgeSpec[] = [
  // LAN-local coordinates (928x580): switch card bottom ~172, trunk rail
  // y=260 crosses open space, bottom-row icon tops y=448, centers
  // server x=170, client1 x=464, client2 x=758.
  { id: "pc-switch", from: "pc", to: "switch", lanPath: "M 464 40 L 464 90", label: "Gi0/8", duration: 2.2 },
  { id: "switch-server", from: "switch", to: "server", lanPath: "M 464 172 L 464 260 L 170 260 L 170 448", label: "Gi0/1", duration: 2.6 },
  { id: "switch-user1", from: "switch", to: "user1", lanPath: "M 464 172 L 464 448", label: "Gi0/2", duration: 2.0 },
  { id: "switch-user2", from: "switch", to: "user2", lanPath: "M 464 172 L 464 260 L 758 260 L 758 448", label: "Gi0/3", duration: 2.8 },
]

const viewModeLabels: Record<TopologyViewMode, string> = {
  physical: "Physical Topology",
  logical: "Logical Data Flow",
}

/** Pre-computed label anchors near each edge midpoint (LAN space 928x580). */
const edgeLabelPositions: Record<string, { x: number; y: number }> = {
  "pc-switch": { x: 464, y: 65 },
  "switch-server": { x: 285, y: 260 },
  "switch-user1": { x: 464, y: 360 },
  "switch-user2": { x: 614, y: 260 },
}

function TopologyNodeButton({
  node,
  tipOpen,
  onHover,
  onOpen,
}: {
  node: TopologyNodeSpec
  tipOpen: boolean
  onHover: (id: string | null) => void
  onOpen: (id: string) => void
}) {
  return (
    <button
      type="button"
      className={`topo-node network-device network-device-${node.type}`}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      onClick={() => onOpen(node.id)}
      aria-haspopup="dialog"
      aria-describedby={tipOpen ? `tip-${node.id}` : undefined}
    >
      <span className={`topo-node-icon topo-icon-${node.type}`} aria-hidden="true">
        {node.type === "monitor" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h15A1.5 1.5 0 0 1 21 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14.5z" />
            <path d="M9 20h6M12 16.5V20" />
            <path d="M7 8.5l2.5 2.5L7 13.5" />
          </svg>
        )}
        {node.type === "switch" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <rect x="3" y="7" width="18" height="10" rx="1.5" />
            <path d="M6.5 10.5v3M10 10.5v3M13.5 10.5v3M17 10.5v3" />
          </svg>
        )}
        {node.type === "server" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <rect x="4" y="3.5" width="16" height="7" rx="1.5" />
            <rect x="4" y="13.5" width="16" height="7" rx="1.5" />
            <path d="M7.5 7h.01M7.5 17h.01M11 7h6M11 17h6" />
          </svg>
        )}
        {node.type === "user" && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <rect x="4" y="4" width="16" height="11" rx="1.5" />
            <path d="M2.5 19h19M12 15v4" />
          </svg>
        )}
      </span>
      <span className="topo-node-meta">
        <strong>{node.label}</strong>
        <span>{node.ip}</span>
      </span>
      <span className="topo-tip" id={`tip-${node.id}`} role="tooltip" data-open={tipOpen}>
        <strong>{node.label}</strong>
        <span>{node.ip} · {node.protocol}</span>
        <span className="topo-tip-role">{node.role}</span>
        <em>Click for details</em>
      </span>
    </button>
  )
}

function Topology() {
  const [mode, setMode] = useState<TopologyViewMode>("physical")
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [hoverTip, setHoverTip] = useState<string | null>(null)

  const activeSpec = topologyNodes.find((n) => n.id === activeNode) ?? null
  const nodeSpec = (id: string) => topologyNodes.find((n) => n.id === id)!

  return (
    <div className={`topology-wrap topo-mode-${mode}`}>
      <div className="topo-mode-toggle" role="tablist" aria-label="Topology view mode">
        {(Object.keys(viewModeLabels) as TopologyViewMode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            className={`topo-tab ${mode === m ? "topo-tab-active" : ""}`}
            type="button"
            onClick={() => setMode(m)}
          >
            {viewModeLabels[m]}
          </button>
        ))}
      </div>

      {/* Diagram canvas — isolated below the toggle by the toggle's margin */}
      <div
        className="topology"
        role="img"
        aria-label="Network topology: a mini PC IDS sits outside an Internal LAN zone containing a network switch connected to a web application and two client nodes"
      >
        {/* Tier 1 — outside the LAN boundary */}
        <div className="topology-anchor topology-pc">
          <TopologyNodeButton
            node={nodeSpec("pc")}
            tipOpen={hoverTip === "pc"}
            onHover={setHoverTip}
            onOpen={setActiveNode}
          />
        </div>

        {/* Tier 2 + 3 — inside the Internal LAN zone */}
        <div className="topology-lan">
          <span className="topology-lan-label" aria-hidden="true">Internal LAN</span>

          <svg
            className="topo-edges"
            viewBox="0 0 928 580"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="topo-particle" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="40%" stopColor="var(--color-primary)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </radialGradient>
            </defs>
            {topologyEdges.map((edge) => {
              const hidden = edge.hideIn?.includes(mode)
              const mid = edgeLabelPositions[edge.id]
              return (
                <g key={edge.id} className={hidden ? "topo-edge-hidden" : undefined}>
                  <path d={edge.lanPath} className="topo-edge-track" />
                  <path
                    d={edge.lanPath}
                    className="topo-edge-flow"
                    style={{ animationDuration: `${edge.duration}s` }}
                  />
                  {mid && (
                    <text x={mid.x + 8} y={mid.y - 6} className="topo-edge-label">
                      {edge.label}
                    </text>
                  )}
                </g>
              )
            })}
            <g className="topo-particle-group" aria-hidden="true">
              {topologyEdges.map((edge) => {
                const hidden = edge.hideIn?.includes(mode)
                return (
                  <g key={`p-${edge.id}`} className={hidden ? "topo-edge-hidden" : undefined}>
                    <circle r="5" fill="url(#topo-particle)">
                      <animateMotion dur={`${edge.duration}s`} repeatCount="indefinite" path={edge.lanPath} />
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        keyTimes="0;0.08;0.92;1"
                        dur={`${edge.duration}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Tier 2 — switch, centered inside the LAN */}
          <div className="topology-anchor topology-switch">
            <TopologyNodeButton
              node={nodeSpec("switch")}
              tipOpen={hoverTip === "switch"}
              onHover={setHoverTip}
              onOpen={setActiveNode}
            />
          </div>

          {/* Tier 3 — three evenly spaced endpoints */}
          <div className="topology-anchor topology-server">
            <TopologyNodeButton
              node={nodeSpec("server")}
              tipOpen={hoverTip === "server"}
              onHover={setHoverTip}
              onOpen={setActiveNode}
            />
          </div>
          <div className="topology-anchor topology-user">
            <TopologyNodeButton
              node={nodeSpec("user1")}
              tipOpen={hoverTip === "user1"}
              onHover={setHoverTip}
              onOpen={setActiveNode}
            />
          </div>
          <div className="topology-anchor topology-user-two">
            <TopologyNodeButton
              node={nodeSpec("user2")}
              tipOpen={hoverTip === "user2"}
              onHover={setHoverTip}
              onOpen={setActiveNode}
            />
          </div>
        </div>
      </div>

      <div
        className={`topo-drawer ${activeSpec ? "topo-drawer-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={activeSpec ? `${activeSpec.label} details` : undefined}
        hidden={!activeSpec}
      >
        {activeSpec && (
          <>
            <button
              className="topo-drawer-close"
              type="button"
              aria-label="Close details"
              onClick={() => setActiveNode(null)}
            >
              ✕
            </button>
            <p className="eyebrow">{activeSpec.role}</p>
            <h3>{activeSpec.label}</h3>
            <dl className="topo-spec-list">
              <div><dt>IP address</dt><dd>{activeSpec.ip}</dd></div>
              <div><dt>Protocol</dt><dd>{activeSpec.protocol}</dd></div>
              <div><dt>Segment</dt><dd>Private LAN 192.168.10.0/24</dd></div>
            </dl>
            <p className="topo-drawer-doc">{activeSpec.documentation}</p>
          </>
        )}
      </div>
      {activeSpec && (
        <button
          className="topo-drawer-backdrop"
          type="button"
          aria-label="Close details"
          onClick={() => setActiveNode(null)}
        />
      )}
    </div>
  )
}

function InterfacePreview({ data }: { data: typeof interfaceData[number] }) {
  const screenshot = data.type === "security" ? "security-officer" : data.type

  return (
    <div className="browser-frame" aria-label={`${data.title} screenshot preview`}>
      <div className="browser-toolbar" aria-hidden="true">
        <span />
        <span />
        <span />
        <div className="browser-url">SECURA / {data.title}</div>
      </div>
      <img
        className="dashboard-screenshot"
        src={`/assets/${screenshot}-dashboard.png`}
        alt={`Actual SECURA ${data.title} dashboard. Static promotional screenshot.`}
        width={1853}
        height={993}
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

function InterfaceShowcase({
  data,
  reverse,
}: {
  data: typeof interfaceData[number]
  reverse: boolean
}) {
  return (
    <section
      className={`interface-showcase ${
        reverse ? "interface-showcase-reverse" : ""
      }`}
    >
      <Reveal className="interface-preview-wrap">
        <InterfacePreview data={data} />
      </Reveal>
      <Reveal className="interface-copy" delay={100}>
        <p className="eyebrow">{data.eyebrow}</p>
        <h2>{data.title}</h2>
        <p className="interface-description">{data.description}</p>
        <div className="feature-list">
          {data.features.map(([title, description], index) => (
            <div className="feature-row" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

function DocumentationPage({
  onNavigate,
}: {
  onNavigate: (page: Page) => void
}) {
  return (
    <main className="page page-documentation">
      <section className="documentation-hero section-pad">
        <div className="documentation-pattern" aria-hidden="true" />
        <div className="hero-particles" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="content-shell">
          <Reveal>
            <SectionHeading
              eyebrow="Platform workflow"
              title="How Does It Work?"
              description="SECURA helps organizations protect sensitive information by allowing users to upload documents and identify personal details for anonymization before sharing them. Authorized users can manage, access, and share protected documents, while requests for original files follow a controlled approval process."
              light
            />
          </Reveal>
          <Workflow />
          <Reveal className="approval-note">
            <div className="approval-icon" aria-hidden="true">
              <Brand />
            </div>
            <div>
              <h3>Original-file access remains controlled</h3>
              <p>
                Access to an original document is not automatically available to
                every department. Requests follow a defined review and approval
                process.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <MarqueeBand />

      <section className="topology-section section-pad">
        <div className="content-shell">
          <Reveal>
            <SectionHeading
              eyebrow="Private network architecture"
              title="Our Physical Topology"
              description="The intended setup keeps document processing within a private local network while separating monitoring, application hosting, and authorized user endpoints."
            />
          </Reveal>
          <Reveal delay={100}>
            <Topology />
          </Reveal>
          <p className="topology-caption">
            The IDS or IDPS device supports monitoring and visibility. It does
            not imply automatic prevention of every security incident.
          </p>
        </div>
      </section>

      <section className="interfaces-section section-pad">
        <div className="content-shell interfaces-shell">
          <Reveal>
            <SectionHeading
              eyebrow="Role-based experiences"
              title="Designed around clear responsibilities"
              description="Actual SECURA dashboard screenshots show the platform's three primary roles. These are static promotional visuals, not interactive application screens."
            />
          </Reveal>
          {interfaceData.map((data, index) => (
            <InterfaceShowcase
              data={data}
              reverse={index % 2 === 1}
              key={data.title}
            />
          ))}
        </div>
      </section>

      <section className="closing-section section-pad">
        <Reveal className="content-shell closing-panel">
          <div>
            <p className="eyebrow">Project questions</p>
            <h2>Want to discuss the SECURA concept?</h2>
            <p>Meet the project team and use the demonstration inquiry form.</p>
          </div>
          <ActionButton variant="light" onClick={() => onNavigate("contact")}>
            Contact Us
          </ActionButton>
        </Reveal>
      </section>
    </main>
  )
}

function TeamCard({
  member,
  index,
}: {
  member: typeof team[number]
  index: number
}) {
  return (
    <TiltCard
      className={`team-card ${member.supervisor ? "team-card-supervisor" : ""}`}
      delay={index * 70}
    >
      <div
        className="team-avatar"
        aria-label={`${member.name} initial-based avatar`}
      >
        <span>{member.initials}</span>
      </div>
      <div className="team-card-copy">
        {member.supervisor && (
          <span className="supervisor-badge">Supervisor</span>
        )}
        <h3>{member.name}</h3>
        <p>{member.role}</p>
      </div>
    </TiltCard>
  )
}

function ContactForm() {
  const initialValues = { name: "", email: "", subject: "", message: "" }
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  const validateField = (field: FormField, value: string) => {
    if (!value.trim()) return "This field is required."
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address."
    }
    if (field === "message" && value.trim().length < 10) {
      return "Please provide at least 10 characters."
    }
    return ""
  }

  const updateField = (field: FormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setSubmitted(false)
    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: validateField(field, value),
      }))
    }
  }

  const blurField = (field: FormField) => {
    setErrors((current) => ({
      ...current,
      [field]: validateField(field, values[field]),
    }))
  }

  const submitForm = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors = Object.keys(values).reduce(
      (result, field) => {
        const key = field as FormField
        const message = validateField(key, values[key])
        if (message) result[key] = message
        return result
      },
      {} as Partial<Record<FormField, string>>,
    )
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) setSubmitted(true)
  }

  return (
    <form className="inquiry-form" onSubmit={submitForm} noValidate>
      <div className="form-row">
        <FormInput
          id="name"
          label="Name"
          value={values.name}
          error={errors.name}
          placeholder="Your name"
          onChange={(value) => updateField("name", value)}
          onBlur={() => blurField("name")}
        />
        <FormInput
          id="email"
          label="Email"
          value={values.email}
          error={errors.email}
          placeholder="name@example.com"
          type="email"
          onChange={(value) => updateField("email", value)}
          onBlur={() => blurField("email")}
        />
      </div>
      <FormInput
        id="subject"
        label="Subject"
        value={values.subject}
        error={errors.subject}
        placeholder="What would you like to discuss?"
        onChange={(value) => updateField("subject", value)}
        onBlur={() => blurField("subject")}
      />
      <div className="form-field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={values.message}
          placeholder="Write your message here"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          onChange={(event) => updateField("message", event.target.value)}
          onBlur={() => blurField("message")}
        />
        {errors.message && (
          <span className="field-error" id="message-error" role="alert">
            {errors.message}
          </span>
        )}
      </div>
      <div className="form-footer">
        <ActionButton type="submit">Validate Inquiry</ActionButton>
        <p>Demonstration form only. No message is transmitted or stored.</p>
      </div>
      {submitted && (
        <div className="form-feedback" role="status">
          <span aria-hidden="true">✓</span>
          <p>
            Your details are valid. This is a front-end demonstration, so no
            message has been sent.
          </p>
        </div>
      )}
    </form>
  )
}

function FormInput({
  id,
  label,
  value,
  error,
  placeholder,
  type = "text",
  onChange,
  onBlur,
}: {
  id: FormField
  label: string
  value: string
  error?: string
  placeholder: string
  type?: string
  onChange: (value: string) => void
  onBlur: () => void
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      {error && (
        <span className="field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

function ContactPage() {
  return (
    <main className="page page-contact">
      <section className="team-section section-pad">
        <div className="team-wave" aria-hidden="true" />
        <div className="content-shell">
          <Reveal>
            <SectionHeading
              eyebrow="The people behind the project"
              title="Meet Our Members"
              description="A multidisciplinary Final Year Project team combining software development, AI and NLP, and network security responsibilities."
            />
          </Reveal>
          <div className="team-grid">
            {team.map((member, index) => (
              <TeamCard member={member} index={index} key={member.name} />
            ))}
          </div>
        </div>
      </section>

      <MarqueeBand />

      <section className="inquiries-section section-pad">
        <div className="content-shell inquiry-layout">
          <Reveal className="inquiry-copy">
            <p className="eyebrow">Project inquiries</p>
            <h2>Any Inquiries?</h2>
            <p>
              Interested in the SECURA concept, architecture, or project scope?
              Use this demonstration form to prepare an inquiry for the team.
            </p>
            <div className="privacy-note">
              <span aria-hidden="true">i</span>
              <p>
                Public contact details have intentionally not been published.
                Approved team information can be added later.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </main>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 640)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <button
      className={`back-to-top ${visible ? "back-to-top-visible" : ""}`}
      type="button"
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => scrollToPageTop()}
    >
      <span aria-hidden="true">↑</span>
    </button>
  )
}

function getPageFromHash(): Page {
  const hash = window.location.hash.replace("#/", "")
  return navigation.some((item) => item.id === hash) ? hash as Page : "about"
}

function scrollToPageTop() {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches
  if (reducedMotion) {
    window.scrollTo({ top: 0, behavior: "instant" })
    return
  }
  // Lenis instance lives on window when active; fall back to native smooth.
  const lenis = (window as any).__lenis
  if (lenis?.scrollTo) {
    lenis.scrollTo(0, { duration: 1.2 })
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

export default function App() {
  const [page, setPage] = useState<Page>(getPageFromHash)
  const { theme, toggleTheme } = useTheme()

  useLenis()

  useEffect(() => {
    // Expose the Lenis instance for scrollToPageTop.
    const probe = () => {
      const lenis = (window as any).__lenis
      if (!lenis) setTimeout(probe, 100)
    }
    probe()
  }, [])

  useEffect(() => {
    const handleHashChange = () => setPage(getPageFromHash())
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  useEffect(() => {
    document.title = `SECURA — ${navigation.find((item) => item.id === page)?.label}`
    scrollToPageTop()

    // Content is visible by default; observation only enhances its entrance.
    if (
      typeof window.IntersectionObserver !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return

    let observer: IntersectionObserver | undefined
    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible")
              observer?.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.12 },
      )
      document
        .querySelectorAll(".reveal")
        .forEach((element) => observer?.observe(element))
    } catch {
      observer?.disconnect()
    }
    return () => observer?.disconnect()
  }, [page])

  const navigate = (nextPage: Page) => {
    if (nextPage === page) {
      scrollToPageTop()
      return
    }
    window.location.hash = `/${nextPage}`
  }

  return (
    <div className="app-shell">
      <div className="aurora" aria-hidden="true">
        <i className="aurora-blob aurora-blob-one" />
        <i className="aurora-blob aurora-blob-two" />
        <i className="aurora-blob aurora-blob-three" />
      </div>
      <ScrollProgress />
      <Header page={page} onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />
      <div className="page-transition" key={page}>
        {page === "about" && <AboutPage onNavigate={navigate} />}
        {page === "documentation" && (
          <DocumentationPage onNavigate={navigate} />
        )}
        {page === "contact" && <ContactPage />}
      </div>
      <BackToTop />
      <Footer onNavigate={navigate} />
    </div>
  )
}
