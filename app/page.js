"use client";

import Link from "next/link";

/* ─── Inline SVG icon components ─────────────────────────────────── */
function CrossSVG({ size = 52, opacity = 1 }) {
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 52 70"
      fill="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <rect x="22" y="0"  width="8"  height="70" rx="2" fill="#d4a017"/>
      <rect x="4"  y="18" width="44" height="8"  rx="2" fill="#d4a017"/>
    </svg>
  );
}

const features = [
  {
    href:   "/saints",
    icon:   "✦",
    emoji:  "⚔",
    title:  "Saint Ally Builder",
    tagline:"Your Heavenly Intercessors",
    desc:   "Share your challenge and receive a matched team of real patron saints — with historically accurate backstories, virtues, symbols, and a custom novena prayer.",
    cta:    "Find My Saints",
    accent: "#d4a017",
  },
  {
    href:   "/rosary",
    icon:   "✦",
    emoji:  "📿",
    title:  "Virtual Rosary",
    tagline:"Contemplative Prayer",
    desc:   "Pray the Rosary bead by bead with AI-suggested intentions and Vatican-inspired mystery meditations. Track your daily streak.",
    cta:    "Pray the Rosary",
    accent: "#6b9fd4",
  },
  {
    href:   "/memes",
    icon:   "✦",
    emoji:  "😂",
    title:  "Catholic Memes",
    tagline:"Joy Is a Gift",
    desc:   "Create uplifting, wholesome faith memes from Scripture and saint quotes — joyful humor that draws people closer to God (CCC 1832).",
    cta:    "Create a Meme",
    accent: "#7cc47f",
  },
];

export default function HomePage() {
  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)", minHeight: "100vh" }}>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        className="page-hero relative text-center px-6 pt-24 pb-32"
        aria-labelledby="hero-heading"
      >
        {/* Animated cross */}
        <div className="animate-cross-fade-in animate-float flex justify-center mb-6" aria-hidden="true">
          <div style={{ filter: "drop-shadow(0 0 28px rgba(212,160,23,0.55))" }}>
            <CrossSVG size={48} />
          </div>
        </div>

        {/* Overline */}
        <p
          className="animate-fade-in text-xs font-bold uppercase tracking-[0.18em] mb-4"
          style={{ color: "rgba(212,160,23,0.75)", animationDelay: "0.1s" }}
        >
          A Catholic AI Companion
        </p>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="animate-fade-slide-up text-5xl sm:text-6xl font-bold mb-5"
          style={{
            fontFamily: "Playfair Display, Georgia, serif",
            color: "#f0e8d5",
            lineHeight: 1.15,
            textShadow: "0 2px 40px rgba(212,160,23,0.2)",
            animationDelay: "0.15s",
          }}
        >
          Grow Closer to God
        </h1>

        {/* Sub */}
        <p
          className="animate-fade-slide-up prayer-text text-lg max-w-xl mx-auto mb-10"
          style={{ color: "rgba(240,232,213,0.72)", animationDelay: "0.25s" }}
        >
          Through the intercession of the saints, the Holy Rosary, and
          joyful faith sharing — powered by AI, grounded in Catholic teaching.
        </p>

        {/* CTA */}
        <div
          className="animate-fade-slide-up flex flex-wrap gap-3 justify-center"
          style={{ animationDelay: "0.35s" }}
        >
          <Link
            href="/saints"
            className="inline-flex items-center gap-2 font-bold text-sm px-7 py-3.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
            style={{
              background: "linear-gradient(135deg, #d4a017, #b8860b)",
              color: "#fff",
              boxShadow: "0 6px 24px rgba(212,160,23,0.4)",
            }}
          >
            Begin Your Journey →
          </Link>
          <Link
            href="/rosary"
            className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(240,232,213,0.9)",
              backdropFilter: "blur(12px)",
            }}
          >
            Pray the Rosary 📿
          </Link>
        </div>

        {/* Bottom fade is handled by .page-hero::after */}
      </section>

      {/* ── Feature cards ──────────────────────────────────────────── */}
      <section
        className="max-w-5xl mx-auto px-5 pb-20"
        style={{ marginTop: "-28px" }}
        aria-label="Features"
      >
        <div className="grid gap-5 sm:grid-cols-3 stagger">
          {features.map(({ href, emoji, title, tagline, desc, cta, accent }) => (
            <Link
              key={href}
              href={href}
              className="animate-fade-slide-up group block rounded-2xl p-6 transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
                textDecoration: "none",
              }}
              aria-label={title}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                e.currentTarget.style.borderColor = "rgba(212,160,23,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              {/* Accent line */}
              <div
                style={{
                  height: "3px",
                  background: `linear-gradient(90deg, ${accent}, transparent)`,
                  borderRadius: "2px",
                  marginBottom: "20px",
                }}
                aria-hidden="true"
              />

              <div className="text-3xl mb-3" aria-hidden="true">{emoji}</div>

              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{ color: accent }}
              >
                {tagline}
              </p>

              <h2
                className="text-lg font-bold mb-2"
                style={{
                  fontFamily: "Playfair Display, serif",
                  color: "var(--fg-primary)",
                }}
              >
                {title}
              </h2>

              <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--fg-muted)" }}>
                {desc}
              </p>

              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
                style={{ color: accent }}
              >
                {cta}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Divider + Disclaimer ────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <div className="cross-divider" aria-hidden="true">✝</div>
        <p className="prayer-text text-sm" style={{ color: "var(--fg-muted)" }}>
          PatronForge is a devotional AI tool — not an official product of the
          Catholic Church. All content is for personal reflection. Consult your
          priest or deacon for formal spiritual direction (CCC 2690).
        </p>
      </div>
    </div>
  );
}
