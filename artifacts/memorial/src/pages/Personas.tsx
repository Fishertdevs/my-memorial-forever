import { Link } from "wouter";
import { useListPersonas } from "@workspace/api-client-react";
import Navbar from "@/components/Navbar";
import CandleFlame from "@/components/CandleFlame";
import { Skeleton } from "@/components/ui/skeleton";

export default function Personas() {
  const { data: personas, isLoading } = useListPersonas();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <p className="text-amber-400/70 text-xs font-medium tracking-widest uppercase mb-3">Nuestros seres queridos</p>
            <h1 className="font-serif text-5xl text-amber-100 mb-4">En Memoria</h1>
            <p className="text-amber-200/60 max-w-md mx-auto leading-relaxed">
              Cada vida es una historia que merece ser recordada. Aqui honramos a quienes amamos.
            </p>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-amber-900/30 rounded-xl p-6 space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg bg-amber-900/20" />
                  <Skeleton className="h-5 w-3/4 bg-amber-900/20" />
                  <Skeleton className="h-4 w-1/2 bg-amber-900/20" />
                  <Skeleton className="h-16 w-full bg-amber-900/20" />
                </div>
              ))}
            </div>
          ) : personas && personas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {personas.map((persona, i) => (
                <Link
                  key={persona.id}
                  href={`/personas/${persona.id}`}
                  className="group block"
                  data-testid={`card-persona-${persona.id}`}
                >
                  <div
                    className="bg-card border border-amber-900/30 rounded-xl overflow-hidden hover:border-amber-600/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/20 fade-in-up"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    {/* Photo area */}
                    <div className="relative h-52 bg-gradient-to-b from-amber-900/30 to-stone-900/60 flex items-center justify-center overflow-hidden">
                      {persona.fotoPrincipal ? (
                        <img
                          src={persona.fotoPrincipal}
                          alt={persona.nombre}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-24 h-24 rounded-full bg-amber-800/30 border-2 border-amber-700/30 flex items-center justify-center font-serif text-4xl text-amber-300">
                            {persona.nombre.charAt(0)}
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3">
                        <CandleFlame size="sm" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h2 className="font-serif text-xl text-amber-100 mb-1 group-hover:text-amber-200 transition-colors">
                        {persona.nombre}
                      </h2>
                      {persona.fechaNacimiento && persona.fechaFallecimiento && (
                        <p className="text-amber-400/60 text-xs mb-3 tracking-wide">
                          {persona.fechaNacimiento} — {persona.fechaFallecimiento}
                        </p>
                      )}
                      {persona.biografia && (
                        <p className="text-amber-200/60 text-sm leading-relaxed line-clamp-3 mb-4">
                          {persona.biografia}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-amber-200/40 pt-3 border-t border-amber-900/20">
                        <span>{persona.totalVelas} velas encendidas</span>
                        <span>·</span>
                        <span>{persona.totalRecuerdos} recuerdos</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <CandleFlame size="lg" className="mx-auto mb-6 opacity-50" />
              <p className="text-amber-200/50 text-lg">Aun no hay perfiles en el memorial.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
