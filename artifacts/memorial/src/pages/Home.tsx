import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useListVelas, useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";

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

/* ───── Velita card (solo en sección inferior) ───── */
function VelaCard({ vela, index }: { vela: Vela; index: number }) {
  const fc = FLAME_COLORS[index % FLAME_COLORS.length];
  const [liked, setLiked] = useState(false);

  return (
    <div className="relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 overflow-hidden">
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
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 1 }}
                onClick={() => setLiked(true)}
                aria-label="Me gusta"
              >
                {liked ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f43f5e">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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

/* ───── Carrusel inferior (solo tarjetas) ───── */
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
      <div
        className="max-w-lg mx-auto mb-5"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
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

/* ───────────────────────────────────────────────
   HERO UNIFICADO
   Izquierda: alterna entre "En su memoria" y
              "Velitas encendidas" (con rotación de mensajes)
   Derecha:   foto fija de la persona
─────────────────────────────────────────────── */
type HeroSlide = "memorial" | "velitas";

function HeroSection({
  persona,
  velas,
}: {
  persona: { id: number; nombre: string; fechaNacimiento?: string; fechaFallecimiento?: string; biografia?: string; fotoPrincipal?: string };
  velas: Vela[];
}) {
  const [slide, setSlide] = useState<HeroSlide>("memorial");
  const [visible, setVisible] = useState(true);
  const [velaIdx, setVelaIdx] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const velaTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const switchSlide = useCallback((next: HeroSlide) => {
    setVisible(false);
    setTimeout(() => {
      setSlide(next);
      setVisible(true);
    }, 420);
  }, []);

  const resetSlideTimer = useCallback(() => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(() => {
      switchSlide(slide === "memorial" ? "velitas" : "memorial");
    }, 9000);
  }, [slide, switchSlide]);

  useEffect(() => {
    resetSlideTimer();
    return () => { if (slideTimer.current) clearInterval(slideTimer.current); };
  }, [resetSlideTimer]);

  useEffect(() => {
    if (velas.length === 0) return;
    if (velaTimer.current) clearInterval(velaTimer.current);
    velaTimer.current = setInterval(() => {
      setVelaIdx((i) => (i + 1) % velas.length);
    }, 7000);
    return () => { if (velaTimer.current) clearInterval(velaTimer.current); };
  }, [velas.length]);

  const handleTabClick = (s: HeroSlide) => {
    if (s !== slide) {
      switchSlide(s);
      resetSlideTimer();
    }
  };

  const isMemorial = slide === "memorial";
  const vela = velas[velaIdx];
  const fc = FLAME_COLORS[velaIdx % FLAME_COLORS.length];

  return (
    <section className="relative overflow-hidden" style={{ minHeight: "92vh" }}>
      {/* ── Split background ── */}
      <div className="absolute inset-0 flex pointer-events-none">
        {/* Left half: white when memorial, dark when velitas */}
        <div
          className="w-1/2 transition-colors duration-700"
          style={{ background: isMemorial ? "#f7f7f7" : "#0d0d0d" }}
        />
        {/* Right half: always dark */}
        <div className="w-1/2" style={{ background: "#0d0d0d" }} />
      </div>

      {/* ── Content grid ── */}
      <div
        className="relative max-w-7xl mx-auto px-8 lg:px-14 grid lg:grid-cols-2 gap-0"
        style={{ minHeight: "92vh" }}
      >
        {/* LEFT PANEL */}
        <div className="flex flex-col justify-center py-20 pr-10 lg:pr-16">
          {/* Tabs / pills */}
          <div className="flex gap-3 mb-10">
            <button
              onClick={() => handleTabClick("memorial")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300"
              style={{
                background: isMemorial ? "#f97316" : "rgba(255,255,255,0.08)",
                color: isMemorial ? "#fff" : "rgba(255,255,255,0.4)",
                border: isMemorial ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: isMemorial ? "#fff" : "rgba(255,255,255,0.3)" }}
              />
              En su memoria
            </button>
            <button
              onClick={() => handleTabClick("velitas")}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300"
              style={{
                background: !isMemorial ? "#f97316" : "rgba(0,0,0,0.06)",
                color: !isMemorial ? "#fff" : "rgba(0,0,0,0.35)",
                border: !isMemorial ? "1px solid #f97316" : "1px solid rgba(0,0,0,0.10)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: !isMemorial ? "#fff" : "rgba(0,0,0,0.25)" }}
              />
              Velitas encendidas
            </button>
          </div>

          {/* Animated content */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(18px)",
              transition: "opacity 0.42s ease, transform 0.42s ease",
            }}
          >
            {isMemorial ? (
              /* ── Memorial slide ── */
              <div>
                <p
                  className="text-xs tracking-[0.28em] uppercase mb-5 font-bold"
                  style={{ color: "#f97316" }}
                >
                  En tu memoria
                </p>
                <h1
                  className="font-serif leading-[0.92] mb-5"
                  style={{ fontSize: "clamp(2.8rem, 5vw, 5rem)", color: "#0d0d0d" }}
                >
                  {persona.nombre}
                </h1>
                {persona.fechaNacimiento && persona.fechaFallecimiento && (
                  <p className="text-sm tracking-wide mb-5" style={{ color: "rgba(0,0,0,0.40)" }}>
                    {persona.fechaNacimiento} — {persona.fechaFallecimiento}
                  </p>
                )}
                {persona.biografia && (
                  <p
                    className="text-base leading-relaxed mb-8 max-w-lg line-clamp-4"
                    style={{ color: "rgba(0,0,0,0.55)" }}
                  >
                    {persona.biografia}
                  </p>
                )}
                <Link
                  href={`/personas/${persona.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                  style={{ background: "#f97316" }}
                >
                  Recuérdalo aquí →
                </Link>
              </div>
            ) : (
              /* ── Velitas slide ── */
              vela ? (
                <div>
                  <p
                    className="text-xs tracking-[0.28em] uppercase mb-5 font-bold"
                    style={{ color: "#f97316" }}
                  >
                    Velitas encendidas
                  </p>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 mt-1">
                      <CandleFlame size="md" outerColor={fc.outer} innerColor={fc.inner} glowColor={fc.glow} />
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}>
                        Por {vela.nombreRecordado}
                      </p>
                      <p
                        className="font-serif leading-snug mb-4"
                        style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", color: "#f7f7f7" }}
                      >
                        "{vela.mensaje}"
                      </p>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>
                        — {vela.nombreAutor} · {vela.tiempoTranscurrido}
                      </p>
                    </div>
                  </div>

                  {/* Dots for velitas */}
                  {velas.length > 1 && (
                    <div className="flex gap-2 mt-6">
                      {velas.map((_, i) => (
                        <span
                          key={i}
                          className="rounded-full transition-all duration-300"
                          style={{
                            width: i === velaIdx ? 20 : 7,
                            height: 7,
                            background: i === velaIdx ? "#f97316" : "rgba(255,255,255,0.2)",
                            display: "inline-block",
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div className="mt-8">
                    <Link
                      href="/velas"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                      style={{ background: "rgba(255,255,255,0.10)", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      Encender una velita →
                    </Link>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>

        {/* RIGHT PANEL — foto fija */}
        <div
          className="hidden lg:flex items-center justify-center py-16 pl-10"
          style={{ background: "transparent" }}
        >
          <div
            className="relative overflow-hidden shadow-2xl"
            style={{
              width: "100%",
              maxWidth: 440,
              aspectRatio: "4/5",
              borderRadius: "2rem",
              boxShadow: "0 40px 80px rgba(0,0,0,0.55)",
            }}
          >
            {persona.fotoPrincipal ? (
              <img
                src={persona.fotoPrincipal}
                alt={persona.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              /* Placeholder elegante cuando no hay foto */
              <div
                className="w-full h-full flex flex-col items-center justify-center"
                style={{
                  background: "linear-gradient(160deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)",
                }}
              >
                <div className="mb-6">
                  <CandleFlame size="lg" />
                </div>
                <p className="font-serif text-white/30 text-sm tracking-[0.3em] uppercase">
                  En tu memoria
                </p>
                <p className="font-serif text-white text-xl mt-2 text-center px-6">
                  {persona.nombre}
                </p>
              </div>
            )}
            {/* Overlay inferior */}
            <div
              className="absolute bottom-0 left-0 right-0 px-6 py-5"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 100%)" }}
            >
              <p className="text-white/80 text-xs tracking-[0.22em] uppercase font-semibold">
                Siempre en nuestros corazones
              </p>
            </div>
          </div>
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

      {/* Hero unificado */}
      {persona && <HeroSection persona={persona} velas={velas} />}

      {/* Sección inferior: carrusel de velitas */}
      {velas.length > 0 && (
        <section className="py-16 px-8 bg-white border-t-4 border-orange-500">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-3xl text-black text-center mb-8">Velitas encendidas</h2>
            <CandlesCarousel velas={velas} />
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
          <Link
            href="/velas"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-orange-200"
          >
            Encender una velita
          </Link>
          <Link
            href="/recuerdos"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-black hover:bg-black/80 text-white font-semibold rounded-xl transition-all duration-200"
          >
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
