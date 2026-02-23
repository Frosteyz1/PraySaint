"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { use } from "react";
import { getNovenaBySlug, NOVENAS } from "@/lib/novenasData";

/* ─── localStorage session helpers ───────────────────────────────── */
function getSession(slug) {
  try {
    const raw = localStorage.getItem(`novena_session_${slug}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function startSession(slug, startDate) {
  try {
    const session = {
      slug,
      startDate,
      currentDay: 1,
      completedDays: [],
      intention: "",
      lastVisited: new Date().toISOString(),
    };
    localStorage.setItem(`novena_session_${slug}`, JSON.stringify(session));
    return session;
  } catch { return null; }
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function NovenaDetailPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  const novena = getNovenaBySlug(slug);

  const [startDate,   setStartDate]   = useState(() => new Date().toISOString().slice(0, 10));
  const [intention,   setIntention]   = useState("");
  const [existingSession, setSession] = useState(null);
  const [hydrated,    setHydrated]    = useState(false);

  useEffect(() => {
    setHydrated(true);
    const s = getSession(slug);
    setSession(s);
  }, [slug]);

  if (!novena) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <p style={{ fontSize: "1.2rem", color: "var(--fg-muted)" }}>Novena not found.</p>
        <Link href="/novenas" style={{ color: "#d4a017" }}>← Back to Novenas</Link>
      </div>
    );
  }

  function handleBegin() {
    const session = startSession(slug, startDate);
    if (session) {
      // Save intention too
      try {
        const s = JSON.parse(localStorage.getItem(`novena_session_${slug}`) || "{}");
        s.intention = intention;
        localStorage.setItem(`novena_session_${slug}`, JSON.stringify(s));
      } catch {}
      window.location.href = `/novenas/${slug}/day-1`;
    }
  }

  function handleContinue() {
    if (existingSession) {
      window.location.href = `/novenas/${slug}/day-${existingSession.currentDay}`;
    }
  }

  const completedCount = existingSession?.completedDays?.length ?? 0;
  const progressPct = hydrated ? Math.round((completedCount / 9) * 100) : 0;

  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)", minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        style={{
          background: `linear-gradient(160deg, #060d22, #0a1530 50%, #0f2040)`,
          padding: "72px 24px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
        aria-labelledby="novena-heading"
      >
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${novena.color}18 0%, transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>
          {/* Back link */}
          <Link href="/novenas" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", color: "rgba(240,232,213,0.55)", textDecoration: "none", marginBottom: "24px" }}>
            ← All Novenas
          </Link>

          <div style={{ fontSize: "3rem", marginBottom: "16px", filter: `drop-shadow(0 0 16px ${novena.color}66)` }} aria-hidden="true">
            {novena.emoji}
          </div>

          <p style={{ color: `${novena.color}cc`, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "10px" }}>
            9-Day Novena · Feast: {novena.feast}
          </p>
          <h1
            id="novena-heading"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              fontWeight: 700,
              color: "#f0e8d5",
              lineHeight: 1.15,
              marginBottom: "16px",
            }}
          >
            {novena.name}
          </h1>
          <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1rem", color: `${novena.color}cc`, marginBottom: "16px" }}>
            {novena.category}
          </p>
          <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "rgba(240,232,213,0.72)", maxWidth: "520px", margin: "0 auto" }}>
            {novena.description}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "40px", alignItems: "start" }}>

          {/* ── Main detail ─────────────────────────────────────── */}
          <div>
            {/* Why this fits */}
            <div
              style={{
                background: `${novena.color}0d`,
                border: `1px solid ${novena.color}33`,
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "28px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: `${novena.color}bb`, marginBottom: "12px" }}>
                About This Novena
              </p>
              <p style={{ fontSize: "0.92rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>
                {novena.whyThisFits}
              </p>
            </div>

            {/* Opening Prayer */}
            <div
              style={{
                background: "linear-gradient(155deg, #060d22, #0a1530)",
                border: "1px solid rgba(212,160,23,0.2)",
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "28px",
              }}
            >
              <div className="cross-divider" style={{ justifyContent: "flex-start", color: "rgba(212,160,23,0.7)", fontSize: "10px", letterSpacing: "0.14em" }}>
                OPENING PRAYER
              </div>
              <p className="prayer-text" style={{ fontSize: "0.9rem", lineHeight: 2, color: "rgba(240,232,213,0.82)" }}>
                {novena.openingPrayer}
              </p>
            </div>

            {/* 9 Day Preview */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "24px",
                marginBottom: "28px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--fg-muted)", marginBottom: "16px" }}>
                9-Day Prayer Schedule
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {novena.days.map((day) => {
                  const isDone = existingSession?.completedDays?.includes(day.day);
                  const isCurrent = existingSession?.currentDay === day.day;
                  return (
                    <div
                      key={day.day}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        background: isCurrent ? `${novena.color}14` : "transparent",
                        border: isCurrent ? `1px solid ${novena.color}33` : "1px solid transparent",
                      }}
                    >
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                        background: isDone ? novena.color : isCurrent ? `${novena.color}33` : "var(--bg-elevated)",
                        border: `1.5px solid ${isDone ? novena.color : isCurrent ? novena.color : "var(--border)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700,
                        color: isDone ? "#fff" : isCurrent ? novena.color : "var(--fg-muted)",
                      }}>
                        {isDone ? "✓" : day.day}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.85rem", fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#f0c040" : "var(--fg-secondary)" }}>
                          Day {day.day}: {day.title}
                        </p>
                        <p style={{ fontSize: "0.72rem", color: "var(--fg-muted)", marginTop: "2px" }}>
                          {day.scripture.split("—")[0].trim()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Sidebar / Begin Panel ─────────────────────────── */}
          <aside>
            {/* Active session */}
            {hydrated && existingSession && existingSession.currentDay <= 9 ? (
              <div
                style={{
                  background: "linear-gradient(160deg, #060d22, #0a1530 55%, #0f2040)",
                  border: `1px solid ${novena.color}44`,
                  borderRadius: "24px",
                  padding: "28px 24px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: `${novena.color}cc`, marginBottom: "14px" }}>
                  Novena In Progress
                </p>
                {/* Progress bar */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--fg-muted)", marginBottom: "6px" }}>
                    <span>Day {completedCount} of 9 complete</span>
                    <span style={{ color: novena.color }}>{progressPct}%</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${novena.color}, #f0c040)`, borderRadius: "999px", transition: "width 0.4s ease" }} />
                  </div>
                </div>
                <button
                  onClick={handleContinue}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    borderRadius: "14px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    background: `linear-gradient(135deg, ${novena.color}, ${novena.color}bb)`,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: `0 8px 24px ${novena.color}44`,
                    marginBottom: "12px",
                  }}
                >
                  🕯 Continue Day {existingSession.currentDay}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Start this novena over from Day 1?")) {
                      localStorage.removeItem(`novena_session_${slug}`);
                      setSession(null);
                    }
                  }}
                  style={{ fontSize: "0.78rem", color: "var(--fg-muted)", background: "none", border: "none", cursor: "pointer" }}
                >
                  Start over from Day 1
                </button>
              </div>
            ) : (
              /* Begin panel */
              <div
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "24px",
                  padding: "28px 24px",
                  marginBottom: "20px",
                  boxShadow: "var(--shadow-lg)",
                  borderTop: `3px solid ${novena.color}`,
                }}
              >
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "6px" }}>
                  Begin This Novena
                </h2>
                <p style={{ fontSize: "0.8rem", color: "var(--fg-muted)", marginBottom: "22px", lineHeight: 1.6 }}>
                  Choose a start date and set your intention. Your progress will be saved locally.
                </p>

                {/* Start date */}
                <div style={{ marginBottom: "18px" }}>
                  <label htmlFor="start-date" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-secondary)", marginBottom: "6px" }}>
                    Start Date
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-sacred"
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>

                {/* Intention */}
                <div style={{ marginBottom: "22px" }}>
                  <label htmlFor="intention" style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "var(--fg-secondary)", marginBottom: "6px" }}>
                    My Intention <span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    id="intention"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="What grace are you seeking? Write it here as a prayer intention…"
                    rows={3}
                    className="input-sacred resize-none"
                    style={{ fontSize: "0.87rem" }}
                  />
                </div>

                <button
                  onClick={handleBegin}
                  style={{
                    width: "100%",
                    padding: "0.9rem",
                    borderRadius: "14px",
                    fontWeight: 700,
                    fontSize: "0.97rem",
                    background: `linear-gradient(135deg, ${novena.color}, ${novena.color}bb)`,
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: `0 8px 28px ${novena.color}44`,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
                >
                  🕯 Begin This Novena →
                </button>

                <p style={{ fontSize: "0.72rem", color: "var(--fg-muted)", textAlign: "center", marginTop: "12px" }}>
                  Your progress is saved only on this device.
                </p>
              </div>
            )}

            {/* Intention tags */}
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px", padding: "18px 16px" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--fg-muted)", marginBottom: "12px" }}>
                Good For
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {novena.intentionTags.map((tag) => (
                  <span key={tag} style={{ fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "999px", background: `${novena.color}14`, border: `1px solid ${novena.color}33`, color: novena.color }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
