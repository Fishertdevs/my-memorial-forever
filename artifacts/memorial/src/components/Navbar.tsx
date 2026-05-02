import { Link, useLocation } from "wouter";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/personas", label: "Memorial" },
  { href: "/velas", label: "Encender Velita" },
];

export default function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-amber-900/30 bg-[hsl(32,30%,8%)/95] backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-2xl" style={{ filter: "drop-shadow(0 0 6px rgba(255,165,50,0.7))" }}>
            &#x1F56F;
          </span>
          <span className="font-serif text-lg font-semibold text-amber-200 group-hover:text-amber-100 transition-colors">
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
                    ? "text-amber-300 bg-amber-900/30"
                    : "text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/20"
                }`}
                data-testid={`nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-amber-200/80 hover:text-amber-100 p-2"
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
        <div className="md:hidden border-t border-amber-900/30 bg-[hsl(32,30%,8%)] px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-amber-300 bg-amber-900/30"
                    : "text-amber-200/70 hover:text-amber-200"
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
