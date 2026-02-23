"use client";

const btnBase = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.82rem",
  fontWeight: 600,
  padding: "0.55rem 1rem",
  borderRadius: "10px",
  cursor: "pointer",
  transition: "all 0.18s ease",
  border: "none",
  outline: "none",
  whiteSpace: "nowrap",
};

export default function ShareButton({ canvasRef, title, shareText, hashtag = "PraySaint" }) {

  async function downloadPNG() {
    if (!canvasRef?.current) return;
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `praysaint-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function captureAndDownload() {
    if (!canvasRef?.current) { downloadPNG(); return; }
    try {
      const html2canvas = (await import("html2canvas")).default;
      const captured = await html2canvas(canvasRef.current, { useCORS: true, scale: 2 });
      const link = document.createElement("a");
      link.download = `praysaint-${Date.now()}.png`;
      link.href = captured.toDataURL("image/png");
      link.click();
    } catch { downloadPNG(); }
  }

  function shareToX() {
    const text = encodeURIComponent(`${shareText || title} #${hashtag} — Grow closer to God at PraySaint!`);
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    } catch { alert("Could not copy link. Please copy the URL manually."); }
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Share options">
      {/* Save PNG */}
      <button
        onClick={captureAndDownload}
        aria-label="Save as PNG image"
        style={{
          ...btnBase,
          background: "linear-gradient(135deg, #d4a017, #b8860b)",
          color: "#fff",
          boxShadow: "0 3px 10px rgba(212,160,23,0.35)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 5px 18px rgba(212,160,23,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 3px 10px rgba(212,160,23,0.35)"; e.currentTarget.style.transform = ""; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Save PNG
      </button>

      {/* Share on X */}
      <button
        onClick={shareToX}
        aria-label="Share on X (Twitter)"
        style={{
          ...btnBase,
          background: "rgba(15,32,64,0.9)",
          color: "rgba(240,232,213,0.9)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(21,45,99,0.95)"; e.currentTarget.style.borderColor = "rgba(212,160,23,0.4)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(15,32,64,0.9)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        Share
      </button>

      {/* Copy link */}
      <button
        onClick={copyLink}
        aria-label="Copy page link to clipboard"
        style={{
          ...btnBase,
          background: "var(--bg-elevated)",
          color: "var(--fg-secondary)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-gold)"; e.currentTarget.style.color = "var(--border-gold)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--fg-secondary)"; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
        Copy Link
      </button>
    </div>
  );
}
