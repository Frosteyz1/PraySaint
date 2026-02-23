"use client";
import { useEffect, useRef } from "react";

export default function ReflectionPrompt({ question, cccRef, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    // Prevent background scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(4,9,26,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reflection-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md animate-fade-slide-up"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "24px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,160,23,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Gold top accent */}
        <div style={{ height: "3px", background: "linear-gradient(90deg, transparent, #d4a017, transparent)" }} />

        <div className="p-7">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(212,160,23,0.18), rgba(212,160,23,0.08))", border: "1px solid rgba(212,160,23,0.3)" }}
              aria-hidden="true"
            >
              <span style={{ fontFamily: "Playfair Display, serif", color: "#d4a017", fontSize: "1.1rem" }}>✝</span>
            </div>
            <div>
              <h2
                id="reflection-title"
                className="font-bold text-base"
                style={{ fontFamily: "Playfair Display, serif", color: "var(--fg-primary)" }}
              >
                Faith Reflection
              </h2>
              {cccRef && (
                <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)", fontStyle: "italic" }}>
                  {cccRef}
                </p>
              )}
            </div>
          </div>

          {/* Question */}
          <p
            className="prayer-text text-base leading-relaxed mb-5"
            style={{ color: "var(--fg-secondary)" }}
          >
            {question}
          </p>

          {/* Journal space */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              minHeight: "70px",
            }}
          >
            <p className="text-xs" style={{ color: "var(--fg-muted)", fontStyle: "italic" }}>
              Take a quiet moment — reflect in your heart, or journal your thoughts here…
            </p>
          </div>

          {/* Close button */}
          <button
            ref={closeRef}
            onClick={onClose}
            className="w-full font-semibold py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gold-400 text-sm"
            style={{
              background: "linear-gradient(135deg, #0f2040, #152d63)",
              color: "rgba(240,232,213,0.9)",
              border: "1px solid rgba(212,160,23,0.25)",
            }}
          >
            Close ✝
          </button>
        </div>
      </div>
    </div>
  );
}
