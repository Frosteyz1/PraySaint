"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ShareButton from "@/components/ShareButton";
import ReflectionPrompt from "@/components/ReflectionPrompt";

/* ─── BG palette (LOGIC UNCHANGED) ──────────────────────────────── */
const BG_COLORS = {
  navy:   { fill: "#0b1a38", text: "#fef9c3", accent: "#d4a017" },
  gold:   { fill: "#7a5008", text: "#fefce8", accent: "#fde047" },
  cream:  { fill: "#fffef5", text: "#0b1a38", accent: "#d4a017" },
  purple: { fill: "#2d1b69", text: "#fef9c3", accent: "#e9d5ff" },
  green:  { fill: "#14532d", text: "#fefce8", accent: "#86efac" },
};

/* ─── Canvas helpers (LOGIC UNCHANGED) ──────────────────────────── */
function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(" ");
  const lines = []; let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawMeme(canvas, data) {
  if (!canvas || !data) return;
  const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
  const DW = 600, DH = 380;
  canvas.width  = DW * dpr; canvas.height = DH * dpr;
  canvas.style.width = DW + "px"; canvas.style.height = DH + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  const W = DW, H = DH;

  const palette = BG_COLORS[data.bgColor] || BG_COLORS.navy;

  /* Background gradient */
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, palette.fill);
  bg.addColorStop(1, `${palette.fill}cc`);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  /* Subtle radial glow */
  const glow = ctx.createRadialGradient(W / 2, H * 0.25, 0, W / 2, H * 0.25, W * 0.55);
  glow.addColorStop(0, `${palette.accent}18`); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  /* Outer border */
  ctx.strokeStyle = palette.accent; ctx.lineWidth = 4;
  if (ctx.roundRect) ctx.roundRect(8, 8, W - 16, H - 16, 12);
  else ctx.rect(8, 8, W - 16, H - 16);
  ctx.stroke();

  /* Inner thin border */
  ctx.strokeStyle = `${palette.accent}50`; ctx.lineWidth = 1;
  if (ctx.roundRect) ctx.roundRect(14, 14, W - 28, H - 28, 8);
  else ctx.rect(14, 14, W - 28, H - 28);
  ctx.stroke();

  /* Corner dots */
  [[22,22],[W-22,22],[22,H-22],[W-22,H-22]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2);
    ctx.fillStyle = palette.accent; ctx.fill();
  });

  /* Cross at top */
  ctx.strokeStyle = `${palette.accent}70`; ctx.lineWidth = 2; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(W/2,20); ctx.lineTo(W/2,36); ctx.moveTo(W/2-8,26); ctx.lineTo(W/2+8,26); ctx.stroke();

  const pad = 36, tW = W - pad*2;

  /* Top text */
  ctx.font = `bold 24px Impact, "Arial Black", sans-serif`;
  ctx.textAlign = "center"; ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
  wrapText(ctx, (data.topText||"").toUpperCase(), tW).forEach((line,i) => {
    ctx.strokeText(line, W/2, 60+i*30); ctx.fillText(line, W/2, 60+i*30);
  });

  /* Quote (middle) */
  if (data.quote) {
    const qY = H/2 - 8;
    ctx.font = `italic 14px "Playfair Display", Georgia, serif`;
    ctx.fillStyle = palette.accent; ctx.lineWidth = 0;
    const qLines = wrapText(ctx, `"${data.quote}"`, tW);
    qLines.forEach((line,i) => ctx.fillText(line, W/2, qY+i*20));
    if (data.source) {
      ctx.font = `12px Georgia, serif`;
      ctx.fillStyle = `${palette.text}99`;
      ctx.fillText(`— ${data.source}`, W/2, qY+qLines.length*20+6);
    }
  }

  /* Bottom text */
  ctx.font = `bold 24px Impact, "Arial Black", sans-serif`;
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#000"; ctx.lineWidth = 4;
  const bLines = wrapText(ctx, (data.bottomText||"").toUpperCase(), tW);
  const bStart = H - 22 - (bLines.length-1)*30;
  bLines.forEach((line,i) => {
    ctx.strokeText(line, W/2, bStart+i*30); ctx.fillText(line, W/2, bStart+i*30);
  });

  /* Watermark */
  ctx.font = "9px Arial"; ctx.fillStyle = `${palette.accent}55`; ctx.textAlign = "right";
  ctx.fillText("PatronForge", W-14, H-12);
}

