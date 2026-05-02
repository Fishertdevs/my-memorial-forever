import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useGetStats, useListVelas, useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";

/* ─── Hero card carousel data ─── */
const HERO_CARDS = [
  {
    href: "/personas",
    label: "Memorial",
    title: "Su historia,\nsu legado",
    subtitle: "Conoce la vida de quien siempre recordaremos",
    cta: "Ver memorial",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80",
    accent: "#F97316",
  },
  {
    href: "/velas",
    label: "Encender Velita",
    title: "Una llama\npor él",
    subtitle: "Enciende una velita y deja un mensaje desde el corazón",
    cta: "Encender velita",
    img: "https://images.unsplash.com/photo-1605106702842-01a887a31122?w=900&q=80",
    accent: "#FBBF24",
  },
  {
    href: "/recuerdos",
    label: "Recuerdos",
    title: "Momentos\neternos",
    subtitle: "Comparte las fotos y recuerdos que lo mantienen vivo",
    cta: "Ver recuerdos",
    img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80",
    accent: "#F97316",
  },
];

/* ─── Hero Carousel ─── */
function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [, navigate] = useLocation();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % HERO_CARDS.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + HERO_CARDS.length) % HERO_CARDS.length), []);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  };

  const goTo = (i: number) => { setCurrent(i); resetTimer(); };

  const card = HERO_CARDS[current];

  return (
    <div className="relative w-full h-[88vh] min-h-[540px] overflow-hidden">
      {/* Background images */}
      {HERO_CARDS.map((c, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={c.img}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.28) saturate(0.8)" }}
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)`,
            }}
          />
          {/* Orange accent glow */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: "40%",
              background: `linear-gradient(to top, ${c.accent}18 0%, transparent 100%)`,
            }}
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center h-full max-w-6xl mx-auto px-6 sm:px-10">
        <div
          key={current}
          className="slide-left max-w-xl"
        >
          <span
            className="inline-block text-xs font-bold tracking-[0.25em] uppercase px-3 py-1.5 rounded-full mb-5"
            style={{ background: `${card.accent}22`, color: card.accent, border: `1px solid ${card.accent}40` }}
          >
            {card.label}
          </span>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-4 whitespace-pre-line">
            {card.title}
          </h1>

          <p className="text-white/60 text-lg sm:text-xl mb-8 leading-relaxed font-light">
            {card.subtitle}
          </p>

          <Link
            href={card.href}
            className="inline-flex items-center gap-2 px-7 py-3.5 font-semibold rounded-xl transition-all duration-200 shadow-lg text-sm"
            style={{ background: card.accent, color: "#0d0d0d", boxShadow: `0 8px 28px ${card.accent}35` }}
          >
            {card.cta}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Nav arrows */}
      <button
        onClick={() => { prev(); resetTimer(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/70 hover:text-orange-400 hover:border-orange-500/40 transition-all"
        aria-label="Anterior"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4l-5 5 5 5" />
        </svg>
      </button>
      <button
        onClick={() => { next(); resetTimer(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white/70 hover:text-orange-400 hover:border-orange-500/40 transition-all"
        aria-label="Siguiente"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 4l5 5-5 5" />
        </svg>
      </button>

      {/* Mini navigation cards at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {HERO_CARDS.map((c, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 text-sm font-medium backdrop-blur-sm"
            style={{
              background: i === current ? `${c.accent}20` : "rgba(0,0,0,0.55)",
              borderColor: i === current ? `${c.accent}70` : "rgba(255,255,255,0.08)",
              color: i === current ? c.accent : "rgba(255,255,255,0.45)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{ background: i === current ? c.accent : "rgba(255,255,255,0.25)" }}
            />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Candles Carousel ─── */
interface Vela {
  id: number;
  nombreRecordado: string;
  nombreAutor: string;
  mensaje: string;
  tiempoTranscurrido: string;
}

function CandlesCarousel({ velas }: { velas: Vela[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const SCROLL_AMT = 340;

  const scroll = (dir: "left" | "right") => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir === "right" ? SCROLL_AMT : -SCROLL_AMT, behavior: "smooth" });
  };

  const onScroll = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanPrev(scrollLeft > 8);
    setCanNext(scrollLeft < scrollWidth - clientWidth - 8);
  };

  useEffect(() => { onScroll(); }, [velas]);

  const FLAME_COLORS = [
    { outer: "#f97316", inner: "#fbbf24", glow: "rgba(249,115,22,0.35)" },
    { outer: "#f59e0b", inner: "#fde68a", glow: "rgba(245,158,11,0.35)" },
    { outer: "#ef4444", inner: "#fca5a5", glow: "rgba(239,68,68,0.30)" },
    { outer: "#f97316", inner: "#fed7aa", glow: "rgba(249,115,22,0.30)" },
  ];

  return (
    <div className="relative">
      {/* Prev arrow */}
      {canPrev && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-white/60 hover:text-orange-400 hover:border-orange-500/30 transition-all shadow-xl -translate-x-4"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 3l-5 5 5 5"/></svg>
        </button>
      )}

      {/* Track */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex gap-4 overflow-x-auto no-scrollbar pb-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {velas.map((vela, i) => {
          const fc = FLAME_COLORS[i % FLAME_COLORS.length];
          return (
            <div
              key={vela.id}
              className="flex-shrink-0 w-72 bg-[#141414] border border-white/6 rounded-2xl p-5 hover:border-orange-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/10"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-0.5">
                  <CandleFlame size="sm" outerColor={fc.outer} innerColor={fc.inner} glowColor={fc.glow} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-orange-400 mb-1.5 truncate">
                    Por {vela.nombreRecordado}
                  </p>
                  <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-3">
                    {vela.mensaje}
                  </p>
                  <div className="flex items-center justify-between text-xs text-white/30">
                    <span className="truncate mr-2">{vela.nombreAutor}</span>
                    <span className="flex-shrink-0">{vela.tiempoTranscurrido}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next arrow */}
      {canNext && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center text-white/60 hover:text-orange-400 hover:border-orange-500/30 transition-all shadow-xl translate-x-4"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3l5 5-5 5"/></svg>
        </button>
      )}

      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: velasData } = useListVelas({ limit: 30 });
  const { data: personas } = useListPersonas();
  const persona = personas?.[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero carousel — full screen */}
      <div className="pt-16">
        <HeroCarousel />
      </div>

      {/* Persona spotlight */}
      {persona && (
        <section className="py-16 px-4 border-b border-white/5">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="relative">
                <div
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center font-serif text-5xl text-orange-400 border-2 border-orange-500/30"
                  style={{ background: "radial-gradient(circle at 35% 35%, #1a1a1a, #0d0d0d)" }}
                >
                  {persona.fotoPrincipal
                    ? <img src={persona.fotoPrincipal} alt={persona.nombre} className="w-full h-full rounded-full object-cover" />
                    : persona.nombre.charAt(0)
                  }
                </div>
                <div className="absolute -bottom-2 -right-2">
                  <CandleFlame size="sm" />
                </div>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-orange-400 tracking-widest uppercase mb-2 font-medium">En su memoria</p>
              <h2 className="font-serif text-3xl sm:text-4xl text-white mb-2">{persona.nombre}</h2>
              {persona.fechaNacimiento && persona.fechaFallecimiento && (
                <p className="text-white/40 text-sm tracking-wide mb-3">
                  {persona.fechaNacimiento} — {persona.fechaFallecimiento}
                </p>
              )}
              {persona.biografia && (
                <p className="text-white/55 leading-relaxed text-sm max-w-lg line-clamp-3">{persona.biografia}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Stats bar */}
      <section className="py-12 px-4 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Velitas encendidas",     value: statsLoading ? "—" : stats?.totalVelas ?? 0 },
            { label: "Recuerdos compartidos",  value: statsLoading ? "—" : stats?.totalRecuerdos ?? 0 },
            { label: "Velitas hoy",            value: statsLoading ? "—" : stats?.velasHoy ?? 0 },
            { label: "Con amor eterno",        value: "∞" },
          ].map((s, i) => (
            <div key={i} className="fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="font-serif text-4xl font-bold text-orange-400 mb-1">{s.value}</div>
              <div className="text-xs text-white/35 font-light tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Candles carousel */}
      {velasData && velasData.data.length > 0 && (
        <section className="py-16 px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs text-orange-400 tracking-widest uppercase mb-2 font-medium">Llamas de amor</p>
                <h2 className="font-serif text-3xl text-white">Velitas encendidas</h2>
              </div>
              <Link href="/velas" className="text-sm text-white/40 hover:text-orange-400 transition-colors pb-1">
                Ver todas →
              </Link>
            </div>
            <CandlesCarousel velas={velasData.data} />
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 px-4 text-center border-t border-white/5">
        <CandleFlame size="lg" className="mx-auto mb-6" />
        <h2 className="font-serif text-4xl text-white mb-3">Siempre en nuestro corazón</h2>
        <p className="text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
          Cada recuerdo compartido es una forma de mantener viva su luz.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/velas"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-900/30"
          >
            Encender una velita
          </Link>
          <Link
            href="/recuerdos"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-white/10 text-white/70 hover:text-white hover:border-white/20 font-medium rounded-xl transition-all duration-200"
          >
            Ver recuerdos
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/candle-logo.png" alt="" className="h-6 w-auto opacity-40" />
        </div>
        <p className="text-white/25 text-sm font-light">
          En Tu Memoria — Siempre estarás en nuestros corazones
        </p>
      </footer>
    </div>
  );
}
