import { Link } from "wouter";
import { useListPersonas } from "@workspace/api-client-react";
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

export default function Personas() {
  const { data: personas, isLoading } = useListPersonas();

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#f97316" }}>
              Nuestros seres queridos
            </p>
            <h1 className="font-serif text-5xl text-black mb-4">En Memoria</h1>
            <p className="text-black/50 max-w-md mx-auto leading-relaxed">
              Cada vida es una historia que merece ser recordada. Aquí honramos a quienes amamos.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <Skeleton className="h-52 w-full bg-gray-100" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-5 w-3/4 bg-gray-100" />
                    <Skeleton className="h-4 w-1/2 bg-gray-100" />
                    <Skeleton className="h-14 w-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : personas && personas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {personas.map((persona, i) => (
                <Link key={persona.id} href={`/personas/${persona.id}`} className="group block">
                  <div
                    className="border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50 transition-all duration-300 fade-in-up"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {/* Photo */}
                    <div className="relative h-56 bg-gray-50 flex items-center justify-center overflow-hidden">
                      {persona.fotoPrincipal ? (
                        <img
                          src={persona.fotoPrincipal}
                          alt={persona.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(155deg, #1c1c2e 0%, #16213e 55%, #0f3460 100%)" }}
                        >
                          <span className="font-serif text-4xl text-orange-300/80">
                            {persona.nombre.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 right-3">
                        <CandleFlame size="sm" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6 bg-white">
                      <h2 className="font-serif text-xl text-black mb-1 group-hover:text-orange-500 transition-colors">
                        {persona.nombre}
                      </h2>
                      {(persona.fechaNacimiento || persona.fechaFallecimiento) && (
                        <p className="text-xs mb-3 tracking-wide font-medium" style={{ color: "#f97316" }}>
                          {formatDateEs(persona.fechaNacimiento)}
                          {persona.fechaNacimiento && persona.fechaFallecimiento && " — "}
                          {formatDateEs(persona.fechaFallecimiento)}
                        </p>
                      )}
                      {persona.biografia && (
                        <p className="text-black/50 text-sm leading-relaxed line-clamp-3 mb-4">
                          {persona.biografia}
                        </p>
                      )}
                      <div className="flex gap-4 text-xs text-black/35 pt-3 border-t border-gray-100">
                        <span className="flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 14c0 4-7 8-7 8S3 18 3 14a7 7 0 0114 0z"/><circle cx="10" cy="14" r="3"/></svg>
                          {persona.totalVelas ?? 0} velitas
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                          {persona.totalRecuerdos ?? 0} recuerdos
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <CandleFlame size="lg" className="mx-auto mb-6 opacity-40" />
              <p className="text-black/40 text-lg">Aún no hay perfiles en el memorial.</p>
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
