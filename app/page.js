"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";

/* ─── Scroll-reveal hook ─────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, style = {} }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── SVG Icons ──────────────────────────────────────────────────── */
function CrossSVG({ size = 48 }) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 48 65" fill="none" aria-hidden="true">
      <rect x="20" y="0"  width="8"  height="65" rx="2" fill="#d4a017"/>
      <rect x="4"  y="16" width="40" height="8"  rx="2" fill="#d4a017"/>
    </svg>
  );
}

/* ─── Mock saint card for hero ───────────────────────────────────── */
function MockSaintCard() {
  return (
    <div
      className="animate-card-float"
      style={{
        background: "linear-gradient(160deg, #08122e, #0f2040 60%, #12285a)",
        border: "1px solid rgba(212,160,23,0.35)",
        borderRadius: "22px",
        padding: "30px 28px 24px",
        boxShadow: "0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(212,160,23,0.1), inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
        maxWidth: "380px",
        width: "100%",
      }}
    >
      {/* Cathedral light rays */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0,
          background: "conic-gradient(from -10deg at 50% -20%, rgba(212,160,23,0.07) 0deg, transparent 20deg, transparent 40deg, rgba(212,160,23,0.04) 60deg, transparent 80deg, transparent 100deg, rgba(212,160,23,0.06) 120deg, transparent 160deg, transparent 200deg, rgba(212,160,23,0.05) 230deg, transparent 260deg, transparent 340deg, rgba(212,160,23,0.07) 360deg)",
          pointerEvents: "none",
        }}
      />
      {/* Top glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "120px",
          background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(212,160,23,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Gold accent bar */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #d4a017 30%, #f0c040 50%, #d4a017 70%, transparent)", borderRadius: "2px", marginBottom: "22px" }} />

      {/* Team name */}
      <p style={{ fontFamily: "Playfair Display, serif", fontSize: "11px", fontStyle: "italic", color: "rgba(212,160,23,0.7)", textAlign: "center", letterSpacing: "0.08em", marginBottom: "14px" }}>
        Your Heavenly Team of Consolation
      </p>

      {/* Saint names */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        {["Saint Dymphna of Gheel", "Saint Thérèse of Lisieux", "Saint Benedict Joseph Labre"].map((name) => (
          <p key={name} style={{ fontFamily: "Playfair Display, serif", fontSize: "13.5px", fontStyle: "italic", color: "#f0e8d5", marginBottom: "5px", letterSpacing: "0.01em" }}>
            ✦ {name}
          </p>
        ))}
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", justifyContent: "center", marginBottom: "16px" }}>
        {["Patron of anxiety", "The Little Way", "Mental healing", "Hope for the poor"].map((tag) => (
          <span key={tag} style={{ background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.25)", color: "#d4a017", fontSize: "10px", padding: "3px 9px", borderRadius: "999px" }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Cross divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(212,160,23,0.3))" }} />
        <span style={{ color: "rgba(212,160,23,0.5)", fontSize: "10px" }}>✝</span>
        <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(212,160,23,0.3))" }} />
      </div>

      {/* Prayer text */}
      <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "11.5px", lineHeight: "1.9", color: "rgba(240,232,213,0.7)", textAlign: "center" }}>
        "Lord, through the intercession of these blessed saints, grant us peace and courage in our struggle, that we may trust in Your divine providence…"
      </p>

      {/* Watermark */}
      <p style={{ fontSize: "9px", color: "rgba(212,160,23,0.3)", textAlign: "center", marginTop: "16px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
        PraySaint · Grow Closer to God
      </p>
    </div>
  );
}

/* ─── Data ───────────────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    n: "1",
    icon: "✍",
    title: "Share Your Burden",
    desc: "Tell us what you are carrying — anxiety, grief, confusion, temptation, or a desire to grow closer to God. Be as specific as you need.",
  },
  {
    n: "2",
    icon: "✦",
    title: "We Match Your Saints",
    desc: "We find 2–3 real patron saints whose patronage, virtues, and life stories speak directly to your situation, drawn from Catholic hagiography.",
  },
  {
    n: "3",
    icon: "🕊",
    title: "Receive Your Prayer Card",
    desc: "Get a beautifully formatted saint card with biography, symbols, patronages, a custom novena prayer, and a saint life timeline — ready to save and share.",
  },
];

const FEATURES = [
  { href: "/saints", emoji: "⚔", title: "Saint Ally Builder", desc: "Receive a matched team of real patron saints with historically accurate backstories, virtues, and a custom novena prayer.", accent: "#d4a017", cta: "Find My Saints" },
  { href: "/rosary", emoji: "📿", title: "Virtual Rosary", desc: "Pray the Rosary bead-by-bead through all four mystery sets with traditional meditations and Vatican-approved prayers.", accent: "#6b9fd4", cta: "Pray the Rosary" },
  { href: "/memes", emoji: "😂", title: "Catholic Memes", desc: "Create uplifting, wholesome faith memes from Scripture and saint quotes — joyful humor that draws people to God (CCC 1832).", accent: "#7cc47f", cta: "Create a Meme" },
  { href: "/saints", emoji: "📖", title: "Saint Timeline", desc: "Every saint result includes an interactive timeline of key life moments with personal reflections and short prayers for each event.", accent: "#c084fc", cta: "Coming in Results", soon: true },
  { href: "/rosary", emoji: "🔥", title: "Prayer Streaks", desc: "Build consistent prayer habits with daily streak tracking for both the Rosary and the Saint Ally Builder.", accent: "#f97316", cta: "Track My Streak", soon: true },
];

const TRUST_POINTS = [
  { icon: "✝", title: "Grounded in the Catechism", desc: "Every prayer, saint profile, and meditation is anchored in official Catholic teaching (CCC 956, 2708, 1832)." },
  { icon: "🙏", title: "Supplement, Not Replace", desc: "PraySaint is a devotional aid — not a substitute for the Sacraments, your priest, or formal spiritual direction (CCC 2690)." },
  { icon: "🔒", title: "Private & Confidential", desc: "Your prayer intentions are never stored, sold, or used for any purpose. What you share stays between you and God." },
];

/* ─── Page ───────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)" }}>

      {/* ══════════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          background: "linear-gradient(155deg, #060d22 0%, #0a1530 45%, #0f2040 80%, #12295a 100%)",
          position: "relative",
          overflow: "hidden",
          paddingTop: "100px",
          paddingBottom: "120px",
        }}
        aria-labelledby="hero-heading"
      >
        {/* Cathedral glow */}
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 65% at 50% -10%, rgba(212,160,23,0.16) 0%, transparent 60%)", pointerEvents: "none" }} />
        {/* Side glows */}
        <div aria-hidden="true" style={{ position: "absolute", left: "5%", top: "20%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,160,23,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", right: "5%", bottom: "15%", width: "250px", height: "250px", borderRadius: "50%", background: "radial-gradient(circle, rgba(107,159,212,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        {/* Bottom fade */}
        <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "100px", background: "linear-gradient(to bottom, transparent, var(--bg-page))", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}
               className="lg:grid-cols-2 grid-cols-1"
          >
            {/* Left column */}
            <div>
              {/* Cross icon */}
              <div
                className="animate-cross-fade-in animate-glow-pulse"
                style={{ marginBottom: "20px", filter: "drop-shadow(0 0 24px rgba(212,160,23,0.6))" }}
                aria-hidden="true"
              >
                <CrossSVG size={42} />
              </div>

              {/* Overline */}
              <p
                className="animate-fade-in"
                style={{ color: "rgba(212,160,23,0.75)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "16px", animationDelay: "0.1s" }}
              >
                A Catholic Devotional Companion
              </p>

              {/* Heading */}
              <h1
                id="hero-heading"
                className="animate-fade-slide-up"
                style={{
                  fontFamily: "Playfair Display, Georgia, serif",
                  fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
                  fontWeight: 700,
                  color: "#f0e8d5",
                  lineHeight: 1.12,
                  textShadow: "0 2px 40px rgba(212,160,23,0.18)",
                  marginBottom: "20px",
                  animationDelay: "0.15s",
                }}
              >
                Find the Saints<br />
                <span style={{ color: "#f0c040" }}>Who Walk With You</span>
              </h1>

              {/* Subheadline */}
              <p
                className="animate-fade-slide-up"
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontStyle: "italic",
                  fontSize: "1.1rem",
                  lineHeight: 1.8,
                  color: "rgba(240,232,213,0.72)",
                  marginBottom: "36px",
                  maxWidth: "480px",
                  animationDelay: "0.25s",
                }}
              >
                Tell us your struggle. Receive a personalized team of heavenly intercessors and a beautifully formatted prayer card — grounded in 2,000 years of Catholic teaching.
              </p>

              {/* CTAs */}
              <div
                className="animate-fade-slide-up"
                style={{ display: "flex", flexWrap: "wrap", gap: "12px", animationDelay: "0.35s" }}
              >
                <Link href="/saints" className="btn-gold" style={{ fontSize: "0.92rem" }}>
                  Find My Saints →
                </Link>
                <a href="#how-it-works" className="btn-ghost" style={{ fontSize: "0.92rem" }}>
                  See How It Works
                </a>
              </div>

              {/* Trust line */}
              <p
                className="animate-fade-in"
                style={{ color: "rgba(240,232,213,0.38)", fontSize: "11px", marginTop: "20px", letterSpacing: "0.06em", animationDelay: "0.5s" }}
              >
                Free · No account required · Grounded in Catholic teaching
              </p>
            </div>

            {/* Right column – mock card */}
            <div
              className="animate-fade-slide-up"
              style={{ display: "flex", justifyContent: "center", animationDelay: "0.3s" }}
            >
              <MockSaintCard />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          2. HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        style={{ padding: "96px 24px", background: "var(--bg-page)" }}
        aria-labelledby="how-heading"
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <Reveal>
            <p style={{ textAlign: "center", color: "#d4a017", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "12px" }}>
              Simple & Sacred
            </p>
            <h2
              id="how-heading"
              style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, textAlign: "center", color: "var(--fg-primary)", marginBottom: "16px" }}
            >
              How It Works
            </h2>
            <p style={{ textAlign: "center", fontSize: "1rem", color: "var(--fg-muted)", maxWidth: "480px", margin: "0 auto 64px", lineHeight: 1.7 }}>
              Three steps to find your heavenly intercessors and deepen your prayer life.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", position: "relative" }}>
            {HOW_IT_WORKS.map(({ n, icon, title, desc }, i) => (
              <Reveal key={n} delay={i * 120}>
                <div
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    padding: "36px 28px",
                    boxShadow: "var(--shadow-md)",
                    position: "relative",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(212,160,23,0.3)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                >
                  {/* Step number circle */}
                  <div style={{
                    width: "52px", height: "52px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #d4a017, #b8860b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "Playfair Display, serif", fontSize: "1.3rem", fontWeight: 700, color: "#fff",
                    marginBottom: "20px",
                    boxShadow: "0 6px 20px rgba(212,160,23,0.35)",
                  }}>
                    {n}
                  </div>
                  {/* Icon */}
                  <div style={{ fontSize: "1.6rem", marginBottom: "12px" }} aria-hidden="true">{icon}</div>
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "10px" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.75, color: "var(--fg-muted)" }}>
                    {desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={400}>
            <div style={{ textAlign: "center", marginTop: "48px" }}>
              <Link href="/saints" className="btn-gold" style={{ fontSize: "0.95rem" }}>
                Begin Your Journey →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          3. FEATURES GRID
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="section-dark"
        style={{ padding: "96px 24px" }}
        aria-labelledby="features-heading"
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative" }}>
          <Reveal>
            <p style={{ textAlign: "center", color: "rgba(212,160,23,0.75)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "12px" }}>
              Everything You Need
            </p>
            <h2
              id="features-heading"
              style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, textAlign: "center", color: "#f0e8d5", marginBottom: "16px" }}
            >
              Grow in Faith, One Prayer at a Time
            </h2>
            <p style={{ textAlign: "center", fontSize: "1rem", color: "rgba(240,232,213,0.55)", maxWidth: "480px", margin: "0 auto 64px", lineHeight: 1.7 }}>
              Catholic devotional tools grounded in 2,000 years of Church tradition.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="stagger">
            {FEATURES.map(({ href, emoji, title, desc, accent, cta, soon }) => (
              <Link
                key={title}
                href={href}
                className="animate-fade-slide-up"
                style={{
                  display: "block",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "20px",
                  padding: "28px 24px",
                  textDecoration: "none",
                  transition: "all 0.25s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = `${accent}44`; e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.35)`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.boxShadow = ""; }}
              >
                {/* Accent top line */}
                <div style={{ height: "2px", background: `linear-gradient(90deg, ${accent}, transparent)`, borderRadius: "2px", marginBottom: "20px" }} />
                {soon && (
                  <div className="badge-premium" style={{ position: "absolute", top: "20px", right: "20px" }}>
                    Coming Soon
                  </div>
                )}
                <div style={{ fontSize: "1.8rem", marginBottom: "12px" }} aria-hidden="true">{emoji}</div>
                <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.1rem", fontWeight: 700, color: "#f0e8d5", marginBottom: "8px" }}>
                  {title}
                </h3>
                <p style={{ fontSize: "0.875rem", lineHeight: 1.72, color: "rgba(240,232,213,0.55)", marginBottom: "18px" }}>
                  {desc}
                </p>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: accent, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  {cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          4. THEOLOGY / TRUST
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="section-dark"
        style={{ padding: "80px 24px" }}
        aria-labelledby="faith-heading"
      >
        <div style={{ maxWidth: "880px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          <Reveal>
            {/* Cross divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", justifyContent: "center" }}>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(212,160,23,0.35))", maxWidth: "140px" }} />
              <span style={{ color: "rgba(212,160,23,0.7)", fontSize: "18px" }}>✝</span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(212,160,23,0.35))", maxWidth: "140px" }} />
            </div>

            <p style={{ color: "rgba(212,160,23,0.75)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "12px" }}>
              Our Commitment
            </p>
            <h2
              id="faith-heading"
              style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#f0e8d5", marginBottom: "16px" }}
            >
              Faithfully Catholic
            </h2>
            <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1rem", lineHeight: 1.8, color: "rgba(240,232,213,0.6)", marginBottom: "52px", maxWidth: "520px", margin: "0 auto 52px" }}>
              PraySaint is a devotional aid — not an official product of the Church. We exist to support your prayer life, never to replace the Sacraments or your priest.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {TRUST_POINTS.map(({ icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(212,160,23,0.12)",
                    borderRadius: "16px",
                    padding: "24px 20px",
                  }}
                >
                  <div style={{ fontSize: "1.5rem", marginBottom: "12px", filter: "drop-shadow(0 0 8px rgba(212,160,23,0.4))" }}>{icon}</div>
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1rem", fontWeight: 700, color: "#f0e8d5", marginBottom: "8px" }}>{title}</h3>
                  <p style={{ fontSize: "0.83rem", lineHeight: 1.7, color: "rgba(240,232,213,0.5)" }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          5. FINAL CTA
      ══════════════════════════════════════════════════════════════ */}
      <section
        style={{
          padding: "96px 24px",
          background: "linear-gradient(160deg, #060d22, #0a1530 50%, #0f2040)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(212,160,23,0.1) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative" }}>
          <Reveal>
            <div style={{ marginBottom: "20px", filter: "drop-shadow(0 0 20px rgba(212,160,23,0.5))" }} aria-hidden="true">
              <CrossSVG size={36} />
            </div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, color: "#f0e8d5", marginBottom: "16px", lineHeight: 1.2 }}>
              You Are Not Alone<br />
              <span style={{ color: "#f0c040" }}>in Your Struggle</span>
            </h2>
            <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.05rem", lineHeight: 1.8, color: "rgba(240,232,213,0.65)", marginBottom: "36px" }}>
              The saints walked every path you have walked. Let them walk alongside you now.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
              <Link href="/saints" className="btn-gold" style={{ fontSize: "1rem", padding: "1rem 2.25rem" }}>
                Find My Saints →
              </Link>
              <Link href="/rosary" className="btn-ghost" style={{ fontSize: "1rem" }}>
                📿 Pray the Rosary
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
