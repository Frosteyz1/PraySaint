"use client";
import { useState, useRef, useCallback } from "react";
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

/* ─── UI sub-components ──────────────────────────────────────────── */
function Tag({ children, accent = "gold" }) {
  const styles = {
    gold:  { bg: "rgba(212,160,23,0.1)",  border: "rgba(212,160,23,0.3)",  color: "#b8860b" },
    navy:  { bg: "rgba(59,90,163,0.08)",  border: "rgba(59,90,163,0.2)",   color: "#3b5aa3" },
    cream: { bg: "var(--bg-elevated)",     border: "var(--border)",          color: "var(--fg-secondary)" },
  };
  const s = styles[accent] || styles.cream;
  return (
    <span
      className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--fg-muted)" }}>
      {children}
    </p>
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

  /* ── Render ── */
  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)", minHeight: "100vh" }}>

      {/* Hero */}
      <section className="page-hero px-6 py-14 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(212,160,23,0.7)" }}>
          CCC 956 · Saints as Intercessors
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-3"
          style={{ fontFamily: "Playfair Display, serif", color: "#f0e8d5", textShadow: "0 2px 30px rgba(212,160,23,0.15)" }}
        >
          ⚔ Saint Ally Builder
        </h1>
        <p className="prayer-text text-base max-w-lg mx-auto" style={{ color: "rgba(240,232,213,0.68)" }}>
          Share your challenge and we'll match you with real patron saints who intercede and model the virtues you need.
        </p>
        {streak > 0 && (
          <div
            className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.25)", color: "#f0c040" }}
          >
            🔥 {streak}-day streak — Keep forging!
          </div>
        )}
      </section>

      <div className="max-w-2xl mx-auto px-5 py-10">

        {/* ── Form card ── */}
        <form
          onSubmit={handleSubmit}
          aria-label="Saint Ally Builder form"
          className="animate-fade-slide-up rounded-2xl p-7 mb-8"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            borderTop: "3px solid #d4a017",
          }}
        >
          <h2 className="font-bold text-lg mb-5" style={{ fontFamily: "Playfair Display, serif", color: "var(--fg-primary)" }}>
            Tell Us Your Situation
          </h2>

          {/* Challenge */}
          <div className="mb-5">
            <label htmlFor="challenge" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--fg-secondary)" }}>
              Life Challenge or Prayer Intention *
            </label>
            <textarea
              id="challenge"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="e.g., I'm struggling with anxiety about a career change and need courage to trust in God's plan…"
              rows={3}
              required
              aria-required="true"
              className="input-sacred resize-none"
            />
          </div>

          {/* Personality */}
          <div className="mb-5">
            <label htmlFor="personality" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--fg-secondary)" }}>
              Your Personality or Background <span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="personality"
              type="text"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="e.g., introverted artist, busy parent, military veteran…"
              className="input-sacred"
            />
          </div>

          {/* Team toggle */}
          <div
            className="flex items-start gap-4 mb-6 p-4 rounded-xl cursor-pointer select-none"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
            onClick={() => setTeamMode((t) => !t)}
          >
            {/* Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={teamMode}
              className="relative flex-shrink-0 mt-0.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
              style={{
                width: "44px", height: "24px",
                background: teamMode ? "linear-gradient(135deg, #d4a017, #b8860b)" : "var(--border)",
                boxShadow: teamMode ? "0 2px 10px rgba(212,160,23,0.35)" : "none",
              }}
              onClick={(e) => { e.stopPropagation(); setTeamMode((t) => !t); }}
            >
              <span
                className="absolute rounded-full bg-white shadow transition-transform"
                style={{
                  top: "3px", width: "18px", height: "18px",
                  transform: teamMode ? "translateX(22px)" : "translateX(3px)",
                }}
              />
            </button>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--fg-primary)" }}>Team Mode</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
                Match 2–3 saints as a heavenly team of intercessors — a common Catholic devotion (CCC 956)
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !challenge.trim()}
            className="w-full font-bold py-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-gold-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading || !challenge.trim()
                ? "var(--border)"
                : "linear-gradient(135deg, #d4a017, #b8860b)",
              color: loading || !challenge.trim() ? "var(--fg-muted)" : "#fff",
              boxShadow: loading || !challenge.trim() ? "none" : "0 6px 20px rgba(212,160,23,0.35)",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Forging your saints…
              </span>
            ) : "✝ Forge My Saint Ally"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl p-4 mb-6 text-sm animate-fade-in"
            role="alert"
            style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626" }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div className="space-y-4 mb-6" aria-live="polite" aria-busy="true" aria-label="Loading saint profiles">
            <div className="shimmer h-64 rounded-2xl" />
            <div className="shimmer h-32 rounded-2xl" />
            <div className="shimmer h-32 rounded-2xl" />
          </div>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <div className="space-y-6 animate-fade-slide-up" aria-live="polite">

            {/* Canvas holy card */}
            <div>
              <SectionLabel>Your Saint Card</SectionLabel>
              <PrayerCard ref={cardRef} data={result} />
            </div>

            {/* Individual saint profiles */}
            <div className="space-y-4">
              <SectionLabel>Your {teamMode ? "Heavenly Team" : "Saint Ally"}</SectionLabel>
              {(result.saints || []).map((saint, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 animate-fade-slide-up"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    borderLeft: "3px solid #d4a017",
                    animationDelay: `${i * 0.08}s`,
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <h3
                      className="text-base font-bold"
                      style={{ fontFamily: "Playfair Display, serif", color: "var(--fg-primary)" }}
                    >
                      {saint.name}
                    </h3>
                    {saint.feastDay && (
                      <Tag accent="gold">✦ Feast: {saint.feastDay}</Tag>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--fg-secondary)" }}>
                    {saint.backstory}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {saint.symbols?.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>Symbols</p>
                        <div className="flex flex-wrap gap-1.5">
                          {saint.symbols.map((s, j) => <Tag key={j} accent="gold">{s}</Tag>)}
                        </div>
                      </div>
                    )}
                    {saint.powers?.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1.5" style={{ color: "var(--fg-muted)" }}>Virtues & Patronage</p>
                        <div className="flex flex-wrap gap-1.5">
                          {saint.powers.map((p, j) => <Tag key={j} accent="navy">{p}</Tag>)}
                        </div>
                      </div>
                    )}
                  </div>
                  {saint.intercession && (
                    <p className="mt-3 text-xs prayer-text border-t pt-3" style={{ color: "var(--fg-muted)", borderColor: "var(--border)" }}>
                      {saint.intercession}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Novena prayer */}
            {result.teamPrayer && (
              <div
                className="rounded-2xl p-7"
                style={{
                  background: "linear-gradient(135deg, #080e26, #0f2040)",
                  border: "1px solid rgba(212,160,23,0.2)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
                }}
              >
                <div className="cross-divider text-gold-500 text-xs mb-4" aria-hidden="true">
                  YOUR NOVENA PRAYER
                </div>
                <p className="prayer-text text-sm leading-loose" style={{ color: "rgba(240,232,213,0.9)" }}>
                  {result.teamPrayer}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 items-center">
              <ShareButton
                canvasRef={cardRef}
                title={result.teamName || "My Saint Ally"}
                shareText={`I found my patron saint${teamMode ? " team" : ""} on PatronForge!`}
              />
              <button
                onClick={handleSave}
                disabled={saved}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:opacity-60"
                style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--fg-secondary)" }}
              >
                {saved ? "✓ Saved" : "💾 Save"}
              </button>
              <button
                onClick={() => setShowReflection(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
                style={{ background: "rgba(212,160,23,0.1)", border: "1px solid rgba(212,160,23,0.25)", color: "#b8860b" }}
              >
                🙏 Level Up — Reflect
              </button>
            </div>

            {/* Premium stub */}
            <div
              className="rounded-xl p-4 text-center text-sm"
              style={{ background: "var(--bg-elevated)", border: "1px dashed rgba(212,160,23,0.4)", color: "var(--fg-muted)" }}
            >
              ✨ <strong style={{ color: "#b8860b" }}>Premium (coming soon):</strong> Unlock Custom Audio Prayer &amp; Saint Meditation Sessions
            </div>

            <p className="text-xs prayer-text text-center" style={{ color: "var(--fg-muted)" }}>
              Not official Church teaching. Presented for personal devotion. Consult a priest for formal spiritual guidance.
            </p>
          </div>
        )}
      </div>

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
