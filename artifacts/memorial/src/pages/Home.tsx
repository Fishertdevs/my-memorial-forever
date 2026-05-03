import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useListVelas, useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";

/* ─────── Helpers ─────── */
function formatDateEs(raw?: string): string {
  if (!raw) return "";
  try {
    const [y, m, d] = raw.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return raw;
  }
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

/* ─────── VelaCard (sección inferior) ─────── */
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

/* ─────── Carrusel inferior ─────── */
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

/* ─────────────────────────────────────────────────
   HERO UNIFICADO
   Izquierda: rota entre "En su memoria" y "Velitas"
   Derecha:   tarjeta con foto fija + vela animada
───────────────────────────────────────────────── */
type HeroSlide = "memorial" | "velitas";

function HeroSection({
  persona,
  velas,
}: {
  persona: {
    id: number;
    nombre: string;
    fechaNacimiento?: string;
    fechaFallecimiento?: string;
    biografia?: string;
    fotoPrincipal?: string;
  };
  velas: Vela[];
}) {
  const [slide, setSlide] = useState<HeroSlide>("memorial");
  const [visible, setVisible] = useState(true);
  const [velaIdx, setVelaIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const slideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const velaTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const SLIDE_DURATION = 9000; // ms

  /* Fade-switch helper */
  const switchTo = useCallback((next: HeroSlide) => {
    setVisible(false);
    setTimeout(() => { setSlide(next); setVisible(true); }, 380);
  }, []);

  /* Progress bar reset */
  const startProgress = useCallback(() => {
    setProgress(0);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    const step = 100;
    let elapsed = 0;
    progressTimerRef.current = setInterval(() => {
      elapsed += step;
      setProgress(Math.min((elapsed / SLIDE_DURATION) * 100, 100));
      if (elapsed >= SLIDE_DURATION && progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    }, step);
  }, []);

  /* Auto-advance slides every 9 s */
  const startSlideTimer = useCallback((current: HeroSlide) => {
    if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    startProgress();
    slideTimerRef.current = setInterval(() => {
      switchTo(current === "memorial" ? "velitas" : "memorial");
    }, SLIDE_DURATION);
  }, [switchTo, startProgress]);

  useEffect(() => {
    startSlideTimer(slide);
    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [slide, startSlideTimer]);

  /* Auto-rotate velitas every 7 s */
  useEffect(() => {
    if (!velas.length) return;
    if (velaTimerRef.current) clearInterval(velaTimerRef.current);
    velaTimerRef.current = setInterval(() => setVelaIdx((i) => (i + 1) % velas.length), 7000);
    return () => { if (velaTimerRef.current) clearInterval(velaTimerRef.current); };
  }, [velas.length]);

  const handleTab = (s: HeroSlide) => {
    if (s !== slide) { switchTo(s); startSlideTimer(s); }
  };

  const isMemorial = slide === "memorial";
  const vela = velas[velaIdx] ?? null;
  const fc = FLAME_COLORS[velaIdx % FLAME_COLORS.length];

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      {/* ── Split background ── */}
      <div className="absolute inset-0 flex pointer-events-none" aria-hidden>
        <div
          className="transition-colors duration-700"
          style={{ width: "55%", background: isMemorial ? "#f7f7f7" : "#0d0d0d" }}
        />
        <div style={{ width: "45%", background: "#0d0d0d" }} />
      </div>

      {/* ── Main content ── */}
      <div
        className="relative max-w-7xl mx-auto h-full flex"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >

        {/* ══ LEFT: rotating text ══ */}
        <div
          className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-20"
          style={{ width: "55%" }}
        >
          {/* Pill tabs */}
          <div className="flex flex-wrap gap-2.5 mb-5">
            {(["memorial", "velitas"] as HeroSlide[]).map((s) => {
              const active = slide === s;
              return (
                <button
                  key={s}
                  onClick={() => handleTab(s)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300"
                  style={
                    active
                      ? { background: "#f97316", color: "#fff", border: "1.5px solid #f97316" }
                      : isMemorial
                        ? { background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.35)", border: "1.5px solid rgba(0,0,0,0.10)" }
                        : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)", border: "1.5px solid rgba(255,255,255,0.14)" }
                  }
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: active ? "#fff" : isMemorial ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.3)" }}
                  />
                  {s === "memorial" ? "En su memoria" : "Velitas encendidas"}
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div
            className="rounded-full mb-10 overflow-hidden"
            style={{
              height: 3,
              width: 120,
              background: isMemorial ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.12)",
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "#f97316",
                transition: "width 0.1s linear",
              }}
            />
          </div>

          {/* Animated content area */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.38s ease, transform 0.38s ease",
              maxWidth: 540,
            }}
          >
            {isMemorial ? (
              /* ── Slide: En su memoria ── */
              <>
                <p className="text-xs tracking-[0.3em] uppercase font-bold mb-5" style={{ color: "#f97316" }}>
                  En tu memoria
                </p>
                <h1
                  className="font-serif leading-[0.9] mb-5"
                  style={{ fontSize: "clamp(3rem, 5vw, 5.5rem)", color: "#0d0d0d" }}
                >
                  {persona.nombre}
                </h1>
                {(persona.fechaNacimiento || persona.fechaFallecimiento) && (
                  <p className="text-sm tracking-wide mb-5" style={{ color: "rgba(0,0,0,0.38)" }}>
                    {formatDateEs(persona.fechaNacimiento)}
                    {persona.fechaNacimiento && persona.fechaFallecimiento && " — "}
                    {formatDateEs(persona.fechaFallecimiento)}
                  </p>
                )}
                {persona.biografia && (
                  <p className="text-[1.0625rem] leading-[1.7] mb-9 line-clamp-4" style={{ color: "rgba(0,0,0,0.52)" }}>
                    {persona.biografia}
                  </p>
                )}
                {/* Accent line — like example */}
                <div className="w-10 h-0.5 rounded-full mb-8" style={{ background: "#f97316" }} />
                <Link
                  href={`/personas/${persona.id}`}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 shadow-lg"
                  style={{ background: "#f97316", boxShadow: "0 8px 24px rgba(249,115,22,0.28)" }}
                >
                  Recuérdalo aquí
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                </Link>
              </>
            ) : vela ? (
              /* ── Slide: Velitas encendidas ── */
              <>
                <p className="text-xs tracking-[0.3em] uppercase font-bold mb-5" style={{ color: "#f97316" }}>
                  Velitas encendidas
                </p>
                <div className="flex items-start gap-5 mb-7">
                  <div className="flex-shrink-0 mt-1">
                    <CandleFlame size="md" outerColor={fc.outer} innerColor={fc.inner} glowColor={fc.glow} />
                  </div>
                  <div>
                    <p className="text-xs font-bold mb-3" style={{ color: "#f97316" }}>
                      Por {vela.nombreRecordado}
                    </p>
                    <p
                      className="font-serif leading-snug mb-4"
                      style={{ fontSize: "clamp(1.55rem, 3vw, 2.5rem)", color: "#f7f7f7", lineHeight: 1.2 }}
                    >
                      "{vela.mensaje}"
                    </p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
                      — {vela.nombreAutor} · {vela.tiempoTranscurrido}
                    </p>
                  </div>
                </div>

                {/* Accent line */}
                <div className="w-10 h-0.5 rounded-full mb-6" style={{ background: "#f97316" }} />

                {/* Velitas dots */}
                {velas.length > 1 && (
                  <div className="flex gap-2 mb-8">
                    {velas.map((_, i) => (
                      <span
                        key={i}
                        className="rounded-full transition-all duration-300 inline-block"
                        style={{
                          width: i === velaIdx ? 20 : 7,
                          height: 7,
                          background: i === velaIdx ? "#f97316" : "rgba(255,255,255,0.20)",
                        }}
                      />
                    ))}
                  </div>
                )}

                <Link
                  href="/velas"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.09)",
                    color: "#fff",
                    border: "1.5px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  Encender una velita
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                </Link>
              </>
            ) : null}
          </div>
        </div>

        {/* ══ RIGHT: static photo card ══ */}
        <div
          className="hidden lg:flex items-center justify-center py-14 pr-12"
          style={{ width: "45%", background: "#0d0d0d" }}
        >
          {/* Photo card */}
          <div
            className="relative overflow-hidden"
            style={{
              width: "100%",
              maxWidth: 400,
              aspectRatio: "3/4",
              borderRadius: "2rem",
              boxShadow: "0 32px 72px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
            }}
          >
            {persona.fotoPrincipal ? (
              <img
                src={persona.fotoPrincipal}
                alt={persona.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              /* Tarjeta memorial elegante cuando no hay foto */
              <div
                className="w-full h-full flex flex-col items-center justify-center relative"
                style={{
                  background: "linear-gradient(155deg, #1c1c2e 0%, #16213e 55%, #0f3460 100%)",
                }}
              >
                {/* Glow behind candle */}
                <div
                  className="absolute"
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 70%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -60%)",
                  }}
                />
                <div className="mb-6 relative z-10">
                  <CandleFlame size="lg" />
                </div>
                <p className="font-serif text-white/25 text-xs tracking-[0.35em] uppercase mb-3 relative z-10">
                  En tu memoria
                </p>
                <p className="font-serif text-white text-2xl text-center px-8 leading-snug relative z-10">
                  {persona.nombre}
                </p>
                {(persona.fechaNacimiento || persona.fechaFallecimiento) && (
                  <p className="text-white/30 text-xs mt-3 tracking-widest relative z-10">
                    {formatDateEs(persona.fechaNacimiento)}
                    {persona.fechaNacimiento && persona.fechaFallecimiento && " – "}
                    {formatDateEs(persona.fechaFallecimiento)}
                  </p>
                )}
              </div>
            )}

            {/* Bottom gradient overlay */}
            <div
              className="absolute bottom-0 left-0 right-0"
              style={{
                height: "40%",
                background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
              }}
            />

            {/* Bottom label */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <span
                className="text-[10px] tracking-[0.28em] uppercase font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.80)", backdropFilter: "blur(6px)" }}
              >
                Siempre en nuestros corazones
              </span>
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

      {/* Carrusel de velitas */}
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
