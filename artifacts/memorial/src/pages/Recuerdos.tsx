import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useListPersonas, useListRecuerdos } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { Skeleton } from "@/components/ui/skeleton";

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
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=600&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
];

function getPlaceholder(seed: number) {
  return PLACEHOLDER_IMAGES[seed % PLACEHOLDER_IMAGES.length];
}

/* ── Carousel Modal ── */
interface CarouselModalProps {
  persona: { id: number; nombre: string; fotoPrincipal?: string | null; fechaNacimiento?: string | null; fechaFallecimiento?: string | null; biografia?: string | null };
  images: string[];
  onClose: () => void;
}

function CarouselModal({ persona, images, onClose }: CarouselModalProps) {
  const [current, setCurrent] = useState(0);
  const { data: recuerdosData } = useListRecuerdos({ personaId: persona.id, limit: 10 });

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,6,2,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-900/30 bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-amber-900/50 flex items-center justify-center text-amber-200 hover:bg-amber-800/60 transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Carousel */}
        <div className="relative overflow-hidden rounded-t-2xl bg-stone-950" style={{ height: 320 }}>
          {images.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
            >
              <img src={src} alt={persona.nombre} className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,6,2,0.85) 0%, transparent 60%)" }} />
            </div>
          ))}

          {/* Carousel controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-amber-200 hover:bg-black/70 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-amber-200 hover:bg-black/70 transition-colors"
              >
                ›
              </button>
            </>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="w-2 h-2 rounded-full transition-all duration-300"
                  style={{ background: i === current ? "#f59e0b" : "rgba(255,255,255,0.35)", transform: i === current ? "scale(1.3)" : "scale(1)" }}
                />
              ))}
            </div>
          )}

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-5 pt-16">
            <h2 className="font-serif text-2xl text-amber-100">{persona.nombre}</h2>
            {persona.fechaNacimiento && persona.fechaFallecimiento && (
              <p className="text-amber-400/70 text-xs tracking-wider">{persona.fechaNacimiento} — {persona.fechaFallecimiento}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {persona.biografia && (
            <p className="text-amber-200/75 text-sm leading-relaxed">{persona.biografia}</p>
          )}

          {/* Memories */}
          {recuerdosData && recuerdosData.data.length > 0 && (
            <div>
              <h3 className="font-serif text-lg text-amber-300 mb-4">Recuerdos</h3>
              <div className="space-y-4">
                {recuerdosData.data.map((r) => (
                  <div key={r.id} className="border-l-2 border-amber-700/40 pl-4">
                    <p className="text-amber-200/80 text-sm leading-relaxed mb-1">{r.mensaje}</p>
                    <span className="text-xs text-amber-400/50">— {r.nombreAutor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3 pt-2">
            <Link
              href={`/personas/${persona.id}`}
              onClick={onClose}
              className="flex-1 py-2.5 text-center text-sm bg-amber-800/40 hover:bg-amber-700/50 border border-amber-700/30 text-amber-200 rounded-lg transition-colors"
            >
              Ver perfil completo
            </Link>
            <Link
              href="/velas"
              onClick={onClose}
              className="flex-1 py-2.5 text-center text-sm bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-lg transition-colors"
            >
              Encender una velita
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Pinterest Card ── */
interface PinCardProps {
  persona: { id: number; nombre: string; fotoPrincipal?: string | null; fechaNacimiento?: string | null; fechaFallecimiento?: string | null; biografia?: string | null; totalVelas: number; totalRecuerdos: number };
  images: string[];
  onClick: () => void;
  delay: number;
}

function PinCard({ persona, images, onClick, delay }: PinCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  useEffect(() => {
    if (!hovered) return;
    const t = setInterval(() => setImgIndex((i) => (i + 1) % images.length), 1000);
    return () => clearInterval(t);
  }, [hovered, images.length]);

  return (
    <div
      className="break-inside-avoid mb-5 cursor-pointer group rounded-2xl overflow-hidden border border-amber-900/25 hover:border-amber-600/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20 fade-in-up"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setImgIndex(0); }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: images.length > 0 ? "3/4" : undefined }}>
        <img
          src={images[imgIndex]}
          alt={persona.nombre}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ minHeight: 180 }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(10,6,2,0.9) 0%, rgba(10,6,2,0.3) 50%, transparent 100%)",
            opacity: hovered ? 1 : 0.7,
          }}
        />

        {/* Candle on hover */}
        <div
          className="absolute top-3 right-3 transition-all duration-300"
          style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateY(0)" : "translateY(-8px)" }}
        >
          <CandleFlame size="sm" />
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-serif text-lg text-amber-100 leading-tight">{persona.nombre}</h3>
          {persona.fechaNacimiento && persona.fechaFallecimiento && (
            <p className="text-amber-400/70 text-xs mt-0.5">{persona.fechaNacimiento} — {persona.fechaFallecimiento}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex gap-4 text-xs text-amber-200/50">
          <span>🕯 {persona.totalVelas}</span>
          <span>💬 {persona.totalRecuerdos}</span>
        </div>
        <span className="text-xs text-amber-400/60 group-hover:text-amber-400 transition-colors">Ver recuerdos →</span>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function Recuerdos() {
  const { data: personas, isLoading } = useListPersonas();
  const [selected, setSelected] = useState<typeof personas extends (infer T)[] | undefined ? T : never | null>(null);

  const personaImages = (persona: { id: number; fotoPrincipal?: string | null }) => {
    const imgs: string[] = [];
    if (persona.fotoPrincipal) imgs.push(persona.fotoPrincipal);
    imgs.push(getPlaceholder(persona.id));
    imgs.push(getPlaceholder(persona.id + 3));
    imgs.push(getPlaceholder(persona.id + 6));
    return imgs;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {selected && (
        <CarouselModal
          persona={selected}
          images={personaImages(selected)}
          onClose={() => setSelected(null)}
        />
      )}

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-amber-400/70 text-xs font-medium tracking-widest uppercase mb-3">Galería de recuerdos</p>
            <h1 className="font-serif text-5xl text-amber-100 mb-4">Sus historias, su legado</h1>
            <p className="text-amber-200/60 max-w-lg mx-auto leading-relaxed">
              Cada imagen guarda un mundo. Haz clic en el perfil de tu ser querido para revivir sus momentos más especiales.
            </p>
          </div>

          {isLoading ? (
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="break-inside-avoid mb-5">
                  <Skeleton
                    className="w-full rounded-2xl bg-amber-900/20"
                    style={{ height: [220, 280, 240, 300, 200, 260][i - 1] }}
                  />
                </div>
              ))}
            </div>
          ) : personas && personas.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {personas.map((persona, i) => (
                <PinCard
                  key={persona.id}
                  persona={persona}
                  images={personaImages(persona)}
                  onClick={() => setSelected(persona)}
                  delay={i * 0.1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <CandleFlame size="lg" className="mx-auto mb-6 opacity-50" />
              <p className="text-amber-200/50 text-lg">Aún no hay recuerdos en la galería.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
