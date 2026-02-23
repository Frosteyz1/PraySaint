"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import PrayerCard from "@/components/PrayerCard";
import ShareButton from "@/components/ShareButton";
import ReflectionPrompt from "@/components/ReflectionPrompt";

/* ─── localStorage helpers (LOGIC UNCHANGED) ─────────────────────── */
function saveAlly(data) {
  try {
    const existing = JSON.parse(localStorage.getItem("patronforge_allies") || "[]");
    existing.unshift({ ...data, savedAt: new Date().toISOString() });
    localStorage.setItem("patronforge_allies", JSON.stringify(existing.slice(0, 10)));
  } catch {}
}
function getStreak() {
  try {
    const raw = localStorage.getItem("patronforge_saint_streak");
    const s = raw ? JSON.parse(raw) : { count: 0, lastDate: null };
    const today = new Date().toDateString();
    if (s.lastDate === today) return s.count;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    return s.lastDate === yesterday ? s.count : 0;
  } catch { return 0; }
}
function bumpStreak() {
  try {
    const today = new Date().toDateString();
    const raw = localStorage.getItem("patronforge_saint_streak");
    const s = raw ? JSON.parse(raw) : { count: 0, lastDate: null };
    if (s.lastDate === today) return s.count;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const newCount = s.lastDate === yesterday ? s.count + 1 : 1;
    localStorage.setItem("patronforge_saint_streak", JSON.stringify({ count: newCount, lastDate: today }));
    return newCount;
  } catch { return 1; }
}

