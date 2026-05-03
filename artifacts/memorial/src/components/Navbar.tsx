import { Link, useLocation } from "wouter";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/personas", label: "Memorial" },
  { href: "/recuerdos", label: "Recuerdos" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/candle-logo.png"
            alt="En Tu Memoria"
            className="h-9 w-auto"
          />
          <span className="font-serif text-lg font-bold text-black group-hover:text-orange-500 transition-colors">
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
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-orange-500 bg-orange-50"
                    : "text-black/70 hover:text-orange-500 hover:bg-orange-50/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {/* CTA button */}
          <Link
            href="/velas"
            className="ml-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-sm"
            style={{
              background: location === "/velas" ? "#ea580c" : "#f97316",
              boxShadow: "0 2px 8px rgba(249,115,22,0.30)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M17 14c0 4-7 8-7 8S3 18 3 14a7 7 0 0114 0z"/>
              <circle cx="10" cy="14" r="3"/>
            </svg>
            Encender Velita
          </Link>
        </div>

        <button
          className="md:hidden text-black/60 hover:text-orange-500 p-2 transition-colors"
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
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                location === link.href
                  ? "text-orange-500 bg-orange-50"
                  : "text-black/70 hover:text-orange-500 hover:bg-orange-50/60"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/velas"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm font-semibold rounded-lg text-white text-center"
            style={{ background: "#f97316" }}
          >
            Encender Velita
          </Link>
        </div>
      )}
    </nav>
  );
}
