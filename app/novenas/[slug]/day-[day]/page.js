"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { use } from "react";
import { getNovenaBySlug } from "@/lib/novenasData";

/* ─── localStorage helpers ──────────────────────────────────────── */
function getSession(slug) {
  try {
    const raw = localStorage.getItem(`novena_session_${slug}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSession(slug, updates) {
  try {
    const current = getSession(slug) || {};
    const merged = { ...current, ...updates, lastVisited: new Date().toISOString() };
    localStorage.setItem(`novena_session_${slug}`, JSON.stringify(merged));
    return merged;
  } catch { return null; }
}

/* ─── Mini confetti burst ────────────────────────────────────────── */
function ConfettiBurst({ active }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#d4a017", "#f0c040", "#c084fc", "#60a5fa", "#34d399", "#f87171"];
    particlesRef.current = Array.from({ length: 120 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2 - 50,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 14 - 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      life: 1,
      decay: 0.012 + Math.random() * 0.008,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.rotationSpeed;
        p.life -= p.decay;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      });
      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    draw();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}
    />
  );
}

/* ─── Nine candles progress indicator ───────────────────────────── */
function CandleRow({ novena, currentDay, completedDays, slug }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "36px" }}>
      {Array.from({ length: 9 }, (_, i) => {
        const day = i + 1;
        const isDone = completedDays.includes(day);
        const isCurrent = day === currentDay;
        return (
          <Link
            key={day}
            href={`/novenas/${slug}/day-${day}`}
            style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
            title={`Day ${day}`}
          >
            <div
              style={{
                width: "36px",
                height: "52px",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              {/* Flame */}
              {(isDone || isCurrent) && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    width: "10px",
                    height: "16px",
                    background: isDone
                      ? `radial-gradient(ellipse at 50% 80%, ${novena.color}, #f0c040 50%, transparent)`
                      : `radial-gradient(ellipse at 50% 80%, #f0c040, #ff8c00 50%, transparent)`,
                    borderRadius: "50% 50% 20% 20%",
                    animation: "candleFlicker 1.8s ease-in-out infinite",
                    filter: isDone
                      ? `drop-shadow(0 0 6px ${novena.color}aa)`
                      : "drop-shadow(0 0 6px #f0c040aa)",
                    opacity: isDone ? 0.8 : 1,
                  }}
                />
              )}
              {/* Candle body */}
              <div
                style={{
                  width: "12px",
                  height: "32px",
                  borderRadius: "3px 3px 2px 2px",
                  background: isDone
                    ? `linear-gradient(180deg, ${novena.color}dd, ${novena.color}88)`
                    : isCurrent
                    ? "linear-gradient(180deg, #f0e8d5, #c8bfa8)"
                    : "linear-gradient(180deg, rgba(240,232,213,0.25), rgba(200,191,168,0.15))",
                  border: isCurrent
                    ? `1.5px solid ${novena.color}`
                    : isDone
                    ? `1.5px solid ${novena.color}66`
                    : "1.5px solid rgba(240,232,213,0.2)",
                  boxShadow: isCurrent
                    ? `0 0 12px ${novena.color}55`
                    : isDone
                    ? `0 0 8px ${novena.color}33`
                    : "none",
                }}
              />
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: isCurrent ? 700 : 500,
                color: isDone ? novena.color : isCurrent ? "#f0e8d5" : "rgba(240,232,213,0.35)",
              }}
            >
              {isDone ? "✓" : day}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function NovenaDay({ params }) {
  const resolvedParams = use(params);
  const { slug, day: dayParam } = resolvedParams;
  const dayNum = parseInt(dayParam, 10);

  const novena = getNovenaBySlug(slug);
  const dayData = novena?.days?.find(d => d.day === dayNum);

  const [session, setSession] = useState(null);
  const [intention, setIntention] = useState("");
  const [noteText, setNoteText] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [marked, setMarked] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompleteMsg, setShowCompleteMsg] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const s = getSession(slug);
    setSession(s);
    if (s?.intention) setIntention(s.intention);
    // Load per-day note
    try {
      const notes = JSON.parse(localStorage.getItem(`novena_notes_${slug}`) || "{}");
      setNoteText(notes[dayNum] || "");
    } catch {}
    // Check if already marked
    if (s?.completedDays?.includes(dayNum)) {
      setMarked(true);
    }
  }, [slug, dayNum]);

  if (!novena || !dayData) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <p style={{ color: "var(--fg-muted)", fontSize: "1.1rem" }}>Prayer not found.</p>
        <Link href="/novenas" style={{ color: "#d4a017" }}>← Back to Novenas</Link>
      </div>
    );
  }

  const completedDays = session?.completedDays ?? [];
  const progressPct = Math.round((completedDays.length / 9) * 100);
  const isLastDay = dayNum === 9;

  function saveNote(text) {
    try {
      const notes = JSON.parse(localStorage.getItem(`novena_notes_${slug}`) || "{}");
      notes[dayNum] = text;
      localStorage.setItem(`novena_notes_${slug}`, JSON.stringify(notes));
    } catch {}
  }

  function handleMarkComplete() {
    if (marked) return;
    const s = getSession(slug) || { slug, startDate: new Date().toISOString().slice(0, 10), completedDays: [], currentDay: dayNum };
    const newCompleted = s.completedDays.includes(dayNum)
      ? s.completedDays
      : [...s.completedDays, dayNum];
    const nextDay = Math.min(dayNum + 1, 9);
    const updated = saveSession(slug, {
      completedDays: newCompleted,
      currentDay: newCompleted.length < 9 ? nextDay : dayNum,
    });
    setSession(updated);
    setMarked(true);

    if (isLastDay) {
      setShowConfetti(true);
      setShowCompleteMsg(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }
  }

  const isCompleted = completedDays.length === 9;

  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)", minHeight: "100vh" }}>
      <ConfettiBurst active={showConfetti} />

      {/* ── Hero strip ──────────────────────────────────────────── */}
      <section
        style={{
          background: `linear-gradient(160deg, #060d22, #0a1530 50%, #0f2040)`,
          padding: "48px 24px 52px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 70% at 50% 0%, ${novena.color}14 0%, transparent 65%)`, pointerEvents: "none" }} />
        <div style={{ maxWidth: "700px", margin: "0 auto", position: "relative" }}>
          <Link
            href={`/novenas/${slug}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "rgba(240,232,213,0.5)", textDecoration: "none", marginBottom: "18px" }}
          >
            ← {novena.name}
          </Link>

          <p style={{ color: `${novena.color}cc`, fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "8px" }}>
            {novena.name} · 9-Day Novena
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontFamily: "Playfair Display, serif", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 700, color: "#f0e8d5" }}>
              Day {dayNum} of 9
            </span>
          </div>

          <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "1rem", color: `${novena.color}cc` }}>
            {dayData.title}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 24px 80px" }}>

        {/* ── Candles ─────────────────────────────────────────────── */}
        {hydrated && (
          <CandleRow
            novena={novena}
            currentDay={dayNum}
            completedDays={completedDays}
            slug={slug}
          />
        )}

        {/* ── Novena Complete Banner ───────────────────────────────── */}
        {isCompleted && showCompleteMsg && (
          <div
            style={{
              background: `linear-gradient(135deg, ${novena.color}22, ${novena.color}0d)`,
              border: `1px solid ${novena.color}55`,
              borderRadius: "20px",
              padding: "24px",
              textAlign: "center",
              marginBottom: "28px",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🙏</div>
            <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "#f0e8d5", marginBottom: "8px" }}>
              Novena Complete
            </h2>
            <p style={{ fontSize: "0.9rem", color: "rgba(240,232,213,0.75)", lineHeight: 1.7, marginBottom: "16px" }}>
              You have completed all nine days of the {novena.name} Novena. May God grant the grace you sought.
            </p>
            <Link
              href="/novenas"
              style={{
                display: "inline-block",
                padding: "0.65rem 1.4rem",
                borderRadius: "12px",
                fontSize: "0.87rem",
                fontWeight: 700,
                background: `linear-gradient(135deg, ${novena.color}, ${novena.color}bb)`,
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Browse More Novenas →
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "32px", alignItems: "start" }}>

          {/* ── Left: Prayer & Reflection ─────────────────────── */}
          <div>

            {/* Prayer */}
            <div
              style={{
                background: "linear-gradient(155deg, #060d22, #0a1530)",
                border: "1px solid rgba(212,160,23,0.22)",
                borderRadius: "20px",
                padding: "28px",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "3px", height: "28px", borderRadius: "2px", background: `linear-gradient(180deg, ${novena.color}, ${novena.color}44)` }} />
                <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: `${novena.color}bb` }}>
                  Prayer
                </p>
              </div>
              <p
                className="prayer-text"
                style={{ fontSize: "0.93rem", lineHeight: 2.05, color: "rgba(240,232,213,0.88)", whiteSpace: "pre-line" }}
              >
                {dayData.prayerText.replace("[state your intention]", intention ? `"${intention}"` : "[your intention]")}
              </p>
            </div>

            {/* Scripture */}
            <div
              style={{
                background: `${novena.color}0a`,
                border: `1px solid ${novena.color}2a`,
                borderRadius: "16px",
                padding: "20px 22px",
                marginBottom: "24px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: `${novena.color}99`, marginBottom: "10px" }}>
                Scripture
              </p>
              <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "0.96rem", lineHeight: 1.75, color: "rgba(240,232,213,0.82)" }}>
                "{dayData.scripture.includes("—") ? dayData.scripture.split("—")[1].trim() : dayData.scripture}"
              </p>
              {dayData.scripture.includes("—") && (
                <p style={{ fontSize: "0.78rem", color: `${novena.color}bb`, marginTop: "8px", fontWeight: 600 }}>
                  — {dayData.scripture.split("—")[0].trim()}
                </p>
              )}
            </div>

            {/* Reflection */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "22px",
                marginBottom: "24px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--fg-muted)", marginBottom: "12px" }}>
                Reflection
              </p>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.85, color: "var(--fg-secondary)" }}>
                {dayData.reflection}
              </p>
            </div>

            {/* Mark Complete Button */}
            {!marked ? (
              <button
                onClick={handleMarkComplete}
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "16px",
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: `linear-gradient(135deg, ${novena.color}, ${novena.color}bb)`,
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: `0 8px 28px ${novena.color}44`,
                  transition: "all 0.2s ease",
                  marginBottom: "12px",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${novena.color}55`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 8px 28px ${novena.color}44`; }}
              >
                {isLastDay ? "🙏 Complete This Novena" : `✓ Mark Day ${dayNum} Complete`}
              </button>
            ) : (
              <div
                style={{
                  width: "100%",
                  padding: "1rem",
                  borderRadius: "16px",
                  fontWeight: 700,
                  fontSize: "0.97rem",
                  background: "rgba(212,160,23,0.1)",
                  border: "1px solid rgba(212,160,23,0.3)",
                  color: "#d4a017",
                  textAlign: "center",
                  marginBottom: "12px",
                }}
              >
                ✓ Day {dayNum} Complete
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              {dayNum > 1 ? (
                <Link
                  href={`/novenas/${slug}/day-${dayNum - 1}`}
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    color: "var(--fg-secondary)",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  ← Day {dayNum - 1}
                </Link>
              ) : <div style={{ flex: 1 }} />}

              {dayNum < 9 ? (
                <Link
                  href={`/novenas/${slug}/day-${dayNum + 1}`}
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    background: marked ? `${novena.color}14` : "var(--bg-surface)",
                    border: `1px solid ${marked ? novena.color + "44" : "var(--border)"}`,
                    color: marked ? novena.color : "var(--fg-secondary)",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Day {dayNum + 1} →
                </Link>
              ) : (
                <Link
                  href={`/novenas/${slug}`}
                  style={{
                    flex: 1,
                    padding: "0.7rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    color: "var(--fg-secondary)",
                    textAlign: "center",
                    textDecoration: "none",
                  }}
                >
                  Back to Overview
                </Link>
              )}
            </div>
          </div>

          {/* ── Right: Sidebar ───────────────────────────────── */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Progress card */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--fg-muted)", marginBottom: "14px" }}>
                Progress
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--fg-muted)", marginBottom: "6px" }}>
                <span>{hydrated ? completedDays.length : 0} of 9 days complete</span>
                <span style={{ color: novena.color }}>{hydrated ? progressPct : 0}%</span>
              </div>
              <div style={{ height: "7px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: hydrated ? `${progressPct}%` : "0%",
                    background: `linear-gradient(90deg, ${novena.color}, #f0c040)`,
                    borderRadius: "999px",
                    transition: "width 0.4s ease",
                    boxShadow: `0 0 8px ${novena.color}66`,
                  }}
                />
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--fg-muted)", marginTop: "10px" }}>
                Day {dayNum} of 9 · {novena.name}
              </p>
            </div>

            {/* Intention card */}
            <div
              style={{
                background: `${novena.color}0d`,
                border: `1px solid ${novena.color}2a`,
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: `${novena.color}99`, marginBottom: "10px" }}>
                My Intention
              </p>
              {hydrated && intention ? (
                <p style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontSize: "0.88rem", lineHeight: 1.75, color: "rgba(240,232,213,0.8)" }}>
                  "{intention}"
                </p>
              ) : (
                <p style={{ fontSize: "0.82rem", color: "var(--fg-muted)", lineHeight: 1.6 }}>
                  No intention set. You can add one on the{" "}
                  <Link href={`/novenas/${slug}`} style={{ color: novena.color }}>novena page</Link>.
                </p>
              )}
            </div>

            {/* Daily note */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "20px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--fg-muted)", marginBottom: "10px" }}>
                My Note for Today
              </p>
              <textarea
                value={noteText}
                onChange={(e) => {
                  setNoteText(e.target.value);
                  saveNote(e.target.value);
                }}
                placeholder="What moved you in today's prayer? Write a brief reflection or petition…"
                rows={4}
                className="input-sacred resize-none"
                style={{ fontSize: "0.84rem", lineHeight: 1.65 }}
              />
            </div>

            {/* All days quick nav */}
            <div
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "18px 16px",
              }}
            >
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--fg-muted)", marginBottom: "12px" }}>
                Jump to Day
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {Array.from({ length: 9 }, (_, i) => {
                  const d = i + 1;
                  const isDone = completedDays.includes(d);
                  const isCur = d === dayNum;
                  return (
                    <Link
                      key={d}
                      href={`/novenas/${slug}/day-${d}`}
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        textDecoration: "none",
                        background: isCur
                          ? `linear-gradient(135deg, ${novena.color}, ${novena.color}bb)`
                          : isDone
                          ? `${novena.color}1a`
                          : "var(--bg-elevated)",
                        border: isCur
                          ? "none"
                          : isDone
                          ? `1px solid ${novena.color}44`
                          : "1px solid var(--border)",
                        color: isCur ? "#fff" : isDone ? novena.color : "var(--fg-muted)",
                      }}
                    >
                      {isDone && !isCur ? "✓" : d}
                    </Link>
                  );
                })}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
