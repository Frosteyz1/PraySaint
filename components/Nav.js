"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

/* SVG icon helpers */
function IconHome({ active }) {
  const c = active ? "#f0c040" : "currentColor";
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  );
}
function IconHalo({ active }) {
  const c = active ? "#f0c040" : "currentColor";
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="2.5"/>
      <path d="M4 5c0 7 2 12 8 12s8-5 8-12"/>
    </svg>
  );
}
function IconCandle({ active }) {
  const c = active ? "#f0c040" : "currentColor";
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Flame */}
      <path d="M12 2c0 0-2 2.5-2 4.5a2 2 0 0 0 4 0C14 4.5 12 2 12 2z" fill={active ? "#f0c040" : "none"} strokeWidth="1.5"/>
      {/* Candle body */}
      <rect x="9" y="8" width="6" height="12" rx="1"/>
      {/* Base */}
      <path d="M7 20h10"/>
    </svg>
  );
}
function IconBeads({ active }) {
  const c = active ? "#f0c040" : "currentColor";
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="3"  r="2"/>
      <circle cx="20" cy="9"  r="2"/>
      <circle cx="20" cy="16" r="2"/>
      <circle cx="12" cy="21" r="2"/>
      <circle cx="4"  cy="16" r="2"/>
      <circle cx="4"  cy="9"  r="2"/>
      <path d="M12 5 L19 7.5 M20 11 L20 14 M19 18 L13 20.5 M11 20.5 L5 18 M4 14 L4 11 M5 7.5 L12 5" strokeOpacity="0.4"/>
    </svg>
  );
}

const links = [
  { href: "/",        label: "Home",        Icon: IconHome   },
  { href: "/saints",  label: "Saint Match", Icon: IconHalo   },
  { href: "/novenas", label: "Novenas",     Icon: IconCandle },
  { href: "/rosary",  label: "Rosary",      Icon: IconBeads  },
];

export default function Nav() {
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname                = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled
    ? "rgba(4,8,28,0.97)"
    : "rgba(6,10,32,0.90)";

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 transition-all"
      style={{
        background: navBg,
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderBottom: scrolled
          ? "1px solid rgba(212,160,23,0.30)"
          : "1px solid rgba(212,160,23,0.15)",
        boxShadow: scrolled
          ? "0 4px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(212,160,23,0.10) inset"
          : "0 2px 16px rgba(0,0,0,0.35)",
      }}
    >
      {/* Subtle top gold shimmer line */}
      <div aria-hidden="true" style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent 0%, rgba(212,160,23,0.5) 30%, rgba(240,192,64,0.8) 50%, rgba(212,160,23,0.5) 70%, transparent 100%)",
        pointerEvents: "none",
      }} />

      <div className="max-w-5xl mx-auto px-5 flex items-center justify-between h-[68px]">
        {/* Logo */}
        <Link
          href="/"
          aria-label="PraySaint — home"
          className="flex items-center gap-2.5 group"
        >
          <span
            className="text-gold-400 transition-transform group-hover:scale-110"
            aria-hidden="true"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "1.45rem",
              filter: "drop-shadow(0 0 8px rgba(212,160,23,0.65)) drop-shadow(0 0 18px rgba(212,160,23,0.30))",
            }}
          >
            ✝
          </span>
          <span
            className="font-bold text-gold-400"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "1.22rem",
              letterSpacing: "0.06em",
              textShadow: "0 0 20px rgba(212,160,23,0.45), 0 0 40px rgba(212,160,23,0.20)",
            }}
          >
            PraySaint
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden sm:flex items-center gap-1" role="list">
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-gold-400"
                  style={{
                    padding: "8px 14px",
                    fontSize: "0.88rem",
                    fontWeight: active ? 700 : 600,
                    letterSpacing: "0.01em",
                    color: active ? "#0a1428" : "rgba(240,232,213,0.88)",
                    background: active
                      ? "linear-gradient(135deg, #f0c040 0%, #d4a017 60%, #b8860b 100%)"
                      : "transparent",
                    boxShadow: active
                      ? "0 2px 16px rgba(212,160,23,0.55), inset 0 1px 0 rgba(255,255,255,0.25)"
                      : "none",
                    border: active ? "none" : "1px solid transparent",
                    textDecoration: "none",
                    textShadow: active ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "#f0c040";
                      e.currentTarget.style.background = "rgba(212,160,23,0.14)";
                      e.currentTarget.style.border = "1px solid rgba(212,160,23,0.35)";
                      e.currentTarget.style.boxShadow = "0 0 12px rgba(212,160,23,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = "rgba(240,232,213,0.88)";
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.border = "1px solid transparent";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon active={active} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right side: theme toggle + mobile trigger */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(240,232,213,0.9)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6"  y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(240,232,213,0.9)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="sm:hidden border-t px-4 py-3"
          style={{ borderColor: "rgba(212,160,23,0.20)", background: "rgba(4,8,28,0.99)" }}
        >
          <ul className="flex flex-col gap-1" role="list">
            {links.map(({ href, label, Icon }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? "bg-gold-900/30" : "hover:bg-white/5"
                    }`}
                    style={{ color: active ? "#f0c040" : "rgba(240,232,213,0.85)" }}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon active={active} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
