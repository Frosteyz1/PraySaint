"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ShareButton from "@/components/ShareButton";
import ReflectionPrompt from "@/components/ReflectionPrompt";

/* ─── Constants (LOGIC UNCHANGED) ────────────────────────────────── */
const BEADS_PER_DECADE = 12;
const TOTAL_BEADS      = 5 * BEADS_PER_DECADE;

/* ─── localStorage helpers (LOGIC UNCHANGED) ─────────────────────── */
function getStreak() {
  try {
    const raw = localStorage.getItem("patronforge_rosary_streak");
    if (!raw) return 0;
    const s = JSON.parse(raw);
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (s.lastDate === today || s.lastDate === yesterday) return s.count;
    return 0;
  } catch { return 0; }
}
function bumpStreak() {
  try {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const raw = localStorage.getItem("patronforge_rosary_streak");
    const s   = raw ? JSON.parse(raw) : { count: 0, lastDate: null };
    if (s.lastDate === today) return s.count;
    const newCount = s.lastDate === yesterday ? s.count + 1 : 1;
    localStorage.setItem("patronforge_rosary_streak", JSON.stringify({ count: newCount, lastDate: today }));
    return newCount;
  } catch { return 1; }
}

/* ─── Pearl bead drawing ─────────────────────────────────────────── */
function drawPearlBead(ctx, x, y, r, baseColor, highlightColor, darkColor) {
  const grad = ctx.createRadialGradient(
    x - r * 0.32, y - r * 0.32, r * 0.04,
    x, y, r
  );
  grad.addColorStop(0,    "rgba(255,255,255,0.88)");
  grad.addColorStop(0.2,  highlightColor);
  grad.addColorStop(0.55, baseColor);
  grad.addColorStop(1,    darkColor);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/* ─── HiDPI canvas setup ─────────────────────────────────────────── */
function setupHiDPI(canvas, dw, dh) {
  const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
  canvas.width  = dw * dpr;
  canvas.height = dh * dpr;
  canvas.style.width  = dw + "px";
  canvas.style.height = dh + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return ctx;
}

/* ─── Main rosary draw (VISUAL UPGRADE, LOGIC UNCHANGED) ─────────── */
function drawRosary(canvas, currentBead, totalBeads, mysterySet) {
  if (!canvas) return;

  const DW = 480, DH = 480;
  const ctx = setupHiDPI(canvas, DW, DH);
  const W = DW, H = DH;

  /* ── Background ── */
  const bg = ctx.createRadialGradient(W / 2, H / 2, 20, W / 2, H * 0.4, W * 0.62);
  bg.addColorStop(0,   "#0e1e40");
  bg.addColorStop(0.6, "#080e26");
  bg.addColorStop(1,   "#04091a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* ── Subtle divine glow at top ── */
  const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, W * 0.55);
  glow.addColorStop(0,   "rgba(212,160,23,0.10)");
  glow.addColorStop(1,   "rgba(212,160,23,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  /* ── Mystery set label ── */
  ctx.font      = "bold 13px 'Playfair Display', Georgia, serif";
  ctx.fillStyle = "rgba(212,160,23,0.75)";
  ctx.textAlign = "center";
  ctx.fillText(`${mysterySet} Mysteries`, W / 2, 24);

  const cx = W / 2;
  const cy = H / 2 + 8;
  const r  = W / 2 - 42;

  /* ── Chain (segmented gold) ── */
  for (let i = 0; i < totalBeads; i++) {
    const a1 = (i      / totalBeads) * Math.PI * 2 - Math.PI / 2;
    const a2 = ((i + 0.5) / totalBeads) * Math.PI * 2 - Math.PI / 2;
    const mx = cx + r * Math.cos(a2);
    const my = cy + r * Math.sin(a2);
    const bx = cx + r * Math.cos(a1);
    const by = cy + r * Math.sin(a1);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(mx, my);
    ctx.strokeStyle = i < currentBead
      ? "rgba(212,160,23,0.55)"
      : "rgba(212,160,23,0.2)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  /* ── Beads ── */
  for (let i = 0; i < totalBeads; i++) {
    const angle = (i / totalBeads) * Math.PI * 2 - Math.PI / 2;
    const bx    = cx + r * Math.cos(angle);
    const by    = cy + r * Math.sin(angle);

    const posInDecade = i % BEADS_PER_DECADE;
    const isOurFather = posInDecade === 0;
    const isGloryBe   = posInDecade === 11;
    const isActive    = i === currentBead;
    const isPast      = i < currentBead;

    const beadR = isOurFather ? 11 : 7;

    // Glow ring for active bead
    if (isActive) {
      for (let g = 3; g >= 1; g--) {
        ctx.beginPath();
        ctx.arc(bx, by, beadR + g * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,160,23,${0.06 / g})`;
        ctx.fill();
      }
      ctx.shadowBlur  = 24;
      ctx.shadowColor = "#d4a017";
    }

    if (isActive) {
      drawPearlBead(ctx, bx, by, beadR, "#f0c040", "#fef08a", "#b8860b");
    } else if (isPast) {
      drawPearlBead(ctx, bx, by, beadR, "#d4a017", "#f0c040", "#7a5008");
    } else if (isOurFather) {
      drawPearlBead(ctx, bx, by, beadR, "#3b6fa0", "#6ba0d4", "#1e3a7b");
    } else if (isGloryBe) {
      drawPearlBead(ctx, bx, by, beadR, "#2d5080", "#4a7ab8", "#152d63");
    } else {
      drawPearlBead(ctx, bx, by, beadR, "#1c3f7a", "#3b5aa3", "#0f2040");
    }

    ctx.shadowBlur = 0;

    // Decade number on Our Father beads
    if (isOurFather) {
      ctx.font      = "bold 7px Arial";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.textAlign = "center";
      const decade = Math.floor(i / BEADS_PER_DECADE) + 1;
      ctx.fillText(decade, bx, by + 2.5);
    }
  }

  /* ── Center medallion cross ── */
  const crossColor  = "#d4a017";
  const crossSize   = 20;
  ctx.save();
  ctx.shadowBlur  = 12;
  ctx.shadowColor = "rgba(212,160,23,0.45)";
  ctx.strokeStyle = crossColor;
  ctx.lineWidth   = 4;
  ctx.lineCap     = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - crossSize);
  ctx.lineTo(cx, cy + crossSize);
  ctx.moveTo(cx - crossSize * 0.62, cy - crossSize * 0.26);
  ctx.lineTo(cx + crossSize * 0.62, cy - crossSize * 0.26);
  ctx.stroke();
  /* Small decorative circles at arm ends */
  [[cx, cy - crossSize], [cx, cy + crossSize], [cx - crossSize * 0.62, cy - crossSize * 0.26], [cx + crossSize * 0.62, cy - crossSize * 0.26]].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = crossColor;
    ctx.fill();
  });
  ctx.restore();

  /* ── Progress ── */
  ctx.font      = "11px Arial, sans-serif";
  ctx.fillStyle = "rgba(240,232,213,0.5)";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.min(currentBead + 1, totalBeads)} / ${totalBeads}`, cx, H - 10);
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function RosaryPage() {
  /* ── State (LOGIC UNCHANGED) ── */
  const [mood,          setMood]          = useState("");
  const [mysteryPref,   setMysteryPref]   = useState("");
  const [loading,       setLoading]       = useState(false);
  const [rosaryData,    setRosaryData]    = useState(null);
  const [error,         setError]         = useState("");
  const [currentBead,   setCurrentBead]   = useState(0);
  const [complete,      setComplete]      = useState(false);
  const [showReflection,setShowReflection]= useState(false);
  const [streak,        setStreak]        = useState(0);

  const canvasRef = useRef(null);
  const shareRef  = useRef(null);

  useEffect(() => { setStreak(getStreak()); }, []);

  useEffect(() => {
    if (rosaryData) drawRosary(canvasRef.current, currentBead, TOTAL_BEADS, rosaryData.mysterySet || "Joyful");
  }, [currentBead, rosaryData]);

  /* ── Handlers (LOGIC UNCHANGED) ── */
  const handleGenerate = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setRosaryData(null); setCurrentBead(0); setComplete(false);
    try {
      const res  = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rosary", mood, mysteryPreference: mysteryPref }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setRosaryData(json.data);
    } catch (err) { setError(err.message || "Something went wrong."); }
    finally        { setLoading(false); }
  }, [mood, mysteryPref]);

  function advanceBead() {
    if (currentBead < TOTAL_BEADS - 1) {
      setCurrentBead((b) => b + 1);
    } else {
      setComplete(true);
      setStreak(bumpStreak());
    }
  }

  function handleKeyDown(e) {
    if (["Enter", " ", "ArrowRight"].includes(e.key)) { e.preventDefault(); advanceBead(); }
  }

  const decadeIndex   = Math.floor(currentBead / BEADS_PER_DECADE);
  const posInDecade   = currentBead % BEADS_PER_DECADE;
  const currentMystery= rosaryData?.mysteries?.[decadeIndex];
  const beadType      = posInDecade === 0 ? "Our Father" : posInDecade === 11 ? "Glory Be" : `Hail Mary ${posInDecade}`;

  /* ── Progress bar percentage ── */
  const progress = Math.round((currentBead / TOTAL_BEADS) * 100);

  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)", minHeight: "100vh" }}>

      {/* Hero */}
      <section className="page-hero px-6 py-14 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(212,160,23,0.7)" }}>
          CCC 2708 · Contemplative Prayer
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-3"
          style={{ fontFamily: "Playfair Display, serif", color: "#f0e8d5" }}
        >
          📿 Virtual Rosary
        </h1>
        <p className="prayer-text text-base max-w-lg mx-auto" style={{ color: "rgba(240,232,213,0.68)" }}>
          Pray the Rosary with AI-suggested intentions and Vatican-inspired mystery meditations.
        </p>
        {streak > 0 && (
          <div
            className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.25)", color: "#f0c040" }}
          >
            🔥 {streak}-day streak!
          </div>
        )}
      </section>

      <div className="max-w-2xl mx-auto px-5 py-10">

        {/* Setup form */}
        {!rosaryData && !loading && (
          <form
            onSubmit={handleGenerate}
            aria-label="Rosary setup form"
            className="animate-fade-slide-up rounded-2xl p-7 mb-8"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
              borderTop: "3px solid #6b9fd4",
            }}
          >
            <h2 className="font-bold text-lg mb-5" style={{ fontFamily: "Playfair Display, serif", color: "var(--fg-primary)" }}>
              Prepare Your Heart
            </h2>

            <div className="mb-5">
              <label htmlFor="mood" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--fg-secondary)" }}>
                Your Mood or Intention Today
              </label>
              <input
                id="mood"
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g., seeking peace, praying for a sick family member…"
                className="input-sacred"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="mystery" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--fg-secondary)" }}>
                Mystery Set <span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>(AI will choose if blank)</span>
              </label>
              <select
                id="mystery"
                value={mysteryPref}
                onChange={(e) => setMysteryPref(e.target.value)}
                className="input-sacred"
              >
                <option value="">Let AI Choose</option>
                <option value="Joyful">Joyful Mysteries (Mon, Sat)</option>
                <option value="Sorrowful">Sorrowful Mysteries (Tue, Fri)</option>
                <option value="Glorious">Glorious Mysteries (Wed, Sun)</option>
                <option value="Luminous">Luminous Mysteries (Thu)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full font-bold py-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-gold-300"
              style={{
                background: "linear-gradient(135deg, #1e3a7b, #152d63)",
                color: "rgba(240,232,213,0.9)",
                border: "1px solid rgba(212,160,23,0.2)",
              }}
            >
              📿 Begin the Rosary
            </button>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16" aria-live="polite">
            <div className="inline-block w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
            <p className="prayer-text" style={{ color: "var(--fg-muted)" }}>Preparing your Rosary…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl p-4 mb-6 text-sm" role="alert"
            style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626" }}>
            ⚠ {error}
          </div>
        )}

        {/* Rosary interface */}
        {rosaryData && !loading && (
          <div className="space-y-6 animate-fade-slide-up" aria-live="polite">

            {/* Today's intention */}
            {rosaryData.intention && (
              <div
                className="rounded-xl p-5"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid #d4a017",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#b8860b" }}>
                  ✦ Today's Intention
                </p>
                <p className="prayer-text text-sm" style={{ color: "var(--fg-secondary)" }}>
                  {rosaryData.intention}
                </p>
              </div>
            )}

            {/* Canvas rosary */}
            {!complete && (
              <div ref={shareRef} className="text-center">
                <canvas
                  ref={canvasRef}
                  width={480}
                  height={480}
                  className="mx-auto cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    borderRadius: "50%",
                    boxShadow: "0 0 0 2px rgba(212,160,23,0.3), 0 24px 60px rgba(0,0,0,0.5)",
                    maxWidth: "min(480px, 100%)",
                  }}
                  onClick={advanceBead}
                  onKeyDown={handleKeyDown}
                  tabIndex={0}
                  role="button"
                  aria-label={`Rosary bead ${currentBead + 1} of ${TOTAL_BEADS}. ${beadType}. Click or press Enter to advance.`}
                />
                <p className="text-xs mt-2" style={{ color: "var(--fg-muted)" }}>
                  Tap the rosary or press <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>Enter</kbd> / <kbd className="px-1 py-0.5 rounded text-xs" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>→</kbd> to advance
                </p>

                {/* Progress bar */}
                <div className="mt-4 rounded-full overflow-hidden" style={{ height: "4px", background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #d4a017, #f0c040)",
                    }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Rosary progress: ${progress}%`}
                  />
                </div>
              </div>
            )}

            {/* Current prayer label */}
            {!complete && (
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "linear-gradient(135deg, #080e26, #0f2040)",
                  border: "1px solid rgba(212,160,23,0.18)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                }}
              >
                <p
                  className="text-xl font-bold mb-1"
                  style={{ fontFamily: "Playfair Display, serif", color: "#f0c040" }}
                >
                  {beadType}
                </p>
                {currentMystery && (
                  <>
                    <p className="text-sm font-semibold mb-1" style={{ color: "rgba(200,212,240,0.85)" }}>
                      Mystery {decadeIndex + 1}: {currentMystery.name}
                    </p>
                    {currentMystery.scriptureRef && (
                      <p className="text-xs mb-3" style={{ color: "rgba(212,160,23,0.6)" }}>
                        {currentMystery.scriptureRef}
                      </p>
                    )}
                    {posInDecade === 0 && currentMystery.meditation && (
                      <p className="prayer-text text-sm leading-relaxed max-w-md mx-auto mb-3" style={{ color: "rgba(240,232,213,0.78)" }}>
                        {currentMystery.meditation}
                      </p>
                    )}
                    {posInDecade === 0 && currentMystery.fruit && (
                      <p className="text-xs mb-4" style={{ color: "rgba(212,160,23,0.7)" }}>
                        Virtue: {currentMystery.fruit}
                      </p>
                    )}
                  </>
                )}
                <button
                  onClick={advanceBead}
                  className="inline-flex items-center gap-2 font-bold text-sm px-6 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gold-300"
                  style={{
                    background: "linear-gradient(135deg, #d4a017, #b8860b)",
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(212,160,23,0.35)",
                  }}
                >
                  Next Bead →
                </button>
              </div>
            )}

            {/* Completion */}
            {complete && (
              <div
                className="rounded-2xl p-8 text-center animate-fade-slide-up"
                style={{
                  background: "linear-gradient(135deg, #080e26, #0f2040, #152d63)",
                  border: "2px solid rgba(212,160,23,0.35)",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
                }}
              >
                <div className="text-4xl mb-3" aria-hidden="true" style={{ filter: "drop-shadow(0 0 20px rgba(212,160,23,0.6))" }}>✝</div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif", color: "#f0c040" }}>
                  Rosary Complete
                </h2>
                <p className="prayer-text text-sm mb-2" style={{ color: "rgba(240,232,213,0.75)" }}>
                  Well done. You have prayed all five mysteries.
                </p>
                {streak > 0 && (
                  <p className="text-xs mb-5" style={{ color: "#f0c040" }}>🔥 {streak}-day streak!</p>
                )}
                {rosaryData.closingPrayer && (
                  <div
                    className="rounded-xl p-5 mb-6 text-left"
                    style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(212,160,23,0.15)" }}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(212,160,23,0.7)" }}>
                      Closing Prayer
                    </p>
                    <p className="prayer-text text-sm" style={{ color: "rgba(240,232,213,0.85)" }}>
                      {rosaryData.closingPrayer}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 justify-center">
                  <ShareButton
                    canvasRef={shareRef}
                    title="I prayed the Rosary on PatronForge!"
                    shareText="Just completed the Rosary with PatronForge 📿"
                  />
                  <button
                    onClick={() => setShowReflection(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl"
                    style={{ background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.25)", color: "#f0c040" }}
                  >
                    🙏 Reflect
                  </button>
                  <button
                    onClick={() => { setRosaryData(null); setCurrentBead(0); setComplete(false); setMood(""); }}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(240,232,213,0.8)" }}
                  >
                    ↺ Pray Again
                  </button>
                </div>
                <div
                  className="mt-5 rounded-xl p-3 text-xs"
                  style={{ background: "rgba(212,160,23,0.07)", border: "1px dashed rgba(212,160,23,0.3)", color: "rgba(212,160,23,0.8)" }}
                >
                  ✨ <strong>Premium (coming soon):</strong> Audio guide with music and spoken prayers
                </div>
              </div>
            )}

            {/* Mystery accordion */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--fg-muted)" }}>
                {rosaryData.mysterySet} Mysteries
              </p>
              <div className="space-y-2">
                {(rosaryData.mysteries || []).map((m, i) => {
                  const isActive = i === decadeIndex && !complete;
                  return (
                    <div
                      key={i}
                      className="rounded-xl p-4 transition-all"
                      style={{
                        background: isActive ? "linear-gradient(135deg, #080e26, #0f2040)" : "var(--bg-surface)",
                        border: isActive ? "1px solid rgba(212,160,23,0.35)" : "1px solid var(--border)",
                        boxShadow: isActive ? "0 8px 24px rgba(0,0,0,0.25)" : "var(--shadow-sm)",
                      }}
                    >
                      <p
                        className="text-sm font-semibold"
                        style={{
                          fontFamily: "Playfair Display, serif",
                          color: isActive ? "#f0c040" : "var(--fg-primary)",
                        }}
                      >
                        {i + 1}. {m.name}
                        {m.scriptureRef && (
                          <span className="ml-2 text-xs font-normal" style={{ color: "var(--fg-muted)" }}>
                            ({m.scriptureRef})
                          </span>
                        )}
                      </p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: isActive ? "rgba(200,212,240,0.75)" : "var(--fg-muted)" }}>
                        {m.meditation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {showReflection && rosaryData && (
        <ReflectionPrompt
          question={rosaryData.reflection || "How did this Rosary draw you closer to Mary and Jesus?"}
          cccRef="CCC 2708 — Meditative prayer seeks to understand the why and how of Christian life."
          onClose={() => setShowReflection(false)}
        />
      )}
    </div>
  );
}
