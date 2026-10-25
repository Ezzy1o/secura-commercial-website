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

function WordReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ")
  return (
    <span className={`word-reveal ${className}`} aria-label={text}>
      {words.map((word, index) => (
        <span
          className="word-reveal-word"
          key={`${word}-${index}`}
          style={{ "--word-index": index } as React.CSSProperties}
        >
          {word}
        </span>
      ))}
    </span>
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
}: {
  page: Page
  onNavigate: (page: Page) => void
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
              {item.label}
            </button>
          ))}
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
              <WordReveal text="Secure Web Platform for Automated AI Document Anonymization" />
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

function NetworkDevice({
  type,
  label,
  detail,
}: {
  type: "monitor" | "switch" | "server" | "user"
  label: string
  detail: string
}) {
  return (
    <div className={`network-device network-device-${type}`}>
      <div className="device-visual" aria-hidden="true">
        <div className="device-face">
          <span />
          <span />
          <span />
        </div>
        {(type === "server" || type === "user") && (
          <div className="device-base" />
        )}
      </div>
      <p className="device-title">{label}</p>
      <p className="device-detail">{detail}</p>
    </div>
  )
}

function Topology() {
  return (
    <div
      className="topology"
      role="img"
      aria-label="Private network topology connecting an IDS monitoring device, managed switch, local SECURA web server, and two authorized user endpoints"
    >
      <div className="network-lines" aria-hidden="true">
        <i className="network-line line-monitor" />
        <i className="network-line line-trunk" />
        <i className="network-line line-horizontal" />
        <i className="network-line line-server" />
        <i className="network-line line-user-one" />
        <i className="network-line line-user-two" />
      </div>
      <div className="topology-monitor">
        <NetworkDevice
          type="monitor"
          label="Mini PC / IDS"
          detail="Monitors relevant network activity"
        />
      </div>
      <div className="topology-switch">
        <NetworkDevice
          type="switch"
          label="Managed Switch"
          detail="Local network connectivity"
        />
      </div>
      <div className="topology-server">
        <NetworkDevice
          type="server"
          label="Local Web Server"
          detail="Hosts the SECURA application"
        />
      </div>
      <div className="topology-user-one">
        <NetworkDevice
          type="user"
          label="User 1"
          detail="Authorized endpoint"
        />
      </div>
      <div className="topology-user-two">
        <NetworkDevice
          type="user"
          label="User 2"
          detail="Authorized endpoint"
        />
      </div>
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
    <Reveal
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
    </Reveal>
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
      <ScrollProgress />
      <Header page={page} onNavigate={navigate} />
      <div className="page-transition" key={page}>
        {page === "about" && <AboutPage onNavigate={navigate} />}
        {page === "documentation" && (
          <DocumentationPage onNavigate={navigate} />
        )}
        {page === "contact" && <ContactPage />}
      </div>
      <Footer onNavigate={navigate} />
    </div>
  )
}
