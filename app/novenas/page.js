"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { NOVENAS, ALL_INTENTION_TAGS, getNovenasByTag } from "@/lib/novenasData";

/* ─── Active novena sessions from localStorage ───────────────────── */
function getActiveSessions() {
  try {
    const sessions = [];
    for (const novena of NOVENAS) {
      const key = `novena_session_${novena.slug}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const session = JSON.parse(raw);
        if (session.currentDay <= 9) {
          sessions.push({ novena, session });
        }
      }
    }
    return sessions;
  } catch { return []; }
}

/* ─── Mini progress ring ─────────────────────────────────────────── */
function ProgressRing({ day, total = 9, color = "#d4a017", size = 48 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = ((day - 1) / total) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
    </svg>
  );
}

/* ─── Novena card ─────────────────────────────────────────────────── */
function NovenaCard({ novena, compact = false }) {
  return (
    <Link
      href={`/novenas/${novena.slug}`}
      style={{
        display: "block",
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${novena.color}33`,
        borderRadius: "20px",
        padding: compact ? "18px 16px" : "24px 22px",
        textDecoration: "none",
        transition: "all 0.22s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = `${novena.color}66`;
        e.currentTarget.style.boxShadow = `0 12px 36px rgba(0,0,0,0.35), 0 0 0 1px ${novena.color}22`;
        e.currentTarget.style.background = `rgba(255,255,255,0.07)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.borderColor = `${novena.color}33`;
        e.currentTarget.style.boxShadow = "";
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
      }}
    >
      <div style={{ height: "2px", background: `linear-gradient(90deg, ${novena.color}, transparent)`, borderRadius: "2px", marginBottom: "16px" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <span style={{ fontSize: compact ? "1.4rem" : "1.8rem", flexShrink: 0 }} aria-hidden="true">{novena.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "Playfair Display, serif", fontSize: compact ? "0.95rem" : "1.05rem", fontWeight: 700, color: "#f0e8d5", marginBottom: "4px" }}>
            {novena.name}
          </p>
          <p style={{ fontSize: "0.72rem", color: `${novena.color}bb`, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
            {novena.category}
          </p>
          {!compact && (
            <p style={{ fontSize: "0.8rem", lineHeight: 1.6, color: "rgba(240,232,213,0.55)" }}>
              {novena.description.slice(0, 100)}…
            </p>
          )}
        </div>
      </div>
      {!compact && (
        <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {novena.intentionTags.slice(0, 3).map((tag) => (
            <span key={tag} style={{ fontSize: "10px", fontWeight: 600, padding: "3px 8px", borderRadius: "999px", background: `${novena.color}16`, border: `1px solid ${novena.color}33`, color: novena.color }}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: novena.color }}>Begin Novena →</span>
        <span style={{ fontSize: "10px", color: "rgba(240,232,213,0.4)" }}>9 days · {novena.feast}</span>
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function NovenaLandingPage() {
  const [selectedTag, setSelectedTag]     = useState(null);
  const [searchQuery, setSearchQuery]     = useState("");
  const [activeSessions, setActive]       = useState([]);

  useEffect(() => {
    setActive(getActiveSessions());
  }, []);

  const filteredNovenas = NOVENAS.filter((n) => {
    const matchesTag = !selectedTag || n.intentionTags.includes(selectedTag);
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || n.name.toLowerCase().includes(q) || n.category.toLowerCase().includes(q) || n.description.toLowerCase().includes(q);
    return matchesTag && matchesSearch;
  });

  const recommended = selectedTag ? getNovenasByTag(selectedTag).slice(0, 3) : NOVENAS.slice(0, 3);

  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)", minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="page-hero" style={{ padding: "80px 24px 90px", textAlign: "center" }}>
        <p style={{ color: "rgba(212,160,23,0.72)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "12px" }}>
          CCC 2709 · Contemplative Prayer
        </p>
        <h1
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            fontWeight: 700,
            color: "#f0e8d5",
            lineHeight: 1.15,
            textShadow: "0 2px 30px rgba(212,160,23,0.18)",
            marginBottom: "14px",
          }}
        >
          Novenas
        </h1>
        <p
          style={{
            fontFamily: "Playfair Display, serif",
            fontStyle: "italic",
            fontSize: "1.3rem",
            lineHeight: 1.8,
            color: "rgba(240,232,213,0.75)",
            maxWidth: "520px",
            margin: "0 auto 8px",
          }}
        >
          What grace are you seeking today?
        </p>
        <p style={{ fontSize: "0.92rem", color: "rgba(240,232,213,0.5)", maxWidth: "440px", margin: "0 auto" }}>
          Pray a powerful 9-day novena with guided daily prayers, reflections, and Scripture — walking with a patron saint toward your deepest needs.
        </p>
      </section>

      {/* ── Intention Chips ──────────────────────────────────────── */}
      <section style={{ background: "var(--bg-page)", padding: "32px 24px 0" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--fg-muted)", marginBottom: "14px", textAlign: "center" }}>
            Filter by Intention
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                padding: "7px 16px",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: 600,
                border: `1px solid ${!selectedTag ? "rgba(212,160,23,0.6)" : "rgba(255,255,255,0.12)"}`,
                background: !selectedTag ? "rgba(212,160,23,0.15)" : "transparent",
                color: !selectedTag ? "#f0c040" : "var(--fg-muted)",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              All
            </button>
            {ALL_INTENTION_TAGS.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(isActive ? null : tag)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "999px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    border: `1px solid ${isActive ? "rgba(212,160,23,0.6)" : "rgba(255,255,255,0.12)"}`,
                    background: isActive ? "rgba(212,160,23,0.15)" : "transparent",
                    color: isActive ? "#f0c040" : "var(--fg-muted)",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "40px", alignItems: "start" }}>

          {/* ── Main content ─────────────────────────────────────── */}
          <div>

            {/* Active Novenas */}
            {activeSessions.length > 0 && (
              <div style={{ marginBottom: "40px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#d4a017", marginBottom: "16px" }}>
                  🕯 Continue Your Novenas
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {activeSessions.map(({ novena, session }) => (
                    <Link
                      key={novena.slug}
                      href={`/novenas/${novena.slug}/day-${session.currentDay}`}
                      style={{
                        display: "flex", alignItems: "center", gap: "16px",
                        padding: "16px 20px",
                        borderRadius: "16px",
                        background: "rgba(212,160,23,0.08)",
                        border: "1px solid rgba(212,160,23,0.25)",
                        textDecoration: "none",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <ProgressRing day={session.currentDay} color={novena.color} />
                        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: novena.color }}>
                          {session.currentDay - 1}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.92rem", fontWeight: 700, color: "#f0e8d5", marginBottom: "2px" }}>{novena.name}</p>
                        <p style={{ fontSize: "0.78rem", color: "rgba(240,232,213,0.55)" }}>Day {session.currentDay} of 9 — Continue today's prayer →</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Novenas */}
            <div style={{ marginBottom: "40px" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--fg-muted)", marginBottom: "16px" }}>
                {selectedTag ? `Recommended for ${selectedTag}` : "Recommended Novenas"}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                {recommended.map((n) => <NovenaCard key={n.id} novena={n} />)}
              </div>
            </div>

            {/* Browse All */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", flexWrap: "wrap" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--fg-muted)" }}>
                  Browse All Novenas
                </p>
                {/* Search */}
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search novenas…"
                  aria-label="Search novenas"
                  style={{
                    flex: "1 1 200px",
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border)",
                    borderRadius: "999px",
                    padding: "8px 16px",
                    fontSize: "0.85rem",
                    color: "var(--fg-primary)",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "#d4a017"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
                {filteredNovenas.length > 0 ? (
                  filteredNovenas.map((n) => <NovenaCard key={n.id} novena={n} />)
                ) : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--fg-muted)" }}>
                    <p style={{ fontSize: "1.2rem", marginBottom: "8px" }}>🕯</p>
                    <p>No novenas found for that search. Try a different term or clear the filter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside>
            {/* Quick start */}
            <div
              style={{
                background: "linear-gradient(160deg, #060d22, #0a1530 55%, #0f2040)",
                border: "1px solid rgba(212,160,23,0.2)",
                borderRadius: "20px",
                padding: "24px 20px",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(212,160,23,0.7)", marginBottom: "14px" }}>
                What is a Novena?
              </p>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.8, color: "rgba(240,232,213,0.72)", marginBottom: "16px" }}>
                A novena is nine days of prayer, modeled on the nine days the Apostles prayed in the Upper Room between the Ascension and Pentecost (Acts 1:14). It is the oldest form of Catholic devotional prayer.
              </p>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.8, color: "rgba(240,232,213,0.65)" }}>
                Each day includes a prayer, reflection, and Scripture — guiding you deeper into God's heart.
              </p>
            </div>

            {/* CTA to Saint Match */}
            <div
              style={{
                background: "rgba(212,160,23,0.08)",
                border: "1px solid rgba(212,160,23,0.2)",
                borderRadius: "20px",
                padding: "24px 20px",
                marginBottom: "20px",
              }}
            >
              <p style={{ fontFamily: "Playfair Display, serif", fontSize: "1rem", fontWeight: 700, color: "#f0c040", marginBottom: "8px" }}>
                Not sure which novena?
              </p>
              <p style={{ fontSize: "0.82rem", lineHeight: 1.7, color: "rgba(240,232,213,0.65)", marginBottom: "14px" }}>
                Let our Saint Match find your patron saint, then begin their novena.
              </p>
              <Link href="/saints" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", fontWeight: 700, color: "#d4a017", textDecoration: "none" }}>
                Find My Saint Match →
              </Link>
            </div>

            {/* All Novenas list */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--fg-muted)", marginBottom: "14px" }}>
                All 12 Novenas
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {NOVENAS.map((n) => (
                  <Link
                    key={n.id}
                    href={`/novenas/${n.slug}`}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "10px", textDecoration: "none", transition: "background 0.15s ease" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: "1rem", flexShrink: 0 }}>{n.emoji}</span>
                    <span style={{ fontSize: "0.82rem", color: "var(--fg-secondary)" }}>{n.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
