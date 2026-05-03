import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useListPersonas, useListRecuerdos } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateEs(raw?: string | null): string {
  if (!raw) return "";
  try {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch { return raw; }
}

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&q=80",
  "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=600&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80",
  "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=600&q=80",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=600&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
];

function getImg(seed: number) {
  return PLACEHOLDER_IMAGES[seed % PLACEHOLDER_IMAGES.length];
}

interface Persona {
  id: number;
  nombre: string;
  fotoPrincipal?: string | null;
  fechaNacimiento?: string | null;
  fechaFallecimiento?: string | null;
  biografia?: string | null;
  totalVelas: number;
  totalRecuerdos: number;
}

/* ── Modal carrusel ── */
function CarouselModal({ persona, onClose }: { persona: Persona; onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  const { data: recuerdosData } = useListRecuerdos({ personaId: persona.id, limit: 10 });
  const images = [
    ...(persona.fotoPrincipal ? [persona.fotoPrincipal] : []),
    getImg(persona.id), getImg(persona.id + 4), getImg(persona.id + 8),
  ];
  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-orange-50 flex items-center justify-center text-black/50 hover:text-orange-500 transition-colors shadow"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1l12 12M13 1L1 13"/></svg>
        </button>

        {/* Image carousel */}
        <div className="relative overflow-hidden rounded-t-2xl bg-gray-900" style={{ height: 300 }}>
          {images.map((src, i) => (
            <div key={i} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: i === current ? 1 : 0 }}>
              <img src={src} alt={persona.nombre} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
            </div>
          ))}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.85)", color: "#111" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10 4l-4 4 4 4"/></svg>
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.85)", color: "#111" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 4l4 4-4 4"/></svg>
              </button>
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === current ? 18 : 6, height: 6,
                      background: i === current ? "#f97316" : "rgba(255,255,255,0.45)",
                    }}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-10">
            <h2 className="font-serif text-2xl text-white">{persona.nombre}</h2>
            {(persona.fechaNacimiento || persona.fechaFallecimiento) && (
              <p className="text-white/55 text-xs tracking-wide mt-0.5">
                {formatDateEs(persona.fechaNacimiento)}
                {persona.fechaNacimiento && persona.fechaFallecimiento ? " — " : ""}
                {formatDateEs(persona.fechaFallecimiento)}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {persona.biografia && (
            <p className="text-black/58 text-sm leading-relaxed">{persona.biografia}</p>
          )}
          {recuerdosData && recuerdosData.data.length > 0 && (
            <div>
              <h3 className="font-serif text-lg text-black mb-3">Recuerdos</h3>
              <div className="space-y-3">
                {recuerdosData.data.map((r) => (
                  <div key={r.id} className="border-l-2 border-orange-200 pl-4">
                    <p className="text-black/65 text-sm leading-relaxed mb-1">{r.mensaje}</p>
                    <span className="text-xs font-medium" style={{ color: "#f97316" }}>— {r.nombreAutor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <Link
              href={`/personas/${persona.id}`}
              onClick={onClose}
              className="flex-1 py-3 text-center text-sm font-semibold border-2 border-black text-black hover:bg-black hover:text-white rounded-xl transition-all"
            >
              Ver perfil completo
            </Link>
            <Link
              href="/velas"
              onClick={onClose}
              className="flex-1 py-3 text-center text-sm font-semibold text-white rounded-xl transition-all"
              style={{ background: "#f97316" }}
            >
              Encender una velita
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Pinterest card ── */
function PinCard({ persona, onClick, delay }: { persona: Persona; onClick: () => void; delay: number }) {
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const images = [
    ...(persona.fotoPrincipal ? [persona.fotoPrincipal] : []),
    getImg(persona.id), getImg(persona.id + 4), getImg(persona.id + 8),
  ];

  useEffect(() => {
    if (!hovered) return;
    const t = setInterval(() => setImgIdx((i) => (i + 1) % images.length), 900);
    return () => clearInterval(t);
  }, [hovered, images.length]);

  return (
    <div
      className="break-inside-avoid mb-5 cursor-pointer group rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300 fade-in-up bg-white"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setImgIdx(0); }}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
        <img
          src={images[imgIdx]}
          alt={persona.nombre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)" }} />

        {/* Candle on hover */}
        <div
          className="absolute top-3 right-3 transition-all duration-300"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(-8px)" }}
        >
          <CandleFlame size="sm" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-serif text-lg text-white leading-tight">{persona.nombre}</h3>
          {(persona.fechaNacimiento || persona.fechaFallecimiento) && (
            <p className="text-white/55 text-xs mt-0.5">
              {formatDateEs(persona.fechaNacimiento)}
              {persona.fechaNacimiento && persona.fechaFallecimiento ? " — " : ""}
              {formatDateEs(persona.fechaFallecimiento)}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between bg-white">
        <div className="flex gap-4 text-xs text-black/35">
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 14c0 4-7 8-7 8S3 18 3 14a7 7 0 0114 0z"/><circle cx="10" cy="14" r="3"/></svg>
            {persona.totalVelas}
          </span>
          <span className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            {persona.totalRecuerdos}
          </span>
        </div>
        <span className="text-xs font-semibold text-black/30 group-hover:text-orange-500 transition-colors">
          Ver recuerdos →
        </span>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function Recuerdos() {
  const { data: personas, isLoading } = useListPersonas();
  const [selected, setSelected] = useState<Persona | null>(null);

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      {selected && <CarouselModal persona={selected} onClose={() => setSelected(null)} />}

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-xs text-orange-500 font-bold tracking-widest uppercase mb-3">
              Galería de recuerdos
            </p>
            <h1 className="font-serif text-5xl text-black mb-4">Sus historias, su legado</h1>
            <p className="text-black/45 max-w-lg mx-auto leading-relaxed">
              Cada imagen guarda un mundo. Haz clic para revivir sus momentos más especiales.
            </p>
          </div>

          {isLoading ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-5">
              {[240, 300, 220, 280, 200, 260].map((h, i) => (
                <div key={i} className="break-inside-avoid mb-5">
                  <Skeleton className="w-full rounded-2xl bg-gray-100" style={{ height: h }} />
                </div>
              ))}
            </div>
          ) : personas && personas.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {personas.map((p, i) => (
                <PinCard
                  key={p.id}
                  persona={p}
                  onClick={() => setSelected(p)}
                  delay={i * 0.1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <CandleFlame size="lg" className="mx-auto mb-6 opacity-40" />
              <p className="text-black/40 text-lg">Aún no hay recuerdos en la galería.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="py-8 px-4 text-center" style={{ background: "#ffffff", borderTop: "3px solid #f97316" }}>
        <p className="font-serif text-black/70 text-sm tracking-widest uppercase mb-1">En Tu Memoria</p>
        <p className="text-black/35 text-xs font-light">Siempre estarás en nuestros corazones</p>
      </footer>
    </div>
  );
}
