import { Link, useLocation } from "wouter";
import { useState } from "react";

const ESPRESSO = "#1a0f07";
const GOLD = "#c9943a";
const CREAM = "#f5f0e8";
const WARM_BORDER = "#ddd2bf";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/personas", label: "Memorial" },
  { href: "/galeria", label: "Galería" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: ESPRESSO, borderBottom: `1px solid rgba(201,148,58,0.2)` }} className="fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex flex-col items-center" style={{ width: 22, flexShrink: 0 }}>
            <div className="candle-flame relative" style={{ width: 14, height: 22 }}>
              <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 14, height: 22, background: `radial-gradient(ellipse at 50% 80%, ${GOLD} 0%, ${GOLD}66 50%, transparent 80%)`, borderRadius: "50% 50% 30% 30%", filter: "blur(1px)" }} />
              <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 7, height: 13, background: `radial-gradient(ellipse at 50% 70%, #e8c060 0%, ${GOLD}bb 65%, transparent 100%)`, borderRadius: "50% 50% 30% 30%" }} />
              <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 2.5, height: 6, background: "rgba(255,255,240,0.95)", borderRadius: "50%", filter: "blur(0.3px)" }} />
            </div>
            <div style={{ width: 1.5, height: 4, background: "#888", borderRadius: 1 }} />
            <div style={{ width: 14, height: 30, background: `linear-gradient(160deg,#f5efd8 0%,#e8dcbc 55%,#cec0a0 100%)`, borderRadius: "3px 3px 2px 2px", border: `1px solid ${GOLD}55`, filter: `drop-shadow(0 0 6px rgba(201,148,58,0.5))` }} />
          </div>
          <span className="font-serif text-lg font-bold transition-colors" style={{ color: CREAM }}>
            En Tu Memoria
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                style={{
                  color: isActive ? GOLD : "rgba(245,240,232,0.65)",
                  background: isActive ? "rgba(201,148,58,0.12)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          className="md:hidden p-2 transition-colors"
          style={{ color: "rgba(245,240,232,0.6)" }}
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {open ? (
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div style={{ background: ESPRESSO, borderTop: `1px solid rgba(201,148,58,0.15)` }} className="md:hidden px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors"
              style={{
                color: location === link.href ? GOLD : "rgba(245,240,232,0.65)",
                background: location === link.href ? "rgba(201,148,58,0.12)" : "transparent",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
