import { Link } from "wouter";
import { useGetStats, useListVelas, useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: velasData } = useListVelas({ limit: 6 });
  const { data: personas } = useListPersonas();
  const persona = personas?.[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(249,115,22,0.07) 0%, transparent 65%)" }}
        />

        {/* Floating accent candles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { top: "12%", left: "7%",  op: 0.25, delay: "0s" },
            { top: "22%", left: "87%", op: 0.22, delay: "1s" },
            { top: "68%", left: "5%",  op: 0.18, delay: "1.6s" },
            { top: "72%", left: "91%", op: 0.25, delay: "0.5s" },
            { top: "44%", left: "93%", op: 0.15, delay: "2.2s" },
          ].map((c, i) => (
            <div key={i} className="absolute" style={{ top: c.top, left: c.left, opacity: c.op, animationDelay: c.delay }}>
              <CandleFlame size="sm" />
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-3xl mx-auto fade-in-up">
          <div className="flex justify-center mb-6">
            <CandleFlame size="lg" />
          </div>

          <p className="text-orange-400/70 text-xs font-medium tracking-[0.22em] uppercase mb-5">
            Un espacio sagrado de memoria
          </p>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-3 text-[#f5e0c0]">
            En Tu
          </h1>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-8 text-orange-400">
            Memoria
          </h1>

          {persona && (
            <p className="text-slate-400 text-base sm:text-lg mb-4 font-light">
              Honrando la vida de{" "}
              <span className="text-orange-300 font-medium">{persona.nombre}</span>
            </p>
          )}

          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed font-light">
            Un lugar donde el amor permanece, los recuerdos viven y la llama de tu ser querido nunca se apaga.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/velas"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-400 text-[#0f1012] font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
            >
              Encender una velita
            </Link>
            <Link
              href="/personas"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-orange-800/40 text-orange-300/80 hover:text-orange-300 hover:bg-orange-950/30 font-medium rounded-xl transition-all duration-200"
            >
              Ver el memorial
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 soft-pulse text-orange-500/40">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-4 border-y border-[#272b31]/60 bg-[#141517]/60">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Velitas encendidas",    value: statsLoading ? "—" : stats?.totalVelas ?? 0 },
            { label: "Recuerdos compartidos", value: statsLoading ? "—" : stats?.totalRecuerdos ?? 0 },
            { label: "Velitas hoy",           value: statsLoading ? "—" : stats?.velasHoy ?? 0 },
            { label: "Familias que recuerdan", value: statsLoading ? "—" : (stats?.totalVelas ?? 0) > 0 ? "∞" : 0 },
          ].map((s, i) => (
            <div key={i} className="fade-in-up" style={{ animationDelay: `${i * 0.09}s` }}>
              <div className="font-serif text-4xl font-bold text-orange-400 mb-2">{s.value}</div>
              <div className="text-xs text-slate-500 font-light tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent candles ── */}
      {velasData && velasData.data.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-3xl text-[#f5e0c0]">Velitas encendidas</h2>
              <Link href="/velas" className="text-sm text-orange-400 hover:text-orange-300 transition-colors">
                Ver todas →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {velasData.data.slice(0, 6).map((vela, i) => (
                <div
                  key={vela.id}
                  className="bg-card border border-[#272b31] rounded-xl p-5 hover:border-orange-900/50 transition-all duration-300 fade-in-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 pt-1">
                      <CandleFlame size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-orange-400/80 mb-1 truncate">
                        Por {vela.nombreRecordado}
                      </p>
                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-3">
                        {vela.mensaje}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{vela.nombreAutor}</span>
                        <span>{vela.tiempoTranscurrido}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-20 px-4 text-center border-t border-[#272b31]/50">
        <div className="max-w-xl mx-auto">
          <CandleFlame size="md" className="mx-auto mb-6" />
          <h2 className="font-serif text-4xl text-[#f5e0c0] mb-4">Comparte un recuerdo</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Cada historia merece ser contada. Cada recuerdo, guardado. Cada amor, eterno.
          </p>
          <Link
            href="/recuerdos"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-orange-800/40 text-orange-300 hover:bg-orange-950/30 font-medium rounded-xl transition-all duration-200"
          >
            Ver la galería de recuerdos
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#272b31]/40 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/candle-logo.png" alt="" className="h-6 w-auto opacity-60" />
        </div>
        <p className="text-slate-600 text-sm font-light">
          En Tu Memoria — Siempre estarás en nuestros corazones
        </p>
      </footer>
    </div>
  );
}
