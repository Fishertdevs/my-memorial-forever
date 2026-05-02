import { Link, useLocation } from "wouter";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/personas", label: "Memorial" },
  { href: "/velas", label: "Encender Velita" },
  { href: "/recuerdos", label: "Recuerdos" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a3a4a]/60 bg-[#0f1923]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src="/candle-logo.webp"
            alt="En Tu Memoria"
            className="h-9 w-auto drop-shadow-lg"
            style={{ filter: "drop-shadow(0 0 8px rgba(255,140,0,0.55))" }}
          />
          <span className="font-serif text-lg font-semibold text-[#e8c97e] group-hover:text-[#f5d98a] transition-colors">
            En Tu Memoria
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActive
                    ? "text-[#e8a84c] bg-[#1e2d3d]"
                    : "text-[#a8b8c4] hover:text-[#e8c97e] hover:bg-[#1a2836]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-[#a8b8c4] hover:text-[#e8c97e] p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          <div className="w-5 h-0.5 bg-current mb-1 transition-transform" style={{ transform: open ? "rotate(45deg) translate(2px, 6px)" : "none" }} />
          <div className="w-5 h-0.5 bg-current mb-1 transition-opacity" style={{ opacity: open ? 0 : 1 }} />
          <div className="w-5 h-0.5 bg-current transition-transform" style={{ transform: open ? "rotate(-45deg) translate(2px, -6px)" : "none" }} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#2a3a4a]/60 bg-[#0f1923] px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-[#e8a84c] bg-[#1e2d3d]"
                    : "text-[#a8b8c4] hover:text-[#e8c97e]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