/* ─── Tag chip ───────────────────────────────────────────────────── */
function Tag({ children, accent = "gold" }) {
  const styles = {
    gold:  { bg: "rgba(212,160,23,0.12)", border: "rgba(212,160,23,0.3)",  color: "#b8860b" },
    navy:  { bg: "rgba(59,90,163,0.1)",   border: "rgba(59,90,163,0.25)",  color: "#3b5aa3" },
    cream: { bg: "var(--bg-elevated)",    border: "var(--border)",          color: "var(--fg-secondary)" },
  };
  const s = styles[accent] || styles.cream;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "0.75rem", fontWeight: 600,
        padding: "4px 11px",
        borderRadius: "999px",
        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Saint Timeline (LOGIC UNCHANGED) ──────────────────────────── */
function SaintTimeline({ events = [] }) {
  const [active, setActive] = useState(null);
  if (!events || events.length === 0) return null;

  return (
    <div style={{ marginTop: "24px" }}>
      <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--fg-muted)", marginBottom: "6px" }}>
        Life Timeline
      </p>
      <p style={{ fontSize: "10px", color: "var(--fg-muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
        <span aria-hidden="true">👆</span> Tap a moment to reveal its reflection
      </p>

      <div className="timeline-track" style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute", top: "24px", left: "0", right: "0", height: "2px",
            background: "linear-gradient(to right, rgba(212,160,23,0.4), rgba(212,160,23,0.1) 90%, transparent)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        />
        {events.map((ev, i) => (
          <button
            key={i}
            onClick={() => setActive(active === i ? null : i)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
              padding: "0 20px 12px", minWidth: "120px",
              background: "none", border: "none", cursor: "pointer",
              position: "relative", textAlign: "center",
            }}
            aria-expanded={active === i}
            aria-label={`${ev.year}: ${ev.event}`}
          >
            <div
              style={{
                width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                background: active === i ? "linear-gradient(135deg, #d4a017, #f0c040)" : "var(--bg-elevated)",
                border: active === i ? "2px solid #d4a017" : "2px solid rgba(212,160,23,0.4)",
                boxShadow: active === i ? "0 0 12px rgba(212,160,23,0.5)" : "none",
                zIndex: 1, transition: "all 0.2s ease",
              }}
            />
            <span style={{ fontSize: "10px", fontWeight: 700, color: active === i ? "#d4a017" : "var(--fg-muted)", whiteSpace: "nowrap" }}>
              {ev.year}
            </span>
            <span style={{ fontSize: "10.5px", lineHeight: 1.4, color: active === i ? "var(--fg-primary)" : "var(--fg-secondary)", maxWidth: "110px" }}>
              {ev.event}
            </span>
          </button>
        ))}
      </div>

      {active !== null && events[active] && (
        <div
          style={{
            marginTop: "12px", padding: "18px 20px",
            background: "linear-gradient(135deg, rgba(212,160,23,0.06), rgba(212,160,23,0.02))",
            border: "1px solid rgba(212,160,23,0.2)", borderRadius: "14px",
            animation: "fadeIn 0.3s ease both",
          }}
        >
          <p style={{ fontSize: "0.87rem", lineHeight: 1.75, color: "var(--fg-secondary)", marginBottom: "10px" }}>
            {events[active].reflection}
          </p>
          {events[active].prayer && (
            <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "0.85rem", lineHeight: 1.8, color: "var(--fg-muted)", borderTop: "1px solid var(--border)", paddingTop: "10px", marginTop: "10px" }}>
              {events[active].prayer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Saint Card Skin Selector ───────────────────────────────────── */
const CARD_SKINS = {
  "Classic Gold": {
    bg: "linear-gradient(160deg, #060d22, #0a1530 50%, #0f2040)",
    border: "rgba(212,160,23,0.35)",
    accent: "#d4a017",
    accentBg: "rgba(212,160,23,0.10)",
    glow: "rgba(212,160,23,0.15)",
    label: "Classic Gold",
    icon: "✦",
  },
  "Modern Blue": {
    bg: "linear-gradient(160deg, #0a1628, #0d2040 50%, #1030608)",
    border: "rgba(107,159,212,0.40)",
    accent: "#6b9fd4",
    accentBg: "rgba(107,159,212,0.10)",
    glow: "rgba(107,159,212,0.15)",
    label: "Modern Blue",
    icon: "✦",
  },
  "Vintage Parchment": {
    bg: "linear-gradient(160deg, #2d2010, #3d2a14 50%, #4a3220)",
    border: "rgba(192,148,72,0.40)",
    accent: "#c09448",
    accentBg: "rgba(192,148,72,0.12)",
    glow: "rgba(192,148,72,0.15)",
    label: "Vintage Parchment",
    icon: "✦",
  },
};

/* ─── Card Enlarge Modal ──────────────────────────────────────────── */
function CardModal({ onClose, data }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged saint card"
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(4,9,26,0.94)",
        backdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        animation: "fadeIn 0.25s ease both",
      }}
      onClick={onClose}
    >
      <div
        style={{ position: "relative", animation: "fadeSlideUp 0.3s ease both" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close enlarged card"
          style={{
            position: "absolute", top: "-18px", right: "-18px", zIndex: 10,
            width: "40px", height: "40px", borderRadius: "50%",
            background: "rgba(212,160,23,0.18)",
            border: "1px solid rgba(212,160,23,0.4)",
            color: "#f0c040", fontSize: "1.1rem",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(212,160,23,0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(212,160,23,0.18)"; }}
        >
          ✕
        </button>
        {/* Scaled card */}
        <div style={{ transform: "scale(1.1)", transformOrigin: "center center" }}>
          <PrayerCard data={data} />
        </div>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "11px", color: "rgba(240,232,213,0.4)", letterSpacing: "0.06em" }}>
          Click anywhere outside to close
        </p>
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function SaintsPage() {
  /* ── State (LOGIC UNCHANGED) ── */
  const [challenge,      setChallenge]      = useState("");
  const [personality,    setPersonality]    = useState("");
  const [teamMode,       setTeamMode]       = useState(true);
  const [loading,        setLoading]        = useState(false);
  const [result,         setResult]         = useState(null);
  const [error,          setError]          = useState("");
  const [showReflection, setShowReflection] = useState(false);
  const [streak,         setStreak]         = useState(0);
  const [saved,          setSaved]          = useState(false);
  const [selectedSkin,   setSelectedSkin]   = useState("Classic Gold");
  const [showModal,      setShowModal]      = useState(false);

  const cardRef = useRef(null);

  /* ── Handlers (LOGIC UNCHANGED) ── */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!challenge.trim()) return;
    setLoading(true); setError(""); setResult(null); setSaved(false);
    try {
      const res  = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "saints", challenge, personality, teamMode }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setResult(json.data);
      setStreak(bumpStreak());
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }, [challenge, personality, teamMode]);

  function handleSave() {
    if (!result) return;
    saveAlly(result);
    setSaved(true);
  }

  const skin = CARD_SKINS[selectedSkin] || CARD_SKINS["Classic Gold"];

  /* ── Render ── */
  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)", minHeight: "100vh" }}>

      {/* ── Page Hero ─────────────────────────────────────────────── */}
      <section className="page-hero" style={{ padding: "80px 24px 96px", textAlign: "center" }}>
        <p style={{ color: "rgba(212,160,23,0.72)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "12px" }}>
          CCC 956 · Saints as Intercessors
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
          Saint Match
        </h1>
        <p
          style={{
            fontFamily: "Playfair Display, serif",
            fontStyle: "italic",
            fontSize: "1.05rem",
            lineHeight: 1.8,
            color: "rgba(240,232,213,0.65)",
            maxWidth: "520px",
            margin: "0 auto",
          }}
        >
          Share your challenge. Receive a matched team of real patron saints who intercede for you and model the virtues you need.
        </p>
        {streak > 0 && (
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              marginTop: "20px", padding: "8px 18px",
              borderRadius: "999px",
              background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.25)",
              color: "#f0c040", fontSize: "12px", fontWeight: 700,
            }}
          >
            🔥 {streak}-day streak — Keep praying!
          </div>
        )}
      </section>

      {/* ── Two-Column Form Section ───────────────────────────────── */}
      {!result && !loading && (
        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.5fr",
              gap: "48px",
              alignItems: "start",
              paddingTop: "16px",
              paddingBottom: "64px",
            }}
          >
            {/* LEFT: Emotional copy — wrapped in glass bubble */}
            <div
              style={{
                paddingTop: "8px",
                background: "linear-gradient(145deg, rgba(212,160,23,0.06) 0%, rgba(255,255,255,0.03) 60%, rgba(212,160,23,0.04) 100%)",
                border: "1px solid rgba(212,160,23,0.20)",
                borderRadius: "24px",
                padding: "32px 28px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(212,160,23,0.06)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle inner glow */}
              <div aria-hidden="true" style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "100px",
                background: "radial-gradient(ellipse 80% 80% at 50% 0%, rgba(212,160,23,0.10) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              <div style={{ marginBottom: "24px", filter: "drop-shadow(0 0 16px rgba(212,160,23,0.4))" }} aria-hidden="true">
                <svg width="36" height="49" viewBox="0 0 36 49" fill="none">
                  <rect x="15" y="0" width="6" height="49" rx="2" fill="#d4a017"/>
                  <rect x="3"  y="13" width="30" height="6"  rx="2" fill="#d4a017"/>
                </svg>
              </div>

              <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.65rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "16px", lineHeight: 1.25, position: "relative" }}>
                You Are Not Meant to Suffer Alone
              </h2>

              <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "0.97rem", lineHeight: 1.9, color: "var(--fg-secondary)", marginBottom: "18px", position: "relative" }}>
                "The Church has always believed in the Communion of Saints. Those who have gone before us in faith are not absent — they intercede for us before the throne of God."
              </p>

              <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "var(--fg-muted)", marginBottom: "18px", position: "relative" }}>
                From anxiety to grief, from addiction to vocational confusion — real saints have walked every path you walk. They know your struggle from the inside.
              </p>

              <p style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "var(--fg-muted)", marginBottom: "24px", position: "relative" }}>
                PraySaint matches you with 2–3 real, historically verified saints based on their patronage, lived virtues, and the specific nature of your prayer intention.
              </p>

              {/* CCC Reference */}
              <div
                style={{
                  padding: "16px 18px",
                  borderRadius: "14px",
                  background: "rgba(212,160,23,0.09)",
                  border: "1px solid rgba(212,160,23,0.22)",
                  position: "relative",
                }}
              >
                <p style={{ fontSize: "0.78rem", fontStyle: "italic", color: "rgba(212,160,23,0.95)", lineHeight: 1.7 }}>
                  "Being more closely united to Christ, those who dwell in heaven fix the whole Church more firmly in holiness… they do not cease to intercede with the Father for us."
                </p>
                <p style={{ fontSize: "0.72rem", color: "rgba(212,160,23,0.60)", marginTop: "6px", fontWeight: 700, letterSpacing: "0.06em" }}>
                  — CCC 956
                </p>
              </div>
            </div>

            {/* RIGHT: Form — enhanced 3D / visual */}
            <div>
              <form
                onSubmit={handleSubmit}
                aria-label="Saint Match form"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "24px",
                  padding: "36px",
                  boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(212,160,23,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                  borderTop: "3px solid transparent",
                  backgroundImage: "linear-gradient(var(--bg-surface), var(--bg-surface)), linear-gradient(135deg, #f0c040, #d4a017, #b8860b)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle top glow inside form */}
                <div aria-hidden="true" style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "80px",
                  background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(212,160,23,0.07) 0%, transparent 70%)",
                  pointerEvents: "none", borderRadius: "24px 24px 0 0",
                }} />

                <div style={{ position: "relative" }}>
                  <h2
                    style={{
                      fontFamily: "Playfair Display, serif",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      color: "var(--fg-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    Share Your Situation
                  </h2>
                  <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", marginBottom: "28px", lineHeight: 1.6 }}>
                    Be as specific as you wish. The more context you give, the better your match.
                  </p>

                  {/* Challenge field */}
                  <div style={{ marginBottom: "22px" }}>
                    <label htmlFor="challenge" style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--fg-secondary)", marginBottom: "6px" }}>
                      What are you going through? *
                    </label>
                    <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", marginBottom: "10px" }}>
                      For example: anxiety about my future, grief after loss, temptation, vocational confusion…
                    </p>
                    <textarea
                      id="challenge"
                      value={challenge}
                      onChange={(e) => setChallenge(e.target.value)}
                      placeholder="Describe your struggle, prayer intention, or life situation…"
                      rows={4}
                      required
                      aria-required="true"
                      className="input-sacred resize-none"
                    />
                  </div>

                  {/* Personality field */}
                  <div style={{ marginBottom: "22px" }}>
                    <label htmlFor="personality" style={{ display: "block", fontSize: "0.88rem", fontWeight: 700, color: "var(--fg-secondary)", marginBottom: "6px" }}>
                      About You{" "}
                      <span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", marginBottom: "10px" }}>
                      Introvert, student, parent, athlete, creative, military veteran…
                    </p>
                    <input
                      id="personality"
                      type="text"
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value)}
                      placeholder="Your personality or background"
                      className="input-sacred"
                    />
                  </div>

                  {/* Team mode toggle — more opaque & visible */}
                  <div
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "14px",
                      padding: "18px",
                      borderRadius: "14px",
                      background: teamMode
                        ? "linear-gradient(135deg, rgba(212,160,23,0.12), rgba(212,160,23,0.06))"
                        : "var(--bg-elevated)",
                      border: teamMode ? "1px solid rgba(212,160,23,0.30)" : "1px solid var(--border)",
                      cursor: "pointer",
                      marginBottom: "28px",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setTeamMode((t) => !t)}
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={teamMode}
                      style={{
                        flexShrink: 0, marginTop: "2px",
                        width: "50px", height: "28px",
                        borderRadius: "999px",
                        background: teamMode
                          ? "linear-gradient(135deg, #f0c040, #d4a017, #b8860b)"
                          : "rgba(120,140,180,0.45)",
                        boxShadow: teamMode
                          ? "0 2px 14px rgba(212,160,23,0.55), inset 0 1px 0 rgba(255,255,255,0.25)"
                          : "inset 0 1px 3px rgba(0,0,0,0.3)",
                        border: "none", cursor: "pointer",
                        position: "relative", overflow: "hidden",
                        transition: "all 0.22s ease",
                      }}
                      onClick={(e) => { e.stopPropagation(); setTeamMode((t) => !t); }}
                    >
                      <span
                        style={{
                          position: "absolute", top: "5px",
                          width: "18px", height: "18px",
                          borderRadius: "50%", background: "#fff",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.30)",
                          transition: "transform 0.22s ease",
                          transform: teamMode ? "translateX(26px)" : "translateX(5px)",
                        }}
                      />
                    </button>
                    <div>
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "3px" }}>
                        Team Mode
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", lineHeight: 1.5 }}>
                        Match 2–3 saints as a heavenly team of intercessors — a traditional Catholic devotion (CCC 956). Turn off for a single saint focus.
                      </p>
                    </div>
                  </div>

                  {/* Privacy note */}
                  <p style={{ fontSize: "0.75rem", color: "var(--fg-muted)", marginBottom: "18px", textAlign: "center" }}>
                    🔒 Your submission is private. We do not store personal confessions.
                  </p>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || !challenge.trim()}
                    style={{
                      width: "100%",
                      fontWeight: 700, fontSize: "0.97rem",
                      padding: "1rem",
                      borderRadius: "14px",
                      border: "none",
                      cursor: loading || !challenge.trim() ? "not-allowed" : "pointer",
                      background: loading || !challenge.trim()
                        ? "var(--border)"
                        : "linear-gradient(135deg, #f0c040 0%, #d4a017 50%, #b8860b 100%)",
                      color: loading || !challenge.trim() ? "var(--fg-muted)" : "#fff",
                      boxShadow: loading || !challenge.trim()
                        ? "none"
                        : "0 8px 32px rgba(212,160,23,0.50), inset 0 1px 0 rgba(255,255,255,0.2)",
                      transition: "all 0.22s ease",
                      textShadow: loading || !challenge.trim() ? "none" : "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    {loading ? (
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Searching the Communion of Saints…
                      </span>
                    ) : "✝ Forge My Heavenly Team"}
                  </button>
                </div>
              </form>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  style={{
                    marginTop: "16px",
                    padding: "14px 16px",
                    borderRadius: "12px",
                    background: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.25)",
                    color: "#dc2626",
                    fontSize: "0.87rem",
                  }}
                >
                  ⚠ {error}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Loading: Glowing Cross Animation ─────────────────────── */}
      {loading && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }} aria-live="polite" aria-busy="true">
          <div style={{ textAlign: "center", padding: "72px 0 52px" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div style={{ position: "absolute", inset: "-38px", borderRadius: "50%", border: "1px solid rgba(212,160,23,0.1)", pointerEvents: "none" }}/>
              <div className="forge-orbit-reverse" style={{ position: "absolute", inset: "-38px", borderRadius: "50%", border: "1.5px solid transparent", borderBottomColor: "rgba(212,160,23,0.45)", borderLeftColor: "rgba(212,160,23,0.18)", pointerEvents: "none" }} />
              <div className="forge-orbit" style={{ position: "absolute", inset: "-20px", borderRadius: "50%", border: "2.5px solid transparent", borderTopColor: "#f0c040", borderRightColor: "rgba(212,160,23,0.35)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", inset: "-20px", borderRadius: "50%", border: "1px solid rgba(212,160,23,0.12)", pointerEvents: "none" }}/>
              <div className="forge-cross-glow">
                <svg width="52" height="68" viewBox="0 0 52 68" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="cg" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#fff5c0"/>
                      <stop offset="50%" stopColor="#f0c040"/>
                      <stop offset="100%" stopColor="#d4a017"/>
                    </linearGradient>
                  </defs>
                  <rect x="22" y="0"  width="8" height="68" rx="3" fill="url(#cg)"/>
                  <rect x="4"  y="18" width="44" height="8" rx="3" fill="url(#cg)"/>
                </svg>
              </div>
            </div>
            <p style={{ fontFamily: "Playfair Display, serif", color: "var(--fg-muted)", fontSize: "1rem", marginTop: "36px" }}>
              Searching the Communion of Saints…
            </p>
            <p style={{ fontSize: "0.78rem", color: "rgba(212,160,23,0.5)", marginTop: "8px", letterSpacing: "0.12em" }}>
              ✦ · ✦ · ✦
            </p>
          </div>
          <div className="shimmer" style={{ height: "280px", marginBottom: "20px" }} />
          <div className="shimmer" style={{ height: "160px", marginBottom: "16px" }} />
          <div className="shimmer" style={{ height: "160px" }} />
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────────────────── */}
      {result && !loading && (
        <div aria-live="polite">

          {/* ── Section 1: Hero Saint Card ─────────────────────── */}
          <section
            style={{
              background: skin.bg,
              padding: "64px 24px 80px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              transition: "background 0.4s ease",
            }}
          >
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 0%, ${skin.glow} 0%, transparent 60%)`, pointerEvents: "none" }} />

            {/* Skin selector — right side */}
            <div
              style={{
                position: "absolute", top: "24px", right: "24px", zIndex: 10,
                display: "flex", flexDirection: "column", gap: "8px",
              }}
              aria-label="Card style selector"
            >
              <p style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(240,232,213,0.5)", textAlign: "right", marginBottom: "4px" }}>
                Card Style
              </p>
              {Object.keys(CARD_SKINS).map((skinName) => {
                const s = CARD_SKINS[skinName];
                const isSelected = selectedSkin === skinName;
                return (
                  <button
                    key={skinName}
                    onClick={() => setSelectedSkin(skinName)}
                    aria-pressed={isSelected}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: isSelected ? 700 : 500,
                      border: `1px solid ${isSelected ? s.accent : "rgba(255,255,255,0.2)"}`,
                      background: isSelected ? s.accentBg : "rgba(255,255,255,0.05)",
                      color: isSelected ? s.accent : "rgba(240,232,213,0.65)",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.icon} {skinName}
                  </button>
                );
              })}
            </div>

            <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative" }}>
              <p style={{ color: `${skin.accent}bb`, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "12px" }}>
                Your Result
              </p>
              <h2
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  fontWeight: 700,
                  color: "#f0e8d5",
                  marginBottom: "8px",
                }}
              >
                {result.teamName || "Your Heavenly Team"}
              </h2>

              {/* Saint names */}
              <div style={{ marginBottom: "20px" }}>
                {(result.saints || []).map((saint) => (
                  <p key={saint.name} style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1.1rem", color: "rgba(240,232,213,0.8)", marginBottom: "4px" }}>
                    ✦ {saint.name}
                  </p>
                ))}
              </div>

              {/* All powers as tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "36px" }}>
                {(result.saints || []).flatMap((s) => s.powers || []).slice(0, 8).map((p, i) => (
                  <span key={i} style={{ background: skin.accentBg, border: `1px solid ${skin.accent}44`, color: skin.accent, fontSize: "11px", fontWeight: 600, padding: "5px 13px", borderRadius: "999px" }}>
                    {p}
                  </span>
                ))}
              </div>

              {/* Canvas saint card — clickable to enlarge */}
              <div
                style={{ position: "relative", display: "inline-block", marginBottom: "28px" }}
              >
                <div
                  className="card-side-arrow"
                  style={{ position: "absolute", left: "-52px", top: "50%", transform: "translateY(-50%)", flexDirection: "column", alignItems: "center", gap: "2px" }}
                  aria-hidden="true"
                >
                  <svg className="bounce-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(212,160,23,0.75)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  <svg className="bounce-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(212,160,23,0.38)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "0.18s" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {/* Clickable wrapper */}
                <button
                  aria-label="Click to enlarge saint card"
                  onClick={() => setShowModal(true)}
                  style={{
                    background: "none", border: "none", padding: 0, cursor: "zoom-in",
                    display: "block", position: "relative",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <PrayerCard ref={cardRef} data={result} />
                  {/* Zoom hint overlay */}
                  <div style={{
                    position: "absolute", bottom: "12px", right: "12px",
                    background: "rgba(0,0,0,0.55)", borderRadius: "8px",
                    padding: "4px 8px", fontSize: "10px",
                    color: "rgba(255,255,255,0.8)",
                    display: "flex", alignItems: "center", gap: "4px",
                    backdropFilter: "blur(4px)",
                  }} aria-hidden="true">
                    🔍 Click to enlarge
                  </div>
                </button>

                <div
                  className="card-side-arrow"
                  style={{ position: "absolute", right: "-52px", top: "50%", transform: "translateY(-50%)", flexDirection: "column", alignItems: "center", gap: "2px" }}
                  aria-hidden="true"
                >
                  <svg className="bounce-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(212,160,23,0.75)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  <svg className="bounce-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(212,160,23,0.38)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: "0.18s" }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>

              <div style={{ marginTop: "8px", marginBottom: "4px" }} aria-hidden="true">
                <p style={{ fontSize: "11px", color: "rgba(240,232,213,0.4)", letterSpacing: "0.08em", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                  Scroll down to see saint profiles and your novena prayer
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </p>
              </div>

              {/* Actions row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
                <ShareButton
                  canvasRef={cardRef}
                  title={result.teamName || "My Saint Match"}
                  shareText={`I found my patron saint${teamMode ? " team" : ""} on PraySaint!`}
                />
                <button
                  onClick={handleSave}
                  disabled={saved}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    fontSize: "0.82rem", fontWeight: 600,
                    padding: "0.55rem 1rem",
                    borderRadius: "10px",
                    cursor: saved ? "default" : "pointer",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    color: "rgba(240,232,213,0.9)",
                    opacity: saved ? 0.6 : 1,
                  }}
                >
                  {saved ? "✓ Saved" : "💾 Save"}
                </button>
                <button
                  onClick={() => setShowReflection(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    fontSize: "0.82rem", fontWeight: 600,
                    padding: "0.55rem 1rem",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background: "rgba(212,160,23,0.12)",
                    border: "1px solid rgba(212,160,23,0.28)",
                    color: "#f0c040",
                  }}
                >
                  🙏 Reflect
                </button>
                {/* Novena link */}
                <Link
                  href="/novenas"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "7px",
                    fontSize: "0.82rem", fontWeight: 600,
                    padding: "0.55rem 1rem",
                    borderRadius: "10px",
                    background: "rgba(240,192,64,0.14)",
                    border: "1px solid rgba(240,192,64,0.35)",
                    color: "#f0c040",
                    textDecoration: "none",
                  }}
                >
                  🕯 Pray the 9-Day Novena
                </Link>
              </div>
            </div>
          </section>

          {/* ── Section 2: Individual Saint Profiles ──────────── */}
          <section style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 24px" }}>
            <p style={{ color: "#d4a017", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: "10px" }}>
              Your {teamMode ? "Heavenly Team" : "Saint Match"}
            </p>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.8rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "32px" }}>
              Individual Saint Profiles
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {(result.saints || []).map((saint, i) => (
                <div
                  key={i}
                  className="animate-fade-slide-up"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-md)",
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div style={{ height: "3px", background: "linear-gradient(90deg, #d4a017, #f0c040 50%, transparent)" }} />
                  <div style={{ padding: "28px 32px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.35rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "4px" }}>
                          {saint.name}
                        </h3>
                        {saint.intercession && (
                          <p style={{ fontSize: "0.82rem", fontStyle: "italic", color: "#b8860b" }}>
                            {saint.intercession}
                          </p>
                        )}
                      </div>
                      {saint.feastDay && (
                        <div style={{ background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.25)", borderRadius: "999px", padding: "5px 13px", fontSize: "11px", fontWeight: 700, color: "#b8860b", whiteSpace: "nowrap" }}>
                          ✦ Feast: {saint.feastDay}
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: "0.95rem", lineHeight: 1.85, color: "var(--fg-secondary)", marginBottom: "20px" }}>
                      {saint.backstory}
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "8px" }}>
                      {saint.symbols?.length > 0 && (
                        <div>
                          <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--fg-muted)", marginBottom: "10px" }}>Symbols</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {saint.symbols.map((s, j) => <Tag key={j} accent="gold">{s}</Tag>)}
                          </div>
                        </div>
                      )}
                      {saint.powers?.length > 0 && (
                        <div>
                          <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--fg-muted)", marginBottom: "10px" }}>Virtues & Patronage</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {saint.powers.map((p, j) => <Tag key={j} accent="navy">{p}</Tag>)}
                          </div>
                        </div>
                      )}
                    </div>
                    <SaintTimeline events={saint.timeline || []} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Novena Prayer ──────────────────────────────────── */}
          {result.teamPrayer && (
            <section style={{ maxWidth: "900px", margin: "0 auto 64px", padding: "0 24px" }}>
              <div
                style={{
                  background: "linear-gradient(160deg, #060d22, #0a1530 55%, #0f2040)",
                  border: "1px solid rgba(212,160,23,0.2)",
                  borderRadius: "24px",
                  padding: "44px 40px",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
                  position: "relative",
                  overflow: "hidden",
                  textAlign: "center",
                }}
              >
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,160,23,0.1) 0%, transparent 60%)", pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                  <div className="cross-divider" style={{ justifyContent: "center", color: "rgba(212,160,23,0.7)", fontSize: "11px", letterSpacing: "0.18em" }}>
                    YOUR NOVENA PRAYER
                  </div>
                  <p
                    className="prayer-text"
                    style={{
                      fontSize: "1.05rem",
                      lineHeight: 2.1,
                      color: "rgba(240,232,213,0.88)",
                      maxWidth: "680px",
                      margin: "0 auto 24px",
                    }}
                  >
                    {result.teamPrayer}
                  </p>
                  <Link
                    href="/novenas"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      fontSize: "0.88rem", fontWeight: 700,
                      padding: "0.7rem 1.5rem",
                      borderRadius: "12px",
                      background: "rgba(212,160,23,0.15)",
                      border: "1px solid rgba(212,160,23,0.35)",
                      color: "#f0c040",
                      textDecoration: "none",
                      transition: "all 0.18s ease",
                    }}
                  >
                    🕯 Continue with a 9-Day Novena →
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* ── Section 3: What to Do Next ─────────────────────── */}
          <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.6rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "8px" }}>
              What to Do Next
            </h2>
            <p style={{ fontSize: "0.88rem", color: "var(--fg-muted)", marginBottom: "28px" }}>
              Continue deepening your prayer life with these suggested next steps.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              {[
                { icon: "📿", title: "Pray the Rosary with This Intention", desc: "Bring your prayer intention to Mary through the Rosary mysteries.", href: "/rosary", accent: "#6b9fd4", cta: "Open Rosary" },
                { icon: "🕯", title: "Pray the 9-Day Novena to This Saint", desc: "Begin a 9-day guided novena with daily prayers, reflections, and Scripture.", href: "/novenas", accent: "#d4a017", cta: "Start Novena" },
                { icon: "💾", title: "Save This Team", desc: "Save your saint match to your local library for future reference.", action: handleSave, accent: "#7cc47f", cta: saved ? "✓ Saved!" : "Save Now" },
                { icon: "🔗", title: "Share with a Friend", desc: "Share this page or your prayer card with someone who might need it.", href: "#share", accent: "#c084fc", cta: "Share" },
              ].map(({ icon, title, desc, href, action, accent, cta }) => (
                <div
                  key={title}
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "22px 20px",
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = `${accent}44`; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                  onClick={() => { if (action) action(); else if (href && href !== "#share") window.location.href = href; }}
                >
                  <div style={{ fontSize: "1.4rem", marginBottom: "10px" }}>{icon}</div>
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1rem", fontWeight: 700, color: "var(--fg-primary)", marginBottom: "6px" }}>{title}</h3>
                  <p style={{ fontSize: "0.8rem", lineHeight: 1.65, color: "var(--fg-muted)", marginBottom: "12px" }}>{desc}</p>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: accent }}>
                    {cta} →
                  </span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "0.75rem", fontStyle: "italic", textAlign: "center", color: "var(--fg-muted)", marginTop: "28px", lineHeight: 1.7 }}>
              Not official Church teaching. Presented for personal devotion. Consult a priest for formal spiritual guidance (CCC 2690).
            </p>
          </section>

          {/* Reset button */}
          <div style={{ textAlign: "center", paddingBottom: "48px" }}>
            <button
              onClick={() => { setResult(null); setError(""); setSaved(false); }}
              style={{
                fontSize: "0.85rem", fontWeight: 600,
                padding: "10px 22px",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                color: "var(--fg-secondary)",
                cursor: "pointer",
              }}
            >
              ← Start Over
            </button>
          </div>
        </div>
      )}

      {/* ── Enlarged Card Modal ───────────────────────────────────── */}
      {showModal && result && (
        <CardModal onClose={() => setShowModal(false)} data={result} />
      )}

      {showReflection && result && (
        <ReflectionPrompt
          question={result.reflection || "How does this saint model Christ's love in your life right now?"}
          cccRef="CCC 956 — The saints in heaven intercede for us."
          onClose={() => setShowReflection(false)}
        />
      )}
    </div>
  );
}
