"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

/* ─── Helpers ────────────────────────────────────────────────────── */
function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* Sets canvas to physical pixel size for sharp HiDPI rendering.
   Returns the CSS display dimensions. */
function setupHiDPI(canvas, displayW, displayH) {
  const dpr = typeof window !== "undefined" ? (window.devicePixelRatio || 1) : 1;
  canvas.width  = displayW * dpr;
  canvas.height = displayH * dpr;
  canvas.style.width  = displayW + "px";
  canvas.style.height = displayH + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, W: displayW, H: displayH };
}

/* Draws an ornate rounded-rect border */
function drawRoundedRect(ctx, x, y, w, h, r, style) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (style === "stroke") ctx.stroke();
  else ctx.fill();
}

/* Draws an elegant proportional cross */
function drawCross(ctx, cx, cy, size, color, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx, cy + size);
  ctx.moveTo(cx - size * 0.62, cy - size * 0.26);
  ctx.lineTo(cx + size * 0.62, cy - size * 0.26);
  ctx.stroke();
  ctx.restore();
}

/* Subtle radial light rays from top-center */
function drawDivineRays(ctx, cx, W, H) {
  const rayCount = 14;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI + Math.PI / 2; // spread downward from top
    const len   = Math.max(W, H) * 1.2;
    const x2    = cx + Math.cos(angle) * len;
    const y2    = -30 + Math.sin(angle) * len;
    const grad  = ctx.createLinearGradient(cx, -30, x2, y2);
    grad.addColorStop(0,   "rgba(212,160,23,0.08)");
    grad.addColorStop(0.5, "rgba(212,160,23,0.03)");
    grad.addColorStop(1,   "rgba(212,160,23,0)");
    ctx.save();
    ctx.strokeStyle = grad;
    ctx.lineWidth   = W / rayCount * 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, -30);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
}

/* ─── Main draw function ─────────────────────────────────────────── */
function drawSaintCard(canvas, data) {
  if (!canvas || !data) return;

  // Display dimensions
  const displayW = 760;
  const displayH = 440;
  const { ctx, W, H } = setupHiDPI(canvas, displayW, displayH);

  /* ── Background ── */
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#080e26");
  bg.addColorStop(0.5, "#0f2040");
  bg.addColorStop(1,   "#152d63");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* ── Divine rays (subtle) ── */
  drawDivineRays(ctx, W / 2, W, H);

  /* ── Outer gold border ── */
  ctx.strokeStyle = "#d4a017";
  ctx.lineWidth   = 2.5;
  drawRoundedRect(ctx, 10, 10, W - 20, H - 20, 14, "stroke");

  /* ── Inner thin border ── */
  ctx.strokeStyle = "rgba(212,160,23,0.35)";
  ctx.lineWidth   = 1;
  drawRoundedRect(ctx, 18, 18, W - 36, H - 36, 10, "stroke");

  /* ── Corner cross ornaments ── */
  const co = "rgba(212,160,23,0.45)";
  drawCross(ctx, 32,     32,     8,  co);
  drawCross(ctx, W - 32, 32,     8,  co);
  drawCross(ctx, 32,     H - 32, 8,  co);
  drawCross(ctx, W - 32, H - 32, 8,  co);

  /* ── Central watermark cross (very faint) ── */
  drawCross(ctx, W / 2, H / 2, 90, "rgba(255,255,255,0.025)", 1);

  /* ── Team / ally title ── */
  const teamName = data.teamName || "Your Saint Ally";
  ctx.save();
  ctx.font        = "bold 26px 'Playfair Display', Georgia, serif";
  ctx.fillStyle   = "#f0c040";
  ctx.textAlign   = "center";
  ctx.shadowBlur  = 18;
  ctx.shadowColor = "rgba(212,160,23,0.6)";
  ctx.fillText(teamName, W / 2, 60);
  ctx.restore();

  /* ── Saint names subtitle ── */
  const saints     = data.saints || [];
  const saintNames = saints.map((s) => s.name).join("  ·  ") || "Unknown Saint";
  ctx.save();
  ctx.font      = "italic 14px 'Playfair Display', Georgia, serif";
  ctx.fillStyle = "rgba(240,232,213,0.82)";
  ctx.textAlign = "center";
  ctx.fillText(saintNames, W / 2, 84);
  ctx.restore();

  /* ── Gold divider with cross ── */
  ctx.save();
  ctx.strokeStyle = "rgba(212,160,23,0.45)";
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(50, 100); ctx.lineTo(W - 50, 100);
  ctx.stroke();
  ctx.restore();
  drawCross(ctx, W / 2, 100, 6, "#d4a017", 0.8);

  /* ── Symbols ── */
  const allSymbols = saints.flatMap((s) => s.symbols || []).slice(0, 7);
  if (allSymbols.length) {
    ctx.save();
    ctx.font      = "11px Arial, sans-serif";
    ctx.fillStyle = "#f0c040";
    ctx.textAlign = "center";
    ctx.fillText(`✦  ${allSymbols.join("   ✦   ")}  ✦`, W / 2, 120);
    ctx.restore();
  }

  /* ── Virtues / Powers ── */
  const allPowers = saints.flatMap((s) => s.powers || []).slice(0, 5);
  if (allPowers.length) {
    ctx.save();
    ctx.font      = "11px Arial, sans-serif";
    ctx.fillStyle = "rgba(167,186,255,0.85)";
    ctx.textAlign = "center";
    ctx.fillText(allPowers.join("  ·  "), W / 2, 138);
    ctx.restore();
  }

  /* ── Prayer text (multi-line) ── */
  const prayer = data.teamPrayer || "";
  ctx.save();
  ctx.font      = "italic 12.5px 'Playfair Display', Georgia, serif";
  ctx.fillStyle = "rgba(240,232,213,0.88)";
  ctx.textAlign = "center";
  const pLines  = wrapText(ctx, prayer, W - 100);
  pLines.slice(0, 9).forEach((line, i) => {
    ctx.fillText(line, W / 2, 162 + i * 18);
  });
  ctx.restore();

  /* ── Watermark ── */
  ctx.save();
  ctx.font      = "10px Arial, sans-serif";
  ctx.fillStyle = "rgba(212,160,23,0.45)";
  ctx.textAlign = "right";
  ctx.fillText("✝ PatronForge · Grow Closer to God", W - 22, H - 16);
  ctx.restore();
}

/* ─── Component ──────────────────────────────────────────────────── */
const PrayerCard = forwardRef(function PrayerCard({ data }, ref) {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => canvasRef.current);

  useEffect(() => {
    if (data && canvasRef.current) drawSaintCard(canvasRef.current, data);
  }, [data]);

  return (
    <canvas
      ref={canvasRef}
      /* Physical dimensions set by setupHiDPI; these are fallback display sizes */
      width={760}
      height={440}
      className="w-full rounded-2xl"
      style={{
        boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,160,23,0.3)",
        border: "none",
      }}
      aria-label={`Saint card for ${data?.teamName || "your saint ally"}`}
      role="img"
    />
  );
});

export default PrayerCard;
