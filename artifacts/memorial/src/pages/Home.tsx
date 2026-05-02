import { Link } from "wouter";
import { useGetStats, useListVelas, useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: velasData } = useListVelas({ limit: 6 });
  const { data: personas } = useListPersonas();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 30% 40%, hsl(35,75%,55%) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, hsl(340,35%,35%) 0%, transparent 60%)",
          }}
        />

        {/* Floating candles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { top: "15%", left: "8%", delay: "0s", opacity: 0.4 },
            { top: "25%", left: "88%", delay: "0.8s", opacity: 0.35 },
            { top: "65%", left: "5%", delay: "1.4s", opacity: 0.3 },
            { top: "70%", left: "92%", delay: "0.4s", opacity: 0.4 },
            { top: "45%", left: "94%", delay: "2s", opacity: 0.25 },
          ].map((c, i) => (
            <div key={i} className="absolute" style={{ top: c.top, left: c.left, opacity: c.opacity, animationDelay: c.delay }}>
              <CandleFlame size="sm" />
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-3xl mx-auto fade-in-up">
          <div className="flex justify-center mb-6">
            <CandleFlame size="lg" />
          </div>
          <p className="text-amber-400/80 text-sm font-medium tracking-widest uppercase mb-4">
            Un espacio sagrado de memoria
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-amber-100 leading-tight mb-6">
            En Tu
            <span className="block text-amber-400">Memoria</span>
          </h1>
          <p className="text-amber-200/70 text-lg sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light">
            Un lugar donde el amor permanece, los recuerdos viven y las llamas de nuestros seres queridos nunca se apagan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/velas"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-md transition-all duration-200 shadow-lg hover:shadow-amber-500/30"
              data-testid="button-encender-vela"
            >
              Encender una velita
            </Link>
            <Link
              href="/personas"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-amber-500/40 text-amber-200 hover:bg-amber-900/30 font-medium rounded-md transition-all duration-200"
              data-testid="button-ver-memorial"
            >
              Ver el memorial
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 soft-pulse text-amber-400/50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-y border-amber-900/20 bg-card/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Personas recordadas", value: statsLoading ? "..." : stats?.totalPersonas ?? 0 },
            { label: "Velitas encendidas", value: statsLoading ? "..." : stats?.totalVelas ?? 0 },
            { label: "Recuerdos compartidos", value: statsLoading ? "..." : stats?.totalRecuerdos ?? 0 },
            { label: "Velitas hoy", value: statsLoading ? "..." : stats?.velasHoy ?? 0 },
          ].map((s, i) => (
            <div key={i} className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="font-serif text-4xl font-bold text-amber-400 mb-2">{s.value}</div>
              <div className="text-sm text-amber-200/60 font-light">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Memorial profiles preview */}
      {personas && personas.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-3xl text-amber-100">En su memoria</h2>
              <Link href="/personas" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.slice(0, 3).map((persona, i) => (
                <Link key={persona.id} href={`/personas/${persona.id}`} className="group block">
                  <div
                    className="bg-card border border-amber-900/30 rounded-xl overflow-hidden hover:border-amber-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20 fade-in-up"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    <div className="relative h-48 bg-gradient-to-b from-amber-900/30 to-stone-900/60 flex items-center justify-center">
                      {persona.fotoPrincipal ? (
                        <img src={persona.fotoPrincipal} alt={persona.nombre} className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-amber-800/30 border-2 border-amber-700/30 flex items-center justify-center font-serif text-3xl text-amber-300">
                          {persona.nombre.charAt(0)}
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3">
                        <CandleFlame size="sm" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg text-amber-100 mb-1 group-hover:text-amber-200 transition-colors">{persona.nombre}</h3>
                      {persona.fechaNacimiento && persona.fechaFallecimiento && (
                        <p className="text-amber-400/60 text-xs mb-2 tracking-wide">{persona.fechaNacimiento} — {persona.fechaFallecimiento}</p>
                      )}
                      <div className="flex gap-4 text-xs text-amber-200/40 pt-3 border-t border-amber-900/20">
                        <span>{persona.totalVelas} velitas</span>
                        <span>·</span>
                        <span>{persona.totalRecuerdos} recuerdos</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent candles */}
      {velasData && velasData.data.length > 0 && (
        <section className="py-16 px-4 bg-card/30">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-3xl text-amber-100">Velitas recientes</h2>
              <Link href="/velas" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                Ver todas
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {velasData.data.slice(0, 6).map((vela, i) => (
                <div
                  key={vela.id}
                  className="bg-card border border-amber-900/30 rounded-lg p-5 hover:border-amber-700/40 transition-colors fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <CandleFlame size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm font-semibold text-amber-300 mb-1 truncate">Por {vela.nombreRecordado}</p>
                      <p className="text-amber-200/80 text-sm leading-relaxed line-clamp-3 mb-3">{vela.mensaje}</p>
                      <div className="flex items-center justify-between text-xs text-amber-200/40">
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

      {/* CTA */}
      <section className="py-20 px-4 text-center border-t border-amber-900/20">
        <div className="max-w-2xl mx-auto">
          <CandleFlame size="md" className="mx-auto mb-6" />
          <h2 className="font-serif text-4xl text-amber-100 mb-4">Comparte un recuerdo</h2>
          <p className="text-amber-200/60 mb-8 leading-relaxed">
            Cada historia merece ser contada. Cada recuerdo, guardado. Cada amor, recordado.
          </p>
          <Link
            href="/recuerdos"
            className="inline-flex items-center justify-center px-8 py-3 bg-amber-800/50 hover:bg-amber-700/60 border border-amber-700/40 text-amber-200 font-medium rounded-md transition-all duration-200"
            data-testid="button-ver-recuerdos"
          >
            Ver la galería de recuerdos
          </Link>
        </div>
      </section>

      <footer className="border-t border-amber-900/20 py-8 px-4 text-center">
        <p className="text-amber-200/30 text-sm font-light">En Tu Memoria — Con amor eterno, guardamos su recuerdo</p>
      </footer>
    </div>
  );
}