/* ─── localStorage (LOGIC UNCHANGED) ────────────────────────────── */
function getLikes(id) {
  try { return JSON.parse(localStorage.getItem("patronforge_meme_likes")||"{}")[id]||0; } catch { return 0; }
}
function addLike(id) {
  try {
    const all = JSON.parse(localStorage.getItem("patronforge_meme_likes")||"{}");
    all[id] = (all[id]||0)+1;
    localStorage.setItem("patronforge_meme_likes", JSON.stringify(all));
    return all[id];
  } catch { return 1; }
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function MemesPage() {
  /* ── State (LOGIC UNCHANGED) ── */
  const [theme,          setTheme]          = useState("");
  const [quote,          setQuote]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [memeData,       setMemeData]       = useState(null);
  const [error,          setError]          = useState("");
  const [likes,          setLikes]          = useState(0);
  const [liked,          setLiked]          = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const memeId   = useRef(`meme_${Date.now()}`);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (memeData) {
      drawMeme(canvasRef.current, memeData);
      setLikes(getLikes(memeId.current));
      setLiked(false);
    }
  }, [memeData]);

  /* ── Handlers (LOGIC UNCHANGED) ── */
  const handleGenerate = useCallback(async (e) => {
    e.preventDefault();
    if (!theme.trim()) return;
    setLoading(true); setError(""); setMemeData(null);
    memeId.current = `meme_${Date.now()}`;
    try {
      const res  = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "memes", theme, quote }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setMemeData(json.data);
    } catch (err) { setError(err.message || "Something went wrong."); }
    finally        { setLoading(false); }
  }, [theme, quote]);

  function handleLike() {
    if (liked) return;
    setLikes(addLike(memeId.current));
    setLiked(true);
  }

  return (
    <div style={{ background: "var(--bg-page)", color: "var(--fg-primary)", minHeight: "100vh" }}>

      {/* Hero */}
      <section className="page-hero px-6 py-14 text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(212,160,23,0.7)" }}>
          CCC 1832 · Joy Is a Fruit of the Holy Spirit
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold mb-3"
          style={{ fontFamily: "Playfair Display, serif", color: "#f0e8d5" }}
        >
          😂 Catholic Meme Generator
        </h1>
        <p className="prayer-text text-base max-w-lg mx-auto" style={{ color: "rgba(240,232,213,0.68)" }}>
          Wholesome, uplifting faith memes drawn from Scripture and saint quotes — share the joy of the Gospel.
        </p>
      </section>

      {/* ── Two-column layout (desktop: form | preview) ── */}
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className={`gap-8 ${memeData ? "grid lg:grid-cols-[1fr_1.4fr]" : "max-w-xl mx-auto"}`}>

          {/* Left: Form */}
          <div>
            <form
              onSubmit={handleGenerate}
              aria-label="Catholic Meme Generator form"
              className="animate-fade-slide-up rounded-2xl p-7"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-lg)",
                borderTop: "3px solid #7cc47f",
                position: memeData ? "sticky" : "static",
                top: "80px",
              }}
            >
              <h2 className="font-bold text-lg mb-5" style={{ fontFamily: "Playfair Display, serif", color: "var(--fg-primary)" }}>
                Create Your Meme
              </h2>

              <div className="mb-5">
                <label htmlFor="theme" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--fg-secondary)" }}>
                  Theme or Topic *
                </label>
                <input
                  id="theme"
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g., Monday mornings, confession line, Advent waiting…"
                  required
                  aria-required="true"
                  className="input-sacred"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="quote" className="block text-sm font-semibold mb-1.5" style={{ color: "var(--fg-secondary)" }}>
                  Scripture or Saint Quote <span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="quote"
                  type="text"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="e.g., 'Be not afraid' — John Paul II…"
                  className="input-sacred"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !theme.trim()}
                className="w-full font-bold py-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-gold-300 disabled:opacity-50"
                style={{
                  background: loading || !theme.trim() ? "var(--border)" : "linear-gradient(135deg, #2d6a31, #14532d)",
                  color: "rgba(240,232,213,0.92)",
                  border: "1px solid rgba(124,196,127,0.25)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Forging in the Holy Spirit…
                  </span>
                ) : "✝ Generate Meme"}
              </button>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-xl p-3 text-sm" role="alert"
                  style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626" }}>
                  ⚠ {error}
                </div>
              )}
            </form>
          </div>

          {/* Right: Preview */}
          {(loading || memeData) && (
            <div className="animate-fade-slide-up space-y-5">

              {/* Canvas preview */}
              {loading && (
                <div className="shimmer rounded-2xl" style={{ height: "380px" }} aria-label="Loading meme" />
              )}

              {memeData && !loading && (
                <>
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={380}
                    className="w-full rounded-2xl"
                    style={{
                      boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,160,23,0.2)",
                    }}
                    aria-label={`Catholic meme: ${memeData.topText} — ${memeData.bottomText}`}
                    role="img"
                  />

                  {/* Text preview card */}
                  <div
                    className="rounded-xl p-4 text-sm space-y-1.5"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                  >
                    <p>
                      <span className="font-semibold" style={{ color: "var(--fg-muted)" }}>Top: </span>
                      <span style={{ color: "var(--fg-secondary)" }}>{memeData.topText}</span>
                    </p>
                    <p>
                      <span className="font-semibold" style={{ color: "var(--fg-muted)" }}>Bottom: </span>
                      <span style={{ color: "var(--fg-secondary)" }}>{memeData.bottomText}</span>
                    </p>
                    {memeData.quote && (
                      <p className="prayer-text text-xs" style={{ color: "var(--fg-muted)" }}>
                        "{memeData.quote}" — {memeData.source}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 items-center">
                    <ShareButton
                      canvasRef={canvasRef}
                      title="Catholic Meme from PatronForge"
                      shareText={`${memeData.topText} 😂 ${memeData.bottomText}`}
                      hashtag="PatronForge"
                    />
                    <button
                      onClick={handleLike}
                      disabled={liked}
                      aria-label={liked ? "Meme liked" : "Like this meme"}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gold-400 disabled:cursor-default"
                      style={{
                        background: liked ? "rgba(212,160,23,0.12)" : "var(--bg-elevated)",
                        border: liked ? "1px solid rgba(212,160,23,0.3)" : "1px solid var(--border)",
                        color: liked ? "#b8860b" : "var(--fg-secondary)",
                      }}
                    >
                      ❤ {liked ? "Liked!" : "Like"}{likes > 0 && ` (${likes})`}
                    </button>
                    <button
                      onClick={() => setShowReflection(true)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl"
                      style={{ background: "rgba(124,196,127,0.1)", border: "1px solid rgba(124,196,127,0.25)", color: "#2d6a31" }}
                    >
                      🙏 Reflect
                    </button>
                  </div>

                  {/* Make another */}
                  <button
                    onClick={() => { setMemeData(null); setTheme(""); setQuote(""); }}
                    className="w-full text-sm font-semibold py-2.5 rounded-xl transition-all"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--fg-secondary)" }}
                  >
                    ↺ Make Another Meme
                  </button>

                  {/* Premium stub */}
                  <div
                    className="rounded-xl p-3 text-xs text-center"
                    style={{ background: "var(--bg-elevated)", border: "1px dashed rgba(212,160,23,0.35)", color: "var(--fg-muted)" }}
                  >
                    ✨ <strong style={{ color: "#b8860b" }}>Premium (coming soon):</strong> Upload custom images &amp; build a meme gallery
                  </div>

                  <p className="text-xs prayer-text text-center" style={{ color: "var(--fg-muted)" }}>
                    All memes are for uplifting faith-sharing only. Not official Church content.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showReflection && memeData && (
        <ReflectionPrompt
          question={memeData.reflection || "How does this meme share God's love and joy with others?"}
          cccRef="CCC 1832 — Joy is a fruit of the Holy Spirit."
          onClose={() => setShowReflection(false)}
        />
      )}
    </div>
  );
}
