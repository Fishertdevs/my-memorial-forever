import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useListVelas, useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import heroImage from "@assets/image_1777777551997.png";


interface Vela { id: number; nombreRecordado: string; nombreAutor: string; mensaje: string; tiempoTranscurrido: string; }

const FLAME_COLORS = [
  { outer: "#f97316", inner: "#fbbf24", glow: "rgba(249,115,22,0.25)" },
  { outer: "#ef4444", inner: "#fca5a5", glow: "rgba(239,68,68,0.22)" },
  { outer: "#f59e0b", inner: "#fde68a", glow: "rgba(245,158,11,0.25)" },
  { outer: "#f97316", inner: "#fed7aa", glow: "rgba(249,115,22,0.20)" },
];

function VelaCard({ vela, index }: { vela: Vela; index: number }) {
  const fc = FLAME_COLORS[index % FLAME_COLORS.length];
  const [liked, setLiked] = useState(false);

  return (
    <div
      className="relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 h-full overflow-hidden"
    >

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <CandleFlame size="sm" outerColor={fc.outer} innerColor={fc.inner} glowColor={fc.glow} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-orange-500 mb-1.5 truncate">Por {vela.nombreRecordado}</p>
          <p className="text-black/65 text-sm leading-relaxed line-clamp-4 mb-3">{vela.mensaje}</p>
          <div className="flex items-center justify-between text-xs text-black/35 mt-1">
            <span className="truncate mr-2">{vela.nombreAutor}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span>{vela.tiempoTranscurrido}</span>
              <button
                className="transition-all duration-200 active:scale-90 flex-shrink-0"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 1 }}
                onClick={() => setLiked(true)}
                aria-label="Me gusta"
              >
                {liked ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f43f5e">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const vela = velas[current];

  return (
    <div>
      {/* Single card — swipeable */}
      <div
        className="max-w-lg mx-auto mb-5"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div key={current} className="fade-in-up">
          <VelaCard vela={vela} index={current} />
        </div>
      </div>

      {/* Dots only — no arrows */}
      <div className="flex items-center justify-center gap-2">
        {velas.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetTimer(); }}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? 22 : 8,
              height: 8,
              background: i === current ? "#f97316" : "#e5e7eb",
            }}
            aria-label={`Velita ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: velasData } = useListVelas({ limit: 30 });
  const { data: personas } = useListPersonas();
  const persona = personas?.[0];

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      {/* Unified hero */}
      {persona && (
        <section className="relative overflow-hidden bg-[#0b0b10] text-white">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#f97316_0%,#f97316_47%,#0b0b10_47%,#0b0b10_100%)] opacity-95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(255,255,255,0.14),transparent_26%),radial-gradient(circle_at_72%_50%,rgba(255,255,255,0.08),transparent_28%)]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6 py-14 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative z-10 max-w-2xl">
                <p className="text-xs tracking-[0.28em] uppercase text-white/60 mb-4">
                  En su memoria
                </p>
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-white mb-6">
                  {persona.nombre}
                </h1>
                <p className="text-white/55 text-sm tracking-wide mb-4">
                  {persona.fechaNacimiento} — {persona.fechaFallecimiento}
                </p>
                <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-xl mb-8">
                  {persona.biografia}
                </p>
                <Link href={`/personas/${persona.id}`} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15">
                  Recuérdalo aquí →
                </Link>
              </div>

              <div className="relative z-10">
                <div className="relative mx-auto aspect-[4/5] max-w-[420px] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40">
                  <img
                    src={heroImage}
                    alt="Memorial"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_0%,rgba(0,0,0,0.16)_100%)]" />
                  <div className="absolute bottom-5 left-5 rounded-full bg-black/40 px-4 py-2 text-xs font-semibold tracking-[0.22em] text-white/90 backdrop-blur">
                    Velitas encendidas
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Candles carousel */}
      {velasData && velasData.data.length > 0 && (
        <section className="py-16 px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-3xl text-black text-center mb-8">Velitas encendidas</h2>
            <CandlesCarousel velas={velasData.data} />
            <div className="text-center mt-7">
              <Link href="/velas" className="text-sm font-semibold text-black/40 hover:text-orange-500 transition-colors">
                Ver todas →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <CandleFlame size="lg" className="mx-auto mb-6" />
        <h2 className="font-serif text-4xl text-black mb-3">Siempre en nuestro corazón</h2>
        <p className="text-black/45 mb-10 max-w-md mx-auto leading-relaxed">
          Cada recuerdo compartido es una forma de mantener viva su luz para siempre.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/velas" className="inline-flex items-center justify-center px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-orange-200">
            Encender una velita
          </Link>
          <Link href="/recuerdos" className="inline-flex items-center justify-center px-8 py-3.5 bg-black hover:bg-black/80 text-white font-semibold rounded-xl transition-all duration-200">
            Ver recuerdos
          </Link>
        </div>
      </section>

      <footer className="py-10 px-4 text-center" style={{ borderTop: "3px solid #000" }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/candle-logo.png" alt="" className="h-8 w-auto opacity-50" />
        </div>
        <p className="text-black/40 text-sm font-light tracking-wide">
          En Tu Memoria — Siempre estarás en nuestros corazones
        </p>
      </footer>
    </div>
  );
}
