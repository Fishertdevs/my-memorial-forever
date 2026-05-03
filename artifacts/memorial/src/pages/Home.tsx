import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useListVelas, useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import heroImage from "@assets/image_1777782607280.png";

/* ─────── Helpers ─────── */
function formatDateEs(raw?: string): string {
  if (!raw) return "";
  try {
    const [y, m, d] = raw.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch { return raw; }
}

/* ─────── Types ─────── */
interface Vela {
  id: number;
  nombreRecordado: string;
  nombreAutor: string;
  mensaje: string;
  tiempoTranscurrido: string;
}

const FLAME_COLORS = [
  { outer: "#f97316", inner: "#fbbf24", glow: "rgba(249,115,22,0.25)" },
  { outer: "#ef4444", inner: "#fca5a5", glow: "rgba(239,68,68,0.22)" },
  { outer: "#f59e0b", inner: "#fde68a", glow: "rgba(245,158,11,0.25)" },
  { outer: "#f97316", inner: "#fed7aa", glow: "rgba(249,115,22,0.20)" },
];

/* ─────── VelaCard ─────── */
function VelaCard({ vela, index }: { vela: Vela; index: number }) {
  const fc = FLAME_COLORS[index % FLAME_COLORS.length];
  const [liked, setLiked] = useState(false);

  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <CandleFlame size="sm" outerColor={fc.outer} innerColor={fc.inner} glowColor={fc.glow} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-orange-500 mb-1.5 truncate">Por {vela.nombreRecordado}</p>
          <p className="text-black/65 text-sm leading-relaxed line-clamp-4 mb-3">{vela.mensaje}</p>
          <div className="flex items-center justify-between text-xs text-black/35">
            <span className="truncate mr-2">{vela.nombreAutor}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span>{vela.tiempoTranscurrido}</span>
              <button
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 1 }}
                onClick={() => setLiked(true)}
                aria-label="Me gusta"
              >
                {liked ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#f43f5e"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────── Carrusel de velitas ─────── */
function CandlesCarousel({ velas }: { velas: Vela[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const total = velas.length;

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 10000);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetTimer(); }
    touchStartX.current = null;
  };

  return (
    <div>
      <div className="max-w-lg mx-auto mb-5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div key={current} className="fade-in-up">
          <VelaCard vela={velas[current]} index={current} />
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        {velas.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            className="rounded-full transition-all duration-300"
            style={{ width: i === current ? 22 : 8, height: 8, background: i === current ? "#f97316" : "#e5e7eb" }}
            aria-label={`Velita ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── HERO ─────────────────── */
function HeroSection({
  persona,
}: {
  persona: {
    id: number;
    nombre: string;
    fechaNacimiento?: string;
    fechaFallecimiento?: string;
    biografia?: string;
    fotoPrincipal?: string;
    totalVelas?: number;
    totalRecuerdos?: number;
  };
}) {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Split background */}
      <div className="absolute inset-0 pointer-events-none bg-white" aria-hidden />

      <div className="relative max-w-7xl mx-auto flex" style={{ minHeight: "calc(100vh - 64px)" }}>

        {/* LEFT */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-20" style={{ width: "55%", minHeight: "calc(100vh - 64px)", background: "#fff" }}>
          <div style={{ maxWidth: 540 }}>
            <h1
              className="hero-enter-2 font-serif leading-[0.9] mb-5"
              style={{ fontSize: "clamp(2.4rem, 4.2vw, 4.4rem)", color: "#0d0d0d" }}
            >
              {persona.nombre}
            </h1>
            <p className="hero-enter-3 text-sm tracking-wide mb-6" style={{ color: "rgba(0,0,0,0.38)" }}>
              {formatDateEs(persona.fechaNacimiento)}
              {persona.fechaNacimiento && persona.fechaFallecimiento && " — "}
              {formatDateEs(persona.fechaFallecimiento)}
            </p>
            <div className="hero-enter-5 mb-8 flex items-center gap-4">
              <div className="w-10 h-0.5 rounded-full" style={{ background: "#f97316" }} />
              <Link
                href={`/personas/${persona.id}`}
                className="hero-enter-6 inline-flex items-center text-sm font-semibold transition-colors hover:opacity-75"
                style={{ color: "#f97316" }}
              >
                Recuérdalo aquí
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hidden lg:flex items-center justify-center py-14 pr-12" style={{ width: "45%", background: "#fff" }}>
          <div className="relative" style={{ width: "100%", maxWidth: 400 }}>
            <div
              className="relative overflow-hidden"
              style={{
                width: "100%",
                aspectRatio: "3/4",
                borderRadius: "2.4rem 1.3rem 2.2rem 1.5rem",
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 24px 50px rgba(0,0,0,0.10)",
                backgroundImage: `url(${heroImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── HOME ─────────────────── */
export default function Home() {
  const { data: velasData } = useListVelas({ limit: 30 });
  const { data: personas } = useListPersonas();
  const persona = personas?.[0];
  const velas: Vela[] = velasData?.data ?? [];

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      {persona && <HeroSection persona={persona} />}

      {/* Velitas section */}
      {velas.length > 0 && (
        <section className="py-20 px-8" style={{ background: "#fafafa", borderTop: "4px solid #f97316" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#f97316" }}>
                Llama viva
              </p>
              <h2 className="font-serif text-3xl text-black">Velitas encendidas</h2>
              <p className="text-black/40 text-sm mt-2">
                {velasData?.total ?? velas.length} personas han honrado su memoria
              </p>
            </div>
            <CandlesCarousel velas={velas} />
            <div className="text-center mt-8">
              <Link
                href="/velas"
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-75"
                style={{ color: "#f97316" }}
              >
                Ver todas las velitas
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-4 text-center" style={{ background: "#0d0d0d" }}>
        <CandleFlame size="lg" className="mx-auto mb-6" />
        <h2 className="font-serif text-4xl text-white mb-3">Siempre en nuestro corazón</h2>
        <p className="text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
          Cada recuerdo compartido es una forma de mantener viva su luz para siempre.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/velas"
            className="inline-flex items-center justify-center px-8 py-3.5 font-semibold rounded-xl transition-all duration-200 shadow-lg"
            style={{ background: "#f97316", color: "#fff", boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}
          >
            Encender una velita
          </Link>
          <Link
            href="/recuerdos"
            className="inline-flex items-center justify-center px-8 py-3.5 font-semibold rounded-xl transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.15)" }}
          >
            Ver recuerdos
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 text-center" style={{ background: "#ffffff", borderTop: "3px solid #f97316" }}>
        <p className="font-serif text-black/80 text-sm tracking-widest uppercase mb-1">En Tu Memoria</p>
        <p className="text-black/40 text-xs font-light">Siempre estarás en nuestros corazones</p>
      </footer>
    </div>
  );
}
