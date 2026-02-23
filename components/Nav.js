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
function IconSmile({ active }) {
  const c = active ? "#f0c040" : "currentColor";
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <circle cx="9"  cy="10" r="1" fill={c} stroke="none"/>
      <circle cx="15" cy="10" r="1" fill={c} stroke="none"/>
    </svg>
  );
}

const links = [
  { href: "/",       label: "Home",       Icon: IconHome  },
  { href: "/saints", label: "Saint Ally", Icon: IconHalo  },
  { href: "/rosary", label: "Rosary",     Icon: IconBeads },
  { href: "/memes",  label: "Memes",      Icon: IconSmile },
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
    ? "rgba(8,14,38,0.92)"
    : "rgba(8,14,38,0.82)";

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 transition-all"
      style={{
        background: navBg,
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        borderBottom: scrolled
          ? "1px solid rgba(212,160,23,0.22)"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.35)" : "none",
      }}
    >
      <div className="max-w-5xl mx-auto px-5 flex items-center justify-between h-14">
        {/* Logo */}
        <Link
          href="/"
          aria-label="PatronForge — home"
          className="flex items-center gap-2 group"
        >
          <span
            className="text-gold-400 text-lg transition-transform group-hover:scale-110"
            aria-hidden="true"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            ✝
          </span>
          <span
            className="font-bold text-gold-400 tracking-wide text-[1.05rem]"
            style={{ fontFamily: "Playfair Display, serif", letterSpacing: "0.05em" }}
          >
            PatronForge
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden sm:flex items-center gap-1" role="list">
          {links.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                    active
                      ? "text-gold-400 bg-white/8"
                      : "text-cream-200 hover:text-gold-300 hover:bg-white/6"
                  }`}
                  style={{ color: active ? "#f0c040" : "rgba(240,232,213,0.85)" }}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon active={active} />
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gold-400"
                      aria-hidden="true"
                    />
                  )}
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
          style={{ borderColor: "rgba(212,160,23,0.18)", background: "rgba(4,9,26,0.97)" }}
        >
          <ul className="flex flex-col gap-1" role="list">
            {links.map(({ href, label, Icon }) => {
              const active = pathname === href;
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
