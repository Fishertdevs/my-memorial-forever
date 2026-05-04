import { Link, useLocation } from "wouter";
import { useState } from "react";

const ESPRESSO = "#1a0f07";
const GOLD = "#c9943a";
const CREAM = "#f5f0e8";
const WARM_BORDER = "#ddd2bf";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/personas", label: "Memorial" },
  { href: "/recuerdos", label: "Recuerdos" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: ESPRESSO, borderBottom: `1px solid rgba(201,148,58,0.2)` }} className="fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/candle-logo.png"
            alt="En Tu Memoria"
            className="h-9 w-auto"
          />
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
